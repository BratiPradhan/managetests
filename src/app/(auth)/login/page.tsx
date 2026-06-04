import LoginForm from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — illustration */}
      <div className="hidden lg:flex flex-1 bg-[#E8EBF5] relative overflow-hidden items-center justify-center">
        {/* Decorative symbols */}
        <span className="absolute top-20 left-14 text-2xl text-gray-400 select-none">+</span>
        <span className="absolute top-36 left-36 w-4 h-4 rounded-full border-2 border-gray-300" />
        <span className="absolute top-1/3 right-24 text-2xl text-gray-400 select-none">+</span>
        <span className="absolute bottom-40 left-20 w-3 h-3 rounded-full border-2 border-gray-300" />
        <span className="absolute bottom-28 right-14 text-2xl text-gray-400 select-none">+</span>

        {/* Illustration */}
        <div className="flex flex-col items-center gap-6 z-10">
          <svg width="260" height="220" viewBox="0 0 260 220" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Desk */}
            <rect x="20" y="160" width="220" height="12" rx="4" fill="#4B5563" />
            <rect x="30" y="172" width="8" height="36" rx="3" fill="#4B5563" />
            <rect x="222" y="172" width="8" height="36" rx="3" fill="#4B5563" />
            {/* Laptop base */}
            <rect x="70" y="130" width="120" height="30" rx="4" fill="#6B7280" />
            {/* Laptop screen */}
            <rect x="78" y="72" width="104" height="62" rx="4" fill="#374151" />
            <rect x="82" y="76" width="96" height="54" rx="3" fill="#BFDBFE" />
            {/* Screen content lines */}
            <rect x="90" y="86" width="60" height="4" rx="2" fill="#93C5FD" />
            <rect x="90" y="96" width="80" height="3" rx="1.5" fill="#BAE6FD" />
            <rect x="90" y="104" width="70" height="3" rx="1.5" fill="#BAE6FD" />
            <rect x="90" y="112" width="50" height="3" rx="1.5" fill="#BAE6FD" />
            {/* Person — head */}
            <circle cx="130" cy="42" r="18" fill="#FBBF24" />
            {/* Hair */}
            <path d="M112 36 Q130 20 148 36" fill="#92400E" />
            {/* Eyes */}
            <circle cx="124" cy="42" r="2.5" fill="#1F2937" />
            <circle cx="136" cy="42" r="2.5" fill="#1F2937" />
            {/* Smile */}
            <path d="M124 50 Q130 56 136 50" stroke="#1F2937" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            {/* Person — body */}
            <rect x="112" y="60" width="36" height="40" rx="8" fill="#6366F1" />
            {/* Arms */}
            <rect x="90" y="68" width="22" height="10" rx="5" fill="#6366F1" />
            <rect x="148" y="68" width="22" height="10" rx="5" fill="#6366F1" />
            {/* Hands on laptop */}
            <circle cx="95" cy="136" r="7" fill="#FBBF24" />
            <circle cx="165" cy="136" r="7" fill="#FBBF24" />
          </svg>

          {/* Name badge */}
          <div className="bg-purple-600 text-white text-sm font-medium px-5 py-2 rounded-lg shadow">
            Pawan Kumar Paik
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 lg:flex-none lg:w-120 bg-white flex flex-col justify-center px-10 md:px-16 py-12">
        {/* Logo */}
        <div className="mb-10">
          <span className="inline-block border-2 border-green-500 text-green-600 font-bold text-lg px-2 py-0.5 rounded tracking-wide">
            PrepRoute
          </span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Login</h1>
        <p className="text-sm text-gray-500 mb-8">Use your company provided Login credentials</p>

        <LoginForm />
      </div>
    </div>
  )
}
