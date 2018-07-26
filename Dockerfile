FROM node:9.6.1

WORKDIR /var/lib/dialogflow-adafruit-forwarder

COPY package.json ./
RUN npm install
COPY . .

ENTRYPOINT [ "npm", "run" ]
EXPOSE 3000
CMD [ "start" ]
