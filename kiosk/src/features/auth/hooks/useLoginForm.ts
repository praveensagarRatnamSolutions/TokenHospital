import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../../core/api';

export const useLoginForm = (onLoginSuccess: (user: any) => void) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authApi.login({ email, password });
      if (response.success) {
        localStorage.setItem('kiosk_token', response.data.token);
        localStorage.setItem('kiosk_user', JSON.stringify(response.data));
        await onLoginSuccess(response.data);
        navigate('/select');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return {
    state: { email, password, loading, error },
    actions: { setEmail, setPassword, handleSubmit }
  };
};
