import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'

export default function TodoList({ tasks, onAddTask, onToggleTask, onRemoveTask }) {
  const [taskName, setTaskName] = useState('')

  const orderedTasks = useMemo(
    () => [...tasks].sort((a, b) => Number(a.done) - Number(b.done)),
    [tasks]
  )

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!taskName.trim()) {
      return
    }

    onAddTask(taskName)
    setTaskName('')
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
                  <span className={`text-base ${task.done ? 'text-arena-sand line-through opacity-70' : 'text-arena-parchment'}`}>
                    {task.taskName}
                  </span>
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
