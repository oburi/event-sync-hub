import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
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
          <div className="flex items-center gap-2.5 mb-10">
            <span className="text-xl font-semibold text-primary-foreground tracking-tight">Syncra</span>
          </div>
          <h2 className="font-serif text-4xl text-primary-foreground leading-tight">
            One source of truth for every volunteer.
          </h2>
          <p className="text-[15px] text-primary-foreground/70 mt-5 leading-relaxed">
            Import your event details from anywhere. Syncra organizes everything and gives every volunteer a simple, mobile-friendly view of exactly what they need to do.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6 animate-fade-in">
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <span className="text-lg font-semibold tracking-tight">Syncra</span>
          </div>

          <div>
            <h1 className="font-serif text-3xl text-foreground">Create your account</h1>
            <p className="text-[14px] text-muted-foreground mt-1.5">Get your team on the same page in minutes.</p>
          </div>

          {/* Google Sign Up */}
          <Button variant="outline" className="w-full gap-2.5 h-11 rounded-xl">
            <GoogleLogo className="h-4 w-4" />
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[13px] text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="text-[14px] font-medium text-foreground">Full Name</label>
              <Input placeholder="Sarah Chen" className="mt-1.5 rounded-xl h-10" />
            </div>
            <div>
              <label className="text-[14px] font-medium text-foreground">Email</label>
              <Input type="email" placeholder="sarah@club.edu" className="mt-1.5 rounded-xl h-10" />
            </div>
            <div>
              <label className="text-[14px] font-medium text-foreground">Phone Number</label>
              <Input type="tel" placeholder="(555) 123-4567" className="mt-1.5 rounded-xl h-10" />
            </div>
            <div>
              <label className="text-[14px] font-medium text-foreground">Role in Organization</label>
              <Input placeholder="President, VP Events, etc." className="mt-1.5 rounded-xl h-10" />
            </div>
            <div>
              <label className="text-[14px] font-medium text-foreground">Password</label>
              <Input type="password" placeholder="Min 8 characters" className="mt-1.5 rounded-xl h-10" />
            </div>
          </div>

          <Button onClick={() => navigate('/org-setup')} className="w-full gap-1.5 rounded-xl h-11">
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>

          <p className="text-[13px] text-center text-muted-foreground">
            Already have an account?{' '}
            <button className="text-primary font-medium hover:underline">Sign in</button>
          </p>
        </div>
      </div>
    </div>);

}