FROM node:16-alpine

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . . 

EXPOSE 5010

CMD [ "npm", "run", "start" ]