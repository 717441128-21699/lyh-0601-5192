import dayjs from 'dayjs';
import numeral from 'numeral';
import type { UserRole, WarningLevel, ApprovalStatus, UniversityLevel, AnomalyType, MetricTrend } from '../types';

export const formatPercent = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

export const formatNumber = (value: number, format: string = '0,0'): string => {
  return numeral(value).format(format);
};

export const formatDate = (date: string | Date, format: string = 'YYYY-MM-DD'): string => {
  return dayjs(date).format(format);
};

export const formatDateTime = (date: string | Date): string => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

export const getRoleName = (role: UserRole): string => {
  const roleMap: Record<UserRole, string> = {
    ministry: '教育部',
    provincial: '省级教育厅',
    university: '高校',
  };
  return roleMap[role] || role;
};

export const getWarningLevelName = (level: WarningLevel): string => {
  const levelMap: Record<WarningLevel, string> = {
    level1: '一级预警',
    level2: '二级预警',
    level3: '三级预警',
  };
  return levelMap[level] || level;
};

export const getWarningLevelColor = (level: WarningLevel): string => {
  const colorMap: Record<WarningLevel, string> = {
    level1: '#F53F3F',
    level2: '#FF7D00',
    level3: '#F7BA1E',
  };
  return colorMap[level] || '#999';
};

export const getApprovalStatusName = (status: ApprovalStatus): string => {
  const statusMap: Record<ApprovalStatus, string> = {
    pending_university: '待高校确认',
    pending_provincial: '待省厅复核',
    pending_ministry: '待教育部批准',
    approved: '已批准',
    rejected: '已驳回',
  };
  return statusMap[status] || status;
};

export const getApprovalStatusColor = (status: ApprovalStatus): string => {
  const colorMap: Record<ApprovalStatus, string> = {
    pending_university: '#FF7D00',
    pending_provincial: '#165DFF',
    pending_ministry: '#722ED1',
    approved: '#00B42A',
    rejected: '#F53F3F',
  };
  return colorMap[status] || '#999';
};

export const getUniversityLevelName = (level: UniversityLevel): string => {
  const levelMap: Record<UniversityLevel, string> = {
    '985': '985工程',
    '211': '211工程',
    'double-first-class': '双一流',
    general: '普通本科',
  };
  return levelMap[level] || level;
};

export const getUniversityLevelColor = (level: UniversityLevel): string => {
  const colorMap: Record<UniversityLevel, string> = {
    '985': '#F53F3F',
    '211': '#FF7D00',
    'double-first-class': '#165DFF',
    general: '#86909C',
  };
  return colorMap[level] || '#999';
};

export const getAnomalyTypeName = (type: AnomalyType): string => {
  const typeMap: Record<AnomalyType, string> = {
    missing: '课程缺失',
    extra: '额外开设',
    credit_deviation: '学分偏差',
    hour_deviation: '课时偏差',
  };
  return typeMap[type] || type;
};

export const getAnomalyTypeColor = (type: AnomalyType): string => {
  const colorMap: Record<AnomalyType, string> = {
    missing: '#F53F3F',
    extra: '#FF7D00',
    credit_deviation: '#F7BA1E',
    hour_deviation: '#165DFF',
  };
  return colorMap[type] || '#999';
};

export const getTrendIcon = (trend: MetricTrend): string => {
  const iconMap: Record<MetricTrend, string> = {
    up: '↑',
    down: '↓',
    stable: '→',
  };
  return iconMap[trend];
};

export const getTrendColor = (trend: MetricTrend): string => {
  const colorMap: Record<MetricTrend, string> = {
    up: '#00B42A',
    down: '#F53F3F',
    stable: '#86909C',
  };
  return colorMap[trend];
};

export const getReportTypeName = (type: string): string => {
  const typeMap: Record<string, string> = {
    weekly: '周报',
    monthly: '月报',
    quarterly: '季报',
    custom: '自定义',
  };
  return typeMap[type] || type;
};

export const getReportScopeName = (scope: string): string => {
  const scopeMap: Record<string, string> = {
    national: '全国',
    provincial: '省级',
    university: '高校',
  };
  return scopeMap[scope] || scope;
};

export const calculateYoY = (current: number, lastYear: number): number => {
  if (lastYear === 0) return 0;
  return ((current - lastYear) / lastYear) * 100;
};

export const calculateAverage = (values: number[]): number => {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

export const hasPermission = (userPermissions: string[], requiredPermission: string): boolean => {
  if (userPermissions.includes('*')) return true;
  if (userPermissions.includes(requiredPermission)) return true;
  const prefix = requiredPermission.split(':')[0];
  if (userPermissions.includes(`${prefix}:*`)) return true;
  return userPermissions.some((p) => {
    if (p.endsWith(':*')) {
      const pPrefix = p.slice(0, -2);
      return requiredPermission.startsWith(pPrefix);
    }
    return false;
  });
};

export const debounce = <T extends (...args: unknown[]) => unknown>(fn: T, delay: number): T => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  }) as T;
};

export const throttle = <T extends (...args: unknown[]) => unknown>(fn: T, limit: number): T => {
  let inThrottle = false;
  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  }) as T;
};

export const downloadFile = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};
