import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatPercent, getTrendColor } from '../utils';
import type { MetricTrend } from '../types';

interface MetricCardProps {
  title: string;
  value: number;
  target?: number;
  trend?: MetricTrend;
  trendValue?: number;
  icon: React.ReactNode;
  color: string;
  delay?: number;
  suffix?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  target,
  trend = 'stable',
  trendValue,
  icon,
  color,
  delay = 0,
  suffix = '%',
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const startTime = Date.now();
    const startValue = 0;
    const endValue = value;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (endValue - startValue) * easeProgress;
      setDisplayValue(currentValue);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const timer = setTimeout(animate, delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4" style={{ color: getTrendColor('up') }} />;
      case 'down':
        return <TrendingDown className="w-4 h-4" style={{ color: getTrendColor('down') }} />;
      default:
        return <Minus className="w-4 h-4" style={{ color: getTrendColor('stable') }} />;
    }
  };

  const progressPercent = target ? Math.min((value / target) * 100, 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay / 1000 }}
      className="glass-card p-5 relative overflow-hidden group"
    >
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 blur-2xl group-hover:opacity-20 transition-opacity"
        style={{ backgroundColor: color }}
      />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div
            className="p-2.5 rounded-xl"
            style={{ backgroundColor: `${color}20` }}
          >
            <div style={{ color }}>{icon}</div>
          </div>
          <div className="flex items-center gap-1 text-sm">
            {getTrendIcon()}
            {trendValue !== undefined && (
              <span style={{ color: getTrendColor(trend) }}>
                {trendValue > 0 ? '+' : ''}{trendValue.toFixed(1)}%
              </span>
            )}
          </div>
        </div>

        <h3 className="text-sm text-gray-400 mb-1">{title}</h3>
        
        <div className="flex items-baseline gap-2">
          <span
            className="text-3xl font-bold count-number"
            style={{ color }}
          >
            {suffix === '%' ? formatPercent(displayValue, 1) : displayValue.toFixed(0)}
          </span>
          {target && (
            <span className="text-sm text-gray-500">
              / 目标 {target}{suffix}
            </span>
          )}
        </div>

        {target && (
          <div className="mt-3 h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, delay: delay / 1000 + 0.3 }}
              className="h-full rounded-full"
              style={{ backgroundColor: color }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MetricCard;
