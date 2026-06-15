import type {
  Province,
  University,
  Discipline,
  TrendData,
  Warning,
  Course,
  Report,
  User,
  RankingItem,
  HeatmapItem,
  DataSource,
  ImportRecord,
  CleaningRule,
  DataQualityMetrics,
  WarningLevel,
  ApprovalStatus,
  UniversityLevel,
} from '../types';

const PROVINCES = [
  { id: '11', name: '北京市', code: 'BJ' },
  { id: '12', name: '天津市', code: 'TJ' },
  { id: '13', name: '河北省', code: 'HE' },
  { id: '14', name: '山西省', code: 'SX' },
  { id: '15', name: '内蒙古自治区', code: 'NM' },
  { id: '21', name: '辽宁省', code: 'LN' },
  { id: '22', name: '吉林省', code: 'JL' },
  { id: '23', name: '黑龙江省', code: 'HL' },
  { id: '31', name: '上海市', code: 'SH' },
  { id: '32', name: '江苏省', code: 'JS' },
  { id: '33', name: '浙江省', code: 'ZJ' },
  { id: '34', name: '安徽省', code: 'AH' },
  { id: '35', name: '福建省', code: 'FJ' },
  { id: '36', name: '江西省', code: 'JX' },
  { id: '37', name: '山东省', code: 'SD' },
  { id: '41', name: '河南省', code: 'HA' },
  { id: '42', name: '湖北省', code: 'HB' },
  { id: '43', name: '湖南省', code: 'HN' },
  { id: '44', name: '广东省', code: 'GD' },
  { id: '45', name: '广西壮族自治区', code: 'GX' },
  { id: '46', name: '海南省', code: 'HI' },
  { id: '50', name: '重庆市', code: 'CQ' },
  { id: '51', name: '四川省', code: 'SC' },
  { id: '52', name: '贵州省', code: 'GZ' },
  { id: '53', name: '云南省', code: 'YN' },
  { id: '54', name: '西藏自治区', code: 'XZ' },
  { id: '61', name: '陕西省', code: 'SN' },
  { id: '62', name: '甘肃省', code: 'GS' },
  { id: '63', name: '青海省', code: 'QH' },
  { id: '64', name: '宁夏回族自治区', code: 'NX' },
  { id: '65', name: '新疆维吾尔自治区', code: 'XJ' },
  { id: '71', name: '台湾省', code: 'TW' },
  { id: '81', name: '香港特别行政区', code: 'HK' },
  { id: '82', name: '澳门特别行政区', code: 'MO' },
];

const UNIVERSITY_LEVELS: UniversityLevel[] = ['985', '211', 'double-first-class', 'general'];

const UNIVERSITY_NAMES: Record<string, string[]> = {
  '11': ['北京大学', '清华大学', '中国人民大学', '北京航空航天大学', '北京理工大学'],
  '12': ['南开大学', '天津大学', '天津医科大学', '天津工业大学', '天津师范大学'],
  '13': ['河北工业大学', '燕山大学', '河北大学', '河北师范大学', '河北医科大学'],
  '14': ['太原理工大学', '山西大学', '中北大学', '山西师范大学', '山西医科大学'],
  '15': ['内蒙古大学', '内蒙古农业大学', '内蒙古师范大学', '内蒙古工业大学', '内蒙古科技大学'],
  '21': ['大连理工大学', '东北大学', '大连海事大学', '辽宁大学', '东北财经大学'],
  '22': ['吉林大学', '东北师范大学', '延边大学', '长春理工大学', '吉林农业大学'],
  '23': ['哈尔滨工业大学', '哈尔滨工程大学', '东北林业大学', '东北农业大学', '哈尔滨医科大学'],
  '31': ['复旦大学', '上海交通大学', '同济大学', '华东师范大学', '东华大学'],
  '32': ['南京大学', '东南大学', '苏州大学', '南京航空航天大学', '南京理工大学'],
  '33': ['浙江大学', '宁波大学', '浙江工业大学', '浙江师范大学', '杭州电子科技大学'],
  '34': ['中国科学技术大学', '合肥工业大学', '安徽大学', '安徽师范大学', '安徽医科大学'],
  '35': ['厦门大学', '福州大学', '华侨大学', '福建师范大学', '福建农林大学'],
  '36': ['南昌大学', '江西师范大学', '江西财经大学', '华东交通大学', '江西理工大学'],
  '37': ['山东大学', '中国海洋大学', '中国石油大学(华东)', '山东师范大学', '青岛大学'],
  '41': ['郑州大学', '河南大学', '河南师范大学', '河南农业大学', '河南理工大学'],
  '42': ['武汉大学', '华中科技大学', '华中师范大学', '武汉理工大学', '中国地质大学(武汉)'],
  '43': ['湖南大学', '中南大学', '湖南师范大学', '湘潭大学', '湖南农业大学'],
  '44': ['中山大学', '华南理工大学', '暨南大学', '华南师范大学', '华南农业大学'],
  '45': ['广西大学', '广西师范大学', '广西医科大学', '桂林电子科技大学', '广西民族大学'],
  '46': ['海南大学', '海南师范大学', '海南医学院', '三亚学院', '海南热带海洋学院'],
  '50': ['重庆大学', '西南大学', '西南政法大学', '重庆邮电大学', '重庆交通大学'],
  '51': ['四川大学', '电子科技大学', '西南交通大学', '四川农业大学', '西南财经大学'],
  '52': ['贵州大学', '贵州师范大学', '贵州医科大学', '贵州财经大学', '贵州民族大学'],
  '53': ['云南大学', '昆明理工大学', '云南师范大学', '云南农业大学', '昆明医科大学'],
  '54': ['西藏大学', '西藏民族大学', '西藏农牧学院', '西藏藏医药大学', '西藏警察学院'],
  '61': ['西安交通大学', '西北工业大学', '西北农林科技大学', '西安电子科技大学', '陕西师范大学'],
  '62': ['兰州大学', '西北师范大学', '兰州交通大学', '兰州理工大学', '甘肃农业大学'],
  '63': ['青海大学', '青海师范大学', '青海民族大学', '青海大学昆仑学院', '青海警官职业学院'],
  '64': ['宁夏大学', '宁夏医科大学', '北方民族大学', '宁夏师范学院', '宁夏理工学院'],
  '65': ['新疆大学', '石河子大学', '新疆农业大学', '新疆师范大学', '新疆医科大学'],
  '71': ['台湾大学', '清华大学(台湾)', '成功大学', '交通大学(台湾)', '中央大学'],
  '81': ['香港大学', '香港中文大学', '香港科技大学', '香港城市大学', '香港理工大学'],
  '82': ['澳门大学', '澳门科技大学', '澳门理工大学', '澳门城市大学', '澳门旅游学院'],
};

const DISCIPLINES = [
  { id: 'd001', name: '计算机科学与技术', code: '080901', category: '工学' },
  { id: 'd002', name: '软件工程', code: '080902', category: '工学' },
  { id: 'd003', name: '人工智能', code: '080717T', category: '工学' },
  { id: 'd004', name: '数据科学与大数据技术', code: '080910T', category: '工学' },
  { id: 'd005', name: '电子信息工程', code: '080701', category: '工学' },
  { id: 'd006', name: '通信工程', code: '080703', category: '工学' },
  { id: 'd007', name: '机械工程', code: '080201', category: '工学' },
  { id: 'd008', name: '土木工程', code: '081001', category: '工学' },
  { id: 'd009', name: '临床医学', code: '100201K', category: '医学' },
  { id: 'd010', name: '护理学', code: '101101', category: '医学' },
  { id: 'd011', name: '药学', code: '100701', category: '医学' },
  { id: 'd012', name: '金融学', code: '020301K', category: '经济学' },
  { id: 'd013', name: '会计学', code: '120203K', category: '管理学' },
  { id: 'd014', name: '工商管理', code: '120201K', category: '管理学' },
  { id: 'd015', name: '市场营销', code: '120202', category: '管理学' },
  { id: 'd016', name: '法学', code: '030101K', category: '法学' },
  { id: 'd017', name: '汉语言文学', code: '050101', category: '文学' },
  { id: 'd018', name: '英语', code: '050201', category: '文学' },
  { id: 'd019', name: '数学与应用数学', code: '070101', category: '理学' },
  { id: 'd020', name: '物理学', code: '070201', category: '理学' },
  { id: 'd021', name: '化学', code: '070301', category: '理学' },
  { id: 'd022', name: '生物科学', code: '071001', category: '理学' },
  { id: 'd023', name: '历史学', code: '060101', category: '历史学' },
  { id: 'd024', name: '哲学', code: '010101', category: '哲学' },
  { id: 'd025', name: '经济学', code: '020101', category: '经济学' },
  { id: 'd026', name: '国际经济与贸易', code: '020401', category: '经济学' },
  { id: 'd027', name: '教育学', code: '040101', category: '教育学' },
  { id: 'd028', name: '体育教育', code: '040201', category: '教育学' },
  { id: 'd029', name: '新闻学', code: '050301', category: '文学' },
  { id: 'd030', name: '广告学', code: '050303', category: '文学' },
];

const generateId = (): string => Math.random().toString(36).substring(2, 11);

const randomInRange = (min: number, max: number, decimals: number = 2): number => {
  return Number((Math.random() * (max - min) + min).toFixed(decimals));
};

const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const randomItem = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

const generateTrendData = (baseYear: number = 2018, years: number = 8): TrendData[] => {
  const trends: TrendData[] = [];
  let baseRegistration = randomInRange(92, 98);
  let basePassRate = randomInRange(85, 95);
  let baseGraduation = randomInRange(90, 97);
  let baseEmployment = randomInRange(75, 92);
  let baseMatch = randomInRange(60, 85);

  for (let i = 0; i < years; i++) {
    trends.push({
      year: baseYear + i,
      registrationRate: Math.min(99.5, Math.max(85, baseRegistration + randomInRange(-1, 1.5))),
      coursePassRate: Math.min(99, Math.max(75, basePassRate + randomInRange(-2, 1))),
      graduationRate: Math.min(99, Math.max(80, baseGraduation + randomInRange(-1.5, 1))),
      employmentRate: Math.min(98, Math.max(60, baseEmployment + randomInRange(-3, 2))),
      majorMatchRate: Math.min(95, Math.max(50, baseMatch + randomInRange(-2, 1.5))),
    });
  }

  return trends;
};

export const generateProvinces = (): Province[] => {
  return PROVINCES.map((p) => ({
    id: p.id,
    name: p.name,
    code: p.code,
    enrollmentCount: randomInt(50000, 500000),
    registrationRate: randomInRange(92, 98.5),
    coursePassRate: randomInRange(86, 96),
    graduationRate: randomInRange(90, 97.5),
    employmentRate: randomInRange(78, 93),
    majorMatchRate: randomInRange(65, 86),
  }));
};

export const generateUniversities = (provinces: Province[]): University[] => {
  const universities: University[] = [];

  provinces.forEach((province) => {
    const names = UNIVERSITY_NAMES[province.id] || [
      `${province.name}大学`,
      `${province.name}师范大学`,
      `${province.name}工业大学`,
      `${province.name}农业大学`,
      `${province.name}医科大学`,
    ];

    names.forEach((name, idx) => {
      const level = UNIVERSITY_LEVELS[Math.min(idx, UNIVERSITY_LEVELS.length - 1)];
      universities.push({
        id: `u_${province.id}_${idx}`,
        name,
        provinceId: province.id,
        level,
        enrollmentCount: randomInt(2000, 15000),
        registrationRate: randomInRange(90, 99),
        coursePassRate: randomInRange(82, 97),
        graduationRate: randomInRange(88, 98.5),
        employmentRate: randomInRange(70, 95),
        majorMatchRate: randomInRange(58, 88),
      });
    });
  });

  return universities;
};

export const generateDisciplines = (): Discipline[] => {
  const nationalAvg = 86.5;

  return DISCIPLINES.map((d) => ({
    id: d.id,
    name: d.name,
    code: d.code,
    category: d.category,
    employmentRate: randomInRange(65, 95),
    nationalAverage: nationalAvg,
  }));
};

export const generateWarnings = (
  provinces: Province[],
  universities: University[],
  disciplines: Discipline[]
): Warning[] => {
  const warnings: Warning[] = [];
  const statuses: ApprovalStatus[] = [
    'pending_university',
    'pending_provincial',
    'pending_ministry',
    'approved',
    'rejected',
  ];
  const levels: WarningLevel[] = ['level1', 'level2', 'level3'];

  for (let i = 0; i < 30; i++) {
    const province = randomItem(provinces);
    const provinceUnivs = universities.filter((u) => u.provinceId === province.id);
    if (provinceUnivs.length === 0) continue;

    const university = randomItem(provinceUnivs);
    const discipline = randomItem(disciplines);
    const status = randomItem(statuses);
    const level = status === 'approved' || status === 'rejected' ? 'level1' : randomItem(levels);

    const nationalAvg = discipline.nationalAverage;
    const employmentRate = randomInRange(nationalAvg * 0.7, nationalAvg * 0.79);
    const deviationPercent = ((nationalAvg - employmentRate) / nationalAvg) * 100;

    const warning: Warning = {
      id: `w_${generateId()}`,
      provinceId: province.id,
      universityId: university.id,
      disciplineId: discipline.id,
      level,
      employmentRate,
      nationalAverage: nationalAvg,
      deviationPercent,
      consecutiveYears: randomInt(2, 4),
      status,
      createdAt: new Date(Date.now() - randomInt(1, 90) * 24 * 60 * 60 * 1000).toISOString(),
      approvalHistory: [],
    };

    if (status !== 'pending_university') {
      warning.approvalHistory.push({
        id: `ar_${generateId()}`,
        warningId: warning.id,
        operatorId: 'op1',
        operatorName: '张三',
        operatorRole: 'university',
        action: 'confirm',
        comment: '情况属实，已组织专项调研',
        createdAt: new Date(Date.now() - randomInt(5, 30) * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    if (status === 'pending_ministry' || status === 'approved' || status === 'rejected') {
      warning.approvalHistory.push({
        id: `ar_${generateId()}`,
        warningId: warning.id,
        operatorId: 'op2',
        operatorName: '李四',
        operatorRole: 'provincial',
        action: 'review',
        comment: '经复核，数据准确，建议调整招生计划',
        createdAt: new Date(Date.now() - randomInt(3, 20) * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    if (status === 'approved' || status === 'rejected') {
      warning.approvalHistory.push({
        id: `ar_${generateId()}`,
        warningId: warning.id,
        operatorId: 'op3',
        operatorName: '王五',
        operatorRole: 'ministry',
        action: status === 'approved' ? 'approve' : 'reject',
        comment: status === 'approved' ? '批准调整，核减招生计划15%' : '需补充更多支撑材料',
        createdAt: new Date(Date.now() - randomInt(1, 10) * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    warnings.push(warning);
  }

  return warnings;
};

export const generateCourses = (): Course[] => {
  const courses: Course[] = [
    { id: 'c001', code: 'CS101', name: '高等数学', credits: 4, hours: 64, isCore: true, semester: 1 },
    { id: 'c002', code: 'CS102', name: '线性代数', credits: 3, hours: 48, isCore: true, semester: 1 },
    { id: 'c003', code: 'CS103', name: '离散数学', credits: 3, hours: 48, isCore: true, semester: 2 },
    { id: 'c004', code: 'CS201', name: '程序设计基础', credits: 4, hours: 64, isCore: true, semester: 1 },
    { id: 'c005', code: 'CS202', name: '数据结构与算法', credits: 5, hours: 80, isCore: true, semester: 2 },
    { id: 'c006', code: 'CS301', name: '计算机组成原理', credits: 4, hours: 64, isCore: true, semester: 3 },
    { id: 'c007', code: 'CS302', name: '操作系统', credits: 4, hours: 64, isCore: true, semester: 4 },
    { id: 'c008', code: 'CS303', name: '计算机网络', credits: 4, hours: 64, isCore: true, semester: 5 },
    { id: 'c009', code: 'CS401', name: '数据库系统', credits: 4, hours: 64, isCore: true, semester: 4 },
    { id: 'c010', code: 'CS402', name: '软件工程', credits: 4, hours: 64, isCore: true, semester: 6 },
    { id: 'c011', code: 'EL201', name: '大学物理', credits: 4, hours: 64, isCore: true, semester: 2 },
    { id: 'c012', code: 'EL202', name: '电路分析基础', credits: 4, hours: 64, isCore: true, semester: 3 },
    { id: 'c013', code: 'EL301', name: '模拟电子技术', credits: 4, hours: 64, isCore: true, semester: 4 },
    { id: 'c014', code: 'EL302', name: '数字电子技术', credits: 4, hours: 64, isCore: true, semester: 4 },
    { id: 'c015', code: 'MA101', name: '马克思主义基本原理', credits: 3, hours: 48, isCore: false, semester: 1 },
    { id: 'c016', code: 'MA102', name: '毛泽东思想概论', credits: 4, hours: 64, isCore: false, semester: 2 },
    { id: 'c017', code: 'MA103', name: '大学英语', credits: 4, hours: 64, isCore: false, semester: 1 },
    { id: 'c018', code: 'MA104', name: '体育', credits: 2, hours: 32, isCore: false, semester: 1 },
    { id: 'c019', code: 'CS501', name: '机器学习', credits: 3, hours: 48, isCore: false, semester: 6 },
    { id: 'c020', code: 'CS502', name: '分布式系统', credits: 3, hours: 48, isCore: false, semester: 7 },
  ];

  return courses;
};

export const generateReports = (provinces: Province[], universities: University[]): Report[] => {
  const reports: Report[] = [];
  const types: Report['type'][] = ['weekly', 'monthly', 'quarterly'];
  const scopes: Report['scope'][] = ['national', 'provincial', 'university'];

  const employmentCategories = [
    '国有企业',
    '民营企业',
    '外资企业',
    '机关事业单位',
    '考研深造',
    '出国深造',
    '自主创业',
    '其他',
  ];

  for (let i = 0; i < 20; i++) {
    const type = randomItem(types);
    const scope = randomItem(scopes);
    let scopeId: string | undefined;
    let titleScope = '全国';

    if (scope === 'provincial') {
      const p = randomItem(provinces);
      scopeId = p.id;
      titleScope = p.name;
    } else if (scope === 'university') {
      const u = randomItem(universities);
      scopeId = u.id;
      titleScope = u.name;
    }

    const typeName = type === 'weekly' ? '周' : type === 'monthly' ? '月' : '季度';

    const trends = generateTrendData(2020, 5);
    const counts = employmentCategories.map(() => randomInt(100, 1000));
    const total = counts.reduce((a, b) => a + b, 0);

    reports.push({
      id: `r_${generateId()}`,
      title: `${titleScope}教学质量诊断${typeName}报`,
      type,
      scope,
      scopeId,
      createdAt: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000).toISOString(),
      generatedBy: 'system',
      status: 'ready',
      content: {
        registrationRateYoY: randomInRange(-3, 5),
        coursePassRate: randomInRange(85, 96),
        employmentDistribution: employmentCategories.map((cat, idx) => ({
          category: cat,
          count: counts[idx],
          percentage: (counts[idx] / total) * 100,
        })),
        keyMetrics: [
          { name: '报到率', value: randomInRange(92, 98.5), target: 95, trend: randomItem(['up', 'down', 'stable']) },
          { name: '课程通过率', value: randomInRange(86, 96), target: 90, trend: randomItem(['up', 'down', 'stable']) },
          { name: '毕业率', value: randomInRange(90, 97.5), target: 95, trend: randomItem(['up', 'down', 'stable']) },
          { name: '初次就业率', value: randomInRange(78, 93), target: 85, trend: randomItem(['up', 'down', 'stable']) },
          { name: '专业对口率', value: randomInRange(65, 86), target: 75, trend: randomItem(['up', 'down', 'stable']) },
        ],
        trends,
      },
    });
  }

  return reports;
};

export const generateUsers = (provinces: Province[], universities: University[]): User[] => {
  const users: User[] = [
    {
      id: 'user_ministry',
      username: 'ministry',
      name: '教育部管理员',
      role: 'ministry',
      permissions: ['dashboard:view', 'data:view:*', 'warning:*', 'report:*', 'curriculum:view', 'ingestion:*'],
    },
  ];

  provinces.slice(0, 5).forEach((p) => {
    users.push({
      id: `user_provincial_${p.id}`,
      username: `provincial_${p.code.toLowerCase()}`,
      name: `${p.name}教育厅管理员`,
      role: 'provincial',
      provinceId: p.id,
      permissions: ['dashboard:view', 'data:view', `warning:review:${p.id}`, 'report:generate', 'curriculum:view'],
    });
  });

  universities.slice(0, 10).forEach((u) => {
    users.push({
      id: `user_university_${u.id}`,
      username: `university_${u.id}`,
      name: `${u.name}管理员`,
      role: 'university',
      provinceId: u.provinceId,
      universityId: u.id,
      permissions: ['dashboard:view', 'data:view', `warning:confirm:${u.id}`, 'report:view', 'curriculum:upload'],
    });
  });

  return users;
};

export const generateRankings = (
  provinces: Province[],
  universities: University[],
  disciplines: Discipline[],
  type: 'discipline' | 'province' | 'university'
): RankingItem[] => {
  let items: RankingItem[] = [];

  if (type === 'province') {
    items = provinces
      .map((p) => ({
        id: p.id,
        name: p.name,
        value: p.employmentRate,
        rank: 0,
        change: randomInRange(-5, 5, 1),
      }))
      .sort((a, b) => b.value - a.value)
      .map((item, idx) => ({ ...item, rank: idx + 1 }));
  } else if (type === 'university') {
    items = universities
      .slice(0, 50)
      .map((u) => ({
        id: u.id,
        name: u.name,
        value: u.employmentRate,
        rank: 0,
        change: randomInRange(-10, 10, 1),
      }))
      .sort((a, b) => b.value - a.value)
      .map((item, idx) => ({ ...item, rank: idx + 1 }));
  } else {
    items = disciplines
      .map((d) => ({
        id: d.id,
        name: d.name,
        value: d.employmentRate,
        rank: 0,
        change: randomInRange(-3, 3, 1),
      }))
      .sort((a, b) => b.value - a.value)
      .map((item, idx) => ({ ...item, rank: idx + 1 }));
  }

  return items;
};

export const generateHeatmapData = (provinces: Province[]): HeatmapItem[] => {
  return provinces.map((p) => ({
    id: p.id,
    name: p.name,
    value: p.enrollmentCount,
  }));
};

export const generateDataSources = (): DataSource[] => {
  return [
    { id: 'ds001', name: '招生录取系统', type: 'enrollment', lastSync: new Date().toISOString(), status: 'active', recordCount: 1250000 },
    { id: 'ds002', name: '报到注册系统', type: 'registration', lastSync: new Date(Date.now() - 86400000).toISOString(), status: 'active', recordCount: 1180000 },
    { id: 'ds003', name: '教务管理系统', type: 'grades', lastSync: new Date(Date.now() - 2 * 86400000).toISOString(), status: 'active', recordCount: 8500000 },
    { id: 'ds004', name: '毕业审核系统', type: 'graduation', lastSync: new Date(Date.now() - 3 * 86400000).toISOString(), status: 'active', recordCount: 920000 },
    { id: 'ds005', name: '就业签约系统', type: 'employment', lastSync: new Date(Date.now() - 1 * 86400000).toISOString(), status: 'error', recordCount: 860000 },
  ];
};

export const generateImportRecords = (): ImportRecord[] => {
  const records: ImportRecord[] = [];
  const statuses: ImportRecord['status'][] = ['success', 'partial', 'failed'];
  const sources = generateDataSources();

  for (let i = 0; i < 20; i++) {
    const source = randomItem(sources);
    records.push({
      id: `ir_${generateId()}`,
      sourceId: source.id,
      sourceName: source.name,
      fileName: `${source.type}_data_${202506 - i}.xlsx`,
      importTime: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      recordCount: randomInt(1000, 50000),
      status: randomItem(statuses),
      operator: randomItem(['admin', 'operator1', 'operator2', 'system']),
    });
  }

  return records;
};

export const generateCleaningRules = (): CleaningRule[] => {
  return [
    { id: 'cr001', name: '学生信息去重', description: '根据身份证号去除重复的学生记录', type: 'deduplication', enabled: true, affectedFields: ['student_id', 'id_card'] },
    { id: 'cr002', name: '缺失成绩填充', description: '对缺失的课程成绩用班级均值填充', type: 'fill_missing', enabled: true, affectedFields: ['course_score'] },
    { id: 'cr003', name: '异常值过滤', description: '过滤成绩<0或>100的异常记录', type: 'filter_outlier', enabled: true, affectedFields: ['course_score'] },
    { id: 'cr004', name: '日期格式标准化', description: '将日期统一为YYYY-MM-DD格式', type: 'format_standard', enabled: true, affectedFields: ['enrollment_date', 'graduation_date'] },
    { id: 'cr005', name: '就业状态去重', description: '同一学生取最新的就业签约记录', type: 'deduplication', enabled: true, affectedFields: ['student_id', 'signed_date'] },
  ];
};

export const generateDataQualityMetrics = (): DataQualityMetrics => {
  return {
    completeness: randomInRange(95, 99.5),
    accuracy: randomInRange(96, 99.8),
    timeliness: randomInRange(90, 98),
    uniqueness: randomInRange(97, 99.9),
  };
};

export const generateAllData = () => {
  const provinces = generateProvinces();
  const universities = generateUniversities(provinces);
  const disciplines = generateDisciplines();
  const warnings = generateWarnings(provinces, universities, disciplines);
  const courses = generateCourses();
  const reports = generateReports(provinces, universities);
  const users = generateUsers(provinces, universities);
  const trendData = generateTrendData();
  const dataSources = generateDataSources();
  const importRecords = generateImportRecords();
  const cleaningRules = generateCleaningRules();
  const dataQualityMetrics = generateDataQualityMetrics();

  return {
    provinces,
    universities,
    disciplines,
    warnings,
    courses,
    reports,
    users,
    trendData,
    dataSources,
    importRecords,
    cleaningRules,
    dataQualityMetrics,
  };
};

export const getUniversityTrendData = (): TrendData[] => {
  return generateTrendData();
};

export const getDisciplineTrendData = (): TrendData[] => {
  return generateTrendData(2019, 7);
};
