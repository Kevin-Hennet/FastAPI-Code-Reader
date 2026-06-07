# linux terminal so you could use more python and nodejs versions 
FROM ubuntu:22.04
# environment handling 
ENV DEBIAN_FRONTEND=noninteractive
ENV NVM_DIR=/root/.nvm
ENV PATH="/root/.nvm/versions/node/v18/bin:/root/.nvm/versions/node/v20/bin:/root/.nvm/versions/node/v24/bin:$PATH"
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
# setting up the requirements 
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . /app
# commands 
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]