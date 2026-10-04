import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { motion } from 'framer-motion';
import { BookOpen, BarChart3, Plus, LogOut, Users, Clock, Trophy, Zap } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { GameSession } from '../types';

export function TeacherDashboard() {
  const { state, dispatch, logout } = useApp();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

  const handleCreateSession = () => {
    if (selectedQuestions.length === 0) return;
    const students = state.users.filter(u => u.role === 'student');
    const pairs: [string, string][] = [];
    for (let i = 0; i < students.length - 1; i += 2) {
      pairs.push([students[i].id, students[i + 1].id]);
    }

    const session: GameSession = {
      id: uuidv4(),
      teacherId: state.currentUser!.id,
      questionIds: selectedQuestions,
      status: 'waiting',
      participants: students.map(s => s.id),
      pairs,
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: 'CREATE_SESSION', payload: session });
    setShowCreateModal(false);
    setSelectedQuestions([]);
    navigate(`/teacher/lobby/${session.id}`);
  };

  const startSession = (sessionId: string) => {
    const session = state.sessions.find(s => s.id === sessionId);
    if (session) {
      dispatch({
        type: 'UPDATE_SESSION',
        payload: { ...session, status: 'active', startTime: new Date().toISOString() },
      });
      navigate(`/teacher/lobby/${sessionId}`);
    }
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
              <p className="text-gray-400 text-xs">Teacher Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-300 text-sm">Welcome, {state.currentUser?.name}</span>
            <button onClick={logout} className="text-gray-400 hover:text-white transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: BookOpen, label: 'Questions', value: state.questions.length, color: 'from-blue-500 to-cyan-500' },
            { icon: Users, label: 'Students', value: state.users.filter(u => u.role === 'student').length, color: 'from-green-500 to-emerald-500' },
            { icon: Trophy, label: 'Sessions', value: state.sessions.length, color: 'from-yellow-500 to-orange-500' },
            { icon: BarChart3, label: 'Results', value: state.sessionResults.length, color: 'from-purple-500 to-pink-500' },
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => navigate('/teacher/questions')}
            className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-left hover:scale-[1.02] transition-transform"
          >
            <Plus className="w-8 h-8 text-blue-200 mb-3" />
            <h3 className="text-white font-bold text-lg">Manage Questions</h3>
            <p className="text-blue-200 text-sm mt-1">Create and edit assessment questions</p>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-br from-green-600 to-green-800 rounded-2xl p-6 text-left hover:scale-[1.02] transition-transform"
          >
            <Trophy className="w-8 h-8 text-green-200 mb-3" />
            <h3 className="text-white font-bold text-lg">Start New Session</h3>
            <p className="text-green-200 text-sm mt-1">Launch a competitive assessment</p>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            onClick={() => navigate('/teacher/analytics')}
            className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-6 text-left hover:scale-[1.02] transition-transform"
          >
            <BarChart3 className="w-8 h-8 text-purple-200 mb-3" />
            <h3 className="text-white font-bold text-lg">View Analytics</h3>
            <p className="text-purple-200 text-sm mt-1">Track student progress & performance</p>
          </motion.button>
        </div>

        {/* Recent Sessions */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h2 className="text-white font-bold text-xl mb-4">Recent Sessions</h2>
          {state.sessions.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No sessions yet. Create your first session to get started!</p>
          ) : (
            <div className="space-y-3">
              {state.sessions.slice().reverse().slice(0, 5).map(session => (
                <div key={session.id} className="bg-gray-700/50 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${
                      session.status === 'completed' ? 'bg-green-400' :
                      session.status === 'active' ? 'bg-yellow-400 animate-pulse' :
                      'bg-blue-400'
                    }`} />
                    <div>
                      <p className="text-white font-medium">{session.questionIds.length} Questions</p>
                      <p className="text-gray-400 text-sm">
                        {session.participants.length} students • {new Date(session.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      session.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      session.status === 'active' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {session.status}
                    </span>
                    {session.status === 'waiting' && (
                      <button
                        onClick={() => startSession(session.id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Start
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-3xl p-8 w-full max-w-lg border border-gray-700 max-h-[80vh] overflow-y-auto"
          >
            <h2 className="text-white font-bold text-2xl mb-2">Create New Session</h2>
            <p className="text-gray-400 mb-6">Select questions for the assessment</p>

            <div className="space-y-3 mb-6">
              {state.questions.map(q => (
                <label
                  key={q.id}
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedQuestions.includes(q.id)
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedQuestions.includes(q.id)}
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedQuestions([...selectedQuestions, q.id]);
                      } else {
                        setSelectedQuestions(selectedQuestions.filter(id => id !== q.id));
                      }
                    }}
                    className="mt-1 w-4 h-4 rounded accent-green-500"
                  />
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{q.text}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />{q.timeLimit}s
                      </span>
                      <span className="text-xs text-gray-400">• {q.maxMarks} marks</span>
                      <span className="text-xs text-purple-400">
                        {q.learningOutcomes.map(loId => state.learningOutcomes.find(lo => lo.id === loId)?.name).join(', ')}
                      </span>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowCreateModal(false); setSelectedQuestions([]); }}
                className="flex-1 py-3 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSession}
                disabled={selectedQuestions.length === 0}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] transition-all"
              >
                Create Session ({selectedQuestions.length})
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
