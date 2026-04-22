import { useEffect } from "react";
import { Route, Router, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { queryClient } from "./lib/queryClient";
import { SiteHeader } from "./components/SiteHeader";
import { SiteFooter } from "./components/SiteFooter";
import { ProtectedRoute } from "./components/ProtectedRoute";

import Home from "./pages/Home";
import DatasetDetail from "./pages/DatasetDetail";
import ArticleDetail from "./pages/ArticleDetail";
import { DatasetsPage, ArticlesPage } from "./pages/ListPage";
import AdminLogin from "./pages/Admin";
import AdminDashboard from "./pages/AdminDashboard";
import DatasetEditor from "./pages/DatasetEditor";
import ArticleEditor from "./pages/ArticleEditor";
import NotFound from "./pages/not-found";

const base = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");

export default function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <Router base={base}>
          <div className="min-h-screen flex flex-col">
            <SiteHeader />
            <main className="flex-1">
              <Switch>
                <Route path="/" component={Home} />
                <Route path="/datasets" component={DatasetsPage} />
                <Route path="/articles" component={ArticlesPage} />
                <Route path="/dataset/:slug" component={DatasetDetail} />
                <Route path="/article/:slug" component={ArticleDetail} />
                <Route path="/admin" component={AdminLogin} />
                <Route path="/admin/dashboard">
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                </Route>
                <Route path="/admin/datasets/new">
                  <ProtectedRoute>
                    <DatasetEditor />
                  </ProtectedRoute>
                </Route>
                <Route path="/admin/datasets/:id/edit">
                  <ProtectedRoute>
                    <DatasetEditor />
                  </ProtectedRoute>
                </Route>
                <Route path="/admin/articles/new">
                  <ProtectedRoute>
                    <ArticleEditor />
                  </ProtectedRoute>
                </Route>
                <Route path="/admin/articles/:id/edit">
                  <ProtectedRoute>
                    <ArticleEditor />
                  </ProtectedRoute>
                </Route>
                <Route component={NotFound} />
              </Switch>
            </main>
            <SiteFooter />
          </div>
        </Router>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
