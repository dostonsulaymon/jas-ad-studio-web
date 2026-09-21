import type { Metadata } from 'next';
import { AdminPanel } from '@/components/admin/admin-panel';
import { t } from '@/lib/i18n';

export const metadata: Metadata = { title: `${t.admin.title} | Promptly`, robots: { index: false } };

export default function AdminPage() {
  return (
    <main id="asosiy" className="px-4 sm:px-6 lg:px-8">
      <AdminPanel />
    </main>
  );
}
