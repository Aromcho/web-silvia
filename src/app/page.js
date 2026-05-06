import Hero from '../components/Hero/Hero';
import Offices from '../components/Offices/Offices';
import Properties from '../components/Properties/Properties';
import Contact from '../components/Contact/Contact';

export const metadata = {
  title: 'Silvia Fernández - Inmobiliaria en Mar de las Pampas y Mar Azul',
  description: 'Explorá propiedades en venta y alquiler en Mar de las Pampas, Mar Azul y zonas cercanas. Asesoramiento inmobiliario profesional y personalizado.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Silvia Fernández - Inmobiliaria en Mar de las Pampas y Mar Azul',
    description: 'Explorá propiedades en venta y alquiler en Mar de las Pampas, Mar Azul y zonas cercanas. Asesoramiento inmobiliario profesional y personalizado.',
    url: '/',
    type: 'website',
  },
};

export default function Home() {
  return (
    <>
      <Hero />
      <Offices />
      <Properties />
      <Contact />
    </>
  );
}