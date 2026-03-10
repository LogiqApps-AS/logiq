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

export const meetingsData: Meeting[] = [
  {
    id: "1",
    name: "Alex Chen",
    role: "Mid Developer",
    avatarColor: "#0f6cbd",
    date: "2026-03-10",
    duration: "30m",
    topicCount: 3,
    riskLevel: "high",
    topics: [
      { id: "t1", icon: "heart", text: "Discuss burnout signals & workload", status: "pending" },
      { id: "t2", icon: "target", text: "Review Q1 delivery targets", status: "pending" },
      { id: "t3", icon: "chart", text: "TypeScript upskilling progress", status: "pending" },
    ],
    notes: "",
    followUps: [
      { id: "f1", text: "Check in on sick leave pattern", done: false },
      { id: "f2", text: "Share learning resources", done: false },
    ],
  },
  {
    id: "2",
    name: "Sarah Lin",
    role: "Senior Developer",
    avatarColor: "#7b2ff2",
    date: "2026-03-12",
    duration: "30m",
    topicCount: 2,
    topics: [
      { id: "t4", icon: "target", text: "Sprint velocity discussion", status: "pending" },
      { id: "t5", icon: "chart", text: "Mentoring junior devs", status: "pending" },
    ],
    notes: "",
    followUps: [],
  },
  {
    id: "3",
    name: "Lisa Wang",
    role: "QA Lead",
    avatarColor: "#e3008c",
    date: "2026-03-14",
    duration: "45m",
    topicCount: 2,
    riskLevel: "medium",
    topics: [
      { id: "t6", icon: "heart", text: "Team morale check-in", status: "pending" },
      { id: "t7", icon: "target", text: "QA process improvements", status: "pending" },
    ],
    notes: "",
    followUps: [],
  },
];

export const deferredTopics = [
  { id: "d1", text: "Work-life balance check-in", person: "Alex Chen" },
];

export const pastMeetings: Meeting[] = [
  {
    id: "p1",
    name: "Alex Chen",
    role: "Mid Developer",
    avatarColor: "#0f6cbd",
    date: "2026-03-03",
    duration: "30m",
    topicCount: 2,
    topics: [
      { id: "pt1", icon: "target", text: "Sprint review", status: "discussed" },
      { id: "pt2", icon: "chart", text: "Career goals check-in", status: "discussed" },
    ],
    notes: "Discussed career path. Alex interested in tech lead track.",
    followUps: [
      { id: "pf1", text: "Send tech lead resources", done: true },
    ],
  },
  {
    id: "p2",
    name: "Sarah Lin",
    role: "Senior Developer",
    avatarColor: "#7b2ff2",
    date: "2026-03-05",
    duration: "30m",
    topicCount: 2,
    topics: [
      { id: "pt3", icon: "target", text: "Project handoff", status: "discussed" },
      { id: "pt4", icon: "heart", text: "Workload balance", status: "discussed" },
    ],
    notes: "Sarah is managing well. No concerns.",
    followUps: [
      { id: "pf2", text: "Follow up on handoff doc", done: true },
    ],
  },
];
