import {
  Text,
  Card,
  Input,
  Badge,
  Persona,
  makeStyles,
  mergeClasses,
  tokens,
} from "@fluentui/react-components";
import {
  Search20Regular,
  Filter20Regular,
  People20Regular,
  Star20Regular,
  Grid20Regular,
  Warning20Regular,
} from "@fluentui/react-icons";
import { useState, useMemo } from "react";
import type { Employee } from "@/lib/api";
import { useEmployees, useSkillsMatrix } from "../hooks/useApiData";
import { AIOverviewDialog } from "./AIOverviewDialog";


const useStyles = makeStyles({
  searchRow: {
    marginBottom: "16px",
  },
  chipRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    alignItems: "center",
    marginBottom: "16px",
  },
  chip: {
    padding: "4px 12px",
    borderRadius: "16px",
    border: "1px solid #e0e0e0",
    backgroundColor: "#fff",
    fontSize: "12px",
    cursor: "pointer",
    fontFamily: "inherit",
    color: tokens.colorNeutralForeground1,
  },
  chipActive: {
    backgroundColor: "#e8f0fe",
    border: "1px solid #0f6cbd",
    color: "#0f6cbd",
    fontWeight: 600,
  },
  summaryRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "12px",
    marginBottom: "20px",
    "@media (max-width: 1024px)": {
      gridTemplateColumns: "repeat(2, 1fr)",
    },
    "@media (max-width: 640px)": {
      gridTemplateColumns: "1fr",
    },
  },
  summaryCard: {
    padding: "16px 20px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  summaryIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f6ff",
    color: "#0f6cbd",
  },
  summaryValue: {
    fontSize: "24px",
    fontWeight: 700,
    lineHeight: "1",
  },
  tableWrapper: {
    overflowX: "auto",
    borderRadius: "8px",
    border: "1px solid #e8e8e8",
    backgroundColor: "#fff",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "13px",
  },
  th: {
    padding: "10px 8px",
    textAlign: "center",
    fontWeight: 600,
    fontSize: "10px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    color: tokens.colorNeutralForeground3,
    borderBottom: "1px solid #e8e8e8",
    whiteSpace: "nowrap",
  },
  thName: {
    textAlign: "left",
    paddingLeft: "16px",
    minWidth: "160px",
    position: "sticky" as any,
    left: "0",
    backgroundColor: "#fff",
    zIndex: 1,
  },
  td: {
    padding: "10px 8px",
    textAlign: "center",
    borderBottom: "1px solid #f5f5f5",
  },
  tdName: {
    textAlign: "left",
    paddingLeft: "16px",
    position: "sticky" as any,
    left: "0",
    backgroundColor: "#fff",
    zIndex: 1,
    verticalAlign: "middle",
  },
  nameCell: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  nameLink: {
    cursor: "pointer",
    color: "#5b5fc7",
    ":hover": {
      textDecoration: "underline",
    },
  },
  dot: {
    width: "14px",
    height: "14px",
    borderRadius: "50%",
    display: "inline-block",
  },
  dotFilled: {
    backgroundColor: "#36b37e",
  },
  dotEmpty: {
    backgroundColor: "#e8e8e8",
  },
  statusDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    display: "inline-block",
    flexShrink: 0,
  },
  paginationRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "12px",
    padding: "0 4px",
  },
  pageButton: {
    width: "32px",
    height: "32px",
    borderRadius: "6px",
    border: "1px solid #e0e0e0",
    backgroundColor: "#fff",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontFamily: "inherit",
    color: tokens.colorNeutralForeground1,
  },
  pageButtonActive: {
    backgroundColor: "#0f6cbd",
    color: "#fff",
    border: "1px solid #0f6cbd",
  },
});

const PAGE_SIZE = 5;

const statusColors: Record<string, string> = {
  green: "#107c10",
  yellow: "#f7630c",
  red: "#d13438",
};

const SkillsTab: React.FC = () => {
  const styles = useStyles();
  const [search, setSearch] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [aiEmployee, setAiEmployee] = useState<Employee | null>(null);

  const { data: employees = [] } = useEmployees("team1");
  const { data: skillsMatrix } = useSkillsMatrix("team1");
  const allSkills = skillsMatrix?.allSkills ?? [];
  const employeeSkills: Record<string, string[]> = skillsMatrix?.employeeSkills ?? {};

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) => {
      const next = new Set(prev);
      if (next.has(skill)) next.delete(skill);
      else next.add(skill);
      return next;
    });
    setPage(1);
  };

  const filteredEmployees = useMemo(() => {
    let list = employees;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) => e.name.toLowerCase().includes(q) || e.role.toLowerCase().includes(q)
      );
    }
    if (selectedSkills.size > 0) {
      list = list.filter((e) => {
        const empSkills = employeeSkills[e.id] || [];
        return Array.from(selectedSkills).some((s) => empSkills.includes(s));
      });
    }
    return list;
  }, [employees, search, selectedSkills, employeeSkills]);

  const totalSkillsTracked = allSkills.length;
  const avgSkillsPerPerson =
    employees.length > 0
      ? employees.reduce((sum, e) => sum + (employeeSkills[e.id]?.length || 0), 0) / employees.length
      : 0;
  const totalGaps = employees.reduce(
    (sum, e) => sum + (allSkills.length - (employeeSkills[e.id]?.length || 0)),
    0
  );

  const totalPages = Math.ceil(filteredEmployees.length / PAGE_SIZE);
  const paged = filteredEmployees.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);


  const visibleSkills = selectedSkills.size > 0 ? allSkills.filter((s) => selectedSkills.has(s)).concat(allSkills.filter((s) => !selectedSkills.has(s))) : allSkills;

  return (
    <div>
      <div className={styles.searchRow}>
        <Input
          placeholder="Search by name or role..."
          contentBefore={<Search20Regular />}
          value={search}
          onChange={(_, d) => { setSearch(d.value); setPage(1); }}
          style={{ width: "100%" }}
        />
      </div>

      <div className={styles.chipRow}>
        <Filter20Regular style={{ color: tokens.colorNeutralForeground3 }} />
        {allSkills.map((skill) => (
          <button
            key={skill}
            className={mergeClasses(styles.chip, selectedSkills.has(skill) && styles.chipActive)}
            onClick={() => toggleSkill(skill)}
          >
            {skill}
          </button>
        ))}
      </div>

      <div className={styles.summaryRow}>
        <Card className={styles.summaryCard}>
          <div className={styles.summaryIcon}><People20Regular /></div>
          <div>
            <div className={styles.summaryValue}>{employees.length}</div>
            <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>Team Members</Text>
          </div>
        </Card>
        <Card className={styles.summaryCard}>
          <div className={styles.summaryIcon}><Star20Regular /></div>
          <div>
            <div className={styles.summaryValue}>{totalSkillsTracked}</div>
            <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>Skills Tracked</Text>
          </div>
        </Card>
        <Card className={styles.summaryCard}>
          <div className={styles.summaryIcon}><Grid20Regular /></div>
          <div>
            <div className={styles.summaryValue}>{avgSkillsPerPerson.toFixed(1)}</div>
            <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>Avg Skills/Person</Text>
          </div>
        </Card>
        <Card className={styles.summaryCard}>
          <div className={styles.summaryIcon} style={{ backgroundColor: "#fde7e9", color: "#d13438" }}><Warning20Regular /></div>
          <div>
            <div className={styles.summaryValue}>{totalGaps}</div>
            <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>Gaps Found</Text>
          </div>
        </Card>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={mergeClasses(styles.th, styles.thName)}>TEAM MEMBER</th>
              {visibleSkills.map((skill) => (
                <th key={skill} className={styles.th}>{skill.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((emp) => {
              const empSkillSet = new Set(employeeSkills[emp.id] || []);
              const overallStatus = emp.wellbeing.status;
              return (
                <tr key={emp.id}>
                  <td className={mergeClasses(styles.td, styles.tdName)}>
                    <div className={styles.nameCell} role="button" tabIndex={0} onClick={() => setAiEmployee(emp)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setAiEmployee(emp); } }} style={{ cursor: "pointer" }}>
                      <Persona
                        name={emp.name}
                        secondaryText={emp.role}
                        size="medium"
                        avatar={{ color: emp.churnRisk === "At risk" ? "cranberry" : "brand" }}
                      />
                    </div>
                  </td>
                  {visibleSkills.map((skill) => (
                    <td key={skill} className={styles.td}>
                      <span
                        className={mergeClasses(styles.dot, empSkillSet.has(skill) ? styles.dotFilled : styles.dotEmpty)}
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className={styles.paginationRow}>
        <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
          Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredEmployees.length)} of {filteredEmployees.length}
        </Text>
        <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
          <button
            className={styles.pageButton}
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={mergeClasses(styles.pageButton, p === page && styles.pageButtonActive)}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
          <button
            className={styles.pageButton}
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
          >
            ›
          </button>
        </div>
      </div>

      <AIOverviewDialog
        open={!!aiEmployee}
        onClose={() => setAiEmployee(null)}
        employee={aiEmployee}
      />
    </div>
  );
};

export default SkillsTab;
