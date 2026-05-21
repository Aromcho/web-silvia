export const formatToMoney = (price) => {
  if (!price) return ''
  return Number(price).toLocaleString('es-AR')
}
