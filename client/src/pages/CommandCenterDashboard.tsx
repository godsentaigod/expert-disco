/**
 * Command Center Dashboard - Real-time monitoring and management
 */

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Activity,
  TrendingUp,
  Users,
  Zap,
  Clock,
  AlertCircle,
  CheckCircle,
  Settings,
} from "lucide-react";

interface MetricCard {
  title: string;
  value: string | number;
  change: string;
  icon: React.ReactNode;
  color: string;
}

interface WorkflowItem {
  id: string;
  name: string;
  status: "active" | "paused" | "completed";
  progress: number;
  tasks: number;
}

export default function CommandCenterDashboard() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);

  const metricCards: MetricCard[] = [
    {
      title: "Active Agents",
      value: 7,
      change: "+2 from last week",
      icon: <Users className="w-6 h-6" />,
      color: "bg-blue-100 text-blue-900",
    },
    {
      title: "Tasks Completed",
      value: "342",
      change: "+45 today",
      icon: <CheckCircle className="w-6 h-6" />,
      color: "bg-green-100 text-green-900",
    },
    {
      title: "System Uptime",
      value: "99.9%",
      change: "Last 30 days",
      icon: <Activity className="w-6 h-6" />,
      color: "bg-purple-100 text-purple-900",
    },
    {
      title: "Avg Response Time",
      value: "245ms",
      change: "-32% improvement",
      icon: <Zap className="w-6 h-6" />,
      color: "bg-orange-100 text-orange-900",
    },
  ];

  const workflows: WorkflowItem[] = [
    {
      id: "wf-1",
      name: "Content Publishing Pipeline",
      status: "active",
      progress: 65,
      tasks: 5,
    },
    {
      id: "wf-2",
      name: "Lead Qualification Workflow",
      status: "active",
      progress: 42,
      tasks: 3,
    },
    {
      id: "wf-3",
      name: "Customer Onboarding Sequence",
      status: "completed",
      progress: 100,
      tasks: 4,
    },
    {
      id: "wf-4",
      name: "Sales Pipeline Management",
      status: "active",
      progress: 78,
      tasks: 6,
    },
  ];

  const performanceData = [
    { time: "00:00", agents: 2, tasks: 12, efficiency: 65 },
    { time: "04:00", agents: 3, tasks: 28, efficiency: 72 },
    { time: "08:00", agents: 5, tasks: 45, efficiency: 78 },
    { time: "12:00", agents: 7, tasks: 89, efficiency: 85 },
    { time: "16:00", agents: 6, tasks: 72, efficiency: 82 },
    { time: "20:00", agents: 4, tasks: 38, efficiency: 76 },
    { time: "24:00", agents: 2, tasks: 18, efficiency: 68 },
  ];

  const agentDistribution = [
    { name: "Trend Predictor", value: 12, color: "#f59e0b" },
    { name: "Content Creator", value: 28, color: "#ec4899" },
    { name: "Sales Agent", value: 45, color: "#3b82f6" },
    { name: "Operations", value: 38, color: "#10b981" },
    { name: "Strategy", value: 18, color: "#8b5cf6" },
    { name: "Advanced Coder", value: 32, color: "#f97316" },
    { name: "Platform Architect", value: 22, color: "#06b6d4" },
  ];

  const taskMetrics = [
    { name: "Completed", value: 342, color: "#10b981" },
    { name: "In Progress", value: 45, color: "#3b82f6" },
    { name: "Pending", value: 23, color: "#f59e0b" },
    { name: "Failed", value: 8, color: "#ef4444" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-rose-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-amber-900 mb-2">
            Command Center Dashboard
          </h1>
          <p className="text-amber-700">
            Real-time monitoring and management of your autonomous AI workforce
          </p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {metricCards.map((metric, index) => (
            <Card
              key={index}
              className="border-amber-200 bg-white/80 backdrop-blur p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${metric.color}`}>
                  {metric.icon}
                </div>
              </div>
              <h3 className="text-sm font-medium text-amber-700 mb-1">
                {metric.title}
              </h3>
              <p className="text-3xl font-bold text-amber-900 mb-2">
                {metric.value}
              </p>
              <p className="text-xs text-amber-600">{metric.change}</p>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList className="bg-white/80 backdrop-blur border border-amber-200">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Performance Tab */}
          <TabsContent value="performance">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 border-amber-200 bg-white/80 backdrop-blur p-6">
                <h2 className="text-lg font-bold text-amber-900 mb-4">
                  System Performance Over Time
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#fef3c7" />
                    <XAxis dataKey="time" stroke="#b45309" />
                    <YAxis stroke="#b45309" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fffbeb",
                        border: "1px solid #fcd34d",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="agents"
                      stroke="#f59e0b"
                      name="Active Agents"
                    />
                    <Line
                      type="monotone"
                      dataKey="tasks"
                      stroke="#3b82f6"
                      name="Tasks"
                    />
                    <Line
                      type="monotone"
                      dataKey="efficiency"
                      stroke="#10b981"
                      name="Efficiency %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              <Card className="border-amber-200 bg-white/80 backdrop-blur p-6">
                <h2 className="text-lg font-bold text-amber-900 mb-4">
                  Task Status
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={taskMetrics}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {taskMetrics.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {taskMetrics.map((metric, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: metric.color }}
                        />
                        <span className="text-sm text-amber-700">
                          {metric.name}
                        </span>
                      </div>
                      <span className="font-semibold text-amber-900">
                        {metric.value}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Workflows Tab */}
          <TabsContent value="workflows">
            <Card className="border-amber-200 bg-white/80 backdrop-blur p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-amber-900">
                  Active Workflows
                </h2>
                <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                  <Zap className="w-4 h-4 mr-2" />
                  Create Workflow
                </Button>
              </div>

              <div className="space-y-4">
                {workflows.map((workflow) => (
                  <div
                    key={workflow.id}
                    className="p-4 border border-amber-100 rounded-lg hover:bg-amber-50 cursor-pointer transition"
                    onClick={() => setSelectedWorkflow(workflow.id)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                          <Activity className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-amber-900">
                            {workflow.name}
                          </h3>
                          <p className="text-sm text-amber-600">
                            {workflow.tasks} tasks
                          </p>
                        </div>
                      </div>
                      <Badge
                        className={
                          workflow.status === "active"
                            ? "bg-green-100 text-green-800"
                            : workflow.status === "completed"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {workflow.status}
                      </Badge>
                    </div>
                    <div className="w-full bg-amber-100 rounded-full h-2">
                      <div
                        className="bg-amber-600 h-2 rounded-full transition-all"
                        style={{ width: `${workflow.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-amber-600 mt-2">
                      {workflow.progress}% complete
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Agents Tab */}
          <TabsContent value="agents">
            <Card className="border-amber-200 bg-white/80 backdrop-blur p-6">
              <h2 className="text-lg font-bold text-amber-900 mb-6">
                Agent Distribution
              </h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={agentDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#fef3c7" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    stroke="#b45309"
                  />
                  <YAxis stroke="#b45309" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fffbeb",
                      border: "1px solid #fcd34d",
                    }}
                  />
                  <Bar dataKey="value" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-amber-200 bg-white/80 backdrop-blur p-6">
                <h2 className="text-lg font-bold text-amber-900 mb-4">
                  Key Metrics
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-700">Total Revenue Generated</span>
                    <span className="font-bold text-amber-900">$125,400</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-amber-700">Leads Qualified</span>
                    <span className="font-bold text-amber-900">342</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-amber-700">Content Generated</span>
                    <span className="font-bold text-amber-900">156 pieces</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-amber-700">Time Saved</span>
                    <span className="font-bold text-amber-900">847 hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-amber-700">ROI</span>
                    <span className="font-bold text-amber-900">340%</span>
                  </div>
                </div>
              </Card>

              <Card className="border-amber-200 bg-white/80 backdrop-blur p-6">
                <h2 className="text-lg font-bold text-amber-900 mb-4">
                  System Health
                </h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-amber-700">CPU Usage</span>
                      <span className="text-sm font-semibold text-amber-900">
                        34%
                      </span>
                    </div>
                    <div className="w-full bg-amber-100 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: "34%" }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-amber-700">Memory Usage</span>
                      <span className="text-sm font-semibold text-amber-900">
                        52%
                      </span>
                    </div>
                    <div className="w-full bg-amber-100 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{ width: "52%" }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-amber-700">Disk Usage</span>
                      <span className="text-sm font-semibold text-amber-900">
                        28%
                      </span>
                    </div>
                    <div className="w-full bg-amber-100 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: "28%" }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
