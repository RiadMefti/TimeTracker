import {
  Box,
  Typography,
  Button,
  Breadcrumbs,
  Link,
  IconButton,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Add, CreateNewFolder, ArrowBack } from "@mui/icons-material";
import { type FC, useState, useEffect } from "react";
import { useFolderStore } from "../stores/FolderStore";
import { useNoteStore } from "../stores/NoteStore";
import FolderDialog from "../components/folder/FolderDialog";
import NoteDialog from "../components/notes/NoteDialog";
import ItemCard from "../components/common/ItemCard";
import DocumentViewer from "../components/documents/DocumentViewer";
import type { Folder } from "../types/Folder";
import type { Note } from "../types/Note";

const DocumentsPage: FC = () => {
  const {
    folders,
    currentFolderId,
    setCurrentFolderId,
    getFolderById,
    getFolderPath,
    removeFolder,
    fetchFolders,
    loading: foldersLoading,
    error: foldersError,
  } = useFolderStore();

  const { 
    notes,
    currentNote, 
    setCurrentNote, 
    removeNote,
    fetchNotes,
    loading: notesLoading,
    error: notesError,
  } = useNoteStore();

  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | undefined>();
  const [editingNote, setEditingNote] = useState<Note | undefined>();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    type: "folder" | "note";
    item: Folder | Note;
  } | null>(null);

  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchFolders(), fetchNotes()]);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to run only once on mount

  // Get current folder and its contents
  const currentFolder = currentFolderId ? getFolderById(currentFolderId) : null;
  const subFolders = folders.filter((folder) => 
    currentFolderId ? folder.ParentID === currentFolderId : !folder.ParentID
  );
  const folderNotes = notes.filter((note) =>
    currentFolderId ? note.FolderID === currentFolderId : !note.FolderID
  );
  const breadcrumbPath = currentFolderId ? getFolderPath(currentFolderId) : [];

  // If viewing a document, show the document viewer
  if (currentNote) {
    return (
      <DocumentViewer
        onBack={() => setCurrentNote(null)}
        onDelete={(note) => {
          setItemToDelete({ type: "note", item: note });
          setDeleteConfirmOpen(true);
        }}
      />
    );
  }

  const handleFolderClick = (folder: Folder) => {
    setCurrentFolderId(folder.ID);
  };

  const handleNoteClick = (note: Note) => {
    setCurrentNote(note);
  };

  const handleBackClick = () => {
    if (currentFolder?.ParentID) {
      setCurrentFolderId(currentFolder.ParentID);
    } else {
      setCurrentFolderId(null);
    }
  };

  const handleBreadcrumbClick = (folderId: number | null) => {
    setCurrentFolderId(folderId);
  };

  const handleCreateFolder = () => {
    setEditingFolder(undefined);
    setFolderDialogOpen(true);
  };

  const handleCreateDocument = () => {
    setEditingNote(undefined);
    setNoteDialogOpen(true);
  };

  const handleEditFolder = (folder: Folder) => {
    setEditingFolder(folder);
    setFolderDialogOpen(true);
  };

  const handleEditDocument = (note: Note) => {
    setEditingNote(note);
    setNoteDialogOpen(true);
  };

  const handleDeleteFolder = (folder: Folder) => {
    setItemToDelete({ type: "folder", item: folder });
    setDeleteConfirmOpen(true);
  };

  const handleDeleteDocument = (note: Note) => {
    setItemToDelete({ type: "note", item: note });
    setDeleteConfirmOpen(true);
  };

  const handleItemEdit = (item: Folder | Note, type: "folder" | "note") => {
    if (type === "folder") {
      handleEditFolder(item as Folder);
    } else {
      handleEditDocument(item as Note);
    }
  };

  const handleItemDelete = (item: Folder | Note, type: "folder" | "note") => {
    if (type === "folder") {
      handleDeleteFolder(item as Folder);
    } else {
      handleDeleteDocument(item as Note);
    }
  };

  const handleItemClick = (item: Folder | Note, type: "folder" | "note") => {
    if (type === "folder") {
      handleFolderClick(item as Folder);
    } else {
      handleNoteClick(item as Note);
    }
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      if (itemToDelete.type === "folder") {
        removeFolder((itemToDelete.item as Folder).ID);
      } else {
        const noteToDelete = itemToDelete.item as Note;
        removeNote(noteToDelete.ID);
        // If we're deleting the currently viewed note, go back to list
        const currentNoteTyped = currentNote as Note | null;
        if (currentNoteTyped && currentNoteTyped.ID === noteToDelete.ID) {
          setCurrentNote(null);
        }
      }
    }
    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  const allItems = [
    ...subFolders.map((folder) => ({ ...folder, type: "folder" as const })),
    ...folderNotes.map((note) => ({ ...note, type: "note" as const })),
  ].sort((a, b) => {
    // Sort folders first, then by name
    if (a.type !== b.type) {
      return a.type === "folder" ? -1 : 1;
    }
    const aName = a.type === "folder" ? a.Name : a.Title;
    const bName = b.type === "folder" ? b.Name : b.Title;
    return aName.localeCompare(bName);
  });

  return (
    <Box
      sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}
    >
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 600, color: "white" }}
          >
            Documents
          </Typography>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<CreateNewFolder />}
              onClick={handleCreateFolder}
            >
              New Folder
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreateDocument}
            >
              New Document
            </Button>
          </Box>
        </Box>

        {/* Breadcrumbs */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {currentFolderId && (
            <IconButton size="small" onClick={handleBackClick}>
              <ArrowBack />
            </IconButton>
          )}

          <Breadcrumbs separator="/" sx={{ color: "text.secondary" }}>
            <Link
              component="button"
              variant="body2"
              onClick={() => handleBreadcrumbClick(null)}
              sx={{
                color: !currentFolderId ? "#0a7dff" : "text.secondary",
                textDecoration: "none",
                "&:hover": { color: "#0a7dff" },
              }}
            >
              All Documents
            </Link>
            {breadcrumbPath.map((folder, index) => (
              <Link
                key={folder.ID}
                component="button"
                variant="body2"
                onClick={() => handleBreadcrumbClick(folder.ID)}
                sx={{
                  color:
                    index === breadcrumbPath.length - 1
                      ? "#0a7dff"
                      : "text.secondary",
                  textDecoration: "none",
                  "&:hover": { color: "#0a7dff" },
                }}
              >
                {folder.Name}
              </Link>
            ))}
          </Breadcrumbs>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: "auto" }}>
        {/* Loading State */}
        {(foldersLoading || notesLoading) && (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              textAlign: "center",
              backgroundColor: "rgba(26, 44, 56, 0.3)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 2,
              mb: 2,
            }}
          >
            <Typography variant="body1" color="text.secondary">
              Loading your documents...
            </Typography>
          </Paper>
        )}

        {/* Error State */}
        {(foldersError || notesError) && (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              textAlign: "center",
              backgroundColor: "rgba(255, 0, 0, 0.1)",
              border: "1px solid rgba(255, 0, 0, 0.3)",
              borderRadius: 2,
              mb: 2,
            }}
          >
            <Typography variant="body1" color="error">
              Error loading documents: {foldersError || notesError}
            </Typography>
          </Paper>
        )}

        {/* Empty State - only show if not loading and no errors */}
        {!foldersLoading && !notesLoading && !foldersError && !notesError && allItems.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: "center",
              backgroundColor: "rgba(26, 44, 56, 0.3)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 2,
            }}
          >
            <Typography variant="h5" color="text.secondary" gutterBottom>
              No documents or folders yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Create your first folder or document to organize your
              documentation
            </Typography>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
              <Button
                variant="outlined"
                startIcon={<CreateNewFolder />}
                onClick={handleCreateFolder}
              >
                Create Folder
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreateDocument}
              >
                Create Document
              </Button>
            </Box>
          </Paper>
        ) : (
          !foldersLoading && !notesLoading && !foldersError && !notesError && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 3,
              }}
            >
              {allItems.map((item) => (
                <ItemCard
                  key={`${item.type}-${item.ID}`}
                  item={item}
                  type={item.type}
                  onEdit={(itemToEdit) => handleItemEdit(itemToEdit, item.type)}
                  onDelete={(itemToDelete) =>
                    handleItemDelete(itemToDelete, item.type)
                  }
                  onClick={(itemToClick) =>
                    handleItemClick(itemToClick, item.type)
                  }
                />
              ))}
            </Box>
          )
        )}
      </Box>

      {/* Dialogs */}
      <FolderDialog
        open={folderDialogOpen}
        onClose={() => setFolderDialogOpen(false)}
        folder={editingFolder}
        parentFolderId={currentFolderId || undefined}
      />

      <NoteDialog
        open={noteDialogOpen}
        onClose={() => setNoteDialogOpen(false)}
        note={editingNote}
        defaultFolderId={currentFolderId || undefined}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: "#1a2c38",
            backgroundImage: "none",
          },
        }}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this{" "}
            {itemToDelete?.type === "folder" ? "folder" : "document"}? This
            action cannot be undone.
            {itemToDelete?.type === "folder" &&
              " All documents and subfolders within this folder will also be deleted."}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentsPage;
