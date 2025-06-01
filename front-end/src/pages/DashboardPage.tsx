import type { FC } from "react";
import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Tooltip,
  List,
  ListItem,
  Avatar,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  Today as TodayIcon,
  Timer as TimerIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as AccessTimeIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  TrendingDown as TrendingDownIcon,
  Remove as TrendingFlatIcon,
  DateRange as DateRangeIcon,
  History as HistoryIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import Chronometer from "../components/chronometer/Chronometer";
import ManualTimeEntryDialog from "../components/manual-entry/ManualTimeEntryDialog";
import { useTimeEntryStore } from "../stores/TimeEntryStore";
import { useProjectStore } from "../stores/ProjectStore";
import type { TimeEntry } from "../types/TimeEntry";
import type { Project } from "../types/Project";

interface CalendarDay {
  date: dayjs.Dayjs;
  hours: number;
  entries: TimeEntry[];
  isCurrentMonth: boolean;
  isToday: boolean;
}

const DashboardPage: FC = () => {
  const [manualEntryDialogOpen, setManualEntryDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [showDetailedStats, setShowDetailedStats] = useState(false);

  const { timeEntries, fetchTimeEntries, deleteTimeEntry } =
    useTimeEntryStore();
  const { projects, fetchProjects } = useProjectStore();

  useEffect(() => {
    fetchTimeEntries();
    fetchProjects();
  }, [fetchTimeEntries, fetchProjects]);

  const getProjectById = (projectId: number | null): Project | null => {
    if (!projectId) return null;
    return projects.find((p) => p.ID === projectId) || null;
  };

  // Calculate comprehensive stats
  const stats = useMemo(() => {
    const now = dayjs();
    const today = now.startOf("day");
    const yesterday = now.subtract(1, "day").startOf("day");
    const thisWeek = now.startOf("week");
    const lastWeek = now.subtract(1, "week").startOf("week");
    const thisMonth = now.startOf("month");
    const lastMonth = now.subtract(1, "month").startOf("month");
    const thisYear = now.startOf("year");
    const last7Days = now.subtract(7, "days");
    const last30Days = now.subtract(30, "days");

    const calculateTotalHours = (entries: TimeEntry[]) =>
      entries.reduce((total, entry) => {
        const start = dayjs(entry.StartDate);
        const end = dayjs(entry.EndDate);
        return total + end.diff(start, "hour", true);
      }, 0);

    const filterEntries = (startDate: dayjs.Dayjs, endDate?: dayjs.Dayjs) =>
      timeEntries.filter((entry) => {
        const entryDate = dayjs(entry.StartDate);
        return endDate
          ? entryDate.isAfter(startDate) && entryDate.isBefore(endDate)
          : entryDate.isAfter(startDate);
      });

    // Current periods
    const todayEntries = filterEntries(today);
    const weekEntries = filterEntries(thisWeek);
    const monthEntries = filterEntries(thisMonth);
    const yearEntries = filterEntries(thisYear);
    const last7DaysEntries = filterEntries(last7Days);
    const last30DaysEntries = filterEntries(last30Days);

    // Previous periods for comparison
    const yesterdayEntries = filterEntries(yesterday, today);
    const lastWeekEntries = filterEntries(lastWeek, thisWeek);
    const lastMonthEntries = filterEntries(lastMonth, thisMonth);

    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? "up" : "flat";
      const percentChange = ((current - previous) / previous) * 100;
      if (percentChange > 5) return "up";
      if (percentChange < -5) return "down";
      return "flat";
    };

    const todayHours = calculateTotalHours(todayEntries);
    const yesterdayHours = calculateTotalHours(yesterdayEntries);
    const weekHours = calculateTotalHours(weekEntries);
    const lastWeekHours = calculateTotalHours(lastWeekEntries);
    const monthHours = calculateTotalHours(monthEntries);
    const lastMonthHours = calculateTotalHours(lastMonthEntries);

    return {
      // Main stats
      today: todayHours,
      week: weekHours,
      month: monthHours,
      year: calculateTotalHours(yearEntries),
      last7Days: calculateTotalHours(last7DaysEntries),
      last30Days: calculateTotalHours(last30DaysEntries),
      allTime: calculateTotalHours(timeEntries),

      // Entry counts
      todayEntries: todayEntries.length,
      weekEntries: weekEntries.length,
      monthEntries: monthEntries.length,
      yearEntries: yearEntries.length,

      // Previous periods
      yesterday: yesterdayHours,
      lastWeek: lastWeekHours,
      lastMonth: lastMonthHours,

      // Trends
      todayTrend: calculateTrend(todayHours, yesterdayHours),
      weekTrend: calculateTrend(weekHours, lastWeekHours),
      monthTrend: calculateTrend(monthHours, lastMonthHours),

      // Averages
      dailyAverage:
        calculateTotalHours(timeEntries) /
        Math.max(1, dayjs().diff(dayjs().startOf("year"), "days")),
      weeklyAverage:
        calculateTotalHours(yearEntries) /
        Math.max(1, Math.ceil(dayjs().diff(dayjs().startOf("year"), "weeks"))),
    };
  }, [timeEntries]);

  // Generate yearly calendar data
  const yearlyData = useMemo(() => {
    const startOfYear = dayjs().startOf("year");

    // Group entries by date
    const entriesByDate = new Map<string, TimeEntry[]>();
    timeEntries.forEach((entry) => {
      const date = dayjs(entry.StartDate).format("YYYY-MM-DD");
      if (!entriesByDate.has(date)) {
        entriesByDate.set(date, []);
      }
      entriesByDate.get(date)!.push(entry);
    });

    // Generate calendar grid (52 weeks)
    const weeks: CalendarDay[][] = [];
    let currentDate = startOfYear.subtract(startOfYear.day(), "day");

    for (let week = 0; week < 52; week++) {
      const weekDays: CalendarDay[] = [];
      for (let day = 0; day < 7; day++) {
        const dayEntries =
          entriesByDate.get(currentDate.format("YYYY-MM-DD")) || [];
        const hours = dayEntries.reduce((total, entry) => {
          const start = dayjs(entry.StartDate);
          const end = dayjs(entry.EndDate);
          return total + end.diff(start, "hour", true);
        }, 0);

        weekDays.push({
          date: currentDate,
          hours,
          entries: dayEntries,
          isCurrentMonth: currentDate.month() === dayjs().month(),
          isToday: currentDate.isSame(dayjs(), "day"),
        });

        currentDate = currentDate.add(1, "day");
      }
      weeks.push(weekDays);
    }

    return weeks;
  }, [timeEntries]);

  const getIntensityColor = (hours: number): string => {
    if (hours === 0) return "rgba(255, 255, 255, 0.05)";
    if (hours < 1) return "rgba(10, 125, 255, 0.2)";
    if (hours < 3) return "rgba(10, 125, 255, 0.4)";
    if (hours < 6) return "rgba(10, 125, 255, 0.6)";
    if (hours < 8) return "rgba(10, 125, 255, 0.8)";
    return "#0a7dff";
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUpIcon sx={{ fontSize: 16, color: "#4caf50" }} />;
      case "down":
        return <TrendingDownIcon sx={{ fontSize: 16, color: "#f44336" }} />;
      default:
        return (
          <TrendingFlatIcon
            sx={{ fontSize: 16, color: "rgba(255, 255, 255, 0.6)" }}
          />
        );
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "#4caf50";
      case "down":
        return "#f44336";
      default:
        return "rgba(255, 255, 255, 0.6)";
    }
  };

  const recentEntries = useMemo(() => {
    return timeEntries
      .sort(
        (a, b) => dayjs(b.StartDate).valueOf() - dayjs(a.StartDate).valueOf()
      )
      .slice(0, 5);
  }, [timeEntries]);

  const formatDuration = (startDate: string, endDate: string): string => {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const hours = end.diff(start, "hour", true);

    if (hours < 1) {
      return `${Math.round(hours * 60)}m`;
    }
    return `${hours.toFixed(1)}h`;
  };

  const handleCreateEntry = () => {
    setEditingEntry(null);
    setManualEntryDialogOpen(true);
  };

  const handleEditEntry = (entry: TimeEntry) => {
    setEditingEntry(entry);
    setManualEntryDialogOpen(true);
  };

  const handleDeleteEntry = async (entry: TimeEntry) => {
    await deleteTimeEntry(entry.ID);
  };

  return (
    <Box sx={{ p: 3, backgroundColor: "#0D1D27", minHeight: "100vh" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 4,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <TodayIcon sx={{ color: "#0a7dff", fontSize: 32 }} />
          <Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, color: "#ffffff", mb: 0.5 }}
            >
              Dashboard
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "rgba(255, 255, 255, 0.7)" }}
            >
              {dayjs().format("dddd, MMMM D, YYYY")}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Quick Time Tracking */}
      <Card
        sx={{
          backgroundColor: "#1a2c38",
          backgroundImage: "none",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: 3,
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
          mb: 4,
        }}
      >
        <CardContent sx={{ p: 3 }}>
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
              sx={{
                fontWeight: 600,
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <TimerIcon sx={{ color: "#0a7dff" }} />
              Quick Time Tracking
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleCreateEntry}
              sx={{
                ml: "auto",
                borderColor: "rgba(10, 125, 255, 0.5)",
                color: "#0a7dff",
                "&:hover": {
                  backgroundColor: "rgba(10, 125, 255, 0.1)",
                  borderColor: "#0a7dff",
                },
              }}
            >
              Manual Entry
            </Button>
          </Box>
          <Chronometer variant="full" />
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "2fr 1fr",
          },
          gap: 4,
        }}
      >
        {/* Left Column */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {/* Stats Cards */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(3, 1fr)",
              },
              gap: 3,
            }}
          >
            {/* Today Card */}
            <Card
              sx={{
                backgroundColor: "#1a2c38",
                backgroundImage: "none",
                border: "1px solid rgba(76, 175, 80, 0.2)",
                borderRadius: 3,
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AccessTimeIcon sx={{ color: "#4caf50" }} />
                    <Typography
                      variant="subtitle2"
                      sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                    >
                      Today
                    </Typography>
                  </Box>
                  <Tooltip title={`Yesterday: ${stats.yesterday.toFixed(1)}h`}>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      {getTrendIcon(stats.todayTrend)}
                    </Box>
                  </Tooltip>
                </Box>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, color: "#4caf50", mb: 1 }}
                >
                  {stats.today.toFixed(1)}h
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255, 255, 255, 0.6)" }}
                >
                  {stats.todayEntries} entries
                </Typography>
              </CardContent>
            </Card>

            {/* Week Card */}
            <Card
              sx={{
                backgroundColor: "#1a2c38",
                backgroundImage: "none",
                border: "1px solid rgba(10, 125, 255, 0.2)",
                borderRadius: 3,
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CalendarIcon sx={{ color: "#0a7dff" }} />
                    <Typography
                      variant="subtitle2"
                      sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                    >
                      This Week
                    </Typography>
                  </Box>
                  <Tooltip title={`Last week: ${stats.lastWeek.toFixed(1)}h`}>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      {getTrendIcon(stats.weekTrend)}
                    </Box>
                  </Tooltip>
                </Box>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, color: "#0a7dff", mb: 1 }}
                >
                  {stats.week.toFixed(1)}h
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255, 255, 255, 0.6)" }}
                >
                  {stats.weekEntries} entries
                </Typography>
              </CardContent>
            </Card>

            {/* Month Card */}
            <Card
              sx={{
                backgroundColor: "#1a2c38",
                backgroundImage: "none",
                border: "1px solid rgba(255, 152, 0, 0.2)",
                borderRadius: 3,
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TrendingUpIcon sx={{ color: "#ff9800" }} />
                    <Typography
                      variant="subtitle2"
                      sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                    >
                      This Month
                    </Typography>
                  </Box>
                  <Tooltip title={`Last month: ${stats.lastMonth.toFixed(1)}h`}>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      {getTrendIcon(stats.monthTrend)}
                    </Box>
                  </Tooltip>
                </Box>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, color: "#ff9800", mb: 1 }}
                >
                  {stats.month.toFixed(1)}h
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255, 255, 255, 0.6)" }}
                >
                  {stats.monthEntries} entries
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Detailed Stats Accordion */}
          <Accordion
            expanded={showDetailedStats}
            onChange={() => setShowDetailedStats(!showDetailedStats)}
            sx={{
              backgroundColor: "#1a2c38",
              backgroundImage: "none",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: 3,
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: "#0a7dff" }} />}
              sx={{
                "& .MuiAccordionSummary-content": {
                  alignItems: "center",
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <HistoryIcon sx={{ color: "#0a7dff" }} />
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: "#ffffff" }}
                >
                  Detailed Time Analytics
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <Divider
                sx={{ mb: 3, borderColor: "rgba(255, 255, 255, 0.12)" }}
              />

              {/* Additional Stats Grid */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(4, 1fr)",
                  },
                  gap: 3,
                  mb: 3,
                }}
              >
                {/* Last 7 Days */}
                <Card
                  sx={{
                    backgroundColor: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    borderRadius: 2,
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <DateRangeIcon sx={{ color: "#9c27b0", fontSize: 20 }} />
                      <Typography
                        variant="caption"
                        sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                      >
                        Last 7 Days
                      </Typography>
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{ color: "#9c27b0", fontWeight: 600 }}
                    >
                      {stats.last7Days.toFixed(1)}h
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "rgba(255, 255, 255, 0.5)" }}
                    >
                      Avg: {(stats.last7Days / 7).toFixed(1)}h/day
                    </Typography>
                  </CardContent>
                </Card>

                {/* Last 30 Days */}
                <Card
                  sx={{
                    backgroundColor: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    borderRadius: 2,
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <DateRangeIcon sx={{ color: "#607d8b", fontSize: 20 }} />
                      <Typography
                        variant="caption"
                        sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                      >
                        Last 30 Days
                      </Typography>
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{ color: "#607d8b", fontWeight: 600 }}
                    >
                      {stats.last30Days.toFixed(1)}h
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "rgba(255, 255, 255, 0.5)" }}
                    >
                      Avg: {(stats.last30Days / 30).toFixed(1)}h/day
                    </Typography>
                  </CardContent>
                </Card>

                {/* This Year */}
                <Card
                  sx={{
                    backgroundColor: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    borderRadius: 2,
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <CalendarIcon sx={{ color: "#3f51b5", fontSize: 20 }} />
                      <Typography
                        variant="caption"
                        sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                      >
                        This Year
                      </Typography>
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{ color: "#3f51b5", fontWeight: 600 }}
                    >
                      {stats.year.toFixed(1)}h
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "rgba(255, 255, 255, 0.5)" }}
                    >
                      {stats.yearEntries} entries
                    </Typography>
                  </CardContent>
                </Card>

                {/* All Time */}
                <Card
                  sx={{
                    backgroundColor: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    borderRadius: 2,
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <HistoryIcon sx={{ color: "#795548", fontSize: 20 }} />
                      <Typography
                        variant="caption"
                        sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                      >
                        All Time
                      </Typography>
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{ color: "#795548", fontWeight: 600 }}
                    >
                      {stats.allTime.toFixed(1)}h
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "rgba(255, 255, 255, 0.5)" }}
                    >
                      Total entries: {timeEntries.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>

              {/* Comparison Section */}
              <Typography
                variant="subtitle1"
                sx={{ color: "#ffffff", fontWeight: 600, mb: 2 }}
              >
                Period Comparisons
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "repeat(3, 1fr)",
                  },
                  gap: 2,
                }}
              >
                {/* Yesterday vs Today */}
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(255, 255, 255, 0.7)", mb: 1 }}
                  >
                    Today vs Yesterday
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2" sx={{ color: "#ffffff" }}>
                      {stats.today.toFixed(1)}h vs {stats.yesterday.toFixed(1)}h
                    </Typography>
                    {getTrendIcon(stats.todayTrend)}
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{ color: getTrendColor(stats.todayTrend) }}
                  >
                    {stats.today > stats.yesterday
                      ? `+${(stats.today - stats.yesterday).toFixed(1)}h more`
                      : stats.today < stats.yesterday
                      ? `${(stats.yesterday - stats.today).toFixed(1)}h less`
                      : "Same as yesterday"}
                  </Typography>
                </Box>

                {/* This Week vs Last Week */}
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(255, 255, 255, 0.7)", mb: 1 }}
                  >
                    This Week vs Last Week
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2" sx={{ color: "#ffffff" }}>
                      {stats.week.toFixed(1)}h vs {stats.lastWeek.toFixed(1)}h
                    </Typography>
                    {getTrendIcon(stats.weekTrend)}
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{ color: getTrendColor(stats.weekTrend) }}
                  >
                    {stats.week > stats.lastWeek
                      ? `+${(stats.week - stats.lastWeek).toFixed(1)}h more`
                      : stats.week < stats.lastWeek
                      ? `${(stats.lastWeek - stats.week).toFixed(1)}h less`
                      : "Same as last week"}
                  </Typography>
                </Box>

                {/* This Month vs Last Month */}
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(255, 255, 255, 0.7)", mb: 1 }}
                  >
                    This Month vs Last Month
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2" sx={{ color: "#ffffff" }}>
                      {stats.month.toFixed(1)}h vs {stats.lastMonth.toFixed(1)}h
                    </Typography>
                    {getTrendIcon(stats.monthTrend)}
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{ color: getTrendColor(stats.monthTrend) }}
                  >
                    {stats.month > stats.lastMonth
                      ? `+${(stats.month - stats.lastMonth).toFixed(1)}h more`
                      : stats.month < stats.lastMonth
                      ? `${(stats.lastMonth - stats.month).toFixed(1)}h less`
                      : "Same as last month"}
                  </Typography>
                </Box>
              </Box>

              {/* Averages Section */}
              <Typography
                variant="subtitle1"
                sx={{ color: "#ffffff", fontWeight: 600, mb: 2, mt: 3 }}
              >
                Averages & Insights
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                  },
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(255, 255, 255, 0.7)", mb: 1 }}
                  >
                    Daily Average (This Year)
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ color: "#4caf50", fontWeight: 600 }}
                  >
                    {stats.dailyAverage.toFixed(1)}h/day
                  </Typography>
                </Box>

                <Box
                  sx={{
                    p: 2,
                    backgroundColor: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(255, 255, 255, 0.7)", mb: 1 }}
                  >
                    Weekly Average (This Year)
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ color: "#0a7dff", fontWeight: 600 }}
                  >
                    {stats.weeklyAverage.toFixed(1)}h/week
                  </Typography>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Yearly Calendar */}
          <Card
            sx={{
              backgroundColor: "#1a2c38",
              backgroundImage: "none",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: 3,
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: "#ffffff",
                  mb: 3,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <CalendarIcon sx={{ color: "#0a7dff" }} />
                {dayjs().year()} Activity
              </Typography>

              {/* Calendar Grid */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(53, 1fr)",
                  gap: "2px",
                  mb: 2,
                }}
              >
                {yearlyData.flat().map((day, index) => (
                  <Tooltip
                    key={index}
                    title={`${day.date.format(
                      "MMM D, YYYY"
                    )}: ${day.hours.toFixed(1)} hours`}
                    arrow
                  >
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        backgroundColor: getIntensityColor(day.hours),
                        borderRadius: "2px",
                        cursor: "pointer",
                        border: day.isToday ? "1px solid #ffffff" : "none",
                        "&:hover": {
                          transform: "scale(1.2)",
                          zIndex: 1,
                        },
                        transition: "all 0.2s ease",
                      }}
                    />
                  </Tooltip>
                ))}
              </Box>

              {/* Legend */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  justifyContent: "flex-end",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: "rgba(255, 255, 255, 0.6)" }}
                >
                  Less
                </Typography>
                {[0, 0.5, 1.5, 4, 8].map((hours) => (
                  <Box
                    key={hours}
                    sx={{
                      width: 10,
                      height: 10,
                      backgroundColor: getIntensityColor(hours),
                      borderRadius: "2px",
                    }}
                  />
                ))}
                <Typography
                  variant="caption"
                  sx={{ color: "rgba(255, 255, 255, 0.6)" }}
                >
                  More
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Right Column - Recent Entries */}
        <Card
          sx={{
            backgroundColor: "#1a2c38",
            backgroundImage: "none",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: 3,
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
            height: "fit-content",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: "#ffffff",
                mb: 3,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <AccessTimeIcon sx={{ color: "#0a7dff" }} />
              Recent Entries
            </Typography>

            {recentEntries.length === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  py: 4,
                  textAlign: "center",
                }}
              >
                <AccessTimeIcon
                  sx={{
                    fontSize: 48,
                    color: "rgba(255, 255, 255, 0.3)",
                    mb: 2,
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255, 255, 255, 0.6)", mb: 2 }}
                >
                  No recent entries
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleCreateEntry}
                  sx={{
                    borderColor: "rgba(10, 125, 255, 0.5)",
                    color: "#0a7dff",
                    "&:hover": {
                      backgroundColor: "rgba(10, 125, 255, 0.1)",
                    },
                  }}
                >
                  Add Entry
                </Button>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {recentEntries.map((entry) => {
                  const project = getProjectById(entry.ProjectID);
                  return (
                    <ListItem
                      key={entry.ID}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        mb: 1,
                        backgroundColor: "rgba(255, 255, 255, 0.02)",
                        border: "1px solid rgba(255, 255, 255, 0.06)",
                        "&:hover": {
                          backgroundColor: "rgba(10, 125, 255, 0.05)",
                          border: "1px solid rgba(10, 125, 255, 0.2)",
                        },
                        transition: "all 0.2s ease",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          width: "100%",
                          gap: 2,
                        }}
                      >
                        {project && (
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              backgroundColor: project.Color || "#0a7dff",
                              fontSize: "0.8rem",
                              fontWeight: 600,
                            }}
                          >
                            {project.Name.charAt(0).toUpperCase()}
                          </Avatar>
                        )}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 500,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              color: "#ffffff",
                              mb: 0.5,
                            }}
                          >
                            {entry.Description}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{ color: "rgba(255, 255, 255, 0.6)" }}
                            >
                              {dayjs(entry.StartDate).format("MMM D • h:mm A")}
                            </Typography>
                            <Chip
                              size="small"
                              label={formatDuration(
                                entry.StartDate,
                                entry.EndDate
                              )}
                              sx={{
                                backgroundColor: "rgba(10, 125, 255, 0.2)",
                                color: "#0a7dff",
                                fontSize: "0.7rem",
                                height: 20,
                              }}
                            />
                          </Box>
                        </Box>
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleEditEntry(entry)}
                            sx={{
                              color: "rgba(255, 255, 255, 0.6)",
                              "&:hover": {
                                color: "#0a7dff",
                                backgroundColor: "rgba(10, 125, 255, 0.1)",
                              },
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteEntry(entry)}
                            sx={{
                              color: "rgba(255, 255, 255, 0.6)",
                              "&:hover": {
                                color: "#f44336",
                                backgroundColor: "rgba(244, 67, 54, 0.1)",
                              },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </ListItem>
                  );
                })}
              </List>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Manual Time Entry Dialog */}
      <ManualTimeEntryDialog
        open={manualEntryDialogOpen}
        onClose={() => setManualEntryDialogOpen(false)}
        editingEntry={editingEntry}
      />
    </Box>
  );
};

export default DashboardPage;
