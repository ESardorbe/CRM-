import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Video, MapPin, ExternalLink } from 'lucide-react'
import { studentsApi } from '../../api/students'
import { lessonsApi, type Lesson, getDayLabels, DAY_ORDER } from '../../api/lessons'
import { useAuthContext } from '../../context/AuthContext'
import { useLang } from '../../context/LangContext'

export default function StudentSchedule() {
  const { user } = useAuthContext()
  const { t, lang } = useLang()
  const DAY_LABELS = getDayLabels(lang)
  const [selectedCourseId, setSelectedCourseId] = useState('')

  const { data: studentRecord } = useQuery({
    queryKey: ['my-student', user?.id],
    queryFn: () => studentsApi.getByUserId(user!.id),
    enabled: !!user?.id,
  })

  const courses = studentRecord?.courses ?? []

  const { data: lessons, isLoading } = useQuery({
    queryKey: ['lessons', selectedCourseId],
    queryFn: () => lessonsApi.getByCourse(selectedCourseId),
    enabled: !!selectedCourseId,
  })

  const grouped = DAY_ORDER.reduce<Record<string, Lesson[]>>((acc, day) => {
    const dayLessons = (lessons ?? []).filter((l) => l.dayOfWeek === day)
    if (dayLessons.length) acc[day] = dayLessons
    return acc
  }, {})

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-800 dark:text-white">{t('lessonSchedule')}</h1>

      <div className="bg-white dark:bg-card-dark rounded-xl p-4 shadow-sm">
        <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('selectGroup')}</label>
        <select
          className="input-field max-w-xs"
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
        >
          <option value="">{t('selectGroupPh')}</option>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </div>

      {selectedCourseId && (
        isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="bg-white dark:bg-card-dark rounded-xl p-10 text-center text-gray-400 text-sm shadow-sm">
            {t('noSchedule')}
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
                    <li key={lesson.id} className="flex items-center gap-3 px-5 py-3">
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
                        <a
                          href={lesson.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg text-xs font-medium hover:bg-purple-100 transition-colors shrink-0"
                        >
                          <ExternalLink size={12} /> {t('enterLink')}
                        </a>
                      )}
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
