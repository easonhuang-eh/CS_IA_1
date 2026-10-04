import { useApp } from '../store';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, Trophy, Target, TrendingUp, Gamepad2, Clock, Zap } from 'lucide-react';

export function StudentDashboard() {
  const { state, logout } = useApp();
  const navigate = useNavigate();
  const studentId = state.currentUser!.id;

  const myResults = state.sessionResults.filter(r => r.studentId === studentId);
  const myProgress = state.studentProgress.find(p => p.studentId === studentId);
  const avgScore = myResults.length > 0
    ? myResults.reduce((sum, r) => sum + r.totalScore, 0) / myResults.length
    : 0;
  const winRate = myResults.length > 0
    ? (myResults.filter(r => r.won).length / myResults.length * 100)
    : 0;

  const activeSessions = state.sessions.filter(s => s.status === 'waiting' || s.status === 'active');

  const getLORecommendations = () => {
    if (!myProgress) return [];
    return myProgress.loMastery
      .sort((a, b) => a.masteryScore - b.masteryScore)
      .slice(0, 3)
      .map(lo => ({
        ...lo,
        name: state.learningOutcomes.find(l => l.id === lo.learningOutcomeId)?.name || 'Unknown',
      }));
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800/80 backdrop-blur-xl border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">DoNow Arena</h1>
              <p className="text-gray-400 text-xs">Student Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-300 text-sm">Hi, {state.currentUser?.name}!</span>
            <button onClick={logout} className="text-gray-400 hover:text-white transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Trophy, label: 'Sessions Played', value: myResults.length, color: 'from-yellow-500 to-orange-500' },
            { icon: Target, label: 'Win Rate', value: `${winRate.toFixed(0)}%`, color: 'from-green-500 to-emerald-500' },
            { icon: TrendingUp, label: 'Avg Score', value: avgScore.toFixed(1), color: 'from-blue-500 to-cyan-500' },
            { icon: Gamepad2, label: 'Available', value: activeSessions.length, color: 'from-purple-500 to-pink-500' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-gray-800 rounded-2xl p-5 border border-gray-700"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Available Sessions */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 mb-8">
          <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-yellow-400" />
            Available Sessions
          </h2>
          {activeSessions.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-gray-500" />
              </div>
              <p className="text-gray-400">No active sessions. Wait for your teacher to start one!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeSessions.map(session => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gray-700/50 rounded-xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${session.status === 'active' ? 'bg-yellow-400 animate-pulse' : 'bg-blue-400'}`} />
                    <div>
                      <p className="text-white font-medium">
                        {session.questionIds.length} Questions • {session.participants.length} Players
                      </p>
                      <p className="text-gray-400 text-sm">
                        {session.status === 'active' ? '🔴 Live Now!' : '⏳ Waiting to start'}
                      </p>
                    </div>
                  </div>
                  {session.participants.includes(studentId) && (
                    <button
                      onClick={() => navigate(`/student/game/${session.id}`)}
                      className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-bold hover:scale-105 transition-transform"
                    >
                      Join Battle!
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* LO Mastery & Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
              <Target className="w-6 h-6 text-cyan-400" />
              LO Mastery Scores
            </h2>
            {myProgress && myProgress.loMastery.length > 0 ? (
              <div className="space-y-3">
                {myProgress.loMastery.map(lo => {
                  const loName = state.learningOutcomes.find(l => l.id === lo.learningOutcomeId)?.name || 'Unknown';
                  const percentage = (lo.masteryScore * 100).toFixed(0);
                  return (
                    <div key={lo.learningOutcomeId}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300 truncate mr-2">{loName}</span>
                        <span className={`font-bold ${
                          lo.masteryScore >= 0.7 ? 'text-green-400' :
                          lo.masteryScore >= 0.4 ? 'text-yellow-400' : 'text-red-400'
                        }`}>{percentage}%</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className={`h-full rounded-full ${
                            lo.masteryScore >= 0.7 ? 'bg-gradient-to-r from-green-500 to-emerald-400' :
                            lo.masteryScore >= 0.4 ? 'bg-gradient-to-r from-yellow-500 to-orange-400' :
                            'bg-gradient-to-r from-red-500 to-pink-400'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">Complete sessions to see your mastery scores</p>
            )}
          </div>

          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-pink-400" />
              Focus Areas
            </h2>
            {getLORecommendations().length > 0 ? (
              <div className="space-y-3">
                {getLORecommendations().map((rec, i) => (
                  <motion.div
                    key={rec.learningOutcomeId}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-gray-700/50 rounded-xl p-4 flex items-center gap-3"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                      i === 0 ? 'bg-red-500/20 text-red-400' :
                      i === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{rec.name}</p>
                      <p className="text-gray-400 text-xs">Mastery: {(rec.masteryScore * 100).toFixed(0)}% • {rec.attempts} attempts</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">Play some sessions to get personalized recommendations</p>
            )}
          </div>
        </div>

        {/* Recent Results */}
        {myResults.length > 0 && (
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 mt-8">
            <h2 className="text-white font-bold text-xl mb-4">Recent Battles</h2>
            <div className="space-y-3">
              {myResults.slice().reverse().slice(0, 5).map((result, i) => {
                const opponent = state.users.find(u => u.id === result.opponentId);
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-gray-700/50 rounded-xl p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        result.won ? 'bg-green-500/20' : 'bg-red-500/20'
                      }`}>
                        <span className="text-lg">{result.won ? '🏆' : '💪'}</span>
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">vs {opponent?.name || 'Unknown'}</p>
                        <p className="text-gray-400 text-xs">{new Date(result.timestamp).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${result.won ? 'text-green-400' : 'text-red-400'}`}>
                        {result.totalScore.toFixed(1)} - {result.opponentScore.toFixed(1)}
                      </p>
                      <p className="text-gray-400 text-xs">{result.won ? 'Victory!' : 'Defeat'}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
