import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import ProgressBar from '../components/ProgressBar'
import TodoList from '../components/TodoList'

const API_URL = 'http://localhost:3001/api/tasks'

const normalizeTasks = (items) =>
  items.map((task) => ({
    ...task,
    priority: task.priority || 'P3'
  }))

export default function TeamProgress() {
  const [tasks, setTasks] = useState([])
  const completedCount = useMemo(() => tasks.filter((task) => task.done).length, [tasks])
  const progress = useMemo(
    () => (tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0),
    [completedCount, tasks.length]
  )

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(API_URL)
        const data = await response.json()
        setTasks(Array.isArray(data) ? normalizeTasks(data) : [])
      } catch (error) {
        console.error('Failed to fetch tasks:', error)
      }
    }

    fetchTasks()
  }, [])

  useEffect(() => {
    if (tasks.length > 0) {
      fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tasks)
      }).catch((error) => console.error('Failed to save tasks:', error))
    }
  }, [tasks])

  const addTask = ({ taskName, priority }) => {
    setTasks((current) => [
      ...current,
      {
        id: Date.now(),
        taskName: taskName.trim(),
        done: false,
        priority
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
