import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  generateAllData,
  generateRankings,
  generateHeatmapData,
  getUniversityTrendData,
} from '../mock/dataGenerator';
import type {
  Province,
  University,
  Discipline,
  Course,
  TrendData,
  RankingItem,
  HeatmapItem,
  DataFilters,
  DataSource,
  ImportRecord,
  CleaningRule,
  DataQualityMetrics,
} from '../types';

interface DataState {
  provinces: Province[];
  universities: University[];
  disciplines: Discipline[];
  courses: Course[];
  dataSources: DataSource[];
  importRecords: ImportRecord[];
  cleaningRules: CleaningRule[];
  dataQualityMetrics: DataQualityMetrics;
  isLoading: boolean;
  initData: () => void;
  getProvinces: (filters?: DataFilters) => Province[];
  getProvinceDetail: (provinceId: string) => (Province & { universities: University[]; trends: TrendData[] }) | null;
  getUniversities: (provinceId?: string, filters?: DataFilters) => University[];
  getUniversityDetail: (universityId: string) => (University & { trends: TrendData[]; disciplines: Discipline[] }) | null;
  getDisciplines: (filters?: DataFilters) => Discipline[];
  getEmploymentRanking: (type: 'discipline' | 'province' | 'university', limit?: number) => RankingItem[];
  getHeatmapData: () => HeatmapItem[];
  toggleCleaningRule: (ruleId: string) => void;
  runImport: (sourceId: string) => Promise<{ success: boolean; count: number }>;
}

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      provinces: [],
      universities: [],
      disciplines: [],
      courses: [],
      dataSources: [],
      importRecords: [],
      cleaningRules: [],
      dataQualityMetrics: { completeness: 0, accuracy: 0, timeliness: 0, uniqueness: 0 },
      isLoading: true,

      initData: () => {
        const data = generateAllData();
        set({
          provinces: data.provinces,
          universities: data.universities,
          disciplines: data.disciplines,
          courses: data.courses,
          dataSources: data.dataSources,
          importRecords: data.importRecords,
          cleaningRules: data.cleaningRules,
          dataQualityMetrics: data.dataQualityMetrics,
          isLoading: false,
        });
      },

      getProvinces: (filters) => {
        let result = [...get().provinces];
        if (filters?.yearFrom || filters?.yearTo) {
        }
        return result;
      },

      getProvinceDetail: (provinceId) => {
        const province = get().provinces.find((p) => p.id === provinceId);
        if (!province) return null;

        const universities = get().universities.filter((u) => u.provinceId === provinceId);
        const trends = getUniversityTrendData();

        return { ...province, universities, trends };
      },

      getUniversities: (provinceId, filters) => {
        let result = [...get().universities];
        if (provinceId) {
          result = result.filter((u) => u.provinceId === provinceId);
        }
        if (filters?.level) {
          result = result.filter((u) => u.level === filters.level);
        }
        return result;
      },

      getUniversityDetail: (universityId) => {
        const university = get().universities.find((u) => u.id === universityId);
        if (!university) return null;

        const trends = getUniversityTrendData();
        const disciplines = get().disciplines.slice(0, 10);

        return { ...university, trends, disciplines };
      },

      getDisciplines: (filters) => {
        let result = [...get().disciplines];
        if (filters?.disciplineId) {
          result = result.filter((d) => d.id === filters.disciplineId);
        }
        return result;
      },

      getEmploymentRanking: (type, limit = 20) => {
        const { provinces, universities, disciplines } = get();
        const rankings = generateRankings(provinces, universities, disciplines, type);
        return limit ? rankings.slice(0, limit) : rankings;
      },

      getHeatmapData: () => {
        return generateHeatmapData(get().provinces);
      },

      toggleCleaningRule: (ruleId) => {
        set((state) => ({
          cleaningRules: state.cleaningRules.map((r) =>
            r.id === ruleId ? { ...r, enabled: !r.enabled } : r
          ),
        }));
      },

      runImport: async (sourceId) => {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const count = Math.floor(Math.random() * 10000) + 1000;
        set((state) => ({
          importRecords: [
            {
              id: `ir_${Date.now()}`,
              sourceId,
              sourceName: state.dataSources.find((s) => s.id === sourceId)?.name || '',
              importTime: new Date().toISOString(),
              recordCount: count,
              status: 'success',
              operator: state.dataSources.find((s) => s.id === sourceId)?.type || '',
            },
            ...state.importRecords,
          ],
        }));
        return { success: true, count };
      },
    }),
    {
      name: 'data-storage',
      partialize: (state) => ({
        provinces: state.provinces,
        universities: state.universities,
        disciplines: state.disciplines,
        courses: state.courses,
        cleaningRules: state.cleaningRules,
        importRecords: state.importRecords,
      }),
    }
  )
);
