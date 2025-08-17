'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { initSocket, getSocket } from '../lib/socket.js';
import api from '../lib/axios.js';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export default function CodeEditor({ fileId, initialContent, projectId, fileName, filePath }) {
  const [content, setContent] = useState(initialContent || '');
  const [saving, setSaving] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [feedback, setFeedback] = useState('');
  const [autoSaveTimeout, setAutoSaveTimeout] = useState(null);

  useEffect(() => {
    initSocket();
    const socket = getSocket();
    if (!socket) return;

    // Join the file room for collaboration
    socket.emit('collab:join', { roomId: fileId });

    // Request SYNC from other users in the room
    socket.emit('collab:sync:request', { roomId: fileId });

    socket.on('collab:op', ({ op }) => {
      console.log("Received op:", op); // Debug
      if (op.type === 'insert') {
        setContent((prev) => prev.slice(0, op.index) + (op.text || '') + prev.slice(op.index));
      } else if (op.type === 'delete') {
        setContent((prev) => prev.slice(0, op.index) + prev.slice(op.index + (op.length || 0)));
      }
    });

    // Respond to sync requests
    socket.on('collab:sync', ({ content: syncContent }) => {
      if (syncContent !== undefined) {
        setContent(syncContent);
      }
    });

    return () => {
      socket.off('collab:op');
      socket.off('collab:sync');
      socket.emit('collab:leave', { roomId: fileId });
      // Clean up auto-save timeout
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [fileId]);

  const emitDiff = (oldContent, newContent) => {
    if (oldContent === newContent) return;

    const socket = getSocket();
    if (!socket) return;

    let i = 0;
    let j = 0;

    // Find common prefix
    while (i < oldContent.length && i < newContent.length && oldContent[i] === newContent[i]) {
      i++;
    }

    // Find common suffix
    while (j < oldContent.length - i && j < newContent.length - i &&
      oldContent[oldContent.length - 1 - j] === newContent[newContent.length - 1 - j]) {
      j++;
    }

    const deleteStart = i;
    const deleteLength = oldContent.length - i - j;
    const insertText = newContent.substring(i, newContent.length - j);

    if (deleteLength > 0) {
      socket.emit('collab:op', {
        roomId: fileId,
        op: { type: 'delete', index: deleteStart, length: deleteLength }
      });
    }

    if (insertText.length > 0) {
      socket.emit('collab:op', {
        roomId: fileId,
        op: { type: 'insert', index: deleteStart, text: insertText }
      });
    }
  };

  const autoSave = async (contentToSave) => {
    if (fileId === 'new' || !contentToSave) return;

    try {
      setSaving(true);
      await api.patch(`/projects/${projectId}/files/${fileId}`, { content: contentToSave });
      setFeedback('Auto-saved');
      setTimeout(() => setFeedback(''), 2000);
    } catch (err) {
      console.error('Auto-save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleEditorChange = (value) => {
    const oldContent = content;
    setContent(value);
    emitDiff(oldContent, value);

    // Auto-save functionality with debounce
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    const timeout = setTimeout(() => {
      autoSave(value);
    }, 2000); // Auto-save after 2 seconds of inactivity

    setAutoSaveTimeout(timeout);
  };

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#fafafa',
      overflow: 'hidden'
    }}>
      {/* Enhanced Header with file path and status */}
      {(filePath || fileName) && (
        <div style={{
          padding: '12px 16px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background pattern */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="3" cy="3" r="3"/%3E%3C/g%3E%3C/svg%3E")',
            pointerEvents: 'none'
          }} />

          {/* File icon with animation */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '36px',
            height: '36px',
            position: 'relative',
            zIndex: 1
          }}>
            <span style={{ fontSize: '16px' }}>📄</span>
          </div>

          {/* File path with enhanced styling */}
          <div style={{
            flex: 1,
            position: 'relative',
            zIndex: 1
          }}>
            <div style={{
              fontFamily: '"JetBrains Mono", "Fira Code", Monaco, Consolas, monospace',
              fontSize: '14px',
              fontWeight: '600',
              color: '#ffffff',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
              marginBottom: '2px'
            }}>
              {filePath || fileName}
            </div>
            <div style={{
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.8)',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
            }}>
              {content.split('\n').length} lines • {content.length} characters
            </div>
          </div>

          {/* Enhanced status indicator */}
          {(saving || feedback) && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              position: 'relative',
              zIndex: 1,
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              {saving && (
                <>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '2px solid #ffffff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  <span style={{
                    fontSize: '12px',
                    color: '#ffffff',
                    fontWeight: '500',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                  }}>
                    Auto-saving...
                  </span>
                </>
              )}
              {feedback && !saving && (
                <>
                  <span style={{ color: '#10b981', fontSize: '12px' }}>✓</span>
                  <span style={{
                    fontSize: '12px',
                    color: '#ffffff',
                    fontWeight: '500',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                  }}>
                    {feedback}
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Enhanced new file input */}
      {fileId === 'new' && (
        <div style={{
          padding: '16px',
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid #fed7aa'
          }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#92400e',
              marginBottom: '8px'
            }}>
              Create New File
            </label>
            <input
              type="text"
              placeholder="Enter file name (e.g. index.js, components/Button.tsx)"
              value={newFileName}
              onChange={e => setNewFileName(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '2px solid #fed7aa',
                fontSize: '14px',
                fontFamily: '"JetBrains Mono", "Fira Code", Monaco, Consolas, monospace',
                background: '#ffffff',
                color: '#1f2937',
                outline: 'none',
                transition: 'border-color 0.2s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#f59e0b'}
              onBlur={(e) => e.target.style.borderColor = '#fed7aa'}
            />
          </div>
        </div>
      )}

      {/* Enhanced Monaco Editor Container */}
      <div style={{
        flex: 1,
        position: 'relative',
        background: '#1e1e1e',
        borderRadius: fileId === 'new' ? '0' : '0 0 8px 8px',
        overflow: 'hidden',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      }}>
        <MonacoEditor
          height="100%"
          language="javascript"
          theme="vs-dark"
          value={content}
          onChange={handleEditorChange}
          options={{
            fontSize: 14,
            fontFamily: '"JetBrains Mono", "Fira Code", Monaco, Consolas, monospace',
            lineNumbers: 'on',
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            wordWrap: 'on',
            bracketPairColorization: { enabled: true },
            guides: {
              indentation: true,
              bracketPairs: true
            },
            suggest: {
              enabled: true
            },
            quickSuggestions: true,
            parameterHints: { enabled: true },
            folding: true,
            foldingHighlight: true,
            renderLineHighlight: 'gutter',
            cursorBlinking: 'smooth',
            smoothScrolling: true
          }}
        />
      </div>

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        .fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
