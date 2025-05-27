import { createTheme } from "@mui/material";

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#0a7dff",
    },
    secondary: {
      main: "#223139",
    },
    background: {
      default: "#0D1D27",
      paper: "#0D1D27",
    },
    text: {
      primary: "#ffffff",
      secondary: "rgba(255, 255, 255, 0.7)",
    },
  },
  typography: {
    fontFamily: 'Poppins, Roboto, "Helvetica Neue", sans-serif',
  },
  components: {
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundImage: "none",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#1a2c38",
        },
      },
    },
    // TextField styling
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(26, 44, 56, 0.7)",
          borderRadius: "12px",
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundColor: "rgba(26, 44, 56, 0.9)",
          },
          "&.Mui-focused": {
            backgroundColor: "#1a2c38",
            boxShadow: "0 0 0 2px rgba(10, 125, 255, 0.25)",
          },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(255, 255, 255, 0.15)",
            transition: "all 0.2s ease",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(10, 125, 255, 0.5)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#0a7dff",
          },
        },
        input: {
          color: "rgba(255, 255, 255, 0.9)",
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
        size: "small",
      },
      styleOverrides: {
        root: {
          "& label": {
            color: "rgba(255, 255, 255, 0.6)",
            "&.Mui-focused": {
              color: "#0a7dff",
            },
          },
        },
      },
    },
    // Select styling
    MuiSelect: {
      styleOverrides: {
        select: {
          color: "rgba(255, 255, 255, 0.9)",
        },
        icon: {
          color: "rgba(255, 255, 255, 0.6)",
        },
      },
      defaultProps: {
        size: "small",
        MenuProps: {
          slotProps: {
            paper: {
              sx: {
                backgroundColor: "#1a2c38",
                backgroundImage: "none",
                boxShadow: "0 8px 16px rgba(0, 0, 0, 0.3)",
              },
            },
          },
        },
      },
    },
    // Menu item styling for dropdowns
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: "rgba(255, 255, 255, 0.9)",
          "&:hover": {
            backgroundColor: "rgba(10, 125, 255, 0.1)",
          },
          "&.Mui-selected": {
            backgroundColor: "rgba(10, 125, 255, 0.2)",
            "&:hover": {
              backgroundColor: "rgba(10, 125, 255, 0.3)",
            },
          },
        },
      },
    },
    // Form label styling
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "rgba(255, 255, 255, 0.6)",
          "&.Mui-focused": {
            color: "#0a7dff",
          },
        },
      },
    },
    // Form control styling
    MuiFormControl: {
      defaultProps: {
        size: "small",
      },
    },
    // Icon button styling
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: "all 0.2s ease",
          "&:hover": {
            transform: "scale(1.05)",
          },
        },
      },
    },
  },
});
