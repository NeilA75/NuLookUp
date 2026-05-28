

type SettingsModalProps = {
  onClose: () => void

  darkMode: boolean
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>

  motionMode: boolean
  setMotionMode: React.Dispatch<React.SetStateAction<boolean>>

  notifications: boolean
  setNotifications: React.Dispatch<React.SetStateAction<boolean>>
}

export default function SettingsModal({
  onClose,

  darkMode,
  setDarkMode,

  motionMode,
  setMotionMode,

  notifications,
  setNotifications,
}: SettingsModalProps) {

  console.log('SettingsModal mounted')

  const handleNotificationsToggle = async () => {
    console.log('toggle called')
    if (!notifications) {
      if (typeof Notification === 'undefined') {
        console.log('Notifications not supported in this browser')
        return
      }
      const permission = await Notification.requestPermission()
      console.log('Permission result:', permission)
      if (permission === 'granted') {
        setNotifications(true)
        console.log('Firing notification...')
        new Notification('NuLookUp', {
          body: 'Notifications are now enabled!',
          icon: '/favicon.ico',
        })
      }
    } else {
      setNotifications(false)
    }
  }

  function MotionClicked() {
    setMotionMode(!motionMode)

    
  }

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

          <div className="border border-amber-400 shadow-2xl width-[500px] h-[50px] rounded-2xl flex flex-row">
            <label className="block text-white ml-5 mt-3">
              Toggle Dark/Light Mode
            </label>
            <input
              className="ml-[195px]"
              type="checkbox"
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
            />
          </div>

          <div className="border border-emerald-400 shadow-2xl width-[500px] h-[50px] rounded-2xl flex flex-row">
            <button className="block text-white ml-5" onClick={()=> MotionClicked()}>
              {motionMode
                ? "Enable Motion Mode"
                : "Disable Motion Mode"}
            </button>
            
          </div>

          <div className="border border-fuchsia-600 shadow-2xl width-[500px] h-[50px] rounded-2xl flex flex-row">
            <label className="block text-white ml-5 mt-3">
              Allow Notifications
            </label>
            <input
              className="ml-[235px]"
              type="checkbox"
              checked={notifications}
              onChange={handleNotificationsToggle}
              onClick={handleNotificationsToggle}
            />
          </div>

        </div>
      </div>
    </div>
  )
}