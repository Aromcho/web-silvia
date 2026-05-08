import DevelopmentManager from '../manager/development.manager.js';  // Asegúrate de que esta ruta sea correcta

export const createDevelopment = async (req, res) => {
  try {
    const newDevelopment = await DevelopmentManager.create(req.body);
    res.status(201).json(newDevelopment);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el desarrollo', error });
  }
};

export const getDevelopments = async (req, res) => {
  try {
    const { status, name, minPrice, maxPrice, location } = req.query;  // Asegúrate de extraer los parámetros correctamente

    // Crear un objeto de filtro con los valores de req.query
    const filterObj = {};

    if (status) filterObj.status = status;  // Filtra por estado del desarrollo
    if (name) filterObj.name = { $regex: name, $options: 'i' };  // Búsqueda por nombre del desarrollo con regex
    if (minPrice || maxPrice) {
      filterObj['prices.price'] = {};
      if (minPrice) filterObj['prices.price'].$gte = parseFloat(minPrice);  // Rango de precio mínimo
      if (maxPrice) filterObj['prices.price'].$lte = parseFloat(maxPrice);  // Rango de precio máximo
    }
    if (location) filterObj['location.address'] = { $regex: location, $options: 'i' };  // Búsqueda por ubicación

    // Usa el manager para buscar con los filtros aplicados
    const developments = await DevelopmentManager.read(filterObj);

    res.status(200).json(developments);
  } catch (error) {
    console.error('Error al obtener los desarrollos:', error);
    res.status(500).json({ message: 'Error al obtener los desarrollos', error });
  }
};


export const getDevelopmentById = async (req, res) => {
  try {
    const development = await DevelopmentManager.readOne(req.params.id);
    if (!development) {
      return res.status(404).json({ message: 'Desarrollo no encontrado' });
    }
    res.status(200).json(development);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el desarrollo', error });
  }
};

export const updateDevelopment = async (req, res) => {
  try {
    const updatedDevelopment = await DevelopmentManager.update(req.params.id, req.body);
    if (!updatedDevelopment) {
      return res.status(404).json({ message: 'Desarrollo no encontrado' });
    }
    res.status(200).json(updatedDevelopment);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el desarrollo', error });
  }
};

export const deleteDevelopment = async (req, res) => {
  try {
    const deletedDevelopment = await DevelopmentManager.destroy(req.params.id);
    if (!deletedDevelopment) {
      return res.status(404).json({ message: 'Desarrollo no encontrado' });
    }
    res.status(200).json({ message: 'Desarrollo eliminado con éxito' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el desarrollo', error });
  }
};
export const getDevelopmentByCustomId = async (req, res) => {
  try {
    const development = await DevelopmentManager.readByCustomId(req.params.id);
    if (!development) {
      return res.status(404).json({ message: 'Desarrollo no encontrado' });
    }
    res.status(200).json(development);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el desarrollo por ID personalizado', error });
  }
};
