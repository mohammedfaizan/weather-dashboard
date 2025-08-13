import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface WeatherState {
  data: any | null;
  loading: boolean;
  error: string | null;
  history: string[];
}

const initialState: WeatherState = {
  data: null,
  loading: false,
  error: null,
  history: [],
};

export const fetchWeather = createAsyncThunk(
  "weather/fetchWeather",
  async (city: string) => {
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
    return response.data;
  }
);

const weatherSlice = createSlice({
  name: "weather",
  initialState,
  reducers: {},
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
        if (!state.history.includes(city)) {
          state.history.unshift(city);
          if (state.history.length > 5) state.history.pop();
        }
      })
      .addCase(fetchWeather.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch weather";
      });
  },
});

export default weatherSlice.reducer;
