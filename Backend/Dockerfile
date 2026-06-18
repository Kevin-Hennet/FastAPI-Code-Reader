# linux terminal so you could use more python and nodejs versions 
FROM ubuntu:22.04
# environment handling 
ENV DEBIAN_FRONTEND=noninteractive
ENV NVM_DIR=/root/.nvm
ENV PATH="/root/.nvm/versions/node/v24.16.0/bin:$PATH"
ENV RUNNING_IN_DOCKER=true

# Install dependencies
RUN apt-get update && apt-get install -y \
    software-properties-common \
    curl \
    bash

# Install Python versions
RUN add-apt-repository ppa:deadsnakes/ppa && \
    apt-get update && \
    apt-get install -y \
    python3.9 \
    python3.11 \
    python3.12 \
    python3.13 \
    python3-pip

# Install nvm and Node versions in one RUN command
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash && \
    . /root/.nvm/nvm.sh && \
    nvm install 18 && \
    nvm install 20 && \
    nvm install 24

# Install Supervisor and clean up caches to keep the image slim
RUN apt-get update && apt-get install -y \
    supervisor \
    && rm -rf /var/lib/apt/lists/*
# creates log directories needed for the config 
RUN mkdir -p /var/log/supervisor

# setting up the requirements for the main app (essentially main app setup) 
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
# copy everything 
COPY . /app

# runtime requirements 
RUN pip install -r /app/runtimes/python39/requirements.txt
RUN pip install -r /app/runtimes/python311/requirements.txt
RUN pip install -r /app/runtimes/python312/requirements.txt
RUN pip install -r /app/runtimes/python313/requirements.txt
RUN pip install -r /app/runtimes/node18/requirements.txt
RUN pip install -r /app/runtimes/node20/requirements.txt
RUN pip install -r /app/runtimes/node24/requirements.txt

# copy supervisord config
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
# commands 
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]