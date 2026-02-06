import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AccessGuardProps {
  children: React.ReactNode;
}

export function AccessGuard({ children }: AccessGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const storedCode = localStorage.getItem('access_code');
    if (storedCode) {
      verifyCode(storedCode).then(isValid => {
        if (isValid) {
          setIsAuthenticated(true);
        } else {
            // If stored code is invalid, clear it
             localStorage.removeItem('access_code');
        }
      });
    }
  }, []);

  const verifyCode = async (code: string) => {
    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-code': code,
        },
      });
      return response.ok;
    } catch (err) {
      console.error("Verification failed", err);
      return false;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await verifyCode(accessCode)) {
      localStorage.setItem('access_code', accessCode);
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid access code');
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Access Verification</CardTitle>
          <CardDescription>Enter your access code to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Access Code"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <Button type="submit" className="w-full">
              Enter
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
