import { create } from "zustand";
import type { Folder } from "../types/Folder";
import { Api } from "../api/Api";

interface FolderState {
  folders: Folder[];
  loading: boolean;
  error: string | null;
  currentFolderId: number | null;
  
  // Actions
  setFolders: (folders: Folder[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentFolderId: (folderId: number | null) => void;
  addFolder: (folder: Folder) => void;
  updateFolder: (folder: Folder) => void;
  removeFolder: (folderId: number) => void;
  
  // API Actions
  fetchFolders: () => Promise<void>;
  createFolder: (folderData: { Name: string; ParentID?: number }) => Promise<void>;
  editFolder: (id: number, folderData: { Name: string; ParentID?: number }) => Promise<void>;
  deleteFolder: (folderId: number) => Promise<void>;
  
  // Helper methods
  getFolderById: (id: number) => Folder | undefined;
  getFoldersByParent: (parentId?: number) => Folder[];
  getFolderPath: (folderId: number) => Folder[];
}

export const useFolderStore = create<FolderState>((set, get) => ({
  folders: [],
  loading: false,
  error: null,
  currentFolderId: null,

  setFolders: (folders) => set({ folders }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setCurrentFolderId: (folderId) => set({ currentFolderId: folderId }),

  addFolder: (folder) =>
    set((state) => ({
      folders: [...state.folders, folder],
    })),

  updateFolder: (updatedFolder) =>
    set((state) => ({
      folders: state.folders.map((folder) =>
        folder.ID === updatedFolder.ID ? updatedFolder : folder
      ),
    })),

  removeFolder: (folderId) =>
    set((state) => ({
      folders: state.folders.filter((folder) => folder.ID !== folderId),
    })),

  // API Actions
  fetchFolders: async () => {
    try {
      set({ loading: true, error: null });
      const response = await Api.folders.getAllFolders();
      if (response.Success && response.Data) {
        set({ folders: response.Data, loading: false });
      } else {
        set({ error: response.Message || 'Failed to fetch folders', loading: false });
      }
    } catch (error) {
      console.error('Failed to fetch folders:', error);
      set({ error: 'Failed to fetch folders', loading: false });
    }
  },

  createFolder: async (folderData) => {
    try {
      set({ loading: true, error: null });
      const response = await Api.folders.createFolder(folderData);
      if (response.Success && response.Data) {
        set((state) => ({ 
          folders: [...state.folders, response.Data!], 
          loading: false 
        }));
      } else {
        set({ error: response.Message || 'Failed to create folder', loading: false });
      }
    } catch (error) {
      console.error('Failed to create folder:', error);
      set({ error: 'Failed to create folder', loading: false });
    }
  },

  editFolder: async (id, folderData) => {
    try {
      set({ loading: true, error: null });
      const response = await Api.folders.updateFolder(id, folderData);
      if (response.Success && response.Data) {
        set((state) => ({
          folders: state.folders.map((folder) =>
            folder.ID === id ? response.Data! : folder
          ),
          loading: false
        }));
      } else {
        set({ error: response.Message || 'Failed to update folder', loading: false });
      }
    } catch (error) {
      console.error('Failed to update folder:', error);
      set({ error: 'Failed to update folder', loading: false });
    }
  },

  deleteFolder: async (folderId) => {
    try {
      set({ loading: true, error: null });
      const response = await Api.folders.deleteFolder(folderId);
      if (response.Success) {
        set((state) => ({
          folders: state.folders.filter((folder) => folder.ID !== folderId),
          loading: false
        }));
      } else {
        set({ error: response.Message || 'Failed to delete folder', loading: false });
      }
    } catch (error) {
      console.error('Failed to delete folder:', error);
      set({ error: 'Failed to delete folder', loading: false });
    }
  },

  getFolderById: (id) => {
    const { folders } = get();
    return folders.find((folder) => folder.ID === id);
  },

  getFoldersByParent: (parentId) => {
    const { folders } = get();
    return folders.filter((folder) => 
      parentId ? folder.ParentID === parentId : !folder.ParentID
    );
  },

  getFolderPath: (folderId) => {
    const { getFolderById } = get();
    const path: Folder[] = [];
    let currentFolder = getFolderById(folderId);
    
    while (currentFolder) {
      path.unshift(currentFolder);
      currentFolder = currentFolder.ParentID 
        ? getFolderById(currentFolder.ParentID) 
        : undefined;
    }
    
    return path;
  },
}));
