import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'

  const [form, setForm] = useState({ emailOrMobile: '', password: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)

  const validate = () => {
    const next = {}
    if (!form.emailOrMobile.trim()) next.emailOrMobile = 'Email or mobile is required'
    if (!form.password) next.password = 'Password is required'
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
      await login({ emailOrMobile: form.emailOrMobile.trim(), password: form.password }, remember)
      navigate(from, { replace: true })
    } catch (err) {
      if (err.status === 401) setFormError('Invalid email/mobile or password.')
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
        <h1 className="auth-card__title">Welcome back</h1>
        <p className="auth-card__subtitle">Log in to your FurniHub account.</p>

        {formError && <div className="alert alert--error">{formError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="emailOrMobile">Email or mobile</label>
            <input
              id="emailOrMobile"
              name="emailOrMobile"
              type="text"
              autoComplete="username"
              value={form.emailOrMobile}
              onChange={handleChange}
              aria-invalid={Boolean(errors.emailOrMobile)}
            />
            {errors.emailOrMobile && (
              <span className="form-field__error" role="alert">
                {errors.emailOrMobile}
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
                autoComplete="current-password"
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
            {errors.password && (
              <span className="form-field__error" role="alert">
                {errors.password}
              </span>
            )}
          </div>

          <div className="auth-card__row">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" className="auth-card__link">
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="auth-card__switch">
          New to FurniHub? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  )
}
