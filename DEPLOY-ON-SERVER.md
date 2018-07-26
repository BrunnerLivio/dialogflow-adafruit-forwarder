# Deploy on a Server

## Requirements

- docker
- docker-compose

## Installation

1. Edit your environment variable file

```bash

mv default.env cred.env
vi cred.env

```

2. Move your SSL certifiaces into the certs folder of this repository. The cert / key must have the same name as the defined VIRTUAL_HOST environment variable (in the `cred.env` file)

```bash

mkdir certs
mv /path/to/mydomain.com.cert certs/
mv /path/to/mydomain.com.key certs/

```

3. Build and run

```bash

docker-compose up

```
