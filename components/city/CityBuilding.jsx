"use client";

const LEVEL_SIZE_CLASS = {
  1: "text-2xl",
  2: "text-3xl",
  3: "text-4xl",
  4: "text-5xl",
  5: "text-6xl",
};

function getAnimationClass(buildingType, buildingState, completedToday) {
  if (!completedToday) return "";
  if (buildingState === "landmark") return "city-landmark";
  if (buildingType === "gym" && (buildingState === "active" || buildingState === "thriving")) return "city-gym";
  if (buildingType === "library" && (buildingState === "active" || buildingState === "thriving")) return "city-library";
  if (buildingType === "home" && (buildingState === "active" || buildingState === "thriving")) return "city-home";
  return "";
}

export default function CityBuilding({
  task,
  buildingType,
  buildingState,
  buildingLevel,
  buildingEmoji,
  onClick,
}) {
  const sizeClass = LEVEL_SIZE_CLASS[buildingLevel] || LEVEL_SIZE_CLASS[1];
  const animationClass = getAnimationClass(buildingType, buildingState, task?.completedToday);
  const isDark = buildingState === "dark";

  return (
    <button
      type="button"
      onClick={() => onClick?.(task)}
      className={`glass-card flex min-h-[108px] w-full flex-col items-center justify-center rounded-2xl p-2 transition-spring hover:-translate-y-0.5 ${
        task?.completedToday ? "city-unlock" : ""
      }`}
      aria-label={`Open ${task?.name || "building"} details`}
    >
      <span
        className={`${sizeClass} ${animationClass} ${isDark ? "opacity-30 grayscale" : ""}`}
      >
        {buildingEmoji}
      </span>
      <div className="mt-2 flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, index) => {
          const filled = index < buildingLevel;
          return (
            <span
              key={`${task?.id || "building"}-dot-${index}`}
              className={`h-1.5 w-1.5 rounded-full ${filled ? "bg-teal-300" : "bg-white/20"}`}
            />
          );
        })}
      </div>
    </button>
  );
}
