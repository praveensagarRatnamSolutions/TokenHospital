'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { MdKeyboardDoubleArrowUp, MdOutlineMedicalServices } from 'react-icons/md';

import './HomeWelcome.css';

interface HomeWelcomeProps {
  onStart: () => void;
}

export default function HomeWelcome({ onStart }: HomeWelcomeProps) {
  // Mocking queue progress as seen in HTML
  const queueProgress = [
    { token: 'A-142', status: 'Completed', current: false },
    { token: 'A-143', status: 'CURRENT', current: true, counter: 'Counter 04' },
    { token: 'E-09', status: 'EMERGENCY', emergency: true },
    { token: 'A-144', status: 'NEXT', next: true, est: '5 min' },
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
              <MdOutlineMedicalServices />
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
              <MdKeyboardDoubleArrowUp />
            </span>
            <span className="home-welcome__cta-text">Tap to get token</span>
          </div>
          <div className="home-welcome__cta-line"></div>
        </div>
      </header>

      {/* Bottom Section: Token Queue Progress */}
      <footer className="home-welcome__footer">
        <div className="home-welcome__queue">
          {/* Progress Line */}
          <div className="home-welcome__progress-line">
            <div className="home-welcome__progress-line-fill"></div>
          </div>

          {queueProgress.map((item, index) => (
            <div
              key={index}
              className={`home-welcome__queue-item ${item.status === 'Completed' ? 'home-welcome__queue-item--completed' : ''}`}
            >
              {item.current ? (
                <div className="home-welcome__token home-welcome__token--current">
                  <span className="home-welcome__token-text">{item.token}</span>
                </div>
              ) : item.emergency ? (
                <div className="home-welcome__token home-welcome__token--emergency">
                  {item.token}
                </div>
              ) : (
                <div
                  className={`home-welcome__token home-welcome__token--default ${item.status === 'Completed' ? 'home-welcome__token--completed' : ''}`}
                >
                  {item.status === 'Completed' ? (
                    <span className="material-symbols-outlined home-welcome__token-icon">
                      check
                    </span>
                  ) : (
                    <span className="home-welcome__token-text">{item.token}</span>
                  )}
                </div>
              )}
              <span
                className={`home-welcome__status ${
                  item.current
                    ? 'home-welcome__status--current'
                    : item.emergency
                      ? 'home-welcome__status--emergency'
                      : 'home-welcome__status--default'
                }`}
              >
                {item.status}
              </span>
              {(item.counter || item.est) && (
                <span className="home-welcome__meta">
                  {item.counter || `Est. ${item.est}`}
                </span>
              )}
              {item.status === 'Completed' && (
                <span className="home-welcome__token-label">{item.token}</span>
              )}
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}
