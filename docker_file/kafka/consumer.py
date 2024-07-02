from kafka import KafkaConsumer
import json

# Correctly use value_deserializer to deserialize the JSON messages
consumer = KafkaConsumer('test-topic',
                     	bootstrap_servers='localhost:9092',
                     	auto_offset_reset='earliest',
                     	enable_auto_commit=True,
                     	group_id='my-group',
                     	value_deserializer=lambda x: json.loads(x.decode('utf-8')))

for message in consumer:
	data = message.value
	print(f"Received: {data}")
