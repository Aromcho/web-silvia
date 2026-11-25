import ZoneLanding, { buildLandingMetadata } from '../../../components/ZoneLanding/ZoneLanding'

const TYPE = 'lotes-terrenos'

export function generateMetadata(props) {
  return buildLandingMetadata(TYPE, props)
}

export default function Page(props) {
  return <ZoneLanding typeKey={TYPE} {...props} />
}
