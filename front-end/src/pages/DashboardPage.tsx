import type { FC } from "react";
import { Box, Typography } from "@mui/material";

const DashboardPage: FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
        Dashboard
      </Typography>
      <Typography variant="body1">
        Welcome to your Time Tracker dashboard!
      </Typography>
    </Box>
  );
};

export default DashboardPage;
