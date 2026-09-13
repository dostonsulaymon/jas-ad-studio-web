export const ADMIN_TABS = ['orders', 'grants', 'settings', 'gallery', 'hero', 'users', 'reports'] as const;
export type AdminTab = (typeof ADMIN_TABS)[number];

/** The open tab lives in the URL hash so a refresh or a pasted link lands on the same tab. */
export function tabFromHash(hash: string): AdminTab {
  const id = hash.replace(/^#/, '');
  return (ADMIN_TABS as readonly string[]).includes(id) ? (id as AdminTab) : 'orders';
}
