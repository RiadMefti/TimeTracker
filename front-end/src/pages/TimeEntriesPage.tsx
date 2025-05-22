import type { FC } from "react";
import { Box, Typography } from "@mui/material";

const TimeEntriesPage: FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
        Time Entries
      </Typography>
      <Typography variant="body1">Manage your time entries here.</Typography>
    </Box>
  );
};

export default TimeEntriesPage;
