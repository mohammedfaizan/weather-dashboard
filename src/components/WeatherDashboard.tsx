import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchWeather, clearError } from "../features/weather/weatherSlice";
import type { RootState, AppDispatch } from "../app/store";


//mock data for welcome screen
const mockWeatherData = {
  name: "Sunny City",
  sys: { country: "US" },
  weather: [
    {
      main: "Clear",
      description: "sunny",
      icon: "01d"
    }
  ],
  main: {
    temp: 30,
    feels_like: 32,
    humidity: 45,
    pressure: 1012
  },
  wind: {
    speed: 5.5,
    deg: 180
  },
  clouds: {
    all: 0
  },
  visibility: 10000
};

export default function WeatherDashboard() {
  const [city, setCity] = useState("");
  const [showWelcome, setShowWelcome] = useState(true);
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error, history } = useSelector(
    (state: RootState) => state.weather
  );

  useEffect(() => {
    const lastCity = localStorage.getItem('lastViewedCity');
    if (lastCity) {
      dispatch(fetchWeather(lastCity));
      setShowWelcome(false);
    } else {
      setShowWelcome(true);
    }
  }, [dispatch]);

  useEffect(() => {
    if (data?.name) {
      localStorage.setItem('lastViewedCity', data.name);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      dispatch(clearError());
    }
  }, [city, dispatch, error]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      dispatch(fetchWeather(city));
      setCity("");
      setShowWelcome(false);
    }
  };

  const handleHistoryClick = (city: string) => {
    setCity(city);
    dispatch(fetchWeather(city));
    setShowWelcome(false);
  };

  const convertToCelsius = (fahrenheit: number) => {
    return Math.round((fahrenheit - 32) * 5/9);
  };

  const getWindDirection = (degrees: number) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(((degrees %= 360) < 0 ? degrees + 360 : degrees) / 22.5) % 16;
    return directions[index];
  };

  const renderWeatherCard = (weatherData: any) => {
    const weatherIcon = weatherData.weather?.[0]?.icon;
    const tempC = weatherData.main?.temp ? convertToCelsius(weatherData.main.temp) : null;
    const feelsLikeC = weatherData.main?.feels_like ? convertToCelsius(weatherData.main.feels_like) : null;

    return (
      <div className="relative overflow-hidden rounded-xl shadow-lg mb-6 group">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 h-full"
          style={{ 
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
        </div>
        
        <div className="relative z-10 p-6 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start mb-4">
            <div className="mb-4 md:mb-0">
              <h2 className="text-3xl font-bold">
                {weatherData.name || 'N/A'}, {weatherData.sys?.country || ''}
              </h2>
              <p className="text-lg opacity-90">
                {new Date().toLocaleDateString('en-IN', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="text-left md:text-right">
              <div className="text-5xl font-bold">
                {tempC !== null ? `${tempC}°C` : 'N/A'}
              </div>
              {weatherData.weather?.[0]?.description && (
                <p className="text-lg capitalize">
                  {weatherData.weather[0].description}
                </p>
              )}
            </div>
          </div>

          {weatherIcon && (
            <div className="flex items-center justify-center my-6">
              <img 
                src={`https://openweathermap.org/img/wn/${weatherIcon}@4x.png`} 
                alt={weatherData.weather?.[0]?.main || 'Weather icon'}
                className="w-32 h-32 drop-shadow-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://openweathermap.org/img/wn/01d@4x.png';
                }}
              />
            </div>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/30 backdrop-blur-md p-4 rounded-lg text-center border border-white/20 shadow-lg">
              <div className="text-sm font-medium text-white/90">Feels Like</div>
              <div className="text-2xl font-bold text-white">
                {feelsLikeC !== null ? `${feelsLikeC}°C` : 'N/A'}
              </div>
            </div>
            <div className="bg-white/30 backdrop-blur-md p-4 rounded-lg text-center border border-white/20 shadow-lg">
              <div className="text-sm font-medium text-white/90">Humidity</div>
              <div className="text-2xl font-bold text-white">
                {weatherData.main?.humidity ? `${weatherData.main.humidity}%` : 'N/A'}
              </div>
            </div>
            <div className="bg-white/30 backdrop-blur-md p-4 rounded-lg text-center border border-white/20 shadow-lg">
              <div className="text-sm font-medium text-white/90">Wind</div>
              <div className="text-2xl font-bold text-white">
                {weatherData.wind?.speed ? `${weatherData.wind.speed.toFixed(1)} m/s` : 'N/A'}
              </div>
            </div>
            <div className="bg-white/30 backdrop-blur-md p-4 rounded-lg text-center border border-white/20 shadow-lg">
              <div className="text-sm font-medium text-white/90">Pressure</div>
              <div className="text-2xl font-bold text-white">
                {weatherData.main?.pressure ? `${weatherData.main.pressure} hPa` : 'N/A'}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/30 backdrop-blur-md p-4 rounded-lg border border-white/20 shadow-lg">
              <div className="text-sm font-medium text-white/90">Visibility</div>
              <div className="text-lg font-bold text-white">
                {weatherData.visibility ? `${(weatherData.visibility / 1000).toFixed(1)} km` : 'N/A'}
              </div>
            </div>
            <div className="bg-white/30 backdrop-blur-md p-4 rounded-lg border border-white/20 shadow-lg">
              <div className="text-sm font-medium text-white/90">Cloud Cover</div>
              <div className="text-lg font-bold text-white">
                {weatherData.clouds?.all !== undefined ? `${weatherData.clouds.all}%` : 'N/A'}
              </div>
            </div>
            <div className="bg-white/30 backdrop-blur-md p-4 rounded-lg border border-white/20 shadow-lg">
              <div className="text-sm font-medium text-white/90">Wind Direction</div>
              <div className="text-lg font-bold text-white">
                {weatherData.wind?.deg ? `${getWindDirection(weatherData.wind.deg)} (${weatherData.wind.deg}°)` : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-blue-800 mb-2">
          Weather Dashboard
        </h1>
        <p className="text-center text-blue-600 mb-8">Check the weather anywhere in the world</p>
        
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 mb-8">
          <input
            type="text"
            className="flex-1 border-2 border-blue-200 rounded-xl p-4 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
            placeholder="Enter city name..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button
            type="submit"
            className={`px-8 py-4 rounded-xl font-bold text-white text-lg transition-all ${
              loading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0'
            }`}
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {showWelcome ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Welcome to Weather Dashboard</h2>
            <p className="text-gray-600 mb-6">Search for a city to see the current weather</p>
            
            <div className="mt-8 max-w-2xl mx-auto">
              <div className="text-left mb-4">
                <p className="text-sm text-gray-500">Search for a city to see real weather data</p>
              </div>
              {renderWeatherCard(mockWeatherData)}
            </div>
            
            {history.length > 0 && (
              <div className="mt-8">
                <p className="text-gray-600 mb-2">Or select from your recent searches:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {history.map((city, index) => (
                    <button
                      key={index}
                      onClick={() => handleHistoryClick(city)}
                      className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-full text-sm font-medium transition-colors"
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {data && renderWeatherCard(data)}
            {history.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Recent Searches</h3>
                <div className="flex flex-wrap gap-2">
                  {history.map((city, index) => (
                    <button
                      key={index}
                      onClick={() => handleHistoryClick(city)}
                      className="px-4 py-2 bg-white hover:bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200 transition-colors"
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
