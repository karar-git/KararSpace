import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { ScrollToTop } from '@/lib/scroll-to-top';
import HomePage from '@/components/pages/HomePage';
import WritingPage from '@/components/pages/WritingPage';
import ArticleDetailPage from '@/components/pages/ArticleDetailPage';
import IdeasPage from '@/components/pages/IdeasPage';
import IdeaDetailPage from '@/components/pages/IdeaDetailPage';
import ProjectsPage from '@/components/pages/ProjectsPage';
import ProjectDetailPage from '@/components/pages/ProjectDetailPage';
import ResearchPage from '@/components/pages/ResearchPage';
import ResearchDetailPage from '@/components/pages/ResearchDetailPage';
import LifePage from '@/components/pages/LifePage';
import LifeDetailPage from '@/components/pages/LifeDetailPage';
import CertificatesPage from '@/components/pages/CertificatesPage';
import NowPage from '@/components/pages/NowPage';
import OpportunitiesPage from '@/components/pages/OpportunitiesPage';

// Simple error fallback
function ErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-medium text-foreground mb-4">404</h1>
        <p className="text-muted mb-6">Page not found.</p>
        <a href="/" className="text-muted hover:text-foreground transition-colors">
          Go back home
        </a>
      </div>
    </div>
  );
}

// Layout component that includes ScrollToTop
function Layout() {
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "writing",
        element: <WritingPage />,
      },
      {
        path: "writing/:id",
        element: <ArticleDetailPage />,
      },
      {
        path: "ideas",
        element: <IdeasPage />,
      },
      {
        path: "ideas/:id",
        element: <IdeaDetailPage />,
      },
      {
        path: "projects",
        element: <ProjectsPage />,
      },
      {
        path: "projects/:id",
        element: <ProjectDetailPage />,
      },
      {
        path: "research",
        element: <ResearchPage />,
      },
      {
        path: "research/:id",
        element: <ResearchDetailPage />,
      },
      {
        path: "life",
        element: <LifePage />,
      },
      {
        path: "life/:id",
        element: <LifeDetailPage />,
      },
      {
        path: "certificates",
        element: <CertificatesPage />,
      },
      {
        path: "now",
        element: <NowPage />,
      },
      {
        path: "opportunities",
        element: <OpportunitiesPage />,
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

export default function AppRouter() {
  return (
    <RouterProvider router={router} />
  );
}
