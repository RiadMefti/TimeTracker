import { create } from "zustand";
import type { Note } from "../types/Note";
import { Api } from "../api/Api";

interface NoteState {
  notes: Note[];
  loading: boolean;
  error: string | null;
  currentNote: Note | null; // Currently viewing/editing note
  
  // Actions
  setNotes: (notes: Note[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentNote: (note: Note | null) => void;
  addNote: (note: Note) => void;
  updateNote: (note: Note) => void;
  removeNote: (noteId: number) => void;
  
  // API Actions
  fetchNotes: () => Promise<void>;
  createNote: (noteData: { Title: string; Content: string; FolderID?: number }) => Promise<void>;
  editNote: (id: number, noteData: { Title: string; Content: string; FolderID?: number }) => Promise<void>;
  deleteNote: (noteId: number) => Promise<void>;
  
  // Helper methods
  getNoteById: (id: number) => Note | undefined;
  getNotesByFolder: (folderId?: number) => Note[];
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  loading: false,
  error: null,
  currentNote: null,

  setNotes: (notes) => set({ notes }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setCurrentNote: (note) => set({ currentNote: note }),

  addNote: (note) =>
    set((state) => ({
      notes: [...state.notes, note],
    })),

  updateNote: (updatedNote) =>
    set((state) => ({
      notes: state.notes.map((note) =>
        note.ID === updatedNote.ID ? updatedNote : note
      ),
    })),

  removeNote: (noteId) =>
    set((state) => ({
      notes: state.notes.filter((note) => note.ID !== noteId),
    })),

  // API Actions
  fetchNotes: async () => {
    try {
      set({ loading: true, error: null });
      const response = await Api.notes.getAllNotes();
      if (response.Success && response.Data) {
        set({ notes: response.Data, loading: false });
      } else {
        set({ error: response.Message || 'Failed to fetch notes', loading: false });
      }
    } catch (error) {
      console.error('Failed to fetch notes:', error);
      set({ error: 'Failed to fetch notes', loading: false });
    }
  },

  createNote: async (noteData) => {
    try {
      set({ loading: true, error: null });
      const response = await Api.notes.createNote(noteData);
      if (response.Success && response.Data) {
        set((state) => ({ 
          notes: [...state.notes, response.Data!], 
          loading: false 
        }));
      } else {
        set({ error: response.Message || 'Failed to create note', loading: false });
      }
    } catch (error) {
      console.error('Failed to create note:', error);
      set({ error: 'Failed to create note', loading: false });
    }
  },

  editNote: async (id, noteData) => {
    try {
      set({ loading: true, error: null });
      const response = await Api.notes.updateNote(id, noteData);
      if (response.Success && response.Data) {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.ID === id ? response.Data! : note
          ),
          // Update currentNote if it's the same note being edited
          currentNote: state.currentNote && state.currentNote.ID === id ? response.Data! : state.currentNote,
          loading: false
        }));
      } else {
        set({ error: response.Message || 'Failed to update note', loading: false });
      }
    } catch (error) {
      console.error('Failed to update note:', error);
      set({ error: 'Failed to update note', loading: false });
    }
  },

  deleteNote: async (noteId) => {
    try {
      set({ loading: true, error: null });
      const response = await Api.notes.deleteNote(noteId);
      if (response.Success) {
        set((state) => ({
          notes: state.notes.filter((note) => note.ID !== noteId),
          loading: false
        }));
      } else {
        set({ error: response.Message || 'Failed to delete note', loading: false });
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
      set({ error: 'Failed to delete note', loading: false });
    }
  },

  getNoteById: (id) => {
    const { notes } = get();
    return notes.find((note) => note.ID === id);
  },

  getNotesByFolder: (folderId) => {
    const { notes } = get();
    return notes.filter((note) =>
      folderId ? note.FolderID === folderId : !note.FolderID
    );
  },
}));
