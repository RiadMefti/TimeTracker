import { create } from "zustand";
import type { TimeEntry, TimeEntryCreate } from "../types/TimeEntry";
import { Api } from "../api/Api";

interface IUseTimeEntryStore {
  timeEntries: TimeEntry[];
  setTimeEntries: (timeEntries: TimeEntry[]) => void;
  fetchTimeEntries: () => Promise<void>;
  createTimeEntry: (entry: TimeEntry) => Promise<void>;
  updateTimeEntry: (entry: TimeEntry) => Promise<void>;
  deleteTimeEntry: (entryId: number) => Promise<void>;
}

export const useTimeEntryStore = create<IUseTimeEntryStore>((set) => ({
  timeEntries: [],
  setTimeEntries: (timeEntries) => set({ timeEntries }),
  fetchTimeEntries: async () => {
    const res = await Api.timeEntry.getUserTimeEntries();
    if (res.Success && res.Data) {
      set({ timeEntries: res.Data });
    }
  },
  createTimeEntry: async (entry: TimeEntryCreate) => {
    const res = await Api.timeEntry.createTimeEntry(entry);
    if (res.Success && res.Data) {
      set({ timeEntries: res.Data });
    }
  },
  updateTimeEntry: async (entry: TimeEntry) => {
    const res = await Api.timeEntry.updateTimeEntry(entry);
    if (res.Success && res.Data) {
      set({ timeEntries: res.Data });
    }
  },
  deleteTimeEntry: async (entryId: number) => {
    const res = await Api.timeEntry.deleteTimeEntry(entryId);
    if (res.Success && res.Data) {
      set({ timeEntries: res.Data });
    }
  },
}));
