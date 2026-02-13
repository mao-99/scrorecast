import React, { useState } from 'react';

const LeaguesPage = () => {
  const [selectedLeague, setSelectedLeague] = useState('EPL');
  const [selectedSeason, setSelectedSeason] = useState('2023/24');
  const [activeTab, setActiveTab] = useState('leagues');

  const leagues = ['EPL', 'La Liga', 'Ligue 1', 'Serie A', 'Bundesliga'];
  const seasons = [
    ['2017/18', '2018/19', '2019/20', '2020/21'],
    ['2021/22', '2022/23', '2023/24', '2024/25']
  ];

  // Sample standings data
  const standingsData = [
    { pos: 1, team: 'Arsenal', p: 38, w: 26, d: 6, l: 6, gf: 88, ga: 43, gd: 45, pts: 84 },
    { pos: 2, team: 'Manchester City', p: 38, w: 25, d: 7, l: 6, gf: 94, ga: 33, gd: 61, pts: 82 },
    { pos: 3, team: 'Liverpool', p: 38, w: 24, d: 8, l: 6, gf: 86, ga: 41, gd: 45, pts: 80 },
    { pos: 4, team: 'Tottenham', p: 38, w: 22, d: 6, l: 10, gf: 78, ga: 61, gd: 17, pts: 72 },
    { pos: 5, team: 'Chelsea', p: 38, w: 21, d: 9, l: 8, gf: 77, ga: 63, gd: 14, pts: 72 },
  ];

  // Sample chart data
  const winsData = [
    { rank: 1, value: 26 },
    { rank: 2, value: 25 },
    { rank: 3, value: 24 },
    { rank: 4, value: 22 },
  ];

  const avgWinsData = [
    { rank: 1, value: '68%' },
    { rank: 2, value: '66%' },
    { rank: 3, value: '63%' },
    { rank: 4, value: '58%' },
  ];

  return (
    <div style={styles.container}>

      {/* League Selection Button Group */}
      <div style={styles.section}>
        <div style={styles.buttonGroup}>
          {leagues.map((league) => (
            <button
              key={league}
              style={{
                ...styles.selectionButton,
                ...(selectedLeague === league ? styles.selectionButtonActive : {})
              }}
              onClick={() => setSelectedLeague(league)}
            >
              {league}
            </button>
          ))}
        </div>
        <div style={styles.divider}></div>
      </div>

      {/* Season Selection Button Group */}
      <div style={styles.section}>
        <div style={styles.seasonGroup}>
          {seasons.map((row, rowIndex) => (
            <div key={rowIndex} style={styles.seasonRow}>
              {row.map((season) => (
                <button
                  key={season}
                  style={{
                    ...styles.seasonButton,
                    ...(selectedSeason === season ? styles.seasonButtonActive : {})
                  }}
                  onClick={() => setSelectedSeason(season)}
                >
                  {season}
                </button>
              ))}
            </div>
          ))}
        </div>
        <div style={styles.divider}></div>
      </div>

      {/* Optional Question */}
      <div style={styles.question}>
        Question: Enable round-based filtering?
      </div>

      {/* League Overview Title */}
      <h2 style={styles.title}>League Overview</h2>

      {/* Standings Table */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeaderRow}>
              <th style={styles.tableHeader}>Pos</th>
              <th style={{ ...styles.tableHeader, textAlign: 'left' }}>Team</th>
              <th style={styles.tableHeader}>P</th>
              <th style={styles.tableHeader}>W</th>
              <th style={styles.tableHeader}>D</th>
              <th style={styles.tableHeader}>L</th>
              <th style={styles.tableHeader}>GF</th>
              <th style={styles.tableHeader}>GA</th>
              <th style={styles.tableHeader}>GD</th>
              <th style={styles.tableHeader}>Pts</th>
            </tr>
          </thead>
          <tbody>
            {standingsData.map((row) => (
              <tr
                key={row.pos}
                style={styles.tableRow}
                onClick={() => handleTeamClick(row.team)}
              >
                <td style={styles.tableCell}>{row.pos}</td>
                <td style={{ ...styles.tableCell, ...styles.teamCell }}>{row.team}</td>
                <td style={styles.tableCellCenter}>{row.p}</td>
                <td style={styles.tableCellCenter}>{row.w}</td>
                <td style={styles.tableCellCenter}>{row.d}</td>
                <td style={styles.tableCellCenter}>{row.l}</td>
                <td style={styles.tableCellCenter}>{row.gf}</td>
                <td style={styles.tableCellCenter}>{row.ga}</td>
                <td style={{ ...styles.tableCellCenter, color: '#4ade80' }}>+{row.gd}</td>
                <td style={{ ...styles.tableCellCenter, ...styles.ptsCell }}>{row.pts}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={styles.totalTeams}>Total Teams: 20</div>
      </div>

      {/* Statistical Charts */}
      <div style={styles.chartsContainer}>
        {/* Wins Chart */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Wins</h3>
          <div style={styles.chartContent}>
            {winsData.map((item) => (
              <div key={item.rank} style={styles.chartBar}>
                <span style={styles.chartRank}>{item.rank}</span>
                <div style={styles.chartBarContainer}>
                  <div
                    style={{
                      ...styles.chartBarFill,
                      width: `${(item.value / 30) * 100}%`,
                      backgroundColor: '#3b82f6'
                    }}
                  ></div>
                </div>
                <span style={styles.chartValue}>{item.value}</span>
              </div>
            ))}
          </div>
          <div style={styles.chartLabel}>League Average</div>
        </div>

        {/* Avg Wins Chart */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Avg Wins</h3>
          <div style={styles.chartContent}>
            {avgWinsData.map((item) => (
              <div key={item.rank} style={styles.chartBar}>
                <span style={styles.chartRank}>{item.rank}</span>
                <div style={styles.chartBarContainer}>
                  <div
                    style={{
                      ...styles.chartBarFill,
                      width: item.value,
                      backgroundColor: '#10b981'
                    }}
                  ></div>
                </div>
                <span style={styles.chartValue}>{item.value}</span>
              </div>
            ))}
          </div>
          <div style={styles.chartLabel}>League Average</div>
        </div>
      </div>
    </div>
  );
};

// Styles object
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#020617', // slate-950
    color: '#e2e8f0', // slate-200
    padding: '2rem',
    maxWidth: '1280px',
    margin: '0 auto',
  },

  // Navigation
  navTabs: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
  },
  navButton: {
    padding: '0.5rem 1.5rem',
    fontSize: '1.125rem',
    fontWeight: '600',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  navButtonActive: {
    backgroundColor: '#3b82f6',
    color: 'white',
  },
  navButtonInactive: {
    backgroundColor: 'transparent',
    color: '#94a3b8',
  },

  // Sections
  section: {
    marginBottom: '1.5rem',
  },
  buttonGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  selectionButton: {
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    backgroundColor: '#334155', // slate-700
    color: '#e2e8f0',
    fontWeight: '500',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  selectionButtonActive: {
    backgroundColor: '#3b82f6',
    color: 'white',
  },

  // Season group
  seasonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  seasonRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
  },
  seasonButton: {
    padding: '0.625rem 1.25rem',
    borderRadius: '0.5rem',
    backgroundColor: '#334155',
    color: '#e2e8f0',
    fontWeight: '500',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  seasonButtonActive: {
    backgroundColor: '#3b82f6',
    color: 'white',
  },

  // Divider
  divider: {
    height: '1px',
    background: 'linear-gradient(90deg, transparent, #475569, transparent)',
    boxShadow: '0 0 8px rgba(59, 130, 246, 0.3)',
  },

  // Question
  question: {
    marginBottom: '2rem',
    color: '#94a3b8',
    fontSize: '0.875rem',
    fontStyle: 'italic',
  },

  // Title
  title: {
    fontSize: '1.875rem',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '2rem',
    color: '#f1f5f9',
  },

  // Table
  tableContainer: {
    marginBottom: '3rem',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    fontSize: '0.875rem',
    borderCollapse: 'separate',
    borderSpacing: '0',
  },
  tableHeaderRow: {
    borderBottom: '1px solid #334155',
  },
  tableHeader: {
    padding: '0.75rem 1rem',
    color: '#94a3b8',
    fontWeight: '600',
    textAlign: 'center',
  },
  tableRow: {
    borderBottom: '1px solid #1e293b',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  tableCell: {
    padding: '0.75rem 1rem',
    color: '#cbd5e1',
  },
  teamCell: {
    color: '#f1f5f9',
    fontWeight: '500',
  },
  tableCellCenter: {
    padding: '0.75rem 1rem',
    color: '#cbd5e1',
    textAlign: 'center',
  },
  ptsCell: {
    color: '#f1f5f9',
    fontWeight: '600',
  },
  totalTeams: {
    marginTop: '1rem',
    color: '#94a3b8',
    fontSize: '0.875rem',
  },

  // Charts
  chartsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
  },
  chartCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.5)', // slate-900/50
    borderRadius: '0.5rem',
    padding: '1.5rem',
    border: '1px solid #1e293b',
  },
  chartTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
    color: '#e2e8f0',
  },
  chartContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  chartBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  chartRank: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    width: '1rem',
  },
  chartBarContainer: {
    flex: 1,
    height: '2rem',
    backgroundColor: 'transparent',
  },
  chartBarFill: {
    height: '100%',
    borderRadius: '0.25rem',
    transition: 'all 0.3s ease',
  },
  chartValue: {
    fontSize: '0.875rem',
    color: '#cbd5e1',
    width: '2rem',
    textAlign: 'right',
  },
  chartLabel: {
    marginTop: '1rem',
    fontSize: '0.75rem',
    color: '#64748b',
    textAlign: 'center',
  },
};

export default LeaguesPage;
