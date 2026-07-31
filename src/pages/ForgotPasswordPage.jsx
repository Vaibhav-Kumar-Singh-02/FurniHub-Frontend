import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { forgotPassword, verifyOtp, resetPassword } from '../services/authApi'

const STEP_IDENTIFIER = 1
const STEP_OTP = 2
const STEP_NEW_PASSWORD = 3

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

export default function ForgotPasswordPage() {
  const navigate = useNavigate()

  const [step, setStep] = useState(STEP_IDENTIFIER)
  const [identifier, setIdentifier] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState('')
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const strength = passwordStrength(newPassword)

  const handleSubmitIdentifier = async (e) => {
    e.preventDefault()
    if (!identifier.trim()) {
      setErrors({ identifier: 'Email or mobile is required' })
      return
    }
    setErrors({})
    setLoading(true)
    setFormError('')
    try {
      const data = await forgotPassword({ emailOrMobile: identifier.trim() })
      setNotice(data.message || 'OTP has been sent to your account.')
      setStep(STEP_OTP)
    } catch (err) {
      setFormError(err.body?.message || err.message || 'Failed to send OTP.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitOtp = async (e) => {
    e.preventDefault()
    if (!/^\d{6}$/.test(otp)) {
      setErrors({ otp: 'OTP must be exactly 6 digits' })
      return
    }
    setErrors({})
    setLoading(true)
    setFormError('')
    try {
      await verifyOtp({ emailOrMobile: identifier.trim(), otp: otp.trim() })
      setStep(STEP_NEW_PASSWORD)
    } catch (err) {
      setFormError(err.body?.message || err.message || 'OTP verification failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitNewPassword = async (e) => {
    e.preventDefault()
    const next = {}
    if (newPassword.length < 8) next.newPassword = 'Password must contain at least 8 characters'
    else if (strength < 4)
      next.newPassword = 'Must include uppercase, lowercase, a number and a special character'
    if (!confirmPassword) next.confirmPassword = 'Please confirm your password'
    else if (newPassword !== confirmPassword) next.confirmPassword = 'Passwords do not match'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setLoading(true)
    setFormError('')
    try {
      await resetPassword({
        emailOrMobile: identifier.trim(),
        otp: otp.trim(),
        newPassword,
      })
      navigate('/login', { state: { reset: true } })
    } catch (err) {
      setFormError(err.body?.message || err.message || 'Failed to reset password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page container">
      <div className="auth-card">
        <h1 className="auth-card__title">Reset your password</h1>
        <p className="auth-card__subtitle">
          {step === STEP_IDENTIFIER && 'Enter the email or mobile linked to your account.'}
          {step === STEP_OTP && 'Enter the 6-digit OTP sent to your account.'}
          {step === STEP_NEW_PASSWORD && 'Choose a new strong password.'}
        </p>

        {notice && <div className="alert alert--success">{notice}</div>}
        {formError && <div className="alert alert--error">{formError}</div>}

        {step === STEP_IDENTIFIER && (
          <form onSubmit={handleSubmitIdentifier} noValidate>
            <div className="form-field">
              <label htmlFor="identifier">Email or mobile</label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value)
                  setErrors((prev) => ({ ...prev, identifier: '' }))
                }}
                aria-invalid={Boolean(errors.identifier)}
              />
              {errors.identifier && (
                <span className="form-field__error" role="alert">
                  {errors.identifier}
                </span>
              )}
            </div>
            <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
              {loading ? 'Sending OTP…' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === STEP_OTP && (
          <form onSubmit={handleSubmitOtp} noValidate>
            <div className="form-field">
              <label htmlFor="otp">OTP</label>
              <input
                id="otp"
                name="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, ''))
                  setErrors((prev) => ({ ...prev, otp: '' }))
                }}
                aria-invalid={Boolean(errors.otp)}
              />
              {errors.otp && (
                <span className="form-field__error" role="alert">
                  {errors.otp}
                </span>
              )}
            </div>
            <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
              {loading ? 'Verifying…' : 'Verify OTP'}
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--block"
              onClick={() => setStep(STEP_IDENTIFIER)}
            >
              Back
            </button>
          </form>
        )}

        {step === STEP_NEW_PASSWORD && (
          <form onSubmit={handleSubmitNewPassword} noValidate>
            <div className="form-field">
              <label htmlFor="newPassword">New password</label>
              <div className="password-field">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value)
                    setErrors((prev) => ({ ...prev, newPassword: '' }))
                  }}
                  aria-invalid={Boolean(errors.newPassword)}
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
              {newPassword && (
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
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    setErrors((prev) => ({ ...prev, confirmPassword: '' }))
                  }}
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
              {loading ? 'Resetting…' : 'Reset password'}
            </button>
          </form>
        )}

        <p className="auth-card__switch">
          Remembered your password? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  )
}
