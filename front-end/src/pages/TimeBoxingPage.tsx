import React, { useEffect, useState, useMemo, useCallback } from "react";
import type { FC } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  Chip,
  Popover,
} from "@mui/material";
import {
  Add as AddIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
} from "@mui/icons-material";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { type Dayjs } from "dayjs";
import { useTimeBoxEntryStore } from "../stores/TimeBoxEntryStore";
import { useProjectStore } from "../stores/ProjectStore";
import TimeBoxDialog from "../components/timebox/TimeBoxDialog";
import type { TimeBoxEntry } from "../types/TimeBoxEntry";
import type { Project } from "../types/Project";

interface TimeSlot {
  hour: number;
  entries: TimeBoxEntry[];
}

const TimeBoxingPage: FC = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [timeBoxDialogOpen, setTimeBoxDialogOpen] = useState(false);
  const [editingTimeBox, setEditingTimeBox] = useState<TimeBoxEntry | null>(
    null
  );
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [timeBoxToDelete, setTimeBoxToDelete] = useState<TimeBoxEntry | null>(
    null
  );
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [calendarAnchorEl, setCalendarAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [selectedTimeBox, setSelectedTimeBox] = useState<TimeBoxEntry | null>(
    null
  );
  const [timeRange, setTimeRange] = useState<[number, number]>([4, 22]); // 4am to 10pm

  const { timeBoxEntries, fetchTimeBoxEntries, deleteTimeBoxEntry } =
    useTimeBoxEntryStore();
  const { projects, fetchProjects } = useProjectStore();

  useEffect(() => {
    fetchTimeBoxEntries();
    fetchProjects();
  }, [fetchTimeBoxEntries, fetchProjects]);

  const getProjectById = useCallback(
    (projectId: number | null): Project | null => {
      if (!projectId) return null;
      return projects.find((p) => p.ID === projectId) || null;
    },
    [projects]
  );

  // Filter entries for selected date
  const dayEntries = useMemo(() => {
    return timeBoxEntries.filter((entry) => {
      return dayjs(entry.StartDate).isSame(selectedDate, "day");
    });
  }, [timeBoxEntries, selectedDate]);

  // Create time slots and assign entries to their starting hour only
  const timeSlots: TimeSlot[] = useMemo(() => {
    const slots: TimeSlot[] = [];

    // Create all hour slots first
    for (let hour = timeRange[0]; hour <= timeRange[1]; hour++) {
      slots.push({
        hour,
        entries: [],
      });
    }

    // Assign each entry to its starting hour slot only
    dayEntries.forEach((entry) => {
      const startHour = dayjs(entry.StartDate).hour();
      const slot = slots.find((s) => s.hour === startHour);
      if (slot) {
        slot.entries.push(entry);
      }
    });

    return slots;
  }, [dayEntries, timeRange]);

  const handleCreateTimeBox = () => {
    setEditingTimeBox(null);
    setTimeBoxDialogOpen(true);
  };

  const handleEditTimeBox = (timeBox: TimeBoxEntry) => {
    setEditingTimeBox(timeBox);
    setTimeBoxDialogOpen(true);
    handleCloseMenu();
  };

  const handleDeleteTimeBox = (timeBox: TimeBoxEntry) => {
    setTimeBoxToDelete(timeBox);
    setDeleteConfirmOpen(true);
    handleCloseMenu();
  };

  const confirmDeleteTimeBox = async () => {
    if (timeBoxToDelete) {
      await deleteTimeBoxEntry(timeBoxToDelete.ID);
      setDeleteConfirmOpen(false);
      setTimeBoxToDelete(null);
    }
  };

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    timeBox: TimeBoxEntry
  ) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedTimeBox(timeBox);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setSelectedTimeBox(null);
  };

  const handleCalendarClick = (event: React.MouseEvent<HTMLElement>) => {
    setCalendarAnchorEl(event.currentTarget);
  };

  const handleCloseCalendar = () => {
    setCalendarAnchorEl(null);
  };

  const handleDateChange = (newDate: Dayjs | null) => {
    if (newDate) {
      setSelectedDate(newDate);
      handleCloseCalendar();
    }
  };

  const navigateDate = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setSelectedDate(selectedDate.subtract(1, "day"));
    } else {
      setSelectedDate(selectedDate.add(1, "day"));
    }
  };

  const goToToday = () => {
    setSelectedDate(dayjs());
  };

  const formatTime = (dateString: string): string => {
    return dayjs(dateString).format("h:mm A");
  };  const getTimeSlotPosition = (
    entry: TimeBoxEntry,
    slotHour: number
  ): { top: number; height: number; isVisible: boolean } => {
    const startTime = dayjs(entry.StartDate);
    const endTime = dayjs(entry.EndDate);
    const startHour = startTime.hour();

    // Only show the entry in its starting hour slot
    if (slotHour !== startHour) {
      return { top: 0, height: 0, isVisible: false };
    }

    const startMinute = startTime.minute();

    // Calculate the total duration in minutes
    const totalMinutes = endTime.diff(startTime, "minute");

    // Calculate top position within the starting hour slot (as percentage)
    const top = (startMinute / 60) * 100;

    // Calculate height based on duration - spans multiple slots if needed
    const heightInHours = totalMinutes / 60;
    
    // Height as percentage - each hour is 100%
    const height = heightInHours * 100;

    return {
      top: top,
      height: height,
      isVisible: true,
    };
  };

  const isToday = selectedDate.isSame(dayjs(), "day");
  const totalDayEntries = dayEntries.length;
  const totalDayDuration = dayEntries.reduce((total, entry) => {
    const start = dayjs(entry.StartDate);
    const end = dayjs(entry.EndDate);
    return total + end.diff(start, "minute");
  }, 0);

  // Calculate dynamic slot height based on time range
  const totalHours = timeRange[1] - timeRange[0] + 1;
  const slotHeight = Math.max(40, Math.min(120, 600 / totalHours));

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          backgroundColor: "#0D1D27",
          minHeight: "100vh",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 3,
            pb: 2,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                color: "#ffffff",
                mb: 1,
              }}
            >
              Time Boxing
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "rgba(255, 255, 255, 0.7)",
              }}
            >
              Plan and organize your focused work sessions
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateTimeBox}
            sx={{
              backgroundColor: "#0a7dff",
              "&:hover": {
                backgroundColor: "#0862cc",
              },
              fontWeight: 600,
              px: 3,
              py: 1.5,
            }}
          >
            New Time Box
          </Button>
        </Box>

        {/* Main Content - Two Column Layout */}
        <Box
          sx={{
            display: "flex",
            gap: 3,
            px: 3,
            pb: 3,
          }}
        >
          {/* Left Column - Time Grid */}
          <Box
            sx={{
              flex: 2,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
            }}
          >
            <Paper
              sx={{
                backgroundColor: "#1a2c38",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: 2,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Always show time grid, even when empty */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {timeSlots.map((slot) => (
                    <Box
                      key={slot.hour}
                      sx={{
                        display: "flex",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                        minHeight: slotHeight,
                        height: slotHeight,
                        "&:last-child": {
                          borderBottom: "none",
                        },
                      }}
                    >
                      {/* Hour Label */}
                      <Box
                        sx={{
                          width: 100,
                          p: 2,
                          borderRight: "1px solid rgba(255, 255, 255, 0.1)",
                          display: "flex",
                          alignItems: "flex-start",
                          backgroundColor: "rgba(255, 255, 255, 0.02)",
                          flexShrink: 0,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: "rgba(255, 255, 255, 0.7)",
                            fontWeight: 500,
                          }}
                        >
                          {slot.hour === 0
                            ? "12 AM"
                            : slot.hour < 12
                            ? `${slot.hour} AM`
                            : slot.hour === 12
                            ? "12 PM"
                            : `${slot.hour - 12} PM`}
                        </Typography>
                      </Box>

                      {/* Time Slot Content */}
                      <Box
                        sx={{
                          flex: 1,
                          position: "relative",
                          minHeight: slotHeight,
                          height: slotHeight,
                        }}
                      >
                        {slot.entries.map((entry) => {
                          const project = getProjectById(entry.ProjectID);
                          const position = getTimeSlotPosition(
                            entry,
                            slot.hour
                          );

                          if (!position.isVisible) return null;

                          return (
                            <Box
                              key={entry.ID}
                              sx={{
                                position: "absolute",
                                top: `${position.top}%`,
                                height: `${position.height}%`,
                                left: 8,
                                right: 8,
                                backgroundColor: project?.Color || "#0a7dff",
                                borderRadius: 1,
                                p: 1,
                                cursor: "pointer",
                                transition: "all 0.2s ease-in-out",
                                zIndex: 10,
                                "&:hover": {
                                  transform: "scale(1.02)",
                                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                                  zIndex: 20,
                                },
                                minHeight: 40,
                                overflow: "hidden",
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  mb: 0.5,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: "#ffffff",
                                    fontWeight: 600,
                                    fontSize: "0.75rem",
                                  }}
                                >
                                  {formatTime(entry.StartDate)} -{" "}
                                  {formatTime(entry.EndDate)}
                                </Typography>
                                <IconButton
                                  size="small"
                                  onClick={(e) => handleMenuClick(e, entry)}
                                  sx={{
                                    color: "rgba(255, 255, 255, 0.8)",
                                    p: 0.25,
                                    "&:hover": {
                                      backgroundColor:
                                        "rgba(255, 255, 255, 0.1)",
                                    },
                                  }}
                                >
                                  <MoreIcon fontSize="small" />
                                </IconButton>
                              </Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: "rgba(255, 255, 255, 0.9)",
                                  fontSize: "0.75rem",
                                  lineHeight: 1.2,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                }}
                              >
                                {entry.Description}
                              </Typography>
                              {project && (
                                <Chip
                                  label={project.Name}
                                  size="small"
                                  sx={{
                                    mt: 0.5,
                                    height: 16,
                                    fontSize: "0.6rem",
                                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                                    color: "#ffffff",
                                    "& .MuiChip-label": {
                                      px: 0.5,
                                    },
                                  }}
                                />
                              )}
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                  ))}
                </Box>
            </Paper>
          </Box>

          {/* Right Column - Settings & Controls */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 3,
              minWidth: 320,
              minHeight: 0,
              overflow: "auto",
            }}
          >
            {/* Date Navigation */}
            <Paper
              sx={{
                backgroundColor: "#1a2c38",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: 2,
                p: 3,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: "#ffffff",
                  mb: 2,
                  fontWeight: 600,
                }}
              >
                Date & Navigation
              </Typography>

              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <IconButton
                  onClick={() => navigateDate("prev")}
                  sx={{
                    color: "rgba(255, 255, 255, 0.7)",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                    },
                  }}
                >
                  <ChevronLeftIcon />
                </IconButton>

                <Button
                  onClick={handleCalendarClick}
                  sx={{
                    color: "#ffffff",
                    fontWeight: 600,
                    textTransform: "none",
                    flex: 1,
                    justifyContent: "center",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                    },
                  }}
                  startIcon={<CalendarIcon />}
                >
                  {selectedDate.format("MMM D, YYYY")}
                </Button>

                <IconButton
                  onClick={() => navigateDate("next")}
                  sx={{
                    color: "rgba(255, 255, 255, 0.7)",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                    },
                  }}
                >
                  <ChevronRightIcon />
                </IconButton>
              </Box>

              {isToday && (
                <Chip
                  label="Today"
                  size="small"
                  sx={{
                    backgroundColor: "rgba(10, 125, 255, 0.2)",
                    color: "#0a7dff",
                    mb: 2,
                  }}
                />
              )}

              {!isToday && (
                <Button
                  onClick={goToToday}
                  startIcon={<TodayIcon />}
                  sx={{
                    color: "#0a7dff",
                    "&:hover": {
                      backgroundColor: "rgba(10, 125, 255, 0.1)",
                    },
                    mb: 2,
                  }}
                >
                  Go to Today
                </Button>
              )}
            </Paper>

            {/* Time Range */}
            <Paper
              sx={{
                backgroundColor: "#1a2c38",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: 2,
                p: 3,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: "#ffffff",
                  mb: 2,
                  fontWeight: 600,
                }}
              >
                Time Range
              </Typography>

              <Typography
                variant="body2"
                sx={{ color: "rgba(255, 255, 255, 0.7)", mb: 2 }}
              >
                {timeRange[0]}:00 - {timeRange[1]}:00
              </Typography>

              <Slider
                value={timeRange}
                onChange={(_, newValue) =>
                  setTimeRange(newValue as [number, number])
                }
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value}:00`}
                min={0}
                max={23}
                marks={[
                  { value: 0, label: "12 AM" },
                  { value: 6, label: "6 AM" },
                  { value: 12, label: "12 PM" },
                  { value: 18, label: "6 PM" },
                  { value: 23, label: "11 PM" },
                ]}
                sx={{
                  color: "#0a7dff",
                  "& .MuiSlider-thumb": {
                    backgroundColor: "#0a7dff",
                  },
                  "& .MuiSlider-track": {
                    backgroundColor: "#0a7dff",
                  },
                  "& .MuiSlider-rail": {
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                  },
                  "& .MuiSlider-mark": {
                    backgroundColor: "rgba(255, 255, 255, 0.3)",
                  },
                  "& .MuiSlider-markLabel": {
                    color: "rgba(255, 255, 255, 0.7)",
                    fontSize: "0.7rem",
                  },
                }}
              />
            </Paper>

            {/* Day Summary */}
            <Paper
              sx={{
                backgroundColor: "#1a2c38",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: 2,
                p: 3,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: "#ffffff",
                  mb: 2,
                  fontWeight: 600,
                }}
              >
                Day Summary
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                  >
                    Time Boxes
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#ffffff", fontWeight: 600 }}
                  >
                    {totalDayEntries}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                  >
                    Total Time
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#0a7dff", fontWeight: 600 }}
                  >
                    {Math.floor(totalDayDuration / 60)}h {totalDayDuration % 60}
                    m
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Actions */}
            <Paper
              sx={{
                backgroundColor: "#1a2c38",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: 2,
                p: 3,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: "#ffffff",
                  mb: 2,
                  fontWeight: 600,
                }}
              >
                Quick Actions
              </Typography>

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateTimeBox}
                fullWidth
                sx={{
                  backgroundColor: "#0a7dff",
                  "&:hover": {
                    backgroundColor: "#0862cc",
                  },
                  fontWeight: 600,
                  py: 1.5,
                }}
              >
                Create Time Box Entry
              </Button>
            </Paper>
          </Box>
        </Box>

        {/* Calendar Popover */}
        <Popover
          open={Boolean(calendarAnchorEl)}
          anchorEl={calendarAnchorEl}
          onClose={handleCloseCalendar}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          slotProps={{
            paper: {
              sx: {
                backgroundColor: "#1a2c38",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: 2,
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
              },
            },
          }}
        >
          <DateCalendar
            value={selectedDate}
            onChange={handleDateChange}
            sx={{
              "& .MuiPickersDay-root": {
                color: "#ffffff",
                "&:hover": {
                  backgroundColor: "rgba(10, 125, 255, 0.1)",
                },
                "&.Mui-selected": {
                  backgroundColor: "#0a7dff",
                  "&:hover": {
                    backgroundColor: "#0862cc",
                  },
                },
              },
              "& .MuiPickersCalendarHeader-root": {
                color: "#ffffff",
              },
              "& .MuiPickersArrowSwitcher-button": {
                color: "rgba(255, 255, 255, 0.7)",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                },
              },
              "& .MuiDayCalendar-weekDayLabel": {
                color: "rgba(255, 255, 255, 0.7)",
              },
            }}
          />
        </Popover>

        {/* Context Menu */}
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleCloseMenu}
          slotProps={{
            paper: {
              sx: {
                backgroundColor: "#1a2c38",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: 2,
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
              },
            },
          }}
        >
          <MenuItem
            onClick={() =>
              selectedTimeBox && handleEditTimeBox(selectedTimeBox)
            }
            sx={{
              color: "#ffffff",
              "&:hover": {
                backgroundColor: "rgba(10, 125, 255, 0.1)",
              },
            }}
          >
            <EditIcon sx={{ mr: 2, fontSize: 20 }} />
            Edit Time Box
          </MenuItem>
          <MenuItem
            onClick={() =>
              selectedTimeBox && handleDeleteTimeBox(selectedTimeBox)
            }
            sx={{
              color: "#f44336",
              "&:hover": {
                backgroundColor: "rgba(244, 67, 54, 0.1)",
              },
            }}
          >
            <DeleteIcon sx={{ mr: 2, fontSize: 20 }} />
            Delete Time Box
          </MenuItem>
        </Menu>

        {/* Time Box Dialog */}
        <TimeBoxDialog
          open={timeBoxDialogOpen}
          onClose={() => setTimeBoxDialogOpen(false)}
          editingEntry={editingTimeBox}
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
          <DialogTitle sx={{ color: "#ffffff" }}>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography sx={{ color: "rgba(255, 255, 255, 0.8)" }}>
              Are you sure you want to delete the time box "
              {timeBoxToDelete?.Description}"? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 1 }}>
            <Button
              onClick={() => setDeleteConfirmOpen(false)}
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
              onClick={confirmDeleteTimeBox}
              variant="contained"
              sx={{
                backgroundColor: "#f44336",
                "&:hover": {
                  backgroundColor: "#d32f2f",
                },
              }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default TimeBoxingPage;
