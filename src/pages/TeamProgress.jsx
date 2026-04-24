import { motion } from 'framer-motion'
import { Check, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

export default function TeamProgress() {
  const [tasks, setTasks] = useState([])
  const [inputValue, setInputValue] = useState('')

  const completed = tasks.filter((t) => t.done).length
  const progress = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0

  const addTask = (e) => {
    e.preventDefault()
    if (inputValue.trim()) {
      setTasks([...tasks, { id: Date.now(), text: inputValue.trim(), done: false }])
      setInputValue('')
    }
  }

  const toggleTask = (id) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  }

  const removeTask = (id) => {
    setTasks(tasks.filter((t) => t.id !== id))
  }

  return (
    <section className="section-shell py-14 sm:py-16">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-arena-sand">Team Tracker</p>
        <h1 className="mt-4 section-title">Battle Progress</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-arena-sand">
          Track your team's tasks and watch the progress bar rise to victory.
        </p>

        {/* Progress Bar */}
        <div className="mt-8">
          <div className="panel-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-arena-sand">Overall Progress</p>
                <p className="mt-2 text-2xl font-bold text-arena-goldBright">{progress}%</p>
                <p className="mt-1 text-sm text-arena-sand">
                  {completed} of {tasks.length} tasks completed
                </p>
              </div>
              <div className="h-24 w-24 rounded-full border-4 border-arena-gold/25 flex items-center justify-center bg-arena-ember/30">
                <p className="text-3xl font-bold text-arena-goldBright">{progress}%</p>
              </div>
            </div>
            {/* Linear progress bar */}
            <div className="mt-6 h-2 w-full rounded-full border border-arena-bronzeLight/30 bg-arena-void/50 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-arena-gold to-arena-goldBright transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Add Task Form */}
        <form onSubmit={addTask} className="mt-8">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1 rounded-lg border border-arena-bronzeLight/35 bg-arena-panel/85 px-4 py-3 text-arena-parchment outline-none transition focus:border-arena-gold/65"
            />
            <button
              type="submit"
              className="blood-button text-xs"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>
        </form>

        {/* Task List */}
        <div className="mt-8">
          {tasks.length === 0 ? (
            <div className="panel-card p-10 text-center text-arena-sand">No tasks yet. Add one to get started!</div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="panel-card flex items-center gap-4 p-4"
                >
                  <button
                    type="button"
                    onClick={() => toggleTask(task.id)}
                    className={`flex-shrink-0 h-6 w-6 rounded border-2 flex items-center justify-center transition ${
                      task.done
                        ? 'border-arena-goldBright bg-arena-gold text-arena-void'
                        : 'border-arena-bronzeLight/35 hover:border-arena-gold/65'
                    }`}
                  >
                    {task.done && <Check className="h-4 w-4" />}
                  </button>
                  <span className={`flex-1 text-sm ${task.done ? 'line-through text-arena-sand/50' : 'text-arena-parchment'}`}>
                    {task.text}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeTask(task.id)}
                    className="flex-shrink-0 p-2 text-arena-sand hover:text-arena-bloodGlow transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </section>
  )
}
