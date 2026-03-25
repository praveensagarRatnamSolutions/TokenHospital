'use client';

import React, { useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import './TokenGenerated.css';
import {
  AccessTime,
  Event,
  Groups,
  LocalHospital,
  MedicalServices,
  OutlinePerson,
  Print,
} from '../../icons';
import KioskCustomHeader from '../../common/KioskCustomHeader';
import Footer from '../../common/Footer';
import KioskButton from '../../common/KioskButton';
import useTokenGenerated, { TokenGeneratedProps } from './useTokenGenerated';

export default function TokenGenerated(props: TokenGeneratedProps) {
  const { handlePrint, age, name, selectedDepartment, selectedDoctor, generatedToken } =
    useTokenGenerated(props);

  return (
    <div className="token-generated">
      {/* TopAppBar Area */}
      <KioskCustomHeader.Root>
        <KioskCustomHeader.Content>
          <KioskCustomHeader.IconWrapper className="token-generated__icon-wrapper">
            <KioskCustomHeader.Icon>
              <LocalHospital />
            </KioskCustomHeader.Icon>
          </KioskCustomHeader.IconWrapper>
          <KioskCustomHeader.Title>Your Token is Ready</KioskCustomHeader.Title>
          <KioskCustomHeader.SubTitle>
            Please take your printed slip
          </KioskCustomHeader.SubTitle>
        </KioskCustomHeader.Content>
      </KioskCustomHeader.Root>

      {/* Center Token Card */}
      <main className="token-generated__main">
        <div className="token-generated__card">
          <div className="token-generated__card-strip"></div>
          <div className="token-generated__card-content">
            <p className="token-generated__token-label">Token Number</p>

            <div className="token-generated__token-display">
              <span className="token-generated__token-number">
                {generatedToken || 'A-000'}
              </span>
            </div>

            <div className="token-generated__details">
              {/* Department */}
              <div className="token-generated__detail-item">
                <span className="material-symbols-outlined token-generated__detail-icon">
                  <MedicalServices />
                </span>
                <div className="token-generated__detail-text">
                  <p className="token-generated__detail-label">Department</p>
                  <p className="token-generated__detail-value">
                    {selectedDepartment || 'General Medicine'}
                  </p>
                </div>
              </div>

              {/* Doctor */}
              <div className="token-generated__detail-item">
                <span className="material-symbols-outlined token-generated__detail-icon">
                  <OutlinePerson />
                </span>
                <div className="token-generated__detail-text">
                  <p className="token-generated__detail-label">Doctor</p>
                  <p className="token-generated__detail-value">
                    {selectedDoctor || 'Any Available'}
                  </p>
                </div>
              </div>

              {/* Waiting Info Grid */}
              <div className="token-generated__waiting-grid">
                <div className="token-generated__waiting-item">
                  <span className="material-symbols-outlined token-generated__waiting-icon">
                    <Groups />
                  </span>
                  <div>
                    <p className="token-generated__waiting-label">Patients Name</p>
                    <p className="token-generated__waiting-value">{name}</p>
                  </div>
                </div>
                <div className="token-generated__waiting-item">
                  <span className="material-symbols-outlined token-generated__waiting-icon">
                    <AccessTime />
                  </span>
                  <div>
                    <p className="token-generated__waiting-label">Patient Age</p>
                    <p className="token-generated__waiting-value">{age}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Date and Time */}
            <div className="token-generated__timestamp">
              <div className="token-generated__timestamp-item">
                <span className="material-symbols-outlined token-generated__timestamp-icon">
                  <Event />
                </span>
                <span className="token-generated__timestamp-text">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
              <div className="token-generated__timestamp-item">
                <span className="material-symbols-outlined token-generated__timestamp-icon">
                  <AccessTime />
                </span>
                <span className="token-generated__timestamp-text">
                  {new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer.Root className="token-generated__footer">
        <Footer.Actions align="space-between">
          <div className="token-generated__footer-actions">
            <KioskButton.Root
              onClick={handlePrint}
              variant="confirm"
              size="large"
              fullWidth
            >
              <KioskButton.StartIcon>
                <Print />
              </KioskButton.StartIcon>
              <KioskButton.Text>Print Token</KioskButton.Text>
            </KioskButton.Root>
            <p className="token-generated__print-instruction">
              Please collect your printed token below.
            </p>
          </div>
        </Footer.Actions>
      </Footer.Root>
    </div>
  );
}
