import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient'; 
import { COMPANY_QUESTIONS, getYears, getTopics } from '../data/questions/index'; 
import CustomCursor from '../components/CustomCursor';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Custom Cloud Profile, Scores, and Leaderboard Array States
  const [profile, setProfile] = useState(null);
  const [scores, setScores] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]); 
  
  const [setupCompany, setSetupCompany] = useState(null);
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  // 2. Fetch User Profiles, Past Scores, and Live Leaderboard from Supabase Backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Retrieve current active user token session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        // If no session exists, flip loading false immediately before navigating to prevent visual flashes
        if (!session) {
          setLoading(false);
          navigate("/");
          return;
        }

        // Fetch display profile name using .maybeSingle() to prevent crashing if record is being created
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        // If no profile record exists in public.profiles yet, build a reliable fallback object
        if (!profileData) {
          setProfile({ full_name: session.user.email ? session.user.email.split('@')[0] : "Candidate" });
        } else {
          setProfile(profileData);
        }

        // Fetch past quiz result array histories 
        const { data: resultsData, error: resultsError } = await supabase
          .from('test_results')
          .select('topic, score, completed_at')
          .eq('user_id', session.user.id)
          .order('completed_at', { ascending: true });

        if (resultsError) throw resultsError;
        setScores(resultsData || []);

        // Fetch real leaderboard data from the cloud database view
        const { data: leaderboardData, error: leaderboardError } = await supabase
          .from('leaderboard')
          .select('id, full_name, total_points');

        if (leaderboardError) throw leaderboardError;
        setLeaderboard(leaderboardData || []);

      } catch (error) {
        console.error("Dashboard Data Fetch Error:", error.message);
        setLoading(false); 
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [navigate]);

  // Handle Logout Event securely
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  // Prevent Layout Flashes / Race Conditions
  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-[#c7a9ff] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest animate-pulse">
            Authenticating Session...
          </p>
        </div>
      </div>
    );
  }

  // 3. Process dynamic operational values from the data array
  const totalAttempted = scores.length;
  const totalCorrect = scores.reduce((sum, item) => sum + item.score, 0);
  
  // Calculate historical baseline accuracies
  const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / (totalAttempted * 10)) * 100) : 0;

  // Format dataset array structure to populate the Recharts graph interface
  const chartData = scores.length > 0 
    ? scores.map((item, idx) => ({ name: `Test ${idx + 1}`, score: Math.round((item.score / 10) * 100) }))
    : [{ name: 'Start', score: 0 }];

  // Dynamic global rank calculation matching your profile safely against the state array collection
  const userRank = leaderboard.findIndex(u => u.full_name === profile?.full_name) + 1;

  const openSetup = (company) => {
    setSelectedYear("All");  
    setSelectedTopic("All"); 
    setSetupCompany(company);
  };

  const startTest = (company, length) => {
    const maxQuestions = COMPANY_QUESTIONS[company].length;
    const finalLength = Math.min(length, maxQuestions);
    const testConfig = { 
      company: company, 
      length: finalLength,
      year: selectedYear,
      topic: selectedTopic
    };
    localStorage.setItem("currentTestConfig", JSON.stringify(testConfig));
    navigate("/test");
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#050505]/90 border border-[#c7a9ff]/30 p-3 rounded-xl shadow-2xl backdrop-blur-md">
          <p className="text-gray-400 text-sm mb-1">{label}</p>
          <p className="text-[#c7a9ff] font-black text-lg">{payload[0].value}% Accuracy</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen text-white overflow-hidden bg-[#050505] relative font-sans">
      <CustomCursor /> 

      {/* Decorative Glows */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#c7a9ff]/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-900/5 rounded-full blur-[150px]" />
      </div>

      <nav className="relative z-10 flex justify-between items-center px-10 py-8 border-b border-white/5 backdrop-blur-md bg-white/[0.02]">
        <h1 className="text-3xl font-black tracking-tighter">Path<span className="text-[#c7a9ff]">Prep</span></h1>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
            <span className="text-xl">🔥</span>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Streak</p>
              <p className="text-sm font-black text-white leading-none">1 Day</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-gray-500 text-xs font-medium uppercase">Operative</p>
            <h2 className="font-bold text-lg text-white">{profile?.full_name}</h2>
          </div>
          <button onClick={handleLogout} className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/50 transition-all font-bold text-gray-300 text-sm backdrop-blur-md">Logout</button>
        </div>
      </nav>

      {/* Test Modal with Dropdowns */}
      <AnimatePresence>
        {setupCompany && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-lg px-6">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8 max-w-sm w-full text-center">
              <h2 className="text-3xl font-black text-white mb-2">{setupCompany}</h2>
              <p className="text-gray-400 mb-6 text-sm">Configure your practice session</p>
              
              <div className="flex flex-col gap-3 mb-6">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 hover:border-[#c7a9ff]/50 rounded-xl p-3 text-white outline-none transition-all cursor-pointer"
                >
                  <option value="All" className="bg-[#050505]">All Years</option>
                  {getYears(setupCompany).map(year => (
                    <option key={year} value={year} className="bg-[#050505]">{year}</option>
                  ))}
                </select>

                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 hover:border-[#c7a9ff]/50 rounded-xl p-3 text-white outline-none transition-all cursor-pointer"
                >
                  <option value="All" className="bg-[#050505]">All Topics</option>
                  {getTopics(setupCompany).map(topic => (
                    <option key={topic} value={topic} className="bg-[#050505]">{topic}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                {[5, 10, 15].map(num => COMPANY_QUESTIONS[setupCompany]?.length >= num && (
                  <button key={num} onClick={() => startTest(setupCompany, num)} className="w-full py-4 bg-white/5 border border-white/10 hover:border-[#c7a9ff]/50 rounded-2xl font-bold text-gray-200">Start {num} Questions</button>
                ))}
                {COMPANY_QUESTIONS[setupCompany] && (
                  <button onClick={() => startTest(setupCompany, COMPANY_QUESTIONS[setupCompany].length)} className="w-full py-4 bg-[#c7a9ff] text-black font-black rounded-2xl mt-4">Start Full Test</button>
                )}
              </div>
              <button onClick={() => setSetupCompany(null)} className="mt-8 text-gray-500 hover:text-white transition-colors uppercase text-xs font-bold tracking-widest">Cancel</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={pageVariants} initial="initial" animate="animate" className="max-w-7xl mx-auto px-10 py-12 relative z-10">
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[ { l: "Tests Attempted", v: totalAttempted }, { l: "Overall Accuracy", v: `${accuracy}%` }, { l: "Global Rank", v: userRank > 0 ? `#${userRank}` : "#--" } ].map((s, i) => (
            <div key={i} className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-3xl p-8">
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{s.l}</p>
              <h2 className="text-5xl font-black mt-3">{s.v}</h2>
            </div>
          ))}
        </div>

        <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-[2rem] p-8 mb-12">
          <h3 className="text-xl font-bold mb-6">Performance Timeline</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#c7a9ff" stopOpacity={0.4}/></linearGradient></defs>
                <CartesianGrid stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={10} />
                <YAxis stroke="#6b7280" fontSize={10} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="score" stroke="#c7a9ff" strokeWidth={3} fill="url(#g)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <h2 className="text-2xl font-black mb-6">Company Practice Tests</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {Object.keys(COMPANY_QUESTIONS).map((company) => (
            <div key={company} className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-[2rem] p-8 hover:border-[#c7a9ff]/40 transition-all">
              <h3 className="text-3xl font-black text-white">{company}</h3>
              <p className="text-gray-400 text-sm mb-6 h-10">Practice aptitude questions for {company}.</p>
              <button onClick={() => openSetup(company)} className="w-full py-4 rounded-xl bg-[#c7a9ff] text-black font-black hover:bg-white transition-colors">Configure Test</button>
            </div>
          ))}
        </div>

        {/* --- LIVE CLOUD LEADERBOARD --- */}
        <div className="mt-16">
          <h2 className="text-2xl font-black mb-6">Leaderboard</h2>
          <div className="space-y-3">
            {leaderboard.map((p, i) => {
              const isMe = p.full_name === profile?.full_name;
              return (
                <div key={p.id || i} className={`p-4 rounded-2xl border ${isMe ? "bg-[#c7a9ff]/10 border-[#c7a9ff]/30" : "bg-white/5 border-white/5"}`}>
                  <div className="flex justify-between font-bold">
                    <span>#{i + 1} {p.full_name} {isMe && <span className="ml-2 text-[10px] bg-[#c7a9ff] text-black px-2 py-0.5 rounded">YOU</span>}</span>
                    <span>{p.total_points} pts</span>
                  </div>
                </div>
              );
            })}
            {leaderboard.length === 0 && (
              <p className="text-gray-500 text-sm italic">No leaderboard records calculated yet.</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}