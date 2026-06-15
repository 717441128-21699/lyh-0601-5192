import { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Table,
  Tag,
  Button,
  Progress,
  Space,
  Tooltip,
  Statistic,
  Alert,
  Spin,
  Switch,
  Modal,
  List,
  Badge,
  Descriptions,
  message,
  Form,
  Select,
  InputNumber,
  Steps,
  Divider,
} from 'antd';
import {
  Database,
  RefreshCw,
  Play,
  CheckCircle,
  AlertTriangle,
  Clock,
  Settings,
  Download,
  Upload,
  Trash2,
  FileText,
  Activity,
  ShieldCheck,
  Zap,
  FileSpreadsheet,
  ChevronRight,
  BarChart3,
} from 'lucide-react';
import { useDataStore } from '@/store/dataStore';
import {
  formatDateTime,
  formatNumber,
  formatPercent,
} from '@/utils';
import type { DataSource, ImportRecord, CleaningRule, DataQualityMetrics } from '@/types';

const { Option } = Select;

export default function DataIngestion() {
  const {
    dataSources,
    importRecords,
    cleaningRules,
    dataQualityMetrics,
    isLoading,
    initData,
    ensureData,
    toggleCleaningRule,
    runImport,
  } = useDataStore();
  const [runningImport, setRunningImport] = useState<string | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedSource, setSelectedSource] = useState<DataSource | null>(null);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importingSource, setImportingSource] = useState<DataSource | null>(null);
  const [importStep, setImportStep] = useState(0);
  const [importResult, setImportResult] = useState<null | {
    count: number;
    cleanedCount: number;
    invalidCount: number;
    duplicateCount: number;
    updatedMetrics: Record<string, { old: number; new: number; delta: number }>;
  }>(null);
  const [importForm] = Form.useForm();

  useEffect(() => {
    ensureData();
  }, [ensureData]);

  const handleRunImport = async (sourceId: string, options?: { importCount?: number; fileName?: string }) => {
    setRunningImport(sourceId);
    setImportStep(0);
    try {
      setImportStep(1);
      const result = await runImport(sourceId, options);
      setImportStep(2);
      setImportResult({
        count: result.count,
        cleanedCount: result.cleanedCount,
        invalidCount: result.invalidCount,
        duplicateCount: result.duplicateCount,
        updatedMetrics: result.updatedMetrics,
      });
      setImportStep(3);
      message.success(`成功导入 ${formatNumber(result.count)} 条记录，清洗后 ${formatNumber(result.cleanedCount)} 条有效`);
    } catch (error) {
      message.error('导入失败');
      setImportStep(0);
    } finally {
      setRunningImport(null);
    }
  };

  const handleViewDetail = (source: DataSource) => {
    setSelectedSource(source);
    setDetailModalVisible(true);
  };

  const handleOpenImport = (source: DataSource) => {
    setImportingSource(source);
    setImportStep(0);
    setImportResult(null);
    importForm.setFieldsValue({
      recordCount: 5000,
      fileName: `${source.name}_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.xlsx`,
    });
    setImportModalVisible(true);
  };

  const handleSubmitImport = async () => {
    if (!importingSource) return;
    const values = await importForm.validateFields();
    await handleRunImport(importingSource.id, {
      importCount: values.recordCount,
      fileName: values.fileName,
    });
  };

  const handleCloseImportModal = () => {
    setImportModalVisible(false);
    setImportStep(0);
    setImportResult(null);
    setImportingSource(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'default';
      case 'error': return 'red';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '运行中';
      case 'inactive': return '已停用';
      case 'error': return '异常';
      default: return status;
    }
  };

  const getImportStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'green';
      case 'partial': return 'orange';
      case 'failed': return 'red';
      default: return 'default';
    }
  };

  const getImportStatusText = (status: string) => {
    switch (status) {
      case 'success': return '成功';
      case 'partial': return '部分成功';
      case 'failed': return '失败';
      default: return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'enrollment': return <FileText size={16} />;
      case 'registration': return <Activity size={16} />;
      case 'grades': return <ShieldCheck size={16} />;
      case 'graduation': return <Zap size={16} />;
      case 'employment': return <Database size={16} />;
      default: return <Database size={16} />;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'enrollment': return '招生录取';
      case 'registration': return '报到注册';
      case 'grades': return '课程成绩';
      case 'graduation': return '毕业数据';
      case 'employment': return '就业签约';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'enrollment': return '#3b82f6';
      case 'registration': return '#10b981';
      case 'grades': return '#8b5cf6';
      case 'graduation': return '#f59e0b';
      case 'employment': return '#ec4899';
      default: return '#64748b';
    }
  };

  const getMetricSummary = () => {
    if (!importResult) return [];
    const entries = Object.entries(importResult.updatedMetrics).slice(0, 8);
    return entries.map(([key, val]) => {
      const parts = key.split('_');
      const type = parts[0];
      const id = parts[1];
      const metric = parts.slice(2).join('_');
      const metricNameMap: Record<string, string> = {
        enrollment: '招生人数',
        registrationRate: '报到率',
        coursePassRate: '课程通过率',
        graduationRate: '毕业率',
        employmentRate: '就业率',
      };
      return {
        key,
        entity: type === 'province' ? '省份' : type === 'discipline' ? '学科' : type,
        id,
        metric: metricNameMap[metric] || metric,
        ...val,
      };
    });
  };

  const sourceColumns = [
    {
      title: '数据源',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: DataSource) => (
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${getTypeColor(record.type)}20` }}
          >
            <span style={{ color: getTypeColor(record.type) }}>{getTypeIcon(record.type)}</span>
          </div>
          <div>
            <div className="text-white font-medium">{text}</div>
            <div className="text-xs text-gray-400">{getTypeName(record.type)}</div>
          </div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status === 'active' && <CheckCircle size={12} className="inline mr-1" />}
          {status === 'error' && <AlertTriangle size={12} className="inline mr-1" />}
          {status === 'inactive' && <Clock size={12} className="inline mr-1" />}
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '记录数',
      dataIndex: 'recordCount',
      key: 'recordCount',
      width: 120,
      render: (value: number) => (
        <span className="text-white font-mono">{formatNumber(value)}</span>
      ),
    },
    {
      title: '最后同步',
      dataIndex: 'lastSync',
      key: 'lastSync',
      width: 180,
      render: (date: string) => (
        <span className="text-gray-400 text-sm">{formatDateTime(date)}</span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 260,
      render: (_: unknown, record: DataSource) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              size="small"
              icon={<Settings size={16} />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="文件上传导入">
            <Button
              type="primary"
              size="small"
              icon={<Upload size={16} />}
              onClick={() => handleOpenImport(record)}
              loading={runningImport === record.id}
              disabled={record.status !== 'active'}
              ghost
            >
              导入
            </Button>
          </Tooltip>
          <Tooltip title="快速同步">
            <Button
              size="small"
              icon={<Play size={16} />}
              onClick={() => handleRunImport(record.id)}
              loading={runningImport === record.id}
              disabled={record.status !== 'active'}
            >
              同步
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const importColumns = [
    {
      title: '数据源',
      dataIndex: 'sourceName',
      key: 'sourceName',
      render: (text: string) => <span className="text-white">{text}</span>,
    },
    {
      title: '文件名',
      dataIndex: 'fileName',
      key: 'fileName',
      render: (text?: string) => (
        <span className="text-gray-400">
          {text ? (
            <span className="flex items-center gap-1">
              <FileSpreadsheet size={12} className="text-emerald-400" />
              {text}
            </span>
          ) : '-'}
        </span>
      ),
    },
    {
      title: '原始记录数',
      dataIndex: 'recordCount',
      key: 'recordCount',
      width: 110,
      render: (value: number) => (
        <span className="text-white font-mono">{formatNumber(value)}</span>
      ),
    },
    {
      title: '清洗后数',
      dataIndex: 'cleanedCount',
      key: 'cleanedCount',
      width: 110,
      render: (value: number | undefined, record: ImportRecord) => (
        <div>
          <span className="text-emerald-400 font-mono">
            {formatNumber(value ?? Math.floor(record.recordCount * 0.95))}
          </span>
          <div className="text-xs text-gray-500">
            有效率 {formatPercent(((value ?? record.recordCount) / record.recordCount) * 100)}
          </div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={getImportStatusColor(status)}>
          {status === 'success' && <CheckCircle size={12} className="inline mr-1" />}
          {status === 'failed' && <AlertTriangle size={12} className="inline mr-1" />}
          {getImportStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      key: 'operator',
      width: 120,
      render: (text: string) => (
        <Tag color="blue">{getTypeName(text)}</Tag>
      ),
    },
    {
      title: '导入时间',
      dataIndex: 'importTime',
      key: 'importTime',
      width: 180,
      render: (date: string) => (
        <span className="text-gray-400 text-sm">{formatDateTime(date)}</span>
      ),
    },
  ];

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
          <h1 className="text-2xl font-bold text-white mb-1">数据接入</h1>
          <p className="text-gray-400 text-sm">
            管理数据源接入、数据清洗规则和导入记录
          </p>
        </div>
        <Tooltip title="刷新数据">
          <button
            onClick={() => initData()}
            className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-gray-400 hover:text-white hover:border-blue-500/50 transition-all"
          >
            <RefreshCw size={18} />
          </button>
        </Tooltip>
      </div>

      <Alert
        type="info"
        showIcon
        message="实时数据接入"
        description="系统实时接入招生录取、报到注册、课程成绩、毕业及就业签约数据，自动清洗并按多维度聚合。支持手动触发数据同步或上传文件导入。"
        className="bg-blue-500/10 border-blue-500/30"
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <Statistic
              title={<span className="text-gray-400 flex items-center gap-2"><Database size={14} /> 数据源</span>}
              value={dataSources.length}
              className="text-white"
              valueStyle={{ color: '#3b82f6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <Statistic
              title={<span className="text-gray-400 flex items-center gap-2"><CheckCircle size={14} /> 完整性</span>}
              value={dataQualityMetrics.completeness}
              suffix="%"
              className="text-white"
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <Statistic
              title={<span className="text-gray-400 flex items-center gap-2"><ShieldCheck size={14} /> 准确性</span>}
              value={dataQualityMetrics.accuracy}
              suffix="%"
              className="text-white"
              valueStyle={{ color: '#8b5cf6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <Statistic
              title={<span className="text-gray-400 flex items-center gap-2"><Activity size={14} /> 及时性</span>}
              value={dataQualityMetrics.timeliness}
              suffix="%"
              className="text-white"
              valueStyle={{ color: '#f59e0b' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card
            className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm"
            title={
              <div className="flex items-center gap-2">
                <Database size={20} className="text-blue-400" />
                <span className="text-white font-semibold">数据源管理</span>
                <Tag color="blue">{dataSources.length}个</Tag>
              </div>
            }
            styles={{ body: { padding: '20px' } }}
          >
            <Table
              dataSource={dataSources}
              columns={sourceColumns}
              rowKey="id"
              pagination={false}
              className="dark-table"
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card
            className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm h-full"
            title={
              <div className="flex items-center gap-2">
                <Settings size={20} className="text-purple-400" />
                <span className="text-white font-semibold">数据清洗规则</span>
              </div>
            }
            styles={{ body: { padding: '20px' } }}
          >
            <List
              dataSource={cleaningRules}
              renderItem={(rule: CleaningRule) => (
                <List.Item
                  className="border-b border-slate-700/50 last:border-0 py-3"
                  style={{ borderBottom: '1px solid rgba(51, 65, 85, 0.5)' }}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <Badge status={rule.enabled ? 'processing' : 'default'} />
                      <div>
                        <div className="text-white font-medium">{rule.name}</div>
                        <div className="text-xs text-gray-400">{rule.description}</div>
                        <div className="flex gap-1 mt-1">
                          {rule.affectedFields.map((field, idx) => (
                            <Tag key={idx} color="default" className="text-xs m-0">
                              {field}
                            </Tag>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Switch
                      checked={rule.enabled}
                      onChange={() => toggleCleaningRule(rule.id)}
                    />
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Card
        className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm"
        title={
          <div className="flex items-center gap-2">
            <Upload size={20} className="text-green-400" />
            <span className="text-white font-semibold">导入记录</span>
            <Tag color="green">{importRecords.length}条</Tag>
          </div>
        }
        styles={{ body: { padding: '20px' } }}
      >
        <Table
          dataSource={importRecords}
          columns={importColumns}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: false }}
          className="dark-table"
        />
      </Card>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <Settings size={20} className="text-blue-400" />
            <span>数据源详情 - {selectedSource?.name}</span>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedSource && (
          <div className="space-y-6">
            <Descriptions
              bordered
              column={2}
              size="small"
              className="dark-descriptions"
            >
              <Descriptions.Item label="数据源名称">{selectedSource.name}</Descriptions.Item>
              <Descriptions.Item label="数据类型">
                <Tag color={getTypeColor(selectedSource.type)}>
                  {getTypeName(selectedSource.type)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={getStatusColor(selectedSource.status)}>
                  {getStatusText(selectedSource.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="记录数">
                <span className="text-white font-mono">{formatNumber(selectedSource.recordCount)}</span>
              </Descriptions.Item>
              <Descriptions.Item label="最后同步" span={2}>
                {formatDateTime(selectedSource.lastSync)}
              </Descriptions.Item>
            </Descriptions>

            <div>
              <h4 className="text-white font-semibold mb-3">数据质量指标</h4>
              <Row gutter={[16, 16]}>
                <Col xs={12}>
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">完整性</span>
                      <span className="text-white font-bold">{dataQualityMetrics.completeness}%</span>
                    </div>
                    <Progress
                      percent={dataQualityMetrics.completeness}
                      showInfo={false}
                      strokeColor="#10b981"
                    />
                  </div>
                </Col>
                <Col xs={12}>
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">准确性</span>
                      <span className="text-white font-bold">{dataQualityMetrics.accuracy}%</span>
                    </div>
                    <Progress
                      percent={dataQualityMetrics.accuracy}
                      showInfo={false}
                      strokeColor="#3b82f6"
                    />
                  </div>
                </Col>
                <Col xs={12}>
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">及时性</span>
                      <span className="text-white font-bold">{dataQualityMetrics.timeliness}%</span>
                    </div>
                    <Progress
                      percent={dataQualityMetrics.timeliness}
                      showInfo={false}
                      strokeColor="#f59e0b"
                    />
                  </div>
                </Col>
                <Col xs={12}>
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">唯一性</span>
                      <span className="text-white font-bold">{dataQualityMetrics.uniqueness}%</span>
                    </div>
                    <Progress
                      percent={dataQualityMetrics.uniqueness}
                      showInfo={false}
                      strokeColor="#8b5cf6"
                    />
                  </div>
                </Col>
              </Row>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                icon={<Upload size={16} />}
                onClick={() => {
                  setDetailModalVisible(false);
                  handleOpenImport(selectedSource);
                }}
                disabled={selectedSource.status !== 'active'}
                ghost
                type="primary"
              >
                上传导入
              </Button>
              <Button
                icon={<RefreshCw size={16} />}
                onClick={() => handleRunImport(selectedSource.id)}
                loading={runningImport === selectedSource.id}
                disabled={selectedSource.status !== 'active'}
              >
                手动同步
              </Button>
              <Button
                type="primary"
                icon={<Play size={16} />}
                onClick={() => handleRunImport(selectedSource.id)}
                loading={runningImport === selectedSource.id}
                disabled={selectedSource.status !== 'active'}
                className="bg-gradient-to-r from-blue-500 to-purple-600 border-0"
              >
                立即导入
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <FileSpreadsheet size={20} className="text-emerald-400" />
            <span>手动导入 - {importingSource?.name}</span>
          </div>
        }
        open={importModalVisible}
        onCancel={handleCloseImportModal}
        footer={null}
        width={720}
        destroyOnClose
      >
        {importingSource && (
          <div className="space-y-6">
            <Steps
              size="small"
              current={importStep}
              items={[
                { title: '准备', icon: <FileSpreadsheet size={16} /> },
                { title: '解析', icon: <Upload size={16} /> },
                { title: '清洗', icon: <ShieldCheck size={16} /> },
                { title: '完成', icon: <CheckCircle size={16} /> },
              ]}
              className="mb-4"
            />

            {importStep <= 1 && (
              <div className="space-y-4">
                <Alert
                  type="info"
                  showIcon
                  message="导入说明"
                  description={`本步骤将导入 ${getTypeName(importingSource.type)} 数据。支持上传 Excel (.xlsx)、CSV 文件，或直接生成模拟数据。导入完成后将自动执行清洗并更新看板聚合指标。`}
                  className="bg-blue-500/10 border-blue-500/30"
                />

                <div
                  className="border-2 border-dashed border-slate-600 hover:border-blue-500 rounded-lg p-8 text-center transition-colors cursor-pointer bg-slate-800/30"
                  onClick={() => message.info('文件上传已触发（前端模拟，将使用配置参数生成模拟数据）')}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Upload size={40} className="text-blue-400" />
                    <div className="text-white font-medium">点击或拖拽文件到此处上传</div>
                    <div className="text-xs text-gray-400">支持 .xlsx, .xls, .csv 格式，单文件不超过 50MB</div>
                  </div>
                </div>

                <Divider plain className="text-gray-500 text-xs">或者生成模拟数据</Divider>

                <Form form={importForm} layout="vertical">
                  <Row gutter={[16, 0]}>
                    <Col xs={12}>
                      <Form.Item
                        label={<span className="text-gray-300">模拟记录数</span>}
                        name="recordCount"
                        rules={[{ required: true, message: '请输入记录数' }]}
                      >
                        <InputNumber
                          className="w-full"
                          min={100}
                          max={100000}
                          step={1000}
                          formatter={(value) => value && `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={12}>
                      <Form.Item
                        label={<span className="text-gray-300">文件名</span>}
                        name="fileName"
                        rules={[{ required: true, message: '请输入文件名' }]}
                      >
                        <Select
                          className="w-full"
                          placeholder="选择或输入文件名"
                          dropdownRender={(menu) => (
                            <>
                              {menu}
                              <Divider plain style={{ margin: '8px 0' }} />
                              <div className="p-2 text-xs text-gray-400 flex items-center gap-1">
                                <FileSpreadsheet size={12} />
                                将生成模拟文件进行导入
                              </div>
                            </>
                          )}
                          options={[
                            { value: `${importingSource.name}_batch_001.xlsx`, label: `${importingSource.name}_batch_001.xlsx` },
                            { value: `${importingSource.name}_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.xlsx`, label: `今日数据_${new Date().toISOString().slice(0, 10)}.xlsx` },
                            { value: `${getTypeName(importingSource.type)}_汇总_${Date.now().toString().slice(-6)}.csv`, label: `历史汇总_${Date.now().toString().slice(-6)}.csv` },
                          ]}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>

                <div className="flex justify-end gap-3 pt-2">
                  <Button onClick={handleCloseImportModal}>取消</Button>
                  <Button
                    type="primary"
                    icon={<Upload size={16} />}
                    loading={importStep > 0}
                    onClick={handleSubmitImport}
                    className="bg-gradient-to-r from-blue-500 to-emerald-500 border-0"
                  >
                    开始导入
                  </Button>
                </div>
              </div>
            )}

            {importStep >= 2 && importResult && (
              <div className="space-y-4">
                <div className="bg-slate-800/50 rounded-lg p-5 border border-slate-700/50">
                  <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <BarChart3 size={16} className="text-emerald-400" />
                    清洗结果
                  </h4>
                  <Row gutter={[16, 16]}>
                    <Col xs={6}>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white font-mono">
                          {formatNumber(importResult.count)}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">原始记录</div>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-emerald-400 font-mono">
                          {formatNumber(importResult.cleanedCount)}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">有效入库</div>
                        <Progress
                          percent={Number((importResult.cleanedCount / importResult.count * 100).toFixed(1))}
                          size="small"
                          showInfo={false}
                          strokeColor="#10b981"
                          className="mt-2"
                        />
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-400 font-mono">
                          {formatNumber(importResult.duplicateCount)}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">重复过滤</div>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-400 font-mono">
                          {formatNumber(importResult.invalidCount)}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">无效丢弃</div>
                      </div>
                    </Col>
                  </Row>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-5 border border-blue-500/20">
                  <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <ChevronRight size={16} className="text-blue-400" />
                    聚合指标联动变化（前 {getMetricSummary().length} 项）
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {getMetricSummary().length === 0 ? (
                      <div className="text-center py-8 text-gray-500 text-sm">暂无指标变化</div>
                    ) : (
                      getMetricSummary().map((m) => (
                        <div
                          key={m.key}
                          className="flex items-center justify-between bg-slate-900/50 rounded-md p-3 border border-slate-700/30"
                        >
                          <div className="flex items-center gap-2">
                            <Tag color="blue" className="text-xs">{m.entity}</Tag>
                            <span className="text-white text-sm">{m.metric}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-gray-400 font-mono text-xs">
                              {m.metric === '招生人数' ? formatNumber(m.old) : formatPercent(m.old)}
                            </span>
                            <ChevronRight size={12} className="text-gray-500" />
                            <span className="text-white font-mono text-xs">
                              {m.metric === '招生人数' ? formatNumber(m.new) : formatPercent(m.new)}
                            </span>
                            <span className={`text-xs font-semibold ${m.delta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {m.delta >= 0 ? '+' : ''}{m.metric === '招生人数' ? formatNumber(m.delta) : `${m.delta}%`}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {importStep >= 3 && (
                  <Alert
                    type="success"
                    showIcon
                    message="导入完成"
                    description="数据已成功入库，看板、预警中心的指标和列表已同步更新。"
                    className="bg-emerald-500/10 border-emerald-500/30"
                  />
                )}

                <div className="flex justify-end pt-2">
                  <Button type="primary" onClick={handleCloseImportModal}>
                    完成
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
