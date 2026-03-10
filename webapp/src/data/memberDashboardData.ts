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

export interface WeeklyStats {
  hoursWorked: number;
  meetingHours: number;
  prsMerged: number;
}

export const memberProfile = {
  name: "Alex Chen",
  role: "Mid Developer",
};

export const memberKPIs = {
  wellbeing: { score: 42, trend: -23.6, status: "red" as const },
  skills: { score: 65, trend: 8.3, status: "yellow" as const },
  motivation: { score: 48, trend: -26.2, status: "red" as const },
  delivery: { score: 55, trend: -19.1, status: "yellow" as const },
};

export const memberSignals: MemberSignal[] = [
  {
    id: "s1",
    type: "warning",
    title: "Overtime Warning",
    description: "You've logged 48+ hours for 2 consecutive weeks. Consider discussing workload balance in your next 1:1.",
    time: "3h ago",
    unread: true,
  },
  {
    id: "s2",
    type: "opportunity",
    title: "Skill Opportunity: Cloud Architecture",
    description: "Based on your recent project work, investing in cloud architecture could open senior pathway opportunities.",
    time: "1d ago",
    unread: true,
  },
  {
    id: "s3",
    type: "recognition",
    title: "Recognition Nudge",
    description: "Your PR review throughput increased 30% this sprint. Great contribution to team velocity!",
    time: "2d ago",
    unread: false,
  },
  {
    id: "s4",
    type: "wellbeing",
    title: "Wellbeing Check-in",
    description: "Your work-life balance indicators suggest increased stress. Here are some resources and tips.",
    time: "3d ago",
    unread: false,
  },
  {
    id: "s5",
    type: "milestone",
    title: "Learning Milestone",
    description: 'You completed "Advanced TypeScript Patterns" — 12 hours logged this month toward your IDP goal.',
    time: "5d ago",
    unread: false,
  },
];

export const devPlanGoals: DevGoal[] = [
  { id: "g1", title: "Master Cloud Architecture", category: "Cloud", progress: 35, status: "on-track", description: "Complete AWS course and design a cloud migration plan", targetDate: "2026-06-30" },
  { id: "g2", title: "Improve System Design Skills", category: "Architecture", progress: 20, status: "behind", description: "Complete system design course and lead 2 architecture reviews", targetDate: "2026-09-30" },
  { id: "g3", title: "Contribute to Open Source", category: "Community", progress: 60, status: "on-track", description: "Make 5 meaningful contributions to team OSS projects", targetDate: "2026-04-30" },
  { id: "g4", title: "Leadership Readiness", category: "Leadership", progress: 80, status: "on-track", description: "Shadow team lead and facilitate 3 sprint retrospectives", targetDate: "2026-03-31" },
];

export const learningItems: LearningItem[] = [
  { id: "l1", title: "Advanced Cloud Architecture", category: "Cloud", duration: "20h", priority: "HIGH" },
  { id: "l2", title: "System Design Mentoring", category: "Architecture", duration: "8h", priority: "HIGH" },
  { id: "l3", title: "AWS Solutions Architect Cert", category: "Cloud", duration: "40h", priority: "MEDIUM" },
];

export const weeklyStats: WeeklyStats = {
  hoursWorked: 48,
  meetingHours: 18,
  prsMerged: 3,
};

export interface SprintContribution {
  name: string;
  tasks: number;
  points: number;
  status: "In Progress" | "Completed";
}

export const memberDeliveryStats = {
  hoursThisWeek: 48,
  prsMerged: 3,
  tasksCompleted: 7,
  meetingHours: 18,
};

export const sprintContributions: SprintContribution[] = [
  { name: "Sprint 12 (Current)", tasks: 7, points: 13, status: "In Progress" },
  { name: "Sprint 11", tasks: 5, points: 10, status: "Completed" },
  { name: "Sprint 10", tasks: 8, points: 16, status: "Completed" },
];

export const prepTopics = [
  "Discuss workload and meeting load — feeling stretched",
  "Ask about flexible schedule options",
  "Share interest in cloud architecture learning",
  "Clarify Q2 project expectations",
];

export const coachTips = [
  "Start by sharing how you're feeling honestly — your lead wants to help",
  'Frame concerns as opportunities: "I\'d love to invest more time in learning"',
  "Be specific about what would make your week better",
  "Ask about the team's priorities so you can align your goals",
];

export const memberWins = [
  "PR review throughput up 30%",
  "Completed Advanced TypeScript course",
  "Consistent code quality on recent tasks",
];

export const questionsToAsk = [
  "What are the team priorities for next quarter?",
  "Can we reduce my meeting load by 3-4 hours?",
  "Is there a mentoring opportunity for cloud skills?",
  "How is my overall performance being evaluated?",
];

export interface MemberSkill {
  name: string;
  level: number;
  trend: "up" | "down" | "stable";
}

export const memberSkills: MemberSkill[] = [
  { name: "TypeScript", level: 82, trend: "up" },
  { name: "React", level: 78, trend: "stable" },
  { name: "Cloud Architecture", level: 35, trend: "up" },
  { name: "System Design", level: 42, trend: "stable" },
  { name: "Node.js", level: 70, trend: "stable" },
  { name: "Testing", level: 65, trend: "up" },
  { name: "CI/CD", level: 55, trend: "down" },
  { name: "Leadership", level: 48, trend: "up" },
];
