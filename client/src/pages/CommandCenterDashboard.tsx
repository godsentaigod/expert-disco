/**
 * Command Center Dashboard - Real-time monitoring and management
 */

import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
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
  const [, setLocation] = useLocation();
  const { data: user, isLoading: userLoading } = trpc.auth.me.useQuery();
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);

  // Redirect non-admin users
  if (!userLoading && user?.role !== "admin") {
    setLocation("/");
    return null;
  }

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

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
      name: "Customer Onboarding",
      status: "completed",
      progress: 100,
      tasks: 8,
    },
  ];

  const taskData = [
    { name: "Mon", completed: 45, pending: 12, failed: 2 },
    { name: "Tue", completed: 52, pending: 8, failed: 1 },
    { name: "Wed", completed: 48, pending: 15, failed: 3 },
    { name: "Thu", completed: 61, pending: 10, failed: 0 },
    { name: "Fri", completed: 55, pending: 20, failed: 2 },
    { name: "Sat", completed: 38, pending: 5, failed: 1 },
    { name: "Sun", completed: 42, pending: 8, failed: 2 },
  ];

  const agentStatus = [
    { name: "Management", value: 1, fill: "#8b5cf6" },
    { name: "Trend Predictor", value: 1, fill: "#06b6d4" },
    { name: "Content Creator", value: 1, fill: "#ec4899" },
    { name: "Sales", value: 1, fill: "#f59e0b" },
    { name: "Operations", value: 1, fill: "#10b981" },
    { name: "Strategy", value: 1, fill: "#3b82f6" },
    { name: "Advanced Coder", value: 1, fill: "#6366f1" },
    { name: "Platform Architect", value: 1, fill: "#14b8a6" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-40">
        <div className="container py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Command Center</h1>
            <p className="text-muted-foreground mt-1">Real-time AI agent monitoring and management</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metricCards.map((card, idx) => (
            <Card key={idx} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${card.color}`}>{card.icon}</div>
              </div>
              <h3 className="text-sm font-medium text-muted-foreground">{card.title}</h3>
              <p className="text-2xl font-bold text-foreground mt-2">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-2">{card.change}</p>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Task Performance</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={taskData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="pending" stroke="#f59e0b" strokeWidth={2} />
                    <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Agent Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={agentStatus} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                      {agentStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </TabsContent>

          {/* Workflows Tab */}
          <TabsContent value="workflows" className="space-y-4">
            {workflows.map((workflow) => (
              <Card key={workflow.id} className="p-6 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedWorkflow(workflow.id)}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div>
                      <h3 className="font-semibold text-foreground">{workflow.name}</h3>
                      <p className="text-sm text-muted-foreground">{workflow.tasks} tasks</p>
                    </div>
                  </div>
                  <Badge variant={workflow.status === "active" ? "default" : workflow.status === "completed" ? "secondary" : "outline"}>
                    {workflow.status}
                  </Badge>
                </div>
                <div className="w-full bg-secondary/20 rounded-full h-2">
                  <div className="bg-secondary h-2 rounded-full transition-all" style={{ width: `${workflow.progress}%` }}></div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{workflow.progress}% complete</p>
              </Card>
            ))}
          </TabsContent>

          {/* Agents Tab */}
          <TabsContent value="agents" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agentStatus.map((agent) => (
                <Card key={agent.name} className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: agent.fill }}></div>
                    <h3 className="font-semibold text-foreground">{agent.name}</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant="outline">Active</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tasks Today:</span>
                      <span className="font-medium">42</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Success Rate:</span>
                      <span className="font-medium text-green-600">98.5%</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Weekly Task Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={taskData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" fill="#10b981" />
                  <Bar dataKey="pending" fill="#f59e0b" />
                  <Bar dataKey="failed" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
