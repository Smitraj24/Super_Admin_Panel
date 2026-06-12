"use client";

import { useState } from "react";
import { registerApi } from "../../services/authApi";
import { useRouter } from "next/navigation";
import GoogleSignupButton from "@/components/auth/GoogleSignupButton";
import { User, Mail, Lock, UserPlus, Shield, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";

export default function Register() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [step, setStep] = useState(1);
  const [confirmPassword, setConfirmPassword] = useState("");

  const nextStep = () => {
    if (step === 1 && (!name || !email)) {
      toast.error("Please fill all fields");
      return;
    }

    if (step === 2) {
      if (!password) {
        toast.error("Password is required");
        return;
      }

      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
    }

    setStep((prev) => prev + 1);
  };

  const prevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await registerApi({ name, email, password, role });
      toast.success("Account created successfully");
      router.push("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-cyan-50 p-4">
      <div className="max-w-[1100px] w-full bg-white rounded-[2rem] shadow-2xl flex flex-col lg:flex-row overflow-hidden">
        {/* Left side*/}

        <div className=" w-full lg:w-[45%] relative overflow-hidden bg-gradient-to-br from-[#06B6D4] via-[#10B981] to-[#1E40AF] p-8 lg:p-12 flex flex-col justify-betwee ">
          {/* Background Effects */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-40 -mt-40 animate-pulse" />

          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -ml-40 -mb-40" />

          <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

          {/* Logo */}
          <div className="relative z-10 flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl">
              <img
                src="/images/edit.png"
                alt="Logo"
                className="h-8 w-8 object-contain"
              />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white">Super Admin</h2>

              <p className="text-white/70 text-sm">Management Platform</p>
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10 py-10 ">
            <h1 className="text-5xl font-extrabold text-white leading-tight ">
              Start your
              <span className="text-cyan-100"> journey today.</span>
            </h1>
            <p className="mt-6 text-lg text-white/80 max-w-md">
              {" "}
              Join thousands of organizations managing employees, attendance,
              payroll, projects and operations through one powerful platform.
            </p>

            {/* Features */}
            <div className="mt-10 space-y-4">
              <div className="flex items-center gap-3 text-white/90">
                <span className="w-2 h-2 rounded-full bg-white" />
                Secure Authentication
              </div>

              <div className="flex items-center gap-3 text-white/90">
                <span className="w-2 h-2 rounded-full bg-white" />
                Role-Based Access Control
              </div>

              <div className="flex items-center gap-3 text-white/90">
                <span className="w-2 h-2 rounded-full bg-white" />
                Enterprise Grade Security
              </div>

              <div className="flex items-center gap-3 text-white/90">
                <span className="w-2 h-2 rounded-full bg-white" />
                Real-Time Dashboard Insights
              </div>
            </div>
          </div>

          {/* Bottom Card */}
          <div className="rounded-xl px-6 py-4 bg-white/10">
            <p className="text-white font-semibold text-lg">
              Trusted by 10,000+ Users
            </p>

            <p className="text-white/70 text-sm mt-1">
              Fast, secure and scalable workforce management.
            </p>
          </div>
        </div>

        {/* right side */}
        <div className="flex-1 p-8 lg:p-14 flex flex-col justify-center">
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              Create Account
            </h2>
            <p className="text-slate-500 font-medium">
              Get started with your free account today.
            </p>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex-1 flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold
          ${
            step >= s
              ? "bg-emerald-500 text-white"
              : "bg-slate-200 text-slate-500"
          }`}
                  >
                    {s}
                  </div>

                  {s !== 3 && (
                    <div
                      className={`flex-1 h-2 w-[180px] mx-2 ${
                        step > s ? "bg-emerald-500" : "bg-slate-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-2 text-xs text-slate-500">
              <span>Profile</span>
              <span>Security</span>
              <span>Review</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1  gap-6">
            {step === 1 && (
              <div className="space-y-5">
                <div className="relative">
                  <User
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
                    required
                  />
                </div>

                <div className="relative">
                  <Mail
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
                    required
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div className="space-y-5">
                  <div className="relative">
                    <Lock
                      size={20}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-4 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  <div className="relative">
                    <Shield
                      size={20}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="password"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-slate-50 rounded-2xl p-6 space-y-4">
                <h3 className="font-bold text-lg">Review Information</h3>

                <div>
                  <span className="font-semibold">Name:</span> {name}
                </div>

                <div>
                  <span className="font-semibold">Email:</span> {email}
                </div>

                <div>
                  <span className="font-semibold">Role:</span> {role}
                </div>
              </div>
            )}

            <div className="flex gap-4 mt-8">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 py-3 rounded-xl border border-slate-300"
                >
                  Back
                </button>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 py-3 rounded-xl bg-emerald-500 text-white"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl bg-indigo-600 text-white"
                >
                  {loading ? "Creating..." : "Create Account"}
                </button>
              )}
            </div>
          </form>

          <GoogleSignupButton />

          <p className="mt-8 text-center text-slate-500 font-medium">
            Already have an account?{" "}
            <button
              onClick={() => router.push("/login")}
              className="text-indigo-600 font-bold hover:underline underline-offset-4"
            >
              Log In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
