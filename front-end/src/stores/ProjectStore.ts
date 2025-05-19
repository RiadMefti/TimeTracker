import { create } from "zustand";
import type { Project } from "../types/Project";

interface IUseProjectStore {
  projects: Project[];
  setProjects: (projects: Project[]) => void;
}

export const useProjectStore = create<IUseProjectStore>((set) => ({
  projects: [],
  setProjects: (projects) => set({ projects }),
}));
