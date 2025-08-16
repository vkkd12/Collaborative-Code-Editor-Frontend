'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { initSocket, getSocket } from '../lib/socket.js';
import api from '../lib/axios.js';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export default function CodeEditor({ fileId, initialContent, projectId }) {
  const [content, setContent] = useState(initialContent || '');
  const [saving, setSaving] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    initSocket();
    const socket = getSocket();
    if (!socket) return;

    // Join the file room for collaboration
    socket.emit('collab:join', { roomId: fileId });

    // Request SYNC from other users in the room
    socket.emit('collab:sync:request', { roomId: fileId });

    socket.on('collab:op', ({ op }) => {
      if (op.type === 'insert') {
        setContent((prev) => prev.slice(0, op.index) + (op.text || '') + prev.slice(op.index));
      }
      if (op.type === 'delete') {
        setContent((prev) => prev.slice(0, op.index) + prev.slice(op.index + (op.length || 0)));
      }
    });

    // Handle SYNC event to update content
    socket.on('collab:sync', ({ content: syncContent }) => {
      if (typeof syncContent === 'string') {
        setContent(syncContent);
      }
    });
    return () => {
      socket.emit('collab:leave', { roomId: fileId });
      socket.off('collab:op');
    };
    socket.off('collab:sync');
  }, [fileId]);

  const handleEditorChange = (value, event) => {
    setContent(value);
    const socket = getSocket();
    if (!event || !event.changes) return;
    // Send each change
    event.changes.forEach(change => {
      const op = {
        type: change.text.length > 0 ? 'insert' : 'delete',
        index: change.rangeOffset,
        text: change.text,
        length: change.rangeLength
      };
      socket?.emit('collab:op', { roomId: fileId, op });
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setFeedback('');
    try {
      if (fileId === 'new') {
        if (!newFileName) {
          setFeedback('Please enter a file name.');
          setSaving(false);
          return;
        }
        // Create new file
        await api.post(`/projects/${projectId}/files`, {
          path: newFileName,
          content,
          language: 'javascript',
        });
        setFeedback('File created and saved!');
      } else {
        // Update existing file
        await api.patch(`/projects/${projectId}/files/${fileId}`, { content });
        setFeedback('File saved!');
      }
    } catch (err) {
      setFeedback('Failed to save file');
    } finally {
      setSaving(false);
      setTimeout(() => setFeedback(''), 2000);
    }
  };

  return (
    <div style={{ height: '100%' }}>
      {feedback && (
        <div style={{ marginBottom: '1rem', padding: '0.5rem', background: '#e0f2fe', color: '#2563eb', borderRadius: '4px', textAlign: 'center' }}>
          {feedback}
        </div>
      )}
      {fileId === 'new' && (
        <input
          type="text"
          placeholder="Enter file name (e.g. index.js)"
          value={newFileName}
          onChange={e => setNewFileName(e.target.value)}
          style={{ marginBottom: '1rem', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      )}
      <MonacoEditor
        height="80vh"
        language="javascript"
        theme="vs-dark"
        value={content}
        onChange={handleEditorChange}
      />
      <button
        onClick={handleSave}
        disabled={saving}
        style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#2563eb', color: 'white', borderRadius: '4px', border: 'none' }}
      >
        {saving ? (fileId === 'new' ? 'Creating...' : 'Saving...') : (fileId === 'new' ? 'Create & Save' : 'Save')}
      </button>
    </div>
  );
}