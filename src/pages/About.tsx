import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Activity,
  Target,
  Users,
  Globe,
  Shield,
  Bot,
  MapPin,
  Heart,
  Building2,
  CheckCircle,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const sdgTargets = [
  {
    target: "11.5",
    description: "Reduce deaths and economic losses from disasters",
    relevance: "UrbanPulse directly addresses this by providing real-time disaster alerts and preparedness tools.",
  },
  {
    target: "11.b",
    description: "Implement integrated disaster risk management",
    relevance: "Our platform enables coordinated response between citizens, government, and emergency services.",
  },
];

const stakeholders = [
  {
    icon: Users,
    title: "Citizens",
    role: "Report incidents, receive alerts, access preparedness guides, volunteer for donation centers",
    features: ["Real-time incident reporting", "Personalized alerts", "AI safety guidance"],
  },
  {
    icon: Building2,
    title: "Government Agencies",
    role: "Publish verified data, manage official alerts, coordinate disaster response",
    features: ["Official data publishing", "Analytics dashboards", "Donation management"],
  },
  {
    icon: Bot,
    title: "AI Systems",
    role: "Process data, provide guidance, predict risks based on multiple data sources",
    features: ["Natural language assistance", "Risk prediction", "Smart recommendations"],
  },
];

const coreValues = [
  {
    icon: Shield,
    title: "Safety First",
    description: "Every feature is designed with citizen safety as the primary concern.",
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "Empowering communities to look out for each other during emergencies.",
  },
  {
    icon: Globe,
    title: "Open & Transparent",
    description: "Clear communication with verified information from trusted sources.",
  },
  {
    icon: Heart,
    title: "Inclusive Access",
    description: "Free tools and resources available to all citizens regardless of background.",
  },
];

export default function About() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Supporting UN SDG 11</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Making Cities Safer,
              <span className="block text-glow bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                One Alert at a Time
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              UrbanPulse is a city-level digital command platform that helps urban residents 
              understand live disaster risks, report incidents, and receive AI-assisted guidance.
            </p>
          </motion.div>
        </div>
      </section>

      {/* SDG Alignment */}
      <section className="py-16 bg-card/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto"
          >
            <div className="flex items-center justify-center gap-4 mb-12">
              <div className="h-16 w-16 rounded-2xl bg-gradient-primary flex items-center justify-center">
                <Globe className="h-8 w-8 text-primary-foreground" />
              </div>
              <div className="text-left">
                <h2 className="text-2xl font-bold">SDG 11: Sustainable Cities</h2>
                <p className="text-muted-foreground">Target 11.5 & 11.b Alignment</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {sdgTargets.map((target, index) => (
                <motion.div
                  key={target.target}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary font-bold">
                          {target.target}
                        </span>
                        <CheckCircle className="h-5 w-5 text-safe" />
                      </div>
                      <h3 className="font-semibold mb-2">{target.description}</h3>
                      <p className="text-sm text-muted-foreground">{target.relevance}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stakeholders */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">Three-Way Collaboration</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              UrbanPulse connects citizens, government agencies, and AI systems for comprehensive disaster management.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {stakeholders.map((stakeholder, index) => (
              <motion.div
                key={stakeholder.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6 text-center">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-6">
                      <stakeholder.icon className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{stakeholder.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{stakeholder.role}</p>
                    <div className="space-y-2">
                      {stakeholder.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-safe shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-secondary/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Our Core Values</h2>
            <p className="text-muted-foreground">What drives us every day</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {coreValues.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 rounded-xl bg-card border border-border"
              >
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-gradient-to-br from-primary/10 to-transparent">
                <CardContent className="p-8">
                  <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center mb-6">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
                  <p className="text-muted-foreground">
                    A world where every urban resident has access to real-time disaster information 
                    and can contribute to community safety through a unified, intelligent platform.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-gradient-to-br from-accent/10 to-transparent">
                <CardContent className="p-8">
                  <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center mb-6">
                    <Heart className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                  <p className="text-muted-foreground">
                    To reduce disaster-related casualties and economic losses in urban areas by 
                    providing cutting-edge technology for risk awareness, incident reporting, and 
                    emergency response coordination.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-card/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl font-bold mb-4">Join the Movement</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Be part of the solution. Help make your city safer for everyone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto gap-2 bg-gradient-primary">
                  Get Started
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <a href="https://sdgs.un.org/goals/goal11" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2">
                  Learn About SDG 11
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </MainLayout>
  );
}
