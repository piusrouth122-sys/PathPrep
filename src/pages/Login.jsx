import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // Imported your client hub
import CharacterScene from '../components/CharacterScene';
import CustomCursor from '../components/CustomCursor';
import FloatingStats from '../components/FloatingStats';

export default function Login() {
  const navigate = useNavigate();
  const [view, setView] = useState("login");
  const [loading, setLoading] = useState(false);

  // Input States
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState(""); // Changed from loginName to email for Supabase Auth
  const [loginPassword, setLoginPassword] = useState("");

  // Replaced manual localStorage check with active Supabase session listener
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkUser();
  }, [navigate]);

  // Cleaned up: Let the backend database trigger handle public.profiles insertion automatically
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Register user in Supabase Auth system
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          // Pass the display name in metadata so the trigger can catch and write it to full_name
          data: { full_name: signupName }
        }
      });

      if (authError) throw authError;

      if (authData?.user) {
        // Redundant profile manual insertion code completely removed to prevent primary key collisions
        navigate("/dashboard");
      }
    } catch (error) {
      alert(error.message || "An error occurred during profile registration.");
    } finally {
      setLoading(false);
    }
  };

  // Swapped local logic parsing with Supabase single-line token generation
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) throw error;

      navigate("/dashboard");
    } catch (error) {
      alert(error.message || "Invalid authentication credentials.");
    } finally {
      setLoading(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, x: 50, transition: { duration: 0.4 } }
  };

  return (
    <div className="w-full h-screen bg-[#050505] overflow-hidden relative font-sans text-white">
      <CharacterScene />
      <CustomCursor />
      <FloatingStats />

      <div className="absolute inset-0 z-10 flex justify-start pointer-events-none">
        <div className="absolute top-0 left-0 w-full lg:w-1/2 h-full bg-gradient-to-r from-black/80 via-black/40 to-transparent z-0"></div>

        <div className="relative z-10 w-full lg:w-[500px] h-full flex flex-col justify-center px-8 sm:px-16 lg:pl-24 lg:pr-0 pointer-events-auto">
          
          <div className="mb-12">
            <h1 className="text-5xl font-black tracking-tighter mb-2">
              Path<span className="text-purple-400">Prep</span>
            </h1>
            <p className="text-gray-400 text-sm tracking-wide uppercase">
              {view === "login" ? "Welcome Back." : "Begin Your Journey."}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {/* LOGIN FORM */}
            {view === "login" && (
              <motion.div
                key="login-form"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="w-full"
              >
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-4">
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-lg px-5 py-4 outline-none focus:border-purple-500 focus:bg-white/10 transition-all backdrop-blur-md"
                      required
                      disabled={loading}
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-lg px-5 py-4 outline-none focus:border-purple-500 focus:bg-white/10 transition-all backdrop-blur-md"
                      required
                      disabled={loading}
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-white text-black font-bold py-4 rounded-lg hover:bg-gray-200 transition-colors mt-4 disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? "Verifying..." : "Enter System"}
                  </button>
                </form>

                <div className="mt-8 flex items-center justify-between text-sm">
                  <span className="text-gray-500">New recruit?</span>
                  <button
                    onClick={() => setView("landing")}
                    className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                    disabled={loading}
                  >
                    Initialize Account
                  </button>
                </div>
              </motion.div>
            )}

            {/* SIGNUP FORM */}
            {view === "landing" && (
              <motion.div
                key="signup-form"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="w-full"
              >
                <form onSubmit={handleSignup} className="space-y-6">
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-lg px-5 py-4 outline-none focus:border-purple-500 focus:bg-white/10 transition-all backdrop-blur-md"
                      required
                      disabled={loading}
                    />
                    <input
                      type="email"
                      placeholder="College Email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-lg px-5 py-4 outline-none focus:border-purple-500 focus:bg-white/10 transition-all backdrop-blur-md"
                      required
                      disabled={loading}
                    />
                    <input
                      type="password"
                      placeholder="Create Password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-lg px-5 py-4 outline-none focus:border-purple-500 focus:bg-white/10 transition-all backdrop-blur-md"
                      required
                      disabled={loading}
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-purple-500 text-white font-bold py-4 rounded-lg hover:bg-purple-600 transition-colors mt-4 shadow-[0_0_20px_rgba(168,85,247,0.4)] disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "Create Profile"}
                  </button>
                </form>

                <div className="mt-8 flex items-center justify-between text-sm">
                  <span className="text-gray-500">Already registered?</span>
                  <button
                    onClick={() => setView("login")}
                    className="text-white hover:text-gray-300 font-medium transition-colors"
                    disabled={loading}
                  >
                    Return to Login
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}