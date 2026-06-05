import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { RoleProvider } from '@/components/RoleContext';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'KALOVA - Campaign Promo Dashboard',
  description: 'Workflow strategi promosi campaign KALOVA',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <RoleProvider>
          <Navbar />
          <main className="p-6">{children}</main>
        </RoleProvider>
      </body>
    </html>
  );
}
