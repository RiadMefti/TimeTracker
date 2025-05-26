import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Typography,
  IconButton,
  Alert,
  Chip,
} from "@mui/material";
import {
  Close as CloseIcon,
  AccessTime as TimeIcon,
  Schedule as ScheduleIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { useTimeEntryStore } from "../../stores/TimeEntryStore";
import { useProjectStore } from "../../stores/ProjectStore";
import type { TimeEntryCreate } from "../../types/TimeEntry";

interface ManualTimeEntryDialogProps {
  open: boolean;
  onClose: () => void;
}

const ManualTimeEntryDialog: React.FC<ManualTimeEntryDialogProps> = ({
  open,
  onClose,
}) => {
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<Dayjs>(dayjs());
  const [endDate, setEndDate] = useState<Dayjs>(dayjs().add(1, "hour"));
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const { createTimeEntry } = useTimeEntryStore();
  const { projects, fetchProjects } = useProjectStore();

  useEffect(() => {
    if (open) {
      fetchProjects();
      // Reset form when dialog opens
      setDescription("");
      setProjectId(null);
      setStartDate(dayjs());
      setEndDate(dayjs().add(1, "hour"));
      setError("");
    }
  }, [open, fetchProjects]);

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

    return true;
  };

  const calculateDuration = (): string => {
    const diff = endDate.diff(startDate, "minute");
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    return `${hours}h ${minutes}m`;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError("");

    try {
      const timeEntry: TimeEntryCreate = {
        Description: description.trim(),
        ProjectID: projectId,
        StartDate: startDate.toISOString(),
        EndDate: endDate.toISOString(),
      };

      await createTimeEntry(timeEntry);
      handleClose();
    } catch (error) {
      console.error("Failed to create time entry:", error);
      setError("Failed to create time entry. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartDateChange = (newValue: Dayjs | null) => {
    if (newValue) {
      setStartDate(newValue);
      // Auto-adjust end time to maintain duration if end time is before new start time
      if (endDate.isBefore(newValue)) {
        setEndDate(newValue.add(1, "hour"));
      }
    }
  };

  const handleEndDateChange = (newValue: Dayjs | null) => {
    if (newValue) {
      setEndDate(newValue);
    }
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
              minHeight: "500px",
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
            <AddIcon sx={{ color: "#0a7dff", fontSize: 24 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#ffffff" }}>
              Add Manual Time Entry
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
                mb: 2,
                backgroundColor: "rgba(244, 67, 54, 0.1)",
                border: "1px solid rgba(244, 67, 54, 0.3)",
                color: "#ffffff",
                "& .MuiAlert-icon": {
                  color: "#f44336",
                },
                flexShrink: 0,
              }}
            >
              {error}
            </Alert>
          )}

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2.5,
              flex: 1,
              pb: 2,
            }}
          >
            {/* Description */}
            <TextField
              label="Description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setError("");
              }}
              placeholder="What did you work on?"
              multiline
              minRows={2}
              maxRows={4}
              fullWidth
              required
              sx={{
                "& .MuiInputBase-root": {
                  overflow: "hidden",
                },
                "& .MuiInputBase-input": {
                  resize: "none",
                },
              }}
            />

            {/* Project Selection */}
            <FormControl fullWidth>
              <InputLabel>Project</InputLabel>
              <Select
                value={projectId || ""}
                label="Project"
                onChange={(e) =>
                  setProjectId((e.target.value as number | null) || null)
                }
              >
                <MenuItem value="">
                  <em>No Project</em>
                </MenuItem>
                {projects.map((project) => (
                  <MenuItem key={project.ID} value={project.ID}>
                    {project.Name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Time Selection */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                p: 2.5,
                backgroundColor: "rgba(26, 44, 56, 0.3)",
                borderRadius: 2,
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}
              >
                <ScheduleIcon sx={{ color: "#0a7dff", fontSize: 20 }} />
                <Typography
                  variant="subtitle2"
                  sx={{ color: "#ffffff", fontWeight: 600 }}
                >
                  Time Period
                </Typography>
                <Chip
                  label={calculateDuration()}
                  size="small"
                  sx={{
                    backgroundColor: "rgba(10, 125, 255, 0.2)",
                    color: "#0a7dff",
                    border: "1px solid rgba(10, 125, 255, 0.3)",
                    fontWeight: 600,
                  }}
                />
              </Box>

              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flexDirection: { xs: "column", sm: "row" },
                }}
              >
                <DateTimePicker
                  label="Start Time"
                  value={startDate}
                  onChange={handleStartDateChange}
                  ampm={false}
                  slotProps={{
                    textField: {
                      size: "small",
                      sx: { flex: 1 },
                    },
                    popper: {
                      // Ensure date picker popper appears above dialog
                      sx: {
                        zIndex: 1400,
                      },
                    },
                  }}
                />
                <DateTimePicker
                  label="End Time"
                  value={endDate}
                  onChange={handleEndDateChange}
                  minDateTime={startDate}
                  ampm={false}
                  slotProps={{
                    textField: {
                      size: "small",
                      sx: { flex: 1 },
                    },
                    popper: {
                      sx: {
                        zIndex: 1400,
                      },
                    },
                  }}
                />
              </Box>
            </Box>

            {/* Duration Info */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                p: 2,
                backgroundColor: "rgba(76, 175, 80, 0.1)",
                border: "1px solid rgba(76, 175, 80, 0.3)",
                borderRadius: 2,
                flexShrink: 0,
              }}
            >
              <TimeIcon sx={{ color: "#4caf50", fontSize: 20 }} />
              <Typography variant="body2" sx={{ color: "#ffffff" }}>
                Total duration: <strong>{calculateDuration()}</strong>
              </Typography>
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
            {isLoading ? "Adding..." : "Add Time Entry"}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default ManualTimeEntryDialog;
