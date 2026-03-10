import type { Employee } from "./sampleData";

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

// Detail data keyed by employee ID
export const memberDetails: Record<string, MemberDetail> = {
  "1": {
    department: "Engineering",
    previousRole: "Junior Developer",
    previousRolePeriod: "Sep 2023 – Aug 2024",
    skills: ["React", "TypeScript", "Node.js", "Python"],
    feedbackScoreAvg: 3.0,
    trainingHoursTotal: 70,
    activeSignalsCount: 3,
    projectCount: 3,
    projects: [
      {
        id: "p1", title: "Customer Portal Redesign", role: "Frontend Developer",
        period: "Jan 2026 – Present", status: "Active",
        description: "Leading the migration of the legacy customer portal to React/TypeScript with a modern design system.",
        skills: ["React", "TypeScript", "Tailwind", "REST APIs"],
      },
      {
        id: "p2", title: "Payment Gateway Integration", role: "Full-Stack Developer",
        period: "Jul 2025 – Dec 2025", status: "Completed",
        description: "Integrated Stripe and local payment providers into the checkout flow.",
        skills: ["Node.js", "TypeScript", "Stripe API", "PostgreSQL"],
      },
      {
        id: "p3", title: "Internal CLI Tooling", role: "Developer",
        period: "Mar 2025 – Jun 2025", status: "Completed",
        description: "Built internal CLI tools for automated code scaffolding and deployment pipelines.",
        skills: ["Python", "Click", "Docker"],
      },
    ],
    feedback: [
      {
        id: "f1", reviewerName: "Tom Eriksen", reviewerRole: "Tech Lead", type: "Manager",
        date: "2026-02-15", rating: 3, comment: "Alex has strong technical fundamentals but recent engagement and delivery have declined. Needs support and re-motivation.",
        strengths: ["Clean code quality", "TypeScript expertise", "Collaborative in code reviews"],
        growthAreas: ["Proactive communication", "Meeting deadlines", "Self-care and work-life balance"],
      },
      {
        id: "f2", reviewerName: "Sarah Lin", reviewerRole: "Senior Developer", type: "Peer",
        date: "2026-01-20", rating: 3, comment: "Alex is talented but seems disengaged lately. When focused, produces excellent work. I'd love to see more initiative.",
        strengths: ["React architecture knowledge", "Debugging skills"],
        growthAreas: ["Taking ownership of features end-to-end", "Asking for help earlier"],
      },
      {
        id: "f3", reviewerName: "Emma Nilsen", reviewerRole: "Junior Developer", type: "Peer",
        date: "2025-12-10", rating: 3, comment: "Alex helped me onboard and was very patient explaining the codebase. Great mentor when available.",
        strengths: ["Mentoring patience", "Technical explanations"],
        growthAreas: ["Availability — sometimes hard to reach"],
      },
      {
        id: "f4", reviewerName: "Alex Chen", reviewerRole: "Self", type: "Self",
        date: "2026-02-01", rating: 2, comment: "I feel overwhelmed and unmotivated. The workload feels unmanageable and I'm not growing in the direction I want.",
        strengths: ["Still passionate about frontend"],
        growthAreas: ["Need clearer career path", "Better work-life boundaries", "Want more challenging technical work"],
      },
    ],
    training: [
      {
        id: "t1", title: "Advanced TypeScript Patterns", provider: "Frontend Masters",
        tags: ["course", "TypeScript"], hours: 16, startDate: "2025-09-01", completedDate: "2025-10-15",
        status: "Completed", score: 92,
      },
      {
        id: "t2", title: "React Performance Deep Dive", provider: "Udemy",
        tags: ["course", "React"], hours: 12, startDate: "2025-07-01", completedDate: "2025-08-10",
        status: "Completed", score: 88,
      },
      {
        id: "t3", title: "AWS Cloud Practitioner", provider: "AWS",
        tags: ["certification", "Cloud"], hours: 20, startDate: "2026-01-15",
        status: "In Progress",
      },
      {
        id: "t4", title: "System Design Workshop", provider: "Internal",
        tags: ["workshop", "Architecture"], hours: 8, startDate: "2026-04-01",
        status: "Planned",
      },
      {
        id: "t5", title: "Node.js Microservices", provider: "Pluralsight",
        tags: ["course", "Backend"], hours: 14, startDate: "2025-04-01", completedDate: "2025-05-20",
        status: "Completed", score: 85,
      },
    ],
    signals: [
      {
        id: "s1", title: "Sick Leave Spike Detected", severity: "critical", timeAgo: "2h ago",
        description: "Alex Chen has taken 4 sick days in the last 3 weeks — 200% above team average. Combined with declining engagement metrics.",
      },
      {
        id: "s2", title: "Churn Risk Alert", severity: "critical", timeAgo: "4h ago",
        description: "Alex Chen shows elevated churn risk (78%). Multiple negative signals across wellbeing, motivation, and delivery. Estimated replacement cost: $126k.",
      },
      {
        id: "s3", title: "Learning Disengagement", severity: "warning", timeAgo: "2d ago",
        description: "Alex Chen has not logged any learning hours in 6 weeks. IDP progress stalled at 62%.",
      },
    ],
    roleHistory: [
      { title: "Mid Developer", department: "Engineering", period: "Sep 2024 – Present", duration: "1.5 years", current: true },
      { title: "Junior Developer", department: "Engineering", period: "Sep 2023 – Aug 2024", duration: "1 year", current: false },
    ],
    certifications: [
      { title: "AWS Cloud Practitioner", provider: "AWS", status: "In Progress" },
    ],
  },
  // Provide a simpler default for other employees
};

export function getMemberDetail(empId: string): MemberDetail {
  if (memberDetails[empId]) return memberDetails[empId];
  // Generate generic data for employees without specific detail
  return {
    department: "Engineering",
    skills: ["TypeScript", "React"],
    feedbackScoreAvg: 3.5,
    trainingHoursTotal: 40,
    activeSignalsCount: 0,
    projectCount: 1,
    projects: [
      {
        id: "gp1", title: "Team Project", role: "Developer",
        period: "2025 – Present", status: "Active",
        description: "Contributing to team initiatives.",
        skills: ["TypeScript", "React"],
      },
    ],
    feedback: [],
    training: [],
    signals: [],
    roleHistory: [
      { title: "Developer", department: "Engineering", period: "2024 – Present", duration: "1 year", current: true },
    ],
    certifications: [],
  };
}
