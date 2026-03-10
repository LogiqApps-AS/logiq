// All skills tracked across the team
export const allSkills = [
  "React", "TypeScript", "Node.js", "Python", "Go", "Kubernetes", "System Design",
  "Mentoring", "Selenium", "Cypress", "Test Strategy", "CI/CD", "Architecture",
  "Java", "AWS", "Leadership", "Agile", "JavaScript", "CSS", "Git", "Docker",
  "Terraform", "Monitoring", "Product Strategy", "Analytics", "Stakeholder Mgmt",
  "Roadmapping", "Spring Boot", "SQL", "REST APIs", "ML", "Data Pipelines",
  "FastAPI", "PostgreSQL", "HTML",
];

// Skills per employee: true = has skill, false = gap
export const employeeSkills: Record<string, string[]> = {
  "1": ["React", "TypeScript", "Node.js", "Python", "JavaScript", "CSS", "Git", "HTML"], // Alex Chen
  "2": ["React", "Python", "Go", "Kubernetes", "System Design", "Mentoring", "Architecture", "Java", "AWS", "Docker", "Terraform", "SQL", "PostgreSQL"], // Sarah Lin
  "3": ["Python", "Selenium", "Cypress", "Test Strategy", "CI/CD", "Mentoring", "Monitoring", "SQL", "Git"], // Lisa Wang
  "4": ["Architecture", "Java", "AWS", "Leadership", "Agile", "System Design", "Mentoring", "CI/CD", "Docker", "Terraform", "Kubernetes", "Git", "Monitoring"], // Tom Eriksen
  "5": ["React", "JavaScript", "CSS", "HTML", "Git", "TypeScript"], // Emma Nilsen
  "6": ["Docker", "Kubernetes", "Terraform", "AWS", "CI/CD", "Monitoring", "Python", "Go", "Linux", "Git", "PostgreSQL"], // David Kim
  "7": ["Product Strategy", "Analytics", "Stakeholder Mgmt", "Roadmapping", "Agile", "Leadership", "Mentoring"], // Maria Santos
  "8": ["React", "TypeScript", "Node.js", "JavaScript", "CSS", "Git", "SQL", "REST APIs"], // Jonas Berg
  "9": ["React", "TypeScript", "Python", "Node.js", "System Design", "Architecture", "AWS", "Docker", "CI/CD", "Git", "PostgreSQL", "REST APIs", "ML"], // Priya Sharma
  "10": ["React", "JavaScript", "HTML", "CSS", "Git"], // Kevin Dahl
};
