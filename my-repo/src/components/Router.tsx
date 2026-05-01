import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { ScrollToTop } from '@/lib/scroll-to-top';
import HomePage from '@/components/pages/HomePage';
import WritingPage from '@/components/pages/WritingPage';
import ArticleDetailPage from '@/components/pages/ArticleDetailPage';
import ProjectsPage from '@/components/pages/ProjectsPage';
import ProjectDetailPage from '@/components/pages/ProjectDetailPage';
import ResearchPage from '@/components/pages/ResearchPage';
import ResearchDetailPage from '@/components/pages/ResearchDetailPage';
import CertificatesPage from '@/components/pages/CertificatesPage';
import OpportunitiesPage from '@/components/pages/OpportunitiesPage';
import HuaweiFreeCertificationsIraqPage from '@/components/pages/HuaweiFreeCertificationsIraqPage';
import ExperiencePage from '@/components/pages/ExperiencePage';

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
        path: "certificates",
        element: <CertificatesPage />,
      },
      {
        path: "experience",
        element: <ExperiencePage />,
      },
      {
        path: "opportunities",
        element: <OpportunitiesPage />,
      },
      {
        path: "huawei-free-certifications-iraq",
        element: <HuaweiFreeCertificationsIraqPage />,
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
