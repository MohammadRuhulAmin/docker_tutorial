from kafka import KafkaProducer
import json
import time

producer = KafkaProducer(bootstrap_servers='localhost:9092',
                     	value_serializer=lambda v: json.dumps(v).encode('utf-8'))

data = {"name": "ruhulamin"}

while True:
	producer.send('test-topic', data)
	print(f"Sent: {data}")
	time.sleep(5)
