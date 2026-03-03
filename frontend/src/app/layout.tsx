import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'YouApp',
  description: 'Connect with people around you',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Outer wrapper - centers the mobile frame on desktop */}
        <div className="min-h-screen bg-black flex justify-center">
          {/* Mobile frame - fixed 375px width like iPhone 13 mini */}
          <div className="w-[375px] min-h-screen relative bg-youapp-dark overflow-hidden shadow-2xl">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
