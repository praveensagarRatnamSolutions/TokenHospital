import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ChevronRight, Loader2, WifiOff } from 'lucide-react';
import type { Token } from '../../../core/types';

interface TokenActionCardProps {
  token: Token | null;
  onIncrement: () => void;
  loading: boolean;
  isOnline: boolean;
  isFullLayout?: boolean;
}

const TokenActionCard: React.FC<TokenActionCardProps> = ({ 
  token, 
  onIncrement, 
  loading, 
  isOnline,
  isFullLayout = false 
}) => {
  return (
    <div className={`token-action-card ${isFullLayout ? 'full-layout' : ''}`}>
      <div className="flex items-center justify-between gap-6 h-full px-8">
        {/* Token Info */}
        <div className="flex flex-col justify-center">
          <span className="text-sky-400 text-sm font-black uppercase tracking-[0.2em] mb-1">
            Current Token
          </span>
          <AnimatePresence mode="wait">
            <motion.div
              key={token?._id || 'empty'}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-baseline gap-4"
            >
              <h2 className="text-7xl font-black text-white leading-none">
                {token?.tokenNumber || '---'}
              </h2>
              {token?.patientName && (
                <div className="flex flex-col">
                  <span className="text-white/40 text-xs font-bold uppercase">Patient</span>
                  <span className="text-white/90 font-bold">{token.patientName}</span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Doctor Info */}
        {token?.doctorId && (
          <div className="hidden lg:flex items-center gap-4 border-l border-white/10 pl-8">
            <div className="size-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
              <User className="text-sky-400" size={24} />
            </div>
            <div>
              <p className="text-white/40 text-[10px] font-black uppercase">Attending Doctor</p>
              <p className="text-white font-bold leading-tight">{token.doctorId.name}</p>
              <p className="text-sky-400/60 text-[10px] font-bold uppercase">{token.departmentId?.name}</p>
            </div>
          </div>
        )}

        {/* Increment Button */}
        <div className="flex items-center gap-4">
          {!isOnline && (
            <div className="flex items-center gap-2 text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-full border border-amber-400/20">
              <WifiOff size={14} />
              <span className="text-[10px] font-black uppercase tracking-tighter">Queue Mode</span>
            </div>
          )}
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onIncrement}
            disabled={loading}
            className={`
              relative group flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase tracking-widest transition-all
              ${loading ? 'bg-white/5 text-white/20' : 'bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/20'}
            `}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <span>Next Token</span>
                <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </>
            )}
          </motion.button>
        </div>
      </div>

      <style>{`
        .token-action-card {
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(20px);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          height: 100%;
          width: 100%;
        }
        .token-action-card.full-layout {
          height: 100vh;
          background: radial-gradient(circle at center, #1e293b 0%, #0f172a 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
};

export default TokenActionCard;
