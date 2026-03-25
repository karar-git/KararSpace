import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { ScrollToTop } from '@/lib/scroll-to-top';
import ErrorPage from '@/integrations/errorHandlers/ErrorPage';
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
        routeMetadata: {
          pageIdentifier: 'home',
        },
      },
      {
        path: "writing",
        element: <WritingPage />,
        routeMetadata: {
          pageIdentifier: 'writing',
        },
      },
      {
        path: "writing/:id",
        element: <ArticleDetailPage />,
        routeMetadata: {
          pageIdentifier: 'article-detail',
        },
      },
      {
        path: "ideas",
        element: <IdeasPage />,
        routeMetadata: {
          pageIdentifier: 'ideas',
        },
      },
      {
        path: "ideas/:id",
        element: <IdeaDetailPage />,
        routeMetadata: {
          pageIdentifier: 'idea-detail',
        },
      },
      {
        path: "projects",
        element: <ProjectsPage />,
        routeMetadata: {
          pageIdentifier: 'projects',
        },
      },
      {
        path: "projects/:id",
        element: <ProjectDetailPage />,
        routeMetadata: {
          pageIdentifier: 'project-detail',
        },
      },
      {
        path: "research",
        element: <ResearchPage />,
        routeMetadata: {
          pageIdentifier: 'research',
        },
      },
      {
        path: "research/:id",
        element: <ResearchDetailPage />,
        routeMetadata: {
          pageIdentifier: 'research-detail',
        },
      },
      {
        path: "life",
        element: <LifePage />,
        routeMetadata: {
          pageIdentifier: 'life',
        },
      },
      {
        path: "life/:id",
        element: <LifeDetailPage />,
        routeMetadata: {
          pageIdentifier: 'life-detail',
        },
      },
      {
        path: "certificates",
        element: <CertificatesPage />,
        routeMetadata: {
          pageIdentifier: 'certificates',
        },
      },
      {
        path: "now",
        element: <NowPage />,
        routeMetadata: {
          pageIdentifier: 'now',
        },
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
], {
  basename: import.meta.env.BASE_NAME,
});

export default function AppRouter() {
  return (
    <RouterProvider router={router} />
  );
}
