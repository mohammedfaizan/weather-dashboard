import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface WeatherState {
  data: any | null;
  loading: boolean;
  error: string | null;
  history: string[];
}

const loadHistory = (): string[] => {
  try {
    const saved = localStorage.getItem('weatherHistory');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error('Failed to load history from localStorage', e);
    return [];
  }
};

const initialState: WeatherState = {
  data: null,
  loading: false,
  error: null,
  history: loadHistory(),
};

export const fetchWeather = createAsyncThunk(
  "weather/fetchWeather",
  async (city: string, { rejectWithValue }) => {
    try {
      const options = {
        method: 'GET',
        url: 'https://open-weather13.p.rapidapi.com/city',
        params: {
          city: city,
          lang: 'EN',
          units: 'metric'
        },
        headers: {
          'x-rapidapi-key': import.meta.env.VITE_OPENWEATHER_API_KEY,
          'x-rapidapi-host': 'open-weather13.p.rapidapi.com'
        }
      };
      const response = await axios.request(options);
      
      if (!response.data || !response.data.name) {
        throw new Error('Invalid response from weather service');
      }
      
      return response.data;
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 429) {
          return rejectWithValue('API rate limit exceeded. Please wait a moment before trying again.');
        } else if (error.response.status === 404) {
          return rejectWithValue('City not found. Please try another location.');
        } else {
          return rejectWithValue('Unable to fetch weather data. Please try again later.');
        }
      } else if (error.request) {
        return rejectWithValue('Unable to connect to the weather service. Please check your internet connection.');
      } else {
        return rejectWithValue('An unexpected error occurred. Please try again.');
      }
    }
  }
);

const weatherSlice = createSlice({
  name: "weather",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWeather.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWeather.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
        const city = action.payload.name;
        
        if (city && !state.history.includes(city)) {
          const newHistory = [city, ...state.history].slice(0, 5);
          state.history = newHistory;
          
          try {
            localStorage.setItem('weatherHistory', JSON.stringify(newHistory));
          } catch (e) {
            console.error('Failed to save history to localStorage', e);
          }
        }
      })
      .addCase(fetchWeather.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'An error occurred while fetching weather data';
      });
  },
});

export const { clearError } = weatherSlice.actions;
export default weatherSlice.reducer;
