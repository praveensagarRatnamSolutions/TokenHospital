'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { useAppDispatch } from '@/store/hooks';
import { setSelectedDepartment } from '@/store/slices/tokenSlice';
import './SelectDepartment.css';
import {
  Baby,
  Hearing,
  Heart,
  MedicalServices,
  Search,
  Spine,
  Stethoscope,
  Vaccines,
  ArrowBack,
} from '../icons';

interface SelectDepartmentProps {
  onNext: () => void;
  onBack: () => void;
}

export default function SelectDepartment({ onNext, onBack }: SelectDepartmentProps) {
  const [search, setSearch] = useState('');
  const dispatch = useAppDispatch();

  const { data: departments, isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      try {
        const response = await api.get('/api/department');
        return response.data.data;
      } catch {
        // Fallback mock data
        return [
          {
            _id: '1',
            name: 'General Medicine',
            description: 'Internal & Routine Care',
            icon: <Stethoscope />,
          },
          {
            _id: '2',
            name: 'Cardiology',
            description: 'Heart Health Center',
            icon: <Heart />,
          },
          {
            _id: '3',
            name: 'Orthopedics',
            description: 'Bone & Joint Specialist',
            icon: <Spine />,
          },
          {
            _id: '4',
            name: 'Pediatrics',
            description: 'Child & Infant Health',
            icon: <Baby />,
          },
          {
            _id: '5',
            name: 'ENT',
            description: 'Ear, Nose, & Throat',
            icon: <Hearing />,
          },
          {
            _id: '6',
            name: 'Dermatology',
            description: 'Skin & Aesthetic Care',
            icon: <Vaccines />,
          },
        ];
      }
    },
  });

  const filtered = departments?.filter((d: any) =>
    d.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSelect = (dept: any) => {
    dispatch(setSelectedDepartment(dept));
    onNext();
  };

  return (
    <div className="select-department">
      {/* Top Bar / Header Section */}
      <header className="select-department__header">
        <div className="select-department__header-content">
          <div className="select-department__icon-wrapper">
            <span className="material-symbols-outlined select-department__icon">
              <MedicalServices />
            </span>
          </div>
          <h1 className="select-department__title">Select Department</h1>
          <p className="select-department__subtitle">
            Please choose the department you want to visit.
          </p>

          <div className="select-department__search">
            <div className="select-department__search-icon">
              <span className="material-symbols-outlined select-department__search-icon-symbol">
                <Search />
              </span>
            </div>
            <input
              className="select-department__search-input"
              placeholder="Search department..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Main Content: Grid of Department Cards */}
      <main className="select-department__main">
        <div className="select-department__grid">
          {isLoading ? (
            <div className="select-department__loading">Loading departments...</div>
          ) : (
            filtered?.map((dept: any) => (
              <button
                key={dept._id}
                onClick={() => handleSelect(dept)}
                className="select-department__card"
              >
                <div className="select-department__card-icon">
                  <span className="material-symbols-outlined select-department__card-icon-symbol">
                    {dept.icon || 'stethoscope'}
                  </span>
                </div>
                <div className="select-department__card-content">
                  <h2 className="select-department__card-title">{dept.name}</h2>
                  <p className="select-department__card-description">
                    {dept.description}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </main>

      {/* Footer Navigation Section */}
      <footer className="select-department__footer">
        <button onClick={onBack} className="select-department__back-button">
          <span className="material-symbols-outlined select-department__back-icon">
            <ArrowBack />
          </span>
          <span>Back</span>
        </button>
        {/* <div className="select-department__emergency">
          <div className="select-department__emergency-info">
            <p className="select-department__emergency-label">Emergency</p>
            <p className="select-department__emergency-number">Dial 911</p>
          </div>
          <div className="select-department__emergency-icon">
            <span className="material-symbols-outlined select-department__emergency-icon-symbol">
              emergency
            </span>
          </div>
        </div> */}
      </footer>
    </div>
  );
}
