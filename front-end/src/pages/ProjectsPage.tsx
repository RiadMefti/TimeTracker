import type { FC } from "react";
import { Box, Typography } from "@mui/material";

const ProjectsPage: FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
        Projects
      </Typography>
      <Typography variant="body1">Manage your projects here.</Typography>
    </Box>
  );
};

export default ProjectsPage;
