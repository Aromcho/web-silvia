import Hero from '../components/Hero/Hero';
import Offices from '../components/Sections/OfficesSection';
import Properties from '../components/Properties/Properties';
import Contact from '../components/Sections/ContactSection';
import ZoneLinks from '../components/ZoneLinks/ZoneLinks';

const HOME_TITLE = 'Inmobiliaria en Mar Azul y Mar de las Pampas | Silvia Fernández';
const HOME_DESCRIPTION = 'Casas, lotes, complejos y alquileres temporarios en Mar Azul, Las Gaviotas, Mar de las Pampas y Villa Gesell. Oficinas en Mar Azul y Mar de las Pampas.';

export const metadata = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
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
      <ZoneLinks />
      <Contact />
    </>
  );
}