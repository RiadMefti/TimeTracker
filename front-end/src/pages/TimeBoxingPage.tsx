import React, { useEffect, useState, useMemo, useCallback } from "react";
import type { FC } from "react";
import { useNavigate } from "react-router-dom";
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
  PlayArrow as PlayIcon,
  CheckCircle as CheckIcon,
} from "@mui/icons-material";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { type Dayjs } from "dayjs";
import { useTimeBoxEntryStore } from "../stores/TimeBoxEntryStore";
import { useProjectStore } from "../stores/ProjectStore";
import { useTimeEntryStore } from "../stores/TimeEntryStore";
import TimeBoxDialog from "../components/timebox/TimeBoxDialog";
import type { TimeBoxEntry } from "../types/TimeBoxEntry";
import type { Project } from "../types/Project";

interface TimeSlot {
  hour: number;
  entries: TimeBoxEntry[];
}

const TimeBoxingPage: FC = () => {
  const navigate = useNavigate();
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
  const { timeEntries, fetchTimeEntries, createTimeEntry } = useTimeEntryStore();

  useEffect(() => {
    fetchTimeBoxEntries();
    fetchProjects();
    fetchTimeEntries();
  }, [fetchTimeBoxEntries, fetchProjects, fetchTimeEntries]);

  const getProjectById = useCallback(
    (projectId: number | null): Project | null => {
      if (!projectId) return null;
      return projects.find((p) => p.ID === projectId) || null;
    },
    [projects]
  );

  // Check if a time box entry is already tracked
  const isTimeBoxAlreadyTracked = useCallback(
    (timeBox: TimeBoxEntry): boolean => {
      return timeEntries.some((entry) => {
        // Check if there's a time entry that matches the time box
        return (
          entry.Description === timeBox.Description &&
          entry.ProjectID === timeBox.ProjectID &&
          dayjs(entry.StartDate).isSame(dayjs(timeBox.StartDate), "minute") &&
          dayjs(entry.EndDate).isSame(dayjs(timeBox.EndDate), "minute")
        );
      });
    },
    [timeEntries]
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

  const handleStartTrackingFromTimeBox = async (timeBox: TimeBoxEntry) => {
    try {
      // Double-check to prevent duplicate tracking
      if (isTimeBoxAlreadyTracked(timeBox)) {
        console.log("Time box is already tracked, skipping creation");
        handleCloseMenu();
        return;
      }

      await createTimeEntry({
        Description: timeBox.Description,
        ProjectID: timeBox.ProjectID,
        StartDate: timeBox.StartDate,
        EndDate: timeBox.EndDate,
      });
      handleCloseMenu();
      
      // Refresh time entries to update the UI
      await fetchTimeEntries();
      
      // Navigate to time entries page to show the newly created entry
      navigate("/time-entries");
    } catch (error) {
      console.error("Failed to create time entry from time box:", error);
      // TODO: Add error notification
    }
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
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
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
                                  {isTimeBoxAlreadyTracked(entry) && (
                                    <CheckIcon
                                      sx={{
                                        fontSize: 12,
                                        color: "#4caf50",
                                      }}
                                    />
                                  )}
                                </Box>
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
              gap: 1.5,
              minWidth: 320,
              maxWidth: 380,
              height: "100vh",
              overflow: "hidden",
              py: 1,
            }}
          >
            {/* Date Navigation & Summary Combined */}
            <Paper
              sx={{
                backgroundColor: "#1a2c38",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: 2,
                p: 2,
                flex: "0 0 auto",
              }}
            >
              {/* Date Navigation */}
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}
              >
                <IconButton
                  onClick={() => navigateDate("prev")}
                  size="small"
                  sx={{
                    color: "rgba(255, 255, 255, 0.7)",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                    },
                  }}
                >
                  <ChevronLeftIcon fontSize="small" />
                </IconButton>

                <Button
                  onClick={handleCalendarClick}
                  sx={{
                    color: "#ffffff",
                    fontWeight: 600,
                    textTransform: "none",
                    flex: 1,
                    justifyContent: "center",
                    fontSize: "0.9rem",
                    py: 0.5,
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                    },
                  }}
                  startIcon={<CalendarIcon fontSize="small" />}
                >
                  {selectedDate.format("MMM D, YYYY")}
                </Button>

                <IconButton
                  onClick={() => navigateDate("next")}
                  size="small"
                  sx={{
                    color: "rgba(255, 255, 255, 0.7)",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                    },
                  }}
                >
                  <ChevronRightIcon fontSize="small" />
                </IconButton>
              </Box>

              {/* Today indicator and button */}
              <Box sx={{ display: "flex", justifyContent: "center", mb: 1.5 }}>
                {isToday ? (
                  <Chip
                    label="Today"
                    size="small"
                    sx={{
                      backgroundColor: "rgba(10, 125, 255, 0.2)",
                      color: "#0a7dff",
                      height: 24,
                      fontSize: "0.75rem",
                    }}
                  />
                ) : (
                  <Button
                    onClick={goToToday}
                    startIcon={<TodayIcon fontSize="small" />}
                    size="small"
                    sx={{
                      color: "#0a7dff",
                      fontSize: "0.75rem",
                      "&:hover": {
                        backgroundColor: "rgba(10, 125, 255, 0.1)",
                      },
                    }}
                  >
                    Go to Today
                  </Button>
                )}
              </Box>

              {/* Day Summary */}
              <Box sx={{ display: "flex", justifyContent: "space-around", pt: 1, borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.7)", display: "block" }}>
                    Time Boxes
                  </Typography>
                  <Typography variant="h6" sx={{ color: "#ffffff", fontWeight: 600, fontSize: "1.1rem" }}>
                    {totalDayEntries}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.7)", display: "block" }}>
                    Total Time
                  </Typography>
                  <Typography variant="h6" sx={{ color: "#0a7dff", fontWeight: 600, fontSize: "1.1rem" }}>
                    {Math.floor(totalDayDuration / 60)}h {totalDayDuration % 60}m
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Time Range */}
            <Paper
              sx={{
                backgroundColor: "#1a2c38",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: 2,
                p: 2,
                flex: "0 0 auto",
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  color: "#ffffff",
                  mb: 1,
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              >
                Time Range: {timeRange[0]}:00 - {timeRange[1]}:00
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
                  { value: 0, label: "0" },
                  { value: 6, label: "6" },
                  { value: 12, label: "12" },
                  { value: 18, label: "18" },
                  { value: 23, label: "23" },
                ]}
                sx={{
                  color: "#0a7dff",
                  "& .MuiSlider-thumb": {
                    backgroundColor: "#0a7dff",
                    width: 16,
                    height: 16,
                  },
                  "& .MuiSlider-track": {
                    backgroundColor: "#0a7dff",
                  },
                  "& .MuiSlider-rail": {
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                  },
                  "& .MuiSlider-mark": {
                    backgroundColor: "rgba(255, 255, 255, 0.3)",
                    width: 2,
                    height: 2,
                  },
                  "& .MuiSlider-markLabel": {
                    color: "rgba(255, 255, 255, 0.7)",
                    fontSize: "0.65rem",
                  },
                }}
              />
            </Paper>

            {/* Weekly Overview */}
            <Paper
              sx={{
                backgroundColor: "#1a2c38",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: 2,
                p: 2,
                flex: "0 0 auto",
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  color: "#ffffff",
                  mb: 1.5,
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              >
                This Week
              </Typography>
              
              <Box sx={{ 
                display: "flex", 
                flexDirection: "column", 
                gap: 0.5,
              }}>
                {Array.from({ length: 7 }, (_, i) => {
                  const date = selectedDate.startOf('week').add(i, 'day');
                  const isToday = date.isSame(dayjs(), 'day');
                  const isSelected = date.isSame(selectedDate, 'day');
                  const dayEntries = timeBoxEntries.filter(entry => 
                    dayjs(entry.StartDate).isSame(date, 'day')
                  );
                  const dayDuration = dayEntries.reduce((total, entry) => {
                    return total + dayjs(entry.EndDate).diff(dayjs(entry.StartDate), 'minute');
                  }, 0);

                  return (
                    <Box
                      key={i}
                      onClick={() => setSelectedDate(date)}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        p: 1,
                        borderRadius: 1,
                        cursor: "pointer",
                        backgroundColor: isSelected ? "rgba(10, 125, 255, 0.2)" : "transparent",
                        border: isToday ? "1px solid #0a7dff" : "1px solid transparent",
                        "&:hover": {
                          backgroundColor: "rgba(255, 255, 255, 0.05)",
                        },
                      }}
                    >
                      <Box>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: isSelected ? "#0a7dff" : "#ffffff",
                            fontWeight: isToday ? 600 : 400,
                            fontSize: "0.8rem",
                            lineHeight: 1.2,
                          }}
                        >
                          {date.format('ddd')}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: "rgba(255, 255, 255, 0.6)",
                            fontSize: "0.7rem",
                          }}
                        >
                          {date.format('MMM D')}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: "#0a7dff", 
                            fontWeight: 500,
                            fontSize: "0.8rem",
                            lineHeight: 1.2,
                          }}
                        >
                          {dayEntries.length}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: "rgba(255, 255, 255, 0.6)",
                            fontSize: "0.7rem",
                          }}
                        >
                          {Math.floor(dayDuration / 60)}h {dayDuration % 60}m
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
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
          {selectedTimeBox && (
            <MenuItem
              onClick={() => handleStartTrackingFromTimeBox(selectedTimeBox)}
              disabled={isTimeBoxAlreadyTracked(selectedTimeBox)}
              sx={{
                color: isTimeBoxAlreadyTracked(selectedTimeBox) 
                  ? "rgba(255, 255, 255, 0.3)" 
                  : "#4caf50",
                "&:hover": {
                  backgroundColor: isTimeBoxAlreadyTracked(selectedTimeBox)
                    ? "transparent"
                    : "rgba(76, 175, 80, 0.1)",
                },
                "&.Mui-disabled": {
                  color: "rgba(255, 255, 255, 0.3)",
                },
              }}
            >
              <PlayIcon sx={{ mr: 2, fontSize: 20 }} />
              {isTimeBoxAlreadyTracked(selectedTimeBox) 
                ? "Already Tracked" 
                : "Start Tracking"}
            </MenuItem>
          )}
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
