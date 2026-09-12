'use client';

import { useCallback, useEffect, useState } from 'react';
import { SiteHeader } from './site-header';
import { ProjectsDrawer } from './projects-drawer';
import { Studio } from './studio/studio';
import { api, isApiError } from '@/lib/api/client';
import { t } from '@/lib/i18n';
import type { CurrentUserDto, ProjectSummaryDto } from '@/lib/brief';

/**
 * The one client island: session state, the header's account control, the drawer, and
 * the studio. Everything above and below it on the page stays server-rendered (spec §8).
 */
export function App({ hero, sections }: { hero: React.ReactNode; sections: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUserDto | null>(null);
  const [checking, setChecking] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectSummaryDto[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projectsError, setProjectsError] = useState<unknown>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get<CurrentUserDto>('/api/me')
      .then((me) => {
        if (!cancelled) setUser(me);
      })
      .catch((error: unknown) => {
        // A 401 here is the signed-out state, not a failure. Showing an error notice
        // to a visitor who has simply not signed in yet would be nonsense.
        if (!cancelled && isApiError(error) && error.code !== 'SESSION_EXPIRED') {
          // Anything else is worth knowing about, but still must not block the page.
          console.warn('/api/me', error.code);
        }
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loadProjects = useCallback(() => {
    setLoadingProjects(true);
    setProjectsError(null);
    api
      .get<ProjectSummaryDto[]>('/api/projects')
      .then(setProjects)
      .catch(setProjectsError)
      .finally(() => setLoadingProjects(false));
  }, []);

  const openDrawer = useCallback(() => {
    setDrawerOpen(true);
    loadProjects();
  }, [loadProjects]);

  const signOut = useCallback(async () => {
    try {
      await api.post('/api/auth/logout');
    } finally {
      window.location.reload();
    }
  }, []);

  return (
    <>
      <SiteHeader
        right={
          checking ? (
            <span aria-hidden className="h-5 w-24 animate-pulse rounded-full bg-stone-2" />
          ) : user ? (
            <>
              <button
                type="button"
                onClick={openDrawer}
                className="inline-flex h-11 items-center rounded-sm border border-border bg-white px-4 text-[14.5px] font-semibold"
              >
                {t.nav.projects}
              </button>
              <button
                type="button"
                onClick={signOut}
                className="inline-flex h-11 items-center rounded-sm px-3 text-[14.5px] font-semibold text-muted hover:text-ink"
              >
                {t.nav.signOut}
              </button>
            </>
          ) : (
            // A full-page navigation, never fetch: this 302s to Google, and a fetch
            // would follow it into an opaque cross-origin response.
            <a
              href="/api/auth/google"
              className="inline-flex h-11 items-center rounded-sm px-3 text-[14.5px] font-semibold text-muted hover:text-ink"
            >
              {t.nav.signIn}
            </a>
          )
        }
      />

      <main id="asosiy">
        {hero}
        <Studio onSaved={() => loadProjects()} />
        {sections}
      </main>

      <ProjectsDrawer
        open={drawerOpen}
        projects={projects}
        loading={loadingProjects}
        error={projectsError}
        onClose={() => setDrawerOpen(false)}
        onRetry={loadProjects}
        onStart={() => {
          setDrawerOpen(false);
          document.getElementById('studiya-boshlash')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />
    </>
  );
}
