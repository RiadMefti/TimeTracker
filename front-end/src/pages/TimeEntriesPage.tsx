import type { FC } from "react";
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TablePagination,
  InputAdornment,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccessTime as TimeIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import Chronometer from "../components/chronometer/Chronometer";
import ManualTimeEntryDialog from "../components/manual-entry/ManualTimeEntryDialog";
import { useTimeEntryStore } from "../stores/TimeEntryStore";
import { useProjectStore } from "../stores/ProjectStore";
import type { Project } from "../types/Project";
import type { TimeEntry } from "../types/TimeEntry";
import dayjs from "dayjs";

const TimeEntriesPage: FC = () => {
  const [manualEntryDialogOpen, setManualEntryDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<TimeEntry | null>(null);

  // Pagination and filtering states
  const [page, setPage] = useState(0);
  const rowsPerPage = 7;
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<number | string>(
    ""
  );

  const { timeEntries, fetchTimeEntries, deleteTimeEntry } =
    useTimeEntryStore();
  const { projects, fetchProjects } = useProjectStore();

  useEffect(() => {
    fetchTimeEntries();
    fetchProjects();
  }, [fetchTimeEntries, fetchProjects]);

  const getProjectById = useCallback(
    (projectId: number | null): Project | null => {
      if (!projectId) return null;
      return projects.find((p) => p.ID === projectId) || null;
    },
    [projects]
  );

  // Filter and paginate entries
  const filteredEntries = useMemo(() => {
    const filtered = timeEntries.filter((entry) => {
      const matchesSearch =
        entry.Description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getProjectById(entry.ProjectID)
          ?.Name.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesProject =
        selectedProjectId === "" ||
        (selectedProjectId === "no-project"
          ? !entry.ProjectID
          : entry.ProjectID === selectedProjectId);

      return matchesSearch && matchesProject;
    });

    // Sort by start date (most recent first)
    return filtered.sort(
      (a, b) => dayjs(b.StartDate).valueOf() - dayjs(a.StartDate).valueOf()
    );
  }, [timeEntries, searchTerm, selectedProjectId, getProjectById]);

  const paginatedEntries = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredEntries.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredEntries, page, rowsPerPage]);

  const handleCreateEntry = () => {
    setEditingEntry(null);
    setManualEntryDialogOpen(true);
  };

  const handleEditEntry = (entry: TimeEntry) => {
    setEditingEntry(entry);
    setManualEntryDialogOpen(true);
  };

  const handleDeleteEntry = (entry: TimeEntry) => {
    setEntryToDelete(entry);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteEntry = async () => {
    if (entryToDelete) {
      await deleteTimeEntry(entryToDelete.ID);
      setDeleteConfirmOpen(false);
      setEntryToDelete(null);
    }
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleProjectFilterChange = (
    event: SelectChangeEvent<number | string>
  ) => {
    setSelectedProjectId(event.target.value as number | string);
    setPage(0);
  };

  const formatDuration = (startDate: string, endDate: string): string => {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const durationMs = end.diff(start);

    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return "< 1m";
    }
  };

  const formatDateTime = (dateString: string): string => {
    return dayjs(dateString).format("MMM DD, YYYY • h:mm A");
  };

  return (
    <Box sx={{ p: 3 }}>
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
          Time Tracking
        </Typography>

        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleCreateEntry}
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
          Add Manual Entry
        </Button>
      </Box>

      {/* Chronometer Section */}
      <Box sx={{ mb: 3 }}>
        <Chronometer variant="full" />
      </Box>

      <Divider
        sx={{
          borderColor: "rgba(255, 255, 255, 0.1)",
          mb: 3,
        }}
      />

      {/* Filters */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 3,
          alignItems: "center",
        }}
      >
        <TextField
          placeholder="Search entries..."
          value={searchTerm}
          onChange={handleSearchChange}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "rgba(255, 255, 255, 0.6)" }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{ minWidth: 300 }}
        />

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Project</InputLabel>
          <Select
            value={selectedProjectId}
            onChange={handleProjectFilterChange}
            label="Filter by Project"
            displayEmpty
            startAdornment={
              <FilterIcon sx={{ color: "rgba(255, 255, 255, 0.6)", mr: 1 }} />
            }
          >
            <MenuItem value="">All Projects</MenuItem>
            <MenuItem value="no-project">No Project</MenuItem>
            {projects.map((project) => (
              <MenuItem key={project.ID} value={project.ID}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Avatar
                    sx={{
                      backgroundColor: project.Color || "#0a7dff",
                      width: 20,
                      height: 20,
                      fontSize: "0.7rem",
                    }}
                  >
                    {project.Name.charAt(0).toUpperCase()}
                  </Avatar>
                  {project.Name}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Time Entries Table */}
      {filteredEntries.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: 400,
            textAlign: "center",
          }}
        >
          <TimeIcon
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
            {timeEntries.length === 0
              ? "No time entries yet"
              : "No entries found"}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "rgba(255, 255, 255, 0.5)",
              mb: 3,
            }}
          >
            {timeEntries.length === 0
              ? "Start the chronometer or add a manual entry to begin tracking your time"
              : "Try adjusting your search or filter criteria"}
          </Typography>
          {timeEntries.length === 0 && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateEntry}
              sx={{
                backgroundColor: "#0a7dff",
                "&:hover": {
                  backgroundColor: "#0862cc",
                },
                fontWeight: 600,
              }}
            >
              Add Entry
            </Button>
          )}
        </Box>
      ) : (
        <>
          <TableContainer
            component={Paper}
            sx={{
              backgroundColor: "#0D1D27",
              backgroundImage: "none",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: 2,
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      backgroundColor: "#223139",
                      color: "#ffffff",
                      fontWeight: 600,
                      borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
                      fontSize: "0.875rem",
                    }}
                  >
                    Description
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#223139",
                      color: "#ffffff",
                      fontWeight: 600,
                      borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
                      fontSize: "0.875rem",
                    }}
                  >
                    Project
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#223139",
                      color: "#ffffff",
                      fontWeight: 600,
                      borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
                      fontSize: "0.875rem",
                    }}
                  >
                    Duration
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#223139",
                      color: "#ffffff",
                      fontWeight: 600,
                      borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
                      fontSize: "0.875rem",
                    }}
                  >
                    Start Time
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#223139",
                      color: "#ffffff",
                      fontWeight: 600,
                      borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
                      fontSize: "0.875rem",
                      width: 120,
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedEntries.map((entry) => {
                  const project = getProjectById(entry.ProjectID);
                  return (
                    <TableRow
                      key={entry.ID}
                      sx={{
                        "&:hover": {
                          backgroundColor: "rgba(10, 125, 255, 0.08)",
                        },
                        transition: "background-color 0.2s ease",
                      }}
                    >
                      <TableCell
                        sx={{
                          color: "#ffffff",
                          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                          py: 2,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 500,
                            color: entry.Description
                              ? "#ffffff"
                              : "rgba(255, 255, 255, 0.6)",
                          }}
                        >
                          {entry.Description || "No description"}
                        </Typography>
                      </TableCell>
                      <TableCell
                        sx={{
                          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                          py: 2,
                        }}
                      >
                        {project ? (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Avatar
                              sx={{
                                backgroundColor: project.Color || "#0a7dff",
                                width: 24,
                                height: 24,
                                fontSize: "0.75rem",
                                fontWeight: 600,
                              }}
                            >
                              {project.Name.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500, color: "#ffffff" }}
                            >
                              {project.Name}
                            </Typography>
                          </Box>
                        ) : (
                          <Chip
                            size="small"
                            label="No Project"
                            sx={{
                              backgroundColor: "rgba(255, 255, 255, 0.08)",
                              color: "rgba(255, 255, 255, 0.6)",
                              fontSize: "0.75rem",
                              border: "1px solid rgba(255, 255, 255, 0.12)",
                            }}
                          />
                        )}
                      </TableCell>
                      <TableCell
                        sx={{
                          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                          py: 2,
                        }}
                      >
                        <Chip
                          size="small"
                          label={formatDuration(entry.StartDate, entry.EndDate)}
                          sx={{
                            backgroundColor: project
                              ? `${project.Color}20`
                              : "rgba(10, 125, 255, 0.2)",
                            color: project ? project.Color : "#0a7dff",
                            border: `1px solid ${
                              project ? project.Color : "#0a7dff"
                            }40`,
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "rgba(255, 255, 255, 0.7)",
                          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                          py: 2,
                        }}
                      >
                        <Typography variant="body2">
                          {formatDateTime(entry.StartDate)}
                        </Typography>
                      </TableCell>
                      <TableCell
                        sx={{
                          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                          py: 2,
                        }}
                      >
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          <Tooltip title="Edit Entry">
                            <IconButton
                              size="small"
                              onClick={() => handleEditEntry(entry)}
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
                          <Tooltip title="Delete Entry">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteEntry(entry)}
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
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            component="div"
            count={filteredEntries.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[]}
            sx={{
              color: "rgba(255, 255, 255, 0.7)",
              borderTop: "1px solid rgba(255, 255, 255, 0.12)",
              mt: 0,
              "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                {
                  color: "rgba(255, 255, 255, 0.7)",
                },
              "& .MuiTablePagination-select": {
                color: "#ffffff",
              },
              "& .MuiIconButton-root": {
                color: "rgba(255, 255, 255, 0.7)",
                "&:hover": {
                  backgroundColor: "rgba(10, 125, 255, 0.1)",
                  color: "#0a7dff",
                },
                "&.Mui-disabled": {
                  color: "rgba(255, 255, 255, 0.3)",
                },
              },
            }}
          />
        </>
      )}

      {/* Manual Time Entry Dialog */}
      <ManualTimeEntryDialog
        open={manualEntryDialogOpen}
        onClose={() => setManualEntryDialogOpen(false)}
        editingEntry={editingEntry}
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
            fontWeight: 600,
            fontSize: "1.25rem",
            mb: 2,
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          Delete Time Entry
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "rgba(255, 255, 255, 0.8)" }}>
            Are you sure you want to delete{" "}
            <strong style={{ color: "#fff" }}>
              "{entryToDelete?.Description}"
            </strong>
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
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
            onClick={confirmDeleteEntry}
            variant="contained"
            sx={{
              backgroundColor: "#f44336",
              "&:hover": {
                backgroundColor: "#d32f2f",
              },
              fontWeight: 600,
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TimeEntriesPage;
