import type { FC, ReactNode } from "react";
import { Box, CircularProgress } from "@mui/material";
import Menu from "../menu/Menu";
import { Navigate } from "react-router-dom";
import { useUserStore } from "../../stores/userStore";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: FC<MainLayoutProps> = ({ children }) => {
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

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <Box sx={{ display: "flex" }}>
      <Menu />
      <Box
        component="main"
        sx={{
          p: 3,
          minHeight: "100vh",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;
