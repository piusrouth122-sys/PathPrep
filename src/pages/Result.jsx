import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import { supabase } from '../supabaseClient'; // 1. Imported your Supabase client hub
import { COMPANY_QUESTIONS } from '../data/questions';
import { formatTime } from '../utils/helpers';
import CustomCursor from '../components/CustomCursor';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

export default function Result() {
  const navigate = useNavigate();
  const [resultData, setResultData] = useState(null);
  const [displayScore, setDisplayScore] = useState(0);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  // Load local results data
  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);

    const savedResultStr = localStorage.getItem("lastTestResult");
    if (!savedResultStr) { navigate("/dashboard"); return; }
    
    setResultData(JSON.parse(savedResultStr));
    return () => window.removeEventListener('resize', handleResize);
  }, [navigate]);

  // 2. New Clean-up Effect: Send score to Supabase database backend automatically
  useEffect(() => {
    const saveScoreToSupabase = async () => {
      if (!resultData) return;

      try {
        // Find the currently logged-in user session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (session?.user) {
          // Push test result directly into your PostgreSQL table
          const { error: dbError } = await supabase
            .from('test_results')
            .insert([
              {
                user_id: session.user.id,
                topic: resultData.company, // e.g., 'TCS', 'Wipro'
                score: resultData.score
              }
            ]);

          if (dbError) throw dbError;
          console.log("Performance metrics safely synchronized with cloud database.");
        }
      } catch (error) {
        console.error("Database Synchronization Error:", error.message);
      }
    };

    saveScoreToSupabase();
  }, [resultData]);

  // Score ticker display animation logic
  useEffect(() => {
    if (resultData && resultData.score > 0) {
      let start = 0;
      const interval = setInterval(() => {
        start += 1;
        setDisplayScore(start);
        if (start === resultData.score) clearInterval(interval);
      }, 150); 
      return () => clearInterval(interval);
    }
  }, [resultData]);

  if (!resultData) return <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">Loading Results...</div>;

  const { company, testLength, score, timeTaken, userAnswers } = resultData;
  const activeQuestions = COMPANY_QUESTIONS[company]?.slice(0, testLength) || [];
  const didPass = score >= testLength / 2;
  const skippedCount = testLength - (userAnswers?.length || 0);

  return (
    <div className="min-h-screen text-white overflow-hidden bg-[#050505] relative selection:bg-[#c7a9ff] selection:text-black">
      <CustomCursor />
      
      {didPass && (
        <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={400} gravity={0.15} style={{ zIndex: 100 }} />
      )}

      {/* Decorative Glows */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#c7a9ff]/5 rounded-full blur-[150px]" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key="result" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4 }}
          className="py-12 px-6 max-w-5xl mx-auto relative z-10"
        >
          <div className="text-center mb-16">
            <h1 className="text-6xl font-black mb-8 tracking-tighter">Test Complete!</h1>
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-white/5 border border-white/10 rounded-[3rem] p-12 backdrop-blur-md inline-block shadow-2xl relative mb-10"
            >
              <div className="absolute -top-4 -right-4 bg-[#c7a9ff] text-black font-black px-6 py-2 rounded-full rotate-12 shadow-xl">
                +{score * 10} pts
              </div>
              <p className="text-gray-400 font-bold mb-2 uppercase tracking-widest text-sm">{company} Mock Performance</p>
              <p className="text-8xl font-black">{displayScore}<span className="text-gray-600 text-6xl">/{testLength}</span></p>
              <p className={`mt-6 text-2xl font-bold ${didPass ? 'text-[#c7a9ff]' : 'text-red-400'}`}>
                {didPass ? 'Great Job! 🚀' : 'Keep Practicing! 💪'}
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-10">
              {[ { l: "Time Taken", v: formatTime(timeTaken) }, { l: "Accuracy", v: `${Math.round((score / testLength) * 100)}%` }, { l: "Pts Earned", v: `+${score * 10}` }, { l: "Skipped", v: skippedCount } ].map((item, i) => (
                <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md">
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">{item.l}</p>
                  <p className="text-2xl font-black">{item.v}</p>
                </div>
              ))}
            </div>

            <button onClick={() => navigate("/dashboard")} className="px-10 py-5 rounded-2xl bg-[#c7a9ff] text-black font-black text-xl hover:bg-white transition-all shadow-[0_0_20px_rgba(199,169,255,0.3)]">
              Return to Dashboard
            </button>
          </div>

          <div className="text-left space-y-8">
            <h3 className="text-3xl font-black mb-8 border-b border-white/5 pb-4">Detailed Review</h3>
            {activeQuestions.map((q, index) => {
              const userAnswer = userAnswers ? userAnswers[index] : undefined;
              const isCorrect = userAnswer === q.correct;
              const skipped = userAnswer === undefined || userAnswer === null;

              return (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} key={index} 
                  className="bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-md relative overflow-hidden"
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-2 ${isCorrect ? 'bg-green-500' : skipped ? 'bg-gray-500' : 'bg-red-500'}`} />
                  <div className="flex items-center gap-3 mb-6">
                    <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${isCorrect ? 'bg-green-500/20 text-green-400' : skipped ? 'bg-gray-500/20 text-gray-400' : 'bg-red-500/20 text-red-400'}`}>
                      {isCorrect ? 'Correct' : skipped ? 'Skipped' : 'Incorrect'}
                    </span>
                    <p className="font-bold">Question {index + 1}</p>
                  </div>
                  <h2 className="text-xl mb-8 font-semibold">{q.q}</h2>
                  <div className="space-y-3 mb-8">
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} className={`p-4 rounded-xl border flex justify-between items-center ${optIdx === q.correct ? 'bg-green-500/10 border-green-500/30 text-green-400' : optIdx === userAnswer ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-white/5 border-white/5 text-gray-500'}`}>
                        <span>{opt}</span>
                        {optIdx === q.correct && <span className="font-black">✓</span>}
                        {optIdx === userAnswer && optIdx !== q.correct && <span className="font-black">✗</span>}
                      </div>
                    ))}
                  </div>
                  <div className="bg-[#c7a9ff]/10 border border-[#c7a9ff]/20 rounded-2xl p-6">
                    <h4 className="text-[#c7a9ff] font-black mb-2 text-xs uppercase tracking-widest">Explanation</h4>
                    <p className="text-gray-300 text-sm">{q.exp}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}