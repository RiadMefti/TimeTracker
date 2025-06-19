import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Heading from '@tiptap/extension-heading';
import {
  Box,
  IconButton,
  Paper,
  Toolbar,
  Tooltip,
  Typography,
  Divider,
  Select,
  MenuItem,
  FormControl,
  ButtonGroup,
  Popover,
  TextField,
  Button,
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  Code,
  Undo,
  Redo,
  FormatColorText,
  FormatColorFill,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  FormatAlignJustify,
} from '@mui/icons-material';
import { type FC, useEffect, useState } from 'react';

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

const TipTapEditor: FC<TipTapEditorProps> = ({
  content,
  onChange,
  placeholder = "Start writing...",
  readOnly = false,
}) => {
  const [colorPickerAnchor, setColorPickerAnchor] = useState<HTMLElement | null>(null);
  const [highlightPickerAnchor, setHighlightPickerAnchor] = useState<HTMLElement | null>(null);
  const [currentTextColor, setCurrentTextColor] = useState('#ffffff');
  const [currentHighlightColor, setCurrentHighlightColor] = useState('#ffff00');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false, // We'll use our custom heading extension
      }),
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
      }),
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount,
      TextStyle,
      Color.configure({
        types: ['textStyle'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      // Only update if content has actually changed to avoid cursor issues
      editor.commands.setContent(content, false);
    }
  }, [content, editor]);

  // Update editor editable state when readOnly changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(!readOnly);
    }
  }, [editor, readOnly]);

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({ 
    onClick, 
    isActive, 
    icon, 
    tooltip 
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    icon: React.ReactNode; 
    tooltip: string; 
  }) => (
    <Tooltip title={tooltip}>
      <IconButton
        onClick={onClick}
        size="small"
        sx={{
          color: isActive ? '#0a7dff' : 'inherit',
          backgroundColor: isActive ? 'rgba(10, 125, 255, 0.1)' : 'transparent',
          '&:hover': {
            backgroundColor: isActive 
              ? 'rgba(10, 125, 255, 0.2)' 
              : 'rgba(255, 255, 255, 0.08)',
          },
        }}
      >
        {icon}
      </IconButton>
    </Tooltip>
  );

  const predefinedColors = [
    '#ffffff', '#000000', '#0a7dff', '#f44336', '#4caf50', 
    '#ff9800', '#9c27b0', '#607d8b', '#e91e63', '#00bcd4'
  ];

  const handleColorChange = (color: string) => {
    editor.chain().focus().setColor(color).run();
    setCurrentTextColor(color);
    setColorPickerAnchor(null);
  };

  const handleHighlightChange = (color: string) => {
    editor.chain().focus().setHighlight({ color }).run();
    setCurrentHighlightColor(color);
    setHighlightPickerAnchor(null);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: 2,
        overflow: 'hidden',
        backgroundColor: 'rgba(26, 44, 56, 0.7)',
      }}
    >
      {!readOnly && (
        <>
          <Toolbar
            variant="dense"
            sx={{
              minHeight: 48,
              px: 1,
              backgroundColor: 'rgba(26, 44, 56, 0.9)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 0.5,
            }}
          >
            {/* Heading Selector */}
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <Select
                value={
                  editor.isActive('heading', { level: 1 }) ? 'h1' :
                  editor.isActive('heading', { level: 2 }) ? 'h2' :
                  editor.isActive('heading', { level: 3 }) ? 'h3' :
                  editor.isActive('heading', { level: 4 }) ? 'h4' :
                  editor.isActive('heading', { level: 5 }) ? 'h5' :
                  editor.isActive('heading', { level: 6 }) ? 'h6' :
                  'paragraph'
                }
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'paragraph') {
                    editor.chain().focus().setParagraph().run();
                  } else {
                    const level = parseInt(value.charAt(1)) as 1 | 2 | 3 | 4 | 5 | 6;
                    editor.chain().focus().toggleHeading({ level }).run();
                  }
                }}
                sx={{
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '& .MuiSvgIcon-root': {
                    color: 'white',
                  },
                }}
              >
                <MenuItem value="paragraph">Paragraph</MenuItem>
                <MenuItem value="h1">Heading 1</MenuItem>
                <MenuItem value="h2">Heading 2</MenuItem>
                <MenuItem value="h3">Heading 3</MenuItem>
                <MenuItem value="h4">Heading 4</MenuItem>
                <MenuItem value="h5">Heading 5</MenuItem>
                <MenuItem value="h6">Heading 6</MenuItem>
              </Select>
            </FormControl>

            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

            {/* Text Formatting */}
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
              icon={<FormatBold />}
              tooltip="Bold"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
              icon={<FormatItalic />}
              tooltip="Italic"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive('strike')}
              icon={<FormatUnderlined />}
              tooltip="Strikethrough"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCode().run()}
              isActive={editor.isActive('code')}
              icon={<Code />}
              tooltip="Inline Code"
            />

            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

            {/* Text Color */}
            <Tooltip title="Text Color">
              <IconButton
                size="small"
                onClick={(e) => setColorPickerAnchor(e.currentTarget)}
                sx={{
                  color: currentTextColor,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  },
                }}
              >
                <FormatColorText />
              </IconButton>
            </Tooltip>

            {/* Highlight Color */}
            <Tooltip title="Highlight">
              <IconButton
                size="small"
                onClick={(e) => setHighlightPickerAnchor(e.currentTarget)}
                sx={{
                  color: editor.isActive('highlight') ? '#0a7dff' : 'inherit',
                  backgroundColor: editor.isActive('highlight') ? 'rgba(10, 125, 255, 0.1)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  },
                }}
              >
                <FormatColorFill />
              </IconButton>
            </Tooltip>

            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

            {/* Text Alignment */}
            <ButtonGroup size="small">
              <ToolbarButton
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                isActive={editor.isActive({ textAlign: 'left' })}
                icon={<FormatAlignLeft />}
                tooltip="Align Left"
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                isActive={editor.isActive({ textAlign: 'center' })}
                icon={<FormatAlignCenter />}
                tooltip="Align Center"
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                isActive={editor.isActive({ textAlign: 'right' })}
                icon={<FormatAlignRight />}
                tooltip="Align Right"
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                isActive={editor.isActive({ textAlign: 'justify' })}
                icon={<FormatAlignJustify />}
                tooltip="Justify"
              />
            </ButtonGroup>

            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            
            {/* Lists and Quotes */}
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive('bulletList')}
              icon={<FormatListBulleted />}
              tooltip="Bullet List"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive('orderedList')}
              icon={<FormatListNumbered />}
              tooltip="Numbered List"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive('blockquote')}
              icon={<FormatQuote />}
              tooltip="Quote"
            />
            
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            
            {/* Undo/Redo */}
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              icon={<Undo />}
              tooltip="Undo"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              icon={<Redo />}
              tooltip="Redo"
            />
            
            <Box sx={{ flexGrow: 1 }} />
            
            <Typography variant="caption" color="text.secondary">
              {editor.storage.characterCount.words()} words • {editor.storage.characterCount.characters()} characters
            </Typography>
          </Toolbar>
        </>
      )}
      
      <Box
        sx={{
          p: 2,
          minHeight: readOnly ? 'auto' : 200,
          '& .ProseMirror': {
            outline: 'none',
            color: 'white',
            '& p': {
              margin: '0.5rem 0',
              '&:first-of-type': {
                marginTop: 0,
              },
              '&:last-of-type': {
                marginBottom: 0,
              },
            },
            '& h1, & h2, & h3, & h4, & h5, & h6': {
              color: '#0a7dff',
              fontWeight: 600,
              margin: '1rem 0 0.5rem',
              lineHeight: 1.2,
              '&:first-of-type': {
                marginTop: 0,
              },
            },
            '& h1': {
              fontSize: '2rem',
            },
            '& h2': {
              fontSize: '1.75rem',
            },
            '& h3': {
              fontSize: '1.5rem',
            },
            '& h4': {
              fontSize: '1.25rem',
            },
            '& h5': {
              fontSize: '1.1rem',
            },
            '& h6': {
              fontSize: '1rem',
            },
            '& ul, & ol': {
              paddingLeft: '1.5rem',
              margin: '0.5rem 0',
            },
            '& li': {
              margin: '0.25rem 0',
            },
            '& blockquote': {
              borderLeft: '3px solid #0a7dff',
              paddingLeft: '1rem',
              margin: '1rem 0',
              fontStyle: 'italic',
              color: 'rgba(255, 255, 255, 0.8)',
            },
            '& code': {
              backgroundColor: 'rgba(10, 125, 255, 0.1)',
              color: '#0a7dff',
              padding: '0.2rem 0.4rem',
              borderRadius: '4px',
              fontSize: '0.9em',
            },
            '& pre': {
              backgroundColor: 'rgba(26, 44, 56, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              padding: '1rem',
              margin: '1rem 0',
              overflow: 'auto',
              '& code': {
                backgroundColor: 'transparent',
                color: 'white',
                padding: 0,
              },
            },
            '& p.is-editor-empty:first-of-type::before': {
              content: 'attr(data-placeholder)',
              float: 'left',
              color: 'rgba(255, 255, 255, 0.4)',
              pointerEvents: 'none',
              height: 0,
            },
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>

      {/* Color Picker Popover */}
      <Popover
        open={Boolean(colorPickerAnchor)}
        anchorEl={colorPickerAnchor}
        onClose={() => setColorPickerAnchor(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            backgroundColor: '#1a2c38',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            p: 2,
          },
        }}
      >
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Text Color
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1 }}>
            {predefinedColors.map((color) => (
              <Box
                key={color}
                onClick={() => handleColorChange(color)}
                sx={{
                  width: 24,
                  height: 24,
                  backgroundColor: color,
                  border: '2px solid',
                  borderColor: currentTextColor === color ? '#0a7dff' : 'rgba(255, 255, 255, 0.2)',
                  borderRadius: 1,
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: '#0a7dff',
                  },
                }}
              />
            ))}
          </Box>
          <TextField
            label="Custom Color"
            type="color"
            value={currentTextColor}
            onChange={(e) => handleColorChange(e.target.value)}
            size="small"
            sx={{ mt: 2, width: '100%' }}
          />
        </Box>
      </Popover>

      {/* Highlight Color Picker Popover */}
      <Popover
        open={Boolean(highlightPickerAnchor)}
        anchorEl={highlightPickerAnchor}
        onClose={() => setHighlightPickerAnchor(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            backgroundColor: '#1a2c38',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            p: 2,
          },
        }}
      >
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Highlight Color
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1 }}>
            {predefinedColors.map((color) => (
              <Box
                key={color}
                onClick={() => handleHighlightChange(color)}
                sx={{
                  width: 24,
                  height: 24,
                  backgroundColor: color,
                  border: '2px solid',
                  borderColor: currentHighlightColor === color ? '#0a7dff' : 'rgba(255, 255, 255, 0.2)',
                  borderRadius: 1,
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: '#0a7dff',
                  },
                }}
              />
            ))}
          </Box>
          <TextField
            label="Custom Highlight"
            type="color"
            value={currentHighlightColor}
            onChange={(e) => handleHighlightChange(e.target.value)}
            size="small"
            sx={{ mt: 2, width: '100%' }}
          />
          <Button
            onClick={() => {
              editor.chain().focus().unsetHighlight().run();
              setHighlightPickerAnchor(null);
            }}
            size="small"
            sx={{ mt: 1, width: '100%' }}
          >
            Remove Highlight
          </Button>
        </Box>
      </Popover>
    </Paper>
  );
};

export default TipTapEditor;
