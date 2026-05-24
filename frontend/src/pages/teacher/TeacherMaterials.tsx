import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2, Upload, FileText, Film, Image, File, Download } from 'lucide-react'
import { teachersApi } from '../../api/teachers'
import { coursesApi } from '../../api/courses'
import { materialsApi, type Material } from '../../api/materials'
import { useAuthContext } from '../../context/AuthContext'
import { useLang } from '../../context/LangContext'

const FILE_ICONS: Record<string, React.ReactNode> = {
  pdf: <FileText size={18} className="text-red-500" />,
  video: <Film size={18} className="text-purple-500" />,
  image: <Image size={18} className="text-blue-500" />,
  document: <FileText size={18} className="text-blue-700" />,
  other: <File size={18} className="text-gray-400" />,
}

export default function TeacherMaterials() {
  const qc = useQueryClient()
  const { user } = useAuthContext()
  const { t } = useLang()
  const fileRef = useRef<HTMLInputElement>(null)

  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)

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

  const { data: materials, isLoading } = useQuery({
    queryKey: ['materials', selectedCourseId],
    queryFn: () => materialsApi.getByCourse(selectedCourseId),
    enabled: !!selectedCourseId,
  })

  const uploadMutation = useMutation({
    mutationFn: () => {
      if (!file || !title || !selectedCourseId) throw new Error('To\'ldiring')
      const fd = new FormData()
      fd.append('file', file)
      fd.append('title', title)
      fd.append('courseId', selectedCourseId)
      if (description) fd.append('description', description)
      return materialsApi.upload(fd)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['materials', selectedCourseId] })
      setTitle('')
      setDescription('')
      setFile(null)
      if (fileRef.current) fileRef.current.value = ''
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => materialsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['materials', selectedCourseId] }),
  })

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-800 dark:text-white">{t('lessonMaterials')}</h1>

      {/* Upload form */}
      <div className="bg-white dark:bg-card-dark rounded-xl p-5 shadow-sm">
        <h2 className="text-base font-bold text-primary mb-4">{t('uploadMaterial')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('group')}</label>
            <select
              className="input-field"
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
            >
              <option value="">{t('selectGroupPh')}</option>
              {courses?.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('titleLabel')}</label>
            <input
              className="input-field"
              placeholder={t('materialName')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('descriptionOpt')}</label>
            <input
              className="input-field"
              placeholder={t('additionalNote')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('fileUpload')}</label>
            <input
              ref={fileRef}
              type="file"
              className="block w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => uploadMutation.mutate()}
              disabled={uploadMutation.isPending || !file || !title || !selectedCourseId}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {uploadMutation.isPending
                ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <><Upload size={15} /> {t('upload')}</>
              }
            </button>
          </div>
        </div>
        {uploadMutation.isError && (
          <p className="text-red-500 text-sm mt-2">{t('uploadError')}</p>
        )}
      </div>

      {/* Materials list */}
      {selectedCourseId && (
        <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-base font-bold text-primary">{t('materialsList')}</h2>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !materials || materials.length === 0 ? (
            <p className="text-center text-gray-400 py-10 text-sm">{t('noMaterials')}</p>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {materials.map((m: Material) => (
                <li key={m.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                  <div className="shrink-0">{FILE_ICONS[m.fileType] ?? FILE_ICONS.other}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-800 dark:text-white truncate">{m.title}</p>
                    {m.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{m.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">{m.fileName} · {new Date(m.createdAt).toLocaleDateString()}</p>
                  </div>
                  <a
                    href={`http://localhost:4001${m.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/70 transition-colors shrink-0"
                    title="Yuklab olish"
                  >
                    <Download size={16} />
                  </a>
                  <button
                    onClick={() => deleteMutation.mutate(m.id)}
                    disabled={deleteMutation.isPending}
                    className="text-red-400 hover:text-red-600 transition-colors shrink-0"
                    title="O'chirish"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
