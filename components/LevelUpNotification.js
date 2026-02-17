"use client";

export default function LevelUpNotification({ level, onClose }) {
  if (!level) return null;

  return (
    <div className="fixed inset-0 glass-effect z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-gradient-to-br from-[#F59E0B] via-[#EF4444] to-[#EC4899] rounded-2xl p-8 max-w-md w-full text-center animate-modalSlideUp shadow-2xl shadow-[#EF4444]/50">
        {/* Celebration Emoji */}
        <div className="text-8xl mb-4 animate-bounce">🎉</div>

        {/* Level Up Text */}
        <h2 className="text-4xl font-bold text-white mb-2">LEVEL UP!</h2>
        <p className="text-6xl font-extrabold text-white mb-4">{level}</p>

        {/* Message */}
        <p className="text-lg text-white/90 mb-6">
          You're getting stronger! Keep crushing those streaks!
        </p>

        {/* Continue Button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl font-semibold bg-white text-[#EF4444] hover:scale-105 active:scale-95 transition-spring"
        >
          AWESOME!
        </button>
      </div>
    </div>
  );
}
