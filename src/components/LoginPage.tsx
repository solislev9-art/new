import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, User, BookOpen, Shield, AlertCircle, Loader2, LogIn } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { login, userLogin, LoginCredentials } from '@/lib/auth';

export default function LoginPage() {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if this is admin login based on the URL
  const isAdminLogin = location.pathname === '/admin/login';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = isAdminLogin 
        ? await login(credentials)
        : await userLogin(credentials);
      
      if (result.success) {
        if (isAdminLogin) {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof LoginCredentials) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCredentials(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      <Card className="w-full max-w-md bg-white border-gray-200 text-black relative z-10">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-black rounded-full flex items-center justify-center">
            {isAdminLogin ? (
              <Shield className="w-8 h-8 text-white" />
            ) : (
              <BookOpen className="w-8 h-8 text-white" />
            )}
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-black">
              {isAdminLogin ? 'Admin Login' : 'Welcome Back'}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {isAdminLogin 
                ? 'Access the manga management dashboard'
                : 'Sign in to your MangaVerse account'
              }
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-black">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  value={credentials.username}
                  onChange={handleInputChange('username')}
                  placeholder={isAdminLogin ? "Enter admin username" : "Enter your username"}
                  required
                  className="pl-10 bg-white border-gray-300 text-black placeholder-gray-500 focus:border-black focus:ring-black"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-black">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={credentials.password}
                  onChange={handleInputChange('password')}
                  placeholder="Enter password"
                  required
                  className="pl-10 pr-10 bg-white border-gray-300 text-black placeholder-gray-500 focus:border-black focus:ring-black"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-black hover:bg-gray-800 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          {!isAdminLogin && (
            <div className="text-center text-sm">
              Don't have an account?{" "}
              <Button
                variant="link"
                className="p-0 h-auto font-normal text-black"
                onClick={() => navigate("/signup")}
              >
                Sign up
              </Button>
            </div>
          )}

          {isAdminLogin && (
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Demo Credentials:</p>
              <div className="space-y-1 text-xs text-gray-500">
                <p><strong>Admin:</strong> admin / admin123</p>
                <p><strong>Super Admin:</strong> superadmin / super123</p>
              </div>
            </div>
          )}

          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="text-sm text-gray-600"
            >
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}