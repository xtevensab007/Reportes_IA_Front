// =============================================
// pages/SettingsPage.tsx — COMPLETO
// =============================================

import React, { useState } from 'react'
import { Eye, EyeOff, User, Lock, Wifi, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'
import userService from '@/services/userService'
import PageHeader from '@/components/ui/PageHeader'
import Alert from '@/components/ui/Alert'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { usePageTitle } from '@/hooks/useUtils'

const SettingsPage: React.FC = () => {
  usePageTitle('Ajustes')
  const { user, logout } = useAuth()

  // ---- Profile ----
  const [name, setName]               = useState(user?.name ?? '')
  const [savingProfile, setSavingProfile] = useState(false)

  // ---- Password ----
  const [currentPwd, setCurrentPwd]   = useState('')
  const [newPwd, setNewPwd]           = useState('')
  const [confirmPwd, setConfirmPwd]   = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew]         = useState(false)
  const [savingPwd, setSavingPwd]     = useState(false)

  // ---- Delete account ----
  const [deleteOpen, setDeleteOpen]   = useState(false)
  const [deletePwd, setDeletePwd]     = useState('')
  const [deleting, setDeleting]       = useState(false)

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { toast.error('El nombre no puede estar vacío'); return }
    setSavingProfile(true)
    try {
      await userService.updateProfile({ name: name.trim() })
      toast.success('Perfil actualizado correctamente')
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? 'Error al actualizar perfil')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPwd) { toast.error('Ingresa tu contraseña actual'); return }
    if (newPwd.length < 8) { toast.error('La nueva contraseña debe tener mínimo 8 caracteres'); return }
    if (newPwd !== confirmPwd) { toast.error('Las contraseñas no coinciden'); return }
    if (newPwd === currentPwd) { toast.error('La nueva contraseña debe ser diferente'); return }
    setSavingPwd(true)
    try {
      await userService.changePassword({ currentPassword: currentPwd, newPassword: newPwd })
      toast.success('Contraseña actualizada correctamente')
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('')
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? 'Contraseña actual incorrecta')
    } finally {
      setSavingPwd(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      await userService.deleteAccount(deletePwd)
      toast.success('Cuenta eliminada')
      await logout()
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? 'Error al eliminar cuenta')
      setDeleting(false)
    }
  }

  const pwdStrength = (pwd: string) => {
    if (!pwd) return { label: '', color: 'transparent', width: '0%' }
    let score = 0
    if (pwd.length >= 8)          score++
    if (pwd.length >= 12)         score++
    if (/[A-Z]/.test(pwd))        score++
    if (/[0-9]/.test(pwd))        score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++
    if (score <= 1) return { label: 'Débil',   color: 'var(--color-red)',   width: '25%' }
    if (score <= 2) return { label: 'Regular', color: 'var(--color-amber)', width: '50%' }
    if (score <= 3) return { label: 'Buena',   color: 'var(--color-blue)',  width: '75%' }
    return               { label: 'Fuerte',  color: 'var(--color-green)', width: '100%' }
  }
  const strength = pwdStrength(newPwd)

  const SectionIcon = ({ bg, children }: { bg: string; children: React.ReactNode }) => (
    <div style={{ width: 32, height: 32, background: bg, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {children}
    </div>
  )

  return (
    <div className="page-container fade-in" style={{ maxWidth: 680 }}>
      <PageHeader title="Ajustes" subtitle="Gestiona tu cuenta y preferencias." />

      {/* ── Profile ── */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '0.5px solid var(--color-border)' }}>
          <SectionIcon bg="var(--color-blue-light)"><User size={16} color="var(--color-blue)" /></SectionIcon>
          <div>
            <h3 style={{ marginBottom: 0 }}>Perfil</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-2)', marginTop: 1 }}>Información básica de tu cuenta</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: '1.25rem' }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 600, color: '#0F6E56', flexShrink: 0 }}>
            {user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p style={{ fontWeight: 600, marginBottom: 2 }}>{user?.name}</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-2)' }}>{user?.email}</p>
            <span style={{ display: 'inline-block', marginTop: 4, background: user?.role === 'admin' ? 'var(--color-blue-light)' : 'var(--color-surface-2)', color: user?.role === 'admin' ? 'var(--color-blue-dark)' : 'var(--color-text-2)', fontSize: '0.75rem', fontWeight: 500, padding: '2px 8px', borderRadius: 20 }}>
              {user?.role === 'admin' ? 'Administrador' : 'Usuario'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Nombre completo</label>
            <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" />
          </div>
          <div className="form-group">
            <label className="form-label">Correo electrónico</label>
            <input className="form-input" value={user?.email ?? ''} disabled style={{ opacity: 0.55, cursor: 'not-allowed' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-3)' }}>El email no puede cambiarse desde aquí.</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={savingProfile}>
              {savingProfile ? <><div className="spinner" style={{ borderTopColor: '#fff', width: 14, height: 14 }} /> Guardando…</> : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>

      {/* ── Password ── */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '0.5px solid var(--color-border)' }}>
          <SectionIcon bg="var(--color-green-light)"><Lock size={16} color="var(--color-green)" /></SectionIcon>
          <div>
            <h3 style={{ marginBottom: 0 }}>Cambiar contraseña</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-2)', marginTop: 1 }}>Solo aplica si ingresaste con email y contraseña</p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Contraseña actual</label>
            <div style={{ position: 'relative' }}>
              <input type={showCurrent ? 'text' : 'password'} className="form-input" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} placeholder="••••••••" style={{ paddingRight: 40 }} autoComplete="current-password" />
              <button type="button" className="btn btn-ghost btn-icon" onClick={() => setShowCurrent((v) => !v)} style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-3)' }}>
                {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Nueva contraseña</label>
            <div style={{ position: 'relative' }}>
              <input type={showNew ? 'text' : 'password'} className="form-input" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} placeholder="Mínimo 8 caracteres" style={{ paddingRight: 40 }} autoComplete="new-password" />
              <button type="button" className="btn btn-ghost btn-icon" onClick={() => setShowNew((v) => !v)} style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-3)' }}>
                {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {newPwd && (
              <div style={{ marginTop: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-3)' }}>Fortaleza</span>
                  <span style={{ fontSize: '0.75rem', color: strength.color, fontWeight: 500 }}>{strength.label}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: strength.width, background: strength.color, transition: 'width 300ms, background 300ms' }} />
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Confirmar nueva contraseña</label>
            <input type="password" className="form-input" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} placeholder="Repite la nueva contraseña" autoComplete="new-password" style={{ borderColor: confirmPwd && confirmPwd !== newPwd ? 'var(--color-red)' : undefined }} />
            {confirmPwd && confirmPwd !== newPwd && (
              <span style={{ fontSize: '0.75rem', color: 'var(--color-red)' }}>Las contraseñas no coinciden</span>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={savingPwd || !currentPwd || !newPwd || newPwd !== confirmPwd}>
              {savingPwd ? <><div className="spinner" style={{ borderTopColor: '#fff', width: 14, height: 14 }} /> Actualizando…</> : 'Actualizar contraseña'}
            </button>
          </div>
        </form>
      </div>

      {/* ── Backend connection ── */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '0.5px solid var(--color-border)' }}>
          <SectionIcon bg="var(--color-amber-light)"><Wifi size={16} color="var(--color-amber)" /></SectionIcon>
          <div>
            <h3 style={{ marginBottom: 0 }}>Conexión con el backend</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-2)', marginTop: 1 }}>
              Configurado en <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', background: 'var(--color-surface-2)', padding: '1px 5px', borderRadius: 3 }}>.env.local</code>
            </p>
          </div>
        </div>
        <div style={{ background: 'var(--color-surface-2)', border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--color-text-2)', marginBottom: 8 }}>
          <div style={{ marginBottom: 4 }}>
            <span style={{ color: 'var(--color-text-3)' }}>VITE_API_URL</span>{' = '}
            <span style={{ color: 'var(--color-blue)' }}>{import.meta.env.VITE_API_URL ?? 'http://localhost:8000'}</span>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-3)' }}>VITE_ENV</span>{' = '}
            <span style={{ color: 'var(--color-green)' }}>{import.meta.env.VITE_ENV ?? 'development'}</span>
          </div>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-3)' }}>
          Edita <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>.env.local</code> y reinicia el servidor de desarrollo para aplicar cambios.
        </p>
      </div>

      {/* ── Danger zone ── */}
      <div className="card" style={{ borderColor: 'var(--color-red)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '0.5px solid var(--color-red-light)' }}>
          <SectionIcon bg="var(--color-red-light)"><AlertTriangle size={16} color="var(--color-red)" /></SectionIcon>
          <div>
            <h3 style={{ marginBottom: 0, color: 'var(--color-red)' }}>Zona de peligro</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-2)', marginTop: 1 }}>Acciones irreversibles sobre tu cuenta</p>
          </div>
        </div>
        <Alert variant="warning" style={{ marginBottom: '1rem' }}>
          Eliminar tu cuenta borrará permanentemente todos tus reportes, configuradores y datos asociados.
        </Alert>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-danger" onClick={() => setDeleteOpen(true)}>
            Eliminar mi cuenta
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => { setDeleteOpen(false); setDeletePwd('') }}
        onConfirm={handleDeleteAccount}
        title="Eliminar cuenta"
        message="Esta acción es irreversible. Todos tus reportes y configuradores serán eliminados permanentemente."
        confirmLabel="Sí, eliminar mi cuenta"
        loading={deleting}
        variant="danger"
      />
    </div>
  )
}

export default SettingsPage
