import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, Question, GameSession, SessionResult, StudentProgress, LOMastery, LearningOutcome } from './types';
import { v4 as uuidv4 } from 'uuid';

interface AppState {
  currentUser: User | null;
  users: User[];
  questions: Question[];
  sessions: GameSession[];
  sessionResults: SessionResult[];
  studentProgress: StudentProgress[];
  learningOutcomes: LearningOutcome[];
  currentSession: GameSession | null;
}

type Action =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'REGISTER_USER'; payload: User }
  | { type: 'ADD_QUESTION'; payload: Question }
  | { type: 'DELETE_QUESTION'; payload: string }
  | { type: 'CREATE_SESSION'; payload: GameSession }
  | { type: 'UPDATE_SESSION'; payload: GameSession }
  | { type: 'ADD_SESSION_RESULT'; payload: SessionResult }
  | { type: 'UPDATE_STUDENT_PROGRESS'; payload: StudentProgress }
  | { type: 'ADD_LEARNING_OUTCOME'; payload: LearningOutcome }
  | { type: 'SET_CURRENT_SESSION'; payload: GameSession | null }
  | { type: 'LOAD_STATE'; payload: Partial<AppState> };

const defaultLOs: LearningOutcome[] = [
  { id: 'lo-1', name: 'Solve linear equations', subject: 'Mathematics' },
  { id: 'lo-2', name: 'Calculate area and perimeter', subject: 'Mathematics' },
  { id: 'lo-3', name: 'Identify parts of speech', subject: 'English' },
  { id: 'lo-4', name: 'Understand cell structure', subject: 'Biology' },
  { id: 'lo-5', name: 'Apply Newton\'s laws', subject: 'Physics' },
  { id: 'lo-6', name: 'Analyze historical sources', subject: 'History' },
];

const defaultQuestions: Question[] = [
  {
    id: 'q-1',
    text: 'Solve for x: 3x + 7 = 22',
    markScheme: 'x = 5. Award 1 mark for correct answer. Accept working: 3x = 22-7 = 15, x = 15/3 = 5',
    learningOutcomes: ['lo-1'],
    timeLimit: 60,
    maxMarks: 2,
    createdBy: 'teacher-1',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q-2',
    text: 'Calculate the area of a rectangle with length 8cm and width 5cm.',
    markScheme: 'Area = length × width = 8 × 5 = 40 cm². Award 1 mark for correct formula, 1 mark for correct answer with units.',
    learningOutcomes: ['lo-2'],
    timeLimit: 45,
    maxMarks: 2,
    createdBy: 'teacher-1',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q-3',
    text: 'Identify the noun, verb, and adjective in: "The quick brown fox jumps over the lazy dog."',
    markScheme: 'Nouns: fox, dog. Verb: jumps. Adjectives: quick, brown, lazy. Award 1 mark per correct identification.',
    learningOutcomes: ['lo-3'],
    timeLimit: 90,
    maxMarks: 6,
    createdBy: 'teacher-1',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q-4',
    text: 'Name three organelles found in an animal cell and state one function of each.',
    markScheme: 'Accept: Nucleus (controls cell activities), Mitochondria (energy production/respiration), Cell membrane (controls what enters/leaves), Ribosomes (protein synthesis), Cytoplasm (where reactions occur). Award 1 mark per organelle, 1 mark per function.',
    learningOutcomes: ['lo-4'],
    timeLimit: 120,
    maxMarks: 6,
    createdBy: 'teacher-1',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q-5',
    text: 'A car of mass 1200kg accelerates at 3 m/s². Calculate the resultant force acting on the car.',
    markScheme: 'F = ma = 1200 × 3 = 3600 N. Award 1 mark for correct formula, 1 mark for substitution, 1 mark for answer with units.',
    learningOutcomes: ['lo-5'],
    timeLimit: 60,
    maxMarks: 3,
    createdBy: 'teacher-1',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q-6',
    text: 'Solve for y: 2y - 4 = 10',
    markScheme: 'y = 7. Award 1 mark for correct answer. Accept working: 2y = 14, y = 7',
    learningOutcomes: ['lo-1'],
    timeLimit: 45,
    maxMarks: 2,
    createdBy: 'teacher-1',
    createdAt: new Date().toISOString(),
  },
];

const defaultUsers: User[] = [
  { id: 'teacher-1', name: 'Mr. Thompson', password: 'teacher123', role: 'teacher', createdAt: new Date().toISOString() },
  { id: 'student-1', name: 'Alice Chen', password: 'student123', role: 'student', createdAt: new Date().toISOString() },
  { id: 'student-2', name: 'Bob Martinez', password: 'student123', role: 'student', createdAt: new Date().toISOString() },
  { id: 'student-3', name: 'Charlie Kim', password: 'student123', role: 'student', createdAt: new Date().toISOString() },
  { id: 'student-4', name: 'Diana Patel', password: 'student123', role: 'student', createdAt: new Date().toISOString() },
  { id: 'student-5', name: 'Ethan Wright', password: 'student123', role: 'student', createdAt: new Date().toISOString() },
  { id: 'student-6', name: 'Fiona O\'Brien', password: 'student123', role: 'student', createdAt: new Date().toISOString() },
];

const initialState: AppState = {
  currentUser: null,
  users: defaultUsers,
  questions: defaultQuestions,
  sessions: [],
  sessionResults: [],
  studentProgress: [],
  learningOutcomes: defaultLOs,
  currentSession: null,
};

function loadFromStorage(): Partial<AppState> {
  try {
    const saved = localStorage.getItem('donow-arena-state');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load state:', e);
  }
  return {};
}

function saveToStorage(state: AppState) {
  try {
    const { currentUser, currentSession, ...saveable } = state;
    localStorage.setItem('donow-arena-state', JSON.stringify(saveable));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, currentUser: action.payload };
    case 'REGISTER_USER':
      return { ...state, users: [...state.users, action.payload] };
    case 'ADD_QUESTION':
      return { ...state, questions: [...state.questions, action.payload] };
    case 'DELETE_QUESTION':
      return { ...state, questions: state.questions.filter(q => q.id !== action.payload) };
    case 'CREATE_SESSION':
      return { ...state, sessions: [...state.sessions, action.payload] };
    case 'UPDATE_SESSION':
      return {
        ...state,
        sessions: state.sessions.map(s => s.id === action.payload.id ? action.payload : s),
        currentSession: state.currentSession?.id === action.payload.id ? action.payload : state.currentSession,
      };
    case 'ADD_SESSION_RESULT':
      return { ...state, sessionResults: [...state.sessionResults, action.payload] };
    case 'UPDATE_STUDENT_PROGRESS':
      return {
        ...state,
        studentProgress: state.studentProgress.map(p => p.studentId === action.payload.studentId ? action.payload : p).concat(
          state.studentProgress.find(p => p.studentId === action.payload.studentId) ? [] : [action.payload]
        ),
      };
    case 'ADD_LEARNING_OUTCOME':
      return { ...state, learningOutcomes: [...state.learningOutcomes, action.payload] };
    case 'SET_CURRENT_SESSION':
      return { ...state, currentSession: action.payload };
    case 'LOAD_STATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  login: (name: string, password: string) => boolean;
  register: (name: string, password: string, role: 'student' | 'teacher') => boolean;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const saved = loadFromStorage();
    if (Object.keys(saved).length > 0) {
      dispatch({ type: 'LOAD_STATE', payload: saved });
    }
  }, []);

  useEffect(() => {
    saveToStorage(state);
  }, [state]);

  const login = (name: string, password: string): boolean => {
    const user = state.users.find(u => u.name === name && u.password === password);
    if (user) {
      dispatch({ type: 'SET_USER', payload: user });
      return true;
    }
    return false;
  };

  const register = (name: string, password: string, role: 'student' | 'teacher'): boolean => {
    if (state.users.find(u => u.name === name)) {
      return false;
    }
    const newUser: User = {
      id: uuidv4(),
      name,
      password,
      role,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'REGISTER_USER', payload: newUser });
    dispatch({ type: 'SET_USER', payload: newUser });
    return true;
  };

  const logout = () => {
    dispatch({ type: 'SET_USER', payload: null });
    dispatch({ type: 'SET_CURRENT_SESSION', payload: null });
  };

  return (
    <AppContext.Provider value={{ state, dispatch, login, register, logout }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
