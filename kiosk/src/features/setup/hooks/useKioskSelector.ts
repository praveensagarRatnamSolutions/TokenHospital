import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { kioskApi } from '../../../core/api';
import type { Kiosk } from '../../../core/types';

export const useKioskSelector = (onSelect: (kiosk: Kiosk) => void) => {
  const [kiosks, setKiosks] = useState<Kiosk[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchKiosks = async () => {
      try {
        const response = await kioskApi.getAll();
        setKiosks(response.data);
      } catch (err) {
        console.error('Failed to fetch kiosks', err);
      } finally {
        setLoading(false);
      }
    };

    fetchKiosks();
  }, []);

  const filteredKiosks = kiosks.filter(k => 
    k.name.toLowerCase().includes(search.toLowerCase()) || 
    k.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleKioskSelect = (kiosk: Kiosk) => {
    onSelect(kiosk);
    navigate(`/display/${kiosk.code}`);
  };

  const handleLogoutAdmin = () => {
    localStorage.clear();
    window.location.reload();
  };

  return {
    state: {
      loading,
      search,
      filteredKiosks
    },
    actions: {
      setSearch,
      handleKioskSelect,
      handleLogoutAdmin
    }
  };
};
