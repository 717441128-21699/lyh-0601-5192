import * as XLSX from 'xlsx';
import type { Course, CurriculumComparison, CurriculumAnomaly } from '../types';

export const parseCurriculumExcel = async (file: File): Promise<Course[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as Array<Record<string, unknown>>;

        const courses: Course[] = jsonData.map((row, idx) => {
          const getValue = (key: string): string => String(row[key] || row[key.toLowerCase()] || '');
          const getNumber = (key: string): number => Number(row[key] || row[key.toLowerCase()] || 0);
          const getBoolean = (key: string): boolean => {
            const val = row[key] || row[key.toLowerCase()];
            return val === true || val === '是' || val === 'true' || val === '1';
          };

          return {
            id: `c_upload_${idx}_${Date.now()}`,
            code: getValue('课程代码') || getValue('code') || `C${idx + 1}`,
            name: getValue('课程名称') || getValue('name') || `课程${idx + 1}`,
            credits: getNumber('学分') || getNumber('credits') || 3,
            hours: getNumber('课时') || getNumber('hours') || 48,
            isCore: getBoolean('核心课程') || getBoolean('isCore') || getBoolean('核心') || false,
            semester: getNumber('学期') || getNumber('semester') || 1,
          };
        });

        resolve(courses);
      } catch (error) {
        reject(new Error('Excel解析失败，请检查文件格式'));
      }
    };

    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };

    reader.readAsBinaryString(file);
  });
};

export const compareCurriculum = (
  plannedCourses: Course[],
  actualCourses: Course[]
): CurriculumComparison => {
  const anomalies: CurriculumAnomaly[] = [];
  let deviationCount = 0;

  const plannedMap = new Map(plannedCourses.map((c) => [c.code, c]));
  const actualMap = new Map(actualCourses.map((c) => [c.code, c]));

  plannedCourses.forEach((pc) => {
    if (!actualMap.has(pc.code) && pc.isCore) {
      anomalies.push({
        courseId: pc.id,
        courseName: pc.name,
        anomalyType: 'missing',
        deviationPercent: 100,
        description: `核心课程「${pc.name}」未开设`,
      });
      deviationCount++;
    }
  });

  actualCourses.forEach((ac) => {
    if (!plannedMap.has(ac.code)) {
      anomalies.push({
        courseId: ac.id,
        courseName: ac.name,
        anomalyType: 'extra',
        deviationPercent: 50,
        description: `计划外课程「${ac.name}」被开设`,
      });
      deviationCount++;
    }
  });

  plannedCourses.forEach((pc) => {
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
          description: `「${pc.name}」学分偏差${creditDeviation.toFixed(1)}%，计划${pc.credits}学分，实际${ac.credits}学分`,
        });
        deviationCount++;
      }

      if (hourDeviation > 15) {
        anomalies.push({
          courseId: pc.id,
          courseName: pc.name,
          anomalyType: 'hour_deviation',
          deviationPercent: hourDeviation,
          description: `「${pc.name}」课时偏差${hourDeviation.toFixed(1)}%，计划${pc.hours}课时，实际${ac.hours}课时`,
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
    anomalies,
  };
};

export const downloadTemplate = (): void => {
  const templateData = [
    { '课程代码': 'CS101', '课程名称': '高等数学', '学分': 4, '课时': 64, '核心课程': '是', '学期': 1 },
    { '课程代码': 'CS102', '课程名称': '线性代数', '学分': 3, '课时': 48, '核心课程': '是', '学期': 1 },
    { '课程代码': 'CS201', '课程名称': '程序设计基础', '学分': 4, '课时': 64, '核心课程': '是', '学期': 1 },
    { '课程代码': 'MA101', '课程名称': '大学英语', '学分': 4, '课时': 64, '核心课程': '否', '学期': 1 },
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '培养方案');
  XLSX.writeFile(workbook, '培养方案模板.xlsx');
};

export const generateActualCourses = (): Course[] => {
  return [
    { id: 'c001', code: 'CS101', name: '高等数学', credits: 4, hours: 64, isCore: true, semester: 1 },
    { id: 'c002', code: 'CS102', name: '线性代数', credits: 3, hours: 48, isCore: true, semester: 1 },
    { id: 'c004', code: 'CS201', name: '程序设计基础', credits: 5, hours: 80, isCore: true, semester: 1 },
    { id: 'c015', code: 'MA101', name: '马克思主义基本原理', credits: 3, hours: 48, isCore: false, semester: 1 },
    { id: 'c017', code: 'MA103', name: '大学英语', credits: 3, hours: 48, isCore: false, semester: 1 },
    { id: 'c018', code: 'MA104', name: '体育', credits: 2, hours: 32, isCore: false, semester: 1 },
    { id: 'c_extra1', code: 'EXT001', name: '创新创业导论', credits: 2, hours: 32, isCore: false, semester: 1 },
  ];
};
