import type { Metadata } from 'next';

// Zone privée / non destinée à Google : jamais indexée (voir aussi app/robots.ts).
export const metadata: Metadata = { robots: { index: false, follow: true } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
