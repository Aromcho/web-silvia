export const formatToMoney = (price) => {
  if (!price) return ''
  return Number(price).toLocaleString('es-AR')
}

// Decide si el precio de una operación se muestra como "Consultar precio".
// - Alquiler temporario: siempre "Consultar precio" (no lo controla el interruptor del CRM).
// - Venta / Alquiler: manda el interruptor "Mostrar precio en la web" del CRM (op.show_price).
//   Si nunca se tocó (undefined), se mantiene el comportamiento de siempre: venta muestra el
//   precio y alquiler muestra "Consultar precio".
export const isOperationPriceHidden = (op) => {
  const type = (op?.operation_type || '').toLowerCase()
  if (type.includes('temporari') || type.includes('temporal')) return true
  if (typeof op?.show_price === 'boolean') return !op.show_price
  return type.includes('alquiler') || type === 'rent' || op?.operation_id === 2
}
