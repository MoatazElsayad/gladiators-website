import { motion } from 'framer-motion'
import { CalendarCheck2, RotateCcw, ScrollText, Target, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import ProgressBar from '../components/ProgressBar'
import TodoList from '../components/TodoList'

const storageKey = 'gladiators-team-progress'

const members = ['Moataz', 'Lina', 'Youssef', 'Salma']

const seededTasks = [
  {
    id: 1,
    taskName: 'Finalize landing page art direction',
    assignee: 'Moataz',
    dueDate: '2026-04-20',
    status: 'completed'
  },
  {
    id: 2,
    taskName: 'Connect real trailer embed',
    assignee: 'Lina',
    dueDate: '2026-04-22',
    status: 'in-progress'
  },
  {
    id: 3,
    taskName: 'Prepare leaderboard API contract',
    assignee: 'Youssef',
    dueDate: '2026-04-24',
    status: 'in-progress'
  },
  {
    id: 4,
    taskName: 'QA responsive navigation on mobile',
    assignee: 'Salma',
    dueDate: '2026-04-21',
    status: 'planned'
  }
]

function isDueSoon(dueDate) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)

  const diffInDays = Math.round((due - today) / 86400000)
  return diffInDays >= 0 && diffInDays <= 3
}

export default function TeamProgress() {
  const [tasks, setTasks] = useState(() => {
    const stored = localStorage.getItem(storageKey)

    if (!stored) {
      return seededTasks
    }

    try {
      const parsed = JSON.parse(stored)
      return Array.isArray(parsed) && parsed.length ? parsed : seededTasks
    } catch (error) {
      console.error('Failed to read saved tasks:', error)
      return seededTasks
    }
  })
  const [progress, setProgress] = useState(0)
  const [stats, setStats] = useState({
    completed: 0,
    inProgress: 0,
    planned: 0,
    total: seededTasks.length,
    dueSoon: 0
  })
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    const completed = tasks.filter((task) => task.status === 'completed').length
    const inProgress = tasks.filter((task) => task.status === 'in-progress').length
    const planned = tasks.filter((task) => task.status === 'planned').length
    const dueSoon = tasks.filter((task) => task.status !== 'completed' && isDueSoon(task.dueDate)).length
    const total = tasks.length
    const completionRate = total ? Math.round((completed / total) * 100) : 0

    setProgress(completionRate)
    setStats({ completed, inProgress, planned, total, dueSoon })
  }, [tasks])

  const filteredTasks = useMemo(() => {
    if (activeFilter === 'all') {
      return tasks
    }

    if (activeFilter === 'due-soon') {
      return tasks.filter((task) => task.status !== 'completed' && isDueSoon(task.dueDate))
    }

    return tasks.filter((task) => task.status === activeFilter)
  }, [activeFilter, tasks])

  const workload = useMemo(
    () =>
      members.map((member) => ({
        member,
        total: tasks.filter((task) => task.assignee === member).length,
        completed: tasks.filter((task) => task.assignee === member && task.status === 'completed').length
      })),
    [tasks]
  )

  const addTask = ({ taskName, assignee, dueDate, status }) => {
    setTasks((current) => [
      ...current,
      {
        id: Date.now(),
        taskName: taskName.trim(),
        assignee,
        dueDate,
        status
      }
    ])
  }

  const updateTaskStatus = (id, status) => {
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, status } : task))
    )
  }

  const removeTask = (id) => {
    setTasks((current) => current.filter((task) => task.id !== id))
  }

  const resetBoard = () => {
    if (!window.confirm('Reset the team board back to the seeded Gladiators tasks?')) {
      return
    }

    localStorage.removeItem(storageKey)
    setTasks(seededTasks)
    setActiveFilter('all')
  }

  const filterButtons = [
    { key: 'all', label: 'All Tasks' },
    { key: 'in-progress', label: 'In Progress' },
    { key: 'planned', label: 'Planned' },
    { key: 'completed', label: 'Completed' },
    { key: 'due-soon', label: 'Due Soon' }
  ]

  return (
    <section className="section-shell py-14 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-arena-sand">Internal Ops</p>
            <h1 className="mt-4 section-title">Development Progress - Team Gladiators</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-arena-sand">
              This internal page tracks current website and game-support tasks for the Cairo team. All task
              updates save locally so the board survives refreshes during active development.
            </p>
          </div>

          <button type="button" onClick={resetBoard} className="ghost-button">
            <RotateCcw className="mr-2 h-3.5 w-3.5" />
            Reset Board
          </button>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { icon: Target, label: 'Completed', value: stats.completed, color: 'text-emerald-300' },
            { icon: ScrollText, label: 'In Progress', value: stats.inProgress, color: 'text-arena-goldBright' },
            { icon: CalendarCheck2, label: 'Due Soon', value: stats.dueSoon, color: 'text-orange-200' },
            { icon: Users, label: 'Team Members', value: members.length, color: 'text-[#ffd4d4]' }
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="panel-card p-6">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.18em] text-arena-sand">{label}</p>
                <div className="rounded-2xl border border-arena-gold/25 bg-arena-gold/10 p-3 text-arena-goldBright">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className={`mt-5 font-display text-4xl uppercase tracking-[0.12em] ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <ProgressBar progress={progress} completed={stats.completed} total={stats.total} />
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-4">
          {workload.map(({ member, total, completed }) => (
            <div key={member} className="panel-card p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-arena-sand">{member}</p>
              <p className="mt-3 text-2xl font-semibold text-arena-goldBright">{total}</p>
              <p className="mt-2 text-sm text-arena-sand">{completed} completed assignments</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {filterButtons.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => setActiveFilter(filter.key)}
              className={`ghost-button ${
                activeFilter === filter.key ? 'border-arena-gold/55 bg-arena-gold/12 text-arena-goldBright' : ''
              }`}
            >
              {filter.label}
            </button>
          ))}
          <span className="status-pill border-arena-gold/40 bg-arena-gold/10 text-arena-goldBright">
            {filteredTasks.length} visible tasks
          </span>
        </div>

        <div className="mt-8">
          <TodoList
            tasks={filteredTasks}
            members={members}
            onAddTask={addTask}
            onStatusChange={updateTaskStatus}
            onRemoveTask={removeTask}
            emptyMessage="No tasks match this filter yet. Try another view or add a new milestone."
          />
        </div>
      </motion.div>
    </section>
  )
}
