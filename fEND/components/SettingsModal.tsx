
import type { Dispatch, SetStateAction } from 'react'

type SettingsModalProps = {
  onClose: () => void

  darkMode: boolean
  setDarkMode: Dispatch<SetStateAction<boolean>>

  animationMode: boolean
  setAnimationMode: Dispatch<SetStateAction<boolean>>

  motionMode: boolean
  setMotionMode: Dispatch<SetStateAction<boolean>>

  notifications: boolean
  setNotifications: Dispatch<SetStateAction<boolean>>
}

export default function SettingsModal({
  onClose,

  darkMode,
  setDarkMode,

  animationMode,
  setAnimationMode,

  motionMode,
  setMotionMode,

  notifications,
  setNotifications,
}: SettingsModalProps) {
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">

      <div
        className="
          w-[500px]
          rounded-2xl
          border
          border-sky-400/20
          bg-slate-900
          p-8
          shadow-2xl
        "
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-white text-2xl font-bold">
            Settings
          </h1>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>
        <div className="flex flex-col gap-y-[20px]">
        <div className='border border-amber-400 shadow-2xl width-[500px] h-[50px] rounded-2xl flex flex-row  '>
          <label className='block text-white ml-5 mt-3'>
            Toggle Dark/Light Mode
          </label>
          <input
            className="ml-[195px]"
            type="checkbox"
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
          />

        </div>
        <div className='border border-blue-400 shadow-2xl width-[500px] h-[50px] rounded-2xl flex flex-row  '>
          <label className='block text-white ml-5 mt-3'>
            Toggle animation mode
          </label>
          <input
            className="ml-[200px]"
            type="checkbox"
            checked={animationMode}
            onChange={() => setAnimationMode(!animationMode)}
          />

        </div>
        <div className='border border-emerald-400 shadow-2xl width-[500px] h-[50px] rounded-2xl flex flex-row  '>
          <label className='block text-white ml-5 mt-3'>
            Toggle motion mode 
          </label>
          <input
            className="ml-[220px]"
            type="checkbox"
            checked={motionMode}
            onChange={() => setMotionMode(!motionMode)}
          />

        </div>
        <div className='border border-fuchsia-600 shadow-2xl width-[500px] h-[50px] rounded-2xl flex flex-row  '>
          <label className='block text-white ml-5 mt-3'>
            Allow Notifications 
          </label>
          <input
            className="ml-[235px]"
            type="checkbox"
            checked={notifications}
            onChange={() => setNotifications(!notifications)}
          />

        </div>
        </div>
        
      </div>
    </div>
  )
}

