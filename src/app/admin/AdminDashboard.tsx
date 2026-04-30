'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import type { Student } from '@/lib/types'

interface WeeklyBar { day: string; count: number }
interface CategorySlice { category: string; count: number }

interface Props {
  students: EnrichedStudent[]
  weeklyData: WeeklyBar[]
  categoryData: CategorySlice[]
}

type EnrichedStudent = Student & { achievementCount: number; badgeCount: number }
type SortKey = keyof Pick<EnrichedStudent, 'name' | 'total_points' | 'achievementCount' | 'badgeCount' | 'streak_count'>

const PIE_COLORS = ['#E11D48', '#FB7185', '#F43F5E', '#BE123C', '#9F1239', '#881337', '#C084FC']

const categoryEmojis: Record<string, string> = {
  Science: '🔬', Math: '📐', Reading: '📚', Art: '🎨',
  Sports: '⚽', Music: '🎵', General: '⭐',
}

export function AdminDashboard({ students, weeklyData, categoryData }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('total_points')
  const [sortAsc, setSortAsc] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<EnrichedStudent | null>(null)

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc((a) => !a)
    else { setSortKey(key); setSortAsc(false) }
  }

  const sorted = [...students].sort((a: EnrichedStudent, b: EnrichedStudent) => {
    const av = a[sortKey] ?? 0
    const bv = b[sortKey] ?? 0
    if (typeof av === 'string' && typeof bv === 'string') {
      return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av)
    }
    return sortAsc ? (av as number) - (bv as number) : (bv as number) - (av as number)
  })

  function SortTh({ label, k }: { label: string; k: SortKey }) {
    const active = sortKey === k
    return (
      <th
        className="pb-3 text-left font-bold cursor-pointer select-none hover:opacity-70 transition-opacity"
        style={{ fontFamily: '"Baloo 2", sans-serif', color: active ? '#E11D48' : '#BE123C' }}
        onClick={() => toggleSort(k)}
      >
        {label} {active ? (sortAsc ? '↑' : '↓') : ''}
      </th>
    )
  }

  return (
    <div className="space-y-8">
      {/* ── Sortable Students Table ── */}
      <div className="clay-card p-6">
        <h2 className="text-lg font-bold mb-5" style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}>
          Students ({students.length}) — click a row to view history
        </h2>
        {students.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-3 select-none">👩‍🎓</div>
            <p className="font-semibold" style={{ fontFamily: '"Baloo 2", sans-serif', color: '#BE123C' }}>No students yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '2px solid #FECDD3' }}>
                  <SortTh label="Student" k="name" />
                  <SortTh label="Points" k="total_points" />
                  <SortTh label="Badges" k="badgeCount" />
                  <SortTh label="Achvmts" k="achievementCount" />
                  <SortTh label="Streak" k="streak_count" />
                </tr>
              </thead>
              <tbody>
                {sorted.map((student) => (
                  <tr
                    key={student.id}
                    className="cursor-pointer transition-colors"
                    style={{ borderBottom: '1px solid #FECDD3' }}
                    onClick={() => setSelectedStudent(student)}
                    onMouseEnter={(e: React.MouseEvent<HTMLTableRowElement>) => { e.currentTarget.style.background = '#FFF8F9' }}
                    onMouseLeave={(e: React.MouseEvent<HTMLTableRowElement>) => { e.currentTarget.style.background = 'transparent' }}
                  >
                    <td className="py-3">
                      <Link
                        href={`/student/${student.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-2 font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-rose-400 rounded-lg px-1"
                        style={{ fontFamily: '"Baloo 2", sans-serif', color: '#E11D48' }}
                      >
                        <span>{student.avatar_emoji}</span>
                        <span>{student.name}</span>
                      </Link>
                    </td>
                    <td className="py-3">
                      <span className="font-bold px-2 py-0.5 rounded-full text-xs" style={{ fontFamily: '"Baloo 2", sans-serif', color: 'white', background: 'linear-gradient(135deg, #FB7185, #E11D48)' }}>
                        {student.total_points}
                      </span>
                    </td>
                    <td className="py-3 font-bold" style={{ fontFamily: '"Baloo 2", sans-serif', color: '#2563EB' }}>{student.badgeCount}</td>
                    <td className="py-3 font-bold" style={{ fontFamily: '"Baloo 2", sans-serif', color: '#BE123C' }}>{student.achievementCount}</td>
                    <td className="py-3 font-bold" style={{ fontFamily: '"Baloo 2", sans-serif', color: '#D97706' }}>
                      {(student.streak_count ?? 0) > 0 ? `🔥 ${student.streak_count}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Charts Row (Recharts, DEMO-08) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Achievements Bar Chart */}
        <div className="clay-card p-6">
          <h2 className="text-lg font-bold mb-4" style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}>
            📅 Achievements This Week
          </h2>
          {weeklyData.some(d => d.count > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#FECDD3" />
                <XAxis dataKey="day" tick={{ fontFamily: '"Comic Neue", cursive', fontSize: 11, fill: '#BE123C' }} tickLine={false} axisLine={{ stroke: '#FECDD3' }} />
                <YAxis allowDecimals={false} tick={{ fontFamily: '"Comic Neue", cursive', fontSize: 11, fill: '#BE123C' }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: 'white', border: '1px solid #FECDD3', borderRadius: '1rem', fontFamily: '"Comic Neue", cursive', color: '#881337' }} />
                <Bar dataKey="count" name="Achievements" radius={[6, 6, 0, 0]} fill="url(#roseGrad)" />
                <defs>
                  <linearGradient id="roseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FB7185" />
                    <stop offset="100%" stopColor="#E11D48" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm" style={{ fontFamily: '"Comic Neue", cursive', color: '#BE123C' }}>No achievements submitted this week yet.</p>
            </div>
          )}
        </div>

        {/* Badge Distribution Pie Chart */}
        <div className="clay-card p-6">
          <h2 className="text-lg font-bold mb-4" style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}>
            🏅 Badge Distribution by Category
          </h2>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  dataKey="count"
                  nameKey="category"
                  label={({ category, percent }) => `${categoryEmojis[category] ?? '📌'} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} badge${value !== 1 ? 's' : ''}`, name]}
                  contentStyle={{ background: 'white', border: '1px solid #FECDD3', borderRadius: '1rem', fontFamily: '"Comic Neue", cursive' }}
                />
                <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontFamily: '"Comic Neue", cursive', fontSize: 12, color: '#881337' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm" style={{ fontFamily: '"Comic Neue", cursive', color: '#BE123C' }}>No badges awarded yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Most Active Students Ranked List */}
      {students.length > 0 && (
        <div className="clay-card p-6">
          <h2 className="text-lg font-bold mb-4" style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}>
            🔥 Most Active Students
          </h2>
          <div className="space-y-2">
            {[...students]
              .sort((a, b) => b.achievementCount - a.achievementCount)
              .slice(0, 5)
              .map((s, i) => (
                <div key={s.id} className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: '#FFF8F9', border: '1px solid #FECDD3' }}>
                  <span className="font-bold text-sm w-6 text-center" style={{ fontFamily: '"Baloo 2", sans-serif', color: '#E11D48' }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                  </span>
                  <span className="text-xl select-none">{s.avatar_emoji}</span>
                  <span className="flex-1 font-semibold text-sm" style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}>{s.name}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'linear-gradient(135deg,#FB7185,#E11D48)', color: 'white', fontFamily: '"Baloo 2", sans-serif' }}>
                    {s.achievementCount} achievements
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ── Slide-out Student History Panel (DEMO-08) ── */}
      {selectedStudent && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          style={{ background: 'rgba(136,19,55,0.3)' }}
          onClick={() => setSelectedStudent(null)}
        >
          <div
            className="w-full max-w-md h-full overflow-y-auto p-8 flex flex-col gap-6"
            style={{ background: 'white', boxShadow: '-8px 0 40px rgba(225,29,72,0.2)', animation: 'slideInRight 0.25s ease' }}
            onClick={(e) => e.stopPropagation()}
          >
            <style>{`@keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-4xl select-none">{selectedStudent.avatar_emoji}</span>
                <div>
                  <h3 className="text-xl font-bold" style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}>{selectedStudent.name}</h3>
                  <p className="text-sm" style={{ fontFamily: '"Comic Neue", cursive', color: '#BE123C' }}>{selectedStudent.grade}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-sm font-bold px-3 py-1 rounded-full hover:bg-rose-50 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-400"
                style={{ fontFamily: '"Baloo 2", sans-serif', color: '#E11D48' }}
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: 'Points', value: selectedStudent.total_points, color: '#E11D48' },
                { label: 'Badges', value: selectedStudent.badgeCount, color: '#2563EB' },
                { label: 'Achievements', value: selectedStudent.achievementCount, color: '#BE123C' },
              ].map(({ label, value, color }) => (
                <div key={label} className="p-3 rounded-2xl" style={{ background: '#FFF8F9', border: '1px solid #FECDD3' }}>
                  <div className="text-2xl font-bold" style={{ fontFamily: '"Baloo 2", sans-serif', color }}>{value}</div>
                  <div className="text-xs" style={{ fontFamily: '"Comic Neue", cursive', color: '#BE123C' }}>{label}</div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Link
                href={`/student/${selectedStudent.id}`}
                className="flex-1 text-center px-4 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-rose-400"
                style={{ fontFamily: '"Baloo 2", sans-serif', background: 'linear-gradient(135deg,#FB7185,#E11D48)', color: 'white' }}
              >
                View Full Profile →
              </Link>
              <Link
                href={`/parent/${selectedStudent.id}`}
                className="flex-1 text-center px-4 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-rose-400"
                style={{ fontFamily: '"Baloo 2", sans-serif', background: 'white', border: '1.5px solid #FECDD3', color: '#881337' }}
              >
                Parent View →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
