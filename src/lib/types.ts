// Shared API DTO shapes mirroring the Spring Boot backend.

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  premium: boolean;
  resumeUrl: string | null;
}

export interface ScrapedJobResponse {
  title: string;
  company: string;
  description: string;
  requirements: string;
}

export interface JobTarget extends ScrapedJobResponse {
  id: number;
  createdAt: string;
  userId: number;
}

export interface ResumeGradeReport {
  matchingScore: number;
  summary: string;
  matchedSkills: string[];
  criticalGaps: string[];
  actionableImprovements: string[];
}

export interface InterviewQuestion {
  question: string;
  conceptEvaluated: string;
  structuralHint: string;
}

export interface InterviewQuestionSet {
  jobId: number;
  jobTitle: string;
  company: string;
  questions: InterviewQuestion[];
}

export interface AuthUser {
  userId: number;
  email: string;
  premium?: boolean;
  resumeUrl?: string | null;
}
