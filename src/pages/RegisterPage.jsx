import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

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

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const strength = passwordStrength(form.password)

  const validate = () => {
    const next = {}
    if (!form.fullName.trim()) next.fullName = 'Full name is required'
    if (!form.email.trim()) next.email = 'Email is required'
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = 'Enter a valid email'
    if (!form.mobile.trim()) next.mobile = 'Mobile is required'
    else if (!/^\d{10}$/.test(form.mobile.trim())) next.mobile = 'Mobile must contain exactly 10 digits'
    if (!form.password) next.password = 'Password is required'
    else if (form.password.length < 8) next.password = 'Password must contain at least 8 characters'
    else if (strength < 4)
      next.password = 'Must include uppercase, lowercase, a number and a special character'
    if (!form.confirmPassword) next.confirmPassword = 'Please confirm your password'
    else if (form.password !== form.confirmPassword) next.confirmPassword = 'Passwords do not match'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
    setFormError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setFormError('')
    try {
      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        mobile: form.mobile.trim(),
        password: form.password,
      }
      await register(payload)
      navigate('/login', { state: { registered: true } })
    } catch (err) {
      if (err.status === 409) {
        const message = err.body?.message || 'Account already exists.'
        setFormError(message)
      } else if (err.status === 400) {
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
        <h1 className="auth-card__title">Create your account</h1>
        <p className="auth-card__subtitle">Join FurniHub and start furnishing your space.</p>

        {formError && <div className="alert alert--error">{formError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="fullName">Full name</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              value={form.fullName}
              onChange={handleChange}
              aria-invalid={Boolean(errors.fullName)}
            />
            {errors.fullName && (
              <span className="form-field__error" role="alert">
                {errors.fullName}
              </span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email && (
              <span className="form-field__error" role="alert">
                {errors.email}
              </span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="mobile">Mobile number</label>
            <input
              id="mobile"
              name="mobile"
              type="tel"
              autoComplete="tel"
              inputMode="numeric"
              maxLength={10}
              value={form.mobile}
              onChange={handleChange}
              aria-invalid={Boolean(errors.mobile)}
            />
            {errors.mobile && (
              <span className="form-field__error" role="alert">
                {errors.mobile}
              </span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <div className="password-field">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                aria-invalid={Boolean(errors.password)}
              />
              <button
                type="button"
                className="password-field__toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {form.password && (
              <div className="strength">
                <div className="strength__bar">
                  <span className={`strength__fill strength__fill--${strength}`} />
                </div>
                <span className="strength__label">
                  {STRENGTH_LABELS[strength] ? `Strength: ${STRENGTH_LABELS[strength]}` : ''}
                </span>
              </div>
            )}
            {errors.password && (
              <span className="form-field__error" role="alert">
                {errors.password}
              </span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="confirmPassword">Confirm password</label>
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
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="auth-card__switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  )
}
