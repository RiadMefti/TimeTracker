import type { FC, ReactNode } from "react";
import { Box } from "@mui/material";
import Menu from "../menu/Menu";
import { Navigate } from "react-router-dom";
import { useUserStore } from "../../stores/userStore";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  const { user } = useUserStore();

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
