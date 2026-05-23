import { Settings } from 'lucide-react'

type SettingProps = {
  onClick: () => void
}

export default function Setting({ onClick }: SettingProps) {
  return (
    <div className="fixed top-6 right-6 z-40">
      <button
        onClick={onClick}
        className="
          p-3
          rounded-xl
          bg-slate-900/80
          border
          border-sky-400/20
          hover:bg-slate-800
          transition
          shadow-lg
        "
      >
        <Settings size={26} color="white" />
      </button>
    </div>
  )
}