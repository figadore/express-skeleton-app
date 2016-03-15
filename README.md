# Customize skeleton

* update project name/description, run command in readme below
* update .drone.yml's publish `repo` field
* update config/config.js's `appName` field
* activate repo in drone
* generate .drone.sec from .drone.sec.dist in drone's `secrets` tab for the repo

# Project name

Project description

## Developing

### Docker

#### Using docker-compose
* `docker-compose -f dev-compose.yml build`
* `docker-compose -f dev-compose.yml up`

Note: first time running with dev-compose.yml will require npm install from another shell attached to this container, e.g. `docker exec -it app_app_1 bash` `npm install`

#### Using plain docker

* `docker build -t ncd-backend ./`
* `docker run --it -rm -v $(pwd):/var/www -p 3000:80 ncd-backend` #runs on host port 3000

### Custom local Node.js installation
Run `npm start` in the root of the repository

## Deploying

### Docker
* `docker build -t project ./`
* `docker run -d -p 80:80 project`

### Kubernetes
TODO
