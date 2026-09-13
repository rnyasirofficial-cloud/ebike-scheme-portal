import type { Metadata } from 'next';
import { Lora } from 'next/font/google';
import '@/styles/globals.css';
import { AuthProvider } from '@/lib/auth-context';
import Navbar from '@/components/layout/Navbar';

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Chief Minister Punjab E-Bike Scheme Portal | Government of Punjab',
  description:
    'Official government portal for Punjab university students to apply, track eligibility, and receive subsidized electric bikes under the provincial green mobility initiative.',
  keywords: [
    'Punjab E-Bike Scheme',
    'Student Electric Bike',
    'HEC Punjab Universities',
    'Government of Punjab',
    'Green Mobility Initiative',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={lora.variable}>
      <body className="min-h-screen flex flex-col font-sans selection:bg-[#0E8C82] selection:text-white">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 flex flex-col">
            {children}
          </main>
          <footer className="bg-slate-900 text-slate-400 py-6 border-t border-slate-800 text-center text-xs">
            <div className="max-w-7xl mx-auto px-4">
              <p className="font-semibold text-slate-300">
                Government of the Punjab — Transport Department & Punjab Information Technology Board (PITB)
              </p>
              <p className="mt-1 text-slate-500">
                Chief Minister Green Transport & Youth Mobility Initiative © 2026. All Rights Reserved.
              </p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
