import { create } from 'zustand';

const useStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  currentProject: null,
  setCurrentProject: (project) => set({ currentProject: project }),
  currentFile: null,
  setCurrentFile: (file) => set({ currentFile: file }),
  projects: [],
  setProjects: (projects) => set({ projects })
}));

export default useStore;