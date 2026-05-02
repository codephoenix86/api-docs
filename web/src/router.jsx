import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell.jsx'
import { HomePage } from '@/pages/HomePage.jsx'
import { ApiOverviewPage } from '@/pages/ApiOverviewPage.jsx'
import { OperationPage } from '@/pages/OperationPage.jsx'
import { EventPage } from '@/pages/EventPage.jsx'
import { SchemaPage, SchemaIndexPage } from '@/pages/SchemaPage.jsx'
import { GuidePage, GuideIndexPage } from '@/pages/GuidePage.jsx'
import { ChangelogPage } from '@/pages/ChangelogPage.jsx'
import { ErrorsPage } from '@/pages/ErrorsPage.jsx'
import { TagPage } from '@/pages/TagPage.jsx'
import { NotFoundPage } from '@/pages/NotFoundPage.jsx'

export function createRouter() {
  return createBrowserRouter(
    [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <HomePage /> },
          { path: ':api', element: <ApiOverviewPage /> },
          { path: ':api/rest/:tag', element: <TagPage /> },
          { path: ':api/rest/:tag/:operationId', element: <OperationPage /> },
          { path: ':api/events/:operationId', element: <EventPage /> },
          { path: ':api/schemas', element: <SchemaIndexPage /> },
          { path: ':api/schemas/:name', element: <SchemaPage /> },
          { path: ':api/guides', element: <GuideIndexPage /> },
          { path: ':api/guides/:slug', element: <GuidePage /> },
          { path: ':api/changelog', element: <ChangelogPage /> },
          { path: ':api/errors', element: <ErrorsPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
    { basename: trimSlash(import.meta.env.BASE_URL ?? '/') },
  )
}

function trimSlash(s) {
  return s === '/' ? undefined : s.replace(/\/+$/, '')
}
