"use client";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function AuthPage() {
  const supabase = createClient();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check if already logged in
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        router.push("/dashboard");
      } else {
        setChecking(false);
      }
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        router.push("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-50 to-amber-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-600 mx-auto mb-4"></div>
          <p className="text-navy-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-navy-600 rounded-full mb-4">
            <Shield className="h-8 w-8 text-amber-400" />
          </div>
          <h1 className="text-3xl font-bold text-navy-700 mb-2">
            Welcome to ConcretePOA
          </h1>
          <p className="text-navy-500">
            Sign in to manage your POA submissions
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center text-navy-700">
              Sign In or Sign Up
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: "#f59e0b",
                      brandAccent: "#d97706",
                    },
                  },
                },
                className: {
                  container: "auth-container",
                  button: "auth-button",
                  input: "auth-input",
                },
              }}
              providers={[]}
              redirectTo={`${window.location.origin}/dashboard`}
              view="sign_in"
            />
          </CardContent>
        </Card>

        <p className="text-center text-sm text-navy-400 mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
