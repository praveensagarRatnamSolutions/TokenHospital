import React from 'react';

import { User, Activity } from 'lucide-react';
import type { Token } from '../../../core/types';

interface TokenListProps {
  tokens: Token[];
}

const TokenList: React.FC<TokenListProps> = ({ tokens }) => {
  return (
    <div className="sidebar flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
      <div className="flex items-center gap-3 px-2 mb-2">
        <Activity className="text-sky-400" size={24} />
        <h2 className="text-xl font-black text-white uppercase tracking-tighter">Live Queue</h2>
      </div>
      
      {tokens.length === 0 ? (
        <div className="token-card items-center justify-center p-12 text-slate-500 text-center italic">
          No tokens waiting at the moment.
        </div>
      ) : (
        tokens.map((token) => (
          <div key={token._id} className="token-card animate-in fade-in slide-in-from-right duration-500">
            <div className="flex justify-between items-start">
              <span className="token-number">{token.tokenNumber}</span>
              <span className="bg-sky-500/20 text-sky-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                {token.status}
              </span>
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-3">
              <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
                <User size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-white font-bold truncate">Dr. {token.doctorId.name}</p>
                <p className="text-slate-400 text-xs font-bold uppercase truncate">{token.departmentId.name}</p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default TokenList;
