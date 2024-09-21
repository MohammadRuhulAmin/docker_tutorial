FROM ubuntu:latest
MAINTAINER "ruhul@ba-systems.com"
WORKDIR /root

# Update package lists and install iputils-ping
RUN apt-get update && apt-get install -y iputils-ping

# Default command to start an interactive shell
CMD ["/bin/bash"]
