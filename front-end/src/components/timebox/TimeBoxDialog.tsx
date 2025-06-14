import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import {
  AccessTime as TimerIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import dayjs, { type Dayjs } from "dayjs";
import type {
  TimeBoxEntry,
  TimeBoxEntryCreate,
} from "../../types/TimeBoxEntry";
import type { Project } from "../../types/Project";
import { useTimeBoxEntryStore } from "../../stores/TimeBoxEntryStore";
import { useProjectStore } from "../../stores/ProjectStore";

interface TimeBoxDialogProps {
  open: boolean;
  onClose: () => void;
  editingEntry?: TimeBoxEntry | null;
}

const TimeBoxDialog: React.FC<TimeBoxDialogProps> = ({
  open,
  onClose,
  editingEntry,
}) => {
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<Dayjs>(dayjs());
  const [endDate, setEndDate] = useState<Dayjs>(dayjs().add(25, "minute")); // Default 25-minute Pomodoro
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const { createTimeBoxEntry, updateTimeBoxEntry } = useTimeBoxEntryStore();
  const { projects, fetchProjects } = useProjectStore();

  const isEditing = !!editingEntry;

  useEffect(() => {
    if (open) {
      fetchProjects();
      if (editingEntry) {
        // Populate form with editing entry data
        setDescription(editingEntry.Description || "");
        setProjectId(editingEntry.ProjectID);
        setStartDate(dayjs(editingEntry.StartDate));
        setEndDate(dayjs(editingEntry.EndDate));
      } else {
        // Reset form when creating new entry
        setDescription("");
        setProjectId(null);
        setStartDate(dayjs());
        setEndDate(dayjs().add(25, "minute"));
      }
      setError("");
    }
  }, [open, editingEntry, fetchProjects]);

  const handleClose = () => {
    setError("");
    onClose();
  };

  const validateForm = (): boolean => {
    if (!description.trim()) {
      setError("Description is required");
      return false;
    }

    if (endDate.isBefore(startDate)) {
      setError("End time must be after start time");
      return false;
    }

    const duration = endDate.diff(startDate, "minute");
    if (duration < 1) {
      setError("Time box must be at least 1 minute long");
      return false;
    }

    if (duration > 480) {
      // 8 hours
      setError("Time box cannot be longer than 8 hours");
      return false;
    }

    return true;
  };

  const calculateDuration = (): string => {
    const diff = endDate.diff(startDate, "minute");
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getSelectedProject = (): Project | null => {
    if (!projectId) return null;
    return projects.find((p) => p.ID === projectId) || null;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError("");

    try {
      if (isEditing && editingEntry) {
        // Update existing entry
        const updatedEntry: TimeBoxEntry = {
          ID: editingEntry.ID,
          Description: description.trim(),
          ProjectID: projectId,
          StartDate: startDate.toISOString(),
          EndDate: endDate.toISOString(),
        };
        await updateTimeBoxEntry(updatedEntry);
      } else {
        // Create new entry
        const timeBoxEntry: TimeBoxEntryCreate = {
          Description: description.trim(),
          ProjectID: projectId,
          StartDate: startDate.toISOString(),
          EndDate: endDate.toISOString(),
        };
        await createTimeBoxEntry(timeBoxEntry);
      }
      handleClose();
    } catch (error) {
      console.error(
        `Failed to ${isEditing ? "update" : "create"} time box:`,
        error
      );
      setError(
        `Failed to ${
          isEditing ? "update" : "create"
        } time box. Please try again.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartDateChange = (newValue: Dayjs | null) => {
    if (newValue) {
      setStartDate(newValue);
      // Auto-adjust end time to maintain duration if end time is before new start time
      if (endDate.isBefore(newValue)) {
        setEndDate(newValue.add(25, "minute"));
      }
    }
  };

  const handleEndDateChange = (newValue: Dayjs | null) => {
    if (newValue) {
      setEndDate(newValue);
    }
  };

  const setQuickDuration = (minutes: number) => {
    setEndDate(startDate.add(minutes, "minute"));
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
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
              minHeight: "600px",
              maxHeight: "90vh",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 1,
            mb: 2,
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {isEditing ? (
              <EditIcon sx={{ color: "#0a7dff", fontSize: 24 }} />
            ) : (
              <AddIcon sx={{ color: "#0a7dff", fontSize: 24 }} />
            )}
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#ffffff" }}>
              {isEditing ? "Edit Time Box" : "Create Time Box"}
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

        <DialogContent
          sx={{
            p: 3,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "visible",
          }}
        >
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                backgroundColor: "rgba(244, 67, 54, 0.1)",
                border: "1px solid rgba(244, 67, 54, 0.2)",
                color: "#ffffff",
                "& .MuiAlert-icon": {
                  color: "#f44336",
                },
              }}
            >
              {error}
            </Alert>
          )}

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
              flex: 1,
              pb: 2,
            }}
          >
            <TextField
              label="What will you work on?"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setError("");
              }}
              placeholder="Focus session description..."
              multiline
              minRows={2}
              maxRows={4}
              fullWidth
              required
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
              }}
            />

            <FormControl fullWidth>
              <InputLabel
                sx={{
                  color: "rgba(255, 255, 255, 0.7)",
                  "&.Mui-focused": {
                    color: "#0a7dff",
                  },
                }}
              >
                Project (Optional)
              </InputLabel>
              <Select
                value={projectId?.toString() || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setProjectId(value === "" ? null : Number(value));
                }}
                sx={{
                  color: "#ffffff",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255, 255, 255, 0.2)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255, 255, 255, 0.3)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#0a7dff",
                  },
                  "& .MuiSvgIcon-root": {
                    color: "rgba(255, 255, 255, 0.7)",
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backgroundColor: "#1a2c38",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: 2,
                      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
                      maxHeight: 200,
                    },
                  },
                }}
              >
                <MenuItem
                  value=""
                  sx={{
                    color: "rgba(255, 255, 255, 0.7)",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                    },
                  }}
                >
                  No Project
                </MenuItem>
                {projects.map((project) => (
                  <MenuItem
                    key={project.ID}
                    value={project.ID}
                    sx={{
                      color: "#ffffff",
                      "&:hover": {
                        backgroundColor: "rgba(10, 125, 255, 0.1)",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          backgroundColor: project.Color || "#0a7dff",
                        }}
                      />
                      {project.Name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Quick Duration Buttons */}
            <Box>
              <Typography
                variant="body2"
                sx={{ color: "rgba(255, 255, 255, 0.7)", mb: 1 }}
              >
                Quick Durations
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {[15, 25, 30, 45, 60, 90].map((minutes) => (
                  <Chip
                    key={minutes}
                    label={`${minutes}m`}
                    onClick={() => setQuickDuration(minutes)}
                    sx={{
                      backgroundColor: "rgba(10, 125, 255, 0.1)",
                      color: "#0a7dff",
                      border: "1px solid rgba(10, 125, 255, 0.3)",
                      "&:hover": {
                        backgroundColor: "rgba(10, 125, 255, 0.2)",
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <DateTimePicker
                label="Start Time"
                ampm={false}
                value={startDate}
                onChange={handleStartDateChange}
                sx={{
                  flex: 1,
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
                  "& .MuiSvgIcon-root": {
                    color: "rgba(255, 255, 255, 0.7)",
                  },
                }}
              />
              <DateTimePicker
                label="End Time"
                value={endDate}
                ampm={false}
                onChange={handleEndDateChange}
                sx={{
                  flex: 1,
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
                  "& .MuiSvgIcon-root": {
                    color: "rgba(255, 255, 255, 0.7)",
                  },
                }}
              />
            </Box>

            {/* Duration Display */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                p: 2,
                backgroundColor: "rgba(10, 125, 255, 0.1)",
                borderRadius: 2,
                border: "1px solid rgba(10, 125, 255, 0.2)",
              }}
            >
              <TimerIcon sx={{ color: "#0a7dff", fontSize: 20 }} />
              <Typography sx={{ color: "#ffffff", fontWeight: 500 }}>
                Duration: {calculateDuration()}
              </Typography>
              {getSelectedProject() && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    ml: "auto",
                  }}
                >
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      backgroundColor: getSelectedProject()?.Color || "#0a7dff",
                    }}
                  />
                  <Typography
                    sx={{
                      color: "rgba(255, 255, 255, 0.8)",
                      fontSize: "0.875rem",
                    }}
                  >
                    {getSelectedProject()?.Name}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            p: 3,
            pt: 1.5,
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            gap: 2,
            flexShrink: 0,
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
              ? "Saving..."
              : isEditing
              ? "Update Time Box"
              : "Create Time Box"}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default TimeBoxDialog;
