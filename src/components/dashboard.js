import { useEffect, useState } from "react";
import io from "socket.io-client";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const socket = io("http://localhost:5000"); // Backend Server URL

const Dashboard = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    socket.on("sensorData", (newData) => {
      setData((prevData) => [...prevData, newData]);
    });

    return () => socket.off("sensorData");
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">SmartGuard Dashboard</h1>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Load Chart */}
        <div className="bg-white shadow-md p-4 rounded-lg">
          <h2 className="text-lg font-semibold">Load Monitoring</h2>
          <LineChart width={400} height={250} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="load" stroke="#8884d8" />
          </LineChart>
        </div>

        {/* Wind Speed */}
        <div className="bg-white shadow-md p-4 rounded-lg">
          <h2 className="text-lg font-semibold">Wind Speed</h2>
          <p className="text-xl font-bold text-red-500">{data[data.length - 1]?.windSpeed} m/s</p>
        </div>

        {/* Safety Alerts */}
        <div className="bg-white shadow-md p-4 rounded-lg">
          <h2 className="text-lg font-semibold">Safety Alerts</h2>
          {data[data.length - 1]?.alert && (
            <p className="text-lg text-red-600">{data[data.length - 1].alert}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
