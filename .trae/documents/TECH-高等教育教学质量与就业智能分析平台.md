## 1. 架构设计

```mermaid
graph TD
    subgraph "前端应用层"
        A1["React SPA"]
        A2["ECharts 可视化组件"]
        A3["权限控制模块"]
        A4["数据状态管理 (Zustand)"]
        A5["Excel解析模块 (xlsx)"]
    end
    
    subgraph "服务层"
        B1["Mock API 服务"]
        B2["数据聚合服务"]
        B3["预警计算引擎"]
        B4["报表生成服务"]
    end
    
    subgraph "数据层"
        C1["招生录取数据"]
        C2["报到注册数据"]
        C3["课程成绩数据"]
        C4["毕业数据"]
        C5["就业签约数据"]
        C6["培养方案数据"]
    end
    
    subgraph "外部服务"
        D1["ECharts地图服务"]
        D2["Excel模板生成"]
        D3["PDF导出服务"]
    end
    
    A1 --> B1
    A2 --> D1
    A5 --> D2
    B1 --> B2
    B2 --> B3
    B2 --> B4
    B2 --> C1
    B2 --> C2
    B2 --> C3
    B2 --> C4
    B2 --> C5
    B2 --> C6
    B4 --> D3
    A1 --> A2
    A1 --> A3
    A1 --> A4
    A1 --> A5
```

---

## 2. 技术描述

### 2.1 前端技术栈
- **框架**: React@18 + TypeScript
- **构建工具**: Vite@5
- **样式方案**: TailwindCSS@3 + CSS Variables
- **状态管理**: Zustand@4
- **路由管理**: React Router@6
- **图表可视化**: ECharts@5 + echarts-for-react
- **UI组件库**: Ant Design@5（按需加载）
- **Excel处理**: xlsx@0.18
- **动画库**: framer-motion@11
- **工具库**: dayjs, lodash-es, numeral

### 2.2 后端服务（Mock）
- **数据模拟**: Mock 数据 + localStorage 持久化
- **API 设计**: RESTful API 风格
- **数据聚合**: 前端计算引擎（用户侧聚合）

### 2.3 项目初始化
```bash
npm create vite@latest higher-education-analytics -- --template react-ts
cd higher-education-analytics
npm install
```

---

## 3. 路由定义

| Route | 页面名称 | 权限要求 | 说明 |
|-------|---------|---------|------|
| /login | 登录页 | 公开 | 三级角色登录入口 |
| /dashboard | 核心看板 | 所有角色 | 全国招生热力图、就业排名、指标概览 |
| /data/province/:provinceId | 省份详情 | 所有角色 | 省份下钻，高校列表，历年趋势 |
| /data/university/:universityId | 高校详情 | 高校/省厅/教育部 | 单校详细数据分析 |
| /warnings | 预警中心 | 所有角色 | 预警列表、预警详情、审批流程 |
| /warnings/:warningId | 预警详情 | 所有角色 | 预警详情与审批操作 |
| /curriculum | 培养方案 | 高校/省厅/教育部 | Excel上传、课程比对、异常提醒 |
| /reports | 报告中心 | 所有角色 | 报告列表、预览、下载、配置 |
| /data-ingestion | 数据接入 | 省厅/教育部 | 数据源管理、数据导入、清洗规则 |
| /settings | 系统设置 | 管理员 | 用户管理、权限配置、系统参数 |

---

## 4. API 定义（TypeScript 类型）

### 4.1 核心数据类型

```typescript
// 用户角色类型
type UserRole = 'ministry' | 'provincial' | 'university';

// 用户信息
interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  provinceId?: string;
  universityId?: string;
  permissions: string[];
}

// 省份数据
interface Province {
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

// 高校数据
interface University {
  id: string;
  name: string;
  provinceId: string;
  level: '985' | '211' | 'double-first-class' | 'general';
  enrollmentCount: number;
  registrationRate: number;
  coursePassRate: number;
  graduationRate: number;
  employmentRate: number;
  majorMatchRate: number;
}

// 学科数据
interface Discipline {
  id: string;
  name: string;
  code: string;
  category: string;
  employmentRate: number;
  nationalAverage: number;
}

// 历年趋势数据
interface TrendData {
  year: number;
  registrationRate: number;
  coursePassRate: number;
  graduationRate: number;
  employmentRate: number;
  majorMatchRate: number;
}

// 预警数据
type WarningLevel = 'level1' | 'level2' | 'level3';
type ApprovalStatus = 'pending_university' | 'pending_provincial' | 'pending_ministry' | 'approved' | 'rejected';

interface Warning {
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

interface ApprovalRecord {
  id: string;
  warningId: string;
  operatorId: string;
  operatorName: string;
  operatorRole: UserRole;
  action: 'confirm' | 'review' | 'approve' | 'reject';
  comment: string;
  createdAt: string;
}

// 培养方案课程
interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  hours: number;
  isCore: boolean;
  semester: number;
}

interface CurriculumComparison {
  plannedCourses: Course[];
  actualCourses: Course[];
  deviationRate: number;
  anomalies: CurriculumAnomaly[];
}

interface CurriculumAnomaly {
  courseId: string;
  courseName: string;
  anomalyType: 'missing' | 'extra' | 'credit_deviation' | 'hour_deviation';
  deviationPercent: number;
  description: string;
}

// 报告数据
interface Report {
  id: string;
  title: string;
  type: 'weekly' | 'monthly' | 'quarterly' | 'custom';
  scope: 'national' | 'provincial' | 'university';
  scopeId?: string;
  createdAt: string;
  generatedBy: string;
  status: 'generating' | 'ready' | 'failed';
  content: ReportContent;
}

interface ReportContent {
  registrationRateYoY: number;
  coursePassRate: number;
  employmentDistribution: EmploymentDistributionItem[];
  keyMetrics: KeyMetric[];
  trends: TrendData[];
}

interface EmploymentDistributionItem {
  category: string;
  count: number;
  percentage: number;
}

interface KeyMetric {
  name: string;
  value: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
}
```

### 4.2 API 接口定义

```typescript
// 认证接口
interface AuthAPI {
  login(username: string, password: string, role: UserRole): Promise<{ token: string; user: User }>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User>;
}

// 数据查询接口
interface DataAPI {
  getProvinces(filters?: DataFilters): Promise<Province[]>;
  getProvinceDetail(provinceId: string): Promise<Province & { universities: University[]; trends: TrendData[] }>;
  getUniversities(provinceId?: string, filters?: DataFilters): Promise<University[]>;
  getUniversityDetail(universityId: string): Promise<University & { trends: TrendData[]; disciplines: Discipline[] }>;
  getDisciplines(filters?: DataFilters): Promise<Discipline[]>;
  getEmploymentRanking(type: 'discipline' | 'province' | 'university', limit?: number): Promise<RankingItem[]>;
  getHeatmapData(): Promise<HeatmapItem[]>;
}

// 预警接口
interface WarningAPI {
  getWarnings(filters?: WarningFilters): Promise<Warning[]>;
  getWarningDetail(warningId: string): Promise<Warning>;
  universityConfirm(warningId: string, comment: string): Promise<Warning>;
  provincialReview(warningId: string, approved: boolean, comment: string): Promise<Warning>;
  ministryApprove(warningId: string, approved: boolean, comment: string, enrollmentAdjustment?: number): Promise<Warning>;
}

// 培养方案接口
interface CurriculumAPI {
  uploadCurriculum(file: File, universityId: string): Promise<CurriculumComparison>;
  getComparisonHistory(universityId: string): Promise<CurriculumComparison[]>;
  downloadTemplate(): Promise<Blob>;
}

// 报告接口
interface ReportAPI {
  getReports(filters?: ReportFilters): Promise<Report[]>;
  getReportDetail(reportId: string): Promise<Report>;
  generateReport(config: ReportConfig): Promise<Report>;
  downloadReport(reportId: string, format: 'pdf' | 'excel'): Promise<Blob>;
  getWeeklyReport(scope: string, scopeId?: string): Promise<Report>;
}

// 数据接入接口
interface DataIngestionAPI {
  getDataSources(): Promise<DataSource[]>;
  importData(sourceId: string, file?: File): Promise<ImportResult>;
  getImportHistory(): Promise<ImportRecord[]>;
  getCleaningRules(): Promise<CleaningRule[]>;
  getDataQualityMetrics(): Promise<DataQualityMetrics>;
}
```

---

## 5. 前端模块架构图

```mermaid
graph TD
    subgraph "入口层"
        A[main.tsx] --> B[App.tsx]
    end
    
    subgraph "路由层"
        B --> C[Router]
        C --> D[路由守卫/权限控制]
    end
    
    subgraph "布局层"
        D --> E[MainLayout]
        E --> F[Header导航栏]
        E --> G[Sidebar侧边栏]
        E --> H[Content内容区]
        E --> I[Footer]
    end
    
    subgraph "页面层"
        H --> J1[Dashboard 看板页]
        H --> J2[DataDetail 数据详情页]
        H --> J3[WarningCenter 预警中心]
        H --> J4[Curriculum 培养方案页]
        H --> J5[ReportCenter 报告中心]
        H --> J6[DataIngestion 数据接入页]
    end
    
    subgraph "组件层"
        J1 --> K1[指标卡片组件]
        J1 --> K2[热力图组件]
        J1 --> K3[排名榜组件]
        J1 --> K4[预警统计组件]
        J2 --> K5[筛选器组件]
        J2 --> K6[趋势图组件]
        J2 --> K7[数据表格组件]
        J3 --> K8[审批流程组件]
        J3 --> K9[预警列表组件]
        J4 --> K10[Excel上传组件]
        J4 --> K11[比对分析组件]
        J5 --> K12[报告预览组件]
    end
    
    subgraph "状态管理层"
        L1[AuthStore 用户状态]
        L2[DataStore 数据状态]
        L3[WarningStore 预警状态]
        L4[ReportStore 报告状态]
        L5[UIPersistStore UI持久化]
    end
    
    subgraph "服务层"
        M1[AuthService]
        M2[DataService]
        M3[WarningService]
        M4[CurriculumService]
        M5[ReportService]
        M6[MockAPIService]
    end
    
    subgraph "工具层"
        N1[日期处理]
        N2[数值格式化]
        N3[权限判断]
        N4[Excel解析]
        N5[图表配置]
    end
    
    J1 --> L2
    J2 --> L2
    J3 --> L3
    J4 --> L2
    J5 --> L4
    L1 --> M1
    L2 --> M2
    L3 --> M3
    L4 --> M5
    M1 --> M6
    M2 --> M6
    M3 --> M6
    M4 --> M6
    M5 --> M6
    K1 --> N2
    K6 --> N5
    K10 --> N4
    D --> L1
    D --> N3
```

---

## 6. 数据模型

### 6.1 ER 图

```mermaid
erDiagram
    USER ||--o{ WARNING : "处理"
    USER ||--o{ REPORT : "生成"
    USER ||--o{ APPROVAL_RECORD : "创建"
    USER {
        string id PK
        string username
        string name
        string role
        string provinceId FK
        string universityId FK
        json permissions
    }
    
    PROVINCE ||--o{ UNIVERSITY : "包含"
    PROVINCE ||--o{ WARNING : "关联"
    PROVINCE ||--o{ TREND_DATA : "统计"
    PROVINCE {
        string id PK
        string name
        string code
        int enrollmentCount
        float registrationRate
        float coursePassRate
        float graduationRate
        float employmentRate
        float majorMatchRate
    }
    
    UNIVERSITY ||--o{ STUDENT : "招收"
    UNIVERSITY ||--o{ COURSE : "开设"
    UNIVERSITY ||--o{ CURRICULUM_PLAN : "制定"
    UNIVERSITY ||--o{ WARNING : "关联"
    UNIVERSITY ||--o{ TREND_DATA : "统计"
    UNIVERSITY {
        string id PK
        string name
        string provinceId FK
        string level
        int enrollmentCount
        float registrationRate
        float coursePassRate
        float graduationRate
        float employmentRate
        float majorMatchRate
    }
    
    DISCIPLINE ||--o{ WARNING : "关联"
    DISCIPLINE ||--o{ STUDENT : "培养"
    DISCIPLINE {
        string id PK
        string name
        string code
        string category
        float employmentRate
        float nationalAverage
    }
    
    STUDENT ||--o{ COURSE_GRADE : "修读"
    STUDENT ||--o{ EMPLOYMENT : "签约"
    STUDENT {
        string id PK
        string universityId FK
        string disciplineId FK
        string name
        string enrollmentYear
        string status
    }
    
    COURSE {
        string id PK
        string universityId FK
        string code
        string name
        float credits
        int hours
        boolean isCore
    }
    
    COURSE_GRADE {
        string id PK
        string studentId FK
        string courseId FK
        float score
        boolean passed
    }
    
    EMPLOYMENT {
        string id PK
        string studentId FK
        string company
        string position
        boolean majorMatched
        date signedDate
    }
    
    WARNING ||--o{ APPROVAL_RECORD : "包含"
    WARNING {
        string id PK
        string provinceId FK
        string universityId FK
        string disciplineId FK
        string level
        float employmentRate
        float nationalAverage
        float deviationPercent
        int consecutiveYears
        string status
        date createdAt
    }
    
    APPROVAL_RECORD {
        string id PK
        string warningId FK
        string operatorId FK
        string operatorRole
        string action
        text comment
        date createdAt
    }
    
    CURRICULUM_PLAN ||--o{ CURRICULUM_COURSE : "包含"
    CURRICULUM_PLAN {
        string id PK
        string universityId FK
        string disciplineId FK
        int academicYear
        date uploadedAt
    }
    
    CURRICULUM_COURSE {
        string id PK
        string planId FK
        string courseCode
        string courseName
        float credits
        int hours
        boolean isCore
        int semester
    }
    
    REPORT {
        string id PK
        string title
        string type
        string scope
        string scopeId
        date createdAt
        string generatedBy
        string status
        json content
    }
    
    TREND_DATA {
        string id PK
        string entityType
        string entityId
        int year
        float registrationRate
        float coursePassRate
        float graduationRate
        float employmentRate
        float majorMatchRate
    }
```

### 6.2 Mock 数据结构说明

**数据存储策略**：
- 使用 localStorage 作为持久化存储
- 首次加载时生成模拟数据并缓存
- 数据更新时同步更新 localStorage
- 数据量控制在合理范围（约20MB以内）

**模拟数据规模**：
- 34个省级行政区
- 约120所高校（每省3-5所）
- 100+学科专业
- 历年数据：2018-2025年
- 预警数据：约200条，包含不同审批状态
- 报告数据：近一年周报、月报

---

## 7. 关键算法

### 7.1 核心指标计算公式

```typescript
// 报到率
const registrationRate = (actualRegistrations / plannedEnrollments) * 100;

// 课程通过率
const coursePassRate = (passedStudents / totalStudents) * 100;

// 毕业率
const graduationRate = (graduatedStudents / eligibleStudents) * 100;

// 初次就业率
const initialEmploymentRate = (employedStudents / totalGraduates) * 100;

// 专业对口率
const majorMatchRate = (majorMatchedStudents / employedStudents) * 100;
```

### 7.2 预警检测算法

```typescript
function detectWarning(disciplineId: string, years: number = 2): Warning | null {
  const trendData = getDisciplineTrend(disciplineId, years);
  const nationalAverage = getNationalEmploymentAverage();
  const consecutiveYears = countConsecutiveLowEmployment(trendData, nationalAverage);
  
  if (consecutiveYears >= 2) {
    const latestRate = trendData[trendData.length - 1].employmentRate;
    const deviationPercent = ((nationalAverage - latestRate) / nationalAverage) * 100;
    
    if (deviationPercent >= 20) {
      return {
        id: generateId(),
        level: 'level1',
        employmentRate: latestRate,
        nationalAverage,
        deviationPercent,
        consecutiveYears,
        status: 'pending_university',
        createdAt: new Date().toISOString(),
        approvalHistory: []
      };
    }
  }
  return null;
}
```

### 7.3 培养方案比对算法

```typescript
function compareCurriculum(
  plannedCourses: Course[],
  actualCourses: Course[]
): CurriculumComparison {
  const anomalies: CurriculumAnomaly[] = [];
  let deviationCount = 0;
  
  const plannedMap = new Map(plannedCourses.map(c => [c.code, c]));
  const actualMap = new Map(actualCourses.map(c => [c.code, c]));
  
  // 检查缺失课程
  plannedCourses.forEach(pc => {
    if (!actualMap.has(pc.code) && pc.isCore) {
      anomalies.push({
        courseId: pc.id,
        courseName: pc.name,
        anomalyType: 'missing',
        deviationPercent: 100,
        description: `核心课程「${pc.name}」未开设`
      });
      deviationCount++;
    }
  });
  
  // 检查额外课程
  actualCourses.forEach(ac => {
    if (!plannedMap.has(ac.code)) {
      anomalies.push({
        courseId: ac.id,
        courseName: ac.name,
        anomalyType: 'extra',
        deviationPercent: 50,
        description: `计划外课程「${ac.name}」被开设`
      });
      deviationCount++;
    }
  });
  
  // 检查学分/课时偏差
  plannedCourses.forEach(pc => {
    const ac = actualMap.get(pc.code);
    if (ac) {
      const creditDeviation = Math.abs(pc.credits - ac.credits) / pc.credits * 100;
      const hourDeviation = Math.abs(pc.hours - ac.hours) / pc.hours * 100;
      
      if (creditDeviation > 15) {
        anomalies.push({
          courseId: pc.id,
          courseName: pc.name,
          anomalyType: 'credit_deviation',
          deviationPercent: creditDeviation,
          description: `「${pc.name}」学分偏差${creditDeviation.toFixed(1)}%，计划${pc.credits}学分，实际${ac.credits}学分`
        });
        deviationCount++;
      }
      
      if (hourDeviation > 15) {
        anomalies.push({
          courseId: pc.id,
          courseName: pc.name,
          anomalyType: 'hour_deviation',
          deviationPercent: hourDeviation,
          description: `「${pc.name}」课时偏差${hourDeviation.toFixed(1)}%，计划${pc.hours}课时，实际${ac.hours}课时`
        });
        deviationCount++;
      }
    }
  });
  
  const totalCourses = plannedCourses.length + actualCourses.length;
  const deviationRate = (deviationCount / totalCourses) * 100;
  
  return {
    plannedCourses,
    actualCourses,
    deviationRate,
    anomalies
  };
}
```

### 7.4 自动报告生成算法

```typescript
function generateWeeklyReport(scope: string, scopeId?: string): Report {
  const data = fetchWeeklyData(scope, scopeId);
  
  const content: ReportContent = {
    registrationRateYoY: calculateYoY(data.currentWeek.registrationRate, data.lastYear.registrationRate),
    coursePassRate: data.currentWeek.coursePassRate,
    employmentDistribution: calculateEmploymentDistribution(data.currentWeek.employments),
    keyMetrics: calculateKeyMetrics(data),
    trends: aggregateTrendData(data.trends)
  };
  
  return {
    id: generateId(),
    title: `${getScopeName(scope, scopeId)}教学质量诊断周报`,
    type: 'weekly',
    scope,
    scopeId,
    createdAt: new Date().toISOString(),
    generatedBy: 'system',
    status: 'ready',
    content
  };
}
```
