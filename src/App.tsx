import { 
    Refine,
    GitHubBanner, 
    WelcomePage,
    Authenticated, 
} from '@refinedev/core';
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

    import { AuthPage,ErrorComponent
,useNotificationProvider
,RefineSnackbarProvider
,ThemedLayout} from '@refinedev/mui';

import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import { BrowserRouter, Route, Routes, Outlet } from "react-router";
import routerProvider, { NavigateToResource, CatchAllNavigate, UnsavedChangesNotifier, DocumentTitleHandler } from "@refinedev/react-router";
import { BlogPostList, BlogPostCreate, BlogPostEdit, BlogPostShow } from "./pages/blog-posts";
import { CategoryList, CategoryCreate, CategoryEdit, CategoryShow } from "./pages/categories";
import { dataProvider } from "./providers/data";
import { ColorModeContextProvider } from "./contexts/color-mode";
import { Header } from "./components/header";





function App() {
    

    
    
    return (
        <BrowserRouter>
        <GitHubBanner />
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
                                name: "blog_posts",
                                list: "/blog-posts",
                                create: "/blog-posts/create",
                                edit: "/blog-posts/edit/:id",
                                show: "/blog-posts/show/:id",
                                meta: {
                                    canDelete: true,
                                },
                            },
                            {
                                name: "categories",
                                list: "/categories",
                                create: "/categories/create",
                                edit: "/categories/edit/:id",
                                show: "/categories/show/:id",
                                meta: {
                                    canDelete: true,
                                },
                            },
                        ]}
                    options={{
                        syncWithLocation: true,
                        warnWhenUnsavedChanges: true,
                            projectId: "eqvIE8-v2nQOF-Q7zogC",
                        
                    }}
                >

                    <Routes>
                        <Route
                            element={(
                                    <ThemedLayout
                                        Header={() => <Header sticky />}
                                    >
                                        <Outlet />
                                    </ThemedLayout>
                            )}
                        >
                            <Route index element={
                                    <NavigateToResource resource="blog_posts" />
                            } />
                            <Route path="/blog-posts">
                                <Route index element={<BlogPostList />} />
                                <Route path="create" element={<BlogPostCreate />} />
                                <Route path="edit/:id" element={<BlogPostEdit />} />
                                <Route path="show/:id" element={<BlogPostShow />} />
                            </Route>
                            <Route path="/categories">
                                <Route index element={<CategoryList />} />
                                <Route path="create" element={<CategoryCreate />} />
                                <Route path="edit/:id" element={<CategoryEdit />} />
                                <Route path="show/:id" element={<CategoryShow />} />
                            </Route>
                            <Route path="*" element={<ErrorComponent />} />
                        </Route>
                    </Routes> 

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
