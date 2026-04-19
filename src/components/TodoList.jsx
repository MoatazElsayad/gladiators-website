import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'

const priorityOrder = {
  P1: 1,
  P2: 2,
  P3: 3
}

const priorityStyles = {
  P1: 'border-red-500/45 bg-red-500/10 text-red-300',
  P2: 'border-amber-400/45 bg-amber-400/10 text-amber-200',
  P3: 'border-sky-400/45 bg-sky-400/10 text-sky-200'
}

export default function TodoList({ tasks, onAddTask, onToggleTask, onRemoveTask }) {
  const [taskName, setTaskName] = useState('')
  const [priority, setPriority] = useState('P3')

  const orderedTasks = useMemo(
    () =>
      [...tasks].sort((a, b) => {
        const priorityDifference = priorityOrder[a.priority] - priorityOrder[b.priority]

        if (priorityDifference !== 0) {
          return priorityDifference
        }

        return Number(a.done) - Number(b.done)
      }),
    [tasks]
  )

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!taskName.trim()) {
      return
    }

    onAddTask({ taskName, priority })
    setTaskName('')
    setPriority('P3')
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[0.8fr_1.2fr]">
      <div className="panel-card p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-arena-sand">Add Task</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="taskName" className="mb-2 block text-xs uppercase tracking-[0.16em] text-arena-sand">
              Task Name
            </label>
            <input
              id="taskName"
              value={taskName}
              onChange={(event) => setTaskName(event.target.value)}
              placeholder="Add a new task"
              className="w-full rounded-2xl border border-arena-bronzeLight/35 bg-arena-void/80 px-4 py-3 text-arena-parchment outline-none transition focus:border-arena-gold/65"
            />
          </div>

          <div>
            <label htmlFor="priority" className="mb-2 block text-xs uppercase tracking-[0.16em] text-arena-sand">
              Priority
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
              className="w-full rounded-2xl border border-arena-bronzeLight/35 bg-arena-void/80 px-4 py-3 text-arena-parchment outline-none transition focus:border-arena-gold/65"
            >
              <option value="P1">P1</option>
              <option value="P2">P2</option>
              <option value="P3">P3</option>
            </select>
          </div>

          <button type="submit" className="blood-button w-full text-xs">
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </button>
        </form>
      </div>

      <div className="panel-card p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-arena-sand">Task List</p>
            <p className="mt-2 text-sm text-arena-parchment">
              Tasks are saved automatically in localStorage.
            </p>
          </div>
          <span className="status-pill border-arena-gold/40 bg-arena-gold/10 text-arena-goldBright">
            {tasks.length} tasks
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
                className="flex items-center justify-between gap-4 rounded-[24px] border border-arena-bronzeLight/25 bg-arena-void/75 p-5"
              >
                <label className="flex min-w-0 flex-1 items-center gap-4">
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => onToggleTask(task.id)}
                    className="h-5 w-5 rounded border-arena-gold/40 bg-arena-panel text-arena-goldBright focus:ring-arena-gold/30"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`status-pill ${priorityStyles[task.priority] || priorityStyles.P3}`}
                      >
                        {task.priority}
                      </span>
                      <span
                        className={`text-base ${task.done ? 'text-arena-sand line-through opacity-70' : 'text-arena-parchment'}`}
                      >
                        {task.taskName}
                      </span>
                    </div>
                  </div>
                </label>

                <button
                  type="button"
                  onClick={() => onRemoveTask(task.id)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-arena-bloodGlow/35 bg-arena-blood/10 text-[#ffd4d4] transition hover:-translate-y-0.5"
                  aria-label={`Delete ${task.taskName}`}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </motion.article>
            ))}
          </AnimatePresence>

          {orderedTasks.length === 0 && (
            <div className="rounded-[24px] border border-dashed border-arena-bronzeLight/30 bg-arena-void/70 p-8 text-center text-arena-sand">
              No tasks yet. Add your first task to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
