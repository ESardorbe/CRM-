import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, BarChart2 } from 'lucide-react'
import { teachersApi } from '../../api/teachers'
import { coursesApi } from '../../api/courses'
import { gradesApi, type Grade, type GradeSummary, getGradeTypes } from '../../api/grades'
import { useAuthContext } from '../../context/AuthContext'
import { useLang } from '../../context/LangContext'

const EMPTY_FORM = { studentId: '', score: '', maxScore: '100', gradeType: 'midterm', comment: '' }

type Tab = 'grades' | 'summary'

export default function TeacherGrades() {
  const qc = useQueryClient()
  const { user } = useAuthContext()
  const { t, lang } = useLang()
  const gradeTypes = getGradeTypes(lang)
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [tab, setTab] = useState<Tab>('grades')
  const [form, setForm] = useState(EMPTY_FORM)
  const [showForm, setShowForm] = useState(false)

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

  const { data: courseDetail } = useQuery({
    queryKey: ['course', selectedCourseId],
    queryFn: () => coursesApi.getOne(selectedCourseId),
    enabled: !!selectedCourseId,
  })

  const { data: grades, isLoading: gradesLoading } = useQuery({
    queryKey: ['grades-course', selectedCourseId],
    queryFn: () => gradesApi.getByCourse(selectedCourseId),
    enabled: !!selectedCourseId && tab === 'grades',
  })

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['grades-summary', selectedCourseId],
    queryFn: () => gradesApi.getCourseSummary(selectedCourseId),
    enabled: !!selectedCourseId && tab === 'summary',
  })

  const createMutation = useMutation({
    mutationFn: () => gradesApi.create({
      studentId: form.studentId,
      courseId: selectedCourseId,
      score: Number(form.score),
      maxScore: Number(form.maxScore),
      gradeType: form.gradeType,
      comment: form.comment || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['grades-course', selectedCourseId] })
      qc.invalidateQueries({ queryKey: ['grades-summary', selectedCourseId] })
      setForm(EMPTY_FORM)
      setShowForm(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => gradesApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['grades-course', selectedCourseId] })
      qc.invalidateQueries({ queryKey: ['grades-summary', selectedCourseId] })
    },
  })

  const students = courseDetail?.students ?? []

  const getPercent = (score: number, max: number) => Math.round((score / max) * 100)
  const getColor = (pct: number) =>
    pct >= 85 ? 'text-green-600' : pct >= 60 ? 'text-amber-600' : 'text-red-500'

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-800 dark:text-white">{t('grades')}</h1>

      <div className="bg-white dark:bg-card-dark rounded-xl p-4 shadow-sm">
        <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('selectGroup')}</label>
        <select className="input-field max-w-xs" value={selectedCourseId}
          onChange={(e) => { setSelectedCourseId(e.target.value); setShowForm(false) }}>
          <option value="">{t('selectGroupPh')}</option>
          {courses?.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </div>

      {selectedCourseId && (
        <>
          {/* Tabs */}
          <div className="flex gap-2">
            {(['grades', 'summary'] as Tab[]).map((tabKey) => (
              <button key={tabKey} onClick={() => setTab(tabKey)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tab === tabKey ? 'bg-primary text-white' : 'bg-white dark:bg-card-dark text-gray-600 dark:text-gray-400 hover:bg-gray-50'
                }`}>
                {tabKey === 'grades' ? t('allGrades') : <span className="flex items-center gap-1"><BarChart2 size={13} /> {t('gradeSummary')}</span>}
              </button>
            ))}
            {tab === 'grades' && (
              <button onClick={() => setShowForm((s) => !s)}
                className="ml-auto btn-primary flex items-center gap-2 text-sm">
                <Plus size={15} /> {t('addGrade')}
              </button>
            )}
          </div>

          {/* Add form */}
          {showForm && tab === 'grades' && (
            <div className="bg-white dark:bg-card-dark rounded-xl p-5 shadow-sm">
              <h2 className="text-base font-bold text-primary mb-4">{t('newGrade')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('studentLabel')}</label>
                  <select className="input-field" value={form.studentId}
                    onChange={(e) => setForm((f) => ({ ...f, studentId: e.target.value }))}>
                    <option value="">— {t('studentLabel')} —</option>
                    {students.map((s: any) => (
                      <option key={s.id} value={s.id}>
                        {s.user?.firstName ?? s.firstName} {s.user?.lastName ?? s.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('gradeTypeLabel')}</label>
                  <select className="input-field" value={form.gradeType}
                    onChange={(e) => setForm((f) => ({ ...f, gradeType: e.target.value }))}>
                    {Object.entries(gradeTypes).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('scoreLabel')}</label>
                  <input type="number" className="input-field" min={0} max={Number(form.maxScore)}
                    value={form.score} onChange={(e) => setForm((f) => ({ ...f, score: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('maxScoreShort')}</label>
                  <input type="number" className="input-field" min={1}
                    value={form.maxScore} onChange={(e) => setForm((f) => ({ ...f, maxScore: e.target.value }))} />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('commentOpt')}</label>
                  <input className="input-field" value={form.comment}
                    onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => createMutation.mutate()}
                  disabled={!form.studentId || !form.score || createMutation.isPending}
                  className="btn-primary">{t('save')}</button>
                <button onClick={() => setShowForm(false)} className="btn-secondary">{t('cancel')}</button>
              </div>
            </div>
          )}

          {/* Grades list */}
          {tab === 'grades' && (
            gradesLoading ? (
              <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
            ) : !grades?.length ? (
              <div className="bg-white dark:bg-card-dark rounded-xl p-10 text-center text-gray-400 text-sm shadow-sm">{t('noGrades')}</div>
            ) : (
              <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm overflow-hidden">
                <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                  {grades.map((g: Grade) => {
                    const pct = getPercent(Number(g.score), Number(g.maxScore))
                    return (
                      <li key={g.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/40">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 dark:text-white">
                            {(g.student as any)?.user?.firstName} {(g.student as any)?.user?.lastName}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                            <span>{gradeTypes[g.gradeType] ?? g.gradeType}</span>
                            {g.comment && <span>· {g.comment}</span>}
                            <span>· {new Date(g.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <span className={`font-bold text-sm ${getColor(pct)}`}>
                          {g.score}/{g.maxScore} <span className="text-xs font-normal">({pct}%)</span>
                        </span>
                        <button onClick={() => deleteMutation.mutate(g.id)}
                          className="text-red-400 hover:text-red-600 shrink-0"><Trash2 size={14} /></button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          )}

          {/* Summary */}
          {tab === 'summary' && (
            summaryLoading ? (
              <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
            ) : !summary?.length ? (
              <div className="bg-white dark:bg-card-dark rounded-xl p-10 text-center text-gray-400 text-sm shadow-sm">{t('noData')}</div>
            ) : (
              <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm overflow-hidden">
                <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                  {summary.sort((a, b) => b.average - a.average).map((s: GradeSummary, i) => {
                    const pct = getPercent(s.average, 100)
                    return (
                      <li key={s.studentId} className="flex items-center gap-3 px-5 py-3">
                        <span className="text-xs text-gray-400 w-5">{i + 1}.</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800 dark:text-white">{s.name}</p>
                          <p className="text-xs text-gray-400">{s.count} {t('gradeCount')}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${pct >= 85 ? 'bg-green-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                              style={{ width: `${Math.min(pct, 100)}%` }} />
                          </div>
                          <span className={`font-bold text-sm ${getColor(pct)}`}>{s.average}</span>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          )}
        </>
      )}
    </div>
  )
}
