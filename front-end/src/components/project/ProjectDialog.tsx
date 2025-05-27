import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Alert,
  Avatar,
} from "@mui/material";
import {
  Close as CloseIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Palette as PaletteIcon,
} from "@mui/icons-material";
import { useProjectStore } from "../../stores/ProjectStore";
import type { Project, ProjectCreate } from "../../types/Project";

interface ProjectDialogProps {
  open: boolean;
  onClose: () => void;
  project?: Project | null;
}

const PROJECT_COLORS = [
  "#0a7dff", // Blue
  "#4caf50", // Green
  "#ff9800", // Orange
  "#f44336", // Red
  "#9c27b0", // Purple
  "#2196f3", // Light Blue
  "#ff5722", // Deep Orange
  "#795548", // Brown
  "#607d8b", // Blue Grey
  "#e91e63", // Pink
  "#00bcd4", // Cyan
  "#8bc34a", // Light Green
];

const ProjectDialog: React.FC<ProjectDialogProps> = ({
  open,
  onClose,
  project,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const { createProject, updateProject } = useProjectStore();

  const isEditing = !!project;

  useEffect(() => {
    if (open) {
      if (project) {
        setName(project.Name);
        setDescription(project.Description);
        setColor(project.Color || PROJECT_COLORS[0]);
      } else {
        setName("");
        setDescription("");
        setColor(PROJECT_COLORS[0]);
      }
      setError("");
    }
  }, [open, project]);

  const handleClose = () => {
    setError("");
    onClose();
  };

  const validateForm = (): boolean => {
    if (!name.trim()) {
      setError("Project name is required");
      return false;
    }

    if (name.trim().length < 2) {
      setError("Project name must be at least 2 characters");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError("");

    try {
      if (isEditing && project) {
        const updatedProject: Project = {
          ...project,
          Name: name.trim(),
          Description: description.trim(),
          Color: color,
        };
        await updateProject(updatedProject);
      } else {
        const newProject: ProjectCreate = {
          Name: name.trim(),
          Description: description.trim(),
          Color: color,
        };
        await createProject(newProject);
      }
      handleClose();
    } catch (error) {
      console.error("Failed to save project:", error);
      setError("Failed to save project. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            backgroundColor: "#1a2c38",
            backgroundImage: "none",
            border: "1px solid rgba(10, 125, 255, 0.2)",
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 2.5,
          pb: 2,
          mb: 2,
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {isEditing ? (
            <EditIcon sx={{ color: "#0a7dff", fontSize: 24 }} />
          ) : (
            <AddIcon sx={{ color: "#0a7dff", fontSize: 24 }} />
          )}
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#ffffff" }}>
            {isEditing ? "Edit Project" : "Create New Project"}
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          sx={{
            color: "rgba(255, 255, 255, 0.7)",
            "&:hover": {
              backgroundColor: "rgba(244, 67, 54, 0.1)",
              color: "#f44336",
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2.5, pt: 2 }}>
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 2.5,
              backgroundColor: "rgba(244, 67, 54, 0.1)",
              border: "1px solid rgba(244, 67, 54, 0.3)",
              color: "#ffffff",
              "& .MuiAlert-icon": {
                color: "#f44336",
              },
            }}
          >
            {error}
          </Alert>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Project Preview */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              p: 2,
              backgroundColor: "rgba(26, 44, 56, 0.3)",
              borderRadius: 2,
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <Avatar
              sx={{
                backgroundColor: color,
                width: 44,
                height: 44,
                fontSize: "1.25rem",
                fontWeight: 600,
              }}
            >
              {name.charAt(0).toUpperCase() || "P"}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  color: "#ffffff",
                  mb: 0.25,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {name || "Project Name"}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "rgba(255, 255, 255, 0.7)",
                  fontSize: "0.875rem",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {description || "Project description..."}
              </Typography>
            </Box>
          </Box>

          {/* Project Name */}
          <TextField
            label="Project Name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            placeholder="Enter project name"
            fullWidth
            required
            slotProps={{
              htmlInput: { maxLength: 50 },
            }}
            helperText={`${name.length}/50 characters`}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.2)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.3)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#0a7dff",
                },
              },
              "& .MuiInputLabel-root": {
                color: "rgba(255, 255, 255, 0.7)",
                "&.Mui-focused": {
                  color: "#0a7dff",
                },
              },
              "& .MuiInputBase-input": {
                color: "#ffffff",
              },
              "& .MuiFormHelperText-root": {
                color: "rgba(255, 255, 255, 0.5)",
              },
            }}
          />

          {/* Project Description */}
          <TextField
            label="Description"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setError("");
            }}
            placeholder="Enter project description (optional)"
            multiline
            minRows={2}
            maxRows={4}
            fullWidth
            slotProps={{
              htmlInput: { maxLength: 200 },
            }}
            helperText={`${description.length}/200 characters`}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.2)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.3)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#0a7dff",
                },
                overflow: "hidden",
              },
              "& .MuiInputLabel-root": {
                color: "rgba(255, 255, 255, 0.7)",
                "&.Mui-focused": {
                  color: "#0a7dff",
                },
              },
              "& .MuiInputBase-input": {
                color: "#ffffff",
                resize: "none",
              },
              "& .MuiFormHelperText-root": {
                color: "rgba(255, 255, 255, 0.5)",
              },
            }}
          />

          {/* Color Selection */}
          <Box>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}
            >
              <PaletteIcon sx={{ color: "#0a7dff", fontSize: 20 }} />
              <Typography
                variant="subtitle2"
                sx={{ color: "#ffffff", fontWeight: 600 }}
              >
                Project Color
              </Typography>
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.25 }}>
              {PROJECT_COLORS.map((projectColor) => (
                <Box
                  key={projectColor}
                  onClick={() => setColor(projectColor)}
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    backgroundColor: projectColor,
                    cursor: "pointer",
                    border:
                      color === projectColor
                        ? "3px solid #ffffff"
                        : "2px solid rgba(255, 255, 255, 0.2)",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "scale(1.08)",
                      border: "3px solid rgba(255, 255, 255, 0.8)",
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          p: 2.5,
          pt: 1.5,
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          gap: 1.5,
          justifyContent: "flex-end",
        }}
      >
        <Button
          onClick={handleClose}
          sx={{
            color: "rgba(255, 255, 255, 0.7)",
            borderColor: "rgba(255, 255, 255, 0.2)",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              borderColor: "rgba(255, 255, 255, 0.3)",
            },
          }}
          variant="outlined"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          variant="contained"
          sx={{
            backgroundColor: "#0a7dff",
            "&:hover": {
              backgroundColor: "#0862cc",
            },
            "&:disabled": {
              backgroundColor: "rgba(10, 125, 255, 0.3)",
            },
            fontWeight: 600,
            px: 3,
          }}
        >
          {isLoading
            ? isEditing
              ? "Updating..."
              : "Creating..."
            : isEditing
            ? "Update Project"
            : "Create Project"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectDialog;
