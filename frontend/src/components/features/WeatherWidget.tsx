import { useEffect, useState } from 'react';
import { Cloud, Sun, CloudRain, Wind, Thermometer } from 'lucide-react';

interface WeatherWidgetProps {
  lat: number;
  lng: number;
}

interface WeatherData {
  current_weather: {
    temperature: number;
    windspeed: number;
    weathercode: number;
  };
  daily: {
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    time: string[];
    weathercode: number[];
  };
}

export function WeatherWidget({ lat, lng }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`
        );
        const data = await response.json();
        setWeather(data);
      } catch (error) {
        console.error('Failed to fetch weather', error);
      } finally {
        setLoading(false);
      }
    }
    
    if (lat && lng) {
      fetchWeather();
    }
  }, [lat, lng]);

  const getWeatherIcon = (code: number) => {
    if (code <= 1) return <Sun className="w-8 h-8 text-yellow-500" />;
    if (code <= 3) return <Cloud className="w-8 h-8 text-gray-500" />;
    if (code <= 67) return <CloudRain className="w-8 h-8 text-blue-500" />;
    return <Wind className="w-8 h-8 text-blue-300" />;
  };

  const getWeatherLabel = (code: number) => {
    if (code <= 1) return 'Sunny';
    if (code <= 3) return 'Cloudy';
    if (code <= 67) return 'Rainy';
    return 'Windy';
  };

  if (loading) return <div className="animate-pulse h-32 bg-gray-100 rounded-xl"></div>;
  if (!weather) return null;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Thermometer className="w-5 h-5 text-red-500" /> 
        Local Weather
      </h3>
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {getWeatherIcon(weather.current_weather.weathercode)}
          <div>
            <div className="text-3xl font-bold text-gray-900">
              {Math.round(weather.current_weather.temperature)}°C
            </div>
            <div className="text-sm text-gray-500">
              {getWeatherLabel(weather.current_weather.weathercode)}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Wind</div>
          <div className="font-medium">{weather.current_weather.windspeed} km/h</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 border-t pt-4">
        {weather.daily.time.slice(1, 4).map((date, i) => (
          <div key={date} className="text-center">
            <div className="text-xs text-gray-500 mb-1">
              {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
            </div>
            <div className="flex justify-center mb-1">
              {getWeatherIcon(weather.daily.weathercode[i + 1])}
            </div>
            <div className="text-sm font-medium">
              {Math.round(weather.daily.temperature_2m_max[i + 1])}°
              <span className="text-gray-400 text-xs ml-1">
                {Math.round(weather.daily.temperature_2m_min[i + 1])}°
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
