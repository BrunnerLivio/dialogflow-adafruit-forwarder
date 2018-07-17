# Dialogflow Adafruit Forwader

Webserver which forwards webhook requests from dialogflow to adafruit

## Getting Started

Make sure you have NodeJS 9.x.x installed

```bash

npm install
npm start
# curl -X POST http://localhost:3000/ -H 'content-type: application/json' -d '{"query": "123123"}'

```

## Docker

```bash

docker build -t $USER/dialogflow-adafruit-forwarder .
docker run -e ADAFRUIT_KEY=<KEY> -e ADAFRUIT_USERNAME=<USERNAME> -p 3000:3000 -ti brunnel6/dialogflow-adafruit-forwarder

```

## Environment variables

|       ADAFRUIT_KEY      |      ADAFRUIT_USERNAME    |         NO_EMOJI       |               PORT              |
|-------------------------|---------------------------|------------------------|---------------------------------|
| The API Key of Adafruit | Your username of Adafruit | Should not print emoji | The port it should listen on    |
