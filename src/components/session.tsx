'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { api, isApiError } from '@/lib/api/client';
import type { Balance, CurrentUser, ProStatus } from '@/lib/api/types';
import { DRAFT_KEY, PROJECT_KEY } from '@/lib/gallery';
import { ProjectsDrawer } from './projects-drawer';
import { CreditsDrawer } from './credits-drawer';

export const STUDIO_PATH = '/studiya';

interface Session {
  status: 'loading' | 'signedOut' | 'signedIn';
  user: CurrentUser | null;
  balance: Balance | null;
  /** R-010: whether this viewer may open a PRO gallery prompt. False while loading and signed out. */
  hasPro: boolean;
  setBalance: (balance: Balance) => void;
  refreshBalance: () => void;
  openCredits: () => void;
  openProjects: () => void;
  signOut: () => Promise<void>;
  /** A project the seller chose in the drawer, waiting for the studio to open it. */
  requestedProjectId: string | null;
  openProject: (id: string) => void;
  clearRequestedProject: () => void;
}

const SessionContext = createContext<Session | null>(null);

/**
 * Session state, the balance, and the two drawers, shared by every page. The session is an httpOnly
 * cookie, so the only way to know who is here is `GET /api/me`; a 401 is the signed-out state, not an error.
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<Session['status']>('loading');
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [creditsOpen, setCreditsOpen] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [requestedProjectId, setRequestedProjectId] = useState<string | null>(null);
  const [hasPro, setHasPro] = useState(false);

  const refreshBalance = useCallback(() => {
    api
      .get<Balance>('/api/credits/balance')
      .then(setBalance)
      .catch(() => {
        /* the credits drawer reports this properly */
      });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    api
      .get<CurrentUser>('/api/me', { signal: controller.signal })
      .then((me) => {
        setUser(me);
        setStatus('signedIn');
        refreshBalance();
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        if (isApiError(error) && error.code !== 'SESSION_EXPIRED') console.warn('/api/me', error.code);
        setStatus('signedOut');
      });
    return () => controller.abort();
  }, [refreshBalance]);

  /**
   * Asked separately from `/api/me`, and asked even when signed out: the route answers
   * `hasPro: false` rather than 401, so the gallery renders the same way in both cases
   * instead of treating "not signed in" as an error to recover from.
   */
  useEffect(() => {
    const controller = new AbortController();
    api
      .get<ProStatus>('/api/pro/me', { signal: controller.signal })
      .then((pro) => setHasPro(pro.hasPro))
      .catch(() => {
        /* no PRO is the safe answer, and the locked panel explains itself */
      });
    return () => controller.abort();
  }, []);

  const signOut = useCallback(async () => {
    try {
      await api.post('/api/auth/logout');
    } catch {
      /* the cookie may already be gone; the local session is cleared either way */
    }
    // The brief and project id live in sessionStorage; on a shared phone they must not outlive the session.
    try {
      sessionStorage.removeItem(DRAFT_KEY);
      sessionStorage.removeItem(PROJECT_KEY);
    } catch {
      /* blocked storage */
    }
    setUser(null);
    setBalance(null);
    setStatus('signedOut');
    router.push('/');
    router.refresh();
  }, [router]);

  const openProject = useCallback(
    (id: string) => {
      setRequestedProjectId(id);
      setProjectsOpen(false);
      if (pathname !== STUDIO_PATH) router.push(STUDIO_PATH);
    },
    [pathname, router],
  );

  const value = useMemo<Session>(
    () => ({
      hasPro,
      status,
      user,
      balance,
      setBalance,
      refreshBalance,
      openCredits: () => setCreditsOpen(true),
      openProjects: () => setProjectsOpen(true),
      signOut,
      requestedProjectId,
      openProject,
      clearRequestedProject: () => setRequestedProjectId(null),
    }),
    [status, user, balance, refreshBalance, signOut, requestedProjectId, openProject, hasPro],
  );

  return (
    <SessionContext.Provider value={value}>
      {children}
      {status === 'signedIn' ? (
        <>
          <CreditsDrawer open={creditsOpen} onClose={() => setCreditsOpen(false)} />
          <ProjectsDrawer
            open={projectsOpen}
            onClose={() => setProjectsOpen(false)}
            onOpenProject={openProject}
            onStart={() => {
              setProjectsOpen(false);
              router.push(STUDIO_PATH);
            }}
          />
        </>
      ) : null}
    </SessionContext.Provider>
  );
}

export function useSession(): Session {
  const session = useContext(SessionContext);
  if (!session) throw new Error('useSession outside SessionProvider');
  return session;
}
