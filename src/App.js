import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { FaCompass, FaSun, FaMoon } from 'react-icons/fa';
import './App.css';

function App() {
  const [sensorData, setSensorData] = useState({
    weight: 0,        // kg/tons
    windSpeed: 0,     // m/s
    stability: 0,     // % (for system health)
    boomAngle: 0,     // °
    swingSpeed: 0,    // °/s
    energyConsumption: 0, // kW (optional)
    systemHealth: true,   // Boolean (true = safe, false = danger)
  });
  const [alerts, setAlerts] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [activeSection, setActiveSection] = useState('Load Monitoring');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setSensorData({
        weight: data.weight || Math.random() * (1000 - 100) + 100,
        windSpeed: data.windSpeed || Math.random() * (20 - 0) + 0,
        stability: data.stability || Math.random() * (100 - 50) + 50,
        boomAngle: data.boomAngle || Math.random() * (90 - 0) + 0,
        swingSpeed: data.swingSpeed || Math.random() * (5 - 0) + 0,
        energyConsumption: data.energyConsumption || Math.random() * (100 - 10) + 10,
        systemHealth: (data.stability || Math.random() * (100 - 50) + 50) > 70 && (data.windSpeed || Math.random() * (20 - 0) + 0) < 15,
      });
      setChartData((prev) => {
        const newData = [...prev, { time: new Date().toLocaleTimeString(), ...sensorData }];
        return newData.slice(-10); // Keep last 10 entries
      });
      const riskLevel = getRiskLevel(data.windSpeed || Math.random() * (20 - 0) + 0, data.stability || Math.random() * (100 - 50) + 50, data.weight || Math.random() * (1000 - 100) + 100);
      if (riskLevel === 'High' || (data.windSpeed || Math.random() * (20 - 0) + 0) > 15 || (data.stability || Math.random() * (100 - 50) + 50) < 70 || (data.weight || Math.random() * (1000 - 100) + 100) > 900) {
        setAlerts((prev) => [...prev, `Critical Warning: ${riskLevel} - ${getAlertMessage(data)}`].slice(-5));
      }
    };
    return () => ws.close();
  }, [sensorData]); // Fixed ESLint warning by adding sensorData to dependencies

  const getRiskLevel = (windSpeed, stability, weight) => {
    if (windSpeed > 15 || stability < 70 || weight > 900) return 'High';
    if (windSpeed > 10 || stability < 85 || weight > 800) return 'Medium';
    return 'Low';
  };

  const getAlertMessage = (data) => {
    let message = '';
    if ((data.windSpeed || 0) > 15) message += 'High Wind Speed, ';
    if ((data.stability || 0) < 70) message += 'Low Stability, ';
    if ((data.weight || 0) > 900) message += 'Overload, ';
    return message.trim() || 'No specific issue';
  };

  const handleNavClick = (section) => setActiveSection(section);
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleStopOperation = () => {
    setAlerts((prev) => [...prev, 'Operation Stopped - Safety Protocol Engaged'].slice(-5));
    alert('Operation Stopped - Safety Protocol Engaged');
  };
  
  const handleRebalanceLoad = () => {
    setAlerts((prev) => [...prev, 'Load Rebalanced - Recalculating Stability'].slice(-5));
    alert('Load Rebalanced - Recalculating Stability');
  };

  const randomWindDirection = () => Math.floor(Math.random() * 360);

  return (
    <div className={`flex h-screen font-sans ${isDarkMode ? 'dark' : ''}`}>
      {/* Sidebar (Left) */}
      <aside className={`w-64 p-4 shadow-lg ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-blue-100 text-gray-800'}`}>
        <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-blue-200' : 'text-blue-600'}`}>SmartGuard</h2>
        <nav>
          <ul className="space-y-4">
            <li>
              <button
                onClick={() => handleNavClick('Load Monitoring')}
                className={`w-full text-left p-2 rounded hover:bg-${isDarkMode ? 'gray-700' : 'blue-200'} ${activeSection === 'Load Monitoring' ? `bg-${isDarkMode ? 'gray-700' : 'blue-200'}` : ''}`}
              >
                Load Monitoring
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavClick('AI Alerts')}
                className={`w-full text-left p-2 rounded hover:bg-${isDarkMode ? 'gray-700' : 'blue-200'} ${activeSection === 'AI Alerts' ? `bg-${isDarkMode ? 'gray-700' : 'blue-200'}` : ''}`}
              >
                AI Alerts
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavClick('Reports')}
                className={`w-full text-left p-2 rounded hover:bg-${isDarkMode ? 'gray-700' : 'blue-200'} ${activeSection === 'Reports' ? `bg-${isDarkMode ? 'gray-700' : 'blue-200'}` : ''}`}
              >
                Reports
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavClick('Settings')}
                className={`w-full text-left p-2 rounded hover:bg-${isDarkMode ? 'gray-700' : 'blue-200'} ${activeSection === 'Settings' ? `bg-${isDarkMode ? 'gray-700' : 'blue-200'}` : ''}`}
              >
                Settings
              </button>
            </li>
            {/* Operator Control in Sidebar */}
            <li className="mt-4">
              <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>Operator Control</h3>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={handleStopOperation}
                  className={`bg-red-600 text-white px-4 py-2 rounded hover:bg-red-500 ${isDarkMode ? 'hover:bg-red-700' : ''}`}
                >
                  Stop Operation
                </button>
                <button
                  onClick={handleRebalanceLoad}
                  className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500 ${isDarkMode ? 'hover:bg-blue-700' : ''}`}
                >
                  Rebalance Load
                </button>
              </div>
            </li>
            {/* Theme Toggle */}
            <li className="mt-4">
              <button
                onClick={toggleTheme}
                className={`w-full p-2 rounded flex items-center justify-center space-x-2 hover:bg-${isDarkMode ? 'gray-700' : 'blue-200'}`}
              >
                {isDarkMode ? <FaSun className="text-yellow-300" /> : <FaMoon className="text-gray-300" />}
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-800'}>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Panel */}
      <div className={`flex-1 flex flex-col ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-800'}`}>
        {/* Top Navbar */}
        <nav className={`bg-${isDarkMode ? 'gray-800' : 'gray-100'} p-4 shadow-md flex justify-between items-center border-b border-${isDarkMode ? 'gray-700' : 'gray-300'}`}>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-blue-200' : 'text-gray-800'}`}>SmartGuard Dashboard</h1>
          <div className="flex items-center space-x-4">
            <input type="text" placeholder="Search..." className={`p-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} />
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>SmartGuard v1.0</span>
            <button className={`bg-${isDarkMode ? 'blue-700' : 'blue-500'} text-white p-2 rounded hover:bg-${isDarkMode ? 'blue-800' : 'blue-600'}`}>Notifications</button>
          </div>
        </nav>

        {/* Main Content */}
        <main className={`flex-1 p-4 overflow-auto grid grid-cols-1 lg:grid-cols-2 gap-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-200'}`}>
          {activeSection === 'Load Monitoring' && (
            <div className="space-y-4">
              <h2 className={`text-3xl font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>Load Monitoring</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Load Monitoring (Gauge + Line Chart) */}
                <div className={`bg-${isDarkMode ? 'gray-800' : 'white'} p-4 rounded-lg shadow-md`}>
                  <h3 className={`text-xl font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>Load (kg)</h3>
                  <div className="w-full h-40 flex justify-center items-center">
                    <CircularProgressbar
                      value={sensorData.weight / 10} // Normalize to 0-100 for visual representation (max 1000 kg)
                      text={`${sensorData.weight.toFixed(1)} kg`}
                      styles={buildStyles({
                        pathColor: `rgba(${sensorData.weight > 900 ? 255 : 78}, ${sensorData.weight > 900 ? 165 : 205}, ${sensorData.weight > 900 ? 107 : 209}, 1)`,
                        textColor: isDarkMode ? '#FFFFFF' : '#000000',
                        trailColor: isDarkMode ? '#444' : '#d6d6d6',
                        backgroundColor: '#3e98c7',
                      })}
                    />
                  </div>
                </div>
                <div className={`bg-${isDarkMode ? 'gray-800' : 'white'} p-4 rounded-lg shadow-md`}>
                  <h3 className={`text-xl font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>Load Trends</h3>
                  <LineChart width={400} height={200} data={chartData} margin={{ top: 5, right: 20, bottom: 30, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#555' : '#ccc'} />
                    <XAxis dataKey="time" stroke={isDarkMode ? '#FFFFFF' : '#333'} angle={-30} textAnchor="end" interval={0} height={40} />
                    <YAxis stroke={isDarkMode ? '#FFFFFF' : '#333'} />
                    <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#333' : '#fff', color: isDarkMode ? '#FFFFFF' : '#000' }} />
                    <Legend wrapperStyle={{ color: isDarkMode ? '#FFFFFF' : '#000' }} />
                    <Line type="monotone" dataKey="weight" stroke="#3b82f6" name="Load (kg)" strokeWidth={2} />
                  </LineChart>
                </div>
                {/* Wind Speed (Gauge + Wind Direction) */}
                <div className={`bg-${isDarkMode ? 'gray-800' : 'white'} p-4 rounded-lg shadow-md`}>
                  <h3 className={`text-xl font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>Wind Speed (m/s)</h3>
                  <div className="w-full h-40 flex justify-center items-center">
                    <CircularProgressbar
                      value={sensorData.windSpeed / 0.2} // Normalize to 0-100 for visual representation (max 20 m/s)
                      text={`${sensorData.windSpeed.toFixed(1)} m/s`}
                      styles={buildStyles({
                        pathColor: `rgba(${sensorData.windSpeed > 15 ? 255 : 78}, ${sensorData.windSpeed > 15 ? 165 : 205}, ${sensorData.windSpeed > 15 ? 107 : 209}, 1)`,
                        textColor: isDarkMode ? '#FFFFFF' : '#000000',
                        trailColor: isDarkMode ? '#444' : '#d6d6d6',
                        backgroundColor: '#3e98c7',
                      })}
                    />
                  </div>
                  <div className="mt-4 flex justify-center">
                    <FaCompass className={`text-4xl ${isDarkMode ? 'text-blue-300' : 'text-blue-500'}`} style={{ transform: `rotate(${randomWindDirection()}deg)` }} />
                  </div>
                </div>
                {/* Boom Angle (Line Chart + Aesthetic Indicator) */}
                <div className={`bg-${isDarkMode ? 'gray-800' : 'white'} p-4 rounded-lg shadow-md`}>
                  <h3 className={`text-xl font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>Boom Angle (°)</h3>
                  <LineChart width={400} height={200} data={chartData} margin={{ top: 5, right: 20, bottom: 30, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#555' : '#ccc'} />
                    <XAxis dataKey="time" stroke={isDarkMode ? '#FFFFFF' : '#333'} angle={-30} textAnchor="end" interval={0} height={40} />
                    <YAxis stroke={isDarkMode ? '#FFFFFF' : '#333'} />
                    <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#333' : '#fff', color: isDarkMode ? '#FFFFFF' : '#000' }} />
                    <Legend wrapperStyle={{ color: isDarkMode ? '#FFFFFF' : '#000' }} />
                    <Line type="monotone" dataKey="boomAngle" stroke="#9333ea" name="Boom Angle (°)" strokeWidth={2} />
                  </LineChart>
                  <div className="mt-4 flex justify-center">
                    <div className="relative w-32 h-32 bg-${isDarkMode ? 'gray-700' : 'gray-100'} rounded-full shadow-lg p-4 border-${isDarkMode ? 'gray-600' : 'gray-300'} border-4">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div
                          className={`w-2 h-16 ${isDarkMode ? 'bg-blue-300' : 'bg-blue-500'} rounded`}
                          style={{
                            transform: `rotate(${sensorData.boomAngle}deg)`,
                            transformOrigin: 'center',
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Swing Speed (Line Chart + Speed Meter) */}
                <div className={`bg-${isDarkMode ? 'gray-800' : 'white'} p-4 rounded-lg shadow-md`}>
                  <h3 className={`text-xl font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>Swing Speed (°/s)</h3>
                  <LineChart width={400} height={200} data={chartData} margin={{ top: 5, right: 20, bottom: 30, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#555' : '#ccc'} />
                    <XAxis dataKey="time" stroke={isDarkMode ? '#FFFFFF' : '#333'} angle={-30} textAnchor="end" interval={0} height={40} />
                    <YAxis stroke={isDarkMode ? '#FFFFFF' : '#333'} />
                    <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#333' : '#fff', color: isDarkMode ? '#FFFFFF' : '#000' }} />
                    <Legend wrapperStyle={{ color: isDarkMode ? '#FFFFFF' : '#000' }} />
                    <Line type="monotone" dataKey="swingSpeed" stroke="#f59e0b" name="Swing Speed (°/s)" strokeWidth={2} />
                  </LineChart>
                  <div className="mt-4 flex justify-center">
                    <CircularProgressbar
                      value={sensorData.swingSpeed / 0.05} // Normalize to 0-100 for visual representation (max 5 °/s)
                      text={`${sensorData.swingSpeed.toFixed(1)} °/s`}
                      styles={buildStyles({
                        pathColor: `rgba(${sensorData.swingSpeed > 3 ? 255 : 78}, ${sensorData.swingSpeed > 3 ? 165 : 205}, ${sensorData.swingSpeed > 3 ? 107 : 209}, 1)`,
                        textColor: isDarkMode ? '#FFFFFF' : '#000000',
                        trailColor: isDarkMode ? '#444' : '#d6d6d6',
                        backgroundColor: '#3e98c7',
                      })}
                    />
                  </div>
                </div>
                {/* Energy Consumption (Bar Chart + Power Meter) */}
                <div className={`bg-${isDarkMode ? 'gray-800' : 'white'} p-4 rounded-lg shadow-md`}>
                  <h3 className={`text-xl font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>Energy Consumption (kW)</h3>
                  <BarChart width={400} height={200} data={chartData} margin={{ top: 5, right: 20, bottom: 30, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#555' : '#ccc'} />
                    <XAxis dataKey="time" stroke={isDarkMode ? '#FFFFFF' : '#333'} angle={-30} textAnchor="end" interval={0} height={40} />
                    <YAxis stroke={isDarkMode ? '#FFFFFF' : '#333'} />
                    <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#333' : '#fff', color: isDarkMode ? '#FFFFFF' : '#000' }} />
                    <Legend wrapperStyle={{ color: isDarkMode ? '#FFFFFF' : '#000' }} />
                    <Bar dataKey="energyConsumption" fill="#14b8a6" name="Energy (kW)" />
                  </BarChart>
                  <div className="mt-4 flex justify-center">
                    <CircularProgressbar
                      value={sensorData.energyConsumption} // Normalize to 0-100 for visual representation (max 100 kW)
                      text={`${sensorData.energyConsumption.toFixed(1)} kW`}
                      styles={buildStyles({
                        pathColor: `rgba(${sensorData.energyConsumption > 90 ? 255 : 20}, ${sensorData.energyConsumption > 90 ? 184 : 166}, ${sensorData.energyConsumption > 90 ? 166 : 86}, 1)`,
                        textColor: isDarkMode ? '#FFFFFF' : '#000000',
                        trailColor: isDarkMode ? '#444' : '#d6d6d6',
                        backgroundColor: '#3e98c7',
                      })}
                    />
                  </div>
                </div>
              </div>
              {/* System Health Status */}
              <div className={`bg-${isDarkMode ? 'gray-800' : 'white'} p-4 rounded-lg shadow-md mt-4`}>
                <h3 className={`text-xl font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>System Health Status</h3>
                <div className="flex items-center space-x-4">
                  <span className={`w-4 h-4 rounded-full ${sensorData.systemHealth ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                    {sensorData.systemHealth ? 'Safe' : 'Danger'} - Last Update: {new Date().toLocaleTimeString()}
                  </span>
                </div>
                <p className={`text-${isDarkMode ? 'gray-500' : 'gray-600'} mt-2`}>Logs: System {sensorData.systemHealth ? 'stable' : 'unstable'} due to current conditions.</p>
              </div>
            </div>
          )}

          {activeSection === 'AI Alerts' && (
            <div className={`alerts-section space-y-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-200'}`}>
              <h2 className={`text-3xl font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>AI Alerts & Critical Warnings</h2>
              <div className={`bg-${isDarkMode ? 'gray-800' : 'white'} p-6 rounded-lg shadow-md`}>
                <h3 className={`text-xl font-medium mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>Current Risk Level: {getRiskLevel(sensorData.windSpeed, sensorData.stability, sensorData.weight)}</h3>
                {alerts.length > 0 ? (
                  <div className="space-y-2">
                    <h4 className={`text-lg font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>Live Alerts</h4>
                    <ul className="space-y-2">
                      {alerts.slice(-5).map((alert, idx) => (
                        <li key={idx} className={`text-red-400 bg-${isDarkMode ? 'gray-700' : 'red-100'} p-2 rounded`}>
                          {alert} - {new Date().toLocaleTimeString()}
                        </li>
                      ))}
                    </ul>
                    <h4 className={`text-lg font-medium mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>Alert History</h4>
                    <ul className="space-y-2 text-gray-500">
                      {alerts.slice(-10).map((alert, idx) => (
                        <li key={idx} className="text-sm">{alert} - {new Date().toLocaleTimeString()}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className={`text-${isDarkMode ? 'gray-500' : 'gray-500'}`}>No critical warnings at this time.</p>
                )}
              </div>
            </div>
          )}

          {activeSection === 'Reports' && (
            <div className={`reports-section space-y-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-200'}`}>
              <h2 className={`text-3xl font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>Historical Reports</h2>
              <div className={`bg-${isDarkMode ? 'gray-800' : 'white'} p-6 rounded-lg shadow-md`}>
                <p className={`text-${isDarkMode ? 'gray-500' : 'gray-700'} mb-4`}>View historical data for crane operations (coming soon).</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <PieChart width={400} height={300}>
                    <Pie
                      data={[
                        { name: 'Safe Operations', value: 75 },
                        { name: 'Alerts', value: 25 },
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#333' : '#fff', color: isDarkMode ? '#FFFFFF' : '#000' }} />
                      <Legend wrapperStyle={{ color: isDarkMode ? '#FFFFFF' : '#000' }} />
                      <Cell fill={isDarkMode ? '#82ca9d' : '#82ca9d'} />
                      <Cell fill={isDarkMode ? '#ffc658' : '#ffc658'} />
                    </Pie>
                  </PieChart>
                  <BarChart width={400} height={300} data={chartData.slice(-7)} margin={{ top: 5, right: 20, bottom: 30, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#555' : '#ccc'} />
                    <XAxis dataKey="time" stroke={isDarkMode ? '#FFFFFF' : '#333'} angle={-30} textAnchor="end" interval={0} height={40} />
                    <YAxis stroke={isDarkMode ? '#FFFFFF' : '#333'} />
                    <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#333' : '#fff', color: isDarkMode ? '#FFFFFF' : '#000' }} />
                    <Legend wrapperStyle={{ color: isDarkMode ? '#FFFFFF' : '#000' }} />
                    <Bar dataKey="weight" fill="#3b82f6" name="Load (kg)" />
                    <Bar dataKey="windSpeed" fill="#10b981" name="Wind Speed (m/s)" />
                  </BarChart>
                </div>
                <button className={`mt-4 bg-${isDarkMode ? 'blue-700' : 'blue-600'} text-white px-4 py-2 rounded hover:bg-${isDarkMode ? 'blue-800' : 'blue-700'}`}>
                  Generate Report
                </button>
              </div>
            </div>
          )}

          {activeSection === 'Settings' && (
            <div className={`settings-section space-y-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-200'}`}>
              <h2 className={`text-3xl font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>Settings</h2>
              <div className={`bg-${isDarkMode ? 'gray-800' : 'white'} p-6 rounded-lg shadow-md`}>
                <p className={`text-${isDarkMode ? 'gray-500' : 'gray-700'} mb-4`}>Configure thresholds, alerts, and system preferences.</p>
                <div className="space-y-4">
                  <div>
                    <label className={`block ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>Wind Speed Threshold (m/s)</label>
                    <input type="number" defaultValue="15" className={`p-2 border rounded w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} />
                  </div>
                  <div>
                    <label className={`block ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>Stability Threshold (%)</label>
                    <input type="number" defaultValue="70" className={`p-2 border rounded w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} />
                  </div>
                  <div>
                    <label className={`block ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>Load Threshold (kg)</label>
                    <input type="number" defaultValue="900" className={`p-2 border rounded w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} />
                  </div>
                  <div>
                    <label className={`block ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>Swing Speed Threshold (°/s)</label>
                    <input type="number" defaultValue="3" className={`p-2 border rounded w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} />
                  </div>
                </div>
                <button className={`mt-4 bg-${isDarkMode ? 'blue-700' : 'blue-600'} text-white px-4 py-2 rounded hover:bg-${isDarkMode ? 'blue-800' : 'blue-700'}`}>
                  Save Settings
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;