import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateAllData } from '../mock/dataGenerator';
import { generateId } from '../utils';
import type { Report, ReportFilters, ReportType, ReportScope, TrendData, EmploymentDistributionItem, KeyMetric } from '../types';

interface ReportState {
  reports: Report[];
  isLoading: boolean;
  isHydrated: boolean;
  initData: () => void;
  ensureData: () => void;
  getReports: (filters?: ReportFilters) => Report[];
  getReportDetail: (reportId: string) => Report | null;
  generateReport: (type: ReportType, scope: ReportScope, scopeId?: string) => Promise<Report>;
  getWeeklyReport: (scope: ReportScope, scopeId?: string) => Report | null;
}

export const useReportStore = create<ReportState>()(
  persist(
    (set, get) => ({
      reports: [],
      isLoading: false,
      isHydrated: false,

      initData: () => {
        const data = generateAllData();
        set({
          reports: data.reports,
          isLoading: false,
        });
      },

      ensureData: () => {
        const state = get();
        if (state.reports.length === 0) {
          state.initData();
        } else {
          set({ isLoading: false });
        }
      },

      getReports: (filters) => {
        let result = [...get().reports];

        if (filters?.type) {
          result = result.filter((r) => r.type === filters.type);
        }
        if (filters?.scope) {
          result = result.filter((r) => r.scope === filters.scope);
        }
        if (filters?.status) {
          result = result.filter((r) => r.status === filters.status);
        }

        return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      getReportDetail: (reportId) => {
        return get().reports.find((r) => r.id === reportId) || null;
      },

      generateReport: async (type, scope, scopeId) => {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const typeNames: Record<ReportType, string> = {
          weekly: '周',
          monthly: '月',
          quarterly: '季度',
          custom: '自定义',
        };

        const scopeNames: Record<ReportScope, string> = {
          national: '全国',
          provincial: '某省',
          university: '某校',
        };

        const baseYear = 2020;
        const trends: TrendData[] = [];
        for (let i = 0; i < 5; i++) {
          trends.push({
            year: baseYear + i,
            registrationRate: 92 + Math.random() * 5,
            coursePassRate: 86 + Math.random() * 8,
            graduationRate: 90 + Math.random() * 6,
            employmentRate: 78 + Math.random() * 12,
            majorMatchRate: 65 + Math.random() * 18,
          });
        }

        const categories = ['国有企业', '民营企业', '外资企业', '机关事业单位', '考研深造', '出国深造', '自主创业', '其他'];
        const counts = categories.map(() => Math.floor(Math.random() * 900) + 100);
        const total = counts.reduce((a, b) => a + b, 0);

        const employmentDistribution: EmploymentDistributionItem[] = categories.map((cat, idx) => ({
          category: cat,
          count: counts[idx],
          percentage: (counts[idx] / total) * 100,
        }));

        const metricNames = ['报到率', '课程通过率', '毕业率', '初次就业率', '专业对口率'];
        const metricTargets = [95, 90, 95, 85, 75];
        const keyMetrics: KeyMetric[] = metricNames.map((name, idx) => ({
          name,
          value: 80 + Math.random() * 18,
          target: metricTargets[idx],
          trend: (['up', 'down', 'stable'] as const)[Math.floor(Math.random() * 3)],
        }));

        const report: Report = {
          id: `r_${generateId()}`,
          title: `${scopeNames[scope]}教学质量诊断${typeNames[type]}报`,
          type,
          scope,
          scopeId,
          createdAt: new Date().toISOString(),
          generatedBy: 'user',
          status: 'ready',
          content: {
            registrationRateYoY: (Math.random() - 0.5) * 6,
            coursePassRate: 86 + Math.random() * 8,
            employmentDistribution,
            keyMetrics,
            trends,
          },
        };

        set((state) => ({
          reports: [report, ...state.reports],
        }));

        return report;
      },

      getWeeklyReport: (scope, scopeId) => {
        return get().reports.find((r) => r.type === 'weekly' && r.scope === scope && r.scopeId === scopeId) || null;
      },
    }),
    {
      name: 'report-storage',
      partialize: (state) => ({
        reports: state.reports,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Report store rehydration error:', error);
        }
        if (state) {
          state.isHydrated = true;
          if (state.reports.length > 0) {
            state.isLoading = false;
          }
        }
      },
    }
  )
);
