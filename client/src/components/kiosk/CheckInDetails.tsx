'use client';

import { useState } from 'react';

import {
  MedicalServices,
  OutlinePerson,
  Calendar,
  Monitor,
  Phone,
  Help,
  Check,
  ArrowBack,
  Backspace,
} from '../icons';

import './CheckInDetails.css';
import InputField from '../common/InputField';
import KioskButton from '../common/KioskButton';
import Footer from '../common/Footer';

interface IProps {
  onNext: () => void;
  onBack: () => void;
}

export default function PatientCheckin({ onNext, onBack }: IProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    weight: '',
    phoneNumber: '',
  });

  const handleNumpadClick = (value: string) => {
    if (value === 'clear') {
      setPhoneNumber('');
    } else if (value === 'submit') {
      // Handle submit
      console.log('Submitting phone number:', phoneNumber);
    } else {
      // Handle number input (simplified - in real app would format properly)
      const cleaned = phoneNumber.replace(/\D/g, '');
      if (cleaned.length < 10) {
        const newNumber = cleaned + value;
        // Simple formatting - in production use a proper phone formatter
        if (newNumber.length <= 3) {
          setPhoneNumber(`(${newNumber}`);
        } else if (newNumber.length <= 6) {
          setPhoneNumber(`(${newNumber.slice(0, 3)}) ${newNumber.slice(3)}`);
        } else {
          setPhoneNumber(
            `(${newNumber.slice(0, 3)}) ${newNumber.slice(3, 6)}-${newNumber.slice(6, 10)}`,
          );
        }
      }
    }
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBack = () => {
    // Handle back navigation
    onBack();
    console.log('Navigate back');
  };

  const handleConfirm = () => {
    // Handle confirmation
    onNext();
    console.log('Confirming check-in:', { ...formData, phoneNumber });
  };

  const handleSupport = () => {
    // Handle support click
    console.log('Open support');
  };

  const handleLanguage = () => {
    // Handle language change
    console.log('Change language');
  };

  const handleClearPhone = () => {
    setPhoneNumber('');
  };

  const numpadButtons = [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    'clear',
    '0',
    'submit',
  ];

  return (
    <div className="patient-checkin">
      {/* TopAppBar */}
      <header className="patient-checkin__header">
        <div className="patient-checkin__brand">
          <div className="patient-checkin__brand-icon-wrapper">
            <span className="material-symbols-outlined patient-checkin__brand-icon">
              <MedicalServices />
            </span>
          </div>
          <div>
            <h1 className="patient-checkin__title">Hospital Name</h1>
            <p className="patient-checkin__subtitle">Patient Check-in</p>
          </div>
        </div>
        <div className="patient-checkin__help">
          <span className="material-symbols-outlined patient-checkin__help-icon">
            <Help />
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="patient-checkin__main">
        <div className="patient-checkin__grid">
          {/* Left Column: Primary Forms */}
          <div className="patient-checkin__left-column">
            {/* Instruction Card */}
            <div className="patient-checkin__instruction">
              <h2 className="patient-checkin__instruction-title">Welcome</h2>
              <p className="patient-checkin__instruction-text">
                Please complete the check-in details below to proceed to your appointment.
              </p>
            </div>

            {/* Input Fields Section */}
            <div className="patient-checkin__form">
              {/* Full Name */}
              <InputField.Root>
                <InputField.Label>Full Name</InputField.Label>
                <InputField.Wrapper>
                  <InputField.LeadingIcon>
                    <OutlinePerson />
                  </InputField.LeadingIcon>
                  <InputField.Input
                    className="patient-checkin__input"
                    placeholder="e.g. John Doe"
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                  />
                </InputField.Wrapper>
                <InputField.Error />
              </InputField.Root>

              <div className="patient-checkin__row">
                {/* Age */}
                <InputField.Root>
                  <InputField.Label>Age</InputField.Label>
                  <InputField.Wrapper>
                    <InputField.LeadingIcon>
                      <Calendar />
                    </InputField.LeadingIcon>
                    <InputField.Input
                      placeholder="00"
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                    />
                  </InputField.Wrapper>
                  <InputField.Error />
                </InputField.Root>
                {/* Weight */}
                <InputField.Root>
                  <InputField.Label>Weight</InputField.Label>
                  <InputField.Wrapper>
                    <InputField.LeadingIcon>
                      <Monitor />
                    </InputField.LeadingIcon>
                    <InputField.Input
                      placeholder="0.0"
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                    />
                  </InputField.Wrapper>
                  <InputField.Error />
                </InputField.Root>
              </div>

              {/* Phone Number Display */}
              <InputField.Root>
                <InputField.Label>Phone Number</InputField.Label>
                <InputField.Wrapper>
                  <InputField.LeadingIcon>
                    <Phone />
                  </InputField.LeadingIcon>
                  <InputField.Input
                    placeholder="00000000000"
                    type="number"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                  />
                  <InputField.TrailingIcon showWhen="hasValue" onClick={handleClearPhone}>
                    <Backspace />
                  </InputField.TrailingIcon>
                </InputField.Wrapper>
                <InputField.Error />
              </InputField.Root>
            </div>
          </div>

          {/* Right Column: Numpad for Phone */}
          {/* <div className="patient-checkin__right-column">
            <div className="patient-checkin__numpad">
              <div className="patient-checkin__numpad-grid">
                {numpadButtons.map((btn) => (
                  <button
                    key={btn}
                    className={`patient-checkin__numpad-btn ${
                      btn === "clear" || btn === "submit"
                        ? "patient-checkin__numpad-btn--special"
                        : ""
                    }`}
                    onClick={() => handleNumpadClick(btn)}
                  >
                    {btn === "clear" && (
                      <span className="material-symbols-outlined patient-checkin__numpad-icon">
                        close
                      </span>
                    )}
                    {btn === "submit" && (
                      <span className="material-symbols-outlined patient-checkin__numpad-icon">
                        check
                      </span>
                    )}
                    {btn !== "clear" && btn !== "submit" && btn}
                  </button>
                ))}
              </div>

              <div className="patient-checkin__privacy-card">
                <div className="patient-checkin__privacy-image">
                  <img
                    alt="Modern clinical hallway with bright lighting"
                    className="patient-checkin__privacy-img"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfQDxvgg50qGYIbN6fv6y-iodgRYfXGWG10RmpBV8C-rvQdbZ6aX4ZAtqvQyaXmBjToezrFysvH6V-rNOhMB1HVAco9wgOHsgigkfgbtCr2ehygB1u9GurFq6eungUoQv-vXTOEcLOjUJLutGOFLusoopEn8ecRzLsJmWwUf_C2tYXTVMaMGdUkAYrbjppK6HIQ8IIudKcnH5OovpeEDcWqrW8zxehR2bevA9nMa4E-cisZsJzYftN2C2Sv5jBX28pLgpcVI9UIi2q"
                  />
                  <div className="patient-checkin__privacy-overlay"></div>
                  <div className="patient-checkin__privacy-badge">
                    <span className="material-symbols-outlined patient-checkin__privacy-icon">
                      privacy_tip
                    </span>
                    <span className="patient-checkin__privacy-text">
                      Your data is protected by HIPAA
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </main>

      {/* BottomNavBar / Actions */}
      <Footer.Root variant="sticky">
        <Footer.Actions align="space-between">
          <KioskButton.Root variant="back" onClick={handleBack} size="large">
            <KioskButton.StartIcon>
              <ArrowBack />
            </KioskButton.StartIcon>
            <KioskButton.Text>Back</KioskButton.Text>
          </KioskButton.Root>
          <KioskButton.Root variant="confirm" onClick={handleConfirm} size="large">
            <KioskButton.Text>Confirm</KioskButton.Text>
            <KioskButton.EndIcon>
              <Check />
            </KioskButton.EndIcon>
          </KioskButton.Root>
        </Footer.Actions>
      </Footer.Root>
      {/* <footer className="patient-checkin__footer">
        <div className="patient-checkin__footer-actions">
          <KioskButton.Root variant="back" onClick={handleBack} size="large">
            <KioskButton.StartIcon>
              <ArrowBack />
            </KioskButton.StartIcon>
            <KioskButton.Text>Back</KioskButton.Text>
          </KioskButton.Root>
          <KioskButton.Root variant="confirm" onClick={handleConfirm} size="large">
            <KioskButton.Text>Confirm</KioskButton.Text>
            <KioskButton.EndIcon>
              <Check />
            </KioskButton.EndIcon>
          </KioskButton.Root>
        </div>
      </footer> */}
    </div>
  );
}
