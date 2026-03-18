"use client";

import { useState } from "react";
import { loginApi } from "../../services/authApi";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../utils/constants";
import { Mail, Lock, ArrowRight } from "lucide-react";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await loginApi({ email, password });

      console.log("Login Response:", res.data);

      if (!res?.data?.user) {
        throw new Error("Invalid response from server");
      }

      login(res.data);

      const role = res.data.user.role?.name;

      if (role === ROLES.SUPER_ADMIN) {
        router.push("/superadmin/dashboard");
      } else if (role === ROLES.ADMIN) {
        router.push("/admin/dashboard");
      } else if (role === ROLES.USER) {
        router.push("/user/dashboard");
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Login error:", error);

      const message =
        error?.response?.data?.message || "Invalid email or password";

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
      <div className="max-w-[1000px] w-full bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 flex overflow-hidden border border-slate-100">
        {/* LEFT SIDE */}
        <div className="hidden lg:flex w-1/2 relative">
          <img
            src="/images/login.jpg"
            alt="Login"
            className="object-cover w-full h-full"
          />
        </div>

        {/* RIGHT SIDE */}
        <div className="flex-1 p-8 lg:p-16 flex flex-col justify-center">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              Welcome Back
            </h2>
            <p className="text-slate-500 font-medium">
              Please enter your details to sign in.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* EMAIL */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">
                Email Address
              </label>

              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={20}
                />

                <input
                  type="email"
                  placeholder="name@company.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">
                Password
              </label>

              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={20}
                />

                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Sign In <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-slate-500">
            Don't have an account?{" "}
            <button
              onClick={() => router.push("/register")}
              className="text-indigo-600 font-bold hover:underline"
            >
              Register Now
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
