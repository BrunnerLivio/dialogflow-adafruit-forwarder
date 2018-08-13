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

mv default.env cred.env
vi cred.env

docker build -t $USER/dialogflow-adafruit-forwarder .
docker run \
  --env-file ./cred.env \
  -p 3000:3000 \
  -ti $USER/dialogflow-adafruit-forwarder

```

## Environment variables

The environment variables

| Variable Name        | Description                                                                | Type    | Example                                      | Default | Required |
|:---------------------|:---------------------------------------------------------------------------|:--------|:---------------------------------------------|:--------|:---------|
| ADAFRUIT_KEY         | The API Key of Adafruit                                                    | string  | `ADAFRUIT_KEY="<SECRET>"`                    | -       | true     |
| ADAFRUIT_USERNAME    | If should only simulate this app (not actually alter anything permanently) | string  | `ADAFRUIT_USERNAME="<USERNAME>"`             | -       | true     |
| ADAFRUIT_FEED_ID_IN  | The Adafruit Feed which this application listens to                        | string  | `ADAFRUIT_FEED_ID_IN="google-openstack-out"` | -       | true     |
| ADAFRUIT_FEED_ID_OUT | The Adafruit Feed which this application sends messages to                 | string  | `ADAFRUIT_FEED_ID_OUT="google-openstack-in"` | -       | true     |
| NO_EMOJI             | Do not print any emojis                                                    | boolean | `NO_EMOJI=true`                              | false   | false    |
| LOG_LEVEL            | The level of the log (error, warn, info, debug, silly)                     | string  | `LOG_LEVEL=silly`                            | info    | false    |
| PORT                 | The port of the webserver                                                  | number  | `PORT=3000`                                  | 3000    | false    |
| VIRTUAL_HOST         | Only if running with `docker-compose`.                                     | string  | `VIRTUAL_HOST=localhost`                     | -       | false    |

## Deploy on a server

See [DEPLOY-ON-SERVER.md](DEPLOY-ON-SERVER.md) which describes how to run this application
using docker-compose with a predefined nginx configuration and SSL support.
