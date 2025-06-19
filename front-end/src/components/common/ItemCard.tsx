import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  MoreVert,
  Edit,
  Delete,
  Folder,
  Description,
} from '@mui/icons-material';
import { type FC, useState } from 'react';
import type { Note } from '../../types/Note';
import type { Folder as FolderType } from '../../types/Folder';

interface ItemCardProps {
  item: Note | FolderType;
  type: 'note' | 'folder';
  onEdit: (item: Note | FolderType) => void;
  onDelete: (item: Note | FolderType) => void;
  onClick: (item: Note | FolderType) => void;
}

const ItemCard: FC<ItemCardProps> = ({
  item,
  type,
  onEdit,
  onDelete,
  onClick,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = (event: React.MouseEvent) => {
    event.stopPropagation();
    onEdit(item);
    handleMenuClose();
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    onDelete(item);
    handleMenuClose();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  };

  const getTitle = () => {
    if (type === 'folder') {
      return (item as FolderType).Name;
    }
    return (item as Note).Title;
  };

  const getUpdatedDate = () => {
    return formatDate(item.Updated);
  };

  return (
    <Card
      sx={{
        backgroundColor: 'rgba(26, 44, 56, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          backgroundColor: 'rgba(26, 44, 56, 0.9)',
          borderColor: 'rgba(10, 125, 255, 0.3)',
          transform: 'translateY(-2px)',
        },
      }}
      onClick={() => onClick(item)}
    >
      <CardContent 
        sx={{ 
          p: 3, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          textAlign: 'center',
          flex: 1,
          '&:last-child': { pb: 3 }
        }}
      >
        <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
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

        <Box sx={{ mb: 2, mt: 1 }}>
          {type === 'folder' ? (
            <Folder 
              sx={{ 
                fontSize: 48, 
                color: '#0a7dff',
                filter: 'drop-shadow(0 2px 4px rgba(10, 125, 255, 0.3))',
              }} 
            />
          ) : (
            <Description 
              sx={{ 
                fontSize: 48, 
                color: '#0a7dff',
                filter: 'drop-shadow(0 2px 4px rgba(10, 125, 255, 0.3))',
              }} 
            />
          )}
        </Box>

        <Typography 
          variant="h6" 
          component="h3" 
          sx={{ 
            fontSize: '1.1rem',
            fontWeight: 600,
            color: 'white',
            lineHeight: 1.3,
            mb: 1,
            wordBreak: 'break-word',
            flex: 1,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {getTitle()}
        </Typography>

        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{ mt: 'auto' }}
        >
          Updated {getUpdatedDate()}
        </Typography>
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

export default ItemCard;
