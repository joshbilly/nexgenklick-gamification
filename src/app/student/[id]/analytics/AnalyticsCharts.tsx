'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts'

interface WeeklyDataPoint {
  week: string
  points: number
}

interface CategoryDataPoint {
  category: string
  count: number
}

interface AnalyticsChartsProps {
  weeklyData: WeeklyDataPoint[]
  categoryData: CategoryDataPoint[]
  totalAchievements: number
}

const COLORS = ['#E11D48', '#FB7185', '#F43F5E', '#BE123C', '#9F1239', '#881337']

const categoryEmojis: Record<string, string> = {
  Science: '🔬',
  Math: '📐',
  Reading: '📚',
  Art: '🎨',
  Sports: '⚽',
  Music: '🎵',
  General: '⭐',
}

function formatWeek(week: string): string {
  const d = new Date(week + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function AnalyticsCharts({ weeklyData, categoryData, totalAchievements }: AnalyticsChartsProps) {
  if (totalAchievements === 0) {
    return (
      <div className="clay-card p-12 text-center">
        <div className="text-5xl mb-3 select-none">📊</div>
        <p
          className="font-semibold"
          style={{ fontFamily: '"Baloo 2", sans-serif', color: '#BE123C' }}
        >
          No achievements yet — start earning to see your analytics!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Points Over Time */}
      <div className="clay-card p-6">
        <h2
          className="text-lg font-bold mb-5"
          style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}
        >
          📈 Points Over Time
        </h2>
        {weeklyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weeklyData.map((d) => ({ ...d, weekLabel: formatWeek(d.week) }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#FECDD3" />
              <XAxis
                dataKey="weekLabel"
                tick={{ fontFamily: '"Comic Neue", cursive', fontSize: 11, fill: '#BE123C' }}
                tickLine={false}
                axisLine={{ stroke: '#FECDD3' }}
              />
              <YAxis
                tick={{ fontFamily: '"Comic Neue", cursive', fontSize: 11, fill: '#BE123C' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: 'white',
                  border: '1px solid #FECDD3',
                  borderRadius: '1rem',
                  fontFamily: '"Comic Neue", cursive',
                  color: '#881337',
                }}
                labelStyle={{ fontFamily: '"Baloo 2", sans-serif', color: '#E11D48', fontWeight: 'bold' }}
              />
              <Line
                type="monotone"
                dataKey="points"
                stroke="#E11D48"
                strokeWidth={3}
                dot={{ fill: '#E11D48', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, fill: '#881337' }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p style={{ fontFamily: '"Comic Neue", cursive', color: '#BE123C' }}>
            Keep earning achievements to see your progress chart!
          </p>
        )}
      </div>

      {/* Subject Distribution */}
      <div className="clay-card p-6">
        <h2
          className="text-lg font-bold mb-5"
          style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}
        >
          📚 Subject Distribution
        </h2>
        {categoryData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#FECDD3" />
                <XAxis
                  dataKey="category"
                  tick={{ fontFamily: '"Comic Neue", cursive', fontSize: 11, fill: '#BE123C' }}
                  tickLine={false}
                  axisLine={{ stroke: '#FECDD3' }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontFamily: '"Comic Neue", cursive', fontSize: 11, fill: '#BE123C' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: 'white',
                    border: '1px solid #FECDD3',
                    borderRadius: '1rem',
                    fontFamily: '"Comic Neue", cursive',
                    color: '#881337',
                  }}
                  formatter={(value) => [`${value} achievement${value !== 1 ? 's' : ''}`, 'Count']}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {categoryData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex flex-wrap gap-2 mt-4">
              {categoryData.map((item, index) => (
                <div
                  key={item.category}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: `${COLORS[index % COLORS.length]}18`,
                    color: COLORS[index % COLORS.length],
                    border: `1.5px solid ${COLORS[index % COLORS.length]}40`,
                    fontFamily: '"Baloo 2", sans-serif',
                  }}
                >
                  <span>{categoryEmojis[item.category] || '📌'}</span>
                  <span>{item.category}</span>
                  <span className="opacity-70">({item.count})</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p style={{ fontFamily: '"Comic Neue", cursive', color: '#BE123C' }}>
            No category data yet.
          </p>
        )}
      </div>
    </div>
  )
}
