'use client'

import Link from 'next/link'
import { useState } from 'react'

interface Student {
  id: string
  name: string
  grade: string
  avatar_emoji: string
  total_points: number
  streak_count: number | null
  class_id: string | null
}

interface ClassRanking {
  name: string
  totalPoints: number
  studentCount: number
  topEmoji: string
}

interface Props {
  students: Student[]
  classRankings: ClassRanking[]
}

const rankEmojis = ['🥇', '🥈', '🥉']

export function LeaderboardClient({ students, classRankings }: Props) {
  const [search, setSearch] = useState('')
  const [gradeFilter, setGradeFilter] = useState('')

  // Unique grades and classes for filter dropdown
  const grades = Array.from(new Set(students.map((s) => s.grade).filter(Boolean))).sort()
  const classes = Array.from(new Set(students.map((s) => s.class_id).filter(Boolean))).sort()

  const filtered = students.filter((s) => {
    const matchesSearch =
      !search || s.name.toLowerCase().includes(search.toLowerCase())
    const matchesGrade =
      !gradeFilter || s.grade === gradeFilter || s.class_id === gradeFilter
    return matchesSearch && matchesGrade
  })

  const filteredClassRankings = classRankings.filter((c) => {
    if (!search) return true
    return c.name.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Individual Rankings */}
      <div className="clay-card p-6">
        <h2
          className="text-xl font-bold mb-4 flex items-center gap-2"
          style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}
        >
          🎯 Individual Rankings
        </h2>

        {/* Search + Filter */}
        <div className="flex gap-2 mb-5">
          <input
            type="search"
            placeholder="Search student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-clay flex-1 px-4 py-2 text-sm"
            style={{ fontFamily: '"Comic Neue", cursive', color: '#881337' }}
          />
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="input-clay px-3 py-2 text-sm"
            style={{ fontFamily: '"Comic Neue", cursive', color: '#881337', background: 'white' }}
          >
            <option value="">All</option>
            {grades.length > 0 && (
              <optgroup label="Grade">
                {grades.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </optgroup>
            )}
            {classes.length > 0 && (
              <optgroup label="Class">
                {classes.map((c) => (
                  <option key={c} value={c!}>
                    {c}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-3 select-none">🔍</div>
            <p style={{ fontFamily: '"Comic Neue", cursive', color: '#BE123C' }}>
              {students.length === 0 ? 'No students yet!' : 'No matches found.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.slice(0, 10).map((student, index) => {
              // Rank is based on position in full list
              const globalRank = students.indexOf(student)
              return (
                <Link
                  key={student.id}
                  href={`/student/${student.id}`}
                  className="flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 hover:scale-[1.02] cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400"
                  style={{
                    background: globalRank === 0
                      ? 'linear-gradient(135deg, #FEF9C3, #FEF08A)'
                      : globalRank === 1
                      ? 'linear-gradient(135deg, #F1F5F9, #E2E8F0)'
                      : globalRank === 2
                      ? 'linear-gradient(135deg, #FEF3C7, #FDE68A)'
                      : '#FFF8F9',
                    border: '1px solid #FECDD3',
                    boxShadow: globalRank < 3
                      ? '0 4px 12px rgba(225,29,72,0.15)'
                      : '0 2px 6px rgba(225,29,72,0.08)',
                  }}
                >
                  <div
                    className="w-9 h-9 flex items-center justify-center rounded-full font-bold text-sm flex-shrink-0"
                    style={{
                      fontFamily: '"Baloo 2", sans-serif',
                      background: globalRank < 3
                        ? 'linear-gradient(135deg, #FB7185, #E11D48)'
                        : '#FECDD3',
                      color: globalRank < 3 ? 'white' : '#881337',
                      fontSize: globalRank < 3 ? '1.1rem' : '0.875rem',
                    }}
                  >
                    {globalRank < 3 ? rankEmojis[globalRank] : `#${globalRank + 1}`}
                  </div>
                  <div className="text-3xl select-none">{student.avatar_emoji}</div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-bold truncate"
                      style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}
                    >
                      {student.name}
                    </p>
                    <p
                      className="text-xs"
                      style={{ fontFamily: '"Comic Neue", cursive', color: '#BE123C' }}
                    >
                      {student.grade}
                      {(student.streak_count || 0) > 0 && (
                        <span className="ml-2">🔥 {student.streak_count} day streak</span>
                      )}
                    </p>
                  </div>
                  <div
                    className="font-bold text-sm px-3 py-1 rounded-full flex-shrink-0"
                    style={{
                      fontFamily: '"Baloo 2", sans-serif',
                      color: 'white',
                      background: 'linear-gradient(135deg, #FB7185, #E11D48)',
                    }}
                  >
                    {student.total_points} pts
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {filtered.length > 10 && (
          <p
            className="mt-4 text-center text-xs"
            style={{ fontFamily: '"Comic Neue", cursive', color: '#BE123C' }}
          >
            Showing top 10 of {filtered.length} results
          </p>
        )}
      </div>

      {/* Class Rankings */}
      <div className="clay-card p-6">
        <h2
          className="text-xl font-bold mb-5 flex items-center gap-2"
          style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}
        >
          🏫 Class Rankings
        </h2>

        {filteredClassRankings.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-3 select-none">🏫</div>
            <p style={{ fontFamily: '"Comic Neue", cursive', color: '#BE123C' }}>
              No classes yet!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredClassRankings.map((cls, index) => (
              <div
                key={cls.name}
                className="p-5 rounded-2xl"
                style={{
                  background: index === 0
                    ? 'linear-gradient(135deg, #FEF9C3, #FEF08A)'
                    : '#FFF8F9',
                  border: '1px solid #FECDD3',
                  boxShadow: index === 0
                    ? '0 4px 16px rgba(225,29,72,0.18)'
                    : '0 2px 8px rgba(225,29,72,0.08)',
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{index < 3 ? rankEmojis[index] : `#${index + 1}`}</span>
                    <div>
                      <p
                        className="font-bold"
                        style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}
                      >
                        {cls.name}
                      </p>
                      <p
                        className="text-xs"
                        style={{ fontFamily: '"Comic Neue", cursive', color: '#BE123C' }}
                      >
                        {cls.studentCount} student{cls.studentCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div
                    className="font-bold px-3 py-1 rounded-full text-sm"
                    style={{
                      fontFamily: '"Baloo 2", sans-serif',
                      color: 'white',
                      background: 'linear-gradient(135deg, #FB7185, #E11D48)',
                    }}
                  >
                    {cls.totalPoints} pts
                  </div>
                </div>
                <div
                  className="w-full rounded-full h-3 overflow-hidden"
                  style={{ background: '#F0ECF2' }}
                >
                  <div
                    className="h-3 rounded-full transition-all duration-700"
                    style={{
                      width: `${classRankings[0]?.totalPoints > 0 ? (cls.totalPoints / classRankings[0].totalPoints) * 100 : 0}%`,
                      background: 'linear-gradient(90deg, #FB7185, #E11D48)',
                      boxShadow: '0 2px 8px rgba(225,29,72,0.3)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
