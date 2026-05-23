import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // Imported Supabase Client
import { COMPANY_QUESTIONS } from '../data/questions/index'; 
import { formatTime } from '../utils/helpers';
import CustomCursor from '../components/CustomCursor';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const shakeVariants = {
  shake: { x: [-10, 10, -10, 10, 0], transition: { duration: 0.4 } },
  idle: { x: 0 }
};

export default function Test() {
  const navigate = useNavigate();
  
  const [selectedCompany, setSelectedCompany] = useState("");
  const [testLength, setTestLength] = useState(0);
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);

  // Handles Filtering by Year and Topic from Configuration Storage
  useEffect(() => {
    const configStr = localStorage.getItem("currentTestConfig");
    if (!configStr) { navigate("/dashboard"); return; }
    
    const config = JSON.parse(configStr);
    setSelectedCompany(config.company);
    
    let allQs = [...(COMPANY_QUESTIONS[config.company] || [])];
    
    // Apply Filters
    if (config.year && config.year !== "All") {
      allQs = allQs.filter(q => q.year === parseInt(config.year));
    }
    if (config.topic && config.topic !== "All") {
      allQs = allQs.filter(q => q.topic === config.topic);
    }
    
    // Shuffle Algorithm
    for (let i = allQs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allQs[i], allQs[j]] = [allQs[j], allQs[i]];
    }
    
    const finalLength = Math.min(config.length, allQs.length);
    setTestLength(finalLength);
    setActiveQuestions(allQs.slice(0, finalLength));
    setTimeLeft(finalLength * 60);
  }, [navigate]);

  useEffect(() => {
    let timer;
    if (timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && activeQuestions.length > 0) {
      handleFinishTest(); 
    }
    return () => clearTimeout(timer);
  }, [timeLeft, activeQuestions.length]);

  const submitAnswer = () => {
    setSubmitted(true);
    setUserAnswers((prev) => [...prev, selectedOption]);
    if (selectedOption === activeQuestions[currentQuestion].correct) setScore((prev) => prev + 1);
  };

  const nextQuestion = () => {
    if (currentQuestion + 1 < activeQuestions.length) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedOption(null);
      setSubmitted(false);
    } else { handleFinishTest(); }
  };

  // Synchronizes your score details to the cloud backend database securely
  const handleFinishTest = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { error } = await supabase
          .from('test_results')
          .insert([
            {
              user_id: session.user.id,
              topic: selectedCompany,
              score: score,
              completed_at: new Date().toISOString()
            }
          ]);

        if (error) throw error;
        console.log("Performance metrics safely synchronized with cloud database.");
      }
    } catch (err) {
      console.error("Failed to sync score to cloud database:", err.message);
    }

    // Cache the view data locally so your Result UI page can read parameters instantly
    localStorage.setItem("lastTestResult", JSON.stringify({ 
      company: selectedCompany, 
      testLength, 
      score, 
      timeTaken: (testLength * 60) - timeLeft, 
      userAnswers 
    }));
    
    navigate("/result");
  };

  if (activeQuestions.length === 0) return <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">No questions found for these filters...</div>;

  const question = activeQuestions[currentQuestion];
  let timerClass = "bg-white/5 border-white/10 text-white";
  if (timeLeft <= 30) timerClass = "bg-red-500/20 border-red-500 text-red-500 animate-pulse";

  return (
    <div className="min-h-screen text-white overflow-hidden bg-[#050505] relative font-sans">
      <CustomCursor />
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#c7a9ff]/5 rounded-full blur-[150px]" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key="test" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="max-w-4xl mx-auto px-6 py-12 relative z-10">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-black">{selectedCompany} Assessment</h2>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-[#c7a9ff]/10 text-[#c7a9ff] border border-[#c7a9ff]/20 rounded-xl font-bold text-sm">✓ {score} Correct</div>
              <div className={`px-6 py-3 rounded-2xl border font-mono text-xl font-bold ${timerClass}`}>⏱ {formatTime(timeLeft)}</div>
              <button onClick={handleFinishTest} className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-red-500/20 transition-all font-bold">Quit</button>
            </div>
          </div>

          <motion.div key={currentQuestion} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white/5 border border-white/10 rounded-[2rem] p-10 backdrop-blur-md">
            <div className="w-full bg-white/5 rounded-full h-2 mb-8 overflow-hidden">
              <div className="bg-[#c7a9ff] h-2 rounded-full transition-all duration-500" style={{ width: `${((currentQuestion + 1) / activeQuestions.length) * 100}%` }} />
            </div>
            <p className="text-[#c7a9ff] font-bold mb-4">Question {currentQuestion + 1} of {activeQuestions.length}</p>
            
            <div className="mb-6 flex gap-3">
              {question?.year && (
                <span className="px-3 py-1 bg-[#c7a9ff]/20 text-[#c7a9ff] border border-[#c7a9ff]/30 rounded-lg text-xs font-bold uppercase tracking-wider">
                  Year: {question.year}
                </span>
              )}
              {question?.topic && (
                <span className="px-3 py-1 bg-white/10 text-gray-300 border border-white/20 rounded-lg text-xs font-bold uppercase tracking-wider">
                  {question.topic}
                </span>
              )}
            </div>
            
            <h2 className="text-3xl mb-10 leading-relaxed font-semibold">{question?.q}</h2>

            <div className="space-y-4">
              {question?.options.map((option, index) => {
                const isSelected = selectedOption === index;
                let btnClass = "bg-white/5 border-white/10 hover:border-[#c7a9ff]";
                if (submitted) {
                  if (index === question.correct) btnClass = "bg-green-500/20 border-green-500 text-green-300";
                  else if (isSelected) btnClass = "bg-red-500/20 border-red-500 text-red-300 line-through";
                  else btnClass = "opacity-30";
                } else if (isSelected) btnClass = "bg-[#c7a9ff]/20 border-[#c7a9ff]";

                return (
                  <motion.button key={index} disabled={submitted} variants={shakeVariants} animate={submitted && isSelected && index !== question.correct ? "shake" : "idle"}
                    onClick={() => !submitted && setSelectedOption(index)}
                    className={`w-full text-left p-6 rounded-2xl border transition-all ${btnClass}`}
                  >
                    {option}
                  </motion.button>
                );
              })}
            </div>

            {!submitted ? (
              <button onClick={submitAnswer} disabled={selectedOption === null} className="mt-10 px-8 py-4 rounded-2xl bg-[#c7a9ff] text-black font-black disabled:opacity-30">Submit Answer</button>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-10">
                <div className="bg-[#c7a9ff]/10 border border-[#c7a9ff]/30 rounded-2xl p-6 mb-6">
                  <h3 className="text-[#c7a9ff] font-black mb-2">Explanation</h3>
                  <p className="text-gray-200 text-sm">{question.exp}</p>
                </div>
                <button onClick={nextQuestion} className="px-8 py-4 rounded-2xl bg-white text-black font-black">{currentQuestion + 1 === activeQuestions.length ? "Finish & Save" : "Next Question"}</button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}