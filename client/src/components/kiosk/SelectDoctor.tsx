'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSelectedDoctor } from '@/store/slices/tokenSlice';
import './SelectDoctor.css';

import { ArrowBack, ArrowForward, MedicalServices, Search } from '../icons';

interface SelectDoctorProps {
  onNext: () => void;
  onBack: () => void;
}

export default function SelectDoctor({ onNext, onBack }: SelectDoctorProps) {
  const [search, setSearch] = useState('');
  const dispatch = useAppDispatch();
  const selectedDept = useAppSelector((state) => state.token.selectedDepartment);

  const { data: doctors, isLoading } = useQuery({
    queryKey: ['doctors', selectedDept?._id],
    queryFn: async () => {
      try {
        const response = await api.get('/api/doctor', {
          params: { departmentId: selectedDept?._id },
        });
        return response.data.data;
      } catch {
        // Fallback mock data
        return [
          {
            _id: '1',
            name: 'Dr. Sarah Smith',
            specialty: 'Cardiology Specialist',
            available: true,
            waiting: 2,
            image:
              'https://images.unsplash.com/photo-1559839734-2b71f1536783?q=80&w=2070&auto=format&fit=crop',
          },
          {
            _id: '2',
            name: 'Dr. James Wilson',
            specialty: 'Pediatrics',
            available: false,
            waiting: 5,
            image:
              'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop',
          },
          {
            _id: '3',
            name: 'Dr. Elena Rodriguez',
            specialty: 'Neurology Specialist',
            available: true,
            waiting: 1,
            image:
              'https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=1974&auto=format&fit=crop',
          },
          {
            _id: '4',
            name: 'Dr. Michael Chen',
            specialty: 'General Medicine',
            available: true,
            waiting: 0,
            image:
              'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1964&auto=format&fit=crop',
          },
        ];
      }
    },
  });

  const filtered = doctors?.filter((d: any) =>
    d.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSelect = (doctor: any) => {
    dispatch(setSelectedDoctor(doctor));
    onNext();
  };

  return (
    <div className="select-doctor">
      {/* Top Bar / Header Section */}
      <header className="select-doctor__header">
        <h1 className="select-doctor__title">Choose Your Doctor</h1>
        <p className="select-doctor__subtitle">
          Select a doctor or let the system assign one automatically.
        </p>
      </header>

      {/* Main Content Area (Scrollable) */}
      <main className="select-doctor__main">
        {/* Search Bar Section */}
        <div className="select-doctor__search-section">
          <div className="select-doctor__search-container">
            <span className="material-symbols-outlined select-doctor__search-icon">
              <Search />
            </span>
            <input
              className="select-doctor__search-input"
              placeholder="Search doctor by name..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Auto Assign Button */}
        {/* <div className="select-doctor__auto-assign-section">
          <button
            onClick={() => handleSelect({ _id: 'auto', name: 'Auto Assign' })}
            className="select-doctor__auto-assign-btn"
          >
            <span className="material-symbols-outlined select-doctor__auto-assign-icon">
              magic_button
            </span>
            <span className="select-doctor__auto-assign-text">
              Auto Assign Best Available Doctor
            </span>
          </button>
        </div> */}

        {/* Section Header with Status Indicators */}
        <div className="select-doctor__section-header">
          <h2 className="select-doctor__section-title">
            <span className="material-symbols-outlined select-doctor__section-title-icon">
              <MedicalServices />
            </span>
            Available Specialists
          </h2>
          <div className="select-doctor__status-indicators">
            <span className="select-doctor__status-indicator">
              <span className="select-doctor__status-dot select-doctor__status-dot--available"></span>
              Available
            </span>
            <span className="select-doctor__status-indicator">
              <span className="select-doctor__status-dot select-doctor__status-dot--busy"></span>
              Busy
            </span>
          </div>
        </div>

        {/* Doctor Grid */}
        <div className="select-doctor__grid">
          {isLoading ? (
            <div className="select-doctor__loading">Loading doctors...</div>
          ) : (
            filtered?.map((doctor: any) => (
              <div
                key={doctor._id}
                onClick={() => handleSelect(doctor)}
                className="select-doctor__card"
              >
                <div
                  className="select-doctor__card-image"
                  style={{
                    backgroundImage: `url(${doctor.image || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop'})`,
                  }}
                ></div>
                <div className="select-doctor__card-content">
                  <div className="select-doctor__card-header">
                    <h3 className="select-doctor__card-name">{doctor.name}</h3>
                    <span
                      className={`select-doctor__card-status ${doctor.available ? 'select-doctor__card-status--available' : 'select-doctor__card-status--busy'}`}
                    >
                      {doctor.available ? 'Available' : 'Busy'}
                    </span>
                  </div>
                  <p className="select-doctor__card-specialty">{doctor.specialty}</p>
                  <div className="select-doctor__card-waiting">
                    <span className="material-symbols-outlined select-doctor__card-waiting-icon">
                      group
                    </span>
                    <span className="select-doctor__card-waiting-text">
                      Waiting: <strong>{doctor.waiting || 0} Patients</strong>
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <footer className="select-doctor__footer">
        <button
          onClick={onBack}
          className="select-doctor__footer-btn select-doctor__footer-btn--back"
        >
          <span className="material-symbols-outlined select-doctor__footer-icon">
            <ArrowBack />
          </span>
          <span className="select-doctor__footer-text">Back</span>
        </button>
        <div className="select-doctor__footer-btn select-doctor__footer-btn--confirm">
          <span className="select-doctor__footer-text select-doctor__footer-text--large">
            Confirm Selection
          </span>
          <span className="material-symbols-outlined select-doctor__footer-icon select-doctor__footer-icon--large">
            <ArrowForward />
          </span>
        </div>
      </footer>
    </div>
  );
}
