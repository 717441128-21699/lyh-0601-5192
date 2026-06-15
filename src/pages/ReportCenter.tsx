import { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Table,
  Tag,
  Button,
  Modal,
  Form,
  Select,
  DatePicker,
  Space,
  Tooltip,
  Descriptions,
  List,
  Progress,
  Statistic,
  Alert,
  Spin,
  Empty,
  message,
} from 'antd';
import {
  FileBarChart,
  Plus,
  Download,
  Eye,
  Calendar,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  Briefcase,
  MapPin,
  Filter,
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { useReportStore } from '@/store/reportStore';
import { useAuthStore } from '@/store/authStore';
import { useDataStore } from '@/store/dataStore';
import {
  formatDateTime,
  formatPercent,
  getReportTypeName,
  getReportScopeName,
  getTrendIcon,
  getTrendColor,
  hasPermission,
} from '@/utils';
import type { Report, ReportType, ReportScope, TrendData, EmploymentDistributionItem } from '@/types';

const { RangePicker } = DatePicker;
const { Option } = Select;

export default function ReportCenter() {
  const { user } = useAuthStore();
  const { provinces } = useDataStore();
  const { reports, isLoading, initData, getReports, generateReport, getWeeklyReport } = useReportStore();
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [generateModalVisible, setGenerateModalVisible] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [filters, setFilters] = useState({ type: '', scope: '' });
  const [form] = Form.useForm();

  useEffect(() => {
    if (reports.length === 0) {
      initData();
    }
  }, [reports.length, initData]);

  useEffect(() => {
    let filtered = getReports();
    
    if (filters.type) {
      filtered = filtered.filter(r => r.type === filters.type);
    }
    if (filters.scope) {
      filtered = filtered.filter(r => r.scope === filters.scope);
    }
    
    if (user?.role === 'provincial' && user.provinceId) {
      filtered = filtered.filter(r => r.scopeId === user.provinceId || r.scope !== 'university');
    } else if (user?.role === 'university' && user.universityId) {
      filtered = filtered.filter(r => r.scopeId === user.universityId);
    }
    
    setFilteredReports(filtered);
  }, [reports, filters, user, getReports]);

  const handleViewDetail = (report: Report) => {
    setSelectedReport(report);
    setDetailModalVisible(true);
  };

  const handleGenerate = async () => {
    if (!user) return;
    
    try {
      const values = await form.validateFields();
      setGenerateLoading(true);
      
      const report = await generateReport(values.type, values.scope, values.scopeId);
      
      message.success('报告生成成功');
      setGenerateModalVisible(false);
      form.resetFields();
      setGenerateLoading(false);
      
      setSelectedReport(report);
      setDetailModalVisible(true);
    } catch (error) {
      setGenerateLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'green';
      case 'generating': return 'blue';
      case 'failed': return 'red';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready': return '已生成';
      case 'generating': return '生成中';
      case 'failed': return '生成失败';
      default: return status;
    }
  };

  const canGenerate = user && hasPermission(user.permissions, 'report:generate');

  const columns = [
    {
      title: '报告标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Report) => (
        <div className="flex items-center gap-2">
          <FileBarChart size={16} className="text-blue-400" />
          <span className="text-white font-medium">{text}</span>
        </div>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: ReportType) => (
        <Tag color="blue">{getReportTypeName(type)}</Tag>
      ),
    },
    {
      title: '范围',
      dataIndex: 'scope',
      key: 'scope',
      width: 100,
      render: (scope: ReportScope) => (
        <Tag color="purple">{getReportScopeName(scope)}</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status === 'generating' && <Clock size={12} className="inline mr-1" />}
          {status === 'ready' && <CheckCircle size={12} className="inline mr-1" />}
          {status === 'failed' && <AlertTriangle size={12} className="inline mr-1" />}
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => (
        <span className="text-gray-400 text-sm">{formatDateTime(date)}</span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: unknown, record: Report) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              size="small"
              icon={<Eye size={16} />}
              onClick={() => handleViewDetail(record)}
              disabled={record.status !== 'ready'}
            />
          </Tooltip>
          <Tooltip title="下载报告">
            <Button
              type="text"
              size="small"
              icon={<Download size={16} />}
              disabled={record.status !== 'ready'}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const renderEmploymentChart = (data: EmploymentDistributionItem[]) => {
    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: 'rgba(51, 65, 85, 0.5)',
        textStyle: { color: '#fff' },
        formatter: '{b}: {c}人 ({d}%)',
      },
      legend: {
        orient: 'vertical',
        right: '5%',
        top: 'center',
        textStyle: { color: '#94a3b8', fontSize: 12 },
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#0f172a',
            borderWidth: 2,
          },
          label: { show: false },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold',
              color: '#fff',
            },
          },
          data: data.map((item, idx) => ({
            value: item.count,
            name: item.category,
            itemStyle: {
              color: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#6366f1'][idx % 8],
            },
          })),
        },
      ],
    };
    return <ReactECharts option={option} style={{ height: '280px' }} />;
  };

  const renderTrendChart = (data: TrendData[]) => {
    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: 'rgba(51, 65, 85, 0.5)',
        textStyle: { color: '#fff' },
      },
      legend: {
        data: ['报到率', '就业率', '专业对口率'],
        textStyle: { color: '#94a3b8', fontSize: 12 },
        top: 0,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data.map(d => d.year),
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#94a3b8' },
      },
      yAxis: {
        type: 'value',
        min: 60,
        max: 100,
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#94a3b8', formatter: '{value}%' },
        splitLine: { lineStyle: { color: 'rgba(51, 65, 85, 0.3)' } },
      },
      series: [
        {
          name: '报到率',
          type: 'line',
          smooth: true,
          data: data.map(d => d.registrationRate),
          lineStyle: { color: '#3b82f6', width: 3 },
          itemStyle: { color: '#3b82f6' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
                { offset: 1, color: 'rgba(59, 130, 246, 0)' },
              ],
            },
          },
        },
        {
          name: '就业率',
          type: 'line',
          smooth: true,
          data: data.map(d => d.employmentRate),
          lineStyle: { color: '#10b981', width: 3 },
          itemStyle: { color: '#10b981' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
                { offset: 1, color: 'rgba(16, 185, 129, 0)' },
              ],
            },
          },
        },
        {
          name: '专业对口率',
          type: 'line',
          smooth: true,
          data: data.map(d => d.majorMatchRate),
          lineStyle: { color: '#8b5cf6', width: 3 },
          itemStyle: { color: '#8b5cf6' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(139, 92, 246, 0.3)' },
                { offset: 1, color: 'rgba(139, 92, 246, 0)' },
              ],
            },
          },
        },
      ],
    };
    return <ReactECharts option={option} style={{ height: '300px' }} />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">报告中心</h1>
          <p className="text-gray-400 text-sm">
            自动生成教学质量诊断报告，包含报到率同比、课程通过率、就业去向分布等
          </p>
        </div>
        <Space>
          {canGenerate && (
            <Button
              type="primary"
              icon={<Plus size={16} />}
              onClick={() => setGenerateModalVisible(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0"
            >
              生成报告
            </Button>
          )}
          <Tooltip title="刷新数据">
            <button
              onClick={() => initData()}
              className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-gray-400 hover:text-white hover:border-blue-500/50 transition-all"
            >
              <RefreshCw size={18} />
            </button>
          </Tooltip>
        </Space>
      </div>

      <Alert
        type="info"
        showIcon
        message="自动报告说明"
        description="系统每周一凌晨自动生成上周教学质量诊断报告，包含报到率同比分析、课程通过率统计、就业去向分布分析等核心指标。"
        className="bg-blue-500/10 border-blue-500/30"
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <Statistic
              title={<span className="text-gray-400 flex items-center gap-2"><Calendar size={14} /> 周报</span>}
              value={filteredReports.filter(r => r.type === 'weekly').length}
              className="text-white"
              valueStyle={{ color: '#3b82f6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <Statistic
              title={<span className="text-gray-400 flex items-center gap-2"><Calendar size={14} /> 月报</span>}
              value={filteredReports.filter(r => r.type === 'monthly').length}
              className="text-white"
              valueStyle={{ color: '#8b5cf6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <Statistic
              title={<span className="text-gray-400 flex items-center gap-2"><Calendar size={14} /> 季报</span>}
              value={filteredReports.filter(r => r.type === 'quarterly').length}
              className="text-white"
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm"
        title={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-blue-400" />
              <span className="text-white font-semibold">筛选条件</span>
            </div>
            <Space>
              <Select
                placeholder="报告类型"
                allowClear
                className="w-32"
                value={filters.type || undefined}
                onChange={(v) => setFilters(prev => ({ ...prev, type: v || '' }))}
                options={[
                  { value: 'weekly', label: '周报' },
                  { value: 'monthly', label: '月报' },
                  { value: 'quarterly', label: '季报' },
                ]}
              />
              <Select
                placeholder="报告范围"
                allowClear
                className="w-32"
                value={filters.scope || undefined}
                onChange={(v) => setFilters(prev => ({ ...prev, scope: v || '' }))}
                options={[
                  { value: 'national', label: '全国' },
                  { value: 'provincial', label: '省级' },
                  { value: 'university', label: '高校' },
                ]}
              />
            </Space>
          </div>
        }
        styles={{ body: { padding: 0 } }}
      >
        <Table
          dataSource={filteredReports}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: false }}
          className="dark-table"
          locale={{
            emptyText: <Empty description="暂无报告" image={Empty.PRESENTED_IMAGE_SIMPLE} />,
          }}
        />
      </Card>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <Plus size={20} className="text-blue-400" />
            <span>生成新报告</span>
          </div>
        }
        open={generateModalVisible}
        onCancel={() => setGenerateModalVisible(false)}
        onOk={handleGenerate}
        confirmLoading={generateLoading}
        okText="生成报告"
        cancelText="取消"
        width={500}
      >
        <Form form={form} layout="vertical" initialValues={{ type: 'weekly', scope: 'national' }}>
          <Form.Item
            name="type"
            label={<span className="text-gray-300">报告类型</span>}
            rules={[{ required: true, message: '请选择报告类型' }]}
          >
            <Select>
              <Option value="weekly">周报</Option>
              <Option value="monthly">月报</Option>
              <Option value="quarterly">季报</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="scope"
            label={<span className="text-gray-300">报告范围</span>}
            rules={[{ required: true, message: '请选择报告范围' }]}
          >
            <Select onChange={(v) => form.setFieldsValue({ scopeId: undefined })}>
              <Option value="national">全国</Option>
              {user?.role === 'ministry' && <Option value="provincial">省级</Option>}
              <Option value="university">高校</Option>
            </Select>
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prev, curr) => prev.scope !== curr.scope}
          >
            {({ getFieldValue }) => {
              const scope = getFieldValue('scope');
              if (scope === 'provincial') {
                return (
                  <Form.Item
                    name="scopeId"
                    label={<span className="text-gray-300">选择省份</span>}
                    rules={[{ required: true, message: '请选择省份' }]}
                  >
                    <Select showSearch optionFilterProp="label">
                      {provinces.map(p => (
                        <Option key={p.id} value={p.id} label={p.name}>
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-gray-400" />
                            {p.name}
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                );
              }
              return null;
            }}
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <FileBarChart size={20} className="text-blue-400" />
            <span>{selectedReport?.title}</span>
            <Tag color={getStatusColor(selectedReport?.status || '')}>{getStatusText(selectedReport?.status || '')}</Tag>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={1000}
        styles={{ body: { padding: '24px' } }}
      >
        {selectedReport && selectedReport.content && (
          <div className="space-y-6">
            <Descriptions
              bordered
              column={3}
              size="small"
              className="dark-descriptions"
            >
              <Descriptions.Item label="报告类型">
                <Tag color="blue">{getReportTypeName(selectedReport.type)}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="报告范围">
                <Tag color="purple">{getReportScopeName(selectedReport.scope)}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="生成时间">
                {formatDateTime(selectedReport.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="报到率同比" span={3}>
                <div className="flex items-center gap-2">
                  <span style={{ color: selectedReport.content.registrationRateYoY >= 0 ? '#00B42A' : '#F53F3F' }}>
                    {getTrendIcon(selectedReport.content.registrationRateYoY >= 0 ? 'up' : 'down')}
                  </span>
                  <span style={{ color: selectedReport.content.registrationRateYoY >= 0 ? '#00B42A' : '#F53F3F', fontWeight: 'bold' }}>
                    {selectedReport.content.registrationRateYoY >= 0 ? '+' : ''}
                    {selectedReport.content.registrationRateYoY.toFixed(2)}%
                  </span>
                  <span className="text-gray-400 text-sm">较上周同期</span>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="课程通过率" span={3}>
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold text-lg">
                    {formatPercent(selectedReport.content.coursePassRate)}
                  </span>
                  <Progress
                    percent={selectedReport.content.coursePassRate}
                    size="small"
                    strokeColor="#10b981"
                    showInfo={false}
                    style={{ width: 200 }}
                  />
                </div>
              </Descriptions.Item>
            </Descriptions>

            <div>
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <TrendingUp size={16} className="text-blue-400" />
                核心指标
              </h4>
              <Row gutter={[16, 16]}>
                {selectedReport.content.keyMetrics.map((metric, idx) => (
                  <Col xs={12} lg={6} key={idx}>
                    <Card className="bg-slate-800/50 border-slate-700/50">
                      <div className="text-gray-400 text-xs mb-1">{metric.name}</div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-white">
                          {formatPercent(metric.value)}
                        </span>
                        <span style={{ color: getTrendColor(metric.trend), fontSize: '20px' }}>
                          {getTrendIcon(metric.trend)}
                        </span>
                      </div>
                      <div className="mt-2">
                        <Progress
                          percent={(metric.value / metric.target) * 100}
                          size="small"
                          strokeColor={metric.value >= metric.target ? '#10b981' : '#f59e0b'}
                          format={() => <span className="text-xs text-gray-400">目标 {metric.target}%</span>}
                        />
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>

            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <Card
                  className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm"
                  title={
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-blue-400" />
                      <span className="text-white font-semibold">历年趋势</span>
                    </div>
                  }
                  styles={{ body: { padding: '16px' } }}
                >
                  {renderTrendChart(selectedReport.content.trends)}
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card
                  className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm"
                  title={
                    <div className="flex items-center gap-2">
                      <Briefcase size={16} className="text-green-400" />
                      <span className="text-white font-semibold">就业去向分布</span>
                    </div>
                  }
                  styles={{ body: { padding: '16px' } }}
                >
                  {renderEmploymentChart(selectedReport.content.employmentDistribution)}
                </Card>
              </Col>
            </Row>

            <div>
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <BookOpen size={16} className="text-purple-400" />
                就业去向明细
              </h4>
              <Row gutter={[16, 16]}>
                {selectedReport.content.employmentDistribution.map((item, idx) => (
                  <Col xs={12} lg={6} key={idx}>
                    <Card className="bg-slate-800/50 border-slate-700/50">
                      <div className="text-gray-400 text-xs mb-1">{item.category}</div>
                      <div className="text-xl font-bold text-white">{item.count}人</div>
                      <Progress
                        percent={item.percentage}
                        size="small"
                        strokeColor={['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#6366f1'][idx % 8]}
                        format={(percent) => <span className="text-xs text-gray-400">{percent?.toFixed(1)}%</span>}
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50">
              <Button icon={<Download size={16} />}>下载PDF</Button>
              <Button icon={<Download size={16} />}>下载Excel</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
