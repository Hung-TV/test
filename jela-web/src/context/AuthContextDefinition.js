import { createContext } from 'react';

// Tách context khỏi Provider để React Fast Refresh không phải reload toàn bộ cây component.
export const AuthContext = createContext(null);
