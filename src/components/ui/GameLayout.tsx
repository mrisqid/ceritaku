"use client";

interface GameLayoutProps {
  children: React.ReactNode;
}

export default function GameLayout({ children }: GameLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-yellow-200 to-yellow-400 relative overflow-hidden font-poppins">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        {/* Game Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">
            Tebak Cerita
          </h1>
          <p className="text-lg text-white/90">
            Tulis Ceritamu!
          </p>
        </div>

        {/* Main Content */}
        {children}
      </div>
    </div>
  );
} 