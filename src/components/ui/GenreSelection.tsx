// Updated Genre Selection Component
function GenreSelection({ selectedGenre, onGenreChange }: { selectedGenre: string; onGenreChange: (genre: string) => void }) {
  const genres = [
    { id: 'funny', name: 'Lucu', icon: '😂', color: 'from-yellow-400 to-orange-400', },
    { id: 'embarrassing', name: 'Memalukan', icon: '😅', color: 'from-red-400 to-pink-400', },
    { id: 'scary', name: 'Menyeramkan', icon: '👻', color: 'from-purple-400 to-indigo-400', },
    { id: 'romantic', name: 'Romantis', icon: '💕', color: 'from-pink-400 to-rose-400', },
    { id: 'adventure', name: 'Petualangan', icon: '🗺️', color: 'from-blue-400 to-cyan-400', },
  ];

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 lg:p-6 border border-white/20 shadow-lg w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg sm:text-xl">🎭</span>
          <h3 className="text-base sm:text-lg font-bold text-white">
            Pilih Genre Cerita
          </h3>
        </div>
        <span className="text-xs sm:text-sm font-normal text-white/70 sm:ml-2">
          (Opsional)
        </span>
      </div>

      {/* Description */}
      <p className="text-white/80 text-xs sm:text-sm mb-4 leading-relaxed">
        Beri petunjuk kepada pemain lain tentang jenis cerita yang akan kamu tulis
      </p>

      {/* Genre Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
        {genres.map((genre) => (
          <button
            key={genre.id}
            onClick={() => onGenreChange(selectedGenre === genre.id ? '' : genre.id)}
            className={`flex flex-col justify-center items-center group relative overflow-hidden rounded-lg p-3 sm:p-4 transition-all duration-300 transform hover:scale-105 ${selectedGenre === genre.id
              ? 'ring-2 ring-white shadow-lg scale-105'
              : 'hover:shadow-md'
              }`}
          >
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${genre.color} opacity-80 group-hover:opacity-90 transition-opacity`} />

            {/* Content */}
            <div className="relative z-10 text-center">
              <div className="text-xl sm:text-2xl mb-1 sm:mb-2">{genre.icon}</div>
              <div className="font-bold text-white text-xs sm:text-sm mb-1">{genre.name}</div>
              {/* Shorter description for mobile */}
              <div className="text-white/90 text-xs leading-tight block sm:hidden">
                {genre.name === 'Lucu' && 'Yang menghibur'}
                {genre.name === 'Memalukan' && 'Momen awkward'}
                {genre.name === 'Menyeramkan' && 'Bikin merinding'}
                {genre.name === 'Romantis' && 'Kisah hati'}
                {genre.name === 'Petualangan' && 'Seru & menantang'}
              </div>
            </div>

            {/* Selected Indicator */}
            {selectedGenre === genre.id && (
              <div className="absolute top-1 right-1 sm:top-2 sm:right-2 w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xs sm:text-sm font-bold">✓</span>
              </div>
            )}

            {/* Hover Glow Effect */}
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
          </button>
        ))}
      </div>

      {/* Selected Genre Display */}
      {selectedGenre && (
        <div className="mt-4 p-3 bg-white/20 rounded-lg">
          <div className="flex items-center justify-between gap-2 text-white">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm sm:text-base">{genres.find(g => g.id === selectedGenre)?.icon}</span>
              <span className="font-medium text-sm sm:text-base truncate">
                Genre: {genres.find(g => g.id === selectedGenre)?.name}
              </span>
            </div>
            <button
              onClick={() => onGenreChange('')}
              className="text-white/70 hover:text-white transition-colors p-1 flex-shrink-0"
              aria-label="Hapus pilihan genre"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GenreSelection;