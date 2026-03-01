/**
 * Agent Command Center - Natural language chat interface for communicating with agents
 */

import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
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
  const [, setLocation] = useLocation();
  const { data: user, isLoading: userLoading } = trpc.auth.me.useQuery();

  // Initialize state hooks BEFORE any conditional returns
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

  // Auth check removed - Command Center is now accessible to all users

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
        input.toLowerCase().includes("automate")
      ) {
        agentRole = "operations";
        responseContent = `**Operations Agent Report:**\n\nWorkflow Automation Status:\n- Created 3 new automation workflows\n- Estimated time savings: 25 hours/week\n- Automation coverage: 78% of routine tasks\n\nActive Workflows:\n1. Content Publishing Pipeline - 65% complete\n2. Lead Qualification - 42% complete\n3. Customer Onboarding - 100% complete\n\nNext: Implementing advanced error handling and notifications.`;
      } else {
        responseContent = `**Management Agent Response:**\n\nI've processed your request. Here's what I can help you with:\n\n✓ Generate content and marketing materials\n✓ Analyze trends and market opportunities\n✓ Identify and qualify sales leads\n✓ Automate business workflows\n✓ Provide strategic business insights\n✓ Maintain and optimize the platform\n✓ Manage integrations and customizations\n\nPlease specify what you'd like me to do, and I'll route it to the appropriate agent.`;
      }

      const agentMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: "agent",
        agentRole,
        content: responseContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, agentMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-40">
        <div className="container py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Command Center</h1>
            <p className="text-sm text-muted-foreground">Natural language interface for AI agents</p>
          </div>
          <div className="flex items-center gap-2">
            {agentStatuses.slice(0, 3).map((agent) => (
              <Badge key={agent.role} variant="outline" className="text-xs">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                {agent.role}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 overflow-hidden flex">
        {/* Chat Messages */}
        <div className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-4 max-w-3xl mx-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xl px-4 py-3 rounded-lg ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border text-foreground"
                    }`}
                  >
                    {message.agentRole && (
                      <div className="text-xs font-semibold mb-2 opacity-75">
                        {message.agentRole.toUpperCase()}
                      </div>
                    )}
                    <Streamdown>{message.content}</Streamdown>
                    <div className="text-xs opacity-50 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-card border border-border text-foreground px-4 py-3 rounded-lg">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-border bg-card p-6">
            <div className="max-w-3xl mx-auto flex gap-2">
              <Input
                placeholder="Tell me what you need... (e.g., 'Generate a blog post', 'Identify leads', 'What are the trends?')"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                size="lg"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Agent Status Sidebar */}
        <div className="w-80 border-l border-border bg-card/50 p-6 overflow-y-auto hidden lg:block">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Agent Status
          </h3>
          <div className="space-y-3">
            {agentStatuses.map((agent) => (
              <Card key={agent.role} className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground capitalize">
                    {agent.role.replace("-", " ")}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-xs"
                  >
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                    {agent.status}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>Completed: {agent.tasksCompleted}</div>
                  <div>Failed: {agent.tasksFailed}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
