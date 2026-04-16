'use client'

import { useActionState, useState, useTransition } from 'react'
import { addStudent, adminAddAchievement, createChallenge, setGoal, deleteStudent } from '@/app/actions'
import type { Student } from '@/lib/types'

interface AdminFormsProps {
  students: Student[]
}

interface ActionState {
  message?: string
  error?: string
}

const initialState: ActionState = {}

function addStudentAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  return addStudent(formData).then((result) => {
    if (result.error) return { error: result.error }
    return { message: 'Student added successfully!' }
  })
}

function addAchievementAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  return adminAddAchievement(formData).then((result) => {
    if (result.error) return { error: result.error }
    const badgeMsg =
      result.newBadges.length > 0
        ? ` Earned ${result.newBadges.length} new badge(s): ${result.newBadges.map((b) => b.name).join(', ')}!`
        : ''
    return { message: `Achievement added!${badgeMsg}` }
  })
}

function createChallengeAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  return createChallenge(formData).then((result) => {
    if (result.error) return { error: result.error }
    return { message: 'Challenge created!' }
  })
}

function setGoalAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  return setGoal(formData).then((result) => {
    if (result.error) return { error: result.error }
    return { message: 'Goal set for student!' }
  })
}

export function AdminForms({ students }: AdminFormsProps) {
  const [studentState, studentFormAction, studentPending] = useActionState(
    addStudentAction,
    initialState
  )
  const [achievementState, achievementFormAction, achievementPending] =
    useActionState(addAchievementAction, initialState)
  const [challengeState, challengeFormAction, challengePending] =
    useActionState(createChallengeAction, initialState)
  const [goalState, goalFormAction, goalPending] =
    useActionState(setGoalAction, initialState)

  // Delete student state
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null)
  const [deletePending, startDeleteTransition] = useTransition()

  function confirmDelete() {
    if (!deleteTarget) return
    setDeleteError(null)
    setDeleteSuccess(null)
    startDeleteTransition(async () => {
      const result = await deleteStudent(deleteTarget.id)
      if (result.error) {
        setDeleteError(result.error)
      } else {
        setDeleteSuccess(`${deleteTarget.name} and all their data have been permanently deleted.`)
        setDeleteTarget(null)
      }
    })
  }

  const labelStyle = {
    fontFamily: '"Baloo 2", sans-serif',
    color: '#881337',
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 600,
    marginBottom: '4px',
  } as React.CSSProperties

  const inputStyle = {
    fontFamily: '"Comic Neue", cursive',
    color: '#881337',
  } as React.CSSProperties

  function SuccessMsg({ msg }: { msg: string }) {
    return (
      <p
        className="text-sm rounded-2xl px-4 py-2"
        style={{
          color: '#15803d',
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          fontFamily: '"Comic Neue", cursive',
        }}
      >
        {msg}
      </p>
    )
  }

  function ErrorMsg({ msg }: { msg: string }) {
    return (
      <p
        className="text-sm rounded-2xl px-4 py-2"
        style={{
          color: '#DC2626',
          background: '#FFF1F2',
          border: '1px solid #FECDD3',
          fontFamily: '"Comic Neue", cursive',
        }}
      >
        {msg}
      </p>
    )
  }

  return (
    <div className="space-y-6">
      {/* Add Student */}
      <div className="clay-card p-6">
        <h2
          className="text-lg font-bold mb-5"
          style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}
        >
          Add Student
        </h2>
        <form action={studentFormAction} className="space-y-4">
          <div>
            <label style={labelStyle}>Student Name</label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Jordan Smith"
              className="input-clay w-full px-4 py-3 text-sm"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Grade</label>
            <input
              type="text"
              name="grade"
              required
              placeholder="e.g. Grade 4"
              className="input-clay w-full px-4 py-3 text-sm"
              style={inputStyle}
            />
          </div>
          {studentState.message && <SuccessMsg msg={studentState.message} />}
          {studentState.error && <ErrorMsg msg={studentState.error} />}
          <button
            type="submit"
            disabled={studentPending}
            className="btn-rose w-full px-4 py-3 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {studentPending ? 'Adding...' : 'Add Student'}
          </button>
        </form>
      </div>

      {/* Add Achievement */}
      <div className="clay-card p-6">
        <h2
          className="text-lg font-bold mb-5"
          style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}
        >
          Add Achievement
        </h2>
        {students.length === 0 ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-2 select-none">🏆</div>
            <p className="text-sm" style={{ fontFamily: '"Comic Neue", cursive', color: '#BE123C' }}>
              Add a student first to record achievements.
            </p>
          </div>
        ) : (
          <form action={achievementFormAction} className="space-y-4">
            <div>
              <label style={labelStyle}>Student</label>
              <select
                name="student_id"
                required
                className="input-clay w-full px-4 py-3 text-sm"
                style={{ ...inputStyle, background: 'white' }}
              >
                <option value="">Select a student...</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.avatar_emoji} {s.name} ({s.grade})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Achievement Title</label>
              <input
                type="text"
                name="title"
                required
                placeholder="e.g. Perfect Science Quiz"
                className="input-clay w-full px-4 py-3 text-sm"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Description (optional)</label>
              <textarea
                name="description"
                rows={2}
                placeholder="Brief description..."
                className="input-clay w-full px-4 py-3 text-sm resize-none"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <select
                name="category"
                className="input-clay w-full px-4 py-3 text-sm"
                style={{ ...inputStyle, background: 'white' }}
              >
                <option value="General">General</option>
                <option value="Science">Science 🔬</option>
                <option value="Math">Math 📐</option>
                <option value="Reading">Reading 📚</option>
                <option value="Art">Art 🎨</option>
                <option value="Sports">Sports ⚽</option>
                <option value="Music">Music 🎵</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Points Awarded</label>
              <input
                type="number"
                name="points_awarded"
                defaultValue={10}
                min={1}
                max={100}
                className="input-clay w-full px-4 py-3 text-sm"
                style={inputStyle}
              />
            </div>
            {achievementState.message && <SuccessMsg msg={achievementState.message} />}
            {achievementState.error && <ErrorMsg msg={achievementState.error} />}
            <button
              type="submit"
              disabled={achievementPending}
              className="btn-rose w-full px-4 py-3 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {achievementPending ? 'Adding...' : 'Add Achievement'}
            </button>
          </form>
        )}
      </div>

      {/* Create Challenge */}
      <div className="clay-card p-6">
        <h2
          className="text-lg font-bold mb-5"
          style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}
        >
          🎯 Create Challenge
        </h2>
        <form action={challengeFormAction} className="space-y-4">
          <div>
            <label style={labelStyle}>Challenge Title</label>
            <input
              type="text"
              name="title"
              required
              placeholder="e.g. Science Week Sprint"
              className="input-clay w-full px-4 py-3 text-sm"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Description (optional)</label>
            <textarea
              name="description"
              rows={2}
              placeholder="What do students need to accomplish?"
              className="input-clay w-full px-4 py-3 text-sm resize-none"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Category</label>
            <select
              name="category"
              className="input-clay w-full px-4 py-3 text-sm"
              style={{ ...inputStyle, background: 'white' }}
            >
              <option value="">Any category</option>
              <option value="General">General</option>
              <option value="Science">Science 🔬</option>
              <option value="Math">Math 📐</option>
              <option value="Reading">Reading 📚</option>
              <option value="Art">Art 🎨</option>
              <option value="Sports">Sports ⚽</option>
              <option value="Music">Music 🎵</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Deadline</label>
            <input
              type="datetime-local"
              name="deadline"
              required
              className="input-clay w-full px-4 py-3 text-sm"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Target Count</label>
            <input
              type="number"
              name="target_count"
              defaultValue={3}
              min={1}
              max={100}
              className="input-clay w-full px-4 py-3 text-sm"
              style={inputStyle}
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_class_wide"
              name="is_class_wide"
              value="true"
              className="w-4 h-4 accent-rose-500"
              defaultChecked
            />
            <label
              htmlFor="is_class_wide"
              className="text-sm font-semibold cursor-pointer"
              style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}
            >
              🏫 Class-wide challenge
            </label>
          </div>
          <div>
            <label style={labelStyle}>Class ID (optional)</label>
            <input
              type="text"
              name="class_id"
              placeholder="e.g. Class A"
              className="input-clay w-full px-4 py-3 text-sm"
              style={inputStyle}
            />
          </div>
          {challengeState.message && <SuccessMsg msg={challengeState.message} />}
          {challengeState.error && <ErrorMsg msg={challengeState.error} />}
          <button
            type="submit"
            disabled={challengePending}
            className="btn-rose w-full px-4 py-3 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {challengePending ? 'Creating...' : 'Create Challenge'}
          </button>
        </form>
      </div>

      {/* Set Goal */}
      <div className="clay-card p-6">
        <h2
          className="text-lg font-bold mb-5"
          style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}
        >
          🎯 Set Student Goal
        </h2>
        {students.length === 0 ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-2 select-none">🎯</div>
            <p className="text-sm" style={{ fontFamily: '"Comic Neue", cursive', color: '#BE123C' }}>
              Add a student first to set goals.
            </p>
          </div>
        ) : (
          <form action={goalFormAction} className="space-y-4">
            <div>
              <label style={labelStyle}>Student</label>
              <select
                name="student_id"
                required
                className="input-clay w-full px-4 py-3 text-sm"
                style={{ ...inputStyle, background: 'white' }}
              >
                <option value="">Select a student...</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.avatar_emoji} {s.name} ({s.grade})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Goal Title</label>
              <input
                type="text"
                name="title"
                required
                placeholder="e.g. Reading Champion"
                className="input-clay w-full px-4 py-3 text-sm"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Description (optional)</label>
              <textarea
                name="description"
                rows={2}
                placeholder="What should the student achieve?"
                className="input-clay w-full px-4 py-3 text-sm resize-none"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <select
                name="category"
                className="input-clay w-full px-4 py-3 text-sm"
                style={{ ...inputStyle, background: 'white' }}
              >
                <option value="">Any category</option>
                <option value="General">General</option>
                <option value="Science">Science 🔬</option>
                <option value="Math">Math 📐</option>
                <option value="Reading">Reading 📚</option>
                <option value="Art">Art 🎨</option>
                <option value="Sports">Sports ⚽</option>
                <option value="Music">Music 🎵</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Target Count (achievements needed)</label>
              <input
                type="number"
                name="target_count"
                defaultValue={5}
                min={1}
                max={100}
                className="input-clay w-full px-4 py-3 text-sm"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Deadline (optional)</label>
              <input
                type="date"
                name="deadline"
                className="input-clay w-full px-4 py-3 text-sm"
                style={inputStyle}
              />
            </div>
            {goalState.message && <SuccessMsg msg={goalState.message} />}
            {goalState.error && <ErrorMsg msg={goalState.error} />}
            <button
              type="submit"
              disabled={goalPending}
              className="btn-rose w-full px-4 py-3 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {goalPending ? 'Setting Goal...' : 'Set Goal'}
            </button>
          </form>
        )}
      </div>

      {/* Delete Student (FERPA) */}
      <div
        className="clay-card p-6"
        style={{ borderColor: '#fda4af' }}
      >
        <h2
          className="text-lg font-bold mb-2 flex items-center gap-2"
          style={{ fontFamily: '"Baloo 2", sans-serif', color: '#dc2626' }}
        >
          🗑️ Delete Student (FERPA)
        </h2>
        <p
          className="text-sm mb-5"
          style={{ fontFamily: '"Comic Neue", cursive', color: '#BE123C' }}
        >
          Permanently remove a student and all their data to comply with FERPA data deletion requests.
        </p>
        {students.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm" style={{ fontFamily: '"Comic Neue", cursive', color: '#BE123C' }}>
              No students to delete.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {students.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-3 rounded-2xl"
                style={{ background: '#fff5f5', border: '1px solid #fecaca' }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl select-none">{s.avatar_emoji}</span>
                  <div>
                    <p className="font-bold text-sm" style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}>
                      {s.name}
                    </p>
                    <p className="text-xs" style={{ fontFamily: '"Comic Neue", cursive', color: '#BE123C' }}>
                      {s.grade}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setDeleteError(null)
                    setDeleteSuccess(null)
                    setDeleteTarget(s)
                  }}
                  className="px-4 py-2 rounded-2xl text-xs font-bold transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-400"
                  style={{
                    fontFamily: '"Baloo 2", sans-serif',
                    background: '#fee2e2',
                    color: '#dc2626',
                    border: '1px solid #fca5a5',
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        {deleteSuccess && (
          <div className="mt-4">
            <SuccessMsg msg={deleteSuccess} />
          </div>
        )}
        {deleteError && (
          <div className="mt-4">
            <ErrorMsg msg={deleteError} />
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(136,19,55,0.25)', backdropFilter: 'blur(4px)' }}
        >
          <div
            className="clay-card p-8 w-full max-w-md"
            style={{ borderColor: '#fda4af' }}
          >
            <div className="text-5xl text-center mb-4 select-none">⚠️</div>
            <h3
              className="text-xl font-bold text-center mb-3"
              style={{ fontFamily: '"Baloo 2", sans-serif', color: '#dc2626' }}
            >
              Permanently Delete Student?
            </h3>
            <div
              className="rounded-2xl p-4 mb-5 text-center"
              style={{ background: '#fff5f5', border: '1px solid #fecaca' }}
            >
              <p className="text-2xl select-none mb-1">{deleteTarget.avatar_emoji}</p>
              <p className="font-bold text-base" style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}>
                {deleteTarget.name}
              </p>
              <p className="text-xs mt-1" style={{ fontFamily: '"Comic Neue", cursive', color: '#BE123C' }}>
                {deleteTarget.grade}
              </p>
            </div>
            <p
              className="text-sm text-center mb-6 leading-relaxed"
              style={{ fontFamily: '"Comic Neue", cursive', color: '#881337' }}
            >
              This will <strong>permanently delete</strong> all student data including achievements,
              badges, goals, and progress. <strong>This action cannot be undone.</strong>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-3 rounded-2xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-rose-400"
                style={{
                  fontFamily: '"Baloo 2", sans-serif',
                  background: 'white',
                  border: '1.5px solid #FECDD3',
                  color: '#881337',
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deletePending}
                className="flex-1 px-4 py-3 rounded-2xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  fontFamily: '"Baloo 2", sans-serif',
                  background: 'linear-gradient(135deg, #f87171, #dc2626)',
                  color: 'white',
                }}
              >
                {deletePending ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
