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
  isHydrated: boolean;
  initData: () => void;
  ensureData: () => void;
  getProvinces: (filters?: DataFilters) => Province[];
  getProvinceDetail: (provinceId: string) => (Province & { universities: University[]; trends: TrendData[] }) | null;
  getUniversities: (provinceId?: string, filters?: DataFilters) => University[];
  getUniversityDetail: (universityId: string) => (University & { trends: TrendData[]; disciplines: Discipline[] }) | null;
  getDisciplines: (filters?: DataFilters) => Discipline[];
  getEmploymentRanking: (type: 'discipline' | 'province' | 'university', limit?: number) => RankingItem[];
  getHeatmapData: () => HeatmapItem[];
  toggleCleaningRule: (ruleId: string) => void;
  runImport: (sourceId: string, options?: { importCount?: number; fileName?: string }) => Promise<{
    success: boolean;
    count: number;
    cleanedCount: number;
    invalidCount: number;
    duplicateCount: number;
    updatedMetrics: Record<string, { old: number; new: number; delta: number }>;
  }>;
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
      isLoading: false,
      isHydrated: false,

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

      ensureData: () => {
        const state = get();
        if (state.provinces.length === 0 || state.universities.length === 0) {
          state.initData();
        } else {
          set({ isLoading: false });
        }
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

      runImport: async (sourceId, options) => {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const importCount = options?.importCount;
        const fileName = options?.fileName;
        const count = importCount || Math.floor(Math.random() * 10000) + 1000;
        const cleanedCount = Math.floor(count * (0.92 + Math.random() * 0.06));
        const invalidCount = Math.floor(count * (0.02 + Math.random() * 0.03));
        const duplicateCount = count - cleanedCount - invalidCount;

        const updatedMetrics: Record<string, { old: number; new: number; delta: number }> = {};

        set((state) => {
          const source = state.dataSources.find((s) => s.id === sourceId);
          const sourceType = source?.type || 'enrollment';

          let newProvinces = [...state.provinces];
          let newUniversities = [...state.universities];
          let newDisciplines = [...state.disciplines];

          if (sourceType === 'enrollment') {
            const addPerProvince = Math.ceil(count / newProvinces.length);
            newProvinces = newProvinces.map((p) => {
              const oldVal = p.enrollmentCount || 0;
              const newVal = oldVal + addPerProvince;
              updatedMetrics[`province_${p.id}_enrollment`] = {
                old: oldVal,
                new: newVal,
                delta: newVal - oldVal,
              };
              return { ...p, enrollmentCount: newVal };
            });
            const addPerUniversity = Math.ceil(count / newUniversities.length);
            newUniversities = newUniversities.map((u) => {
              const oldVal = u.enrollmentCount || 0;
              const newVal = oldVal + addPerUniversity;
              return { ...u, enrollmentCount: newVal };
            });
          } else if (sourceType === 'registration') {
            newProvinces = newProvinces.map((p) => {
              const oldVal = p.registrationRate || 90;
              const newVal = Math.min(99.5, oldVal + 0.2 + Math.random() * 0.3);
              updatedMetrics[`province_${p.id}_registrationRate`] = {
                old: oldVal,
                new: newVal,
                delta: Number((newVal - oldVal).toFixed(2)),
              };
              return { ...p, registrationRate: newVal };
            });
            newUniversities = newUniversities.map((u) => ({
              ...u,
              registrationRate: Math.min(99.5, (u.registrationRate || 90) + 0.2 + Math.random() * 0.3),
            }));
          } else if (sourceType === 'grades') {
            newUniversities = newUniversities.map((u) => ({
              ...u,
              coursePassRate: Math.min(99, (u.coursePassRate || 85) + 0.1 + Math.random() * 0.4),
            }));
            newDisciplines = newDisciplines.map((d) => {
              const oldVal = d.coursePassRate || 85;
              const newVal = Math.min(99, oldVal + 0.1 + Math.random() * 0.4);
              updatedMetrics[`discipline_${d.id}_coursePassRate`] = {
                old: oldVal,
                new: newVal,
                delta: Number((newVal - oldVal).toFixed(2)),
              };
              return { ...d, coursePassRate: newVal };
            });
          } else if (sourceType === 'graduation') {
            newProvinces = newProvinces.map((p) => {
              const oldVal = p.graduationRate || 90;
              const newVal = Math.min(99, oldVal + 0.1 + Math.random() * 0.3);
              updatedMetrics[`province_${p.id}_graduationRate`] = {
                old: oldVal,
                new: newVal,
                delta: Number((newVal - oldVal).toFixed(2)),
              };
              return { ...p, graduationRate: newVal };
            });
            newUniversities = newUniversities.map((u) => ({
              ...u,
              graduationRate: Math.min(99, (u.graduationRate || 90) + 0.1 + Math.random() * 0.3),
            }));
          } else if (sourceType === 'employment') {
            newProvinces = newProvinces.map((p) => {
              const oldVal = p.employmentRate || 85;
              const newVal = Math.min(98, oldVal + 0.1 + Math.random() * 0.4);
              updatedMetrics[`province_${p.id}_employmentRate`] = {
                old: oldVal,
                new: newVal,
                delta: Number((newVal - oldVal).toFixed(2)),
              };
              return { ...p, employmentRate: newVal };
            });
            newUniversities = newUniversities.map((u) => ({
              ...u,
              employmentRate: Math.min(98, (u.employmentRate || 85) + 0.1 + Math.random() * 0.4),
            }));
            newDisciplines = newDisciplines.map((d) => {
              const oldVal = d.employmentRate || 80;
              const newVal = Math.min(98, oldVal + 0.1 + Math.random() * 0.5);
              updatedMetrics[`discipline_${d.id}_employmentRate`] = {
                old: oldVal,
                new: newVal,
                delta: Number((newVal - oldVal).toFixed(2)),
              };
              return { ...d, employmentRate: newVal };
            });
          }

          const dataSources = state.dataSources.map((s) =>
            s.id === sourceId
              ? { ...s, lastSyncTime: new Date().toISOString(), recordCount: (s.recordCount || 0) + count }
              : s
          );

          const existingMetrics = state.dataQualityMetrics;
          const dataQualityMetrics = {
            completeness: Math.min(99.9, existingMetrics.completeness + 0.05),
            accuracy: Math.min(99.9, existingMetrics.accuracy + 0.03),
            timeliness: Math.min(99.9, existingMetrics.timeliness + 0.08),
            uniqueness: Math.min(99.9, existingMetrics.uniqueness + 0.02),
          };

          return {
            provinces: newProvinces,
            universities: newUniversities,
            disciplines: newDisciplines,
            dataSources,
            dataQualityMetrics,
            importRecords: [
              {
                id: `ir_${Date.now()}`,
                sourceId,
                sourceName: source?.name || '',
                fileName: fileName,
                importTime: new Date().toISOString(),
                recordCount: count,
                cleanedCount,
                status: 'success',
                operator: source?.type || '',
              },
              ...state.importRecords,
            ],
          };
        });

        return { success: true, count, cleanedCount, invalidCount, duplicateCount, updatedMetrics };
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
        dataSources: state.dataSources,
        dataQualityMetrics: state.dataQualityMetrics,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Data store rehydration error:', error);
        }
        if (state) {
          state.isHydrated = true;
          if (state.provinces.length > 0 && state.universities.length > 0) {
            state.isLoading = false;
          }
        }
      },
    }
  )
);
