import {
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import ListItemIcon from "@mui/material/ListItemIcon";
import Logo from "../../assets/logo/timer.svg";
import LogoutIcon from "@mui/icons-material/Logout";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TimerIcon from "@mui/icons-material/Timer";
import WorkIcon from "@mui/icons-material/Work";
import DescriptionIcon from "@mui/icons-material/Description";
import PersonIcon from "@mui/icons-material/Person";
import type { FC } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { auth } from "../../firebase";
import Chronometer from "../chronometer/Chronometer";

interface MenuItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  color?: string;
}

const Menu: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth(auth);

  const menuItems: MenuItem[] = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <DashboardIcon />,
      color: "#4CAF50", // Green
    },
    {
      name: "Time Entries",
      path: "/time-entries",
      icon: <AccessTimeIcon />,
      color: "#FF9800", // Orange
    },
    {
      name: "Time Boxing",
      path: "/time-boxing",
      icon: <TimerIcon />,
      color: "#E91E63", // Pink
    },
    {
      name: "Projects",
      path: "/projects",
      icon: <WorkIcon />,
      color: "#9C27B0", // Purple
    },
    {
      name: "Documents",
      path: "/documents",
      icon: <DescriptionIcon />,
      color: "#2196F3", // Blue (different from the theme blue)
    },
    {
      name: "Profile",
      path: "/profile",
      icon: <PersonIcon />,
      color: "#607D8B", // Blue Grey
    },
  ];

  const handleMenuItemClick = (path: string) => {
    navigate(path);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <Drawer
      sx={{
        width: 300,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 300,
          display: "flex",
          flexDirection: "column",
        },
      }}
      variant="persistent"
      anchor="left"
      open={true}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          padding: "1rem",
        }}
      >
        <img
          src={Logo}
          alt="Logo"
          style={{
            width: 36,
            height: 36,
            filter: "invert(1)", //white color the svg
          }}
        />
        <Typography
          variant="h6"
          sx={{
            color: "white",
            fontWeight: "bold",
            letterSpacing: "0.5px",
            userSelect: "none",
          }}
        >
          Time-Tracker
        </Typography>
      </Box>

      <Divider />

      {/* Compact Chronometer */}
      <Box sx={{ p: 2 }}>
        <Chronometer variant="compact" />
      </Box>

      <Divider />

      {/* Menu Items */}
      <List sx={{ px: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.name} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => handleMenuItemClick(item.path)}
              disableRipple
              sx={{
                borderRadius: 1,
                backgroundColor: isActive(item.path)
                  ? "rgba(10, 125, 255, 0.2)"
                  : "transparent",
                "&:hover": {
                  backgroundColor: isActive(item.path)
                    ? "rgba(10, 125, 255, 0.3)"
                    : "rgba(255, 255, 255, 0.08)",
                },
                transition: "background-color 0.2s",
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: isActive(item.path) ? "#0a7dff" : (item.color || "inherit"),
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.name}
                slotProps={{
                  primary: {
                    style: {
                      fontWeight: isActive(item.path) ? 600 : 400,
                      fontSize: "0.95rem",
                    },
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Spacer to push footer to bottom */}
      <Box sx={{ flexGrow: 1 }} />

      {/* Footer */}
      <Box sx={{ mt: "auto" }}>
        <Divider />
        <List>
          <ListItem disablePadding>
            <ListItemButton
              onClick={handleLogout}
              disableRipple
              sx={{
                borderRadius: 1,
                mx: 1,
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                },
                transition: "background-color 0.2s",
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: "#f44336" }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText
                primary="Logout"
                slotProps={{
                  primary: {
                    style: {
                      fontSize: "0.95rem",
                    },
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
};

export default Menu;
