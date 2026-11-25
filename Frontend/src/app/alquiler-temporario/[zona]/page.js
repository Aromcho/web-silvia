import ZoneLanding, { buildLandingMetadata } from '../../../components/ZoneLanding/ZoneLanding'

const TYPE = 'alquiler-temporario'

export function generateMetadata(props) {
  return buildLandingMetadata(TYPE, props)
}

export default function Page(props) {
  return <ZoneLanding typeKey={TYPE} {...props} />
}
