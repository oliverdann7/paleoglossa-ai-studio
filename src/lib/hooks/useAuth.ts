import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContextInstance.js';

export const useAuth = () => useContext(AuthContext);
