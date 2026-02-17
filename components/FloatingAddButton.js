"use client";

export default function FloatingAddButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed right-5 bottom-[90px] w-[60px] h-[60px] rounded-full bg-gradient-to-br from-[#60A5FA] to-[#3B82F6] text-white shadow-lg shadow-[#60A5FA]/50 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-50"
      aria-label="Add task"
    >
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={3}
          d="M12 4v16m8-8H4"
        />
      </svg>
    </button>
  );
}
