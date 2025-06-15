"use client";

import { signInWithOAuth } from "@/actions/auth";
import React, { useTransition } from "react";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button"

const LoginGithub = () => {
  const [isPending, startTransition] = useTransition();
  const handleGithubLogin = () => {
    startTransition(async () => {
      await signInWithOAuth('github');
    });
  };
  return (
    <Button onClick={handleGithubLogin} disabled={isPending} className="w-full" size="lg">
      {isPending ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Connecting...
        </>
      ) : (
        <>
          <Github className="h-4 w-4 mr-2" />
          Connect with GitHub
        </>
      )}
    </Button>
  );
};

export default LoginGithub;
