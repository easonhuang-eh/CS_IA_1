import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { motion } from 'framer-motion';
import { ArrowLeft, BarChart3, Users, Target, TrendingUp, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export function AnalyticsPage() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [view, setView] = useState<'overview' | 'student' | 'questions'>('overview');

  const students = state.users.filter(u => u.role === 'student');
  const allResults = state.sessionResults;

  // Class overview data
  const classAvgScore = allResults.length > 0
    ? allResults.reduce((s, r) => s + r.totalScore, 0) / allResults.length
    : 0;

  const studentScores = students.map(student => {
    const results = allResults.filter(r => r.studentId === student.id);
    const avg = results.length > 0 ? results.reduce((s, r) => s + r.totalScore, 0) / results.length : 0;
    const wins = results.filter(r => r.won).length;
    return { name: student.name.split(' ')[0], score: Math.round(avg * 10) / 10, sessions: results.length, wins };
  }).sort((a, b) => b.score - a.score);

  // LO mastery data for radar chart
  const loMasteryData = state.learningOutcomes.map(lo => {
    const allMastery = state.studentProgress.flatMap(p => p.loMastery.filter(m => m.learningOutcomeId === lo.id));
    const avg = allMastery.length > 0 ? allMastery.reduce((s, m) => s + m.masteryScore, 0) / allMastery.length : 0;
    return { subject: lo.name.split(' ').slice(0, 2).join(' '), mastery: Math.round(avg * 100) };
  });

  // Difficult questions analysis
  const questionDifficulty = state.questions.map(q => {
    const relevantResults = allResults.flatMap(r => r.evaluations.filter(e => e.questionId === q.id));
    const avgScore = relevantResults.length > 0
      ? relevantResults.reduce((s, e) => s + (e.score / e.maxScore), 0) / relevantResults.length
      : 1;
    return {
      question: q.text.length > 40 ? q.text.substring(0, 40) + '...' : q.text,
      difficulty: Math.round((1 - avgScore) * 100),
      attempts: relevantResults.length,
      avgPercent: Math.round(avgScore * 100),
    };
  }).sort((a, b) => b.difficulty - a.difficulty);

  // Selected student data
  const selectedStudentData = selectedStudent ? state.studentProgress.find(p => p.studentId === selectedStudent) : null;
  const selectedStudentUser = selectedStudent ? state.users.find(u => u.id === selectedStudent) : null;
  const selectedStudentResults = allResults.filter(r => r.studentId === selectedStudent);

  const studentLOData = selectedStudentData?.loMastery.map(m => ({
    subject: state.learningOutcomes.find(lo => lo.id === m.learningOutcomeId)?.name.split(' ').slice(0, 2).join(' ') || 'Unknown',
    mastery: Math.round(m.masteryScore * 100),
    attempts: m.attempts,
  })) || [];

  const studentScoreHistory = selectedStudentResults.map((r, i) => ({
    session: `#${i + 1}`,
    score: Math.round(r.totalScore * 10) / 10,
    opponentScore: Math.round(r.opponentScore * 10) / 10,
  }));

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800/80 backdrop-blur-xl border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/teacher')} className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-white font-bold text-lg">Analytics Dashboard</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* View Tabs */}
        <div className="flex gap-2 mb-8">
          {[
            { key: 'overview', label: 'Class Overview', icon: BarChart3 },
            { key: 'student', label: 'Student Progress', icon: Users },
            { key: 'questions', label: 'Question Analysis', icon: Target },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setView(tab.key as any)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                view === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview View */}
        {view === 'overview' && (
          <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Sessions', value: state.sessions.length, color: 'text-blue-400' },
                { label: 'Total Responses', value: allResults.length, color: 'text-green-400' },
                { label: 'Class Average', value: classAvgScore.toFixed(1), color: 'text-yellow-400' },
                { label: 'Active Students', value: students.length, color: 'text-purple-400' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-gray-800 rounded-2xl p-5 border border-gray-700"
                >
                  <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Leaderboard */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-yellow-400" />
                Student Leaderboard
              </h3>
              <div className="space-y-2">
                {studentScores.map((student, i) => (
                  <motion.div
                    key={student.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4 p-3 rounded-xl bg-gray-700/30 hover:bg-gray-700/50 transition-colors"
                  >
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      i === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                      i === 1 ? 'bg-gray-400/20 text-gray-300' :
                      i === 2 ? 'bg-orange-500/20 text-orange-400' :
                      'bg-gray-700 text-gray-400'
                    }`}>
                      {i + 1}
                    </span>
                    <span className="text-white font-medium flex-1">{student.name}</span>
                    <span className="text-gray-400 text-sm">{student.sessions} sessions</span>
                    <span className="text-gray-400 text-sm">{student.wins}W</span>
                    <span className="text-blue-400 font-bold">{student.score}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <h3 className="text-white font-bold mb-4">Average Scores by Student</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={studentScores}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }} />
                    <Bar dataKey="score" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <h3 className="text-white font-bold mb-4">Class LO Mastery</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={loMasteryData}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis dataKey="subject" stroke="#9CA3AF" fontSize={10} />
                    <PolarRadiusAxis stroke="#374151" fontSize={10} />
                    <Radar name="Mastery" dataKey="mastery" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Student Progress View */}
        {view === 'student' && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-white font-bold text-xl mb-4">Select Student</h3>
              <div className="flex flex-wrap gap-2">
                {students.map(student => (
                  <button
                    key={student.id}
                    onClick={() => setSelectedStudent(student.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      selectedStudent === student.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {student.name}
                  </button>
                ))}
              </div>
            </div>

            {selectedStudent && selectedStudentData && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
                    <p className="text-gray-400 text-sm">Sessions</p>
                    <p className="text-2xl font-bold text-white">{selectedStudentData.totalSessions}</p>
                  </div>
                  <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
                    <p className="text-gray-400 text-sm">Average Score</p>
                    <p className="text-2xl font-bold text-blue-400">{selectedStudentData.averageScore.toFixed(1)}</p>
                  </div>
                  <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
                    <p className="text-gray-400 text-sm">Win Rate</p>
                    <p className="text-2xl font-bold text-green-400">
                      {selectedStudentResults.length > 0
                        ? `${((selectedStudentResults.filter(r => r.won).length / selectedStudentResults.length) * 100).toFixed(0)}%`
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                    <h3 className="text-white font-bold mb-4">LO Mastery - {selectedStudentUser?.name}</h3>
                    {studentLOData.length > 0 ? (
                      <div className="space-y-3">
                        {studentLOData.map((lo, i) => (
                          <div key={i}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-300">{lo.subject}</span>
                              <span className={`font-bold ${
                                lo.mastery >= 70 ? 'text-green-400' : lo.mastery >= 40 ? 'text-yellow-400' : 'text-red-400'
                              }`}>{lo.mastery}%</span>
                            </div>
                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${lo.mastery}%` }}
                                transition={{ duration: 0.8, delay: i * 0.1 }}
                                className={`h-full rounded-full ${
                                  lo.mastery >= 70 ? 'bg-green-500' : lo.mastery >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                              />
                            </div>
                            <p className="text-gray-500 text-xs mt-0.5">{lo.attempts} attempts</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-center py-4">No data yet</p>
                    )}
                  </div>

                  <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                    <h3 className="text-white font-bold mb-4">Score History</h3>
                    {studentScoreHistory.length > 0 ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={studentScoreHistory}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="session" stroke="#9CA3AF" fontSize={12} />
                          <YAxis stroke="#9CA3AF" fontSize={12} />
                          <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }} />
                          <Line type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6' }} />
                          <Line type="monotone" dataKey="opponentScore" stroke="#EF4444" strokeWidth={2} dot={{ fill: '#EF4444' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-gray-400 text-center py-4">No history yet</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Question Analysis View */}
        {view === 'questions' && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-orange-400" />
                Question Difficulty Analysis
              </h3>
              <p className="text-gray-400 text-sm mb-4">Questions ranked by difficulty (higher = more students struggled)</p>
              <div className="space-y-3">
                {questionDifficulty.map((q, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-gray-700/50 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white text-sm font-medium flex-1 mr-4">{q.question}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400 text-xs">{q.attempts} attempts</span>
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                          q.difficulty >= 60 ? 'bg-red-500/20 text-red-400' :
                          q.difficulty >= 30 ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {q.difficulty}% difficult
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${q.avgPercent}%` }}
                        transition={{ duration: 0.8, delay: i * 0.05 }}
                        className={`h-full rounded-full ${
                          q.avgPercent >= 70 ? 'bg-green-500' : q.avgPercent >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                      />
                    </div>
                    <p className="text-gray-500 text-xs mt-1">Average score: {q.avgPercent}%</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-white font-bold mb-4">Score Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={questionDifficulty.slice(0, 6)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="question" stroke="#9CA3AF" fontSize={10} angle={-20} textAnchor="end" height={60} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Bar dataKey="avgPercent" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="Avg Score %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
