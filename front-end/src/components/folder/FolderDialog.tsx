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
import type { Folder } from '../../types/Folder';

interface FolderDialogProps {
  open: boolean;
  onClose: () => void;
  folder?: Folder;
  parentFolderId?: number;
}

const FolderDialog: FC<FolderDialogProps> = ({
  open,
  onClose,
  folder,
  parentFolderId,
}) => {
  const { folders, createFolder, editFolder } = useFolderStore();
  const [name, setName] = useState('');
  const [selectedParentId, setSelectedParentId] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);

  const isEditing = Boolean(folder);

  useEffect(() => {
    if (open) {
      if (folder) {
        setName(folder.Name);
        setSelectedParentId(folder.ParentID || '');
      } else {
        setName('');
        setSelectedParentId(parentFolderId || '');
      }
    }
  }, [open, folder, parentFolderId]);

  const handleSubmit = async () => {
    if (!name.trim()) return;

    setLoading(true);
    try {
      const folderData = {
        Name: name.trim(),
        ParentID: selectedParentId === '' ? undefined : Number(selectedParentId),
      };

      if (isEditing && folder) {
        // Call API to update folder
        await editFolder(folder.ID, folderData);
      } else {
        // Call API to create folder
        await createFolder(folderData);
      }

      onClose();
    } catch (error) {
      console.error('Failed to save folder:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get available parent folders (excluding the current folder and its descendants if editing)
  const getAvailableParentFolders = () => {
    if (!isEditing) return folders;
    
    // For editing, exclude the current folder and its descendants
    const excludedIds = new Set([folder!.ID]);
    
    // Add descendants to excluded set
    const addDescendants = (parentId: number) => {
      folders
        .filter(f => f.ParentID === parentId)
        .forEach(f => {
          excludedIds.add(f.ID);
          addDescendants(f.ID);
        });
    };
    
    addDescendants(folder!.ID);
    
    return folders.filter(f => !excludedIds.has(f.ID));
  };

  const availableParentFolders = getAvailableParentFolders();

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#1a2c38',
          backgroundImage: 'none',
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h6" component="div">
          {isEditing ? 'Edit Folder' : 'Create New Folder'}
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
          <TextField
            label="Folder Name"
            variant="outlined"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter folder name"
            autoFocus
          />
          
          <FormControl fullWidth>
            <InputLabel>Parent Folder</InputLabel>
            <Select
              value={selectedParentId}
              onChange={(e) => setSelectedParentId(e.target.value)}
              label="Parent Folder"
            >
              <MenuItem value="">
                <em>None (Root Level)</em>
              </MenuItem>
              {availableParentFolders.map((parentFolder) => (
                <MenuItem key={parentFolder.ID} value={parentFolder.ID}>
                  {parentFolder.Name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
          disabled={!name.trim() || loading}
        >
          {loading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FolderDialog;
