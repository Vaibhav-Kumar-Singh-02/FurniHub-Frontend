import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { changePassword } from '../services/authApi'

const hasLowerCase = /[a-z]/
const hasUpperCase = /[A-Z]/
const hasDigit = /\d/
const hasSpecial = /[@$!%*?&]/

function passwordStrength(password) {
  if (!password) return 0
  let score = 0
  if (hasLowerCase.test(password)) score += 1
  if (hasUpperCase.test(password)) score += 1
  if (hasDigit.test(password)) score += 1
  if (hasSpecial.test(password)) score += 1
  if (password.length >= 8) score += 1
  return Math.min(score, 4)
}

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong']

export default function ChangePasswordPage() {
  const { token, logout } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const strength = passwordStrength(form.newPassword)

  const validate = () => {
    const next = {}
    if (!form.currentPassword) next.currentPassword = 'Current password is required'
    if (!form.newPassword) next.newPassword = 'New password is required'
    else if (form.newPassword.length < 8)
      next.newPassword = 'Password must contain at least 8 characters'
    else if (strength < 4)
      next.newPassword = 'Must include uppercase, lowercase, a number and a special character'
    if (!form.confirmPassword) next.confirmPassword = 'Please confirm your new password'
    else if (form.newPassword !== form.confirmPassword) next.confirmPassword = 'Passwords do not match'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
    setFormError('')
    setFormSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setFormError('')
    setFormSuccess('')
    try {
      await changePassword(
        { currentPassword: form.currentPassword, newPassword: form.newPassword },
        token,
      )
      setFormSuccess('Password changed successfully. Please log in again.')
      await logout()
      setTimeout(() => navigate('/login', { replace: true }), 1200)
    } catch (err) {
      if (err.status === 401) setFormError('Current password is incorrect.')
      else if (err.status === 400) {
        const fieldErrors = err.body?.errors || {}
        if (Object.keys(fieldErrors).length) setErrors(fieldErrors)
        else setFormError(err.message)
      } else setFormError('Cannot reach the server. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page container">
      <div className="auth-card">
        <h1 className="auth-card__title">Change password</h1>
        <p className="auth-card__subtitle">Update your password to keep your account secure.</p>

        {formSuccess && <div className="alert alert--success">{formSuccess}</div>}
        {formError && <div className="alert alert--error">{formError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="currentPassword">Current password</label>
            <div className="password-field">
              <input
                id="currentPassword"
                name="currentPassword"
                type={showCurrent ? 'text' : 'password'}
                autoComplete="current-password"
                value={form.currentPassword}
                onChange={handleChange}
                aria-invalid={Boolean(errors.currentPassword)}
              />
              <button
                type="button"
                className="password-field__toggle"
                onClick={() => setShowCurrent((prev) => !prev)}
                aria-label={showCurrent ? 'Hide password' : 'Show password'}
              >
                {showCurrent ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.currentPassword && (
              <span className="form-field__error" role="alert">
                {errors.currentPassword}
              </span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="newPassword">New password</label>
            <div className="password-field">
              <input
                id="newPassword"
                name="newPassword"
                type={showNew ? 'text' : 'password'}
                autoComplete="new-password"
                value={form.newPassword}
                onChange={handleChange}
                aria-invalid={Boolean(errors.newPassword)}
              />
              <button
                type="button"
                className="password-field__toggle"
                onClick={() => setShowNew((prev) => !prev)}
                aria-label={showNew ? 'Hide password' : 'Show password'}
              >
                {showNew ? 'Hide' : 'Show'}
              </button>
            </div>
            {form.newPassword && (
              <div className="strength">
                <div className="strength__bar">
                  <span className={`strength__fill strength__fill--${strength}`} />
                </div>
                <span className="strength__label">
                  {STRENGTH_LABELS[strength] ? `Strength: ${STRENGTH_LABELS[strength]}` : ''}
                </span>
              </div>
            )}
            {errors.newPassword && (
              <span className="form-field__error" role="alert">
                {errors.newPassword}
              </span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="confirmPassword">Confirm new password</label>
            <div className="password-field">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={handleChange}
                aria-invalid={Boolean(errors.confirmPassword)}
              />
              <button
                type="button"
                className="password-field__toggle"
                onClick={() => setShowConfirm((prev) => !prev)}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="form-field__error" role="alert">
                {errors.confirmPassword}
              </span>
            )}
          </div>

          <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
            {loading ? 'Updating…' : 'Change password'}
          </button>
        </form>
      </div>
    </div>
  )
}
