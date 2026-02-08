import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  Menu, 
  X, 
  MapPin, 
  Shield, 
  Bot, 
  Info,
  LogIn,
  LogOut,
  LayoutDashboard,
  User,
  KeyRound,
  Heart,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useSuperAdmin } from "@/hooks/useSuperAdmin";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const navLinks = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/incidents", label: "Incidents", icon: MapPin },
  { path: "/government-hub", label: "Gov Hub", icon: Shield },
  { path: "/ai-assistant", label: "AI Assistant", icon: Bot },
  { path: "/donation-centers", label: "Donations", icon: Heart },
  { path: "/about", label: "About", icon: Info },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, role, signOut } = useAuth();
  const { isSuperAdmin } = useSuperAdmin();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsUpdating(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setIsUpdating(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully");
      setShowPasswordDialog(false);
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass safe-top">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative">
                <Activity className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-accent rounded-full pulse-live" />
              </div>
              <span className="font-bold text-xl tracking-tight">
                Urban<span className="text-primary">Pulse</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      isActive 
                        ? "bg-primary/10 text-primary" 
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    )}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Auth Buttons / Profile */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <span className="max-w-[100px] truncate">{profile?.full_name || "User"}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span>{profile?.full_name}</span>
                        <span className="text-xs text-muted-foreground capitalize">{role || "citizen"}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {isSuperAdmin ? (
                      <DropdownMenuItem onClick={() => navigate("/admin")}>
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </DropdownMenuItem>
                    ) : (
                      <>
                        {role === "government" && (
                          <DropdownMenuItem onClick={() => navigate("/government-dashboard")}>
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            Government Dashboard
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => navigate("/profile")}>
                          <User className="mr-2 h-4 w-4" />
                          My Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setShowPasswordDialog(true)}>
                          <KeyRound className="mr-2 h-4 w-4" />
                          Change Password
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <LogIn className="h-4 w-4" />
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm" className="gap-2 bg-gradient-primary hover:opacity-90">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden glass border-t border-border"
            >
              <div className="container mx-auto px-4 py-4 space-y-2">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                        isActive 
                          ? "bg-primary/10 text-primary" 
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                      )}
                    >
                      <link.icon className="h-5 w-5" />
                      {link.label}
                    </Link>
                  );
                })}
                <div className="pt-4 border-t border-border space-y-2">
                  {user ? (
                    <>
                      <div className="px-4 py-2 text-sm">
                        <p className="font-medium">{profile?.full_name}</p>
                        <p className="text-muted-foreground capitalize">{role || "citizen"}</p>
                      </div>
                      {isSuperAdmin ? (
                        <Button 
                          variant="outline" 
                          className="w-full justify-start gap-2"
                          onClick={() => {
                            setIsOpen(false);
                            navigate("/admin");
                          }}
                        >
                          <ShieldCheck className="h-4 w-4" />
                          Admin Dashboard
                        </Button>
                      ) : (
                        <>
                          {role === "government" && (
                            <Button 
                              variant="outline" 
                              className="w-full justify-start gap-2"
                              onClick={() => {
                                setIsOpen(false);
                                navigate("/government-dashboard");
                              }}
                            >
                              <LayoutDashboard className="h-4 w-4" />
                              Government Dashboard
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            className="w-full justify-start gap-2"
                            onClick={() => {
                              setIsOpen(false);
                              navigate("/profile");
                            }}
                          >
                            <User className="h-4 w-4" />
                            My Profile
                          </Button>
                          <Button 
                            variant="outline" 
                            className="w-full justify-start gap-2"
                            onClick={() => {
                              setIsOpen(false);
                              setShowPasswordDialog(true);
                            }}
                          >
                            <KeyRound className="h-4 w-4" />
                            Change Password
                          </Button>
                        </>
                      )}
                      <Button 
                        variant="destructive" 
                        className="w-full justify-start gap-2"
                        onClick={() => {
                          setIsOpen(false);
                          handleSignOut();
                        }}
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full justify-start gap-2">
                          <LogIn className="h-4 w-4" />
                          Sign In
                        </Button>
                      </Link>
                      <Link to="/register" onClick={() => setIsOpen(false)}>
                        <Button className="w-full bg-gradient-primary">
                          Get Started
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your new password below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handlePasswordChange} disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
