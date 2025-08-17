"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "../../../lib/axios.js";
import FileFolderTree from "../../../components/FileFolderTree.jsx";
import CodeEditor from "../../../components/CodeEditor.jsx";
import useAuth from "../../../hooks/useAuth.js";
import { buildFullPath, flattenTree } from "../../../utils/pathUtils.js";

export default function ProjectFilesPage() {
    const { projectId } = useParams();
    const [loading, setLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState(null);
    const [editorContent, setEditorContent] = useState("");
    const [projectOwner, setProjectOwner] = useState(null);
    const [allFiles, setAllFiles] = useState([]);
    const [filePath, setFilePath] = useState("");
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const res = await api.get(`/projects/${projectId}`);
                if (res.data.success) {
                    setProjectOwner(res.data.data.owner?._id);
                }

                // Fetch all files to build path map
                const filesRes = await api.get(`/projects/${projectId}/files`);
                if (filesRes.data.success) {
                    setAllFiles(filesRes.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch project", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [projectId]);

    const handleOpenFile = async (fileId) => {
        try {
            const res = await api.get(`/projects/${projectId}/files/${fileId}`);
            if (res.data.success) {
                const file = res.data.data;
                setSelectedFile(file);
                setEditorContent(file.content || "");

                // Build full path for the selected file
                const fullPath = buildFullPath(file, allFiles);
                setFilePath(fullPath);
            }
        } catch (err) {
            console.error("Failed to fetch file", err);
        }
    };

    const handleFilesChanged = async () => {
        try {
            // Refresh all files when the file structure changes
            const filesRes = await api.get(`/projects/${projectId}/files`);
            if (filesRes.data.success) {
                setAllFiles(filesRes.data.data);

                // Update the path for the currently selected file if any
                if (selectedFile) {
                    const updatedFile = filesRes.data.data.find(f => f._id === selectedFile._id);
                    if (updatedFile) {
                        const fullPath = buildFullPath(updatedFile, filesRes.data.data);
                        setFilePath(fullPath);
                    }
                }
            }
        } catch (err) {
            console.error("Failed to refresh files", err);
        }
    };

    const handleBack = () => {
        router.push('/');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading project...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Enhanced Sidebar */}
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-lg">
                {/* Sidebar Header */}
                <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-indigo-600/20"></div>

                    <button
                        onClick={handleBack}
                        className="relative w-full group flex items-center gap-3 px-4 py-3 bg-white/10 hover:bg-white/20 active:bg-white/25 rounded-xl transition-all duration-300 text-white font-medium backdrop-blur-sm border border-white/20 hover:border-white/30 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                        {/* Button glow effect */}
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/0 via-purple-400/0 to-indigo-400/0 group-hover:from-blue-400/20 group-hover:via-purple-400/20 group-hover:to-indigo-400/20 transition-all duration-300"></div>

                        {/* Arrow icon with animation */}
                        <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-white/20 group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110">
                            <svg
                                className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform duration-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </div>

                        {/* Button text */}
                        <span className="relative text-sm font-semibold tracking-wide">
                            Back to Projects
                        </span>

                        {/* Shimmer effect on hover */}
                        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700"></div>
                    </button>
                </div>

                {/* File Tree Container */}
                <div className="flex-1 overflow-y-auto">
                    <FileFolderTree
                        projectId={projectId}
                        onSelectFile={file => handleOpenFile(file._id)}
                        showDelete={user && user._id === projectOwner}
                        onFilesChanged={handleFilesChanged}
                    />
                </div>
            </div>

            {/* Enhanced Editor Area */}
            <div className="flex-1 flex flex-col bg-white">
                {selectedFile ? (
                    <CodeEditor
                        fileId={selectedFile._id}
                        initialContent={editorContent}
                        projectId={projectId}
                        fileName={selectedFile.name}
                        filePath={filePath}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-50">
                        <div className="text-center max-w-md">
                            <div className="mb-6">
                                <svg className="w-24 h-24 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">Welcome to your workspace</h3>
                            <p className="text-gray-500 mb-6">Select a file from the sidebar to start coding, or create a new one to begin your project.</p>
                            <div className="flex justify-center gap-2 text-sm text-gray-400">
                                <span>💡</span>
                                <span>Files auto-save as you type</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
