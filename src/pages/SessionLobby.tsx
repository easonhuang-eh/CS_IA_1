import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Users, Clock, Zap, Trophy } from 'lucide-react';

export function SessionLobby() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();

  const session = state.sessions.find(s => s.id === sessionId);

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white">Session not found</p>
      </div>
    );
  }

  const questions = state.questions.filter(q => session.questionIds.includes(q.id));
  const totalTime = questions.reduce((sum, q) => sum + q.timeLimit, 0);
  const totalMarks = questions.reduce((sum, q) => sum + q.maxMarks, 0);

  const startSession = () => {
    dispatch({
      type: 'UPDATE_SESSION',
      payload: { ...session, status: 'active', startTime: new Date().toISOString() },
    });
  };

  const getStudentPair = (studentId: string) => {
    return session.pairs.find(p => p.includes(studentId));
  };

  const getOpponent = (studentId: string) => {
    const pair = getStudentPair(studentId);
    if (!pair) return null;
    const opponentId = pair.find(id => id !== studentId);
    return state.users.find(u => u.id === opponentId);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800/80 backdrop-blur-xl border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/teacher')} className="text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-white font-bold text-lg">Session Lobby</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              session.status === 'active' ? 'bg-green-500/20 text-green-400 animate-pulse' :
              session.status === 'completed' ? 'bg-gray-500/20 text-gray-400' :
              'bg-blue-500/20 text-blue-400'
            }`}>
              {session.status.toUpperCase()}
            </span>
          </div>
          {session.status === 'waiting' && (
            <button
              onClick={startSession}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold hover:scale-105 transition-transform flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Start Session
            </button>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Session Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Zap, label: 'Questions', value: questions.length, color: 'from-blue-500 to-cyan-500' },
            { icon: Clock, label: 'Total Time', value: `${totalTime}s`, color: 'from-yellow-500 to-orange-500' },
            { icon: Trophy, label: 'Total Marks', value: totalMarks, color: 'from-green-500 to-emerald-500' },
            { icon: Users, label: 'Participants', value: session.participants.length, color: 'from-purple-500 to-pink-500' },
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

        {/* Pairs */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 mb-8">
          <h2 className="text-white font-bold text-xl mb-6">Competitive Pairs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {session.pairs.map((pair, i) => {
              const student1 = state.users.find(u => u.id === pair[0]);
              const student2 = state.users.find(u => u.id === pair[1]);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="bg-gray-700/50 rounded-xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <span className="text-blue-400 font-bold text-sm">{student1?.name.charAt(0)}</span>
                    </div>
                    <span className="text-white font-medium">{student1?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400 font-bold text-sm">VS</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white font-medium">{student2?.name}</span>
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                      <span className="text-red-400 font-bold text-sm">{student2?.name.charAt(0)}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Questions Preview */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h2 className="text-white font-bold text-xl mb-4">Questions in Session</h2>
          <div className="space-y-3">
            {questions.map((q, i) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                className="bg-gray-700/30 rounded-xl p-4 flex items-center gap-4"
              >
                <span className="w-8 h-8 rounded-lg bg-gray-600 flex items-center justify-center text-white text-sm font-bold">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-white text-sm">{q.text}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-gray-400 text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" />{q.timeLimit}s
                    </span>
                    <span className="text-gray-400 text-xs">{q.maxMarks} marks</span>
                    {q.learningOutcomes.map(loId => {
                      const lo = state.learningOutcomes.find(l => l.id === loId);
                      return lo ? (
                        <span key={loId} className="text-purple-400 text-xs">{lo.name}</span>
                      ) : null;
                    })}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Live Scoreboard (when active) */}
        {session.status === 'active' && (
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 mt-8">
            <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              Live Scoreboard
            </h2>
            <div className="space-y-2">
              {session.participants.map((studentId, i) => {
                const student = state.users.find(u => u.id === studentId);
                const results = state.sessionResults.filter(r => r.sessionId === session.id && r.studentId === studentId);
                const score = results.reduce((s, r) => s + r.totalScore, 0);
                return (
                  <motion.div
                    key={studentId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4 p-3 rounded-xl bg-gray-700/30"
                  >
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      i === 0 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-700 text-gray-400'
                    }`}>
                      {i + 1}
                    </span>
                    <span className="text-white font-medium flex-1">{student?.name}</span>
                    <span className="text-blue-400 font-bold">{score.toFixed(1)}</span>
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
