'use client';

import React from 'react';
import useStore from '../store/useStore.js';
import { useRouter } from 'next/navigation';

export default function Sidebar() {
  const projects = useStore((state) => state.projects);
  const router = useRouter();

  const handleOpenProject = (projectId) => {
    router.push(`/editor/${projectId}/new`);
  };

  return (
    <aside className="w-64 bg-white shadow-md p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Projects</h2>
      <ul className="flex flex-col space-y-2">
        {projects.map((project) => (
          <li
            key={project._id}
            className="p-2 rounded hover:bg-gray-100 cursor-pointer"
            onClick={() => handleOpenProject(project._id)}
          >
            {project.name}
          </li>
        ))}
      </ul>
      <button className="mt-auto bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600">
        + New Project
      </button>
    </aside>
  );
}