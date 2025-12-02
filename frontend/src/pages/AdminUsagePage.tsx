/**
 * AdminUsagePage.tsx
 * Usage Analytics & Statistics
 * Modern data visualization
 */

import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  FileText,
  Zap,
  Database,
  Users,
  Clock,
  Activity,
  DollarSign,
  Calendar
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import { adminApi } from '../api/admin';
import { useState, useEffect } from 'react';

function AdminUsagePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getCostDashboard().then(d => {
      setData(d);
      setLoading(false);
    }).catch(e => {
      console.error(e);
      setLoading(false);
    });
  }, []);

  if (loading || !data) return <div className="p-6">Loading...</div>;

  const { currentPeriod, limits, weeklyData, topProjects } = data;

  const projectTypeData = [
    { name: 'Technical', value: 12, color: '#0B57D0' },
    { name: 'Consulting', value: 8, color: '#0E7A4E' },
    { name: 'Research', value: 5, color: '#EFB81A' },
    { name: 'Other', value: 3, color: '#9AA0A6' },
  ];

  const StatCard = ({
    title,
    value,
    limit,
    unit,
    icon: Icon,
    trend,
    trendValue
  }: any) => {
    const percentage = (value / limit) * 100;
    const isHigh = percentage > 80;

    return (
      <div className="border border-[#E0E0E0] rounded-lg p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Icon className="h-4 w-4 text-[#9AA0A6]" />
              <span className="text-[0.75rem] text-[#9AA0A6] uppercase tracking-wider">
                {title}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-[1.75rem] font-semibold text-[#1F1F1F] mono">
                {value.toLocaleString()}
              </span>
              {unit && <span className="text-[0.875rem] text-[#9AA0A6]">{unit}</span>}
            </div>
          </div>
          {trend && (
            <div className={`flex items-center gap-1 ${trend === 'up' ? 'text-[#0E7A4E]' : 'text-[#D0362D]'
              }`}>
              {trend === 'up' ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span className="text-[0.875rem] font-semibold">{trendValue}%</span>
            </div>
          )}
        </div>

        {limit && (
          <>
            <Progress value={percentage} className="h-2 mb-2" />
            <div className="flex items-center justify-between text-[0.75rem]">
              <span className="text-[#9AA0A6]">
                {value.toLocaleString()} / {limit.toLocaleString()}
              </span>
              <span className={isHigh ? 'text-[#EFB81A] font-medium' : 'text-[#9AA0A6]'}>
                {percentage.toFixed(1)}%
              </span>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="h-full overflow-auto bg-white">
      <div className="p-6 max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h2 className="text-[1.25rem] font-semibold text-[#1F1F1F]">Usage & Analytics</h2>
          <p className="text-[0.875rem] text-[#9AA0A6] mt-1">
            Current billing period: Nov 1 - Nov 30, 2024
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            title="API Calls"
            value={currentPeriod.apiCalls}
            limit={limits.apiCalls}
            icon={Zap}
            trend="up"
            trendValue={12.5}
          />
          <StatCard
            title="Tokens Used"
            value={currentPeriod.tokensUsed}
            limit={limits.tokens}
            icon={Activity}
            trend="up"
            trendValue={8.3}
          />
          <StatCard
            title="Active Users"
            value={currentPeriod.activeUsers}
            limit={limits.users}
            icon={Users}
            trend="down"
            trendValue={-2.1}
          />
          <StatCard
            title="Storage"
            value={currentPeriod.storageUsed}
            limit={limits.storage}
            unit="GB"
            icon={Database}
            trend="up"
            trendValue={15.2}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* API Calls Trend */}
          <div className="border border-[#E0E0E0] rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[0.9375rem] font-semibold text-[#1F1F1F]">
                API Calls (7 Days)
              </h3>
              <Badge variant="outline" className="bg-[#0B57D0]/10 text-[#0B57D0] border-[#0B57D0]/30">
                This Week
              </Badge>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#9AA0A6', fontSize: 12 }}
                  stroke="#E0E0E0"
                />
                <YAxis
                  tick={{ fill: '#9AA0A6', fontSize: 12 }}
                  stroke="#E0E0E0"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="apiCalls"
                  stroke="#0B57D0"
                  strokeWidth={2}
                  dot={{ fill: '#0B57D0', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Projects by Type */}
          <div className="border border-[#E0E0E0] rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[0.9375rem] font-semibold text-[#1F1F1F]">
                Projects by Type
              </h3>
              <Badge variant="outline" className="bg-[#0E7A4E]/10 text-[#0E7A4E] border-[#0E7A4E]/30">
                {currentPeriod.projectsCreated} Total
              </Badge>
            </div>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={projectTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {projectTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E0E0E0',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {projectTypeData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-sm"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[0.75rem] text-[#424242]">
                    {item.name} ({item.value})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Projects Table */}
        <div className="border border-[#E0E0E0] rounded-lg overflow-hidden">
          <div className="p-5 border-b border-[#E0E0E0] bg-[#F7F7F8]">
            <h3 className="text-[0.9375rem] font-semibold text-[#1F1F1F]">
              Top Projects by Usage
            </h3>
          </div>
          <table className="w-full">
            <thead className="bg-[#F7F7F8] border-b border-[#E0E0E0]">
              <tr className="text-[0.75rem] text-[#424242] uppercase tracking-wider">
                <th className="text-left py-3 px-5 font-semibold">Project</th>
                <th className="text-right py-3 px-5 font-semibold">API Calls</th>
                <th className="text-right py-3 px-5 font-semibold">Tokens</th>
                <th className="text-right py-3 px-5 font-semibold">% of Total</th>
                <th className="text-right py-3 px-5 font-semibold">Usage</th>
              </tr>
            </thead>
            <tbody>
              {topProjects.map((project, idx) => (
                <tr
                  key={idx}
                  className="border-b border-[#E0E0E0] hover:bg-[#F7F7F8] transition-colors"
                >
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-[#9AA0A6]" />
                      <span className="text-[0.875rem] font-medium text-[#1F1F1F]">
                        {project.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <span className="text-[0.875rem] text-[#424242] mono">
                      {project.apiCalls.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <span className="text-[0.875rem] text-[#424242] mono">
                      {project.tokens.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <span className="text-[0.875rem] font-semibold text-[#0B57D0] mono">
                      {project.percentage}%
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <div className="w-full">
                      <Progress value={project.percentage} className="h-2" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cost Estimate */}
        <div className="border border-[#E0E0E0] rounded-lg p-5 bg-[#F7F7F8]">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-[#0B57D0]/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-[#0B57D0]" />
              </div>
              <div>
                <h3 className="text-[0.9375rem] font-semibold text-[#1F1F1F] mb-1">
                  Estimated Cost (This Month)
                </h3>
                <p className="text-[0.75rem] text-[#9AA0A6]">
                  Based on current usage patterns
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[2rem] font-semibold text-[#0B57D0] mono">
                $247.50
              </div>
              <div className="text-[0.75rem] text-[#9AA0A6]">
                of $500 budget
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={49.5} className="h-3" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminUsagePage;
