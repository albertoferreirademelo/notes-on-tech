import type { Metadata } from 'next';
import { Geist, Geist_Mono, Cormorant_Garamond } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const editorial = Cormorant_Garamond({
  variable: '--font-editorial',
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
});

// The site talks to no one but itself: no third-party scripts, fonts, frames,
// or requests, and nothing can be submitted from it. GitHub Pages cannot send
// headers, so the policy is declared in the page. Inline is allowed because the
// framework boots from inline script and components set inline styles.
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
].join('; ');

export const metadata: Metadata = {
  title: 'Alberto Ferreira de Melo — It starts with a question',
  description:
    'Questions, small experiments, and what they taught. The personal site of Alberto Ferreira de Melo Filho: data, physical computing, and learning by building.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="icon"
          href="/favicon.svg?v=anvil-bird-20261014"
          type="image/svg+xml"
        />
        {process.env.NODE_ENV === 'production' && (
          <meta
            httpEquiv="Content-Security-Policy"
            content={contentSecurityPolicy}
          />
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${editorial.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
