import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Zap, Swords, Lock, CheckCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { EvaluationResult, SessionResult, StudentProgress } from '../types';

export function GameSession() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const studentId = state.currentUser!.id;

  const session = state.sessions.find(s => s.id === sessionId);
  const questions = state.questions.filter(q => session?.questionIds.includes(q.id));

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<string[]>(new Array(questions.length).fill(''));
  const [timeLeft, setTimeLeft] = useState(questions[0]?.timeLimit || 60);
  const [isLocked, setIsLocked] = useState(false);
  const [showCountdown, setShowCountdown] = useState(true);
  const [countdown, setCountdown] = useState(3);
  const [evaluating, setEvaluating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const opponentId = session?.pairs.find(p => p.includes(studentId))?.find(id => id !== studentId) || '';
  const opponent = state.users.find(u => u.id === opponentId);

  // Countdown before game starts
  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(t);
    } else {
      setShowCountdown(false);
    }
  }, [countdown]);

  // Main game timer
  useEffect(() => {
    if (showCountdown || isLocked) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [showCountdown, isLocked, currentQ]);

  const handleTimeUp = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (currentQ < questions.length - 1) {
      setIsLocked(true);
      setTimeout(() => {
        setCurrentQ(prev => prev + 1);
        setTimeLeft(questions[currentQ + 1]?.timeLimit || 60);
        setIsLocked(false);
      }, 1500);
    } else {
      setIsLocked(true);
      setTimeout(() => startEvaluation(), 1500);
    }
  }, [currentQ, questions]);

  const handleSubmit = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(prev => prev + 1);
      setTimeLeft(questions[currentQ + 1]?.timeLimit || 60);
    } else {
      setIsLocked(true);
      setTimeout(() => startEvaluation(), 500);
    }
  };

  const evaluateAnswer = (question: typeof questions[0], answer: string): EvaluationResult => {
    // Simulated AI evaluation based on mark scheme keywords
    const keywords = question.markScheme.toLowerCase().split(/[\s,.;:()]+/).filter(w => w.length > 3);
    const answerLower = answer.toLowerCase();
    const answerWords = answerLower.split(/[\s,.;:()]+/).filter(w => w.length > 2);

    let matchCount = 0;
    keywords.forEach(kw => {
      if (answerWords.some(aw => aw.includes(kw) || kw.includes(aw))) {
        matchCount++;
      }
    });

    // Check for numbers in answer vs mark scheme
    const numbersInScheme: string[] = question.markScheme.match(/\d+/g) || [];
    const numbersInAnswer: string[] = answer.match(/\d+/g) || [];
    numbersInScheme.forEach((num: string) => {
      if (numbersInAnswer.includes(num)) matchCount += 2;
    });

    const accuracyRatio = Math.min(matchCount / Math.max(keywords.length * 0.4, 1), 1);
    const score = Math.round(accuracyRatio * question.maxMarks * 10) / 10;
    const timeBonus = timeLeft / question.timeLimit;
    const totalScore = score * (0.7 + 0.3 * timeBonus);

    let feedback = '';
    if (accuracyRatio >= 0.8) feedback = 'Excellent! Your answer covers the key points.';
    else if (accuracyRatio >= 0.5) feedback = 'Good attempt! Some key elements are missing.';
    else if (accuracyRatio >= 0.2) feedback = 'Partial answer. Review the mark scheme for what was expected.';
    else feedback = 'Your answer doesn\'t match the expected response. Check the mark scheme.';

    return {
      responseId: uuidv4(),
      questionId: question.id,
      studentId,
      score,
      maxScore: question.maxMarks,
      feedback,
      timeBonus: Math.round(timeBonus * 100) / 100,
      totalScore: Math.round(totalScore * 10) / 10,
    };
  };

  const simulateOpponent = (): EvaluationResult[] => {
    return questions.map(q => {
      const opponentAccuracy = 0.3 + Math.random() * 0.5;
      const score = Math.round(opponentAccuracy * q.maxMarks * 10) / 10;
      const timeRatio = 0.4 + Math.random() * 0.5;
      const totalScore = score * (0.7 + 0.3 * timeRatio);
      return {
        responseId: uuidv4(),
        questionId: q.id,
        studentId: opponentId,
        score,
        maxScore: q.maxMarks,
        feedback: '',
        timeBonus: Math.round(timeRatio * 100) / 100,
        totalScore: Math.round(totalScore * 10) / 10,
      };
    });
  };

  const startEvaluation = () => {
    setEvaluating(true);

    const myEvaluations = questions.map((q, i) => evaluateAnswer(q, answers[i]));
    const opponentEvaluations = simulateOpponent();

    const myTotal = myEvaluations.reduce((sum, e) => sum + e.totalScore, 0);
    const oppTotal = opponentEvaluations.reduce((sum, e) => sum + e.totalScore, 0);

    const myResult: SessionResult = {
      sessionId: sessionId!,
      studentId,
      opponentId,
      evaluations: myEvaluations,
      totalScore: myTotal,
      opponentScore: oppTotal,
      won: myTotal >= oppTotal,
      timestamp: new Date().toISOString(),
    };

    const oppResult: SessionResult = {
      sessionId: sessionId!,
      studentId: opponentId,
      opponentId: studentId,
      evaluations: opponentEvaluations,
      totalScore: oppTotal,
      opponentScore: myTotal,
      won: oppTotal > myTotal,
      timestamp: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_SESSION_RESULT', payload: myResult });
    dispatch({ type: 'ADD_SESSION_RESULT', payload: oppResult });

    // Update LO mastery
    updateLOMastery(myEvaluations);

    // Update session status
    if (session) {
      dispatch({
        type: 'UPDATE_SESSION',
        payload: { ...session, status: 'completed', endTime: new Date().toISOString() },
      });
    }

    setTimeout(() => navigate(`/student/results/${sessionId}`), 2000);
  };

  const updateLOMastery = (evaluations: EvaluationResult[]) => {
    let existing = state.studentProgress.find(p => p.studentId === studentId);
    if (!existing) {
      existing = {
        studentId,
        loMastery: [],
        sessionResults: [],
        totalSessions: 0,
        averageScore: 0,
      };
    }

    const loScores: Record<string, { total: number; count: number }> = {};
    evaluations.forEach(ev => {
      const question = questions.find(q => q.id === ev.questionId);
      if (question) {
        question.learningOutcomes.forEach(loId => {
          if (!loScores[loId]) loScores[loId] = { total: 0, count: 0 };
          const ratio = ev.maxScore > 0 ? ev.score / ev.maxScore : 0;
          loScores[loId].total += ratio;
          loScores[loId].count += 1;
        });
      }
    });

    const updatedMastery = [...existing.loMastery];
    Object.entries(loScores).forEach(([loId, data]) => {
      const avgRatio = data.total / data.count;
      const existingLO = updatedMastery.find(m => m.learningOutcomeId === loId);
      if (existingLO) {
        // Weighted average with previous mastery
        const newMastery = (existingLO.masteryScore * existingLO.attempts + avgRatio) / (existingLO.attempts + 1);
        existingLO.masteryScore = Math.round(newMastery * 100) / 100;
        existingLO.attempts += 1;
        existingLO.lastUpdated = new Date().toISOString();
      } else {
        updatedMastery.push({
          learningOutcomeId: loId,
          masteryScore: Math.round(avgRatio * 100) / 100,
          attempts: 1,
          lastUpdated: new Date().toISOString(),
        });
      }
    });

    const newResult = { sessionId: sessionId!, studentId, opponentId, evaluations, totalScore: evaluations.reduce((s, e) => s + e.totalScore, 0), opponentScore: 0, won: true, timestamp: new Date().toISOString() };
    const allResults = [...existing.sessionResults, newResult] as any;

    const progress: StudentProgress = {
      studentId,
      loMastery: updatedMastery,
      sessionResults: allResults,
      totalSessions: existing.totalSessions + 1,
      averageScore: allResults.reduce((s: number, r: any) => s + r.totalScore, 0) / allResults.length,
    };

    dispatch({ type: 'UPDATE_STUDENT_PROGRESS', payload: progress });
  };

  // Countdown screen
  if (showCountdown) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <motion.div
          key={countdown}
          initial={{ scale: 2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="text-center"
        >
          <div className="text-8xl font-bold text-yellow-400 mb-4">
            {countdown || 'GO!'}
          </div>
          <p className="text-gray-400 text-xl">Get ready to battle {opponent?.name}!</p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-2">
                <span className="text-2xl">🎮</span>
              </div>
              <p className="text-white text-sm">{state.currentUser?.name}</p>
            </div>
            <Swords className="w-8 h-8 text-yellow-400" />
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-2">
                <span className="text-2xl">⚔️</span>
              </div>
              <p className="text-white text-sm">{opponent?.name}</p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Evaluating screen
  if (evaluating) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-20 h-20 rounded-full border-4 border-yellow-400 border-t-transparent mx-auto mb-6"
          />
          <h2 className="text-white text-2xl font-bold mb-2">AI Evaluating Responses...</h2>
          <p className="text-gray-400">Comparing answers against mark schemes</p>
        </motion.div>
      </div>
    );
  }

  const question = questions[currentQ];
  if (!question || !session) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white">Session not found</p>
      </div>
    );
  }

  const progress = ((currentQ) / questions.length) * 100;
  const timerPercent = (timeLeft / question.timeLimit) * 100;
  const timerColor = timerPercent > 50 ? 'text-green-400' : timerPercent > 25 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Game Header */}
      <div className="bg-gray-800/80 backdrop-blur-xl border-b border-gray-700 px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm">Q{currentQ + 1}/{questions.length}</span>
            <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
              />
            </div>
          </div>
          <div className={`flex items-center gap-2 ${timerColor}`}>
            <Clock className="w-5 h-5" />
            <span className="font-mono font-bold text-xl">{timeLeft}s</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">vs</span>
            <span className="text-white font-medium text-sm">{opponent?.name}</span>
          </div>
        </div>
      </div>

      {/* Timer Bar */}
      <div className="h-1 bg-gray-800">
        <motion.div
          animate={{ width: `${timerPercent}%` }}
          transition={{ duration: 0.5 }}
          className={`h-full ${timerPercent > 50 ? 'bg-green-500' : timerPercent > 25 ? 'bg-yellow-500' : 'bg-red-500'}`}
        />
      </div>

      {/* Question Area */}
      <div className="flex-1 flex items-center justify-center p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-3xl"
          >
            <div className="bg-gray-800 rounded-3xl p-8 border border-gray-700 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 text-sm font-medium">{question.maxMarks} marks available</span>
                {question.learningOutcomes.map(loId => {
                  const lo = state.learningOutcomes.find(l => l.id === loId);
                  return lo ? (
                    <span key={loId} className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs">
                      {lo.name}
                    </span>
                  ) : null;
                })}
              </div>
              <h2 className="text-white text-xl font-medium leading-relaxed">{question.text}</h2>
            </div>

            <div className="bg-gray-800 rounded-3xl p-6 border border-gray-700">
              <textarea
                value={answers[currentQ]}
                onChange={e => {
                  if (!isLocked) {
                    const newAnswers = [...answers];
                    newAnswers[currentQ] = e.target.value;
                    setAnswers(newAnswers);
                  }
                }}
                disabled={isLocked}
                rows={6}
                className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none disabled:opacity-50"
                placeholder={isLocked ? '🔒 Answer locked!' : 'Type your answer here...'}
              />

              {isLocked && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 mt-3 text-yellow-400"
                >
                  <Lock className="w-4 h-4" />
                  <span className="text-sm">Answer locked - time's up!</span>
                </motion.div>
              )}

              <div className="flex justify-end mt-4">
                {!isLocked && answers[currentQ] && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={handleSubmit}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold hover:scale-105 transition-transform flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {currentQ < questions.length - 1 ? 'Next Question' : 'Submit All'}
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
