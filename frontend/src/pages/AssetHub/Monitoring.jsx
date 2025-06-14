import React from "react";
import useBoardStore from "../../store/store";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

const COLORS = ["#a259ff", "#e0aaff", "#ffb7ff", "#ffb4a2", "#cdb4db", "#fff"];

const styles = {
  container: {
    minHeight: "100vh",
    padding: "2rem",
    background: "linear-gradient(135deg, #1a0024 0%, #2a064d 100%)",
    fontFamily: "Inter, Arial, sans-serif",
    color: "#fff",
  },
  heading: {
    textAlign: "center",
    color: "#e0aaff",
    fontWeight: 800,
    fontSize: "2.5rem",
    marginBottom: "2rem",
    letterSpacing: "-1px",
    textShadow: "0 2px 16px #2a064d",
  },
  statGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "2rem",
    marginBottom: "3rem",
  },
  statCard: {
    background: "rgba(45, 19, 59, 0.85)",
    borderRadius: "1rem",
    boxShadow: "0 2px 16px rgba(160,89,255,0.15)",
    padding: "2rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    minHeight: "120px",
    border: "1px solid #a259ff",
  },
  statLabel: {
    color: "#cdb4db",
    fontWeight: 600,
    fontSize: "1rem",
    marginBottom: "0.5rem",
  },
  statValue: {
    fontSize: "2rem",
    fontWeight: 700,
    color: "#fff",
    textShadow: "0 2px 8px #a259ff",
  },
  statHelp: {
    color: "#bfa2e0",
    fontSize: "0.9rem",
    marginTop: "0.3rem",
  },
  chartsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
    gap: "2.5rem",
    marginBottom: "2.5rem",
  },
  chartCard: {
    background: "rgba(45, 19, 59, 0.85)",
    borderRadius: "1rem",
    boxShadow: "0 2px 16px rgba(160,89,255,0.15)",
    padding: "2rem",
    minHeight: "340px",
    border: "1px solid #a259ff",
  },
  chartTitle: {
    fontWeight: 700,
    fontSize: "1.1rem",
    marginBottom: "1rem",
    color: "#e0aaff",
  },
  projectsTitle: {
    fontWeight: 700,
    fontSize: "1.3rem",
    margin: "2rem 0 1rem 0",
    color: "#e0aaff",
  },
  projectsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
    gap: "1.5rem",
  },
  projectCard: {
    background: "rgba(45, 19, 59, 0.95)",
    borderRadius: "1rem",
    boxShadow: "0 2px 16px rgba(160,89,255,0.18)",
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    minHeight: "180px",
    transition: "transform 0.2s, box-shadow 0.2s",
    border: "1px solid #a259ff",
  },
  projectCardHover: {
    transform: "scale(1.03)",
    boxShadow: "0 4px 24px #a259ff",
  },
  projectName: {
    fontWeight: 700,
    fontSize: "1.1rem",
    color: "#e0aaff",
    marginBottom: "0.2rem",
  },
  projectDesc: {
    color: "#fff",
    fontSize: "0.97rem",
    marginBottom: "1.1rem",
    minHeight: "2.2em",
    opacity: 0.85,
  },
  badge: {
    display: "inline-block",
    background: "#a259ff",
    color: "#fff",
    borderRadius: "0.5rem",
    fontSize: "0.8em",
    fontWeight: 600,
    padding: "0.2em 0.7em",
    marginLeft: "0.5em",
    boxShadow: "0 1px 4px #a259ff",
  },
  projectStats: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "auto",
    fontSize: "0.98rem",
    color: "#fff",
    fontWeight: 600,
  },
  updated: {
    fontSize: "0.85rem",
    color: "#bfa2e0",
    marginTop: "0.7em",
  },
};


function Monitoring() {
  // Get the filtered projects using your store
  const { getFilteredProjects } = useBoardStore();
  const projects = getFilteredProjects();

  // Only deployed projects
  const deployedProjects = projects.filter((p) => p.status === "deployed");

  // Aggregate stats
  const totalHits = deployedProjects.reduce((sum, p) => sum + (p.hits || 0), 0);
  const totalGas = deployedProjects.reduce((sum, p) => sum + (p.gasSpent || 0), 0);

  // Charts data
  const hitsData = deployedProjects.map((p) => ({
    name: p.name,
    hits: p.hits || 0,
  }));

  const gasData = deployedProjects.map((p) => ({
    name: p.name,
    gas: p.gasSpent || 0,
  }));

  // Top project by hits
  const topProject =
    deployedProjects.length > 0
      ? deployedProjects.reduce((a, b) => (a.hits || 0) > (b.hits || 0) ? a : b)
      : null;

  // Card hover effect (optional)
  const [hoverIdx, setHoverIdx] = React.useState(-1);

  return (
    <div style={styles.container}>
      <div style={styles.heading}>
        🚀 Web3 Contract Monitoring Dashboard
      </div>

      {/* Stat Cards */}
      <div style={styles.statGrid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Deployed Projects</div>
          <div style={styles.statValue}>{deployedProjects.length}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total Hits</div>
          <div style={styles.statValue}>{totalHits}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total Gas Spent</div>
          <div style={styles.statValue}>{totalGas.toLocaleString()}</div>
          <div style={styles.statHelp}>in gas units</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Top Project</div>
          <div style={styles.statValue}>{topProject ? topProject.name : "—"}</div>
        </div>
      </div>

      {/* Charts */}
      <div style={styles.chartsGrid}>
        <div style={styles.chartCard}>
          <div style={styles.chartTitle}>Hits per Project</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={hitsData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="hits" fill="#6C63FF" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={styles.chartCard}>
          <div style={styles.chartTitle}>Gas Spent Distribution</div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={gasData}
                dataKey="gas"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#43E6FC"
                label={({ name, percent }) =>
                  `${name} (${(percent * 100).toFixed(0)}%)`
                }
              >
                {gasData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Project Cards */}
      <div style={styles.projectsTitle}>Deployed Projects</div>
      <div style={styles.projectsGrid}>
        {deployedProjects.map((p, idx) => (
          <a href={`/project/${p.id}`} style={{ textDecoration: 'none' }}>
          <div
            key={p.id}
            style={{
              ...styles.projectCard,
              ...(hoverIdx === idx ? styles.projectCardHover : {}),
            }}
            onMouseEnter={() => setHoverIdx(idx)}
            onMouseLeave={() => setHoverIdx(-1)}
          >
            <div style={styles.projectName}>
              {p.name}
              <span style={styles.badge}>{p.status}</span>
            </div>
            <div style={styles.projectDesc}>{p.description}</div>
            <div style={styles.projectStats}>
              <span>Hits: <b>{p.hits || 0}</b></span>
              <span>Gas: <b>{p.gasSpent || 0}</b></span>
            </div>
            <div style={styles.updated}>
              Updated: {new Date(p.updatedAt).toLocaleString()}
            </div>
          </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export default Monitoring;
