import { createContext, useContext, useState, useEffect } from 'react';
import { updateTheme as updateThemeAPI } from '../services/api';
import { useAuth } from './AuthContext';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const { user, updateUser } = useAuth();
  const [theme, setTheme] = useState(
    () => user?.theme || localStorage.getItem('theme') || 'light'
  );

  useEffect(() => {
    if (user?.theme) {
      setTheme(user.theme);
    }
  }, [user?.theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (user) {
      try {
        await updateThemeAPI(newTheme);
        updateUser({ theme: newTheme });
      } catch (err) {
        // still keep local theme
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
