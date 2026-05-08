import Manager from './Manager.js'; // Ajusta la ruta si es necesario
import User from '../models/User.model.js';

const UserManager = new Manager(User);

export default UserManager;
