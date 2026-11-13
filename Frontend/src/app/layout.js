import "./globals.css";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import Script from "next/script";
import AttributionCapture from "../components/Attribution/AttributionCapture";

export const metadata = {
  title: "Silvia Fernández - Inmobiliaria",
  description: "Más de 15 años de experiencia en el mercado inmobiliario. Encontrá tu hogar ideal con Silvia Fernández.",
  keywords: "inmobiliaria, propiedades, casas, departamentos, venta, alquiler, Silvia Fernández",
  author: "Silvia Fernández",
  viewport: "width=device-width, initial-scale=1",
  metadataBase: new URL("https://www.silviafernandezpropiedades.com.ar"),
  icons: {
    icon: "/assets/images/logo.jpg",
  },
  openGraph: {
    title: "Silvia Fernández - Inmobiliaria",
    description: "Más de 15 años de experiencia en el mercado inmobiliario. Encontrá tu hogar ideal con Silvia Fernández.",
    url: "https://www.silviafernandezpropiedades.com.ar",
    siteName: "Silvia Fernández Inmobiliaria",
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Silvia Fernández - Inmobiliaria",
    description: "Más de 15 años de experiencia en el mercado inmobiliario. Encontrá tu hogar ideal con Silvia Fernández.",
  },
  other: {
    "facebook-domain-verification": "44lai038bjh2b1wjogfzl4mdvkir56",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="antialiased">
        <Header />
        <main>
          {children}
        </main>
        <Footer />

        {/* Google Analytics 4 */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
            gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}');
          `}
        </Script>

        {/* Origen de cada consulta (X6) */}
        <AttributionCapture />

        {/* Meta Pixel: se activa solo cuando se configura NEXT_PUBLIC_META_PIXEL_ID */}
        {process.env.NEXT_PUBLIC_META_PIXEL_ID && (
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
              n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
              document,'script','https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID}');
              fbq('track', 'PageView');
            `}
          </Script>
        )}
      </body>
    </html>
  );
}