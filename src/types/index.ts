export type UserRole = 'ministry' | 'provincial' | 'university';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  provinceId?: string;
  universityId?: string;
  permissions: string[];
}

export interface Province {
  id: string;
  name: string;
  code: string;
  enrollmentCount: number;
  registrationRate: number;
  coursePassRate: number;
  graduationRate: number;
  employmentRate: number;
  majorMatchRate: number;
}

export type UniversityLevel = '985' | '211' | 'double-first-class' | 'general';

export interface University {
  id: string;
  name: string;
  provinceId: string;
  level: UniversityLevel;
  enrollmentCount: number;
  registrationRate: number;
  coursePassRate: number;
  graduationRate: number;
  employmentRate: number;
  majorMatchRate: number;
}

export interface Discipline {
  id: string;
  name: string;
  code: string;
  category: string;
  employmentRate: number;
  nationalAverage: number;
}

export interface TrendData {
  year: number;
  registrationRate: number;
  coursePassRate: number;
  graduationRate: number;
  employmentRate: number;
  majorMatchRate: number;
}

export type WarningLevel = 'level1' | 'level2' | 'level3';
export type ApprovalStatus = 'pending_university' | 'pending_provincial' | 'pending_ministry' | 'approved' | 'rejected';

export interface Warning {
  id: string;
  provinceId: string;
  universityId: string;
  disciplineId: string;
  level: WarningLevel;
  employmentRate: number;
  nationalAverage: number;
  deviationPercent: number;
  consecutiveYears: number;
  status: ApprovalStatus;
  createdAt: string;
  approvalHistory: ApprovalRecord[];
}

export interface ApprovalRecord {
  id: string;
  warningId: string;
  operatorId: string;
  operatorName: string;
  operatorRole: UserRole;
  action: 'confirm' | 'review' | 'approve' | 'reject';
  comment: string;
  createdAt: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  hours: number;
  isCore: boolean;
  semester: number;
}

export interface CurriculumComparison {
  plannedCourses: Course[];
  actualCourses: Course[];
  deviationRate: number;
  anomalies: CurriculumAnomaly[];
}

export type AnomalyType = 'missing' | 'extra' | 'credit_deviation' | 'hour_deviation';

export interface CurriculumAnomaly {
  courseId: string;
  courseName: string;
  anomalyType: AnomalyType;
  deviationPercent: number;
  description: string;
}

export type ReportType = 'weekly' | 'monthly' | 'quarterly' | 'custom';
export type ReportScope = 'national' | 'provincial' | 'university';
export type ReportStatus = 'generating' | 'ready' | 'failed';

export interface Report {
  id: string;
  title: string;
  type: ReportType;
  scope: ReportScope;
  scopeId?: string;
  createdAt: string;
  generatedBy: string;
  status: ReportStatus;
  content: ReportContent;
}

export interface ReportContent {
  registrationRateYoY: number;
  coursePassRate: number;
  employmentDistribution: EmploymentDistributionItem[];
  keyMetrics: KeyMetric[];
  trends: TrendData[];
}

export interface EmploymentDistributionItem {
  category: string;
  count: number;
  percentage: number;
}

export type MetricTrend = 'up' | 'down' | 'stable';

export interface KeyMetric {
  name: string;
  value: number;
  target: number;
  trend: MetricTrend;
}

export interface RankingItem {
  id: string;
  name: string;
  value: number;
  rank: number;
  change?: number;
}

export interface HeatmapItem {
  id: string;
  name: string;
  value: number;
}

export interface DataFilters {
  provinceId?: string;
  universityId?: string;
  disciplineId?: string;
  yearFrom?: number;
  yearTo?: number;
  level?: UniversityLevel;
}

export interface WarningFilters {
  level?: WarningLevel;
  status?: ApprovalStatus;
  provinceId?: string;
  universityId?: string;
}

export interface ReportFilters {
  type?: ReportType;
  scope?: ReportScope;
  status?: ReportStatus;
}

export interface DataSource {
  id: string;
  name: string;
  type: 'enrollment' | 'registration' | 'grades' | 'graduation' | 'employment';
  lastSync: string;
  status: 'active' | 'inactive' | 'error';
  recordCount: number;
}

export interface ImportResult {
  success: boolean;
  recordsImported: number;
  errors: string[];
  warnings: string[];
}

export interface ImportRecord {
  id: string;
  sourceId: string;
  sourceName: string;
  fileName?: string;
  importTime: string;
  recordCount: number;
  status: 'success' | 'partial' | 'failed';
  operator: string;
}

export interface CleaningRule {
  id: string;
  name: string;
  description: string;
  type: 'deduplication' | 'fill_missing' | 'filter_outlier' | 'format_standard';
  enabled: boolean;
  affectedFields: string[];
}

export interface DataQualityMetrics {
  completeness: number;
  accuracy: number;
  timeliness: number;
  uniqueness: number;
}
