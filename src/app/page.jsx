'use client';

import React, { useEffect, useState } from 'react';
import api from '../lib/axios.js';
import useStore from '../store/useStore.js';
import { useRouter } from 'next/navigation';
import useAuth from '../hooks/useAuth.js';

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [joinProjectId, setJoinProjectId] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const projects = useStore((state) => state.projects);
  const setProjects = useStore((state) => state.setProjects);
  const { user } = useAuth();
  const router = useRouter();

  // Load projects from backend on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects');
        if (res.data.success) {
          setProjects(res.data.data);
          localStorage.setItem('joinedProjects', JSON.stringify(res.data.data));
        }
      } catch (err) {
        console.error('Failed to fetch projects', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [setProjects]);

  const handleOpenProject = (projectId) => {
    router.push(`/projects/${projectId}`);
  };

  const handleCreateProject = async () => {
    if (!newProjectName) return;
    try {
      const res = await api.post('/projects', { name: newProjectName });
      if (res.data.success) {
        const updated = [...projects, res.data.data];
        setProjects(updated);
        localStorage.setItem('joinedProjects', JSON.stringify(updated));
        setShowModal(false);
        setNewProjectName('');
        setFeedbackMsg('Project created!');
      }
    } catch (err) {
      setFeedbackMsg('Failed to create project');
    }
  };

  const handleJoinProject = async () => {
    if (!joinProjectId) return;
    // Prevent joining own or already joined projects
    const already = projects.find(p => p._id === joinProjectId);
    if (already) {
      if (user && already.owner && (already.owner._id || already.owner) === user._id) {
        setFeedbackMsg('You cannot join your own project.');
        return;
      }
      setFeedbackMsg('You have already joined this project.');
      return;
    }
    try {
      const res = await api.post('/projects/join', { projectId: joinProjectId });
      if (res.data.success) {
        const updated = [...projects, res.data.data];
        setProjects(updated);
        localStorage.setItem('joinedProjects', JSON.stringify(updated));
        setJoinProjectId('');
        setFeedbackMsg('Project joined!');
      } else {
        setFeedbackMsg(res.data.message || 'Project not found');
      }
    } catch (err) {
      setFeedbackMsg(err.response?.data?.message || 'Failed to join project');
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      useStore.getState().setUser(null);
      localStorage.removeItem('joinedProjects');
      router.push('/auth/login');
    } catch (err) {
      setFeedbackMsg('Logout failed');
    }
  };

  const handleLeaveProject = async (projectId) => {
    try {
      const res = await api.post('/projects/leave', { projectId });
      if (res.data.success) {
        setFeedbackMsg('Left project!');
        // Fetch latest projects from backend
        const refreshed = await api.get('/projects');
        if (refreshed.data.success) {
          setProjects(refreshed.data.data);
          localStorage.setItem('joinedProjects', JSON.stringify(refreshed.data.data));
        }
      } else {
        setFeedbackMsg(res.data.message || 'Failed to leave project');
      }
    } catch (err) {
      setFeedbackMsg(err.response?.data?.message || 'Failed to leave project');
    }
  };

  const handleDeleteProject = async (projectId) => {
    setConfirmDeleteId(projectId);
  };

  const confirmDeleteProject = async () => {
    if (!confirmDeleteId) return;
    try {
      await api.delete(`/projects/${confirmDeleteId}`);
      const updated = projects.filter(p => p._id !== confirmDeleteId);
      setProjects(updated);
      localStorage.setItem('joinedProjects', JSON.stringify(updated));
      setFeedbackMsg('Project deleted!');
    } catch (err) {
      setFeedbackMsg('Failed to delete project');
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const cancelDeleteProject = () => {
    setConfirmDeleteId(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Your Projects</h1>
        <div className="flex gap-2 items-center">
          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            onClick={() => setShowModal(true)}
          >
            + New Project
          </button>
          <input
            type="text"
            placeholder="Enter Project ID"
            value={joinProjectId}
            onChange={e => setJoinProjectId(e.target.value)}
            className="border px-3 py-2 rounded"
            style={{ minWidth: '180px' }}
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={handleJoinProject}
          >
            Join
          </button>
          {user && (
            <button
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 ml-2"
              onClick={handleLogout}
            >
              Logout
            </button>
          )}
        </div>
      </div>

      {feedbackMsg && (
        <div className="mb-4 text-center text-red-600 font-semibold bg-red-100 py-2 rounded">
          {feedbackMsg}
        </div>
      )}
      {confirmDeleteId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-sm text-center flex flex-col items-center justify-center" style={{ minHeight: '220px' }}>
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="mb-6">Are you sure you want to delete this project?</p>
            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                onClick={cancelDeleteProject}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                onClick={confirmDeleteProject}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {loading ? (
        <p>Loading projects...</p>
      ) : projects.length === 0 ? (
        <p>No projects found. Create one above!</p>
      ) : (
        <ul className="space-y-3">
          {projects.map((project) => {
            const ownerId = project.owner?._id || project.owner;
            const isOwner = user && ownerId === user._id;
            return (
              <li
                key={project._id}
                className="p-3 bg-white rounded shadow hover:bg-gray-100 cursor-pointer flex items-center justify-between"
              >
                <span onClick={() => handleOpenProject(project._id)}>{project.name}</span>
                <div className="flex items-center gap-2">
                  {user && project.owner && (
                    <span className={`px-2 py-1 rounded text-xs ${isOwner ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                      {isOwner ? 'Owner' : 'Joined'}
                    </span>
                  )}
                  {user && project.owner && isOwner && (
                    <button
                      className="ml-2 bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                      onClick={() => handleDeleteProject(project._id)}
                    >
                      Delete
                    </button>
                  )}
                  {user && project.owner && !isOwner && (
                    <button
                      className="ml-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs hover:bg-yellow-600"
                      onClick={() => handleLeaveProject(project._id)}
                    >
                      Leave
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded shadow w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Project</h2>
            <input
              type="text"
              placeholder="Project Name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600"
                onClick={handleCreateProject}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}