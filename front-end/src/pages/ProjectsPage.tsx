import type { FC } from "react";
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  Chip,
  Tooltip,
  Divider,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FolderOpen as ProjectIcon,
  AccessTime as TimeIcon,
} from "@mui/icons-material";
import { useProjectStore } from "../stores/ProjectStore";
import { useTimeEntryStore } from "../stores/TimeEntryStore";
import ProjectDialog from "../components/project/ProjectDialog";
import type { Project } from "../types/Project";
import type { TimeEntry } from "../types/TimeEntry";
import dayjs from "dayjs";

const ProjectsPage: FC = () => {
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const { projects, fetchProjects, deleteProject } = useProjectStore();
  const { timeEntries, fetchTimeEntries } = useTimeEntryStore();

  useEffect(() => {
    fetchProjects();
    fetchTimeEntries();
  }, [fetchProjects, fetchTimeEntries]);

  const handleCreateProject = () => {
    setEditingProject(null);
    setProjectDialogOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setProjectDialogOpen(true);
  };

  const handleDeleteProject = (project: Project) => {
    setProjectToDelete(project);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteProject = async () => {
    if (projectToDelete) {
      await deleteProject(projectToDelete.ID.toString());
      setDeleteConfirmOpen(false);
      setProjectToDelete(null);
    }
  };

  const getColorForProject = (color: string) => {
    return color || "#0a7dff";
  };

  const getProjectTimeEntries = (projectId: number): TimeEntry[] => {
    return timeEntries.filter((entry) => entry.ProjectID === projectId);
  };

  const calculateTotalDuration = (entries: TimeEntry[]): number => {
    return entries.reduce((total, entry) => {
      const start = dayjs(entry.StartDate);
      const end = dayjs(entry.EndDate);
      return total + end.diff(start, "millisecond");
    }, 0);
  };

  const formatDuration = (milliseconds: number): string => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return "< 1m";
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        p: 3,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Typography
          variant="h6"
          component="h1"
          sx={{
            fontWeight: 600,
          }}
        >
          Projects
        </Typography>

        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleCreateProject}
          sx={{
            borderColor: "rgba(10, 125, 255, 0.5)",
            color: "#0a7dff",
            "&:hover": {
              backgroundColor: "rgba(10, 125, 255, 0.1)",
              borderColor: "#0a7dff",
            },
            fontWeight: 600,
          }}
        >
          New Project
        </Button>
      </Box>

      <Divider
        sx={{
          borderColor: "rgba(255, 255, 255, 0.1)",
          mb: 3,
        }}
      />

      {/* Projects Grid */}
      <Box
        sx={{
          flex: 1,
          overflow: "visible",
          pr: 1,
        }}
      >
        {projects.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "50%",
              textAlign: "center",
            }}
          >
            <ProjectIcon
              sx={{
                fontSize: 64,
                color: "rgba(255, 255, 255, 0.3)",
                mb: 2,
              }}
            />
            <Typography
              variant="h6"
              sx={{
                color: "rgba(255, 255, 255, 0.7)",
                mb: 1,
              }}
            >
              No projects yet
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "rgba(255, 255, 255, 0.5)",
                mb: 3,
              }}
            >
              Create your first project to start organizing your time entries
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateProject}
              sx={{
                backgroundColor: "#0a7dff",
                "&:hover": {
                  backgroundColor: "#0862cc",
                },
                fontWeight: 600,
              }}
            >
              Create Project
            </Button>
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
              gap: 3,
              // Ensure all cards have consistent height
              "& > *": {
                display: "flex",
                flexDirection: "column",
              },
            }}
          >
            {projects.map((project) => (
              <Card
                key={project.ID}
                sx={{
                  backgroundColor: "#1a2c38",
                  backgroundImage: "none",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: 3,
                  transition: "all 0.2s ease-in-out",
                  display: "flex",
                  flexDirection: "column",
                  // Fixed height for consistency
                  minHeight: "200px",
                  "&:hover": {
                    borderColor: getColorForProject(project.Color),
                    boxShadow: `0 4px 20px rgba(${parseInt(
                      getColorForProject(project.Color).slice(1, 3),
                      16
                    )}, ${parseInt(
                      getColorForProject(project.Color).slice(3, 5),
                      16
                    )}, ${parseInt(
                      getColorForProject(project.Color).slice(5, 7),
                      16
                    )}, 0.2)`,
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <CardContent
                  sx={{
                    p: 3,
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    // Ensure consistent spacing
                    justifyContent: "space-between",
                  }}
                >
                  {/* Top Section - Project Header and Description */}
                  <Box>
                    {/* Project Header */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          flex: 1,
                          minWidth: 0, // Allow text truncation
                        }}
                      >
                        <Avatar
                          sx={{
                            backgroundColor: getColorForProject(project.Color),
                            width: 40,
                            height: 40,
                            fontSize: "1.2rem",
                            fontWeight: 600,
                            flexShrink: 0, // Prevent avatar from shrinking
                          }}
                        >
                          {project.Name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Tooltip title={project.Name} placement="top">
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 600,
                                color: "#ffffff",
                                fontSize: "1.1rem",
                                mb: 0.5,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                cursor: "default",
                              }}
                            >
                              {project.Name}
                            </Typography>
                          </Tooltip>
                          <Chip
                            size="small"
                            sx={{
                              backgroundColor: `${getColorForProject(
                                project.Color
                              )}20`,
                              color: getColorForProject(project.Color),
                              border: `1px solid ${getColorForProject(
                                project.Color
                              )}40`,
                              fontSize: "0.75rem",
                              height: 20,
                            }}
                            label={`ID: ${project.ID}`}
                          />
                        </Box>
                      </Box>

                      <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
                        <Tooltip title="Edit Project">
                          <IconButton
                            size="small"
                            onClick={() => handleEditProject(project)}
                            sx={{
                              color: "rgba(255, 255, 255, 0.7)",
                              "&:hover": {
                                backgroundColor: "rgba(10, 125, 255, 0.1)",
                                color: "#0a7dff",
                              },
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Project">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteProject(project)}
                            sx={{
                              color: "rgba(255, 255, 255, 0.7)",
                              "&:hover": {
                                backgroundColor: "rgba(244, 67, 54, 0.1)",
                                color: "#f44336",
                              },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    {/* Project Description - Fixed height container */}
                    <Box
                      sx={{
                        minHeight: "48px", // Fixed height for 2 lines
                        mb: 2,
                        display: "flex",
                        alignItems: "flex-start",
                      }}
                    >
                      {project.Description ? (
                        <Typography
                          variant="body2"
                          sx={{
                            color: "rgba(255, 255, 255, 0.8)",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            lineHeight: 1.4,
                            fontSize: "0.875rem",
                          }}
                        >
                          {project.Description}
                        </Typography>
                      ) : (
                        <Typography
                          variant="body2"
                          sx={{
                            color: "rgba(255, 255, 255, 0.4)",
                            fontStyle: "italic",
                            fontSize: "0.875rem",
                          }}
                        >
                          No description
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {/* Bottom Section - Project Stats */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      p: 1.5,
                      backgroundColor: "rgba(26, 44, 56, 0.3)",
                      borderRadius: 2,
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      mt: "auto", // Push to bottom
                    }}
                  >
                    <TimeIcon
                      sx={{
                        color: getColorForProject(project.Color),
                        fontSize: 18,
                      }}
                    />
                    {(() => {
                      const projectEntries = getProjectTimeEntries(project.ID);
                      const totalDuration =
                        calculateTotalDuration(projectEntries);
                      const entryCount = projectEntries.length;

                      return (
                        <Typography
                          variant="body2"
                          sx={{
                            color: "rgba(255, 255, 255, 0.8)",
                            fontSize: "0.875rem",
                          }}
                        >
                          {entryCount === 0
                            ? "No time entries yet"
                            : `${formatDuration(
                                totalDuration
                              )} • ${entryCount} ${
                                entryCount === 1 ? "entry" : "entries"
                              }`}
                        </Typography>
                      );
                    })()}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>

      {/* Project Dialog */}
      <ProjectDialog
        open={projectDialogOpen}
        onClose={() => setProjectDialogOpen(false)}
        project={editingProject}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              backgroundColor: "#1a2c38",
              backgroundImage: "none",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 3,
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            color: "#fff",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            pb: 2,
            mb: 3,
          }}
        >
          Delete Project
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "rgba(255, 255, 255, 0.8)" }}>
            Are you sure you want to delete{" "}
            <strong style={{ color: "#fff" }}>"{projectToDelete?.Name}"</strong>
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            sx={{
              color: "rgba(255, 255, 255, 0.7)",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDeleteProject}
            variant="contained"
            sx={{
              backgroundColor: "#f44336",
              "&:hover": {
                backgroundColor: "#d32f2f",
              },
              ml: 1,
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectsPage;
