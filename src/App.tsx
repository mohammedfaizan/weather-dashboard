import WeatherDashboard from './components/WeatherDashboard'

const App = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-center pt-8">Weather DashBoard</h1>
      <WeatherDashboard/>
    </div>
  );
};

export default App;
