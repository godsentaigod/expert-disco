import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Zap, Mail, MessageSquare, LogOut } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface Agent {
  id: string;
  name: string;
  status: "idle" | "working" | "completed";
  completed: number;
  failed: number;
  description: string;
}

interface Message {
  id: string;
  type: "user" | "agent";
  content: string;
  timestamp: Date;
  agent?: string;
}

const AGENTS: Agent[] = [
  {
    id: "trend-predictor",
    name: "Trend Predictor",
    status: "idle",
    completed: 12,
    failed: 0,
    description: "Monitors social media and identifies viral opportunities",
  },
  {
    id: "content-creator",
    name: "Content Creator",
    status: "idle",
    completed: 8,
    failed: 0,
    description: "Generates marketing materials and content",
  },
  {
    id: "sales-agent",
    name: "Sales Agent",
    status: "idle",
    completed: 15,
    failed: 1,
    description: "Handles lead generation and outreach",
  },
  {
    id: "operations",
    name: "Operations Agent",
    status: "idle",
    completed: 24,
    failed: 0,
    description: "Manages workflows and automation",
  },
  {
    id: "strategy",
    name: "Strategy Agent",
    status: "idle",
    completed: 6,
    failed: 0,
    description: "Provides business intelligence and planning",
  },
  {
    id: "advanced-coder",
    name: "Advanced Coder",
    status: "idle",
    completed: 18,
    failed: 2,
    description: "Maintains platform and configures models",
  },
  {
    id: "platform-architect",
    name: "Platform Architect",
    status: "idle",
    completed: 10,
    failed: 5,
    description: "Manages integrations and customizations",
  },
  {
    id: "management",
    name: "Management Agent",
    status: "idle",
    completed: 32,
    failed: 0,
    description: "Coordinates all specialized agents",
  },
];

export default function CommandCenterDashboard() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "agent",
      content:
        "Welcome to the Vibe Coding Command Center! I'm your Management Agent. I coordinate all specialized agents and handle your requests. You can communicate with me in natural English, and I'll route your commands to the appropriate agents.",
      timestamp: new Date(),
      agent: "Management Agent",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [agents, setAgents] = useState<Agent[]>(AGENTS);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Simulate agent response
    setTimeout(() => {
      const agentResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "agent",
        content: generateAgentResponse(inputValue),
        timestamp: new Date(),
        agent: "Management Agent",
      };
      setMessages((prev) => [...prev, agentResponse]);
    }, 500);
  };

  const generateAgentResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes("status")) {
      return `All agents are operational. Current status:\n- Trend Predictor: 12 completed, 0 failed\n- Content Creator: 8 completed, 0 failed\n- Sales Agent: 15 completed, 1 failed\n- Operations: 24 completed, 0 failed\n- Strategy: 6 completed, 0 failed\n- Advanced Coder: 18 completed, 2 failed\n- Platform Architect: 10 completed, 5 failed`;
    } else if (lowerInput.includes("email")) {
      return `Email Integration Status:\n✓ Proton email forwarding configured\n✓ Ready to receive verification codes\n✓ Latest emails: Awaiting your Proton email details\n\nTo activate: Please provide your Proton email address for agent forwarding.`;
    } else if (lowerInput.includes("sms") || lowerInput.includes("text")) {
      return `SMS Integration Status:\n✓ Phone forwarding module ready\n✓ Supports: Twitter, LinkedIn, Reddit, ProductHunt, Indie Hackers\n✓ Latest SMS: Awaiting your phone number\n\nTo activate: Please provide your phone number for SMS forwarding.`;
    } else if (lowerInput.includes("create account") || lowerInput.includes("social")) {
      return `Account Creation Ready:\n✓ Autonomous account creator deployed\n✓ Platforms: Twitter, LinkedIn, Reddit, ProductHunt, Indie Hackers\n✓ Status: Awaiting email and phone details\n\nOnce you provide email/phone, I can create accounts on all 5 platforms simultaneously.`;
    } else if (lowerInput.includes("sales") || lowerInput.includes("blitz")) {
      return `24-Hour Sales Blitz Campaign Ready:\n✓ Campaign executor deployed\n✓ Generates: 20 posts (4 per platform)\n✓ Email sequences: 4-email nurture\n✓ Revenue projection: $26k-$158k\n\nReady to launch when you give the command!`;
    } else {
      return `Command received and processed. I'm routing your request to the appropriate agents. What specific task would you like me to help with?\n\nTry asking about:\n- Agent status\n- Email integration\n- SMS integration\n- Account creation\n- Sales campaign\n- Workflow automation`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Command Center
            </h1>
            <p className="text-slate-300">
              Natural language interface for AI agents
            </p>
          </div>
          <Button
            onClick={() => {
              const loginUrl = new URL(window.location.href);
              loginUrl.pathname = "/api/oauth/login";
              loginUrl.searchParams.set("returnTo", window.location.pathname);
              window.location.href = loginUrl.toString();
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Login
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chat Area */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col bg-slate-800 border-slate-700">
              <CardHeader className="border-b border-slate-700">
                <CardTitle className="text-white">Chat with Agents</CardTitle>
              </CardHeader>

              <ScrollArea
                ref={scrollRef}
                className="flex-1 p-4 overflow-hidden"
              >
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.type === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                          msg.type === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-slate-700 text-slate-100"
                        }`}
                      >
                        {msg.type === "agent" && msg.agent && (
                          <p className="text-xs font-semibold text-slate-300 mb-1">
                            {msg.agent}
                          </p>
                        )}
                        <p className="text-sm whitespace-pre-wrap">
                          {msg.content}
                        </p>
                        <p className="text-xs mt-2 opacity-70">
                          {msg.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="border-t border-slate-700 p-4">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Tell me what you need... (e.g., 'Check agent status', 'Show email codes', 'Create accounts')"
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </Card>
          </div>

          {/* Agent Status Panel */}
          <div className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-400" />
                  Agent Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {agents.map((agent) => (
                  <div
                    key={agent.id}
                    className="p-3 bg-slate-700 rounded-lg border border-slate-600"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-white text-sm">
                        {agent.name}
                      </p>
                      <Badge
                        className={
                          agent.status === "idle"
                            ? "bg-green-600"
                            : "bg-yellow-600"
                        }
                      >
                        {agent.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">
                      {agent.description}
                    </p>
                    <div className="flex gap-2 text-xs">
                      <span className="text-green-400">
                        ✓ {agent.completed} completed
                      </span>
                      {agent.failed > 0 && (
                        <span className="text-red-400">
                          ✗ {agent.failed} failed
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Integration Status */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-400" />
                  Integrations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-slate-700 rounded-lg border border-slate-600">
                  <p className="font-semibold text-white text-sm mb-1">
                    Email Forwarding
                  </p>
                  <p className="text-xs text-slate-400 mb-2">
                    Proton email forwarding for verification codes
                  </p>
                  <Badge className="bg-yellow-600 text-xs">
                    Awaiting Details
                  </Badge>
                </div>

                <div className="p-3 bg-slate-700 rounded-lg border border-slate-600">
                  <p className="font-semibold text-white text-sm mb-1 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    SMS Forwarding
                  </p>
                  <p className="text-xs text-slate-400 mb-2">
                    Phone forwarding for SMS verification codes
                  </p>
                  <Badge className="bg-yellow-600 text-xs">
                    Awaiting Details
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Commands */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">
                  Quick Commands
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  "Check agent status",
                  "Show email integration",
                  "Show SMS integration",
                  "Create social accounts",
                  "Launch sales blitz",
                ].map((cmd) => (
                  <Button
                    key={cmd}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600"
                    onClick={() => {
                      setInputValue(cmd);
                      setTimeout(() => {
                        const form = document.querySelector(
                          "form"
                        ) as HTMLFormElement;
                        form?.dispatchEvent(
                          new Event("submit", { bubbles: true })
                        );
                      }, 0);
                    }}
                  >
                    {cmd}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
