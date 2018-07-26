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
docker run \
  -e ADAFRUIT_KEY=<KEY> \
  -e ADAFRUIT_USERNAME=<USERNAME> \
  -e ADAFRUIT_FEED_ID=<USERNAME> \
  -p 3000:3000 \
  -ti brunnel6/dialogflow-adafruit-forwarder

```

## Environment variables

|       ADAFRUIT_KEY      |      ADAFRUIT_USERNAME    |         NO_EMOJI       |               PORT              |      ADAFRUIT_FEED_ID           |
|-------------------------|---------------------------|------------------------|---------------------------------|---------------------------------|
| The API Key of Adafruit | Your username of Adafruit | Should not print emoji | The port it should listen on    | The id of the adafruit feed     |

## Deploy on a server

See [DEPLOY-ON-SERVER.md](DEPLOY-ON-SERVER.md) which describes how to run this application
using docker-compose with a predefined nginx configuration and SSL support.