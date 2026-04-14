import { useState, useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import AppRoutes from './routes';
import type { User, Kiosk } from './core/types/index';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [selectedKiosk, setSelectedKiosk] = useState<Kiosk | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('kiosk_theme') as 'light' | 'dark') || 'dark';
  });

  useEffect(() => {
    // Initial data load
    const initialize = async () => {
      const storedUser = localStorage.getItem('kiosk_user');
      const storedKioskId = localStorage.getItem('active_kiosk_id');
      
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        if (storedKioskId) {
          const storedKiosk = localStorage.getItem('active_kiosk_data');
          if (storedKiosk) setSelectedKiosk(JSON.parse(storedKiosk));
        }
      }
      setLoading(false);
    };
    initialize();
  }, []);

  // Theme effect
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('kiosk_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleLoginSuccess = (userData: User) => {
    setUser(userData);
    localStorage.setItem('kiosk_user', JSON.stringify(userData));
    localStorage.setItem('kiosk_token', userData.token);
  };

  const handleKioskSelect = (kiosk: Kiosk) => {
    setSelectedKiosk(kiosk);
    localStorage.setItem('active_kiosk_id', kiosk._id);
    localStorage.setItem('active_kiosk_data', JSON.stringify(kiosk));
  };

  if (loading) return null;

  return (
    <HashRouter>
      <AppRoutes 
        user={user}
        selectedKiosk={selectedKiosk}
        theme={theme}
        onLoginSuccess={handleLoginSuccess}
        onKioskSelect={handleKioskSelect}
        onToggleTheme={toggleTheme}
      />
    </HashRouter>
  );
}

export default App;
