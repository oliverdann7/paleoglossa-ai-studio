import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContextInstance';

export const useAuth = () => useContext(AuthContext);
