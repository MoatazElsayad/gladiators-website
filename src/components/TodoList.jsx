import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'

const statusStyles = {
  planned: 'border-arena-bronzeLight/45 bg-arena-bronze/25 text-arena-sand',
  'in-progress': 'border-arena-gold/45 bg-arena-gold/10 text-arena-goldBright',
  completed: 'border-emerald-500/45 bg-emerald-500/10 text-emerald-300'
}

function getUrgencyMeta(dueDate, status) {
  if (status === 'completed') {
    return {
      label: 'secured',
      classes: 'border-emerald-500/45 bg-emerald-500/10 text-emerald-300'
    }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)

  const diffInDays = Math.round((due - today) / 86400000)

  if (diffInDays < 0) {
    return {
      label: 'overdue',
      classes: 'border-arena-bloodGlow/45 bg-arena-blood/10 text-[#ffd4d4]'
    }
  }

  if (diffInDays === 0) {
    return {
      label: 'due today',
      classes: 'border-orange-400/45 bg-orange-400/10 text-orange-200'
    }
  }

  if (diffInDays <= 3) {
    return {
      label: 'due soon',
      classes: 'border-arena-gold/45 bg-arena-gold/10 text-arena-goldBright'
    }
  }

  return {
    label: 'on track',
    classes: 'border-sky-400/45 bg-sky-400/10 text-sky-200'
  }
}

export default function TodoList({
  tasks,
  members,
  onAddTask,
  onStatusChange,
  onRemoveTask,
  emptyMessage = 'No tasks match the current filter.'
}) {
  const [form, setForm] = useState({
    taskName: '',
    assignee: members[0],
    dueDate: '',
    status: 'in-progress'
  })

  const orderedTasks = useMemo(
    () =>
      [...tasks].sort((a, b) => {
        if (a.status === 'completed' && b.status !== 'completed') {
          return 1
        }

        if (a.status !== 'completed' && b.status === 'completed') {
          return -1
        }

        return new Date(a.dueDate) - new Date(b.dueDate)
      }),
    [tasks]
  )

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!form.taskName.trim() || !form.dueDate) {
      return
    }

    onAddTask(form)
    setForm({
      taskName: '',
      assignee: members[0],
      dueDate: '',
      status: 'in-progress'
    })
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[0.95fr_1.25fr]">
      <div className="panel-card p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-arena-sand">
          Add New Task
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="taskName" className="mb-2 block text-xs uppercase tracking-[0.16em] text-arena-sand">
              Task Name
            </label>
            <input
              id="taskName"
              value={form.taskName}
              onChange={(event) => setForm((current) => ({ ...current, taskName: event.target.value }))}
              placeholder="Ship leaderboard API adapter"
              className="w-full rounded-2xl border border-arena-bronzeLight/35 bg-arena-void/80 px-4 py-3 text-arena-parchment outline-none transition focus:border-arena-gold/65"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="assignee" className="mb-2 block text-xs uppercase tracking-[0.16em] text-arena-sand">
                Assignee
              </label>
              <select
                id="assignee"
                value={form.assignee}
                onChange={(event) => setForm((current) => ({ ...current, assignee: event.target.value }))}
                className="w-full rounded-2xl border border-arena-bronzeLight/35 bg-arena-void/80 px-4 py-3 text-arena-parchment outline-none transition focus:border-arena-gold/65"
              >
                {members.map((member) => (
                  <option key={member} value={member}>
                    {member}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="dueDate" className="mb-2 block text-xs uppercase tracking-[0.16em] text-arena-sand">
                Due Date
              </label>
              <input
                id="dueDate"
                type="date"
                value={form.dueDate}
                onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))}
                className="w-full rounded-2xl border border-arena-bronzeLight/35 bg-arena-void/80 px-4 py-3 text-arena-parchment outline-none transition focus:border-arena-gold/65"
              />
            </div>
          </div>

          <div>
            <label htmlFor="status" className="mb-2 block text-xs uppercase tracking-[0.16em] text-arena-sand">
              Status
            </label>
            <select
              id="status"
              value={form.status}
              onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
              className="w-full rounded-2xl border border-arena-bronzeLight/35 bg-arena-void/80 px-4 py-3 text-arena-parchment outline-none transition focus:border-arena-gold/65"
            >
              <option value="planned">Planned</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <button type="submit" className="blood-button w-full text-xs">
            <Plus className="mr-2 h-4 w-4" />
            Add Arena Task
          </button>
        </form>
      </div>

      <div className="panel-card p-6 sm:p-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-arena-sand">Todo War Table</p>
            <p className="mt-2 text-sm text-arena-parchment">
              Local changes persist automatically in your browser via localStorage.
            </p>
          </div>
          <span className="status-pill border-arena-gold/40 bg-arena-gold/10 text-arena-goldBright">
            {tasks.length} active entries
          </span>
        </div>

        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {orderedTasks.map((task) => (
              <motion.article
                key={task.id}
                layout
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="rounded-[24px] border border-arena-bronzeLight/25 bg-arena-void/75 p-5"
              >
                {(() => {
                  const urgency = getUrgencyMeta(task.dueDate, task.status)

                  return (
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-semibold text-arena-parchment">{task.taskName}</h3>
                          <span className={`status-pill ${statusStyles[task.status]}`}>{task.status}</span>
                          <span className={`status-pill ${urgency.classes}`}>{urgency.label}</span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-3 text-sm text-arena-sand">
                          <span>Assignee: {task.assignee}</span>
                          <span>Due: {task.dueDate}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <select
                          value={task.status}
                          onChange={(event) => onStatusChange(task.id, event.target.value)}
                          className="rounded-full border border-arena-bronzeLight/35 bg-arena-panel px-4 py-2 text-sm text-arena-parchment outline-none transition focus:border-arena-gold/65"
                        >
                          <option value="planned">Planned</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => onStatusChange(task.id, 'completed')}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-emerald-500/35 bg-emerald-500/10 text-emerald-300 transition hover:-translate-y-0.5"
                          aria-label={`Mark ${task.taskName} complete`}
                        >
                          <CheckCircle2 className="h-5 w-5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onRemoveTask(task.id)}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-arena-bloodGlow/35 bg-arena-blood/10 text-[#ffd4d4] transition hover:-translate-y-0.5"
                          aria-label={`Remove ${task.taskName}`}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  )
                })()}
              </motion.article>
            ))}
          </AnimatePresence>

          {orderedTasks.length === 0 && (
            <div className="rounded-[24px] border border-dashed border-arena-bronzeLight/30 bg-arena-void/70 p-8 text-center text-arena-sand">
              {emptyMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
