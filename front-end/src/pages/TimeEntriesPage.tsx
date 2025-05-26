import type { FC } from "react";
import { useState } from "react";
import { Box, Typography, Button, Divider } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import Chronometer from "../components/chronometer/Chronometer";
import ManualTimeEntryDialog from "../components/manual-entry/ManualTimeEntryDialog";

const TimeEntriesPage: FC = () => {
  const [manualEntryDialogOpen, setManualEntryDialogOpen] = useState(false);

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
          component="h1"
          sx={{
            fontWeight: 600,
          }}
        >
          Time Tracking
        </Typography>

        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => setManualEntryDialogOpen(true)}
          sx={{
            borderColor: "rgba(10, 125, 255, 0.5)",
            color: "#0a7dff",
            "&:hover": {
              backgroundColor: "rgba(10, 125, 255, 0.1)",
              borderColor: "#0a7dff",
            },
            fontWeight: 600,
          }}
        >
          Add Manual Entry
        </Button>
      </Box>

      {/* Chronometer Section */}
      <Box sx={{ mb: 3, flexShrink: 0 }}>
        <Chronometer variant="full" />
      </Box>

      <Divider
        sx={{
          borderColor: "rgba(255, 255, 255, 0.1)",
          mb: 3,
        }}
      />

      {/* Manual Time Entry Dialog */}
      <ManualTimeEntryDialog
        open={manualEntryDialogOpen}
        onClose={() => setManualEntryDialogOpen(false)}
      />
    </Box>
  );
};

export default TimeEntriesPage;
