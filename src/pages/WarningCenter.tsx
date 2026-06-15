import { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Spin,
  Table,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Tooltip,
  Alert,
  Descriptions,
  Timeline,
  Badge,
} from 'antd';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Filter,
  RefreshCw,
  TrendingDown,
  Building2,
  GraduationCap,
  MapPin,
} from 'lucide-react';
import WarningStats from '@/components/WarningStats';
import { useWarningStore } from '@/store/warningStore';
import { useAuthStore } from '@/store/authStore';
import { useDataStore } from '@/store/dataStore';
import {
  formatPercent,
  formatDateTime,
  getWarningLevelName,
  getWarningLevelColor,
  getApprovalStatusName,
  getApprovalStatusColor,
  getRoleName,
} from '@/utils';
import type { Warning, WarningFilters, WarningLevel, ApprovalStatus } from '@/types';

const { TextArea } = Input;
const { Option } = Select;

export default function WarningCenter() {
  const { user } = useAuthStore();
  const { provinces, universities, disciplines } = useDataStore();
  const { warnings, isLoading, initData, getWarnings, universityConfirm, provincialReview, ministryApprove, getStatistics } = useWarningStore();
  const [filteredWarnings, setFilteredWarnings] = useState<Warning[]>([]);
  const [selectedWarning, setSelectedWarning] = useState<Warning | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionType, setActionType] = useState<'confirm' | 'review' | 'approve' | 'reject'>('confirm');
  const [actionLoading, setActionLoading] = useState(false);
  const [filters, setFilters] = useState<WarningFilters>({});
  const [form] = Form.useForm();

  useEffect(() => {
    if (warnings.length === 0) {
      initData();
    }
  }, [warnings.length, initData]);

  useEffect(() => {
    let filtered = getWarnings(filters);
    
    if (user?.role === 'university' && user.universityId) {
      filtered = filtered.filter(w => w.universityId === user.universityId);
    } else if (user?.role === 'provincial' && user.provinceId) {
      filtered = filtered.filter(w => w.provinceId === user.provinceId);
    }
    
    setFilteredWarnings(filtered);
  }, [warnings, filters, user, getWarnings]);

  const handleFilterChange = (key: keyof WarningFilters, value: string | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value || undefined }));
  };

  const handleViewDetail = (warning: Warning) => {
    setSelectedWarning(warning);
    setDetailModalVisible(true);
  };

  const handleAction = (warning: Warning, action: 'confirm' | 'review' | 'approve' | 'reject') => {
    setSelectedWarning(warning);
    setActionType(action);
    form.resetFields();
    setActionModalVisible(true);
  };

  const handleActionSubmit = async () => {
    if (!selectedWarning || !user) return;
    
    try {
      const values = await form.validateFields();
      setActionLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (actionType === 'confirm') {
        universityConfirm(selectedWarning.id, values.comment, user);
      } else if (actionType === 'review') {
        provincialReview(selectedWarning.id, true, values.comment, user);
      } else if (actionType === 'approve') {
        ministryApprove(selectedWarning.id, true, values.comment, user);
      } else if (actionType === 'reject') {
        if (selectedWarning.status === 'pending_provincial') {
          provincialReview(selectedWarning.id, false, values.comment, user);
        } else if (selectedWarning.status === 'pending_ministry') {
          ministryApprove(selectedWarning.id, false, values.comment, user);
        }
      }
      
      setActionModalVisible(false);
      setActionLoading(false);
    } catch (error) {
      setActionLoading(false);
    }
  };

  const canTakeAction = (warning: Warning) => {
    if (!user) return false;
    if (user.role === 'university' && warning.status === 'pending_university' && warning.universityId === user.universityId) {
      return true;
    }
    if (user.role === 'provincial' && warning.status === 'pending_provincial' && warning.provinceId === user.provinceId) {
      return true;
    }
    if (user.role === 'ministry' && warning.status === 'pending_ministry') {
      return true;
    }
    return false;
  };

  const getProvinceName = (id: string) => provinces.find(p => p.id === id)?.name || id;
  const getUniversityName = (id: string) => universities.find(u => u.id === id)?.name || id;
  const getDisciplineName = (id: string) => disciplines.find(d => d.id === id)?.name || id;

  const columns = [
    {
      title: '预警级别',
      dataIndex: 'level',
      key: 'level',
      width: 120,
      render: (level: WarningLevel) => (
        <Tag color={getWarningLevelColor(level)} className="font-medium">
          <AlertTriangle size={12} className="inline mr-1" />
          {getWarningLevelName(level)}
        </Tag>
      ),
    },
    {
      title: '省份',
      dataIndex: 'provinceId',
      key: 'provinceId',
      render: (id: string) => (
        <div className="flex items-center gap-1">
          <MapPin size={14} className="text-gray-400" />
          <span className="text-white">{getProvinceName(id)}</span>
        </div>
      ),
    },
    {
      title: '高校',
      dataIndex: 'universityId',
      key: 'universityId',
      render: (id: string) => (
        <div className="flex items-center gap-1">
          <Building2 size={14} className="text-gray-400" />
          <span className="text-white">{getUniversityName(id)}</span>
        </div>
      ),
    },
    {
      title: '学科',
      dataIndex: 'disciplineId',
      key: 'disciplineId',
      render: (id: string) => (
        <div className="flex items-center gap-1">
          <GraduationCap size={14} className="text-gray-400" />
          <span className="text-white">{getDisciplineName(id)}</span>
        </div>
      ),
    },
    {
      title: '就业率',
      dataIndex: 'employmentRate',
      key: 'employmentRate',
      render: (value: number, record: Warning) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="text-red-400 font-bold">{formatPercent(value)}</span>
            <TrendingDown size={14} className="text-red-400" />
          </div>
          <div className="text-xs text-gray-500">
            全国均值: {formatPercent(record.nationalAverage)}
          </div>
        </div>
      ),
    },
    {
      title: '偏差率',
      dataIndex: 'deviationPercent',
      key: 'deviationPercent',
      render: (value: number) => (
        <Badge
          count={`-${value.toFixed(1)}%`}
          className="site-badge-count"
          style={{ backgroundColor: '#F53F3F' }}
        />
      ),
    },
    {
      title: '连续年数',
      dataIndex: 'consecutiveYears',
      key: 'consecutiveYears',
      render: (value: number) => (
        <span className="text-orange-400 font-bold">{value}年</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: ApprovalStatus) => (
        <Tag color={getApprovalStatusColor(status)}>
          {getApprovalStatusName(status)}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (
        <span className="text-gray-400 text-sm">{formatDateTime(date)}</span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: unknown, record: Warning) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              size="small"
              icon={<Eye size={16} />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          {canTakeAction(record) && (
            <>
              {record.status === 'pending_university' && (
                <Tooltip title="确认预警">
                  <Button
                    type="primary"
                    size="small"
                    icon={<CheckCircle size={16} />}
                    onClick={() => handleAction(record, 'confirm')}
                  >
                    确认
                  </Button>
                </Tooltip>
              )}
              {record.status === 'pending_provincial' && (
                <>
                  <Tooltip title="复核通过">
                    <Button
                      type="primary"
                      size="small"
                      icon={<ThumbsUp size={16} />}
                      onClick={() => handleAction(record, 'review')}
                    >
                      通过
                    </Button>
                  </Tooltip>
                  <Tooltip title="复核驳回">
                    <Button
                      danger
                      size="small"
                      icon={<ThumbsDown size={16} />}
                      onClick={() => handleAction(record, 'reject')}
                    >
                      驳回
                    </Button>
                  </Tooltip>
                </>
              )}
              {record.status === 'pending_ministry' && (
                <>
                  <Tooltip title="批准调整">
                    <Button
                      type="primary"
                      size="small"
                      icon={<ThumbsUp size={16} />}
                      onClick={() => handleAction(record, 'approve')}
                    >
                      批准
                    </Button>
                  </Tooltip>
                  <Tooltip title="不予批准">
                    <Button
                      danger
                      size="small"
                      icon={<ThumbsDown size={16} />}
                      onClick={() => handleAction(record, 'reject')}
                    >
                      驳回
                    </Button>
                  </Tooltip>
                </>
              )}
            </>
          )}
        </Space>
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
          <h1 className="text-2xl font-bold text-white mb-1">预警中心</h1>
          <p className="text-gray-400 text-sm">
            监控就业率异常学科，启动三级审批流程调整招生计划
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
        type="warning"
        showIcon
        message="预警规则说明"
        description="当某学科连续两年就业率低于全国均值20%时，自动生成一级预警并推送至省级教育厅，启动三级审批流程（高校确认 → 省厅复核 → 教育部批准）调整招生计划。"
        className="bg-orange-500/10 border-orange-500/30"
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card
            className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm h-full"
            title={
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-blue-400" />
                <span className="text-white font-semibold">筛选条件</span>
              </div>
            }
            styles={{ body: { padding: '20px' } }}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">预警级别</label>
                <Select
                  placeholder="全部级别"
                  allowClear
                  className="w-full"
                  value={filters.level}
                  onChange={(v) => handleFilterChange('level', v)}
                  options={[
                    { value: 'level1', label: '一级预警' },
                    { value: 'level2', label: '二级预警' },
                    { value: 'level3', label: '三级预警' },
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">审批状态</label>
                <Select
                  placeholder="全部状态"
                  allowClear
                  className="w-full"
                  value={filters.status}
                  onChange={(v) => handleFilterChange('status', v)}
                  options={[
                    { value: 'pending_university', label: '待高校确认' },
                    { value: 'pending_provincial', label: '待省厅复核' },
                    { value: 'pending_ministry', label: '待教育部批准' },
                    { value: 'approved', label: '已批准' },
                    { value: 'rejected', label: '已驳回' },
                  ]}
                />
              </div>
              {user?.role === 'ministry' && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">省份</label>
                  <Select
                    placeholder="全部省份"
                    allowClear
                    className="w-full"
                    value={filters.provinceId}
                    onChange={(v) => handleFilterChange('provinceId', v)}
                    showSearch
                    optionFilterProp="label"
                    options={provinces.map(p => ({ value: p.id, label: p.name }))}
                  />
                </div>
              )}
              <Button
                type="primary"
                block
                icon={<Filter size={16} />}
                onClick={() => setFilters({})}
                className="bg-slate-700 border-slate-600 hover:bg-slate-600"
              >
                重置筛选
              </Button>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card
            className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm"
            styles={{ body: { padding: '20px' } }}
          >
            <WarningStats stats={getStatistics()} onViewAll={() => {}} />
          </Card>
        </Col>
      </Row>

      <Card
        className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm"
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={20} className="text-orange-400" />
              <span className="text-white font-semibold">预警列表</span>
              <Tag color="blue">{filteredWarnings.length}条记录</Tag>
            </div>
          </div>
        }
        styles={{ body: { padding: '20px' } }}
      >
        <Table
          dataSource={filteredWarnings}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: false }}
          className="dark-table"
          scroll={{ x: 1400 }}
        />
      </Card>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} className="text-orange-400" />
            <span>预警详情</span>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
        styles={{ body: { padding: '24px' } }}
      >
        {selectedWarning && (
          <div className="space-y-6">
            <Descriptions
              bordered
              column={2}
              size="small"
              className="dark-descriptions"
            >
              <Descriptions.Item label="预警级别">
                <Tag color={getWarningLevelColor(selectedWarning.level)}>
                  {getWarningLevelName(selectedWarning.level)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="审批状态">
                <Tag color={getApprovalStatusColor(selectedWarning.status)}>
                  {getApprovalStatusName(selectedWarning.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="省份">{getProvinceName(selectedWarning.provinceId)}</Descriptions.Item>
              <Descriptions.Item label="高校">{getUniversityName(selectedWarning.universityId)}</Descriptions.Item>
              <Descriptions.Item label="学科">{getDisciplineName(selectedWarning.disciplineId)}</Descriptions.Item>
              <Descriptions.Item label="连续年数">
                <span className="text-orange-400 font-bold">{selectedWarning.consecutiveYears}年</span>
              </Descriptions.Item>
              <Descriptions.Item label="就业率" span={2}>
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-gray-400 text-xs">当前就业率</span>
                    <div className="text-xl font-bold text-red-400">{formatPercent(selectedWarning.employmentRate)}</div>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs">全国均值</span>
                    <div className="text-xl font-bold text-blue-400">{formatPercent(selectedWarning.nationalAverage)}</div>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs">偏差率</span>
                    <div className="text-xl font-bold text-orange-400">-{selectedWarning.deviationPercent.toFixed(1)}%</div>
                  </div>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="创建时间" span={2}>
                {formatDateTime(selectedWarning.createdAt)}
              </Descriptions.Item>
            </Descriptions>

            <div>
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Clock size={16} className="text-blue-400" />
                审批流程
              </h4>
              <Timeline
                items={[
                  {
                    color: 'green',
                    children: (
                      <div>
                        <div className="text-white font-medium">预警生成</div>
                        <div className="text-xs text-gray-400">系统自动检测，就业率低于全国均值20%</div>
                        <div className="text-xs text-gray-500">{formatDateTime(selectedWarning.createdAt)}</div>
                      </div>
                    ),
                  },
                  ...selectedWarning.approvalHistory.map((record) => ({
                    color: record.action === 'reject' ? 'red' : 'blue',
                    children: (
                      <div>
                        <div className="text-white font-medium">
                          {record.action === 'confirm' && '高校确认'}
                          {record.action === 'review' && '省厅复核通过'}
                          {record.action === 'approve' && '教育部批准'}
                          {record.action === 'reject' && '审批驳回'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {getRoleName(record.operatorRole)} - {record.operatorName}
                        </div>
                        {record.comment && (
                          <div className="text-xs text-gray-300 mt-1 bg-slate-800/50 rounded p-2">
                            意见：{record.comment}
                          </div>
                        )}
                        <div className="text-xs text-gray-500">{formatDateTime(record.createdAt)}</div>
                      </div>
                    ),
                  })),
                  selectedWarning.status === 'pending_university' && {
                    color: 'orange',
                    children: (
                      <div className="text-orange-400">
                        <div className="font-medium">待高校确认</div>
                        <div className="text-xs">等待高校管理员确认预警信息</div>
                      </div>
                    ),
                  },
                  selectedWarning.status === 'pending_provincial' && {
                    color: 'blue',
                    children: (
                      <div className="text-blue-400">
                        <div className="font-medium">待省厅复核</div>
                        <div className="text-xs">等待省级教育厅复核</div>
                      </div>
                    ),
                  },
                  selectedWarning.status === 'pending_ministry' && {
                    color: 'purple',
                    children: (
                      <div className="text-purple-400">
                        <div className="font-medium">待教育部批准</div>
                        <div className="text-xs">等待教育部最终批准调整招生计划</div>
                      </div>
                    ),
                  },
                  selectedWarning.status === 'approved' && {
                    color: 'green',
                    children: (
                      <div className="text-green-400">
                        <div className="font-medium">已完成</div>
                        <div className="text-xs">招生计划调整已批准</div>
                      </div>
                    ),
                  },
                  selectedWarning.status === 'rejected' && {
                    color: 'red',
                    children: (
                      <div className="text-red-400">
                        <div className="font-medium">已驳回</div>
                        <div className="text-xs">审批流程已驳回</div>
                      </div>
                    ),
                  },
                ].filter(Boolean)}
              />
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title={
          <div className="flex items-center gap-2">
            {actionType === 'reject' ? (
              <XCircle size={20} className="text-red-400" />
            ) : (
              <CheckCircle size={20} className="text-green-400" />
            )}
            <span>
              {actionType === 'confirm' && '确认预警'}
              {actionType === 'review' && '省厅复核通过'}
              {actionType === 'approve' && '教育部批准'}
              {actionType === 'reject' && '审批驳回'}
            </span>
          </div>
        }
        open={actionModalVisible}
        onCancel={() => setActionModalVisible(false)}
        onOk={handleActionSubmit}
        confirmLoading={actionLoading}
        okText="提交"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="comment"
            label={<span className="text-gray-300">审批意见</span>}
            rules={[{ required: true, message: '请输入审批意见' }]}
          >
            <TextArea
              rows={4}
              placeholder="请输入审批意见..."
              className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-gray-500"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
