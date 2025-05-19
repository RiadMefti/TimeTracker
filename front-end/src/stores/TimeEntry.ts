import { create } from "zustand";
import type { TimeEntry } from "../types/TimeEntry";

interface IUseTimeEntryStore {
  timeEntries: TimeEntry[];
  setTimeEntries: (timeEntries: TimeEntry[]) => void;
}

export const useTimeEntryStore = create<IUseTimeEntryStore>((set) => ({
  timeEntries: [],
  setTimeEntries: (timeEntries) => set({ timeEntries }),
}));
