import { motion } from 'framer-motion'
import { LogIn, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export default function AuthPage({ mode }) {
  const isRegister = mode === 'register'
  const navigate = useNavigate()
  const location = useLocation()
  const { login, register } = useAuth()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [identity, setIdentity] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const redirectTo = location.state?.from || '/profile'

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setErrorMessage('')

    try {
      if (isRegister) {
        await register({ email, username, password })
      } else {
        await login({ identity, password })
      }
      navigate(redirectTo, { replace: true })
    } catch (error) {
      setErrorMessage(error.message || 'Could not complete the request.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="section-shell py-14 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-lg"
      >
        <div className="panel-card p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-arena-gold/35 bg-arena-gold/10 p-3 text-arena-goldBright">
              {isRegister ? <UserPlus className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-arena-sand">
                Gladiators Account
              </p>
              <h1 className="mt-2 font-display text-3xl uppercase tracking-[0.12em] text-arena-goldBright">
                {isRegister ? 'Create Profile' : 'Sign In'}
              </h1>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {isRegister ? (
              <>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Email"
                  className="w-full rounded-2xl border border-arena-bronzeLight/35 bg-arena-panel/85 px-4 py-3 text-arena-parchment outline-none transition focus:border-arena-gold/65"
                />
                <input
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Username"
                  className="w-full rounded-2xl border border-arena-bronzeLight/35 bg-arena-panel/85 px-4 py-3 text-arena-parchment outline-none transition focus:border-arena-gold/65"
                />
              </>
            ) : (
              <input
                type="text"
                value={identity}
                onChange={(event) => setIdentity(event.target.value)}
                placeholder="Username or email"
                className="w-full rounded-2xl border border-arena-bronzeLight/35 bg-arena-panel/85 px-4 py-3 text-arena-parchment outline-none transition focus:border-arena-gold/65"
              />
            )}

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              className="w-full rounded-2xl border border-arena-bronzeLight/35 bg-arena-panel/85 px-4 py-3 text-arena-parchment outline-none transition focus:border-arena-gold/65"
            />

            {errorMessage && (
              <div className="rounded-2xl border border-[#ffb3b3]/20 bg-[#6f1414]/20 px-4 py-3 text-sm text-[#ffd4d4]">
                {errorMessage}
              </div>
            )}

            <button type="submit" className="blood-button w-full justify-center text-xs" disabled={submitting}>
              {submitting ? 'Working...' : isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-arena-sand">
            {isRegister ? (
              <Link to="/login" className="text-arena-goldBright transition hover:text-arena-gold">
                Already have a profile? Sign in.
              </Link>
            ) : (
              <Link to="/register" className="text-arena-goldBright transition hover:text-arena-gold">
                Need a profile? Create one.
              </Link>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
