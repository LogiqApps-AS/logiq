export type KPIStatus = "green" | "yellow" | "red";

export interface Employee {
  id: string;
  name: string;
  role: string;
  tenure: string;
  avatar: string;
  wellbeing: { score: number; status: KPIStatus };
  skills: { score: number; status: KPIStatus };
  motivation: { score: number; status: KPIStatus };
  delivery: { score: number; status: KPIStatus };
  churnRisk: "Low" | "Low-Med" | "Medium" | "At risk";
  churnPercent: number;
  narrative: string;
  sickDays: number;
  sickLeaveRate: number;
  meetingHours: number;
  meetingLoad: number;
  overtimeHours: number;
  replacementCost: number;
  sprintCompletion: number;
  prVelocity: number;
  learningHours: number;
  psychSafety: number;
  workLifeBalance: number;
  skillsCoverage: number;
  idpGoalProgress: number;
  feedbackScore360: number;
  engagementPulse: number;
  goalAchievement: number;
  retentionRate: number;
  preventabilityScore: number;
}

export interface Signal {
  id: string;
  type: "critical" | "warning" | "info";
  title: string;
  message: string;
  employeeId?: string;
  icon: string;
  time: string;
  action?: string;
  actionLabel?: string;
}

export interface MeetingTopic {
  id: string;
  icon: "heart" | "target" | "chart";
  text: string;
  status: "pending" | "discussed" | "deferred";
}

export interface FollowUpAction {
  id: string;
  text: string;
  done: boolean;
}

export interface Meeting {
  id: string;
  name: string;
  role: string;
  avatarColor: string;
  date: string;
  duration: string;
  topicCount: number;
  riskLevel?: "high" | "medium";
  topics: MeetingTopic[];
  notes: string;
  followUps: FollowUpAction[];
}

export interface DeferredTopic {
  id: string;
  text: string;
  person: string;
}

export interface Project {
  id: string;
  title: string;
  role: string;
  period: string;
  description: string;
  status: "Active" | "Completed" | "Planned";
  skills: string[];
}

export interface FeedbackEntry {
  id: string;
  reviewerName: string;
  reviewerRole: string;
  type: "Manager" | "Peer" | "Self";
  date: string;
  rating: number;
  comment: string;
  strengths: string[];
  growthAreas: string[];
}

export interface Training {
  id: string;
  title: string;
  provider: string;
  tags: string[];
  hours: number;
  startDate: string;
  completedDate?: string;
  status: "Completed" | "In Progress" | "Planned";
  score?: number;
}

export interface SignalEntry {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "warning" | "info";
  timeAgo: string;
}

export interface RoleHistory {
  title: string;
  department: string;
  period: string;
  duration: string;
  current: boolean;
}

export interface Certification {
  title: string;
  provider: string;
  status: "Completed" | "In Progress";
}

export interface MemberDetail {
  department: string;
  previousRole?: string;
  previousRolePeriod?: string;
  skills: string[];
  projects: Project[];
  feedback: FeedbackEntry[];
  training: Training[];
  signals: SignalEntry[];
  roleHistory: RoleHistory[];
  certifications: Certification[];
  feedbackScoreAvg: number;
  trainingHoursTotal: number;
  activeSignalsCount: number;
  projectCount: number;
}

export interface MemberSignal {
  id: string;
  type: "warning" | "opportunity" | "recognition" | "wellbeing" | "milestone";
  title: string;
  description: string;
  time: string;
  unread: boolean;
}

export interface DevGoal {
  id: string;
  title: string;
  category: string;
  progress: number;
  status: "on-track" | "behind" | "completed";
  description?: string;
  targetDate?: string;
}

export interface LearningItem {
  id: string;
  title: string;
  category: string;
  duration: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
}

export interface MemberSkill {
  name: string;
  level: number;
  trend: string;
}

export interface SprintContribution {
  name: string;
  tasks: number;
  points: number;
  status: string;
}

export interface MemberDeliveryStats {
  hoursThisWeek: number;
  prsMerged: number;
  tasksCompleted: number;
  meetingHours: number;
}

export interface MemberKpis {
  wellbeing: { score: number; status: string };
  skills: { score: number; status: string };
  motivation: { score: number; status: string };
  delivery: { score: number; status: string };
}

export interface MemberDashboard {
  employeeId: string;
  kpis: MemberKpis;
  signals: MemberSignal[];
  devGoals: DevGoal[];
  learningItems: LearningItem[];
  skills: MemberSkill[];
  sprintContributions: SprintContribution[];
  deliveryStats: MemberDeliveryStats;
  prepTopics: string[];
  coachTips: string[];
  wins: string[];
  questionsToAsk: string[];
}

export interface SkillsMatrix {
  allSkills: string[];
  employeeSkills: Record<string, string[]>;
}

export interface TeamKpiMetric {
  score: number;
  status: "green" | "yellow" | "red";
  label: string;
  trend: number;
  description: string;
}

export interface TeamKpis {
  wellbeing: TeamKpiMetric;
  skills: TeamKpiMetric;
  motivation: TeamKpiMetric;
  churn: TeamKpiMetric;
  delivery: TeamKpiMetric;
}

export interface TeamFinancials {
  atRiskCount: number;
  totalEmployees: number;
  churnExposure: number;
  totalPeopleRisk: number;
}
