FROM nikolaik/python-nodejs:python3.10-nodejs20-slim

ENV BASE_DIR=/var/www/html/
ENV WEBAPP_DIR=/var/www/html/smart_app/

RUN apt-get update \
 && apt-get install -y --no-install-recommends git \
 && apt-get purge -y --auto-remove \
 && rm -rf /var/lib/apt/lists/* \

WORKDIR $BASE_DIR
ADD requirements.txt $BASE_DIR

RUN apt-get update \
 && apt-get install -y --no-install-recommends git \
 && apt-get purge -y --auto-remove \
 && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir -r $BASE_DIR/requirements.txt

WORKDIR $WEBAPP_DIR
RUN mkdir -p $WEBAPP_DIR
COPY ./ $WEBAPP_DIR/

