import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Trophy, Medal, Award } from 'lucide-react';
import { formatPercent } from '../utils';
import type { RankingItem } from '../types';

interface RankingListProps {
  title: string;
  data: RankingItem[];
  type: 'discipline' | 'province' | 'university';
}

const RankingList: React.FC<RankingListProps> = ({ title, data, type }) => {
  const [activeTab, setActiveTab] = useState<'discipline' | 'province' | 'university'>(type);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-300" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-500">{rank}</span>;
    }
  };

  const getChangeIcon = (change?: number) => {
    if (!change) return <Minus className="w-3 h-3 text-gray-500" />;
    if (change > 0) return <TrendingUp className="w-3 h-3 text-success-500" />;
    return <TrendingDown className="w-3 h-3 text-danger-500" />;
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30';
      case 2:
        return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/30';
      case 3:
        return 'bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-amber-600/30';
      default:
        return 'bg-dark-700/50 border-transparent hover:border-primary-500/30';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="glass-card p-6 h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        
        <div className="flex gap-1 bg-dark-700/50 rounded-lg p-1">
          {(['discipline', 'province', 'university'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === tab
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'discipline' ? '学科' : tab === 'province' ? '省份' : '高校'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full overflow-y-auto pr-1 space-y-2"
          >
            {data.slice(0, 15).map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${getRankBg(item.rank)}`}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex-shrink-0">
                  {getRankIcon(item.rank)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white truncate">{item.name}</span>
                    {item.rank <= 3 && (
                      <span className="px-1.5 py-0.5 text-xs bg-primary-500/20 text-primary-400 rounded">
                        TOP {item.rank}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-accent-400 font-mono">
                      {formatPercent(item.value, 1)}
                    </span>
                    <div className="flex items-center gap-1">
                      {getChangeIcon(item.change)}
                      <span className={`text-xs ${item.change && item.change > 0 ? 'text-success-500' : item.change && item.change < 0 ? 'text-danger-500' : 'text-gray-500'}`}>
                        {item.change ? `${item.change > 0 ? '+' : ''}${item.change}` : '-'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <div className="w-24 h-2 bg-dark-600 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value}%` }}
                      transition={{ duration: 1, delay: index * 0.05 + 0.5 }}
                      className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default RankingList;
