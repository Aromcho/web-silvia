// Funciones para manejar cookies de productos
export const setProductCookie = async (req, res, next) => {
  try {
    const { product } = req.body;
    if (!product || !product.id) {
      return res.status(400).json({ message: 'Producto no válido' });
    }

    // Guardamos la cookie
    await res.cookie(`product_${product.id}`, JSON.stringify(product), { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });

    return res.json({ message: 'Producto guardado en la cookie' });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

export const getProductCookies = async (req, res, next) => {
  try {
    const cookies = req.cookies;
    const productCookies = Object.keys(cookies).filter(key => key.startsWith('product_')).map(key => JSON.parse(cookies[key]));
    return res.json({ products: productCookies });
  } catch (error) {
    return next(error);
  }
}

export const deleteProductCookie = async (req, res, next) => {
  try {
    const { product } = req.params;
    return res.clearCookie(`product_${product}`).json({ message: `Producto ${product} eliminado de la cookie` });
  } catch (error) {
    return next(error);
  }
}

// Funciones para manejar cookies de búsquedas
export const setSearchCookie = async (req, res, next) => {
  try {
    const { search } = req.body;
    if (!search || !search.id) {
      return res.status(400).json({ message: 'Búsqueda no válida' });
    }
    await res.cookie(`search_${search.id}`, JSON.stringify(search), { maxAge: 24 * 60 * 60 * 1000 }); // 1 día
    return res.json({ message: 'Búsqueda guardada en la cookie' });
  } catch (error) {
    console.log(error);
    return next(error);
  }
}

export const getSearchCookies = async (req, res, next) => {
  try {
    const cookies = req.cookies;
    const searchCookies = Object.keys(cookies).filter(key => key.startsWith('search_')).map(key => JSON.parse(cookies[key]));
    return res.json({ searches: searchCookies });
  } catch (error) {
    return next(error);
  }
}

export const deleteSearchCookie = async (req, res, next) => {
  try {
    const { search } = req.params;
    return res.clearCookie(`search_${search}`).json({ message: `Búsqueda ${search} eliminada de la cookie` });
  } catch (error) {
    return next(error);
  }
}