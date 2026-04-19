import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import ProgressBar from '../components/ProgressBar'
import TodoList from '../components/TodoList'

const storageKey = 'gladiators-simple-tasks'

const seededTasks = [
  { id: 1, taskName: 'Finish landing page polish', done: true },
  { id: 2, taskName: 'Replace trailer with real video', done: false },
  { id: 3, taskName: 'Connect real leaderboard backend', done: false }
]

export default function TeamProgress() {
  const [tasks, setTasks] = useState(() => {
    const stored = localStorage.getItem(storageKey)

    if (!stored) {
      return seededTasks
    }

    try {
      const parsed = JSON.parse(stored)
      return Array.isArray(parsed) ? parsed : seededTasks
    } catch (error) {
      console.error('Failed to read saved tasks:', error)
      return seededTasks
    }
  })
  const [progress, setProgress] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    const completed = tasks.filter((task) => task.done).length
    const completionRate = tasks.length ? Math.round((completed / tasks.length) * 100) : 0

    setCompletedCount(completed)
    setProgress(completionRate)
  }, [tasks])

  const addTask = (taskName) => {
    setTasks((current) => [
      ...current,
      {
        id: Date.now(),
        taskName: taskName.trim(),
        done: false
      }
    ])
  }

  const toggleTask = (id) => {
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, done: !task.done } : task))
    )
  }

  const removeTask = (id) => {
    setTasks((current) => current.filter((task) => task.id !== id))
  }

  return (
    <section className="section-shell py-14 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-arena-sand">Internal Tasks</p>
        <h1 className="mt-4 section-title">Simple Team Tasks</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-arena-sand">
          Add a task, mark it done, delete it when needed, and track the overall progress.
        </p>

        <div className="mt-8">
          <ProgressBar progress={progress} completed={completedCount} total={tasks.length} />
        </div>

        <div className="mt-8">
          <TodoList
            tasks={tasks}
            onAddTask={addTask}
            onToggleTask={toggleTask}
            onRemoveTask={removeTask}
          />
        </div>
      </motion.div>
    </section>
  )
}
