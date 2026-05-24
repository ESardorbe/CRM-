import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, Pencil, X, Check, Video, MapPin } from 'lucide-react'
import { teachersApi } from '../../api/teachers'
import { coursesApi } from '../../api/courses'
import { lessonsApi, type Lesson, getDayLabels, DAY_ORDER } from '../../api/lessons'
import { useAuthContext } from '../../context/AuthContext'
import { useLang } from '../../context/LangContext'

const EMPTY_FORM = {
  title: '',
  dayOfWeek: 'monday',
  startTime: '09:00',
  endTime: '10:30',
  isOnline: false,
  meetingLink: '',
  room: '',
  description: '',
}

export default function TeacherSchedule() {
  const qc = useQueryClient()
  const { user } = useAuthContext()
  const { t, lang } = useLang()
  const DAY_LABELS = getDayLabels(lang)
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)

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

  const { data: lessons, isLoading } = useQuery({
    queryKey: ['lessons', selectedCourseId],
    queryFn: () => lessonsApi.getByCourse(selectedCourseId),
    enabled: !!selectedCourseId,
  })

  const createMutation = useMutation({
    mutationFn: () => lessonsApi.create({ ...form, courseId: selectedCourseId }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lessons', selectedCourseId] }); resetForm() },
  })

  const updateMutation = useMutation({
    mutationFn: () => lessonsApi.update(editId!, { ...form, courseId: selectedCourseId }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lessons', selectedCourseId] }); resetForm() },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => lessonsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lessons', selectedCourseId] }),
  })

  const resetForm = () => { setForm(EMPTY_FORM); setShowForm(false); setEditId(null) }

  const startEdit = (lesson: Lesson) => {
    setForm({
      title: lesson.title,
      dayOfWeek: lesson.dayOfWeek,
      startTime: lesson.startTime,
      endTime: lesson.endTime,
      isOnline: lesson.isOnline,
      meetingLink: lesson.meetingLink ?? '',
      room: lesson.room ?? '',
      description: lesson.description ?? '',
    })
    setEditId(lesson.id)
    setShowForm(true)
  }

  const grouped = DAY_ORDER.reduce<Record<string, Lesson[]>>((acc, day) => {
    const dayLessons = (lessons ?? []).filter((l) => l.dayOfWeek === day)
    if (dayLessons.length) acc[day] = dayLessons
    return acc
  }, {})

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">{t('lessonSchedule')}</h1>
        {selectedCourseId && (
          <button
            onClick={() => { resetForm(); setShowForm(true) }}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus size={15} /> {t('addLesson')}
          </button>
        )}
      </div>

      {/* Course selector */}
      <div className="bg-white dark:bg-card-dark rounded-xl p-4 shadow-sm">
        <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('selectGroup')}</label>
        <select
          className="input-field max-w-xs"
          value={selectedCourseId}
          onChange={(e) => { setSelectedCourseId(e.target.value); resetForm() }}
        >
          <option value="">{t('selectGroupPh')}</option>
          {courses?.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div className="bg-white dark:bg-card-dark rounded-xl p-5 shadow-sm">
          <h2 className="text-base font-bold text-primary mb-4">
            {editId ? t('editLesson') : t('newLesson')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('titleLabel')}</label>
              <input className="input-field" placeholder={t('titleLabel')} value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('dayLabel')}</label>
              <select className="input-field" value={form.dayOfWeek}
                onChange={(e) => setForm((f) => ({ ...f, dayOfWeek: e.target.value }))}>
                {DAY_ORDER.map((d) => <option key={d} value={d}>{DAY_LABELS[d]}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('startTime')}</label>
              <input type="time" className="input-field" value={form.startTime}
                onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('endTime')}</label>
              <input type="time" className="input-field" value={form.endTime}
                onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))} />
            </div>
            <div className="flex items-center gap-3 pt-5">
              <input type="checkbox" id="isOnline" checked={form.isOnline}
                onChange={(e) => setForm((f) => ({ ...f, isOnline: e.target.checked }))}
                className="w-4 h-4 accent-primary" />
              <label htmlFor="isOnline" className="text-sm text-gray-700 dark:text-gray-300">{t('onlineLesson')}</label>
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
                {form.isOnline ? t('meetingLink') : t('room')}
              </label>
              {form.isOnline ? (
                <input className="input-field" placeholder="https://meet.google.com/..." value={form.meetingLink}
                  onChange={(e) => setForm((f) => ({ ...f, meetingLink: e.target.value }))} />
              ) : (
                <input className="input-field" placeholder={t('room')} value={form.room}
                  onChange={(e) => setForm((f) => ({ ...f, room: e.target.value }))} />
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('descriptionOpt')}</label>
              <input className="input-field" placeholder={t('additionalNote')} value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => editId ? updateMutation.mutate() : createMutation.mutate()}
              disabled={!form.title || !form.dayOfWeek || createMutation.isPending || updateMutation.isPending}
              className="btn-primary flex items-center gap-2"
            >
              <Check size={15} /> {editId ? t('save') : t('add')}
            </button>
            <button onClick={resetForm} className="btn-secondary flex items-center gap-2">
              <X size={15} /> {t('cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Schedule grid */}
      {selectedCourseId && (
        isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="bg-white dark:bg-card-dark rounded-xl p-10 text-center text-gray-400 text-sm shadow-sm">
            {t('noLessonsYet')}
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(grouped).map(([day, dayLessons]) => (
              <div key={day} className="bg-white dark:bg-card-dark rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-3 bg-primary/5 dark:bg-primary/10 border-b border-gray-100 dark:border-gray-700">
                  <h3 className="font-semibold text-primary text-sm">{DAY_LABELS[day]}</h3>
                </div>
                <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                  {dayLessons.map((lesson) => (
                    <li key={lesson.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/40">
                      <div className="text-xs font-mono text-gray-500 w-24 shrink-0">
                        {lesson.startTime.slice(0, 5)} – {lesson.endTime.slice(0, 5)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-800 dark:text-white">{lesson.title}</p>
                        {lesson.description && (
                          <p className="text-xs text-gray-500 truncate">{lesson.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-0.5">
                          {lesson.isOnline ? (
                            <span className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
                              <Video size={11} /> Online
                            </span>
                          ) : lesson.room ? (
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                              <MapPin size={11} /> {lesson.room}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      {lesson.isOnline && lesson.meetingLink && (
                        <a href={lesson.meetingLink} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline shrink-0">
                          {t('enterLink')}
                        </a>
                      )}
                      <button onClick={() => startEdit(lesson)}
                        className="text-gray-400 hover:text-primary transition-colors shrink-0">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => deleteMutation.mutate(lesson.id)}
                        disabled={deleteMutation.isPending}
                        className="text-red-400 hover:text-red-600 transition-colors shrink-0">
                        <Trash2 size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
