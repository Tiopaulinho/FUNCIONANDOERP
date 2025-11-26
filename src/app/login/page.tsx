
"use client";

import * as React from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from "@/firebase";
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await initiateAnonymousSignIn(auth);
      // On successful sign-in, the main page will handle the redirect
      router.push('/');
    } catch (error) {
      console.error("Anonymous sign-in failed:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh w-full flex-col items-center justify-center bg-muted/30 p-4 md:p-8">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-2xl font-semibold mb-4">Bem-vindo ao seu ERP</h1>
        <p className="text-muted-foreground mb-6">Clique no botão abaixo para acessar a aplicação.</p>
        <Button onClick={handleLogin} disabled={isLoading} className="w-full">
          {isLoading ? "Acessando..." : "Acessar como Convidado"}
        </Button>
      </div>
    </div>
  );
}
