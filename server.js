const express = require('express');
const mqtt = require('mqtt');
const WebSocket = require('ws');
const app = express();
const port = 3001;

const mqttClient = mqtt.connect('mqtt://broker.hivemq.com');
mqttClient.on('connect', () => {
  mqttClient.subscribe('smartguard/sensors', (err) => {
    if (!err) console.log('Subscribed to SmartGuard sensor data');
  });
});

const wss = new WebSocket.Server({ port: 8080 });
wss.on('connection', (ws) => {
  console.log('Client connected');
});

mqttClient.on('message', (topic, message) => {
  const data = JSON.parse(message.toString());
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});