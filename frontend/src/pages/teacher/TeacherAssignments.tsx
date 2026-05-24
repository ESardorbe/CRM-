import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, Pencil, X, Check, ChevronDown, ChevronUp, Users } from 'lucide-react'
import { teachersApi } from '../../api/teachers'
import { coursesApi } from '../../api/courses'
import { assignmentsApi, type Assignment, type Submission } from '../../api/assignments'
import { useAuthContext } from '../../context/AuthContext'
import { useLang } from '../../context/LangContext'

const EMPTY_FORM = { title: '', description: '', dueDate: '', maxScore: 100 }

function SubmissionsPanel({ assignment }: { assignment: Assignment }) {
  const qc = useQueryClient()
  const { t } = useLang()
  const [gradeState, setGradeState] = useState<Record<string, { score: string; feedback: string }>>({})

  const { data: submissions, isLoading } = useQuery({
    queryKey: ['submissions', assignment.id],
    queryFn: () => assignmentsApi.getSubmissions(assignment.id),
  })

  const gradeMutation = useMutation({
    mutationFn: (submissionId: string) =>
      assignmentsApi.grade(submissionId, {
        score: Number(gradeState[submissionId]?.score),
        feedback: gradeState[submissionId]?.feedback,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['submissions', assignment.id] }),
  })

  if (isLoading) return (
    <div className="flex justify-center py-6">
      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!submissions?.length) return (
    <p className="text-sm text-gray-400 text-center py-6">{t('noSubmissions')}</p>
  )

  return (
    <ul className="divide-y divide-gray-100 dark:divide-gray-700">
      {submissions.map((sub: Submission) => {
        const g = gradeState[sub.id] ?? { score: sub.score?.toString() ?? '', feedback: sub.feedback ?? '' }
        return (
          <li key={sub.id} className="px-5 py-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  {sub.student?.user?.firstName} {sub.student?.user?.lastName}
                </p>
                {sub.comment && <p className="text-xs text-gray-500 mt-0.5">{sub.comment}</p>}
                {sub.fileUrl && (
                  <a href={`http://localhost:4001${sub.fileUrl}`} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline">{t('viewFile')}</a>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="number" min={0} max={assignment.maxScore}
                  placeholder={`${t('scoreLabel')} (/${assignment.maxScore})`}
                  className="input-field w-28 text-sm"
                  value={g.score}
                  onChange={(e) => setGradeState((s) => ({ ...s, [sub.id]: { ...g, score: e.target.value } }))}
                />
                <input
                  className="input-field w-40 text-sm" placeholder={t('comment')}
                  value={g.feedback}
                  onChange={(e) => setGradeState((s) => ({ ...s, [sub.id]: { ...g, feedback: e.target.value } }))}
                />
                <button
                  onClick={() => gradeMutation.mutate(sub.id)}
                  disabled={gradeMutation.isPending}
                  className="btn-primary text-xs px-3 py-1.5"
                >
                  {t('save')}
                </button>
              </div>
            </div>
            {sub.score !== null && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                {t('scoreLabel')}: {sub.score}/{assignment.maxScore}
                {sub.feedback && ` · ${sub.feedback}`}
              </p>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export default function TeacherAssignments() {
  const qc = useQueryClient()
  const { user } = useAuthContext()
  const { t } = useLang()
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [expanded, setExpanded] = useState<string | null>(null)

  const { data: teacherRecord } = useQuery({
    queryKey: ['my-teacher', user?.id],
    queryFn: () => teachersApi.getByUserId(user!.id),
    enabled: !!user?.id,
  })

  const { data: courses } = useQuery({
    queryKey: ['teacher-courses', teacherRecord?.id],
    queryFn: () => coursesApi.getTeacherCourses(teacherRecord!.id),
    enabled: !!teacherRecord?.id,
  })

  const { data: assignments, isLoading } = useQuery({
    queryKey: ['assignments', selectedCourseId],
    queryFn: () => assignmentsApi.getByCourse(selectedCourseId),
    enabled: !!selectedCourseId,
  })

  const createMutation = useMutation({
    mutationFn: () => assignmentsApi.create({ ...form, courseId: selectedCourseId, maxScore: Number(form.maxScore) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assignments', selectedCourseId] }); resetForm() },
  })

  const updateMutation = useMutation({
    mutationFn: () => assignmentsApi.update(editId!, { ...form, courseId: selectedCourseId, maxScore: Number(form.maxScore) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assignments', selectedCourseId] }); resetForm() },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => assignmentsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['assignments', selectedCourseId] }),
  })

  const resetForm = () => { setForm(EMPTY_FORM); setShowForm(false); setEditId(null) }

  const startEdit = (a: Assignment) => {
    setForm({ title: a.title, description: a.description ?? '', dueDate: a.dueDate ? a.dueDate.slice(0, 16) : '', maxScore: a.maxScore })
    setEditId(a.id); setShowForm(true)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">{t('assignments')}</h1>
        {selectedCourseId && (
          <button onClick={() => { resetForm(); setShowForm(true) }} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={15} /> {t('addAssignment')}
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-card-dark rounded-xl p-4 shadow-sm">
        <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('selectGroup')}</label>
        <select className="input-field max-w-xs" value={selectedCourseId}
          onChange={(e) => { setSelectedCourseId(e.target.value); resetForm() }}>
          <option value="">{t('selectGroupPh')}</option>
          {courses?.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-card-dark rounded-xl p-5 shadow-sm">
          <h2 className="text-base font-bold text-primary mb-4">{editId ? t('edit') : t('newAssignment')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('titleLabel')}</label>
              <input className="input-field" placeholder={t('assignmentName')} value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('description')}</label>
              <textarea className="input-field resize-none" rows={3} placeholder={t('assignmentDesc')} value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('deadline')}</label>
              <input type="datetime-local" className="input-field" value={form.dueDate}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('maxScoreLabel')}</label>
              <input type="number" className="input-field" min={1} max={1000} value={form.maxScore}
                onChange={(e) => setForm((f) => ({ ...f, maxScore: Number(e.target.value) }))} />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => editId ? updateMutation.mutate() : createMutation.mutate()}
              disabled={!form.title || createMutation.isPending || updateMutation.isPending}
              className="btn-primary flex items-center gap-2">
              <Check size={15} /> {editId ? t('save') : t('add')}
            </button>
            <button onClick={resetForm} className="btn-secondary flex items-center gap-2">
              <X size={15} /> {t('cancel')}
            </button>
          </div>
        </div>
      )}

      {selectedCourseId && (
        isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !assignments?.length ? (
          <div className="bg-white dark:bg-card-dark rounded-xl p-10 text-center text-gray-400 text-sm shadow-sm">
            {t('noAssignments')}
          </div>
        ) : (
          <div className="space-y-3">
            {assignments.map((a: Assignment) => (
              <div key={a.id} className="bg-white dark:bg-card-dark rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 dark:text-white">{a.title}</p>
                    {a.description && <p className="text-xs text-gray-500 truncate mt-0.5">{a.description}</p>}
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      {a.dueDate && <span>{t('deadline')}: {new Date(a.dueDate).toLocaleString()}</span>}
                      <span>{t('scoreLabel')}: {a.maxScore}</span>
                    </div>
                  </div>
                  <button onClick={() => startEdit(a)} className="text-gray-400 hover:text-primary shrink-0">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => deleteMutation.mutate(a.id)} disabled={deleteMutation.isPending}
                    className="text-red-400 hover:text-red-600 shrink-0">
                    <Trash2 size={15} />
                  </button>
                  <button onClick={() => setExpanded(expanded === a.id ? null : a.id)}
                    className="text-gray-400 hover:text-primary shrink-0 flex items-center gap-1 text-xs">
                    <Users size={14} />
                    {expanded === a.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
                {expanded === a.id && (
                  <div className="border-t border-gray-100 dark:border-gray-700">
                    <SubmissionsPanel assignment={a} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
