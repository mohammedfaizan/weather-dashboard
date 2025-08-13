import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchWeather } from "../features/weather/weatherSlice";
import type { RootState, AppDispatch } from "../app/store";

export default function WeatherDashboard() {
  const [city, setCity] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error, history } = useSelector(
    (state: RootState) => state.weather
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) dispatch(fetchWeather(city));
  };

  return (
    <div className="max-w-lg mx-auto bg-white rounded shadow p-4 mt-8">
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          type="text"
          className="flex-1 border rounded p-2"
          placeholder="Enter city name..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          Search
        </button>
      </form>

      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {data && (
        <div>
          <h2 className="text-2xl font-semibold mb-2">
            {data.name}, {data.sys?.country}
          </h2>
          <div>Weather: {data.weather?.[0]?.main}</div>
          <div>Temperature: {data.main?.temp}°C</div>
          <div>Humidity: {data.main?.humidity}%</div>
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">History:</h3>
          <ul className="flex gap-2 flex-wrap">
            {history.map((h, i) => (
              <li key={i} className="bg-gray-100 rounded px-2">
                {h}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
