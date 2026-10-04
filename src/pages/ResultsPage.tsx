import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { motion } from 'framer-motion';
import { Trophy, ArrowLeft, Target, Clock, Star, TrendingUp } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

export function ResultsPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { state } = useApp();
  const studentId = state.currentUser!.id;

  const result = state.sessionResults.find(r => r.sessionId === sessionId && r.studentId === studentId);
  const session = state.sessions.find(s => s.id === sessionId);
  const opponent = result ? state.users.find(u => u.id === result.opponentId) : null;
  const questions = session ? state.questions.filter(q => session.questionIds.includes(q.id)) : [];

  useEffect(() => {
    if (result?.won) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  }, [result]);

  if (!result || !session) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white">Results not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800/80 backdrop-blur-xl border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/student')} className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-white font-bold text-lg">Battle Results</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Winner Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-3xl p-8 text-center mb-8 ${
            result.won
              ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30'
              : 'bg-gradient-to-br from-gray-700/50 to-gray-800/50 border border-gray-600'
          }`}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.3 }}
            className="text-6xl mb-4"
          >
            {result.won ? '🏆' : '💪'}
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-2">
            {result.won ? 'Victory!' : 'Good Effort!'}
          </h2>
          <p className="text-gray-300 text-lg">
            {result.won ? `You defeated ${opponent?.name}!` : `${opponent?.name} won this round. Keep practicing!`}
          </p>
        </motion.div>

        {/* Score Comparison */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-800 rounded-2xl p-6 text-center border border-gray-700"
          >
            <p className="text-gray-400 text-sm mb-2">You</p>
            <p className={`text-4xl font-bold ${result.won ? 'text-green-400' : 'text-red-400'}`}>
              {result.totalScore.toFixed(1)}
            </p>
            <p className="text-gray-500 text-xs mt-1">{state.currentUser?.name}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="bg-gray-800 rounded-2xl p-6 text-center border border-gray-700 flex items-center justify-center"
          >
            <Trophy className="w-10 h-10 text-yellow-400" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-800 rounded-2xl p-6 text-center border border-gray-700"
          >
            <p className="text-gray-400 text-sm mb-2">Opponent</p>
            <p className={`text-4xl font-bold ${!result.won ? 'text-green-400' : 'text-red-400'}`}>
              {result.opponentScore.toFixed(1)}
            </p>
            <p className="text-gray-500 text-xs mt-1">{opponent?.name}</p>
          </motion.div>
        </div>

        {/* Detailed Question Results */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 mb-8">
          <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
            <Target className="w-6 h-6 text-cyan-400" />
            Question Breakdown
          </h3>
          <div className="space-y-4">
            {result.evaluations.map((ev, i) => {
              const question = questions.find(q => q.id === ev.questionId);
              return (
                <motion.div
                  key={ev.responseId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="bg-gray-700/50 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-white text-sm font-medium flex-1 mr-4">
                      Q{i + 1}: {question?.text}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-lg text-sm font-bold ${
                        ev.score / ev.maxScore >= 0.7 ? 'bg-green-500/20 text-green-400' :
                        ev.score / ev.maxScore >= 0.4 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {ev.score}/{ev.maxScore}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />Time bonus: {(ev.timeBonus * 100).toFixed(0)}%
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3" />Total: {ev.totalScore.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mt-2 italic">{ev.feedback}</p>
                  {question && (
                    <details className="mt-2">
                      <summary className="text-gray-500 text-xs cursor-pointer hover:text-gray-300">View Mark Scheme</summary>
                      <p className="text-gray-400 text-xs mt-1 bg-gray-800/50 rounded-lg p-2">{question.markScheme}</p>
                    </details>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* LO Mastery Update */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 mb-8">
          <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-pink-400" />
            Updated LO Mastery
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {result.evaluations.map((ev, i) => {
              const question = questions.find(q => q.id === ev.questionId);
              if (!question) return null;
              return question.learningOutcomes.map(loId => {
                const lo = state.learningOutcomes.find(l => l.id === loId);
                const progress = state.studentProgress.find(p => p.studentId === studentId);
                const mastery = progress?.loMastery.find(m => m.learningOutcomeId === loId);
                return (
                  <div key={`${loId}-${i}`} className="bg-gray-700/50 rounded-xl p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-white text-sm">{lo?.name}</span>
                      <span className={`text-sm font-bold ${
                        (mastery?.masteryScore || 0) >= 0.7 ? 'text-green-400' :
                        (mastery?.masteryScore || 0) >= 0.4 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {((mastery?.masteryScore || 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(mastery?.masteryScore || 0) * 100}%` }}
                        transition={{ duration: 1, delay: 1 + i * 0.2 }}
                        className={`h-full rounded-full ${
                          (mastery?.masteryScore || 0) >= 0.7 ? 'bg-green-500' :
                          (mastery?.masteryScore || 0) >= 0.4 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                      />
                    </div>
                  </div>
                );
              });
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate('/student')}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold hover:scale-105 transition-transform"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
