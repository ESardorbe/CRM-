import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FileText, Film, Image, File, Download } from 'lucide-react'
import { useAuthContext } from '../../context/AuthContext'
import { useLang } from '../../context/LangContext'
import { studentsApi } from '../../api/students'
import { materialsApi, type Material } from '../../api/materials'

const FILE_ICONS: Record<string, React.ReactNode> = {
  pdf: <FileText size={18} className="text-red-500" />,
  video: <Film size={18} className="text-purple-500" />,
  image: <Image size={18} className="text-blue-500" />,
  document: <FileText size={18} className="text-blue-700" />,
  other: <File size={18} className="text-gray-400" />,
}

const FILE_TYPE_LABELS: Record<string, string> = {
  pdf: 'PDF',
  video: 'Video',
  image: 'Rasm',
  document: 'Hujjat',
  other: 'Fayl',
}

export default function StudentMaterials() {
  const { user } = useAuthContext()
  const { t } = useLang()
  const [selectedCourseId, setSelectedCourseId] = useState('')

  const { data: studentRecord } = useQuery({
    queryKey: ['my-student', user?.id],
    queryFn: () => studentsApi.getByUserId(user!.id),
    enabled: !!user?.id,
  })

  const courses = studentRecord?.courses ?? []

  const { data: materials, isLoading } = useQuery({
    queryKey: ['materials', selectedCourseId],
    queryFn: () => materialsApi.getByCourse(selectedCourseId),
    enabled: !!selectedCourseId,
  })

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-800 dark:text-white">{t('lessonMaterials')}</h1>

      {/* Course selector */}
      <div className="bg-white dark:bg-card-dark rounded-xl p-4 shadow-sm">
        <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('selectGroup')}</label>
        <select
          className="input-field max-w-xs"
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
        >
          <option value="">{t('selectGroupPh')}</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </div>

      {/* Materials list */}
      {selectedCourseId && (
        <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-base font-bold text-primary">{t('materials')}</h2>
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
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-500">
                        {FILE_TYPE_LABELS[m.fileType] ?? 'Fayl'}
                      </span>
                      <span className="text-xs text-gray-400">{new Date(m.createdAt).toLocaleDateString()}</span>
                      {m.uploadedBy && (
                        <span className="text-xs text-gray-400">
                          {m.uploadedBy.firstName} {m.uploadedBy.lastName}
                        </span>
                      )}
                    </div>
                  </div>
                  <a
                    href={`http://localhost:4001${m.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-medium hover:bg-primary/20 transition-colors shrink-0"
                  >
                    <Download size={13} />
                    {t('download')}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
