## Run the Kafka and Zookeeper container in detach mode

```shell
    docker-compose -f kafka_config.yaml up -d
```

## Create a Kafka Topic

```shell
docker exec -it <kafka_container_id> kafka-topics.sh --create --topic test-topic --bootstrap-server localhost:9092 --replication-factor 1 --partitions 1
```