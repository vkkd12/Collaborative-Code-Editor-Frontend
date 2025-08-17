import React, { useState, useEffect } from "react";
import api from "../lib/axios";

function renderTree(nodes, onSelect, onCreateFile, onCreateFolder, expandedFolders, setExpandedFolders, showDelete, onDelete) {
    return (
        <ul className="pl-2">
            {nodes.map((node) => (
                <li key={node._id}>
                    <div
                        className={`flex items-center group hover:bg-gray-200 rounded px-1 py-0.5 ${node.type === 'file' ? 'cursor-pointer' : ''}`}
                    >
                        {node.type === 'folder' ? (
                            <span
                                className="flex items-center font-bold cursor-pointer select-none"
                                onClick={() => setExpandedFolders(prev => ({ ...prev, [node._id]: !prev[node._id] }))}
                            >
                                <span className="mr-1">{expandedFolders[node._id] ? '▼' : '▶'}</span>
                                <span className="mr-1">📁</span>
                                {node.name}
                            </span>
                        ) : (
                            <span
                                className="flex items-center cursor-pointer select-none"
                                onClick={() => onSelect(node)}
                            >
                                <span className="mr-1">📄</span>
                                {node.name}
                            </span>
                        )}
                        {showDelete && (
                            <button className="ml-2 text-xs text-red-500 hover:underline" title="Delete" onClick={() => onDelete(node._id)}>
                                🗑️
                            </button>
                        )}
                        {node.type === 'folder' && (
                            <span className="ml-auto flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="text-xs bg-green-200 px-1 rounded flex items-center" title="New File" onClick={() => onCreateFile(node._id)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16"><rect x="3" y="2" width="10" height="12" rx="2" stroke="#222" strokeWidth="1.5" /><path d="M8 6v4M6 8h4" stroke="#222" strokeWidth="1.5" strokeLinecap="round" /></svg>
                                </button>
                                <button className="text-xs bg-blue-200 px-1 rounded flex items-center" title="New Folder" onClick={() => onCreateFolder(node._id)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16"><rect x="2" y="5" width="12" height="7" rx="2" stroke="#222" strokeWidth="1.5" /><path d="M8 8v2M7 9h2" stroke="#222" strokeWidth="1.5" strokeLinecap="round" /><path d="M2 7V5a2 2 0 0 1 2-2h2l1 2h7" stroke="#222" strokeWidth="1.5" strokeLinecap="round" /></svg>
                                </button>
                            </span>
                        )}
                    </div>
                    {node.type === 'folder' && expandedFolders[node._id] && node.children && node.children.length > 0 && (
                        renderTree(node.children, onSelect, onCreateFile, onCreateFolder, expandedFolders, setExpandedFolders, showDelete, onDelete)
                    )}
                </li>
            ))}
        </ul>
    );
}

export default function FileFolderTree({ projectId, onSelectFile, showDelete, onFilesChanged }) {
    const [tree, setTree] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showInput, setShowInput] = useState({ type: null, parent: null });
    const [inputName, setInputName] = useState("");
    const [expandedFolders, setExpandedFolders] = useState({});

    const handleDelete = async (id) => {
        try {
            await api.delete(`/projects/${projectId}/files/${id}`);
            setTree([]);
            setTimeout(async () => {
                const res2 = await api.get(`/projects/${projectId}/files/tree`);
                if (res2.data.success) setTree(res2.data.data);
                // Notify parent that files have changed
                if (onFilesChanged) onFilesChanged();
            }, 200);
        } catch (err) { }
    };

    useEffect(() => {
        const fetchTree = async () => {
            try {
                const res = await api.get(`/projects/${projectId}/files/tree`);
                if (res.data.success) setTree(res.data.data);
            } catch (err) {
                setTree([]);
            } finally {
                setLoading(false);
            }
        };
        fetchTree();
    }, [projectId]);

    const handleCreate = async () => {
        if (!inputName.trim()) return;
        try {
            const res = await api.post(`/projects/${projectId}/files`, {
                name: inputName.trim(),
                type: showInput.type,
                parent: showInput.parent || null
            });
            if (res.data.success) {
                setTree([]); // force reload
                setTimeout(async () => {
                    const res2 = await api.get(`/projects/${projectId}/files/tree`);
                    if (res2.data.success) setTree(res2.data.data);
                    // Notify parent that files have changed
                    if (onFilesChanged) onFilesChanged();
                }, 200);
            }
        } catch (err) { }
        setShowInput({ type: null, parent: null });
        setInputName("");
    };

    const handleCreateFile = (parentId) => {
        setShowInput({ type: "file", parent: parentId });
        setInputName("");
    };
    const handleCreateFolder = (parentId) => {
        setShowInput({ type: "folder", parent: parentId });
        setInputName("");
    };

    if (loading) return <div>Loading file tree...</div>;

    return (
        <div className="bg-white text-gray-900 h-full p-2 border-r" style={{ minWidth: 220 }}>
            <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm tracking-wide">EXPLORER</span>
                <span className="flex gap-1">
                    <button className="text-xs bg-green-700 text-white px-2 py-1 rounded flex items-center" title="New File" onClick={() => handleCreateFile(null)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16"><rect x="3" y="2" width="10" height="12" rx="2" stroke="#222" strokeWidth="1.5" /><path d="M8 6v4M6 8h4" stroke="#222" strokeWidth="1.5" strokeLinecap="round" /></svg>
                    </button>
                    <button className="text-xs bg-blue-700 text-white px-2 py-1 rounded flex items-center" title="New Folder" onClick={() => handleCreateFolder(null)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16"><rect x="2" y="5" width="12" height="7" rx="2" stroke="#222" strokeWidth="1.5" /><path d="M8 8v2M7 9h2" stroke="#222" strokeWidth="1.5" strokeLinecap="round" /><path d="M2 7V5a2 2 0 0 1 2-2h2l1 2h7" stroke="#222" strokeWidth="1.5" strokeLinecap="round" /></svg>
                    </button>
                </span>
            </div>
            {showInput.type && (
                <div className="mb-2 flex gap-2">
                    <input
                        type="text"
                        value={inputName}
                        onChange={e => setInputName(e.target.value)}
                        placeholder={`New ${showInput.type} name`}
                        className="border px-2 py-1 rounded text-black"
                    />
                    <button className="bg-green-500 text-white px-2 py-1 rounded" onClick={handleCreate}>Create</button>
                    <button className="bg-gray-300 px-2 py-1 rounded" onClick={() => setShowInput({ type: null, parent: null })}>Cancel</button>
                </div>
            )}
            {!tree.length ? (
                <div className="text-gray-500 text-sm mt-4">No files or folders. Use the buttons above to create your first file or folder.</div>
            ) : (
                renderTree(
                    tree,
                    (node) => { if (node.type === 'file') onSelectFile(node); },
                    handleCreateFile,
                    handleCreateFolder,
                    expandedFolders,
                    setExpandedFolders,
                    showDelete,
                    handleDelete
                )
            )}
        </div>
    );
}

