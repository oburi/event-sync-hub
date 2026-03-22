import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleLogo } from "@/components/icons/GoogleLogo";

export default function SignUp() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-2/5 bg-primary items-center justify-center p-12">
        <div className="max-w-sm">
          <div className="flex items-center gap-2 mb-8">
            <div className="h-10 w-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-primary-foreground">Syncra</span>
          </div>
          <h2 className="text-3xl font-semibold text-primary-foreground leading-tight">
            Your volunteers deserve clarity, not chaos.
          </h2>
          <p className="text-sm text-primary-foreground/70 mt-4 leading-relaxed">
            Import your event details from anywhere. Syncra organizes everything and gives every volunteer a simple, mobile-friendly view of exactly what they need to do.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6 animate-fade-in">
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">Syncra</span>
          </div>

          <div>
            <h1 className="text-2xl font-semibold">Create your account</h1>
            <p className="text-sm text-muted-foreground mt-1">Get your team on the same page in minutes.</p>
          </div>

          {/* Google Sign Up */}
          <Button variant="outline" className="w-full gap-2.5 h-11">
            <GoogleLogo className="h-4 w-4" />
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground">Full Name</label>
              <Input placeholder="Sarah Chen" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input type="email" placeholder="sarah@club.edu" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Phone Number</label>
              <Input type="tel" placeholder="(555) 123-4567" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Role in Organization</label>
              <Input placeholder="President, VP Events, etc." className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Password</label>
              <Input type="password" placeholder="Min 8 characters" className="mt-1" />
            </div>
          </div>

          <Button onClick={() => navigate('/org-setup')} className="w-full gap-1.5">
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Already have an account?{' '}
            <button className="text-primary font-medium hover:underline">Sign in</button>
          </p>
        </div>
      </div>
    </div>
  );
}
