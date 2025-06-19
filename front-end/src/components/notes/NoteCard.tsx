import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  MoreVert,
  Edit,
  Delete,
  FolderOpen,
} from '@mui/icons-material';
import { type FC, useState } from 'react';
import { useFolderStore } from '../../stores/FolderStore';
import type { Note } from '../../types/Note';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
  onClick: (note: Note) => void;
}

const NoteCard: FC<NoteCardProps> = ({
  note,
  onEdit,
  onDelete,
  onClick,
}) => {
  const { getFolderById } = useFolderStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const folder = note.FolderID ? getFolderById(note.FolderID) : null;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    onEdit(note);
    handleMenuClose();
  };

  const handleDelete = () => {
    onDelete(note);
    handleMenuClose();
  };

  // Extract plain text from HTML content for preview
  const getPlainTextPreview = (htmlContent: string, maxLength: number = 150) => {
    const div = document.createElement('div');
    div.innerHTML = htmlContent;
    const text = div.textContent || div.innerText || '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  };

  return (
    <Card
      sx={{
        backgroundColor: 'rgba(26, 44, 56, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          backgroundColor: 'rgba(26, 44, 56, 0.9)',
          borderColor: 'rgba(10, 125, 255, 0.3)',
          transform: 'translateY(-2px)',
        },
      }}
      onClick={() => onClick(note)}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography 
            variant="h6" 
            component="h3" 
            sx={{ 
              fontSize: '1.1rem',
              fontWeight: 600,
              color: 'white',
              lineHeight: 1.3,
              mb: 0.5,
            }}
          >
            {note.Title}
          </Typography>
          
          <IconButton
            size="small"
            onClick={handleMenuOpen}
            sx={{ 
              color: 'rgba(255, 255, 255, 0.6)',
              '&:hover': { color: 'white' },
            }}
          >
            <MoreVert fontSize="small" />
          </IconButton>
        </Box>

        {folder && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Chip
              icon={<FolderOpen />}
              label={folder.Name}
              size="small"
              variant="outlined"
              sx={{
                height: 20,
                fontSize: '0.75rem',
                color: '#0a7dff',
                borderColor: 'rgba(10, 125, 255, 0.3)',
                '& .MuiChip-icon': {
                  fontSize: '0.9rem',
                  color: '#0a7dff',
                },
              }}
            />
          </Box>
        )}

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            lineHeight: 1.5,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {getPlainTextPreview(note.Content) || 'No content...'}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Updated {formatDate(note.Updated)}
          </Typography>
        </Box>
      </CardContent>

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
          },
        }}
      >
        <MenuItem onClick={handleEdit}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: '#f44336' }}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default NoteCard;
