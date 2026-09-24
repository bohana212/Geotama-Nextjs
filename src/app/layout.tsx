import type { Metadata, Viewport } from 'next';
import './catalog.css';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'GEOTAMA COMPUTER — Computer Store', template: '%s | GEOTAMA COMPUTER' },
  description: 'Computer Store, Laptop, PC, Printer, Networking dan kebutuhan IT.',
};

export const viewport: Viewport = { themeColor: '#0b1020' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
