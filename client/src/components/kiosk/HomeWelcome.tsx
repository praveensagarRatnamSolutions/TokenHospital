'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { DoubleArrowUp, MedicalServices } from '../icons';

import './HomeWelcome.css';
import TokenQueue, { Token } from './common/tokens/Tokens';

interface HomeWelcomeProps {
  onStart: () => void;
}

export default function HomeWelcome({ onStart }: HomeWelcomeProps) {
  // Mocking queue progress as seen in HTML
  const queueProgress: Token[] = [
    { token: 'A-142', status: 'COMPLETED', current: false },
    { token: 'A-143', status: 'CURRENT', current: true },
    { token: 'E-09', status: 'EMERGENCY', emergency: true },
    { token: 'A-144', status: 'NEXT', next: true, est: '5 min' },
    { token: 'A-145', status: 'NEXT', next: true, est: '5 min' },
  ];

  return (
    <div className="home-welcome">
      {/* Header / Carousel Section */}
      <header className="home-welcome__header">
        <div className="home-welcome__overlay"></div>
        <div className="home-welcome__background"></div>

        <div className="home-welcome__content">
          <div className="home-welcome__brand">
            <span className="material-symbols-outlined home-welcome__brand-icon">
              <MedicalServices />
            </span>
            <div className="home-welcome__brand-divider"></div>
          </div>
          <h1 className="home-welcome__title">
            We Are The Best <br />
            Health Care Services
          </h1>
          <p className="home-welcome__subtitle">
            Leading the way in medical excellence. Your health and comfort are our top
            priorities.
          </p>
        </div>

        {/* Carousel Indicators */}
        <div className="home-welcome__indicators">
          <div className="home-welcome__indicator home-welcome__indicator--active"></div>
          <div className="home-welcome__indicator"></div>
          <div className="home-welcome__indicator"></div>
        </div>

        {/* Swipe up / Click to get token interaction area */}
        <div className="home-welcome__cta" onClick={onStart}>
          <div className="home-welcome__cta-button">
            <span className="home-welcome__cta-icon">
              <DoubleArrowUp />
            </span>
            <span className="home-welcome__cta-text">Tap to get token</span>
          </div>
          <div className="home-welcome__cta-line"></div>
        </div>
      </header>

      {/* Bottom Section: Token Queue Progress */}
      <footer className="home-welcome__footer">
        <TokenQueue queueProgress={queueProgress} />
      </footer>
    </div>
  );
}
