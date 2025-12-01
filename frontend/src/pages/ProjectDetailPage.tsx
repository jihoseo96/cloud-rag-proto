/**
 * Screen 2: Project Workspace (Project Overview Tab)
 * Project-specific Dashboard with KPIs and Task List
 */

import { useState } from 'react';
import { EnterpriseLayout } from '../components/EnterpriseLayout';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Database,
  FileQuestion,
  Shield,
  Activity,
  Calendar,
  Target
} from 'lucide-react';

interface KPIData {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  status?: 'success' | 'warning' | 'danger' | 'info';
  icon: React.ReactNode;
}

interface TaskItem {
  id: string;
  priority: 'high' | 'medium' | 'low';
  type: 'review' | 'resolve' | 'approve' | 'update';
  title: string;
  section: string;
  count?: number;
  deadline?: Date;
  status: 'pending' | 'in_progress' | 'completed';
}

function ProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock Project Data
  const projectName = 'Government Defense RFP 2024-Q4';
  const dueDate = new Date('2024-12-15');
  const daysUntil = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  // KPI Data
  const kpis: KPIData[] = [
    {
      label: 'Submission Deadline',
      value: `D-${daysUntil}`,
      subValue: dueDate.toLocaleDateString('ko-KR'),
      status: daysUntil <= 5 ? 'danger' : daysUntil <= 10 ? 'warning' : 'info',
      icon: <Calendar className="h-5 w-5" />
    },
    {
      label: 'Requirements Coverage',
      value: '12/150',
      subValue: '8% Complete',
      status: 'warning',
      trend: 'up',
      icon: <Target className="h-5 w-5" />
    },
    {
      label: 'Compliance Score',
      value: '87%',
      subValue: '+3% from last week',
      status: 'success',
      trend: 'up',
      icon: <Shield className="h-5 w-5" />
    },
    {
      label: 'AnswerCards',
      value: '45',
      subValue: '12 High Confidence',
      status: 'info',
      icon: <Database className="h-5 w-5" />
    }
  ];

  // Task List
  const [tasks] = useState<TaskItem[]>([
    {
      id: 'task-1',
      priority: 'high',
      type: 'review',
      title: 'Review High Risk Answers in Security Section',
      section: '3. Security Requirements',
      count: 3,
      deadline: new Date('2024-12-05'),
      status: 'pending'
    },
    {
      id: 'task-2',
      priority: 'high',
      type: 'resolve',
      title: 'Resolve Fact Mismatches',
      section: '5. Technical Specifications',
      count: 2,
      deadline: new Date('2024-12-04'),
      status: 'pending'
    },
    {
      id: 'task-3',
      priority: 'medium',
      type: 'approve',
      title: 'Approve New AnswerCard Variants',
      section: 'Knowledge Base',
      count: 5,
      status: 'in_progress'
    },
    {
      id: 'task-4',
      priority: 'medium',
      type: 'update',
      title: 'Update ISO 27001 Certificate Information',
      section: '3.2 Certifications',
      deadline: new Date('2024-12-08'),
      status: 'pending'
    },
    {
      id: 'task-5',
      priority: 'low',
      type: 'review',
      title: 'Review AI-Generated Content',
      section: '2. Company Overview',
      count: 8,
      status: 'pending'
    }
  ]);

  // Activity Timeline
  const activities = [
    {
      id: 'act-1',
      type: 'upload',
      title: 'Uploaded 5 reference documents',
      user: 'You',
      timestamp: new Date('2024-11-29T14:30:00'),
      icon: <FileText className="h-4 w-4" />
    },
    {
      id: 'act-2',
      type: 'ai',
      title: 'AI analyzed documents and created 12 AnswerCards',
      user: 'System',
      timestamp: new Date('2024-11-29T14:45:00'),
      icon: <Activity className="h-4 w-4" />
    },
    {
      id: 'act-3',
      type: 'conflict',
      title: 'Resolved 2 document conflicts',
      user: 'You',
      timestamp: new Date('2024-11-29T15:10:00'),
      icon: <AlertCircle className="h-4 w-4" />
    },
    {
      id: 'act-4',
      type: 'approval',
      title: 'Approved 3 AnswerCards',
      user: 'Kim Min-soo',
      timestamp: new Date('2024-11-29T16:20:00'),
      icon: <CheckCircle2 className="h-4 w-4" />
    }
  ];

  const getStatusColor = (status: KPIData['status']) => {
    switch (status) {
      case 'success':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'warning':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'danger':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'info':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    }
  };

  const getPriorityColor = (priority: TaskItem['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-500 bg-red-500/10 border-red-500/30';
      case 'medium':
        return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
      case 'low':
        return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
    }
  };

  const getTypeIcon = (type: TaskItem['type']) => {
    switch (type) {
      case 'review':
        return <FileQuestion className="h-4 w-4" />;
      case 'resolve':
        return <AlertTriangle className="h-4 w-4" />;
      case 'approve':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'update':
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <EnterpriseLayout>
      <div className="h-full flex flex-col">
        
        {/* Project Header */}
        <div className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-foreground">{projectName}</h1>
                <Badge variant="default" className="bg-teal-500/20 text-teal-400 border-teal-500/30">
                  ACTIVE
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Defense · Technical RFP · Created Nov 15, 2024
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => navigate(`/project/${projectId}/upload`)}
              >
                <FileText className="h-4 w-4 mr-2" />
                Upload Docs
              </Button>
              <Button
                onClick={() => navigate(`/project/${projectId}/proposal`)}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                Write Proposal
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-transparent border-b-0 h-auto p-0 space-x-6">
              <TabsTrigger 
                value="overview"
                className="bg-transparent data-[state=active]:bg-transparent border-b-2 border-transparent data-[state=active]:border-teal-500 rounded-none px-0 pb-2"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="docs"
                className="bg-transparent data-[state=active]:bg-transparent border-b-2 border-transparent data-[state=active]:border-teal-500 rounded-none px-0 pb-2"
                onClick={() => navigate(`/project/${projectId}/cards`)}
              >
                Reference Docs
              </TabsTrigger>
              <TabsTrigger 
                value="requirements"
                className="bg-transparent data-[state=active]:bg-transparent border-b-2 border-transparent data-[state=active]:border-teal-500 rounded-none px-0 pb-2"
                onClick={() => navigate(`/project/${projectId}/requirements`)}
              >
                Requirements
              </TabsTrigger>
              <TabsTrigger 
                value="audit"
                className="bg-transparent data-[state=active]:bg-transparent border-b-2 border-transparent data-[state=active]:border-teal-500 rounded-none px-0 pb-2"
                onClick={() => navigate(`/project/${projectId}/audit`)}
              >
                Audit Log
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {kpis.map((kpi, idx) => (
                <div
                  key={idx}
                  className={`bg-card border rounded-lg p-4 ${getStatusColor(kpi.status)}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {kpi.icon}
                      <span className="text-xs font-medium uppercase tracking-wider">
                        {kpi.label}
                      </span>
                    </div>
                    {kpi.trend && (
                      <TrendingUp className={`h-4 w-4 ${kpi.trend === 'up' ? 'text-green-400' : 'text-red-400'}`} />
                    )}
                  </div>
                  <div className="text-2xl font-semibold mb-1">
                    {kpi.value}
                  </div>
                  {kpi.subValue && (
                    <div className="text-xs opacity-80">
                      {kpi.subValue}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Task List */}
              <div className="lg:col-span-2 bg-card border border-border rounded-lg">
                <div className="p-5 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-semibold text-foreground">Action Items</h2>
                      <p className="text-xs text-muted-foreground mt-1">
                        {tasks.filter(t => t.status === 'pending').length} pending tasks
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      View All
                    </Button>
                  </div>
                </div>
                
                <div className="divide-y divide-border">
                  {tasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => {
                        // Navigate based on task type
                        if (task.type === 'approve') {
                          navigate(`/project/${projectId}/cards`);
                        } else {
                          navigate(`/project/${projectId}/requirements`);
                        }
                      }}
                      className="w-full flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors text-left"
                    >
                      <div className={`p-2 rounded border ${getPriorityColor(task.priority)}`}>
                        {getTypeIcon(task.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-foreground">{task.title}</span>
                          {task.count && (
                            <Badge variant="outline" className="text-xs">
                              {task.count}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{task.section}</span>
                          {task.deadline && (
                            <>
                              <span>•</span>
                              <Clock className="h-3 w-3" />
                              <span>Due {task.deadline.toLocaleDateString('ko-KR')}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Activity Timeline */}
              <div className="bg-card border border-border rounded-lg">
                <div className="p-5 border-b border-border">
                  <h2 className="font-semibold text-foreground">Recent Activity</h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Last 24 hours
                  </p>
                </div>
                
                <div className="p-5 space-y-4">
                  {activities.map((activity, idx) => (
                    <div key={activity.id} className="relative">
                      {idx !== activities.length - 1 && (
                        <div className="absolute left-[11px] top-[28px] bottom-[-16px] w-px bg-border" />
                      )}
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center relative z-10">
                          {activity.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground mb-1">{activity.title}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{activity.user}</span>
                            <span>•</span>
                            <span>{activity.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </EnterpriseLayout>
  );
}

export default ProjectDetailPage;
