/**
 * Agent Command Center - Natural language chat interface for communicating with agents
 */

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, Zap, BarChart3, Users, Settings } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "agent";
  agentRole?: string;
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface AgentStatus {
  role: string;
  status: "idle" | "working" | "waiting" | "error" | "offline";
  lastActive: Date;
  tasksCompleted: number;
  tasksFailed: number;
}

export default function AgentCommandCenter() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      role: "assistant",
      content:
        "Welcome to the Vibe Coding Command Center! I'm your Management Agent. I coordinate all specialized agents and handle your requests. You can communicate with me in natural English, and I'll route your commands to the appropriate agents.\n\n**Available Agents:**\n- **Trend Predictor**: Monitors social media and identifies viral opportunities\n- **Content Creator**: Generates marketing materials and content\n- **Sales Agent**: Handles lead generation and outreach\n- **Operations Agent**: Manages workflows and automation\n- **Strategy Agent**: Provides business intelligence and planning\n- **Advanced Coder**: Maintains platform and configures models\n- **Platform Architect**: Manages integrations and customizations\n\n**Try saying things like:**\n- \"Generate a blog post about AI automation\"\n- \"What are the current trends?\"\n- \"Identify high-quality leads\"\n- \"Optimize our sales pipeline\"\n- \"Create a new automation workflow\"",
      timestamp: new Date(),
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>([
    {
      role: "trend-predictor",
      status: "idle",
      lastActive: new Date(),
      tasksCompleted: 12,
      tasksFailed: 0,
    },
    {
      role: "content-creator",
      status: "idle",
      lastActive: new Date(),
      tasksCompleted: 8,
      tasksFailed: 0,
    },
    {
      role: "sales",
      status: "idle",
      lastActive: new Date(),
      tasksCompleted: 15,
      tasksFailed: 1,
    },
    {
      role: "operations",
      status: "idle",
      lastActive: new Date(),
      tasksCompleted: 24,
      tasksFailed: 0,
    },
    {
      role: "strategy",
      status: "idle",
      lastActive: new Date(),
      tasksCompleted: 6,
      tasksFailed: 0,
    },
    {
      role: "advanced-coder",
      status: "idle",
      lastActive: new Date(),
      tasksCompleted: 18,
      tasksFailed: 2,
    },
    {
      role: "platform-architect",
      status: "idle",
      lastActive: new Date(),
      tasksCompleted: 10,
      tasksFailed: 0,
    },
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Simulate agent processing
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Determine which agent to route to based on keywords
      let agentRole = "management";
      let responseContent = "";

      if (
        input.toLowerCase().includes("trend") ||
        input.toLowerCase().includes("viral")
      ) {
        agentRole = "trend-predictor";
        responseContent = `**Trend Predictor Report:**\n\nI've analyzed current social media trends and identified several high-potential opportunities:\n\n- **AI Automation** (Virality Score: 0.85) - Trending across Twitter, TikTok, and LinkedIn\n- **Digital Products** (Virality Score: 0.78) - Growing interest in product-based businesses\n- **No-Code Tools** (Virality Score: 0.72) - Increasing adoption of low-code platforms\n\nRecommendation: Create content around AI automation to capture the trending wave.`;
      } else if (
        input.toLowerCase().includes("blog") ||
        input.toLowerCase().includes("content") ||
        input.toLowerCase().includes("post")
      ) {
        agentRole = "content-creator";
        responseContent = `**Content Creator Report:**\n\nI've generated the following content pieces:\n\n**Blog Post:** "AI Automation: Complete Guide for 2026"\n- 2,500 words\n- SEO optimized\n- Includes case studies and best practices\n\n**Social Media Posts:** 5 posts optimized for different platforms\n- Twitter: Focus on quick tips\n- LinkedIn: Professional insights\n- TikTok: Short-form educational content\n\n**Email Campaign:** "Transform Your Workflow with AI"\n- 3-email sequence\n- Personalized for different audience segments\n- Conversion-optimized CTAs`;
      } else if (
        input.toLowerCase().includes("lead") ||
        input.toLowerCase().includes("sales") ||
        input.toLowerCase().includes("prospect")
      ) {
        agentRole = "sales";
        responseContent = `**Sales Agent Report:**\n\nLead Identification & Qualification:\n- Identified 47 high-quality leads\n- 12 leads with qualification score > 0.85\n- Generated personalized outreach for top 5 leads\n\nPipeline Status:\n- Total Leads: 127\n- Conversion Rate: 8.2%\n- Average Deal Size: $12,500\n- Expected Monthly Revenue: $52,000\n\nNext Steps: Initiating outreach sequence for qualified leads.`;
      } else if (
        input.toLowerCase().includes("workflow") ||
        input.toLowerCase().includes("automate") ||
        input.toLowerCase().includes("process")
      ) {
        agentRole = "operations";
        responseContent = `**Operations Agent Report:**\n\nWorkflow Automation Summary:\n- Created "Content Publishing Pipeline" workflow\n- Automated 5 key steps\n- Estimated time savings: 15 hours/week\n\nCurrent Automations:\n- Content creation → Review → Scheduling\n- Lead qualification → Scoring → Routing\n- Customer onboarding → Email sequence → Follow-up\n\nPerformance Metrics:\n- Tasks Automated: 42\n- Time Saved This Week: 18 hours\n- Efficiency Improvement: 73%`;
      } else if (
        input.toLowerCase().includes("market") ||
        input.toLowerCase().includes("strategy") ||
        input.toLowerCase().includes("competitor")
      ) {
        agentRole = "strategy";
        responseContent = `**Strategy Agent Report:**\n\nMarket Analysis:\n- Market Size: $2.5B\n- Growth Rate: 24% YoY\n- Top Opportunities: Enterprise automation ($1.2B market)\n\nCompetitive Landscape:\n- 3 major competitors identified\n- Our competitive advantages: Superior AI, Better customization, Lower pricing\n- Market share opportunity: 8-12% within 18 months\n\nStrategic Recommendations:\n1. Accelerate product innovation\n2. Expand enterprise sales efforts\n3. Build strategic partnerships\n4. Invest in customer success`;
      } else if (
        input.toLowerCase().includes("model") ||
        input.toLowerCase().includes("code") ||
        input.toLowerCase().includes("update")
      ) {
        agentRole = "advanced-coder";
        responseContent = `**Advanced Coder Report:**\n\nPlatform Maintenance:\n- Deployed v2.1.0 with performance improvements\n- Fixed 4 critical bugs\n- Test coverage: 92%\n\nModel Configuration:\n- Configured 3 AI models (text-generation, classification, analytics)\n- Performance optimization: 67% latency reduction\n- Model accuracy: 94.2%\n\nDependency Updates:\n- 12 outdated packages identified\n- All updates low-risk\n- Security vulnerabilities: 0`;
      } else if (
        input.toLowerCase().includes("integration") ||
        input.toLowerCase().includes("form") ||
        input.toLowerCase().includes("customize")
      ) {
        agentRole = "platform-architect";
        responseContent = `**Platform Architect Report:**\n\nIntegrations Configured:\n- Stripe (Payments)\n- SendGrid (Email)\n- Slack (Notifications)\n- Twitter (Social Media)\n- HuggingFace (AI Models)\n\nCustomizations Created:\n- Custom sales dashboard\n- Lead qualification workflow\n- Email campaign automation\n\nForms Created:\n- Customer feedback form\n- Product survey\n- Lead qualification form\n\nSystem Architecture:\n- Current capacity: 10K concurrent users\n- Scalability: Horizontal scaling ready\n- Uptime: 99.9%`;
      } else {
        responseContent = `I understand you're asking about: "${input}"\n\nI can help you with:\n- **Trends & Opportunities**: Ask me about current market trends or viral opportunities\n- **Content Creation**: Request blog posts, social media content, or email campaigns\n- **Sales & Leads**: Get help with lead generation and sales pipeline management\n- **Automation**: Create and manage business workflows\n- **Strategy**: Get market analysis and business intelligence\n- **Technical**: Request platform updates or model configuration\n- **Integrations**: Set up new integrations or customize the platform\n\nWhich area would you like to focus on?`;
      }

      // Simulate agent status update
      setAgentStatuses((prev) =>
        prev.map((agent) => {
          if (agent.role === agentRole) {
            return {
              ...agent,
              status: "idle",
              lastActive: new Date(),
              tasksCompleted: agent.tasksCompleted + 1,
            };
          }
          return agent;
        })
      );

      const agentMessage: ChatMessage = {
        id: `msg-${Date.now()}-response`,
        role: "agent",
        agentRole,
        content: responseContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, agentMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "idle":
        return "bg-green-100 text-green-800";
      case "working":
        return "bg-blue-100 text-blue-800";
      case "waiting":
        return "bg-yellow-100 text-yellow-800";
      case "error":
        return "bg-red-100 text-red-800";
      case "offline":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-rose-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-amber-900 mb-2">
            Vibe Coding Command Center
          </h1>
          <p className="text-amber-700">
            Autonomous AI workforce orchestration platform
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chat Area */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col border-amber-200 bg-white/80 backdrop-blur">
              {/* Messages */}
              <ScrollArea className="flex-1 p-6 border-b border-amber-100">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-md px-4 py-3 rounded-lg ${
                          message.role === "user"
                            ? "bg-amber-600 text-white rounded-br-none"
                            : "bg-amber-100 text-amber-900 rounded-bl-none"
                        }`}
                      >
                        {message.agentRole && message.role === "agent" && (
                          <p className="text-xs font-semibold mb-1 opacity-70">
                            {message.agentRole.replace("-", " ").toUpperCase()}
                          </p>
                        )}
                        <Streamdown>{message.content}</Streamdown>
                        <p className="text-xs opacity-50 mt-2">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-amber-100 text-amber-900 px-4 py-3 rounded-lg rounded-bl-none flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing your request...</span>
                      </div>
                    </div>
                  )}
                  <div ref={scrollRef} />
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="p-4 border-t border-amber-100">
                <div className="flex gap-2">
                  <Input
                    placeholder="Describe what you need... (e.g., 'Generate a blog post about AI')"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !isLoading) {
                        handleSendMessage();
                      }
                    }}
                    disabled={isLoading}
                    className="border-amber-200 focus:border-amber-600"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isLoading || !input.trim()}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Agent Status Sidebar */}
          <div className="space-y-4">
            <Card className="border-amber-200 bg-white/80 backdrop-blur p-4">
              <h2 className="font-bold text-amber-900 mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Agent Status
              </h2>
              <div className="space-y-3">
                {agentStatuses.map((agent) => (
                  <div
                    key={agent.role}
                    className="p-3 bg-amber-50 rounded-lg border border-amber-100"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-amber-900 capitalize">
                        {agent.role.replace("-", " ")}
                      </span>
                      <Badge className={getStatusColor(agent.status)}>
                        {agent.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-amber-700 space-y-1">
                      <p>Tasks: {agent.tasksCompleted}</p>
                      <p>Errors: {agent.tasksFailed}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="border-amber-200 bg-white/80 backdrop-blur p-4">
              <h2 className="font-bold text-amber-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Quick Actions
              </h2>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start border-amber-200 text-amber-900 hover:bg-amber-50"
                  onClick={() => setInput("What are the current trends?")}
                >
                  📊 View Trends
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-amber-200 text-amber-900 hover:bg-amber-50"
                  onClick={() => setInput("Generate a blog post")}
                >
                  ✍️ Create Content
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-amber-200 text-amber-900 hover:bg-amber-50"
                  onClick={() => setInput("Identify leads")}
                >
                  👥 Find Leads
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-amber-200 text-amber-900 hover:bg-amber-50"
                  onClick={() => setInput("Create automation")}
                >
                  ⚙️ Automate
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
