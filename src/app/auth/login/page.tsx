'use client';

import { useEffect } from 'react';
import { useAuth } from '../components/useAuth';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { LoginForm } from '../components/LoginForm';
import { Alert, AlertDescription } from "@/components/ui/alert";
import Head from 'next/head';

export default function LoginPage() {
  const { login, isLoading, error, checkSession } = useAuth();

  useEffect(() => {
    checkSession();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    const result = await login(email, password);
    if (result.success) {
      console.log('Login successful');
      // リダイレクトはlogin関数内で処理されるため、ここでは何もしない
    }
  };

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-yellow-100 to-yellow-300 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center">
              <Image
                src="/images/アセット 4@3x.png"
                alt="クチコミファースト ロゴ"
                width={200}
                height={200}
                className="object-contain"
              />
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}