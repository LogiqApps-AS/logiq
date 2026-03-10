using Logiq.Api.Contracts;
using Logiq.Api.Storage.Repositories.Abstracts;

namespace Logiq.Api;

public sealed class DataSeeder(
    IEmployeeRepository employeeRepository,
    ISignalRepository signalRepository,
    IMeetingRepository meetingRepository,
    ITeamKpiRepository kpiRepository,
    IMemberRepository memberRepository,
    ILogger<DataSeeder> logger)
{
    private const string DefaultTeamId = "team1";

    public async Task SeedIfEmptyAsync(CancellationToken cancellationToken = default)
    {
        IReadOnlyList<Employee> existing;
        try
        {
            existing = await employeeRepository.ListByTeamAsync(DefaultTeamId, cancellationToken);
        }
        catch (Exception)
        {
            logger.LogWarning(
                "Seed skipped — storage not reachable. Start Azurite (e.g. npx azurite) or set Azure:Storage connection.");
            return;
        }

        if (existing.Count > 0)
        {
            logger.LogInformation("Data already seeded for team {TeamId} — skipping seed", DefaultTeamId);
            return;
        }

        logger.LogInformation("Seeding initial data for team {TeamId}", DefaultTeamId);
        await SeedEmployeesAsync(cancellationToken);
        await SeedSignalsAsync(cancellationToken);
        await SeedMeetingsAsync(cancellationToken);
        await SeedTeamKpisAsync(cancellationToken);
        await SeedSkillsMatrixAsync(cancellationToken);
        await SeedMemberDataAsync(cancellationToken);
        logger.LogInformation("Seed complete for team {TeamId}", DefaultTeamId);
    }

    private async Task SeedEmployeesAsync(CancellationToken cancellationToken)
    {
        List<Employee> employees =
        [
            new()
            {
                Id = "1", Name = "Alex Chen", Role = "Senior Frontend Engineer", Tenure = "2y 3m", Avatar = "AC",
                Wellbeing = new KpiMetric(42, "red"), Skills = new KpiMetric(65, "yellow"),
                Motivation = new KpiMetric(38, "red"), Delivery = new KpiMetric(55, "yellow"),
                ChurnRisk = "At risk", ChurnPercent = 72,
                Narrative =
                    "High overtime and declining wellbeing signal burnout risk. Immediate attention recommended.",
                SickDays = 8, SickLeaveRate = 0.038, MeetingHours = 18, MeetingLoad = 0.45, OvertimeHours = 12,
                ReplacementCost = 95000,
                SprintCompletion = 68, PrVelocity = 3, LearningHours = 2, PsychSafety = 52, WorkLifeBalance = 38,
                SkillsCoverage = 0.65, IdpGoalProgress = 0.35, FeedbackScore360 = 3.8, EngagementPulse = 42,
                GoalAchievement = 0.55, RetentionRate = 0.28, PreventabilityScore = 0.78
            },


            new()
            {
                Id = "2", Name = "Sarah Lin", Role = "Staff Engineer", Tenure = "4y 1m", Avatar = "SL",
                Wellbeing = new KpiMetric(85, "green"), Skills = new KpiMetric(92, "green"),
                Motivation = new KpiMetric(88, "green"), Delivery = new KpiMetric(91, "green"),
                ChurnRisk = "Low", ChurnPercent = 12,
                Narrative =
                    "High performer with strong delivery and excellent team influence. Potential for principal engineer path.",
                SickDays = 2, SickLeaveRate = 0.01, MeetingHours = 12, MeetingLoad = 0.3, OvertimeHours = 3,
                ReplacementCost = 150000,
                SprintCompletion = 95, PrVelocity = 8, LearningHours = 6, PsychSafety = 89, WorkLifeBalance = 85,
                SkillsCoverage = 0.92, IdpGoalProgress = 0.82, FeedbackScore360 = 4.8, EngagementPulse = 91,
                GoalAchievement = 0.95, RetentionRate = 0.95, PreventabilityScore = 0.15
            },


            new()
            {
                Id = "3", Name = "Lisa Wang", Role = "QA Engineer", Tenure = "1y 8m", Avatar = "LW",
                Wellbeing = new KpiMetric(71, "green"), Skills = new KpiMetric(68, "yellow"),
                Motivation = new KpiMetric(74, "green"), Delivery = new KpiMetric(72, "green"),
                ChurnRisk = "Low-Med", ChurnPercent = 28,
                Narrative = "Solid contributor with growth potential. Slight skill gap in automation tooling.",
                SickDays = 4, SickLeaveRate = 0.019, MeetingHours = 10, MeetingLoad = 0.25, OvertimeHours = 4,
                ReplacementCost = 70000,
                SprintCompletion = 78, PrVelocity = 4, LearningHours = 4, PsychSafety = 72, WorkLifeBalance = 74,
                SkillsCoverage = 0.68, IdpGoalProgress = 0.48, FeedbackScore360 = 4.1, EngagementPulse = 74,
                GoalAchievement = 0.72, RetentionRate = 0.74, PreventabilityScore = 0.45
            },


            new()
            {
                Id = "4", Name = "Tom Eriksen", Role = "Principal Engineer", Tenure = "6y 2m", Avatar = "TE",
                Wellbeing = new KpiMetric(79, "green"), Skills = new KpiMetric(95, "green"),
                Motivation = new KpiMetric(81, "green"), Delivery = new KpiMetric(88, "green"),
                ChurnRisk = "Low", ChurnPercent = 8,
                Narrative =
                    "Cornerstone of the team. Technical leadership is exemplary. Succession planning recommended.",
                SickDays = 1, SickLeaveRate = 0.005, MeetingHours = 20, MeetingLoad = 0.5, OvertimeHours = 6,
                ReplacementCost = 180000,
                SprintCompletion = 92, PrVelocity = 6, LearningHours = 5, PsychSafety = 85, WorkLifeBalance = 75,
                SkillsCoverage = 0.95, IdpGoalProgress = 0.90, FeedbackScore360 = 4.9, EngagementPulse = 82,
                GoalAchievement = 0.90, RetentionRate = 0.92, PreventabilityScore = 0.10
            },


            new()
            {
                Id = "5", Name = "Emma Nilsen", Role = "Junior Frontend Engineer", Tenure = "0y 7m", Avatar = "EN",
                Wellbeing = new KpiMetric(78, "green"), Skills = new KpiMetric(52, "yellow"),
                Motivation = new KpiMetric(85, "green"), Delivery = new KpiMetric(61, "yellow"),
                ChurnRisk = "Low-Med", ChurnPercent = 22,
                Narrative =
                    "High motivation and strong cultural fit. Ramping up technically — needs mentorship on system design.",
                SickDays = 2, SickLeaveRate = 0.01, MeetingHours = 8, MeetingLoad = 0.2, OvertimeHours = 2,
                ReplacementCost = 55000,
                SprintCompletion = 65, PrVelocity = 2, LearningHours = 8, PsychSafety = 80, WorkLifeBalance = 82,
                SkillsCoverage = 0.52, IdpGoalProgress = 0.25, FeedbackScore360 = 4.0, EngagementPulse = 85,
                GoalAchievement = 0.60, RetentionRate = 0.80, PreventabilityScore = 0.30
            },


            new()
            {
                Id = "6", Name = "David Kim", Role = "DevOps Engineer", Tenure = "3y 5m", Avatar = "DK",
                Wellbeing = new KpiMetric(63, "yellow"), Skills = new KpiMetric(82, "green"),
                Motivation = new KpiMetric(65, "yellow"), Delivery = new KpiMetric(79, "green"),
                ChurnRisk = "Medium", ChurnPercent = 41,
                Narrative =
                    "Slightly disengaged — may be considering market options. Strong performer but needs recognition.",
                SickDays = 5, SickLeaveRate = 0.024, MeetingHours = 14, MeetingLoad = 0.35, OvertimeHours = 8,
                ReplacementCost = 95000,
                SprintCompletion = 82, PrVelocity = 5, LearningHours = 3, PsychSafety = 65, WorkLifeBalance = 62,
                SkillsCoverage = 0.82, IdpGoalProgress = 0.55, FeedbackScore360 = 4.3, EngagementPulse = 65,
                GoalAchievement = 0.78, RetentionRate = 0.62, PreventabilityScore = 0.60
            },


            new()
            {
                Id = "7", Name = "Maria Santos", Role = "Product Manager", Tenure = "2y 11m", Avatar = "MS",
                Wellbeing = new KpiMetric(72, "green"), Skills = new KpiMetric(78, "green"),
                Motivation = new KpiMetric(76, "green"), Delivery = new KpiMetric(74, "green"),
                ChurnRisk = "Low", ChurnPercent = 18,
                Narrative =
                    "Strong cross-functional connector. Effective at stakeholder alignment. Growing into senior PM role.",
                SickDays = 3, SickLeaveRate = 0.014, MeetingHours = 22, MeetingLoad = 0.55, OvertimeHours = 5,
                ReplacementCost = 100000,
                SprintCompletion = 76, PrVelocity = 0, LearningHours = 4, PsychSafety = 76, WorkLifeBalance = 70,
                SkillsCoverage = 0.78, IdpGoalProgress = 0.65, FeedbackScore360 = 4.4, EngagementPulse = 76,
                GoalAchievement = 0.80, RetentionRate = 0.84, PreventabilityScore = 0.25
            },


            new()
            {
                Id = "8", Name = "Jonas Berg", Role = "Backend Engineer", Tenure = "1y 4m", Avatar = "JB",
                Wellbeing = new KpiMetric(67, "yellow"), Skills = new KpiMetric(72, "green"),
                Motivation = new KpiMetric(70, "yellow"), Delivery = new KpiMetric(75, "green"),
                ChurnRisk = "Low-Med", ChurnPercent = 30,
                Narrative =
                    "Solid contributor, slightly under-mentored. Would benefit from pairing with senior engineers.",
                SickDays = 4, SickLeaveRate = 0.019, MeetingHours = 11, MeetingLoad = 0.275, OvertimeHours = 5,
                ReplacementCost = 75000,
                SprintCompletion = 80, PrVelocity = 5, LearningHours = 3, PsychSafety = 68, WorkLifeBalance = 70,
                SkillsCoverage = 0.72, IdpGoalProgress = 0.40, FeedbackScore360 = 4.1, EngagementPulse = 70,
                GoalAchievement = 0.72, RetentionRate = 0.72, PreventabilityScore = 0.40
            },


            new()
            {
                Id = "9", Name = "Priya Sharma", Role = "ML Engineer", Tenure = "2y 6m", Avatar = "PS",
                Wellbeing = new KpiMetric(74, "green"), Skills = new KpiMetric(88, "green"),
                Motivation = new KpiMetric(82, "green"), Delivery = new KpiMetric(85, "green"),
                ChurnRisk = "Low", ChurnPercent = 15,
                Narrative =
                    "High-value ML specialist with growing impact. Retention priority — at risk from competing offers.",
                SickDays = 2, SickLeaveRate = 0.01, MeetingHours = 10, MeetingLoad = 0.25, OvertimeHours = 4,
                ReplacementCost = 140000,
                SprintCompletion = 88, PrVelocity = 6, LearningHours = 7, PsychSafety = 78, WorkLifeBalance = 78,
                SkillsCoverage = 0.88, IdpGoalProgress = 0.75, FeedbackScore360 = 4.6, EngagementPulse = 82,
                GoalAchievement = 0.88, RetentionRate = 0.88, PreventabilityScore = 0.20
            },


            new()
            {
                Id = "10", Name = "Kevin Dahl", Role = "Junior Engineer", Tenure = "0y 3m", Avatar = "KD",
                Wellbeing = new KpiMetric(81, "green"), Skills = new KpiMetric(45, "red"),
                Motivation = new KpiMetric(88, "green"), Delivery = new KpiMetric(52, "yellow"),
                ChurnRisk = "Low", ChurnPercent = 10,
                Narrative =
                    "Very new hire. High potential and enthusiasm. Needs structured onboarding and mentorship plan.",
                SickDays = 1, SickLeaveRate = 0.005, MeetingHours = 6, MeetingLoad = 0.15, OvertimeHours = 1,
                ReplacementCost = 50000,
                SprintCompletion = 55, PrVelocity = 1, LearningHours = 10, PsychSafety = 82, WorkLifeBalance = 88,
                SkillsCoverage = 0.45, IdpGoalProgress = 0.10, FeedbackScore360 = 3.8, EngagementPulse = 88,
                GoalAchievement = 0.45, RetentionRate = 0.91, PreventabilityScore = 0.12
            }
        ];

        foreach (Employee employee in employees)
            await employeeRepository.UpsertAsync(DefaultTeamId, employee, cancellationToken);
    }

    private async Task SeedSignalsAsync(CancellationToken cancellationToken)
    {
        List<Signal> signals =
        [
            new()
            {
                Id = "s1", Type = "critical", Title = "Churn Risk: Alex Chen",
                Message = "72% churn probability. Overtime 12h+ consistently. Immediate 1:1 recommended.",
                EmployeeId = "1", Icon = "user-x", Time = "2 hours ago", ActionLabel = "View 1:1 Brief"
            },
            new()
            {
                Id = "s2", Type = "warning", Title = "Sick Leave Spike",
                Message = "3 team members have taken 2+ sick days this month. Team stress indicator.", Icon = "heart",
                Time = "1 day ago", ActionLabel = "View Wellbeing"
            },
            new()
            {
                Id = "s3", Type = "warning", Title = "Team Trust at 67%",
                Message = "Psychological safety down 5 points this quarter. Consider team retro or anonymous survey.",
                Icon = "shield", Time = "3 days ago", ActionLabel = "Run Survey"
            },
            new()
            {
                Id = "s4", Type = "info", Title = "David Kim — Engagement Drop",
                Message = "Engagement pulse down 15 points. May be exploring market options.", EmployeeId = "6",
                Icon = "trending-down", Time = "1 week ago", ActionLabel = "Schedule Chat"
            }
        ];

        foreach (Signal signal in signals)
            await signalRepository.UpsertTeamSignalAsync(DefaultTeamId, signal, cancellationToken);

        List<(string memberId, MemberSignal signal)> memberSignals =
        [
            ("1",
                new MemberSignal
                {
                    Id = "ms1", Type = "warning", Title = "Overtime Warning",
                    Description = "You've logged 48 hours this week. Consider discussing workload with your lead.",
                    Time = "1 hour ago", Unread = true
                }),
            ("1",
                new MemberSignal
                {
                    Id = "ms2", Type = "opportunity", Title = "Skill Opportunity: Cloud Architecture",
                    Description = "Your team has a gap in Cloud Architecture. Ask about learning budget.",
                    Time = "2 days ago", Unread = true
                }),
            ("1",
                new MemberSignal
                {
                    Id = "ms3", Type = "recognition", Title = "Recognition Nudge",
                    Description = "Your PR review quality is up 30% this sprint. Your lead should know!",
                    Time = "3 days ago", Unread = false
                }),
            ("1",
                new MemberSignal
                {
                    Id = "ms4", Type = "wellbeing", Title = "Wellbeing Check-in",
                    Description = "It's been 2 weeks since your last wellbeing update. How are you doing?",
                    Time = "5 days ago", Unread = false
                }),
            ("1",
                new MemberSignal
                {
                    Id = "ms5", Type = "milestone", Title = "Learning Milestone",
                    Description = "You've completed Advanced TypeScript. Your skills profile has been updated.",
                    Time = "1 week ago", Unread = false
                })
        ];

        foreach ((string memberId, MemberSignal signal) in memberSignals)
            await signalRepository.UpsertMemberSignalAsync(DefaultTeamId, memberId, signal, cancellationToken);
    }

    private async Task SeedMeetingsAsync(CancellationToken cancellationToken)
    {
        List<(Meeting meeting, bool isPast)> meetings =
        [
            (new Meeting
            {
                Id = "m1", Name = "Alex Chen", Role = "Senior Frontend Engineer", AvatarColor = "#6366f1",
                Date = "2026-03-12", Duration = "30 min", TopicCount = 4, RiskLevel = "high",
                Topics =
                [
                    new MeetingTopic
                    {
                        Id = "t1", Icon = "heart", Text = "Well-being check-in — high overtime flagged",
                        Status = "pending"
                    },
                    new MeetingTopic
                    {
                        Id = "t2", Icon = "target", Text = "Q2 goals and expectations alignment", Status = "pending"
                    },
                    new MeetingTopic
                    {
                        Id = "t3", Icon = "chart", Text = "Sprint performance and delivery pressure", Status = "pending"
                    },
                    new MeetingTopic
                    {
                        Id = "t4", Icon = "target", Text = "Career path discussion — cloud interest", Status = "pending"
                    }
                ],
                Notes = "Alex is showing burnout signals. Approach with empathy. Lead with listening.",
                FollowUps =
                [
                    new FollowUpAction {Id = "f1", Text = "Explore flexible schedule options", Done = false},
                    new FollowUpAction {Id = "f2", Text = "Discuss learning budget for cloud certs", Done = false}
                ]
            }, false),

            (new Meeting
            {
                Id = "m2", Name = "Sarah Lin", Role = "Staff Engineer", AvatarColor = "#10b981",
                Date = "2026-03-13", Duration = "45 min", TopicCount = 3, RiskLevel = null,
                Topics =
                [
                    new MeetingTopic
                        {Id = "t5", Icon = "target", Text = "Principal engineer career path", Status = "pending"},
                    new MeetingTopic
                        {Id = "t6", Icon = "chart", Text = "Mentorship programme interest", Status = "pending"},
                    new MeetingTopic
                        {Id = "t7", Icon = "target", Text = "Q2 tech lead opportunities", Status = "pending"}
                ],
                Notes = "High performer check-in. Focus on growth and stretch opportunities.",
                FollowUps = []
            }, false),

            (new Meeting
            {
                Id = "m3", Name = "Lisa Wang", Role = "QA Engineer", AvatarColor = "#f59e0b",
                Date = "2026-03-14", Duration = "30 min", TopicCount = 2, RiskLevel = "medium",
                Topics =
                [
                    new MeetingTopic
                    {
                        Id = "t8", Icon = "target", Text = "Automation skills gap and training plan", Status = "pending"
                    },
                    new MeetingTopic
                        {Id = "t9", Icon = "heart", Text = "Work-life balance follow-up", Status = "pending"}
                ],
                Notes = "Follow up on the deferred work-life balance topic from last month.",
                FollowUps = [new FollowUpAction {Id = "f3", Text = "Send Cypress advanced course link", Done = false}]
            }, false),

            (new Meeting
            {
                Id = "pm1", Name = "Alex Chen", Role = "Senior Frontend Engineer", AvatarColor = "#6366f1",
                Date = "2026-02-26", Duration = "30 min", TopicCount = 3, RiskLevel = null,
                Topics =
                [
                    new MeetingTopic
                        {Id = "pt1", Icon = "target", Text = "Sprint 11 retrospective", Status = "discussed"},
                    new MeetingTopic {Id = "pt2", Icon = "heart", Text = "Workload check-in", Status = "discussed"},
                    new MeetingTopic
                        {Id = "pt3", Icon = "target", Text = "TypeScript cert progress", Status = "deferred"}
                ],
                Notes = "Good session. Alex mentioned interest in cloud architecture.",
                FollowUps =
                [
                    new FollowUpAction {Id = "pf1", Text = "Research cloud architecture training options", Done = true}
                ]
            }, true)
        ];

        foreach ((Meeting meeting, bool isPast) in meetings)
            await meetingRepository.UpsertAsync(DefaultTeamId, meeting, isPast, cancellationToken);

        List<DeferredTopic> deferredTopics =
            [new() {Id = "d1", Text = "Work-life balance check-in", Person = "Alex Chen"}];

        foreach (DeferredTopic topic in deferredTopics)
            await meetingRepository.UpsertDeferredTopicAsync(DefaultTeamId, topic, cancellationToken);
    }

    private async Task SeedTeamKpisAsync(CancellationToken cancellationToken)
    {
        TeamKpis kpis = new()
        {
            Wellbeing = new TeamKpiMetric
            {
                Score = 67, Status = "yellow", Label = "Well-being Index", Trend = -6.9,
                Description = "Three team members showing burnout signals. Immediate intervention needed for Alex Chen."
            },
            Skills = new TeamKpiMetric
            {
                Score = 71, Status = "green", Label = "Skills & Development", Trend = 4.4,
                Description = "Skills coverage improving. Cloud and ML gaps remain critical."
            },
            Motivation = new TeamKpiMetric
            {
                Score = 73, Status = "green", Label = "Motivation Index", Trend = -2.7,
                Description = "Slight motivation dip tied to workload pressure. Monitor closely."
            },
            Churn = new TeamKpiMetric
            {
                Score = 64, Status = "yellow", Label = "Churn & Retention", Trend = -8.6,
                Description = "Alex Chen at 72% churn probability. David Kim showing early exit signals."
            },
            Delivery = new TeamKpiMetric
            {
                Score = 64, Status = "yellow", Label = "Delivery & Workload", Trend = -9.9,
                Description = "Sprint velocity down 9.9%. Meeting overload impacting delivery for 4 members."
            }
        };

        TeamFinancials financials = new()
        {
            AtRiskCount = 2,
            TotalEmployees = 10,
            ChurnExposure = 126000,
            TotalPeopleRisk = 180000
        };

        await kpiRepository.UpsertAsync(DefaultTeamId, kpis, financials, cancellationToken);
    }

    private async Task SeedMemberDataAsync(CancellationToken cancellationToken)
    {
        MemberDashboard alexDashboard = new()
        {
            EmployeeId = "1",
            Kpis = new MemberKpis
            {
                Wellbeing = new KpiMetric(42, "red"),
                Skills = new KpiMetric(65, "yellow"),
                Motivation = new KpiMetric(48, "red"),
                Delivery = new KpiMetric(55, "yellow")
            },
            DevGoals =
            [
                new DevGoal
                {
                    Id = "g1", Title = "Master Cloud Architecture", Category = "Cloud", Progress = 35,
                    Status = "on-track", TargetDate = "2026-06-30"
                },
                new DevGoal
                {
                    Id = "g2", Title = "Improve System Design Skills", Category = "Architecture", Progress = 20,
                    Status = "behind", TargetDate = "2026-09-30"
                },
                new DevGoal
                {
                    Id = "g3", Title = "Contribute to Open Source", Category = "Community", Progress = 60,
                    Status = "on-track", TargetDate = "2026-04-30"
                },
                new DevGoal
                {
                    Id = "g4", Title = "Leadership Readiness", Category = "Leadership", Progress = 80,
                    Status = "on-track", TargetDate = "2026-03-31"
                }
            ],
            LearningItems =
            [
                new LearningItem
                {
                    Id = "l1", Title = "Advanced Cloud Architecture", Category = "Cloud", Duration = "20h",
                    Priority = "HIGH"
                },
                new LearningItem
                {
                    Id = "l2", Title = "System Design Mentoring", Category = "Architecture", Duration = "8h",
                    Priority = "HIGH"
                },
                new LearningItem
                {
                    Id = "l3", Title = "AWS Solutions Architect Cert", Category = "Cloud", Duration = "40h",
                    Priority = "MEDIUM"
                }
            ],
            Skills =
            [
                new MemberSkill {Name = "TypeScript", Level = 82, Trend = "up"},
                new MemberSkill {Name = "React", Level = 78, Trend = "stable"},
                new MemberSkill {Name = "Cloud Architecture", Level = 35, Trend = "up"},
                new MemberSkill {Name = "System Design", Level = 42, Trend = "stable"},
                new MemberSkill {Name = "Node.js", Level = 70, Trend = "stable"},
                new MemberSkill {Name = "Testing", Level = 65, Trend = "up"},
                new MemberSkill {Name = "CI/CD", Level = 55, Trend = "down"},
                new MemberSkill {Name = "Leadership", Level = 48, Trend = "up"}
            ],
            SprintContributions =
            [
                new SprintContribution {Name = "Sprint 12 (Current)", Tasks = 7, Points = 13, Status = "In Progress"},
                new SprintContribution {Name = "Sprint 11", Tasks = 5, Points = 10, Status = "Completed"},
                new SprintContribution {Name = "Sprint 10", Tasks = 8, Points = 16, Status = "Completed"}
            ],
            DeliveryStats = new MemberDeliveryStats
                {HoursThisWeek = 48, PrsMerged = 3, TasksCompleted = 7, MeetingHours = 18},
            PrepTopics =
            [
                "Discuss workload and meeting load — feeling stretched",
                "Ask about flexible schedule options",
                "Share interest in cloud architecture learning",
                "Clarify Q2 project expectations"
            ],
            CoachTips =
            [
                "Start by sharing how you're feeling honestly — your lead wants to help",
                "Frame concerns as opportunities: 'I'd love to invest more time in learning'",
                "Be specific about what would make your week better",
                "Ask about the team's priorities so you can align your goals"
            ],
            Wins =
            [
                "PR review throughput up 30%",
                "Completed Advanced TypeScript course",
                "Consistent code quality on recent tasks"
            ],
            QuestionsToAsk =
            [
                "What are the team priorities for next quarter?",
                "Can we reduce my meeting load by 3-4 hours?",
                "Is there a mentoring opportunity for cloud skills?",
                "How is my overall performance being evaluated?"
            ]
        };

        await memberRepository.UpsertDashboardAsync(DefaultTeamId, "1", alexDashboard, cancellationToken);

        MemberDetail alexDetail = new()
        {
            Department = "Engineering",
            PreviousRole = "Mid Frontend Engineer",
            PreviousRolePeriod = "2022–2024",
            Skills = ["React", "TypeScript", "Node.js", "Python", "JavaScript", "CSS", "Git", "HTML"],
            Projects =
            [
                new Project
                {
                    Id = "p1", Title = "LogIQ Dashboard Redesign", Role = "Lead Frontend",
                    Period = "Jan 2026 – Present",
                    Description =
                        "Redesigning the entire lead dashboard with new data visualizations and real-time updates.",
                    Status = "Active", Skills = ["React", "TypeScript", "Recharts"]
                },
                new Project
                {
                    Id = "p2", Title = "Design System v2", Role = "Contributor", Period = "Sep 2025 – Dec 2025",
                    Description = "Built reusable component library used across 3 product teams.", Status = "Completed",
                    Skills = ["React", "TypeScript", "CSS"]
                },
                new Project
                {
                    Id = "p3", Title = "Auth Service Migration", Role = "Frontend Lead", Period = "Mar 2025 – Aug 2025",
                    Description = "Migrated authentication from legacy JWT to OAuth 2.0 across frontend.",
                    Status = "Completed", Skills = ["React", "OAuth", "TypeScript"]
                }
            ],
            Feedback =
            [
                new FeedbackEntry
                {
                    Id = "fb1", ReviewerName = "Magnus Lindqvist", ReviewerRole = "Engineering Manager",
                    Type = "Manager", Date = "2025-12-15", Rating = 3.8,
                    Comment =
                        "Alex delivers quality work but is showing signs of overextension. Need to better protect his capacity.",
                    Strengths = ["Code quality", "PR reviews", "Mentoring juniors"],
                    GrowthAreas = ["Workload boundaries", "Proactive communication on blockers"]
                },
                new FeedbackEntry
                {
                    Id = "fb2", ReviewerName = "Sarah Lin", ReviewerRole = "Staff Engineer", Type = "Peer",
                    Date = "2025-12-10", Rating = 4.2,
                    Comment = "Reliable pair programming partner. Could be more assertive in design discussions.",
                    Strengths = ["Attention to detail", "TypeScript expertise", "Collaboration"],
                    GrowthAreas = ["System design confidence", "Speaking up in architecture reviews"]
                }
            ],
            Training =
            [
                new Training
                {
                    Id = "tr1", Title = "Advanced TypeScript Patterns", Provider = "Frontend Masters",
                    Tags = ["TypeScript", "JavaScript"], Hours = 12, StartDate = "2026-01-15",
                    CompletedDate = "2026-02-20", Status = "Completed", Score = 89
                },
                new Training
                {
                    Id = "tr2", Title = "AWS Solutions Architect Associate", Provider = "AWS Training",
                    Tags = ["Cloud", "AWS"], Hours = 40, StartDate = "2026-02-01", Status = "In Progress"
                },
                new Training
                {
                    Id = "tr3", Title = "React Performance Optimisation", Provider = "Egghead.io",
                    Tags = ["React", "Performance"], Hours = 8, StartDate = "2025-10-01", CompletedDate = "2025-10-15",
                    Status = "Completed", Score = 92
                }
            ],
            Signals =
            [
                new SignalEntry
                {
                    Id = "se1", Title = "Overtime Warning",
                    Description = "48 hours logged this week — 20% above healthy threshold", Severity = "warning",
                    TimeAgo = "1 hour ago"
                },
                new SignalEntry
                {
                    Id = "se2", Title = "Wellbeing Score Drop",
                    Description = "Wellbeing declined from 58 to 42 over the past 30 days", Severity = "critical",
                    TimeAgo = "1 day ago"
                }
            ],
            RoleHistory =
            [
                new RoleHistory
                {
                    Title = "Senior Frontend Engineer", Department = "Engineering", Period = "Jan 2024 – Present",
                    Duration = "2y 3m", Current = true
                },
                new RoleHistory
                {
                    Title = "Mid Frontend Engineer", Department = "Engineering", Period = "Oct 2022 – Jan 2024",
                    Duration = "1y 4m", Current = false
                }
            ],
            Certifications =
            [
                new Certification
                    {Title = "AWS Solutions Architect Associate", Provider = "AWS", Status = "In Progress"},
                new Certification
                    {Title = "Meta React Professional Certificate", Provider = "Meta", Status = "Completed"}
            ],
            FeedbackScoreAvg = 4.0,
            TrainingHoursTotal = 60,
            ActiveSignalsCount = 2,
            ProjectCount = 3
        };

        await memberRepository.UpsertDetailAsync(DefaultTeamId, "1", alexDetail, cancellationToken);

        IReadOnlyList<Employee> employees = await employeeRepository.ListByTeamAsync(DefaultTeamId, cancellationToken);
        SkillsMatrix matrix = await memberRepository.GetSkillsMatrixAsync(DefaultTeamId, cancellationToken);
        for (int i = 2; i <= 10; i++)
        {
            string memberId = i.ToString();
            Employee? emp = employees.FirstOrDefault(e => e.Id == memberId);
            if (emp is null) continue;

            List<string> skills =
                (matrix.EmployeeSkills ?? new Dictionary<string, List<string>>()).TryGetValue(memberId,
                    out List<string>? list)
                    ? list
                    :
                    [
                    ];
            MemberDetail detail = new()
            {
                Department = "Engineering",
                PreviousRole = null,
                PreviousRolePeriod = null,
                Skills = skills,
                Projects = [],
                Feedback = [],
                Training = [],
                Signals = [],
                RoleHistory =
                [
                    new RoleHistory
                    {
                        Title = emp.Role, Department = "Engineering", Period = "Present", Duration = emp.Tenure,
                        Current = true
                    }
                ],
                Certifications = [],
                FeedbackScoreAvg = emp.FeedbackScore360,
                TrainingHoursTotal = (int) emp.LearningHours * 4,
                ActiveSignalsCount = 0,
                ProjectCount = 0
            };
            await memberRepository.UpsertDetailAsync(DefaultTeamId, memberId, detail, cancellationToken);

            MemberDashboard dashboard = new()
            {
                EmployeeId = memberId,
                Kpis = new MemberKpis
                {
                    Wellbeing = emp.Wellbeing,
                    Skills = emp.Skills,
                    Motivation = emp.Motivation,
                    Delivery = emp.Delivery
                },
                Signals = [],
                DevGoals =
                [
                    new DevGoal
                    {
                        Id = "g0", Title = "Continue growth in role", Category = "Career",
                        Progress = (int) (emp.IdpGoalProgress * 100), Status = "on-track", TargetDate = "2026-12-31"
                    }
                ],
                LearningItems = [],
                Skills = skills.Take(8).Select((s, idx) => new MemberSkill
                    {Name = s, Level = 60 + idx % 3 * 15, Trend = "stable"}).ToList(),
                SprintContributions =
                    [new SprintContribution {Name = "Current Sprint", Tasks = 5, Points = 10, Status = "In Progress"}],
                DeliveryStats = new MemberDeliveryStats
                {
                    HoursThisWeek = (int) emp.MeetingHours + 25, PrsMerged = emp.PrVelocity, TasksCompleted = 5,
                    MeetingHours = (int) emp.MeetingHours
                },
                PrepTopics = ["Discuss current priorities", "Align on goals"],
                CoachTips = ["Prepare 2-3 talking points before your 1:1", "Ask for feedback on one specific area"],
                Wins = [],
                QuestionsToAsk = ["What are the team priorities?", "How can I contribute more?"]
            };
            await memberRepository.UpsertDashboardAsync(DefaultTeamId, memberId, dashboard, cancellationToken);
        }
    }

    private async Task SeedSkillsMatrixAsync(CancellationToken cancellationToken)
    {
        SkillsMatrix matrix = new()
        {
            AllSkills =
            [
                "React", "TypeScript", "Node.js", "Python", "Go", "Kubernetes", "System Design",
                "Mentoring", "Selenium", "Cypress", "Test Strategy", "CI/CD", "Architecture", "Java",
                "AWS", "Leadership", "Agile", "JavaScript", "CSS", "Git", "Docker", "Terraform",
                "Monitoring", "Product Strategy", "Analytics", "Stakeholder Mgmt", "Roadmapping",
                "Spring Boot", "SQL", "REST APIs", "ML", "Data Pipelines", "FastAPI", "PostgreSQL", "HTML"
            ],
            EmployeeSkills = new Dictionary<string, List<string>>
            {
                ["1"] = ["React", "TypeScript", "Node.js", "Python", "JavaScript", "CSS", "Git", "HTML"],
                ["2"] =
                [
                    "React", "Python", "Go", "Kubernetes", "System Design", "Mentoring", "Architecture", "Java", "AWS",
                    "Docker", "Terraform", "SQL", "PostgreSQL"
                ],
                ["3"] =
                [
                    "Python", "Selenium", "Cypress", "Test Strategy", "CI/CD", "Mentoring", "Monitoring", "SQL", "Git"
                ],
                ["4"] =
                [
                    "Architecture", "Java", "AWS", "Leadership", "Agile", "System Design", "Mentoring", "CI/CD",
                    "Docker", "Terraform", "Kubernetes", "Git", "Monitoring"
                ],
                ["5"] = ["React", "JavaScript", "CSS", "HTML", "Git", "TypeScript"],
                ["6"] =
                [
                    "Docker", "Kubernetes", "Terraform", "AWS", "CI/CD", "Monitoring", "Python", "Go", "Git",
                    "PostgreSQL"
                ],
                ["7"] =
                [
                    "Product Strategy", "Analytics", "Stakeholder Mgmt", "Roadmapping", "Agile", "Leadership",
                    "Mentoring"
                ],
                ["8"] = ["React", "TypeScript", "Node.js", "JavaScript", "CSS", "Git", "SQL", "REST APIs"],
                ["9"] =
                [
                    "React", "TypeScript", "Python", "Node.js", "System Design", "Architecture", "AWS", "Docker",
                    "CI/CD", "Git", "PostgreSQL", "REST APIs", "ML"
                ],
                ["10"] = ["React", "JavaScript", "HTML", "CSS", "Git"]
            }
        };

        await memberRepository.UpsertSkillsMatrixAsync(DefaultTeamId, matrix, cancellationToken);
    }
}