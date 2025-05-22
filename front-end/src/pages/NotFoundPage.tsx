import type { FC } from "react";
import { Box, Button, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const NotFoundPage: FC = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        textAlign: "center",
        p: 3,
      }}
    >
      <Typography variant="h1" sx={{ mb: 2, fontWeight: "bold" }}>
        404
      </Typography>
      <Typography variant="h5" sx={{ mb: 4 }}>
        Page not found
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, maxWidth: 500 }}>
        The page you are looking for might have been removed, had its name
        changed, or is temporarily unavailable.
      </Typography>
      <Button
        variant="contained"
        component={RouterLink}
        to="/dashboard"
        sx={{ px: 4, py: 1.5 }}
      >
        Go to Dashboard
      </Button>
    </Box>
  );
};

export default NotFoundPage;
