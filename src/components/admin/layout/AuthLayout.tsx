import React from 'react'

interface AuthLayoutProps {
  brandTitle: string
  brandDescription: string
  children: React.ReactNode
}

export default function AuthLayout({ brandTitle, brandDescription, children }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#162a15] px-4 py-8">
      {/* Decorative Background Glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-primary opacity-20 blur-3xl pointer-events-none animate-pulse duration-[6s]" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-[#dfba60] opacity-15 blur-3xl pointer-events-none animate-pulse duration-[8s]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-secondary opacity-10 blur-[100px] pointer-events-none" />

      {/* Main Glass Container */}
      <div className="w-full max-w-5xl grid md:grid-cols-12 rounded-xl overflow-hidden shadow-2xl border border-white/10 glassmorphism z-10">
        {/* Left Side: Brand Panel */}
        <div className="hidden md:flex md:col-span-5 flex-col justify-between p-12 bg-gradient-to-br from-[#1b3d18] to-[#0c180b] border-r border-white/5 relative text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(235,197,107,0.08),transparent_50%)] pointer-events-none" />
          
          {/* Logo Section (Centered, stacked) */}
          <div className="flex flex-col items-center z-10">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-md border-2 border-white/10 p-1.5">
              <img src="/logo.png" alt="CivicTree Logo" className="w-16 h-16 object-contain" />
            </div>
            <span className="font-heading font-bold text-2xl tracking-wider text-white mt-3.5">CivicTree</span>
          </div>

          {/* Slogan / Recovery Title */}
          <div className="z-10 my-auto flex flex-col items-center">
            <h2 className="text-2xl lg:text-3xl font-heading text-white leading-tight font-medium max-w-xs">
              {brandTitle}
            </h2>
            <p className="text-white/70 text-xs mt-4 font-sans leading-relaxed max-w-xs">
              {brandDescription}
            </p>
          </div>

          {/* Footer Info */}
          <div className="text-white/40 text-xs font-mono z-10 flex justify-center gap-6 items-center">
            <span>v1.0.0</span>
            <span>&copy; {new Date().getFullYear()} CivicTree</span>
          </div>
        </div>

        {/* Right Side: Dynamic Form Children Viewport */}
        <div className="col-span-12 md:col-span-7 flex flex-col justify-center p-8 sm:p-12 md:p-16 bg-white/95">
          {/* Mobile Header Logo (Centered, stacked) */}
          <div className="md:hidden flex flex-col items-center mb-8 justify-center">
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0 border border-gray-200 p-1 mb-2">
              <img src="/logo.png" alt="CivicTree Logo" className="w-10 h-10 object-contain" />
            </div>
            <span className="font-heading font-bold text-lg tracking-wider text-primary">CivicTree</span>
          </div>

          {children}
        </div>
      </div>

      {/* Shared Shake Animation styles */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.6s cubic-bezier(.36,.07,.19,.97) both;
          transform: translate3d(0, 0, 0);
        }
      `}</style>
    </div>
  )
}
