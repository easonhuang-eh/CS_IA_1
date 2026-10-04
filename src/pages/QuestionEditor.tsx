import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, Save, Clock, Tag, FileText } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export function QuestionEditor() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [markScheme, setMarkScheme] = useState('');
  const [selectedLOs, setSelectedLOs] = useState<string[]>([]);
  const [timeLimit, setTimeLimit] = useState(60);
  const [maxMarks, setMaxMarks] = useState(2);
  const [newLOName, setNewLOName] = useState('');
  const [newLOSubject, setNewLOSubject] = useState('');
  const [showLOForm, setShowLOForm] = useState(false);

  const resetForm = () => {
    setText('');
    setMarkScheme('');
    setSelectedLOs([]);
    setTimeLimit(60);
    setMaxMarks(2);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = () => {
    if (!text || !markScheme || selectedLOs.length === 0) return;

    if (editingId) {
      dispatch({ type: 'DELETE_QUESTION', payload: editingId });
    }

    dispatch({
      type: 'ADD_QUESTION',
      payload: {
        id: editingId || uuidv4(),
        text,
        markScheme,
        learningOutcomes: selectedLOs,
        timeLimit,
        maxMarks,
        createdBy: state.currentUser!.id,
        createdAt: new Date().toISOString(),
      },
    });
    resetForm();
  };

  const handleAddLO = () => {
    if (!newLOName || !newLOSubject) return;
    dispatch({
      type: 'ADD_LEARNING_OUTCOME',
      payload: { id: uuidv4(), name: newLOName, subject: newLOSubject },
    });
    setNewLOName('');
    setNewLOSubject('');
    setShowLOForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800/80 backdrop-blur-xl border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/teacher')} className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-white font-bold text-lg">Question Bank</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-400">{state.questions.length} questions in bank</p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowLOForm(!showLOForm)}
              className="px-4 py-2 rounded-xl border border-purple-500/50 text-purple-400 hover:bg-purple-500/10 transition-colors text-sm"
            >
              <Tag className="w-4 h-4 inline mr-1" />Manage LOs
            </button>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium hover:scale-105 transition-transform text-sm"
            >
              <Plus className="w-4 h-4 inline mr-1" />Add Question
            </button>
          </div>
        </div>

        {/* LO Form */}
        <AnimatePresence>
          {showLOForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gray-800 rounded-2xl p-6 border border-gray-700 mb-6 overflow-hidden"
            >
              <h3 className="text-white font-bold mb-4">Learning Outcomes</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {state.learningOutcomes.map(lo => (
                  <span key={lo.id} className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm">
                    {lo.name} <span className="text-purple-400/60">({lo.subject})</span>
                  </span>
                ))}
              </div>
              <div className="flex gap-3">
                <input
                  value={newLOName}
                  onChange={e => setNewLOName(e.target.value)}
                  placeholder="LO name"
                  className="flex-1 px-4 py-2 rounded-xl bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                />
                <input
                  value={newLOSubject}
                  onChange={e => setNewLOSubject(e.target.value)}
                  placeholder="Subject"
                  className="w-40 px-4 py-2 rounded-xl bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                />
                <button onClick={handleAddLO} className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-500 transition-colors">
                  Add
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Question Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gray-800 rounded-2xl p-6 border border-gray-700 mb-6"
            >
              <h3 className="text-white font-bold text-lg mb-4">
                {editingId ? 'Edit Question' : 'New Question'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-gray-300 text-sm font-medium mb-1 block">Question Text</label>
                  <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                    placeholder="Enter the question..."
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm font-medium mb-1 block">Mark Scheme</label>
                  <textarea
                    value={markScheme}
                    onChange={e => setMarkScheme(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                    placeholder="Describe how marks should be awarded..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-300 text-sm font-medium mb-1 flex items-center gap-1">
                      <Clock className="w-4 h-4" />Time Limit (seconds)
                    </label>
                    <input
                      type="number"
                      value={timeLimit}
                      onChange={e => setTimeLimit(Number(e.target.value))}
                      min={10}
                      max={300}
                      className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-gray-300 text-sm font-medium mb-1 flex items-center gap-1">
                      <FileText className="w-4 h-4" />Max Marks
                    </label>
                    <input
                      type="number"
                      value={maxMarks}
                      onChange={e => setMaxMarks(Number(e.target.value))}
                      min={1}
                      max={20}
                      className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-gray-300 text-sm font-medium mb-2 flex items-center gap-1">
                    <Tag className="w-4 h-4" />Learning Outcomes
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {state.learningOutcomes.map(lo => (
                      <button
                        key={lo.id}
                        onClick={() => {
                          if (selectedLOs.includes(lo.id)) {
                            setSelectedLOs(selectedLOs.filter(id => id !== lo.id));
                          } else {
                            setSelectedLOs([...selectedLOs, lo.id]);
                          }
                        }}
                        className={`px-3 py-1 rounded-full text-sm transition-all ${
                          selectedLOs.includes(lo.id)
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {lo.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={resetForm} className="px-6 py-3 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!text || !markScheme || selectedLOs.length === 0}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold disabled:opacity-50 hover:scale-105 transition-all"
                  >
                    <Save className="w-4 h-4 inline mr-1" />Save Question
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Question List */}
        <div className="space-y-3">
          {state.questions.map((q, i) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-gray-800 rounded-2xl p-5 border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-white font-medium mb-2">{q.text}</p>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />{q.timeLimit}s
                    </span>
                    <span className="text-gray-400">{q.maxMarks} marks</span>
                    {q.learningOutcomes.map(loId => {
                      const lo = state.learningOutcomes.find(l => l.id === loId);
                      return lo ? (
                        <span key={loId} className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs">
                          {lo.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                  <details className="mt-2">
                    <summary className="text-gray-500 text-xs cursor-pointer hover:text-gray-300">View Mark Scheme</summary>
                    <p className="text-gray-400 text-sm mt-1 bg-gray-700/50 rounded-lg p-3">{q.markScheme}</p>
                  </details>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => {
                      setEditingId(q.id);
                      setText(q.text);
                      setMarkScheme(q.markScheme);
                      setSelectedLOs(q.learningOutcomes);
                      setTimeLimit(q.timeLimit);
                      setMaxMarks(q.maxMarks);
                      setShowForm(true);
                    }}
                    className="p-2 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => dispatch({ type: 'DELETE_QUESTION', payload: q.id })}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
