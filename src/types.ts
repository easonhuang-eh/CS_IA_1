export type UserRole = 'student' | 'teacher';

export interface User {
  id: string;
  name: string;
  password: string;
  role: UserRole;
  createdAt: string;
}

export interface LearningOutcome {
  id: string;
  name: string;
  subject: string;
}

export interface Question {
  id: string;
  text: string;
  markScheme: string;
  learningOutcomes: string[];
  timeLimit: number; // seconds
  maxMarks: number;
  createdBy: string;
  createdAt: string;
}

export interface StudentResponse {
  id: string;
  questionId: string;
  studentId: string;
  answer: string;
  submittedAt: string;
  timeRemaining: number;
}

export interface EvaluationResult {
  responseId: string;
  questionId: string;
  studentId: string;
  score: number;
  maxScore: number;
  feedback: string;
  timeBonus: number;
  totalScore: number;
}

export interface GameSession {
  id: string;
  teacherId: string;
  questionIds: string[];
  status: 'waiting' | 'active' | 'evaluating' | 'completed';
  participants: string[];
  pairs: [string, string][];
  startTime?: string;
  endTime?: string;
  createdAt: string;
}

export interface SessionResult {
  sessionId: string;
  studentId: string;
  opponentId: string;
  evaluations: EvaluationResult[];
  totalScore: number;
  opponentScore: number;
  won: boolean;
  timestamp: string;
}

export interface LOMastery {
  learningOutcomeId: string;
  masteryScore: number; // 0-1 scale
  attempts: number;
  lastUpdated: string;
}

export interface StudentProgress {
  studentId: string;
  loMastery: LOMastery[];
  sessionResults: SessionResult[];
  totalSessions: number;
  averageScore: number;
}
