# Links
## References
- [Learning Docker (Official)](https://learndocker.online/)
- [Container Registry: Docker Hub](https://hub.docker.com)
- [Dockerfile Reference](https://docs.docker.com/reference/dockerfile/)

## Videos
- [Docker Crash Course for Absolute Beginners](https://www.youtube.com/watch?v=pg19Z8LL06w)
- [Ultimate Docker Compose Tutorial](https://www.youtube.com/watch?v=SXwC9fSwct8)

# Concepts
## Docker Containers
A running instance of an image that contains everything needed to run an application created using the Dockerfile template file.

## Docker Compose
A Docker client that lets you work with applications consisting of a set of containers. Docker Compose will allow you to create all the necessary containers needed for your application and setup the network so that they can communicate with each other. Once your application requires more than 1 Docker image to function, it is time to consider Docker Compose.

## Docker Images
A read-only, executable application artifact file (similar to *.jar, *.tar, or *.zip) that contains instruction templates for creating a Docker container. Unlike traditional application artifacts, a Docker image contains:
- Application source code (e.g., JavaScript files)
- Complete environment runtimes (e.g., node, npm, Linux)
- Environment configuration (e.g., environment variables, directories, files, etc.)

## Dockerfile
To build your own image, you create a Dockerfile with a simple syntax for defining the steps needed to create the image and run it.

## Docker Registries
There are ready to run (official) Docker Images  provided from their vendors. [Docker Hub](https://hub.docker.com) is the biggest (public) Docker Images registry. Docker has a dedicated team to review and publish all "official" Docker images. Security and documentation best practices are all reviewed.
- Look for "Docker Official Image" or "Verified Publisher" badges.
- Images are versioned known as Docker "tags" so that specific versions can be used in your application. All images always have the "latest" tags. Selecting a specific version of an image is the best practice.
- Private Docker registries are also available from cloud providers (e.g., AWS ECR, Google, Azure). Even Docker Hub allows you to store private images in your own private registry.

## Docker Repositories
A Docker registry service that provides storage for images and within each registry, you can create different repositories.

# Commands
## Running Docker Images
```
docker pull nginx                      // Downloads the latest version of Nginx
docker pull nginx:1.23                 // Downloads version Nginx 1.23 from Docker Hub (default repository)
docker images                          // Shows all downloaded images
docker run nginx:1.23                  // Start a container for Nginx 1.23
docker run –d nginx:1.23               // Starts a container detached so that it doesn't block the terminal
docker run –d –name web-app nginx:1.23 // Starts a container with 'web-app' name
docker run -it alpine                  // Run the image interactive
```
Note: Docker run will use pull if the image was not downloaded.

There is a simple approach to take advantage of a Docker container's environment to run a single file project. Take for example this Node project that has a single *.js file to run. You can execute the following command:
```
docker run -it --rm --name my-running-script -v "$PWD":/usr/src/app -w /usr/src/app node:19-bullseye node your-daemon-or-script.js
```
[Source](https://www.docker.com/blog/how-to-use-the-node-docker-official-image/)

## Creating Docker Images
Use a Dockerfile to create a Docker image. Place the Dockerfile in the root folder of your source code project.
The important ones are:
```
FROM – Images to include or inherit for the container.
WORKDIR – Change to the directory for working commands.
RUN – Installs/runs necessary images.
CMD – Run a CLI command that you would normally run in Linux.
```
```
FROM node:19-alpine       // Define your base image. This is a node+Alpine linux bundled system.
COPY package.json /app/   // Copy a file into the /app folder
COPY src /app/            // Copy a folder into the /app folder
WORKDIR /app              // cd into the /app folder
EXPOSE 4000               // Allow port 4000 for traffic
RUN npm install           // Download and install the node dependencies into the container's /app folder
CMD ["node", "server.js"] // The last command to execute in the container
```

## Building Docker Images
Build an image from the Dockerfile.
```
docker build –t node-app:1.0.0 . // Build an image with this tag and name from the current directory.
docker images                    // Shows you the image you just recently created
```

## Container Commands
```
docker ps                                  // Shows all running containers
docker ps –a                               // Shows a list of all containers whether they are running or stopped
docker logs <container-id|container-name>  // Prints the application logs for the container
docker stop <container-id|container-name>  // Stops an actively running container
docker start <container-id|container-name> // Start a stopped container
```

## Port Binding
Containers must be exposed to the local network so that it is accessible. This is done via port binding. Since each application has a standard port used by the container. To tell docker to bind the containers port to the localhost's port so that the container can be accessed:
```
docker run –d –p 9000:80 nginx:1.23 // Expose the container to localhost:9000
docker ps                           // Will show the port binding
```
Note: Best practice is to bind the container port to the same port on the localhost.

## Network
A network is required to allow Docker containers to communicate with each other (e.g., Nginx > MongoDB). 

First, you create a network.
```
docker network create <network-name> // Creates a new Docker network and gives it an identifiable name.
docker network ls // Lists all the networks that were created (Note: bridge, host, none are default networks)
```

Then you create container(s) and specifying which network to use. You would do this for each container during startup or later by connecting a network to a container.
```
docker run -d \
-p 27017:27017 \
-e MONGO_INITDB_ROOT_USERNAME=admin \ //These are environment variables
-e MONGO_INITDB_ROOT_PASSWORD=supersecret \
--network <network-name> \
--name <container-name> \
mongo
```

More about [Docker Network](https://docs.docker.com/reference/cli/docker/network/).

## Volumes
Docker has two options for containers to store files on the host machine, so that the files are persisted even after the container stops: volumes, and bind mounts. Volumes are the preferred mechanism for persisting data generated by and used by Docker containers. While bind mounts are dependent on the directory structure and OS of the host machine, volumes are completely managed by Docker.
```
docker run -d \
--name devtest \
--mount source=myvol2,target=/app \
nginx:latest
```

## Docker Compose
Users a `*.yaml` file to specify all the docker CLI commands in a structured format. The `*.yaml` will define all the services, configurations, and dependencies needed for an application to be deployed. It is best practice to create the `*.yaml` file in the root folder of your source code (same place as Dockerfile). This allows your Docker Compose to easily build an image of your application before creating the services and application containers.

A `*.yaml` looks like this.
```
version: // The version of docker-compose installed locally.
services: // List all the containers we want to ran as part of this Docker Compose file.
  build|image: . // build is used to create an image from Dockerfile. Image is used to specify Docker image.
  image:
    - values
  ports:
    - values
  environment:
    - values
  depends-on:
    - values
```

Running Docker Compose.
```
docker-compose -f <*.yaml> up    // Creates and starts containers
docker-compose -f <*.yaml> down  // Stops and discard containers
docker-compose -f <*.yaml> start // Restarts containers (preserves memory)
docker-compose -f <*.yaml> stop  // Halts containers (preserves memory)
```
Containers are ephemeral because it has no persistence. All the data is gone when the containers are removed, unless you configure persistence using volumes. So just up/stop containers to persist the data within the containers.

# Development Environments with Docker
The main docker goal or feature is to enable developers to **package applications** into containers which are easy to deploy anywhere, simplifying your infrastructure.

So, in this sense, docker is **not strictly for the developer stage**. In the developer stage, the programmer should use an specialized IDE (eclipse, intellij, visual studio, etc) to create and update the source code. Also some languages like java, c# and frameworks like react/ angular **needs a build stage**.

These IDEs has features like hot reload (automatic application updates when source code change), variables & methods auto-completion, etc. These features achieve to reduce the developer time.

## Volumes
If you are a java developer (for instance), you need to install java on your machine and some IDE like eclipse, configure the maven, etc etc. With docker, you could create an image with all the required techs and the establish a kind of connection between your source code and the docker container. This connection in docker is called **Volumes**.
```
docker run --name my_job -p 9000:8080 \
-v /my/python/microservice:/src \
python-workspace-all-in-one
```
In the previous example, you could code directly on `/my/python/microservice` and you only need to enter into **my_job** container and run python `/src/main.py`. It will work without Python or any requirement on your host machine. All will be in **python-workspace-all-in-one**.

In case of technologies that need a build process (e.g., Java, c#, Angular), there is a time penalty because, the developer should perform a build on any source code change. This is not required with the usage of specialized IDEs as I explained.

In case of technologies that do not require build process like (e.g., PHP), just the libraries/dependencies installation, docker will work almost the same as the specialized IDE.

## Local Development with Hot Reload
If your app is based on Python. it doesn't require a build process. Just the libraries installed. So if you want to develop with Python using Docker instead the classic way (i.e., install Python, execute `python app.p`y, etc.), you should follow these steps:

1. Don't copy your source code to the Python container
1. Just pass the requirements.txt to the Python container
1. Execute the pip install inside of the Python container
1. Run your app inside the Python container
1. Create a docker volume so that your source code -> internal folder in the Python container

Here an example of a Python Dockerfile with hot-reload:
```
FROM python:3
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY requirements.txt /usr/src/app
RUN pip install -r requirements.txt
CMD [ "mkdocs", "serve",  "--dev-addr=0.0.0.0:8000" ]
```

Use the Dockerfile to build the dev image:
```
docker build -t myapp-dev .
```

Run the dev image with volumes to sync the code changes in your host with the container:
```
docker run --name myapp-dev -it --rm -p 8000:8000 -v $(pwd):/usr/src/app mydocs-dev
```
In summary, this is the flow to run your app with Docker in the development stage:

1. start the requirements before the app (database, apis, etc)
1. create an special Dockerfile for development stage
1. build the docker image for development purposes
1. run the app syncing the source code with container (-v)
1. developer modify the source code
1. if you can use some kind of hot-reload library on python
1. the app is ready to be opened from a browser

## Local Development without Hot Reload
If you cannot use a hot-reload library, you will need to build and run **everytime** you need to test your source code modifications. In this case, you should copy the source code to the container instead of synchronizing with volumes.
```
FROM python:3
RUN mkdir -p /usr/src/app
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN pip install -r requirements.txt
RUN mkdocs build
WORKDIR /usr/src/app/site
CMD ["python", "-m", "http.server", "8000" ]
```

Steps should be:
1. start the requirements before the app (database, apis, etc)
1. create an special Dockerfile for development stage
1. developer modify the source code
1. build: `docker build -t myapp-dev .`
1. run: `docker run --name myapp-dev -it --rm -p 8000:8000 mydocs-dev`
