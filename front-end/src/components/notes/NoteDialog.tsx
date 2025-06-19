import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
} from '@mui/material';
import { type FC, useState, useEffect } from 'react';
import { useFolderStore } from '../../stores/FolderStore';
import { useNoteStore } from '../../stores/NoteStore';
import TipTapEditor from './TipTapEditor';
import type { Note } from '../../types/Note';

interface NoteDialogProps {
  open: boolean;
  onClose: () => void;
  note?: Note;
  defaultFolderId?: number;
}

const NoteDialog: FC<NoteDialogProps> = ({
  open,
  onClose,
  note,
  defaultFolderId,
}) => {
  const { folders } = useFolderStore();
  const { createNote, editNote } = useNoteStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);

  const isEditing = Boolean(note);

  useEffect(() => {
    if (open) {
      if (note) {
        setTitle(note.Title);
        setContent(note.Content);
        setSelectedFolderId(note.FolderID || '');
      } else {
        setTitle('');
        setContent('');
        setSelectedFolderId(defaultFolderId || '');
      }
    }
  }, [open, note, defaultFolderId]);

  const handleSubmit = async () => {
    if (!title.trim()) return;

    setLoading(true);
    try {
      const noteData = {
        Title: title.trim(),
        Content: content,
        FolderID: selectedFolderId === '' ? undefined : Number(selectedFolderId),
      };

      if (isEditing && note) {
        // Call API to update note
        await editNote(note.ID, noteData);
      } else {
        // Call API to create note
        await createNote(noteData);
      }

      onClose();
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#1a2c38',
          backgroundImage: 'none',
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h6" component="div">
          {isEditing ? 'Edit Document' : 'Create New Document'}
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Document Title"
              variant="outlined"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter document title"
              autoFocus
              sx={{ flex: 1 }}
            />
            
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Folder</InputLabel>
              <Select
                value={selectedFolderId}
                onChange={(e) => setSelectedFolderId(e.target.value)}
                label="Folder"
              >
                <MenuItem value="">
                  <em>No Folder</em>
                </MenuItem>
                {folders.map((folder) => (
                  <MenuItem key={folder.ID} value={folder.ID}>
                    {folder.Name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          <Box>
            <Typography variant="subtitle2" gutterBottom color="text.secondary">
              Content
            </Typography>
            <TipTapEditor
              content={content}
              onChange={setContent}
              placeholder="Start writing your document..."
            />
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          color="inherit"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!title.trim() || loading}
        >
          {loading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NoteDialog;
