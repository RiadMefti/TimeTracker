import type { FC } from "react";
import {
  Box,
  Button,
  Paper,
  Typography,
  CircularProgress,
} from "@mui/material";
import { Navigate } from "react-router-dom";

import Logo from "../assets/logo/timer.svg";
import { useAuth } from "../hooks/useAuth";
import { useUserStore } from "../stores/userStore";
import { auth } from "../firebase";

const LoginPage: FC = () => {
  const { signInWithGoogle } = useAuth(auth);
  const { user, authInitialized } = useUserStore();

  if (!authInitialized) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "background.default",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          p: 4,
          maxWidth: 400,
          width: "100%",
          borderRadius: 2,
        }}
      >
        <img
          src={Logo}
          alt="Logo"
          style={{
            width: 60,
            height: 60,
            filter: "invert(1)",
            marginBottom: "16px",
          }}
        />
        <Typography
          variant="h5"
          component="h1"
          sx={{ mb: 3, fontWeight: "bold" }}
        >
          Time-Tracker
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, textAlign: "center" }}>
          Sign in to track your time, manage projects, and boost your
          productivity
        </Typography>
        <Button
          variant="contained"
          size="large"
          fullWidth
          sx={{ py: 1.5 }}
          onClick={() => signInWithGoogle()}
        >
          Sign in with Google
        </Button>
      </Paper>
    </Box>
  );
};

export default LoginPage;
