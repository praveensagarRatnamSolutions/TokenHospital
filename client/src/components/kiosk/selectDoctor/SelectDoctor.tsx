'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSelectedDoctor } from '@/store/slices/tokenSlice';
import './SelectDoctor.css';

import { ArrowBack, ArrowForward, MedicalServices, Search } from '../common/icons';
import DoctorCard from '../common/doctorCard/DoctorCard';
import KioskButton from '../common/button';
import KioskCustomHeader from '../common/kioskCustomHeader/KioskCustomHeader';
import InputField from '../common/input/Input';
import Footer from '../common/footer';

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
      {/* <header className="select-doctor__header">
        <h1 className="select-doctor__title">Choose Your Doctor</h1>
        <p className="select-doctor__subtitle">
          Select a doctor or let the system assign one automatically.
        </p>
      </header> */}
      <KioskCustomHeader.Root>
        <KioskCustomHeader.Content>
          <KioskCustomHeader.Title>Choose Your Doctor</KioskCustomHeader.Title>
          <KioskCustomHeader.SubTitle>
            Select a doctor or let the system assign one automatically.
          </KioskCustomHeader.SubTitle>
          <InputField.Root>
            <InputField.Wrapper>
              <InputField.LeadingIcon>
                <Search />
              </InputField.LeadingIcon>
              <InputField.Input
                placeholder="Search department..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputField.Wrapper>
          </InputField.Root>
        </KioskCustomHeader.Content>
      </KioskCustomHeader.Root>

      {/* Main Content Area (Scrollable) */}
      <main className="select-doctor__main">
        {/* Search Bar Section */}

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
              <>
                <DoctorCard.Root key={doctor._id} doctor={doctor} onSelect={handleSelect}>
                  <DoctorCard.Image />
                  <DoctorCard.Content>
                    <DoctorCard.Header>
                      <DoctorCard.Name>{doctor.name}</DoctorCard.Name>
                      <DoctorCard.Status />
                    </DoctorCard.Header>
                    <DoctorCard.Specialty>{doctor.specialty}</DoctorCard.Specialty>
                    <DoctorCard.Waiting />
                  </DoctorCard.Content>
                </DoctorCard.Root>
              </>
            ))
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <Footer.Root>
        <Footer.Actions align="space-between">
          <KioskButton.Root variant="back" onClick={onBack}>
            <KioskButton.StartIcon>
              <ArrowBack />
            </KioskButton.StartIcon>
            <KioskButton.Text>Back</KioskButton.Text>
          </KioskButton.Root>
          <KioskButton.Root onClick={onNext}>
            <KioskButton.Text>Confirm Selection</KioskButton.Text>
            <KioskButton.EndIcon>
              <ArrowForward />
            </KioskButton.EndIcon>
          </KioskButton.Root>
        </Footer.Actions>
      </Footer.Root>
    </div>
  );
}
