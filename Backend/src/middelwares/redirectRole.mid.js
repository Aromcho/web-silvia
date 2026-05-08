// Middleware para redirigir basado en el rol del usuario
function redirectBasedOnRole(req, res, next) {
    const { role } = req.session;
    // Asegúrate de que el usuario esté autenticado
    if (!role) {
      // Redirige al usuario a la página de inicio de sesión si no está autenticado
      return res.redirect('/login');
    }
  
    if (role === 'admin') {
      // Redirige al administrador al panel de administración
      return res.redirect('/admin');
    } else if (role === 'user') {
      // Redirige al usuario a la tienda online
      return res.redirect('/store');
    } else {
      // Maneja otros roles o redirige a una página de error
      return res.redirect('/error');
    }
  }