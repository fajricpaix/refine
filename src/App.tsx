import {
  Refine
} from '@refinedev/core';
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import routerProvider, { DocumentTitleHandler, UnsavedChangesNotifier } from "@refinedev/react-router";
import { BrowserRouter, Route, Routes } from "react-router";

import {
  ErrorComponent,
  RefineSnackbarProvider,
  useNotificationProvider
} from '@refinedev/mui';

import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import MoneyOutlinedIcon from "@mui/icons-material/MoneyOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import LibraryMusicOutlinedIcon from "@mui/icons-material/LibraryMusicOutlined";
import QueueMusicOutlinedIcon from "@mui/icons-material/QueueMusicOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import AlbumOutlinedIcon from "@mui/icons-material/AlbumOutlined";

import { ColorModeContextProvider } from "@contexts/color-mode";
import { dataProvider } from "@providers/data";

import { CustomSidebar } from '@components/sidebar';
import Dashboard from '@pages/dashboard';
import { SpinWheel } from '@pages/spinwheels';
import Storyboard from '@pages/storyboard';
import LazyLoad from '@pages/lazyload';
import Music from '@pages/music';

function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <CssBaseline />
          <GlobalStyles styles={{ html: { WebkitFontSmoothing: "auto" } }} />
          <RefineSnackbarProvider>
            <DevtoolsProvider>
              <Refine
                dataProvider={dataProvider}
                notificationProvider={useNotificationProvider}
                routerProvider={routerProvider}
                resources={[
                  {
                    name: "ggr",
                    list: "/ggr",
                    meta: {
                      label: "GGR",
                      icon: <MoneyOutlinedIcon />,
                    },
                  },
                  {
                    name: "client-menu",
                    list: "/client-menu",
                    meta: {
                      label: "Client Menu",
                      icon: <PeopleOutlinedIcon />,
                    },
                  },
                  // ── Music Library resources ──
                  {
                    name: "music",
                    meta: {
                      label: "Music Library",
                      icon: <LibraryMusicOutlinedIcon />,
                    },
                  },
                  {
                    name: "tracks",
                    list: "/music/tracks",
                    show: "/music/tracks/:id",
                    meta: {
                      label: "Track List",
                      icon: <QueueMusicOutlinedIcon />,
                      parent: "music",
                    },
                  },
                  {
                    name: "artists",
                    list: "/music/artists",
                    meta: {
                      label: "Artist List",
                      icon: <PersonOutlinedIcon />,
                      parent: "music",
                    },
                  },
                  {
                    name: "albums",
                    list: "/music/albums",
                    meta: {
                      label: "Album List",
                      icon: <AlbumOutlinedIcon />,
                      parent: "music",
                    },
                  },
                ]}
                options={{
                  syncWithLocation: true,
                  warnWhenUnsavedChanges: true,
                  projectId: "eqvIE8-v2nQOF-Q7zogC",
                }}
              >
                <Box sx={{ display: 'flex' }}>
                  <CustomSidebar />
                  <Box
                    component="main"
                    sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}
                  >
                    <Box sx={{ p: 3 }}>
                      <Routes>
                        {/* Existing routes */}
                        <Route index element={<Dashboard />} />
                        <Route path="/spinwheel" element={<SpinWheel />} />
                        <Route path="/lazy" element={<LazyLoad />} />
                        <Route path="/storyboard" element={<Storyboard />} />

                        {/* Music Library routes */}
                        <Route path="/music" element={<Music />} />

                        <Route path="*" element={<ErrorComponent />} />
                      </Routes>
                    </Box>
                  </Box>
                </Box>

                <RefineKbar />
                <UnsavedChangesNotifier />
                <DocumentTitleHandler />
              </Refine>
              <DevtoolsPanel />
            </DevtoolsProvider>
          </RefineSnackbarProvider>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
};

export default App;