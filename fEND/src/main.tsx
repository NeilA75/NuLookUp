import { StrictMode, useState, useEffect } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App'
import Home from './Home'
import About from './About'
import Contact from './Contact'
export interface Settings {
  darkMode: boolean
  setDarkMode: Dispatch<SetStateAction<boolean>>
  motionMode: boolean
  setMotionMode: Dispatch<SetStateAction<boolean>>
  notifications: boolean
  setNotifications: Dispatch<SetStateAction<boolean>>
}

function Root() {
  const [darkMode, setDarkMode] = useState(() =>
    JSON.parse(localStorage.getItem('darkMode') || 'false')
  )
  const [motionMode, setMotionMode] = useState(() =>
    JSON.parse(localStorage.getItem('motionMode') || 'false')
  )
  const [notifications, setNotifications] = useState(() => {
    // If the browser has already granted permission, honour it on load.
    // If permission was revoked in browser settings since last visit, reset to false.
    const saved = JSON.parse(localStorage.getItem('notifications') || 'false')
    const browserGranted =
      typeof Notification !== 'undefined' && Notification.permission === 'granted'
    return saved && browserGranted
  })

  useEffect(() => { localStorage.setItem('darkMode', JSON.stringify(darkMode)) }, [darkMode])
  useEffect(() => { localStorage.setItem('motionMode', JSON.stringify(motionMode)) }, [motionMode])
  useEffect(() => { localStorage.setItem('notifications', JSON.stringify(notifications)) }, [notifications])

  const settings: Settings = {
    darkMode, setDarkMode,
    motionMode, setMotionMode,
    notifications, setNotifications,
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"        element={<App     settings={settings} />} />
        <Route path="/Home"    element={<Home    settings={settings} />} />
        <Route path="/About"   element={<About   settings={settings} />} />
        <Route path="/Contact" element={<Contact settings={settings} />} />
      </Routes>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>
)