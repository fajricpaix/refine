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

import { ColorModeContextProvider } from "@contexts/color-mode";
import { dataProvider } from "@providers/data";

import { CustomSidebar } from '@components/sidebar';
import Dashboard from '@pages/dashboard';
import Music from '@pages/music';
import MusicDetail from '@pages/music/detail';
import { SpinWheel } from '@pages/spinwheels';
import Storyboard from '@pages/storyboard';
import LazyLoad from '@pages/lazyload';
import { MemberManagement } from '@pages/member';
import MemberForm from '@pages/member/form';

function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <CssBaseline />
          <GlobalStyles styles={{ html: { WebkitFontSmoothing: "auto" } }} />
          <RefineSnackbarProvider>
            <DevtoolsProvider>
              <Refine dataProvider={dataProvider}
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
                ]}
                options={{
                  syncWithLocation: true,
                  warnWhenUnsavedChanges: true,
                  projectId: "eqvIE8-v2nQOF-Q7zogC",
                }}
              >
                <Box sx={{ display: 'flex' }}>
                  <CustomSidebar />
                  <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
                    <Box sx={{ p: 3 }}>
                      <Routes>
                        <Route index element={<Dashboard />} />
                        <Route path="/music" element={<Music />} />
                        <Route path="/music/:trackId" element={<MusicDetail />} />
                        <Route path="/member" element={<MemberManagement />} />
                        <Route path="/member/add" element={<MemberForm />} />
                        <Route path="/member/edit/:id" element={<MemberForm />} />
                        <Route path="/spinwheel" element={<SpinWheel />} />
                        <Route path="/lazy" element={<LazyLoad />} />
                        <Route path="/storyboard" element={<Storyboard />} />
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