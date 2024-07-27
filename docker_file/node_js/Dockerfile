FROM node:latest
MAINTAINER "ruhul@ba-systems.com"
RUN apt-get update
WORKDIR /var/opt
COPY package.json .
RUN npm install
COPY . .
EXPOSE 8085
CMD ["node", "server.js"]
