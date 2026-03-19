'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { HospitalsList } from '@/components/superadmin/HospitalsList';
import { HospitalForm } from '@/components/superadmin/HospitalForm';
import { Hospital, hospitalApi } from '@/services/hospitalApi';
import { Button } from '@/components/ui/button';

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const response = await hospitalApi.getAllHospitals();
      setHospitals(response.data || []);
    } catch (err) {
      console.error('Failed to fetch hospitals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const filteredHospitals = hospitals.filter(
    (h) =>
      h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.address.city.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleCreate = () => {
    setSelectedHospital(null);
    setShowForm(true);
  };

  const handleEdit = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedHospital(null);
  };

  const handleFormSuccess = () => {
    fetchHospitals();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Hospitals Management</h1>
          <p className="text-slate-500">Manage all registered hospitals in the system</p>
        </div>
        <Button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium w-full sm:w-auto"
        >
          <Plus className="w-5 h-5" />
          Add Hospital
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-950 border rounded-xl shadow-sm">
        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="Search hospitals by name, email, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          />
        </div>

        <HospitalsList
          hospitals={filteredHospitals}
          onEdit={handleEdit}
          onRefresh={fetchHospitals}
          isLoading={loading}
        />
      </div>

      {showForm && (
        <HospitalForm
          hospital={selectedHospital}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}
