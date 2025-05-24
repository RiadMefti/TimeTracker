import React, { useEffect } from "react";
import {
  Box,
  IconButton,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
} from "@mui/material";
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Timer as TimerIcon,
} from "@mui/icons-material";
import { useTimeEntryStore } from "../../stores/TimeEntryStore";
import { useProjectStore } from "../../stores/ProjectStore";

interface ChronometerProps {
  variant?: "full" | "compact";
}

const formatTime = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

const Chronometer: React.FC<ChronometerProps> = ({ variant = "full" }) => {
  const {
    timer,
    startTimer,
    stopTimer,
    updateTimerDescription,
    updateTimerProject,
    updateElapsedTime,
  } = useTimeEntryStore();

  const { projects, fetchProjects } = useProjectStore();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer.isRunning) {
      interval = setInterval(() => {
        updateElapsedTime();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer.isRunning, updateElapsedTime]);

  const handleStart = () => {
    startTimer(timer.currentDescription, timer.currentProjectId);
  };

  const handleStop = async () => {
    await stopTimer();
  };

  if (variant === "compact") {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          padding: "8px 12px",
          backgroundColor: timer.isRunning
            ? "rgba(10, 125, 255, 0.15)"
            : "rgba(26, 44, 56, 0.5)",
          borderRadius: 2,
          border: timer.isRunning
            ? "1px solid rgba(10, 125, 255, 0.4)"
            : "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: timer.isRunning
            ? "0 0 8px rgba(10, 125, 255, 0.2)"
            : "0 2px 6px rgba(0, 0, 0, 0.1)",
          transition: "all 0.3s ease",
          justifyContent: "space-around",
        }}
      >
        <TimerIcon
          sx={{
            fontSize: 18,
            color: timer.isRunning ? "#0a7dff" : "rgba(255, 255, 255, 0.7)",
          }}
        />
        <Typography
          variant="body2"
          sx={{
            fontFamily: "monospace",
            fontWeight: 600,
            color: timer.isRunning ? "#0a7dff" : "rgba(255, 255, 255, 0.9)",
            minWidth: "60px",
          }}
        >
          {formatTime(timer.elapsedTime)}
        </Typography>

        {!timer.isRunning ? (
          <Tooltip title="Start Timer">
            <IconButton
              onClick={handleStart}
              size="small"
              sx={{
                color: "#4caf50",
                padding: "4px",
                "&:hover": {
                  backgroundColor: "rgba(76, 175, 80, 0.15)",
                },
              }}
            >
              <PlayIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Stop & Save">
            <IconButton
              onClick={handleStop}
              size="small"
              sx={{
                color: "#f44336",
                padding: "4px",
                "&:hover": {
                  backgroundColor: "rgba(244, 67, 54, 0.15)",
                },
              }}
            >
              <StopIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        backgroundColor: "rgba(26, 44, 56, 0.4)",
        borderRadius: 2,
        padding: 2,
        border: "1px solid rgba(255, 255, 255, 0.1)",
        transition: "all 0.3s ease",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        "&:hover": {
          backgroundColor: "rgba(26, 44, 56, 0.5)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        },
      }}
    >
      {/* Timer Display */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <TimerIcon
          sx={{
            fontSize: 24,
            color: timer.isRunning ? "#0a7dff" : "rgba(255, 255, 255, 0.7)",
          }}
        />
        <Typography
          variant="h6"
          sx={{
            fontFamily: "monospace",
            fontWeight: 700,
            color: timer.isRunning ? "#0a7dff" : "#ffffff",
            minWidth: "80px",
          }}
        >
          {formatTime(timer.elapsedTime)}
        </Typography>
      </Box>

      {/* Description Input */}

      <TextField
        label="Description"
        value={timer.currentDescription}
        onChange={(e) => updateTimerDescription(e.target.value)}
        placeholder="What are you working on?"
        sx={{ flex: 1 }}
      />

      {/* Project Selection */}

      <FormControl sx={{ minWidth: 150 }}>
        <InputLabel>Project</InputLabel>
        <Select
          value={timer.currentProjectId || ""}
          label="Project"
          onChange={(e) =>
            updateTimerProject((e.target.value as number | null) || null)
          }
        >
          <MenuItem value="">
            <em>No Project</em>
          </MenuItem>
          {projects.map((project) => (
            <MenuItem key={project.ID} value={project.ID}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: project.Color,
                  }}
                />
                {project.Name}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Controls */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {!timer.isRunning ? (
          <Tooltip title="Start Timer">
            <IconButton
              onClick={handleStart}
              sx={{
                backgroundColor: "#4caf50",
                color: "white",
                "&:hover": {
                  backgroundColor: "#45a049",
                },
              }}
            >
              <PlayIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Stop & Save">
            <IconButton
              onClick={handleStop}
              sx={{
                backgroundColor: "#f44336",
                color: "white",
                "&:hover": {
                  backgroundColor: "#d32f2f",
                },
              }}
            >
              <StopIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
};

export default Chronometer;
