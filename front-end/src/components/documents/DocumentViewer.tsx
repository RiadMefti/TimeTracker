import {
  Box,
  Typography,
  IconButton,
  Button,
  Breadcrumbs,
  Link,
  Chip,
  TextField,
  Paper,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import {
  ArrowBack,
  Edit,
  Save,
  Cancel,
  Delete,
  FolderOpen,
  MoreVert,
  ContentCopy,
  MoveToInbox,
} from "@mui/icons-material";
import { type FC, useState, useEffect } from "react";
import { useNoteStore } from "../../stores/NoteStore";
import { useFolderStore } from "../../stores/FolderStore";
import TipTapEditor from "../notes/TipTapEditor";
import type { Note } from "../../types/Note";

interface DocumentViewerProps {
  onBack: () => void;
  onDelete: (note: Note) => void;
}

const DocumentViewer: FC<DocumentViewerProps> = ({ onBack, onDelete }) => {
  const { currentNote, editNote } = useNoteStore();
  const { getFolderById, getFolderPath, folders } = useFolderStore();

  // Local state only - no store state for editing
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [moveToFolderOpen, setMoveToFolderOpen] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<number | "">(
    currentNote?.FolderID || ""
  );

  // Initialize edit state when note changes or editing starts
  useEffect(() => {
    if (currentNote) {
      setEditTitle(currentNote.Title);
      setEditContent(currentNote.Content);
      setSelectedFolderId(currentNote.FolderID || "");
      // Always start in read mode when switching notes
      setIsEditing(false);
    }
  }, [currentNote]); // Depend on the full currentNote object

  if (!currentNote) {
    return null;
  }

  const folder = currentNote.FolderID
    ? getFolderById(currentNote.FolderID)
    : null;
  const breadcrumbPath = currentNote.FolderID
    ? getFolderPath(currentNote.FolderID)
    : [];

  const handleEdit = () => {
    console.log('Edit button clicked. Current state:', {
      isEditing,
      currentNote: currentNote?.Title,
      editContent: editContent.slice(0, 50),
    });
    
    // Refresh the edit content from current note to ensure it's up to date
    if (currentNote) {
      setEditTitle(currentNote.Title);
      setEditContent(currentNote.Content);
    }
    setIsEditing(true);
    
    console.log('After setting edit mode:', {
      isEditing: true,
      editTitle,
      editContent: editContent.slice(0, 50),
    });
  };

  const handleSave = async () => {
    if (!editTitle.trim() || !currentNote) return;

    setLoading(true);
    try {
      await editNote(currentNote.ID, {
        Title: editTitle.trim(),
        Content: editContent,
        FolderID: currentNote.FolderID,
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save note:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset to original content
    if (currentNote) {
      setEditTitle(currentNote.Title);
      setEditContent(currentNote.Content);
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(currentNote);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(currentNote.Content);
    handleMenuClose();
  };

  const handleMoveToFolder = () => {
    setMoveToFolderOpen(true);
    handleMenuClose();
  };

  const handleMoveConfirm = async () => {
    if (selectedFolderId !== currentNote.FolderID) {
      try {
        await editNote(currentNote.ID, {
          Title: currentNote.Title,
          Content: currentNote.Content,
          FolderID: selectedFolderId === "" ? undefined : Number(selectedFolderId),
        });
      } catch (error) {
        console.error("Failed to move note:", error);
      }
    }
    setMoveToFolderOpen(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }) +
      " at " +
      date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })
    );
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          backgroundColor: "rgba(26, 44, 56, 0.3)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: 2,
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <IconButton
            onClick={onBack}
            sx={{ color: "rgba(255, 255, 255, 0.7)" }}
          >
            <ArrowBack />
          </IconButton>

          <Breadcrumbs
            separator="/"
            sx={{
              color: "text.secondary",
              "& .MuiBreadcrumbs-separator": {
                color: "rgba(255, 255, 255, 0.3)",
              },
            }}
          >
            <Link
              component="button"
              variant="body2"
              onClick={onBack}
              sx={{
                color: "text.secondary",
                textDecoration: "none",
                "&:hover": { color: "#0a7dff" },
              }}
            >
              Documents
            </Link>
            {breadcrumbPath.map((breadcrumbFolder) => (
              <Typography
                key={breadcrumbFolder.ID}
                variant="body2"
                color="text.secondary"
              >
                {breadcrumbFolder.Name}
              </Typography>
            ))}
          </Breadcrumbs>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Box sx={{ flex: 1, mr: 2 }}>
            {isEditing ? (
              <TextField
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                variant="outlined"
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    fontSize: "1.75rem",
                    fontWeight: 600,
                    "& fieldset": {
                      border: "none",
                    },
                    "&:hover fieldset": {
                      border: "1px solid rgba(10, 125, 255, 0.3)",
                    },
                    "&.Mui-focused fieldset": {
                      border: "1px solid #0a7dff",
                    },
                  },
                }}
              />
            ) : (
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 600,
                  color: "white",
                  mb: 1,
                }}
              >
                {currentNote.Title}
              </Typography>
            )}

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              {folder && (
                <Chip
                  icon={<FolderOpen />}
                  label={folder.Name}
                  size="small"
                  variant="outlined"
                  sx={{
                    color: "#0a7dff",
                    borderColor: "rgba(10, 125, 255, 0.3)",
                    "& .MuiChip-icon": {
                      color: "#0a7dff",
                    },
                  }}
                />
              )}

              <Typography variant="body2" color="text.secondary">
                Last updated {formatDate(currentNote.Updated)}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            {isEditing ? (
              <>
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSave}
                  disabled={!editTitle.trim() || loading}
                >
                  {loading ? "Saving..." : "Save"}
                </Button>
              </>
            ) : (
              <>
                <Tooltip title="Edit document">
                  <IconButton
                    onClick={handleEdit}
                    sx={{
                      color: "rgba(255, 255, 255, 0.7)",
                      "&:hover": { color: "#0a7dff" },
                    }}
                  >
                    <Edit />
                  </IconButton>
                </Tooltip>

                <Tooltip title="More options">
                  <IconButton
                    onClick={handleMenuOpen}
                    sx={{
                      color: "rgba(255, 255, 255, 0.7)",
                      "&:hover": { color: "white" },
                    }}
                  >
                    <MoreVert />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Delete document">
                  <IconButton
                    onClick={handleDelete}
                    sx={{
                      color: "rgba(244, 67, 54, 0.7)",
                      "&:hover": { color: "#f44336" },
                    }}
                  >
                    <Delete />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Content */}
      <Paper
        elevation={0}
        sx={{
          flex: 1,
          p: 3,
          backgroundColor: "rgba(26, 44, 56, 0.3)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: 2,
          overflow: "auto",
        }}
      >
        <TipTapEditor
          key={`${currentNote.ID}-${isEditing}`}
          content={editContent}
          onChange={setEditContent}
          readOnly={!isEditing}
          placeholder={isEditing ? "Start writing your document..." : ""}
        />
      </Paper>

      {/* More options menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            backgroundColor: '#1a2c38',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            minWidth: 200,
          },
        }}
      >
        <MenuItem onClick={handleCopyContent}>
          <ListItemIcon>
            <ContentCopy fontSize="small" />
          </ListItemIcon>
          <ListItemText>Copy content</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleMoveToFolder}>
          <ListItemIcon>
            <MoveToInbox fontSize="small" />
          </ListItemIcon>
          <ListItemText>Move to folder</ListItemText>
        </MenuItem>
      </Menu>

      {/* Move to folder dialog */}
      <Box
        component="div"
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: moveToFolderOpen ? 'flex' : 'none',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1300,
        }}
        onClick={() => setMoveToFolderOpen(false)}
      >
        <Paper
          sx={{
            p: 3,
            backgroundColor: '#1a2c38',
            minWidth: 400,
            maxWidth: 500,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Typography variant="h6" gutterBottom>
            Move Document to Folder
          </Typography>
          
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Select Folder</InputLabel>
            <Select
              value={selectedFolderId}
              onChange={(e) => setSelectedFolderId(e.target.value)}
              label="Select Folder"
            >
              <MenuItem value="">
                <em>No Folder (Root)</em>
              </MenuItem>
              {folders.map((folder) => (
                <MenuItem key={folder.ID} value={folder.ID}>
                  {folder.Name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={() => setMoveToFolderOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleMoveConfirm}
            >
              Move
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default DocumentViewer;
