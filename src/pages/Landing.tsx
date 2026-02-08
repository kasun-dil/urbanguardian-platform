import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Activity, 
  Shield, 
  MapPin, 
  Bot, 
  AlertTriangle,
  CloudRain,
  Wind,
  Thermometer,
  ArrowRight,
  CheckCircle,
  Users,
  Globe,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/MainLayout";
import { RiskBadgePill } from "@/components/ui/RiskBadge";

const features = [
  {
    icon: MapPin,
    title: "Real-Time City Dashboard",
    description: "Monitor live weather, air quality, flood risks, and active alerts for your city.",
  },
  {
    icon: AlertTriangle,
    title: "Incident Reporting",
    description: "Report and track incidents like flooding, blocked roads, and hazards in real-time.",
  },
  {
    icon: Shield,
    title: "Government Verified Data",
    description: "Access official disaster preparedness guides and verified emergency information.",
  },
  {
    icon: Bot,
    title: "AI Safety Assistant",
    description: "Get instant AI-powered guidance during emergencies and safety questions.",
  },
];

const trustPillars = [
  {
    icon: Shield,
    title: "Government Verified",
    description: "Official data from emergency services and local authorities",
  },
  {
    icon: Globe,
    title: "Community Powered",
    description: "Real-time reports from citizens keeping neighborhoods safe",
  },
  {
    icon: Bot,
    title: "AI-Assisted",
    description: "Intelligent guidance and risk prediction when you need it most",
  },
  {
    icon: Zap,
    title: "Always Available",
    description: "Round-the-clock monitoring and instant emergency alerts",
  },
];

// Mock live risk data
const liveRiskData = {
  weather: { value: "Moderate", risk: "moderate" as const },
  airQuality: { value: "Good", risk: "safe" as const },
  floodRisk: { value: "Low", risk: "low" as const },
  activeAlerts: { value: 2, risk: "warning" as const },
};

export default function Landing() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 animated-gradient" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-grid-pattern bg-[size:50px_50px]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
            >
              <span className="h-2 w-2 bg-accent rounded-full pulse-live" />
              <span className="text-sm font-medium">Live Monitoring Active</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
            >
              Real-Time Urban
              <span className="block text-glow bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Risk Awareness
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              UrbanPulse helps urban residents understand live disaster risks, 
              report incidents, and receive AI-assisted guidance during emergencies.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            >
              <Link to="/dashboard">
                <Button size="lg" className="w-full sm:w-auto gap-2 bg-gradient-primary hover:opacity-90 text-lg px-8">
                  Open Dashboard
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8">
                  Learn More
                </Button>
              </Link>
            </motion.div>

            {/* Live Risk Snapshot */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="max-w-3xl mx-auto"
            >
              <div className="p-1 rounded-2xl bg-gradient-to-r from-primary/50 via-accent/50 to-primary/50">
                <div className="bg-card rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Activity className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Live City Risk Snapshot</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="h-2 w-2 bg-safe rounded-full pulse-live" />
                      Updated just now
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 rounded-lg bg-secondary/50">
                      <CloudRain className="h-8 w-8 mx-auto mb-2 text-warning" />
                      <p className="text-sm text-muted-foreground mb-1">Weather</p>
                      <RiskBadgePill level="moderate" />
                    </div>
                    <div className="text-center p-4 rounded-lg bg-secondary/50">
                      <Wind className="h-8 w-8 mx-auto mb-2 text-safe" />
                      <p className="text-sm text-muted-foreground mb-1">Air Quality</p>
                      <RiskBadgePill level="safe" />
                    </div>
                    <div className="text-center p-4 rounded-lg bg-secondary/50">
                      <Thermometer className="h-8 w-8 mx-auto mb-2 text-safe" />
                      <p className="text-sm text-muted-foreground mb-1">Flood Risk</p>
                      <RiskBadgePill level="low" />
                    </div>
                    <div className="text-center p-4 rounded-lg bg-secondary/50">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-warning" />
                      <p className="text-sm text-muted-foreground mb-1">Active Alerts</p>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-warning/20 text-warning">
                        2 Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Pillars Section */}
      <section className="py-16 border-y border-border bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustPillars.map((pillar, index) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-card/50 border border-border"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <pillar.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{pillar.title}</h3>
                  <p className="text-sm text-muted-foreground">{pillar.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Comprehensive Disaster Preparedness
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to stay informed and safe during urban emergencies.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 data-card"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-secondary/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How UrbanPulse Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A unified platform connecting citizens, government, and AI for safer cities.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: Users,
                title: "Citizens Report",
                description: "Report incidents in real-time through our mobile-friendly interface.",
              },
              {
                icon: Globe,
                title: "Data Aggregation",
                description: "We combine citizen reports with official data and live API feeds.",
              },
              {
                icon: Zap,
                title: "Instant Alerts",
                description: "Receive AI-powered alerts and guidance based on your location.",
              },
            ].map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="h-16 w-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-6 shadow-glow">
                  <step.icon className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-primary/20 via-card to-accent/10 border border-primary/20"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Stay Safe. Stay Informed.
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of citizens using UrbanPulse to monitor risks and prepare for emergencies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto gap-2 bg-gradient-primary hover:opacity-90">
                  Get Started Free
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  View Live Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </MainLayout>
  );
}
