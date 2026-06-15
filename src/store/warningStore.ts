import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateAllData } from '../mock/dataGenerator';
import { generateId } from '../utils';
import type { Warning, WarningFilters, ApprovalRecord, User } from '../types';

interface WarningState {
  warnings: Warning[];
  isLoading: boolean;
  isHydrated: boolean;
  initData: () => void;
  ensureData: () => void;
  getWarnings: (filters?: WarningFilters) => Warning[];
  getWarningDetail: (warningId: string) => Warning | null;
  universityConfirm: (warningId: string, comment: string, user: User) => Warning | null;
  provincialReview: (warningId: string, approved: boolean, comment: string, user: User) => Warning | null;
  ministryApprove: (warningId: string, approved: boolean, comment: string, user: User) => Warning | null;
  getStatistics: () => {
    total: number;
    pendingUniversity: number;
    pendingProvincial: number;
    pendingMinistry: number;
    approved: number;
    level1: number;
    level2: number;
    level3: number;
  };
}

export const useWarningStore = create<WarningState>()(
  persist(
    (set, get) => ({
      warnings: [],
      isLoading: false,
      isHydrated: false,

      initData: () => {
        const data = generateAllData();
        set({
          warnings: data.warnings,
          isLoading: false,
        });
      },

      ensureData: () => {
        const state = get();
        if (state.warnings.length === 0) {
          state.initData();
        } else {
          set({ isLoading: false });
        }
      },

      getWarnings: (filters) => {
        let result = [...get().warnings];

        if (filters?.level) {
          result = result.filter((w) => w.level === filters.level);
        }
        if (filters?.status) {
          result = result.filter((w) => w.status === filters.status);
        }
        if (filters?.provinceId) {
          result = result.filter((w) => w.provinceId === filters.provinceId);
        }
        if (filters?.universityId) {
          result = result.filter((w) => w.universityId === filters.universityId);
        }

        return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      getWarningDetail: (warningId) => {
        return get().warnings.find((w) => w.id === warningId) || null;
      },

      universityConfirm: (warningId, comment, user) => {
        const record: ApprovalRecord = {
          id: `ar_${generateId()}`,
          warningId,
          operatorId: user.id,
          operatorName: user.name,
          operatorRole: user.role,
          action: 'confirm',
          comment,
          createdAt: new Date().toISOString(),
        };

        let updatedWarning: Warning | null = null;
        set((state) => ({
          warnings: state.warnings.map((w) => {
            if (w.id === warningId && w.status === 'pending_university') {
              updatedWarning = {
                ...w,
                status: 'pending_provincial',
                approvalHistory: [...w.approvalHistory, record],
              };
              return updatedWarning;
            }
            return w;
          }),
        }));

        return updatedWarning;
      },

      provincialReview: (warningId, approved, comment, user) => {
        const record: ApprovalRecord = {
          id: `ar_${generateId()}`,
          warningId,
          operatorId: user.id,
          operatorName: user.name,
          operatorRole: user.role,
          action: approved ? 'review' : 'reject',
          comment,
          createdAt: new Date().toISOString(),
        };

        let updatedWarning: Warning | null = null;
        set((state) => ({
          warnings: state.warnings.map((w) => {
            if (w.id === warningId && w.status === 'pending_provincial') {
              updatedWarning = {
                ...w,
                status: approved ? 'pending_ministry' : 'rejected',
                approvalHistory: [...w.approvalHistory, record],
              };
              return updatedWarning;
            }
            return w;
          }),
        }));

        return updatedWarning;
      },

      ministryApprove: (warningId, approved, comment, user) => {
        const record: ApprovalRecord = {
          id: `ar_${generateId()}`,
          warningId,
          operatorId: user.id,
          operatorName: user.name,
          operatorRole: user.role,
          action: approved ? 'approve' : 'reject',
          comment,
          createdAt: new Date().toISOString(),
        };

        let updatedWarning: Warning | null = null;
        set((state) => ({
          warnings: state.warnings.map((w) => {
            if (w.id === warningId && w.status === 'pending_ministry') {
              updatedWarning = {
                ...w,
                status: approved ? 'approved' : 'rejected',
                approvalHistory: [...w.approvalHistory, record],
              };
              return updatedWarning;
            }
            return w;
          }),
        }));

        return updatedWarning;
      },

      getStatistics: () => {
        const warnings = get().warnings;
        return {
          total: warnings.length,
          pendingUniversity: warnings.filter((w) => w.status === 'pending_university').length,
          pendingProvincial: warnings.filter((w) => w.status === 'pending_provincial').length,
          pendingMinistry: warnings.filter((w) => w.status === 'pending_ministry').length,
          approved: warnings.filter((w) => w.status === 'approved').length,
          level1: warnings.filter((w) => w.level === 'level1').length,
          level2: warnings.filter((w) => w.level === 'level2').length,
          level3: warnings.filter((w) => w.level === 'level3').length,
        };
      },
    }),
    {
      name: 'warning-storage',
      partialize: (state) => ({
        warnings: state.warnings,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Warning store rehydration error:', error);
        }
        if (state) {
          state.isHydrated = true;
          if (state.warnings.length > 0) {
            state.isLoading = false;
          }
        }
      },
    }
  )
);
