docker run --name some-mysql -e MYSQL_ROOT_PASSWORD=my-secret-pw -d mysql:tag

docker run -d \
--name mysql_cont \
-e MYSQL_ROOT_PASSWORD=my-secrect-pw \
-p 8084:8085 \
mysql 