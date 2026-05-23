import { useState, useEffect, useCallback } from 'react'
import { Search, Trash2, UserCog, UserPlus, X, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react'
import { authApi, type RegisterWithRoleDto } from '../api/auth'
import type { User } from '../types'
import { useAuthContext } from '../context/AuthContext'
import { useLang } from '../context/LangContext'

const ROLES = ['user', 'student', 'teacher', 'moderator', 'admin', 'superadmin']

const roleColors: Record<string, string> = {
  superadmin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  admin: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  teacher: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  student: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  moderator: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  user: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
}

export default function Users() {
  const { user: currentUser } = useAuthContext()
  const { t } = useLang()
  const isSuperAdmin = currentUser?.role === 'superadmin'

  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const [form, setForm] = useState<RegisterWithRoleDto>({
    firstName: '', lastName: '', email: '', password: '', role: 'user',
  })
  const [formError, setFormError] = useState('')
  const [formPending, setFormPending] = useState(false)

  const limit = 10
  const totalPages = Math.ceil(total / limit)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await authApi.getAllUsers(page, limit, search || undefined)
      setUsers(res.data)
      setTotal(res.total)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await authApi.updateUserRole(userId, { role })
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)))
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Xatolik yuz berdi')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await authApi.deleteUser(deleteTarget.id)
      setDeleteTarget(null)
      fetchUsers()
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Xatolik yuz berdi')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setFormPending(true)
    try {
      await authApi.registerWithRole(form)
      setShowCreate(false)
      setForm({ firstName: '', lastName: '', email: '', password: '', role: 'user' })
      fetchUsers()
    } catch (err: any) {
      const msg = err?.response?.data?.message
      setFormError(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Xatolik yuz berdi'))
    } finally {
      setFormPending(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 min-w-0">
          <div className="relative flex-1 max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input-field pl-9 py-2 text-sm"
              placeholder={t('searchUsers')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary py-2 px-4 text-sm">{t('search')}</button>
        </form>

        <button
          onClick={() => setShowCreate(true)}
          className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
        >
          <UserPlus size={16} />
          {t('addUser')}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-card-dark rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="px-4 py-3 text-left font-semibold">#</th>
                <th className="px-4 py-3 text-left font-semibold">{t('name')}</th>
                <th className="px-4 py-3 text-left font-semibold">{t('email')}</th>
                <th className="px-4 py-3 text-left font-semibold">{t('role')}</th>
                <th className="px-4 py-3 text-left font-semibold">{t('status')}</th>
                <th className="px-4 py-3 text-left font-semibold">{t('registrationDate')}</th>
                <th className="px-4 py-3 text-right font-semibold">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                    <div className="flex justify-center">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                    {t('notFound')}
                  </td>
                </tr>
              ) : (
                users.map((u, idx) => (
                  <tr key={u.id} className={idx % 2 === 0 ? 'table-row-even' : 'table-row-odd'}>
                    <td className="px-4 py-3 text-gray-500">{(page - 1) * limit + idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
                          {u.avatarUrl
                            ? <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
                            : (u.firstName?.[0]?.toUpperCase() ?? 'U')
                          }
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">
                            {u.firstName} {u.lastName}
                          </p>
                          {u.phone && <p className="text-xs text-gray-400">{u.phone}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{u.email}</td>
                    <td className="px-4 py-3">
                      {u.role === 'superadmin' ? (
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${roleColors['superadmin']}`}>
                          superadmin
                        </span>
                      ) : (
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary"
                          disabled={u.id === currentUser?.id}
                        >
                          {ROLES.filter((r) => r !== 'superadmin').map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${u.isVerify ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300'}`}>
                        {u.isVerify ? t('verified') : t('unverified')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('uz-UZ') : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleRoleChange(u.id, u.role)}
                          className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          title={t('edit')}
                        >
                          <UserCog size={15} />
                        </button>
                        {isSuperAdmin && u.role !== 'superadmin' && u.id !== currentUser?.id && (
                          <button
                            onClick={() => setDeleteTarget({ id: u.id, name: `${u.firstName} ${u.lastName}` })}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title={t('delete')}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-500">{t('totalUsers')}: {total}</p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-card-dark rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle size={24} className="text-red-500" />
              </div>
              <h2 className="text-base font-semibold text-gray-800 dark:text-white">{t('confirm')} {t('delete')}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                <span className="font-medium text-gray-700 dark:text-gray-200">"{deleteTarget.name}"</span>{' '}
                {t('deleteConfirmMsg')}
              </p>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                {deleteLoading
                  ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <><Trash2 size={14} /> {t('delete')}</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create user modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-card-dark rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{t('newUser')}</h2>
              <button onClick={() => { setShowCreate(false); setFormError('') }} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('name')} *</label>
                  <input
                    className="input-field"
                    placeholder="Ism"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('lastName')}</label>
                  <input
                    className="input-field"
                    placeholder="Familiya"
                    value={form.lastName ?? ''}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('email')} *</label>
                <input
                  className="input-field"
                  type="email"
                  placeholder="email@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('password')} *</label>
                <input
                  className="input-field"
                  type="password"
                  placeholder={t('password')}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('role')} *</label>
                <select
                  className="input-field"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  {ROLES.filter((r) => r !== 'superadmin').map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {formError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                  <p className="text-red-600 dark:text-red-400 text-sm">{formError}</p>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => { setShowCreate(false); setFormError('') }}
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={formPending}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  {formPending ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : t('add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
