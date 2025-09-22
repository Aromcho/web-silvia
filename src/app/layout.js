import "./globals.css";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";

export const metadata = {
  title: "Silvia Fernández - Inmobiliaria",
  description: "Más de 15 años de experiencia en el mercado inmobiliario. Encontrá tu hogar ideal con Silvia Fernández.",
  keywords: "inmobiliaria, propiedades, casas, departamentos, venta, alquiler, Silvia Fernández",
  author: "Silvia Fernández",
  viewport: "width=device-width, initial-scale=1",
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
      </body>
    </html>
  );
}