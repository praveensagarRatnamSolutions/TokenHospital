'use client';
import './Tokens.css';

export type Token = {
  token: string;
  status: 'EMERGENCY' | 'CURRENT' | 'NEXT' | 'COMPLETED';
  est?: string;
  current?: boolean;
  emergency?: boolean;
  next?: boolean;
};

const STATUS_CLASS = {
  EMERGENCY: 'token--emergency',
  CURRENT: 'token--current',
  NEXT: 'token--next',
  COMPLETED: 'token--completed',
};

export default function TokenQueue({ queueProgress }: { queueProgress: Token[] }) {
  const tokens = queueProgress.slice(0, 5);

  return (
    <div className="queue">
      {tokens.map((item, index) => (
        <div
          key={index}
          className={`token ${STATUS_CLASS[item.status]} ${
            item.status === 'CURRENT'
              ? 'is-current'
              : item.status === 'EMERGENCY'
                ? 'is-emergency'
                : item.status === 'COMPLETED'
                  ? 'is-completed'
                  : ''
          }`}
        >
          <div className="token__label">{item.status}</div>

          <div className="token__number">{item.token}</div>

          {item.status === 'NEXT' && item.est && (
            <div className="token__meta">Est: {item.est}</div>
          )}
        </div>
      ))}
    </div>
  );
}
