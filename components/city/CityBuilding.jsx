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
  const stateClass = `state-${buildingState || "new"}`;
  const isLandmark = buildingState === "landmark";

  return (
    <button
      type="button"
      onClick={() => onClick?.(task)}
      className={`glass-card city-building-card ${stateClass} min-h-[108px] w-full transition-spring hover:-translate-y-0.5 ${
        task?.completedToday ? "city-unlock" : ""
      }`}
      aria-label={`Open ${task?.name || "building"} details`}
    >
      <span className="city-building-emoji-wrap">
        <span className={`city-building-emoji ${sizeClass} ${animationClass}`}>{buildingEmoji}</span>
      </span>

      <div className="city-building-platform" />

      <div className="mt-2 flex items-center gap-[3px]">
        {Array.from({ length: 5 }).map((_, index) => {
          const filled = index < buildingLevel;
          return (
            <span
              key={`${task?.id || "building"}-dot-${index}`}
              className={
                filled
                  ? `city-building-level-dot ${isLandmark ? "state-landmark" : "state-standard"}`
                  : "city-building-level-dot-empty"
              }
            />
          );
        })}
      </div>
    </button>
  );
}
