import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  Sparkles,
  Shield,
  MapPin,
  Cloud,
  AlertTriangle,
  Phone,
  Send,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAIChat } from "@/hooks/useAIChat";

const emergencyContacts = [
  { name: "Emergency Services", number: "119", available: "24/7" },
  { name: "Disaster Management", number: "117", available: "24/7" },
  { name: "Police", number: "118", available: "24/7" },
  { name: "Ambulance", number: "110", available: "24/7" },
];

const features = [
  {
    icon: Shield,
    title: "Safety Assessments",
    description: "Get real-time safety info for your area",
  },
  {
    icon: Cloud,
    title: "Weather Guidance",
    description: "Prepare for severe weather events",
  },
  {
    icon: AlertTriangle,
    title: "Emergency Response",
    description: "Step-by-step disaster response help",
  },
  {
    icon: MapPin,
    title: "Local Alerts",
    description: "Stay informed about nearby incidents",
  },
];

const quickPrompts = [
  "Is it safe to travel right now?",
  "What should I do during a flood?",
  "How do I prepare for heavy rain?",
  "What are the emergency numbers?",
];

export default function AIAssistant() {
  const [input, setInput] = useState("");
  const { messages, isLoading, error, sendMessage, clearMessages } = useAIChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Hide any external chat widgets (Chatbase, etc.)
  useEffect(() => {
    const style = document.createElement("style");
    style.id = "hide-external-widgets";
    style.textContent = `
      iframe[src*="chatbase"], 
      div[id*="chatbase"], 
      button[id*="chatbase"],
      .chatbase-widget,
      [data-chatbase] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      const existingStyle = document.getElementById("hide-external-widgets");
      if (existingStyle) existingStyle.remove();
    };
  }, []);

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput("");
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  return (
    <MainLayout showFooter={false}>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="border-b border-border bg-card/50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                  <Bot className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold flex items-center gap-2">
                    AI Safety Assistant
                    <Sparkles className="h-5 w-5 text-accent" />
                  </h1>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <span className="h-2 w-2 bg-safe rounded-full animate-pulse" />
                    Online • Ready to help
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={clearMessages}>
                <RotateCcw className="h-4 w-4 mr-2" />
                New Chat
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 container mx-auto px-4 py-6 flex flex-col">
          <div className="grid lg:grid-cols-4 gap-6 flex-1">
            {/* Main Chat Area */}
            <div className="lg:col-span-3 flex flex-col">
              <Card className="flex-1 flex flex-col overflow-hidden min-h-[500px]">
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.length === 1 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-8"
                      >
                        <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-primary flex items-center justify-center mb-4">
                          <Bot className="h-8 w-8 text-primary-foreground" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">AI Safety Assistant</h2>
                        <p className="text-muted-foreground max-w-md mx-auto mb-6">
                          Ask about safety, emergencies, preparedness, or local alerts.
                        </p>
                        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                          {features.map((feature, index) => (
                            <div
                              key={index}
                              className="p-3 rounded-lg bg-secondary/50 text-left"
                            >
                              <feature.icon className="h-5 w-5 text-primary mb-2" />
                              <p className="text-sm font-medium">{feature.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {feature.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {messages.map((message, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground rounded-br-md"
                              : "bg-secondary text-foreground rounded-bl-md"
                          }`}
                        >
                          {message.content}
                        </div>
                      </motion.div>
                    ))}

                    {isLoading && messages[messages.length - 1]?.role === "user" && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                      >
                        <div className="bg-secondary text-foreground rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Thinking...</span>
                        </div>
                      </motion.div>
                    )}

                    {error && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center text-sm text-danger py-2"
                      >
                        {error}
                      </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Quick Prompts */}
                <div className="px-4 py-2 flex gap-2 overflow-x-auto border-t border-border">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleQuickPrompt(prompt)}
                      disabled={isLoading}
                      className="px-3 py-1.5 text-xs bg-secondary hover:bg-secondary/80 rounded-full whitespace-nowrap transition-colors disabled:opacity-50"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                      placeholder="Ask about safety, emergencies, or preparedness..."
                      className="flex-1 bg-secondary border-none"
                      disabled={isLoading}
                    />
                    <Button size="icon" onClick={handleSend} disabled={isLoading || !input.trim()}>
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="flex flex-col gap-4">
              {/* Quick Tips */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-accent" />
                    Try Asking
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {quickPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickPrompt(prompt)}
                      disabled={isLoading}
                      className="w-full p-3 rounded-lg bg-secondary/50 text-left hover:bg-secondary/80 transition-colors disabled:opacity-50"
                    >
                      <p className="text-sm">{prompt}</p>
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* Emergency Contacts */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Phone className="h-4 w-4 text-danger" />
                    Emergency Contacts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {emergencyContacts.map((contact, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 rounded-lg bg-secondary/50"
                    >
                      <div>
                        <p className="text-sm font-medium">{contact.name}</p>
                        <p className="text-xs text-muted-foreground">{contact.available}</p>
                      </div>
                      <a
                        href={`tel:${contact.number}`}
                        className="text-lg font-bold text-primary hover:underline"
                      >
                        {contact.number}
                      </a>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
