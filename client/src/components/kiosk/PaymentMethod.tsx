'use client';

import React, { useState } from 'react';
import './PaymentMethod.css';
import {
  Apartment,
  ArrowBack,
  ArrowForward,
  CreditCard,
  HealthAndSafety,
  MedicalServices,
  Payments,
  QrCode,
  Stethoscope,
} from '../icons';

interface PaymentMethodProps {
  onNext?: () => void;
  onBack?: () => void;
  tokenNumber?: string;
  doctorName?: string;
  department?: string;
  fee?: string;
}

export default function PaymentMethod({
  onNext,
  onBack,
  tokenNumber = 'A-104',
  doctorName = 'Dr. Sarah Johnson',
  department = 'General Medicine',
  fee = '$50.00',
}: PaymentMethodProps) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const methods = [
    {
      id: 'cash',
      title: 'Cash at Counter',
      desc: 'Pay at the reception desk',
      icon: <Payments />,
    },
    {
      id: 'upi',
      title: 'UPI Payment',
      desc: 'Scan and pay using any UPI app',
      icon: <QrCode />,
    },
    // {
    //   id: 'card',
    //   title: 'Card Payment',
    //   desc: 'Swipe or tap your credit/debit card',
    //   icon: <CreditCard />,
    // },
    // {
    //   id: 'insurance',
    //   title: 'Insurance',
    //   desc: 'Claim through your provider',
    //   icon: <HealthAndSafety />,
    // },
  ];

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    // Optionally trigger onNext or store selection
  };

  const handleContinue = () => {
    if (selectedMethod && onNext) {
      onNext();
    }
  };

  const handleHelp = () => {
    console.log('Help requested');
    // Implement help functionality
  };

  return (
    <div className="payment-method">
      {/* Main Container */}
      <div className="payment-method__container">
        {/* TopAppBar Section */}
        <header className="payment-method__header">
          <div className="payment-method__hospital-info">
            <div className="payment-method__hospital-icon-wrapper">
              <span className="material-symbols-outlined payment-method__hospital-icon">
                <MedicalServices />
              </span>
            </div>
            <h2 className="payment-method__hospital-name">City General Hospital</h2>
          </div>
          <div className="payment-method__title-section">
            <h1 className="payment-method__title">Select Payment Method</h1>
            <p className="payment-method__subtitle">
              Please choose how you would like to pay for the consultation.
            </p>
          </div>
        </header>

        {/* Patient Summary Section */}
        <section className="payment-method__summary">
          <div className="payment-method__summary-container">
            {/* Token and Doctor Info */}
            <div className="payment-method__appointment-info">
              <div className="payment-method__token">
                <span className="payment-method__token-label">Token Number</span>
                <span className="payment-method__token-value">{tokenNumber}</span>
              </div>
              <div className="payment-method__divider"></div>
              <div className="payment-method__doctor-info">
                <div className="payment-method__doctor-detail">
                  <span className="material-symbols-outlined payment-method__doctor-icon">
                    <Stethoscope />
                  </span>
                  <span className="payment-method__doctor-name">{doctorName}</span>
                </div>
                <div className="payment-method__department-detail">
                  <span className="material-symbols-outlined payment-method__department-icon">
                    <Apartment />
                  </span>
                  <span className="payment-method__department-name">{department}</span>
                </div>
              </div>
            </div>

            {/* Price Info */}
            <div className="payment-method__price">
              <span className="payment-method__price-label">Consultation Fee</span>
              <span className="payment-method__price-value">{fee}</span>
            </div>
          </div>
        </section>

        {/* Main Section: Grid of Payment Options */}
        <main className="payment-method__main">
          <div className="payment-method__grid">
            {methods.map((method) => (
              <button
                key={method.id}
                onClick={() => handleMethodSelect(method.id)}
                className={`payment-method__card ${selectedMethod === method.id ? 'payment-method__card--selected' : ''}`}
              >
                <div className="payment-method__card-icon-wrapper">
                  <div className="payment-method__card-icon-overlay"></div>
                  <span className="material-symbols-outlined payment-method__card-icon">
                    {method.icon}
                  </span>
                </div>
                <div className="payment-method__card-content">
                  <h3 className="payment-method__card-title">{method.title}</h3>
                  <p className="payment-method__card-description">{method.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </main>

        {/* Bottom Navigation Section */}
        <footer className="payment-method__footer">
          <div className="payment-method__footer-container">
            {/* Back Button */}
            <button
              onClick={onBack}
              className="payment-method__footer-btn payment-method__footer-btn--back"
            >
              <span className="material-symbols-outlined payment-method__footer-icon">
                <ArrowBack />
              </span>
              <span>Back</span>
            </button>

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              className={`payment-method__footer-btn payment-method__footer-btn--continue ${
                !selectedMethod ? 'payment-method__footer-btn--disabled' : ''
              }`}
              disabled={!selectedMethod}
            >
              <span>Continue</span>
              <span className="material-symbols-outlined payment-method__footer-icon">
                <ArrowForward />
              </span>
            </button>
          </div>
        </footer>

        {/* Help Button Floating */}
        {/* <button
          className="payment-method__help-btn"
          onClick={handleHelp}
          aria-label="Help"
        >
          <span className="material-symbols-outlined payment-method__help-icon">
            help_outline
          </span>
        </button> */}
      </div>
    </div>
  );
}
