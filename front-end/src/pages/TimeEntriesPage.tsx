import type { FC } from "react";
import { Box, Typography } from "@mui/material";
import Chronometer from "../components/chronometer/Chronometer";

const TimeEntriesPage: FC = () => {
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
      <Typography
        variant="h6"
        component="h1"
        sx={{
          mb: 3,
          fontWeight: 600,
        }}
      >
        Time Tracking
      </Typography>

      {/* Chronometer Section - Compact */}
      <Box sx={{ mb: 3, flexShrink: 0 }}>
        <Chronometer variant="full" />
      </Box>
    </Box>
  );
};

export default TimeEntriesPage;
