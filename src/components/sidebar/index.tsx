import { useContext } from "react";
import { useGo, useLogout } from "@refinedev/core";
import { ColorModeContext } from "@contexts/color-mode";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import DarkModeOutlined from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlined from "@mui/icons-material/LightModeOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import { useLocation } from "react-router";

const drawerWidth = 280;

export const CustomSidebar = () => {
  const go = useGo();
  const location = useLocation();
  const { mode, toggleColorMode } = useContext(ColorModeContext);
  const { mutate: logout } = useLogout();

  const menuItems = [
    {
      label: "Dashboard",
      icon: <DashboardOutlinedIcon />,
      onClick: () => go({ to: "/" }),
      path: "/",
    },
    {
      label: "Music Library",
      icon: <LibraryMusicIcon />,
      onClick: () => go({ to: "/music" }),
      path: "/music",
    },
    {
      label: "Spinwheel",
      icon: <StorefrontOutlinedIcon />,
      onClick: () => go({ to: "/spinwheel" }),
      path: "/spinwheel",
    },
    {
      label: "Lazy Loading",
      icon: <AccountBalanceOutlinedIcon />,
      onClick: () => go({ to: "/lazy" }),
      path: "/lazy",
    },
    {
      label: "Storyboard",
      icon: <PeopleOutlinedIcon />,
      onClick: () => go({ to: "/storyboard" }),
      path: "/storyboard",
    },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          bgcolor: mode === "dark" ? "#1e1e1e" : "#f5f5f5",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          gap: 1,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <HomeOutlinedIcon sx={{ fontSize: 32, color: "primary.main" }} />
        <Typography fontWeight="bold">
          Admin Dashboard
        </Typography>
      </Box>

      {/* Theme Toggle */}
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            bgcolor: mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
            borderRadius: 3,
            p: 0.5,
            position: "relative",
            cursor: "pointer",
          }}
          onClick={toggleColorMode}
        >
          <Box
            sx={{
              position: "absolute",
              width: "50%",
              height: "calc(100% - 8px)",
              bgcolor: "primary.main",
              borderRadius: 2.5,
              transition: "transform 0.3s ease",
              transform: mode === "dark" ? "translateX(0)" : "translateX(100%)",
              left: 4,
            }}
          />
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.5,
              py: 1,
              zIndex: 1,
              color: mode === "dark" ? "white" : "text.secondary",
              transition: "color 0.3s ease",
            }}
          >
            <DarkModeOutlined sx={{ fontSize: 18 }} />
            <Typography variant="caption" fontWeight={600}>
              Dark
            </Typography>
          </Box>
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.5,
              py: 1,
              zIndex: 1,
              color: mode === "light" ? "white" : "text.secondary",
              transition: "color 0.3s ease",
            }}
          >
            <LightModeOutlined sx={{ fontSize: 18 }} />
            <Typography variant="caption" fontWeight={600}>
              Light
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Menu Items */}
      <List sx={{ flex: 1, pt: 1 }}>
        {menuItems.map((item, index) => (
          <ListItemButton
            key={index}
            onClick={item.onClick}
            selected={item.path ? location.pathname === item.path : false}
            sx={{
              mx: 1,
              mb: 0.5,
              borderRadius: 1,
              "&:hover": {
                bgcolor: mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
              },
              "&.Mui-selected": {
                bgcolor: "primary.main",
                "&:hover": {
                  bgcolor: "primary.dark",
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: "text.primary" }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontSize: 14,
                fontWeight: 500,
              }}
            />
          </ListItemButton>
        ))}
      </List>

      {/* Logout Button */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
        <Button
          fullWidth
          color="error"
          endIcon={<LogoutOutlinedIcon />}
          onClick={() => logout()}
          sx={{
            justifyContent: "flex-end",
            textTransform: "none",
            fontWeight: 500,
          }}
        >
          Logout
        </Button>
      </Box>
    </Drawer>
  );
};