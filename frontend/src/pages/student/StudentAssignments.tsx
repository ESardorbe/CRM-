import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Send, Clock, FileUp } from 'lucide-react'
import { studentsApi } from '../../api/students'
import { assignmentsApi, type Assignment } from '../../api/assignments'
import { useAuthContext } from '../../context/AuthContext'
import { useLang } from '../../context/LangContext'

export default function StudentAssignments() {
  const qc = useQueryClient()
  const { user } = useAuthContext()
  const { t } = useLang()
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [comments, setComments] = useState<Record<string, string>>({})
  const [files, setFiles] = useState<Record<string, File | null>>({})
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const { data: studentRecord } = useQuery({
    queryKey: ['my-student', user?.id],
    queryFn: () => studentsApi.getByUserId(user!.id),
    enabled: !!user?.id,
  })

  const courses = studentRecord?.courses ?? []

  const { data: assignments, isLoading } = useQuery({
    queryKey: ['assignments', selectedCourseId],
    queryFn: () => assignmentsApi.getByCourse(selectedCourseId),
    enabled: !!selectedCourseId,
  })

  const submitMutation = useMutation({
    mutationFn: ({ assignmentId }: { assignmentId: string }) => {
      const fd = new FormData()
      fd.append('assignmentId', assignmentId)
      if (comments[assignmentId]) fd.append('comment', comments[assignmentId])
      const file = files[assignmentId]
      if (file) fd.append('file', file)
      return assignmentsApi.submit(assignmentId, fd)
    },
    onSuccess: (_, { assignmentId }) => {
      qc.invalidateQueries({ queryKey: ['assignments', selectedCourseId] })
      setComments((c) => ({ ...c, [assignmentId]: '' }))
      setFiles((f) => ({ ...f, [assignmentId]: null }))
      const ref = fileRefs.current[assignmentId]
      if (ref) ref.value = ''
    },
  })

  const isOverdue = (dueDate: string | null) => dueDate && new Date(dueDate) < new Date()

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-800 dark:text-white">{t('assignments')}</h1>

      <div className="bg-white dark:bg-card-dark rounded-xl p-4 shadow-sm">
        <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('selectGroup')}</label>
        <select className="input-field max-w-xs" value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}>
          <option value="">{t('selectGroupPh')}</option>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </div>

      {selectedCourseId && (
        isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !assignments?.length ? (
          <div className="bg-white dark:bg-card-dark rounded-xl p-10 text-center text-gray-400 text-sm shadow-sm">
            {t('noAssignmentsStudent')}
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map((a: Assignment) => {
              const overdue = isOverdue(a.dueDate)
              return (
                <div key={a.id} className="bg-white dark:bg-card-dark rounded-xl shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-white">{a.title}</h3>
                        {a.description && <p className="text-sm text-gray-500 mt-1">{a.description}</p>}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full shrink-0 flex items-center gap-1 ${
                        overdue
                          ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                      }`}>
                        <Clock size={11} />
                        {a.dueDate ? new Date(a.dueDate).toLocaleString() : t('noDeadline')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{t('maxScoreLabel')}: {a.maxScore}</p>
                  </div>

                  <div className="px-5 py-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <FileUp size={14} /> {t('submitAnswer')}
                    </div>
                    <textarea
                      className="input-field resize-none text-sm"
                      rows={2}
                      placeholder={t('writeComment')}
                      value={comments[a.id] ?? ''}
                      onChange={(e) => setComments((c) => ({ ...c, [a.id]: e.target.value }))}
                    />
                    <input
                      type="file"
                      ref={(el) => { fileRefs.current[a.id] = el }}
                      className="block w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                      onChange={(e) => setFiles((f) => ({ ...f, [a.id]: e.target.files?.[0] ?? null }))}
                    />
                    <button
                      onClick={() => submitMutation.mutate({ assignmentId: a.id })}
                      disabled={submitMutation.isPending}
                      className="btn-primary flex items-center gap-2 text-sm"
                    >
                      {submitMutation.isPending
                        ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        : <><Send size={13} /> {t('send')}</>}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )
      )}
    </div>
  )
}
