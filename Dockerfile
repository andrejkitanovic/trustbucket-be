# syntax=docker/dockerfile:1.4

FROM node:14
WORKDIR /app
COPY . /app
RUN apt update && apt install -y chromium
RUN npm install
CMD [ "npm", "start" ]

# docker run -it --rm -p 8080:8080 --name trustbucketadmin --env-file .env trustbucketadmin:latest 
# docker build -t trustbucketadmin:latest .