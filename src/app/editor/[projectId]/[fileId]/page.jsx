'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import CodeEditor from '../../../../components/CodeEditor.jsx';
import api from '../../../../lib/axios.js';
import useSocket from '../../../../hooks/useSocket.js';
import useStore from '../../../../store/useStore.js';
import '../../../../styles/editor.css';
import Header from '../../../../components/Header.jsx';
import Sidebar from '../../../../components/Sidebar.jsx';

export default function EditorPage() {
  const { projectId, fileId } = useParams();
  const [fileContent, setFileContent] = useState('');
  const [loading, setLoading] = useState(true);
  const setCurrentFile = useStore((state) => state.setCurrentFile);

  // Initialize WebSocket connection for this file
  useSocket(fileId);

  useEffect(() => {
    if (fileId === 'new') {
      setFileContent('');
      setLoading(false);
      return;
    }
    const fetchFile = async () => {
      try {
        const res = await api.get(`/projects/${projectId}/files/${fileId}`);
        if (res.data.success) {
          setFileContent(res.data.data.content);
          setCurrentFile(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch file', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFile();
  }, [projectId, fileId, setCurrentFile]);

  if (loading) return <p className="p-6">Loading editor...</p>;

  const handleBack = () => {
    window.location.href = `/projects/${projectId}`;
  };

  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col">
        <button
          onClick={handleBack}
          style={{ margin: '1rem', padding: '0.5rem 1rem', background: '#e5e7eb', color: '#111827', borderRadius: '4px', border: 'none', alignSelf: 'flex-start' }}
        >
          ← Back to Files
        </button>
        <CodeEditor fileId={fileId} initialContent={fileContent} projectId={projectId} />
      </div>
    </div>
  );
}