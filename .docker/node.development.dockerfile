
FROM node:latest

LABEL author="Juliette Tworsey"

COPY      . /var/www
WORKDIR   /var/www


RUN npm install nodemon -g

RUN apt-get update && \
    apt-get install -y openssl && \
    openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout ./https/key.pem -out ./https/cert.pem \
-subj "/C=US/ST=Oregon/L=Portland/O=Schennco/OU=Development/CN=localhost"

EXPOSE 7777

ENTRYPOINT ["nodemon", "index.js"]
