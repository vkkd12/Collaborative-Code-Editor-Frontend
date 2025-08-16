"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "../../../lib/axios.js";

export default function ProjectFilesPage() {
    const { projectId } = useParams();
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const res = await api.get(`/projects/${projectId}/files`);
                if (res.data.success) {
                    setFiles(res.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch files", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFiles();
    }, [projectId]);

    const handleOpenFile = (fileId) => {
        router.push(`/editor/${projectId}/${fileId}`);
    };

    const handleCreateFile = () => {
        router.push(`/editor/${projectId}/new`);
    };

    const handleBack = () => {
        router.push('/');
    };

    return (
        <div className="p-6">
            <button
                onClick={handleBack}
                style={{ marginBottom: '1rem', padding: '0.5rem 1rem', background: '#e5e7eb', color: '#111827', borderRadius: '4px', border: 'none' }}
            >
                ← Back to Projects
            </button>
            <h2 className="text-xl font-bold mb-2">Files in Project</h2>
            <div className="text-gray-500 text-sm mb-4">Project ID: <span className="font-mono">{projectId}</span></div>
            <button
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mb-4"
                onClick={handleCreateFile}
            >
                + New File
            </button>
            {loading ? (
                <p>Loading files...</p>
            ) : files.length === 0 ? (
                <p>No files found. Create one above!</p>
            ) : (
                <ul className="space-y-3">
                    {files.map((file) => (
                        <li
                            key={file._id}
                            className="p-3 bg-white rounded shadow hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleOpenFile(file._id)}
                        >
                            {file.path}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
