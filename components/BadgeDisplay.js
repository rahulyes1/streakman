"use client";

const MOCK_BADGES = [
  { id: 1, name: "Week Warrior", icon: "🏆", description: "7 days streak" },
  { id: 2, name: "Early Bird", icon: "🌅", description: "Completed before 7am" },
  { id: 3, name: "Consistency King", icon: "👑", description: "21 days streak" },
];

export default function BadgeDisplay() {
  return (
    <div className="bg-[#1E293B] rounded-2xl border border-[#334155] p-5">
      <h3 className="text-lg font-semibold mb-4 text-[#F1F5F9]">Recent Badges</h3>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {MOCK_BADGES.map((badge) => (
          <div
            key={badge.id}
            className="bg-[#0F172A] rounded-xl border-2 border-[#F59E0B] p-3 text-center transition-transform hover:scale-105 cursor-pointer"
          >
            <div className="text-3xl mb-2">{badge.icon}</div>
            <p className="text-xs font-semibold text-[#F1F5F9] mb-1">{badge.name}</p>
            <p className="text-xs text-[#94A3B8]">{badge.description}</p>
          </div>
        ))}
      </div>

      <button className="w-full text-sm text-[#60A5FA] hover:text-[#3B82F6] font-semibold transition-colors">
        View All →
      </button>
    </div>
  );
}
