import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Trophy, Medal, Award } from 'lucide-react';
import { formatPercent } from '../utils';
import type { RankingItem } from '../types';

interface RankingListProps {
  title: string;
  data: RankingItem[];
  type: 'discipline' | 'province' | 'university';
  onTypeChange?: (type: 'discipline' | 'province' | 'university') => void;
}

const RankingList: React.FC<RankingListProps> = ({ title, data, type, onTypeChange }) => {
  const [activeTab, setActiveTab] = useState<'discipline' | 'province' | 'university'>(type);

  useEffect(() => {
    setActiveTab(type);
  }, [type]);

  const handleTabChange = (tab: 'discipline' | 'province' | 'university') => {
    setActiveTab(tab);
    if (onTypeChange) {
      onTypeChange(tab);
    }
  };

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
    if (change > 0) return <TrendingUp className="w-3 h-3 text-emerald-400" />;
    return <TrendingDown className="w-3 h-3 text-red-400" />;
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
        return 'bg-slate-800/50 border-transparent hover:border-blue-500/30';
    }
  };

  const getTabLabel = (tab: string) => {
    if (tab === 'discipline') return '学科';
    if (tab === 'province') return '省份';
    return '高校';
  };

  const getEmptyHint = () => {
    if (activeTab === 'discipline') return '暂无学科排名数据';
    if (activeTab === 'province') return '暂无省份排名数据';
    return '暂无高校排名数据';
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
        
        <div className="flex gap-1 bg-slate-800/50 rounded-lg p-1">
          {(['discipline', 'province', 'university'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === tab
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {getTabLabel(tab)}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3 px-1 py-2 bg-blue-500/10 rounded-lg border border-blue-500/20 flex items-center justify-between">
        <span className="text-xs text-blue-300">
          当前维度：<span className="font-semibold text-white">{getTabLabel(activeTab)}就业率排名</span>
        </span>
        <span className="text-xs text-gray-400">
          共 <span className="font-mono text-white">{data.length}</span> 条记录
        </span>
      </div>

      <div className="flex-1 overflow-hidden">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Minus className="w-10 h-10 mb-2 opacity-30" />
            <span className="text-sm">{getEmptyHint()}</span>
          </div>
        ) : (
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
                  key={`${activeTab}-${item.id}`}
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
                        <span className="px-1.5 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded">
                          TOP {item.rank}
                        </span>
                      )}
                      {item.subtitle && (
                        <span className="text-xs text-gray-500 truncate">
                          {item.subtitle}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-mono font-semibold text-emerald-400">
                        {formatPercent(item.value, 1)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {activeTab === 'discipline' ? '就业率' : 
                         activeTab === 'province' ? '平均就业率' : '初次就业率'}
                      </span>
                      <div className="flex items-center gap-1 ml-auto">
                        {getChangeIcon(item.change)}
                        <span className={`text-xs ${item.change && item.change > 0 ? 'text-emerald-400' : item.change && item.change < 0 ? 'text-red-400' : 'text-gray-500'}`}>
                          {item.change ? `${item.change > 0 ? '+' : ''}${item.change.toFixed(1)}%` : '-'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(item.value, 100)}%` }}
                        transition={{ duration: 1, delay: index * 0.05 + 0.3 }}
                        className={`h-full rounded-full ${
                          item.rank === 1 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                          item.rank === 2 ? 'bg-gradient-to-r from-gray-300 to-gray-500' :
                          item.rank === 3 ? 'bg-gradient-to-r from-amber-500 to-orange-600' :
                          'bg-gradient-to-r from-blue-500 to-cyan-400'
                        }`}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
};

export default RankingList;
