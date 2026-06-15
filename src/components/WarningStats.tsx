import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { getWarningLevelColor, getApprovalStatusColor } from '../utils';
import type { WarningLevel } from '../types';

interface WarningStatsProps {
  stats: {
    total: number;
    pendingUniversity: number;
    pendingProvincial: number;
    pendingMinistry: number;
    approved: number;
    level1: number;
    level2: number;
    level3: number;
  };
  onViewAll: () => void;
}

const WarningStats: React.FC<WarningStatsProps> = ({ stats, onViewAll }) => {
  const levelItems: Array<{ level: WarningLevel; count: number; label: string }> = [
    { level: 'level1', count: stats.level1, label: '一级预警' },
    { level: 'level2', count: stats.level2, label: '二级预警' },
    { level: 'level3', count: stats.level3, label: '三级预警' },
  ];

  const statusItems = [
    { count: stats.pendingUniversity, label: '待高校确认', icon: Clock, color: getApprovalStatusColor('pending_university') },
    { count: stats.pendingProvincial, label: '待省厅复核', icon: Clock, color: getApprovalStatusColor('pending_provincial') },
    { count: stats.pendingMinistry, label: '待教育部批准', icon: Clock, color: getApprovalStatusColor('pending_ministry') },
    { count: stats.approved, label: '已处理', icon: CheckCircle, color: getApprovalStatusColor('approved') },
  ];

  const pendingTotal = stats.pendingUniversity + stats.pendingProvincial + stats.pendingMinistry;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="glass-card p-6 h-full"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-danger-500/20">
            <AlertTriangle className="w-5 h-5 text-danger-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">预警统计</h3>
            <p className="text-sm text-gray-400">共 {stats.total} 条预警记录</p>
          </div>
        </div>
        <button
          onClick={onViewAll}
          className="px-4 py-2 text-sm font-medium text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 rounded-lg transition-all"
        >
          查看全部 →
        </button>
      </div>

      {pendingTotal > 0 && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="mb-6 p-4 rounded-xl bg-gradient-to-r from-danger-500/20 to-warning-500/20 border border-danger-500/30 pulse-warning"
        >
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-danger-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-white">
                有 <span className="text-danger-400 font-bold">{pendingTotal}</span> 条预警待处理
              </p>
              <p className="text-xs text-gray-400 mt-0.5">请及时处理待审批的预警事项</p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-400 mb-3">预警级别分布</h4>
        <div className="grid grid-cols-3 gap-3">
          {levelItems.map((item, index) => (
            <motion.div
              key={item.level}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
              className="text-center p-3 rounded-xl bg-dark-700/50 border border-transparent hover:border-primary-500/30 transition-all"
            >
              <div
                className="text-2xl font-bold count-number mb-1"
                style={{ color: getWarningLevelColor(item.level) }}
              >
                {item.count}
              </div>
              <div className="text-xs text-gray-400">{item.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-400 mb-3">处理状态分布</h4>
        <div className="space-y-2">
          {statusItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 1 + index * 0.1 }}
              className="flex items-center justify-between p-2.5 rounded-lg bg-dark-700/30 hover:bg-dark-700/50 transition-all"
            >
              <div className="flex items-center gap-2">
                <item.icon className="w-4 h-4" style={{ color: item.color }} />
                <span className="text-sm text-gray-300">{item.label}</span>
              </div>
              <span
                className="text-sm font-semibold count-number"
                style={{ color: item.color }}
              >
                {item.count}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>今日新增</span>
          <span className="text-danger-400 font-medium">+{Math.floor(stats.total * 0.1)}</span>
        </div>
        <div className="mt-2 h-1.5 bg-dark-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(pendingTotal / stats.total) * 100}%` }}
            transition={{ duration: 1, delay: 1.2 }}
            className="h-full bg-gradient-to-r from-danger-500 to-warning-500 rounded-full"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default WarningStats;
