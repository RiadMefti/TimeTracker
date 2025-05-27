import { create } from "zustand";
import type { Project, ProjectCreate } from "../types/Project";
import { Api } from "../api/Api";

interface IUseProjectStore {
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  fetchProjects: () => Promise<void>;
  createProject: (project: ProjectCreate) => Promise<void>;
  updateProject: (project: Project) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
}

export const useProjectStore = create<IUseProjectStore>((set) => ({
  projects: [],
  setProjects: (projects) => set({ projects }),
  fetchProjects: async () => {
    const res = await Api.projects.getUserProjects();
    if (res.Success && res.Data) {
      set({ projects: res.Data });
    }
  },
  createProject: async (project: ProjectCreate) => {
    const res = await Api.projects.createUserProject(project);
    if (res.Success && res.Data) {
      set({ projects: res.Data });
    }
  },
  updateProject: async (project: Project) => {
    const res = await Api.projects.updateUserProject(project);
    if (res.Success && res.Data) {
      set({ projects: res.Data });
    }
  },
  deleteProject: async (projectId: string) => {
    const res = await Api.projects.deleteUserProject(projectId);
    if (res.Success && res.Data) {
      set({ projects: res.Data });
    }
  },
}));
