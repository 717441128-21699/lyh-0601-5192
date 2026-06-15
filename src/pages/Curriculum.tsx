import { useState, useCallback } from 'react';
import {
  Row,
  Col,
  Card,
  Upload,
  Button,
  Table,
  Tag,
  Alert,
  Progress,
  Space,
  Tooltip,
  Divider,
  Statistic,
  List,
  Badge,
  message,
  Modal,
} from 'antd';
import {
  FileSpreadsheet,
  Upload as UploadIcon,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Info,
  BookOpen,
  Plus,
  Minus,
  Clock,
  BarChart3,
} from 'lucide-react';
import { parseCurriculumExcel, compareCurriculum, downloadTemplate, generateActualCourses } from '@/services/curriculumService';
import { useDataStore } from '@/store/dataStore';
import { useAuthStore } from '@/store/authStore';
import {
  formatPercent,
  getAnomalyTypeName,
  getAnomalyTypeColor,
  hasPermission,
} from '@/utils';
import type { Course, CurriculumComparison, CurriculumAnomaly } from '@/types';

const { Dragger } = Upload;

export default function Curriculum() {
  const { user } = useAuthStore();
  const { courses } = useDataStore();
  const [uploadedCourses, setUploadedCourses] = useState<Course[]>([]);
  const [comparisonResult, setComparisonResult] = useState<CurriculumComparison | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState('');

  const actualCourses = generateActualCourses();

  const handleUpload = useCallback(async (file: File) => {
    setUploading(true);
    setFileName(file.name);
    
    try {
      const courses = await parseCurriculumExcel(file);
      setUploadedCourses(courses);
      message.success(`成功解析 ${courses.length} 门课程`);
      
      const result = compareCurriculum(courses, actualCourses);
      setComparisonResult(result);
    } catch (error) {
      message.error((error as Error).message);
      setUploadedCourses([]);
      setComparisonResult(null);
    } finally {
      setUploading(false);
    }
    
    return false;
  }, [actualCourses]);

  const handleReupload = () => {
    setUploadedCourses([]);
    setComparisonResult(null);
    setFileName('');
  };

  const handleSimulateUpload = () => {
    const simulatedCourses: Course[] = [
      { id: 's1', code: 'CS101', name: '高等数学', credits: 4, hours: 64, isCore: true, semester: 1 },
      { id: 's2', code: 'CS102', name: '线性代数', credits: 3, hours: 48, isCore: true, semester: 1 },
      { id: 's3', code: 'CS201', name: '程序设计基础', credits: 4, hours: 64, isCore: true, semester: 1 },
      { id: 's4', code: 'MA101', name: '大学英语', credits: 4, hours: 64, isCore: false, semester: 1 },
      { id: 's5', code: 'MA102', name: '大学物理', credits: 4, hours: 64, isCore: true, semester: 1 },
    ];
    
    setUploadedCourses(simulatedCourses);
    setFileName('模拟数据_计算机科学与技术培养方案.xlsx');
    
    const result = compareCurriculum(simulatedCourses, actualCourses);
    setComparisonResult(result);
    message.success(`成功解析 ${simulatedCourses.length} 门课程`);
  };

  const canUpload = user && hasPermission(user.permissions, 'curriculum:upload');

  const uploadedColumns = [
    {
      title: '课程代码',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (code: string) => <span className="text-blue-400 font-mono">{code}</span>,
    },
    {
      title: '课程名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Course) => (
        <div className="flex items-center gap-2">
          <span className="text-white">{name}</span>
          {record.isCore && (
            <Tag color="red" className="text-xs">核心</Tag>
          )}
        </div>
      ),
    },
    {
      title: '学分',
      dataIndex: 'credits',
      key: 'credits',
      width: 80,
      render: (value: number) => <span className="text-white">{value}</span>,
    },
    {
      title: '课时',
      dataIndex: 'hours',
      key: 'hours',
      width: 80,
      render: (value: number) => <span className="text-white">{value}</span>,
    },
    {
      title: '学期',
      dataIndex: 'semester',
      key: 'semester',
      width: 80,
      render: (value: number) => <span className="text-white">第{value}学期</span>,
    },
  ];

  const actualColumns = [
    ...uploadedColumns,
    {
      title: '比对状态',
      key: 'status',
      width: 120,
      render: (_: unknown, record: Course) => {
        if (!comparisonResult) return null;
        const planned = comparisonResult.plannedCourses.find(c => c.code === record.code);
        if (!planned) {
          return <Tag color="orange"><Plus size={12} className="inline mr-1" />额外开设</Tag>;
        }
        const anomalies = comparisonResult.anomalies.filter(a => a.courseId === planned.id || a.courseName === planned.name);
        if (anomalies.length > 0) {
          return <Tag color="red"><AlertTriangle size={12} className="inline mr-1" />有偏差</Tag>;
        }
        return <Tag color="green"><CheckCircle size={12} className="inline mr-1" />正常</Tag>;
      },
    },
  ];

  const getAnomalyIcon = (type: string) => {
    switch (type) {
      case 'missing': return <Minus size={16} className="text-red-400" />;
      case 'extra': return <Plus size={16} className="text-orange-400" />;
      case 'credit_deviation': return <BarChart3 size={16} className="text-yellow-400" />;
      case 'hour_deviation': return <Clock size={16} className="text-blue-400" />;
      default: return <Info size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">培养方案比对</h1>
          <p className="text-gray-400 text-sm">
            上传培养方案Excel，自动提取核心课程与实际开课比对
          </p>
        </div>
        <Space>
          <Tooltip title="下载模板">
            <Button
              icon={<Download size={16} />}
              onClick={downloadTemplate}
              className="bg-slate-800/50 border-slate-700/50 text-white hover:bg-slate-700/50"
            >
              下载模板
            </Button>
          </Tooltip>
          <Tooltip title="模拟数据">
            <Button
              icon={<RefreshCw size={16} />}
              onClick={handleSimulateUpload}
              className="bg-slate-800/50 border-slate-700/50 text-white hover:bg-slate-700/50"
            >
              模拟数据
            </Button>
          </Tooltip>
        </Space>
      </div>

      <Alert
        type="info"
        showIcon
        message="比对规则说明"
        description={
          <div className="text-sm space-y-1">
            <div>• 核心课程缺失将标记为严重异常</div>
            <div>• 学分或课时偏差超过15%将生成异常提醒</div>
            <div>• 计划外开设的课程将标记为额外课程</div>
          </div>
        }
        className="bg-blue-500/10 border-blue-500/30"
      />

      {!uploadedCourses.length ? (
        <Card
          className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm"
          styles={{ body: { padding: '40px' } }}
        >
          <Dragger
            accept=".xlsx,.xls"
            showUploadList={false}
            beforeUpload={handleUpload}
            disabled={!canUpload}
            className="!bg-slate-800/30 !border-slate-600/50 !border-dashed hover:!border-blue-500/50 transition-all"
          >
            {uploading ? (
              <div className="py-12">
                <p className="text-white text-lg mb-2">正在解析文件...</p>
                <p className="text-gray-400 text-sm">请稍候</p>
              </div>
            ) : (
              <div className="py-12">
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                    <UploadIcon size={32} className="text-blue-400" />
                  </div>
                </div>
                <p className="text-white text-lg mb-2">点击或拖拽培养方案Excel到此处上传</p>
                <p className="text-gray-400 text-sm mb-4">
                  支持 .xlsx, .xls 格式，包含课程代码、课程名称、学分、课时、核心课程、学期等字段
                </p>
                {!canUpload && (
                  <p className="text-red-400 text-sm">您没有上传权限，请联系管理员</p>
                )}
              </div>
            )}
          </Dragger>
        </Card>
      ) : (
        <>
          <Card
            className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm"
            title={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet size={20} className="text-blue-400" />
                  <span className="text-white font-semibold">已上传文件</span>
                  <Tag color="blue">{fileName}</Tag>
                  <Tag color="green">{uploadedCourses.length} 门课程</Tag>
                </div>
                <Button
                  size="small"
                  icon={<RefreshCw size={14} />}
                  onClick={handleReupload}
                >
                  重新上传
                </Button>
              </div>
            }
            styles={{ body: { padding: '20px' } }}
          >
            <Table
              dataSource={uploadedCourses}
              columns={uploadedColumns}
              rowKey="id"
              pagination={{ pageSize: 5, showSizeChanger: false }}
              className="dark-table"
            />
          </Card>

          {comparisonResult && (
            <>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                  <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                    <Statistic
                      title={<span className="text-gray-400">计划课程</span>}
                      value={comparisonResult.plannedCourses.length}
                      prefix={<BookOpen size={18} className="text-blue-400" />}
                      className="text-white"
                      valueStyle={{ color: '#fff' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                    <Statistic
                      title={<span className="text-gray-400">实际开课</span>}
                      value={comparisonResult.actualCourses.length}
                      prefix={<BookOpen size={18} className="text-green-400" />}
                      className="text-white"
                      valueStyle={{ color: '#fff' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                    <Statistic
                      title={<span className="text-gray-400">异常项</span>}
                      value={comparisonResult.anomalies.length}
                      prefix={<AlertTriangle size={18} className="text-orange-400" />}
                      className="text-white"
                      valueStyle={{ color: comparisonResult.anomalies.length > 0 ? '#F53F3F' : '#00B42A' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                    <div className="text-gray-400 text-sm mb-2">偏差率</div>
                    <Progress
                      percent={comparisonResult.deviationRate}
                      status={comparisonResult.deviationRate > 15 ? 'exception' : 'success'}
                      strokeColor={comparisonResult.deviationRate > 15 ? '#F53F3F' : '#00B42A'}
                      format={(percent) => <span className="text-white">{percent?.toFixed(1)}%</span>}
                    />
                  </Card>
                </Col>
              </Row>

              {comparisonResult.deviationRate > 15 && (
                <Alert
                  type="error"
                  showIcon
                  message="发现异常偏差"
                  description={`培养方案与实际开课偏差率为 ${comparisonResult.deviationRate.toFixed(1)}%，已超过15%阈值，请关注以下异常项。`}
                  className="bg-red-500/10 border-red-500/30"
                />
              )}

              {comparisonResult.anomalies.length > 0 && (
                <Card
                  className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm"
                  title={
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={20} className="text-orange-400" />
                      <span className="text-white font-semibold">异常提醒</span>
                      <Badge count={comparisonResult.anomalies.length} color="#F53F3F" />
                    </div>
                  }
                  styles={{ body: { padding: '20px' } }}
                >
                  <List
                    dataSource={comparisonResult.anomalies}
                    renderItem={(anomaly: CurriculumAnomaly) => (
                      <List.Item
                        className="border-b border-slate-700/50 last:border-0 py-4"
                        style={{ borderBottom: '1px solid rgba(51, 65, 85, 0.5)' }}
                      >
                        <div className="flex items-start gap-3 w-full">
                          <div className={`p-2 rounded-lg ${getAnomalyTypeColor(anomaly.anomalyType).replace('#', 'bg-')}/20 mt-0.5`}
                               style={{ backgroundColor: `${getAnomalyTypeColor(anomaly.anomalyType)}20` }}>
                            {getAnomalyIcon(anomaly.anomalyType)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Tag color={getAnomalyTypeColor(anomaly.anomalyType)}>
                                {getAnomalyTypeName(anomaly.anomalyType)}
                              </Tag>
                              <span className="text-white font-medium">{anomaly.courseName}</span>
                              {anomaly.deviationPercent > 15 && (
                                <Tag color="red" className="text-xs">
                                  偏差 {anomaly.deviationPercent.toFixed(1)}%
                                </Tag>
                              )}
                            </div>
                            <p className="text-gray-400 text-sm">{anomaly.description}</p>
                          </div>
                        </div>
                      </List.Item>
                    )}
                  />
                </Card>
              )}

              <Card
                className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm"
                title={
                  <div className="flex items-center gap-2">
                    <BookOpen size={20} className="text-green-400" />
                    <span className="text-white font-semibold">实际开课情况</span>
                    <Tag color="green">{actualCourses.length} 门课程</Tag>
                  </div>
                }
                styles={{ body: { padding: '20px' } }}
              >
                <Table
                  dataSource={actualCourses}
                  columns={actualColumns}
                  rowKey="id"
                  pagination={{ pageSize: 8, showSizeChanger: false }}
                  className="dark-table"
                />
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}
