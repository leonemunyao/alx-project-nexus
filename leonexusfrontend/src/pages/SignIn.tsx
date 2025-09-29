import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { authUtils } from "@/services/api";
import Header from "@/components/Header";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { login, isLoading, user } = useAuth();

  // Get the intended destination from location state or default to appropriate dashboard
  const from = location.state?.from?.pathname;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Missing credentials",
        description: "Please enter both email/username and password.",
        variant: "destructive",
      });
      return;
    }

    try {
      await login({ username: email, password });
      
      toast({
        title: "Welcome back!",
        description: "Successfully signed in to your account",
      });

      // Navigate to the intended destination or appropriate dashboard based on user role
      if (from) {
        navigate(from, { replace: true });
      } else {
        // Redirect based on user role after login
        // Use the user from context which should be updated by login()
        console.log('User from context:', user);
        console.log('User role:', user?.role);
        
        if (user?.role === 'DEALER') {
          navigate('/dashboard', { replace: true });
        } else if (user?.role === 'BUYER') {
          navigate('/buyer-dashboard', { replace: true });
        } else {
          // Fallback to stored user if context user is not available
          const currentUser = authUtils.getStoredUser();
          console.log('Fallback user from storage:', currentUser);
          if (currentUser?.role === 'DEALER') {
            navigate('/dashboard', { replace: true });
          } else if (currentUser?.role === 'BUYER') {
            navigate('/buyer-dashboard', { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Sign in failed",
        description: error instanceof Error ? error.message : "Invalid email/username or password. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card className="border-2 border-border/50 shadow-2xl">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl font-bold bg-gradient-gold bg-clip-text text-transparent">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Sign in to your account
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSignIn} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email or Username</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="email"
                      type="text"
                      placeholder="Enter your email or username"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-gold hover:shadow-gold transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-muted-foreground">
                  Don't have an account?{" "}
                  <Link to="/signup" className="text-primary hover:underline font-medium">
                    Sign up here
                  </Link>
                </p>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SignIn;