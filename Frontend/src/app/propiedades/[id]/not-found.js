import PropertyUnavailable from '../../../components/PropertyUnavailable/PropertyUnavailable'

// Se muestra con status 404 cuando page.js llama a notFound() (ficha dada de baja o inexistente)
export default function PropertyNotFound() {
  return <PropertyUnavailable />
}
