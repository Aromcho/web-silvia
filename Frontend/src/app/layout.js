import "./globals.css";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import Script from "next/script";
import AttributionCapture from "../components/Attribution/AttributionCapture";

const SITE = "https://www.silviafernandezpropiedades.com.ar";
const DEFAULT_TITLE = "Silvia Fernández Propiedades - Inmobiliaria en Mar Azul y Mar de las Pampas";
const DEFAULT_DESCRIPTION = "Inmobiliaria con oficinas en Mar Azul y Mar de las Pampas: casas, lotes, complejos y alquileres temporarios en Mar Azul, Las Gaviotas, Mar de las Pampas y Villa Gesell.";

export const metadata = {
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  keywords: "inmobiliaria Mar Azul, inmobiliaria Mar de las Pampas, casas en venta Mar Azul, lotes Mar de las Pampas, alquiler temporario Mar Azul, Las Gaviotas, Villa Gesell, Silvia Fernández",
  authors: [{ name: "Silvia Fernández Propiedades" }],
  metadataBase: new URL(SITE),
  icons: {
    icon: "/assets/images/logo.jpg",
  },
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: SITE,
    siteName: "Silvia Fernández Propiedades",
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  // Search Console: el código de la etiqueta HTML va en GOOGLE_SITE_VERIFICATION (.env del VPS)
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
  other: {
    "facebook-domain-verification": "44lai038bjh2b1wjogfzl4mdvkir56",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

// La inmobiliaria para Google (ficha de empresa, zonas, oficinas, redes) y el sitio
const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "RealEstateAgent",
      "@id": `${SITE}/#inmobiliaria`,
      name: "Silvia Fernández Propiedades",
      alternateName: "Silvia Fernández Inmobiliaria",
      url: SITE,
      logo: `${SITE}/assets/images/logo.jpg`,
      image: `${SITE}/assets/images/oficinas/central-portada.webp`,
      telephone: "+54 9 2255 50-9408",
      email: "braicesfernandez@gmail.com",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Calle 34 y Mar del Plata",
        addressLocality: "Mar Azul",
        addressRegion: "Buenos Aires",
        addressCountry: "AR",
      },
      areaServed: ["Mar Azul", "Las Gaviotas", "Mar de las Pampas", "Villa Gesell"].map((name) => ({ "@type": "Place", name })),
      sameAs: [
        "https://www.facebook.com/Silviafernadezpropiedades/",
        "https://www.instagram.com/silviafernandezpropiedades/",
      ],
      department: {
        "@type": "RealEstateAgent",
        "@id": `${SITE}/#sucursal-mar-de-las-pampas`,
        name: "Silvia Fernández Propiedades - Sucursal boutique Mar de las Pampas",
        url: SITE,
        image: `${SITE}/assets/images/oficinas/boutique-portada.webp`,
        telephone: "+54 9 2255 50-9408",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Av. del Plata y Uritorco",
          addressLocality: "Mar de las Pampas",
          addressRegion: "Buenos Aires",
          addressCountry: "AR",
        },
        geo: { "@type": "GeoCoordinates", latitude: -37.3187797, longitude: -57.0311899 },
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE}/#sitio`,
      url: SITE,
      name: "Silvia Fernández Propiedades",
      inLanguage: "es-AR",
      publisher: { "@id": `${SITE}/#inmobiliaria` },
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="es-AR">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSON_LD) }}
        />
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