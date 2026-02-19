"use client";

export default function CityWeather({ weather }) {
  return (
    <div
      className={`city-weather-layer city-weather-${weather || "cloudy"}`}
      aria-hidden="true"
    />
  );
}
