import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Blue-based color palette for cool vibe
const CHART_COLORS = [
    '#0ea5e9', '#06b6d4', '#0891b2', '#0284c7', 
    '#0369a1', '#0e7490', '#22d3ee', '#14b8a6',
    '#0c4a6e', '#0369a1'
];

export default function StatChart({ 
    title, 
    data, 
    statKey, // For backward compatibility with leagues page
    isPercentage = false,
    showDisclaimer = false,
    currentMode = 'raw',
    onToggleMode
}) {
    const [sortOrder, setSortOrder] = useState(null); // null = db order, 'asc', 'desc'

    // Transform data if statKey is provided (leagues page format)
    const transformedData = statKey 
        ? data.map((item, index) => ({
            name: item.team_name || item.full_name || item.name,
            value: item[statKey],
            color: CHART_COLORS[index % CHART_COLORS.length],
            isTeam: true
        }))
        : data;

    // Separate teams and league averages
    const teams = transformedData.filter(d => d.isTeam);
    const leagueAvgs = transformedData.filter(d => d.isLeagueAverage);

    // Format value for display
    const formatValue = (value) => {
        if (value === null || value === undefined) return 'N/A';
        if (isPercentage) return `${(value * 100).toFixed(1)}%`;
        return typeof value === 'number' ? value.toFixed(2) : value;
    };

    // Sort data based on current order
    const getSortedData = () => {
        if (!sortOrder) return transformedData; // DB order
        
        const sorted = [...transformedData].sort((a, b) => {
            return sortOrder === 'asc' 
                ? a.value - b.value
                : b.value - a.value;
        });
        return sorted;
    };

    const sortedData = getSortedData();

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    padding: '0.75rem',
                    border: '1px solid #3b82f6',
                    borderRadius: '0.5rem',
                }}>
                    <p style={{ color: '#f1f5f9', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                        {payload[0].payload.name}
                    </p>
                    <p style={{ color: '#60a5fa' }}>
                        {title}: {formatValue(payload[0].value)}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="chart-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                {/* Toggle Switch for Raw/Normalized - only show if onToggleMode is provided */}
                {onToggleMode && (
                    <div className="mode-toggle-container">
                        <span className={`mode-label ${currentMode === 'raw' ? 'active' : ''}`}>Raw</span>
                        <div 
                            className="toggle-switch"
                            onClick={onToggleMode}
                            style={{
                                width: '36px',
                                height: '18px',
                                backgroundColor: currentMode === 'normalized' ? '#3b82f6' : '#6b7280',
                                borderRadius: '9px',
                                position: 'relative',
                                cursor: 'pointer',
                                transition: 'background-color 0.3s ease',
                                margin: '0 0.4rem'
                            }}
                        >
                            <div 
                                className="toggle-slider"
                                style={{
                                    width: '14px',
                                    height: '14px',
                                    backgroundColor: 'white',
                                    borderRadius: '50%',
                                    position: 'absolute',
                                    top: '2px',
                                    left: currentMode === 'normalized' ? '20px' : '2px',
                                    transition: 'left 0.3s ease',
                                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
                                }}
                            />
                        </div>
                        <span className={`mode-label ${currentMode === 'normalized' ? 'active' : ''}`}>Normalized</span>
                    </div>
                )}
                {!onToggleMode && <div />} {/* Spacer when no toggle */}

                {/* Sort Buttons */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        className={`sort-button ${sortOrder === 'asc' ? 'active' : ''}`}
                        onClick={() => setSortOrder(sortOrder === 'asc' ? null : 'asc')}
                    >
                        ASC
                    </button>
                    <button
                        className={`sort-button ${sortOrder === 'desc' ? 'active' : ''}`}
                        onClick={() => setSortOrder(sortOrder === 'desc' ? null : 'desc')}
                    >
                        DESC
                    </button>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sortedData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                    <defs>
                        {/* Define stripe patterns for league averages */}
                        {leagueAvgs.map((league, index) => (
                            <pattern
                                key={`pattern-${index}`}
                                id={`diagonalStripes-${index}`}
                                patternUnits="userSpaceOnUse"
                                width="8"
                                height="8"
                                patternTransform="rotate(45)"
                            >
                                <rect width="4" height="8" fill={league.color} />
                                <rect x="4" width="4" height="8" fill="rgba(0, 0, 0, 0.2)" />
                            </pattern>
                        ))}
                    </defs>
                    <XAxis 
                        dataKey="name" 
                        tick={false}
                        axisLine={false}
                    />
                    <YAxis 
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        tickFormatter={isPercentage ? (value) => `${(value * 100).toFixed(0)}%` : undefined}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {sortedData.map((entry, index) => {
                            const leagueIndex = leagueAvgs.findIndex(l => l.name === entry.name);
                            const fill = entry.isLeagueAverage && leagueIndex >= 0
                                ? `url(#diagonalStripes-${leagueIndex})`
                                : entry.color;
                            return <Cell key={`cell-${index}`} fill={fill} />;
                        })}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            {/* Compact Legend Badges */}
            <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '0.5rem', 
                justifyContent: 'center',
                marginTop: '0.75rem',
                padding: '0.5rem',
                borderTop: '1px solid #334155'
            }}>
                {teams.map((team, index) => (
                    <span 
                        key={`legend-team-${index}`}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontSize: '0.75rem',
                            color: '#94a3b8'
                        }}
                    >
                        <span style={{ 
                            width: '12px', 
                            height: '12px', 
                            backgroundColor: team.color,
                            borderRadius: '2px'
                        }} />
                        {team.name}
                    </span>
                ))}
                {leagueAvgs.map((league, index) => (
                    <span 
                        key={`legend-league-${index}`}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontSize: '0.75rem',
                            color: '#94a3b8'
                        }}
                    >
                        <span style={{ 
                            width: '12px', 
                            height: '12px', 
                            background: `repeating-linear-gradient(
                                45deg,
                                ${league.color},
                                ${league.color} 2px,
                                rgba(0, 0, 0, 0.3) 2px,
                                rgba(0, 0, 0, 0.3) 4px
                            )`,
                            borderRadius: '2px'
                        }} />
                        {league.name}
                    </span>
                ))}
            </div>

            <div style={{ 
                color: '#ffffff', 
                fontWeight: '600', 
                fontSize: '1.125rem', 
                textAlign: 'center', 
                marginTop: '1rem' 
            }}>
                {title}
            </div>
        </div>
    );
}
