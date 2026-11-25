// La página es de cliente (galería de fotos) y no puede exportar metadata: va acá
export const metadata = {
  title: 'Nosotros: inmobiliaria en Mar Azul y Mar de las Pampas | Silvia Fernández',
  description: 'Conocé al equipo de Silvia Fernández Propiedades, nuestra oficina central en Mar Azul y la sucursal boutique en Mar de las Pampas.',
  alternates: { canonical: '/nosotros' },
}

export default function NosotrosLayout({ children }) {
  return children
}
