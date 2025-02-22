import paho.mqtt.client as mqtt # type: ignore
import time
import random
import json

# Define MQTT callbacks
def on_connect(client, userdata, flags, rc, properties=None):
    if rc == 0:
        print("Connected to MQTT broker successfully")
        client.subscribe("smartguard/sensors")
    else:
        print(f"Connection failed with code {rc}")

def on_publish(client, userdata, mid, properties=None, reason_code=None):
    print(f"Message {mid} published with reason code {reason_code}")

# Initialize MQTT client
client = mqtt.Client(protocol=mqtt.MQTTv311, callback_api_version=mqtt.CallbackAPIVersion.VERSION2)
client.on_connect = on_connect
client.on_publish = on_publish

try:
    client.connect("broker.hivemq.com", 1883, 60)
    print("Attempting to connect to broker.hivemq.com...")
    client.loop_start()

    while True:
        data = {
            "weight": random.uniform(100, 1000),        # kg
            "windSpeed": random.uniform(0, 20),         # m/s
            "stability": random.uniform(50, 100),       # %
            "boomAngle": random.uniform(0, 90),         # °
            "swingSpeed": random.uniform(0, 5),         # °/s
            "energyConsumption": random.uniform(10, 100), # kW
        }
        client.publish("smartguard/sensors", json.dumps(data))
        print("Published:", data)
        time.sleep(1)

except KeyboardInterrupt:
    print("Stopping simulator...")
    client.loop_stop()
    client.disconnect()
except Exception as e:
    print(f"Error: {e}")
    client.loop_stop()
    client.disconnect()