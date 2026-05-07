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
} from '../common/icons';
import KioskCustomHeader from '../common/kioskCustomHeader/KioskCustomHeader';
import KioskButton from '../common/button';
import usePaymentMethod, { PaymentMethodProps } from './usePaymentMethod';
import { PaymentMethodType } from '@/modules/kiosk/api/kioskApis';
import Footer from '../common/footer';

type CardsType = {
  id: PaymentMethodType;
  title: string;
  desc: string;
  icon: React.ReactNode;
};

export default function PaymentMethod(props: PaymentMethodProps) {
  const {
    handleContinue,
    handleMethodSelect,
    selectedMethod,
    handleBack,
    isPending,
    isRazorpayEnabled,
  } = usePaymentMethod(props);
  const {
    tokenNumber = 'A-104',
    doctorName = 'Dr. Sarah Johnson',
    department = 'General Medicine',
    fee = '$50.00',
  } = props;

  const methods: CardsType[] = [
    {
      id: 'CASH',
      title: 'Cash at Counter',
      desc: 'Pay at the reception desk',
      icon: <Payments />,
    },
    ...(isRazorpayEnabled ? [{
      id: 'UPI' as PaymentMethodType,
      title: 'UPI Payment',
      desc: 'Scan and pay using any UPI app',
      icon: <QrCode />,
    }] : []),
  ];

  return (
    <div className="payment-method">
      {/* Main Container */}
      <div className="payment-method__container">
        {/* TopAppBar Section */}
        <KioskCustomHeader.Root>
          <KioskCustomHeader.Content>
            <div className="payment-method__hospital-info">
              <KioskCustomHeader.IconWrapper>
                <KioskCustomHeader.Icon className="payment-method__hospital-icon-wrapper">
                  <MedicalServices />
                </KioskCustomHeader.Icon>
              </KioskCustomHeader.IconWrapper>
              <h2 className="payment-method__hospital-name">City General Hospital</h2>
            </div>
            <KioskCustomHeader.Title>Select Payment Method</KioskCustomHeader.Title>
            <KioskCustomHeader.SubTitle>
              {' '}
              Please choose how you would like to pay for the consultation.
            </KioskCustomHeader.SubTitle>
          </KioskCustomHeader.Content>
        </KioskCustomHeader.Root>

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
        <Footer.Root>
          <Footer.Actions align="space-between">
            <KioskButton.Root variant="back" size="large" onClick={handleBack}>
              <KioskButton.StartIcon>
                <ArrowBack />
              </KioskButton.StartIcon>
              <KioskButton.Text>Back</KioskButton.Text>
            </KioskButton.Root>
            <KioskButton.Root
              disabled={!selectedMethod || isPending}
              variant="confirm"
              size="large"
              onClick={handleContinue}
            >
              <KioskButton.Text>Continue</KioskButton.Text>
              <KioskButton.EndIcon>
                <ArrowForward />
              </KioskButton.EndIcon>
            </KioskButton.Root>
          </Footer.Actions>
        </Footer.Root>
      </div>
    </div>
  );
}
