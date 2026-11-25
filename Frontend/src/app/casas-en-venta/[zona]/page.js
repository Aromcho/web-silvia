import ZoneLanding, { buildLandingMetadata } from '../../../components/ZoneLanding/ZoneLanding'

const TYPE = 'casas-en-venta'

export function generateMetadata(props) {
  return buildLandingMetadata(TYPE, props)
}

export default function Page(props) {
  return <ZoneLanding typeKey={TYPE} {...props} />
}
