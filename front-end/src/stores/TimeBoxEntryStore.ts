import { create } from "zustand";
import type { TimeBoxEntry, TimeBoxEntryCreate } from "../types/TimeBoxEntry";
import type { AssignProjectPayload } from "../types/TimeEntry";
import { Api } from "../api/Api";

interface IUseTimeBoxEntryStore {
  timeBoxEntries: TimeBoxEntry[];
  setTimeBoxEntries: (timeBoxEntries: TimeBoxEntry[]) => void;
  fetchTimeBoxEntries: () => Promise<void>;
  createTimeBoxEntry: (entry: TimeBoxEntryCreate) => Promise<void>;
  updateTimeBoxEntry: (entry: TimeBoxEntry) => Promise<void>;
  deleteTimeBoxEntry: (entryId: number) => Promise<void>;
  assignProjectToTimeBox: (
    timeBoxEntryId: number,
    projectId: number | null
  ) => Promise<void>;
}

export const useTimeBoxEntryStore = create<IUseTimeBoxEntryStore>((set) => ({
  timeBoxEntries: [],
  setTimeBoxEntries: (timeBoxEntries) => set({ timeBoxEntries }),
  fetchTimeBoxEntries: async () => {
    try {
      const res = await Api.timeBoxEntry.getUserTimeBoxEntries();
      if (res.Success && res.Data) {
        set({ timeBoxEntries: res.Data });
      }
    } catch (error) {
      console.error("Failed to fetch timebox entries:", error);
    }
  },
  createTimeBoxEntry: async (entry: TimeBoxEntryCreate) => {
    try {
      const res = await Api.timeBoxEntry.createTimeBoxEntry(entry);
      if (res.Success && res.Data) {
        set({ timeBoxEntries: res.Data });
      }
    } catch (error) {
      console.error("Failed to create timebox entry:", error);
      throw error;
    }
  },
  updateTimeBoxEntry: async (entry: TimeBoxEntry) => {
    try {
      const res = await Api.timeBoxEntry.updateTimeBoxEntry(entry);
      if (res.Success && res.Data) {
        set({ timeBoxEntries: res.Data });
      }
    } catch (error) {
      console.error("Failed to update timebox entry:", error);
      throw error;
    }
  },
  deleteTimeBoxEntry: async (entryId: number) => {
    try {
      const res = await Api.timeBoxEntry.deleteTimeBoxEntry(entryId);
      if (res.Success && res.Data) {
        set({ timeBoxEntries: res.Data });
      }
    } catch (error) {
      console.error("Failed to delete timebox entry:", error);
      throw error;
    }
  },
  assignProjectToTimeBox: async (
    timeBoxEntryId: number,
    projectId: number | null
  ) => {
    try {
      const payload: AssignProjectPayload = { ProjectID: projectId };
      const res = await Api.timeBoxEntry.assignProjectToTimeBox(
        timeBoxEntryId,
        payload
      );
      if (res.Success && res.Data) {
        set({ timeBoxEntries: res.Data });
      }
    } catch (error) {
      console.error("Failed to assign project to timebox:", error);
      throw error;
    }
  },
}));
