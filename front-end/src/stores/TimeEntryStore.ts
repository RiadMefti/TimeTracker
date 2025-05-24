import { create } from "zustand";
import dayjs from "dayjs";
import type { TimeEntry, TimeEntryCreate } from "../types/TimeEntry";
import { Api } from "../api/Api";

interface TimerState {
  isRunning: boolean;
  startTime: Date | null;
  currentDescription: string;
  currentProjectId: number | null;
  elapsedTime: number; // milliseconds
}

interface IUseTimeEntryStore {
  timeEntries: TimeEntry[];
  timer: TimerState;
  setTimeEntries: (timeEntries: TimeEntry[]) => void;
  fetchTimeEntries: () => Promise<void>;
  createTimeEntry: (entry: TimeEntryCreate) => Promise<void>;
  updateTimeEntry: (entry: TimeEntry) => Promise<void>;
  deleteTimeEntry: (entryId: number) => Promise<void>;
  startTimer: (description?: string, projectId?: number | null) => void;
  stopTimer: () => Promise<void>;
  updateTimerDescription: (description: string) => void;
  updateTimerProject: (projectId: number | null) => void;
  updateElapsedTime: () => void;
}

export const useTimeEntryStore = create<IUseTimeEntryStore>((set, get) => ({
  timeEntries: [],
  timer: {
    isRunning: false,
    startTime: null,
    currentDescription: "",
    currentProjectId: null,
    elapsedTime: 0,
  },
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
  startTimer: (description = "", projectId = null) => {
    set((state) => ({
      timer: {
        ...state.timer,
        isRunning: true,
        startTime: dayjs().toDate(),
        currentDescription: description,
        currentProjectId: projectId,
        elapsedTime: 0,
      },
    }));
  },
  stopTimer: async () => {
    const state = get();
    if (state.timer.startTime && state.timer.isRunning) {
      const endTime = dayjs();
      const startTime = dayjs(state.timer.startTime);

      // Format dates for Go backend using dayjs
      const timeEntry: TimeEntryCreate = {
        Description: state.timer.currentDescription || "Timer entry",
        ProjectID: state.timer.currentProjectId,
        StartDate: startTime.toISOString(),
        EndDate: endTime.toISOString(),
      };

      try {
        await get().createTimeEntry(timeEntry);
      } catch (error) {
        console.error("Failed to save time entry:", error);
      }

      set((state) => ({
        timer: {
          ...state.timer,
          isRunning: false,
          startTime: null,
          currentDescription: "",
          currentProjectId: null,
          elapsedTime: 0,
        },
      }));
    }
  },
  updateTimerDescription: (description: string) => {
    set((state) => ({
      timer: {
        ...state.timer,
        currentDescription: description,
      },
    }));
  },
  updateTimerProject: (projectId: number | null) => {
    set((state) => ({
      timer: {
        ...state.timer,
        currentProjectId: projectId,
      },
    }));
  },
  updateElapsedTime: () => {
    const state = get();
    if (state.timer.isRunning && state.timer.startTime) {
      const now = dayjs();
      const elapsed = now.diff(dayjs(state.timer.startTime));
      set((state) => ({
        timer: {
          ...state.timer,
          elapsedTime: elapsed,
        },
      }));
    }
  },
}));
