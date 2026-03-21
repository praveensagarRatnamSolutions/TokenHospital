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
import KioskCustomHeader from '../common/KioskCustomHeader';
import InputField from '../common/InputField';
import Footer from '../common/Footer';
import KioskButton from '../common/KioskButton';
import DepartmentCard from './common/departmentCard/DepartmentCard';

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
      <KioskCustomHeader.Root>
        <KioskCustomHeader.Content>
          <KioskCustomHeader.IconWrapper>
            <KioskCustomHeader.Icon>
              <MedicalServices />
            </KioskCustomHeader.Icon>
          </KioskCustomHeader.IconWrapper>
          <KioskCustomHeader.Title>Select Department</KioskCustomHeader.Title>
          <KioskCustomHeader.SubTitle>
            Please choose the department you want to visit.
          </KioskCustomHeader.SubTitle>
          <InputField.Root>
            <InputField.Wrapper>
              <InputField.LeadingIcon>
                <Search />
              </InputField.LeadingIcon>
              <InputField.Input
                className="select-department__search-input"
                placeholder="Search department..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputField.Wrapper>
          </InputField.Root>
        </KioskCustomHeader.Content>
      </KioskCustomHeader.Root>

      {/* Main Content: Grid of Department Cards */}
      <main className="select-department__main">
        <div className="select-department__grid">
          {isLoading ? (
            <div className="select-department__loading">Loading departments...</div>
          ) : (
            filtered?.map((dept: any) => (
              <>
                <DepartmentCard.Root
                  key={dept._id}
                  onSelect={handleSelect}
                  department={dept}
                >
                  <DepartmentCard.Content>
                    <DepartmentCard.Icon />
                    <DepartmentCard.Title>{dept.name}</DepartmentCard.Title>
                    <DepartmentCard.Description>
                      {dept.description}
                    </DepartmentCard.Description>
                  </DepartmentCard.Content>
                </DepartmentCard.Root>
              </>
            ))
          )}
        </div>
      </main>
      {/* Footer Navigation Section */}
      <Footer.Root variant="sticky">
        <Footer.Actions align="space-between">
          <KioskButton.Root variant="back" onClick={onBack} size="large">
            <KioskButton.StartIcon>
              <ArrowBack />
            </KioskButton.StartIcon>
            <KioskButton.Text>Back</KioskButton.Text>
          </KioskButton.Root>
        </Footer.Actions>
      </Footer.Root>

      {/* <footer className="select-department__footer">
        <button onClick={onBack} className="select-department__back-button">
          <span className="material-symbols-outlined select-department__back-icon">
            <ArrowBack />
          </span>
          <span>Back</span>
        </button>
      </footer> */}
    </div>
  );
}
