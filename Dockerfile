FROM ubuntu

WORKDIR /opt/app

ENV PORT=8080

RUN touch /usr/bin/start.sh # this is the script which will run on start

RUN echo 'npm install --production' >> /usr/bin/start.sh
RUN echo 'npm install -g pm2' >> /usr/bin/start.sh

# Setup NGINX
RUN apt update
RUN apt-get install -y nginx nano
RUN rm -v /etc/nginx/nginx.conf
ADD nginx.conf /etc/nginx/
RUN echo "daemon off;" >> /etc/nginx/nginx.conf
EXPOSE 80
CMD service nginx start

# npm start, make sure to have a start attribute in "scripts" in package.json
RUN echo 'pm2 start npm -- start' >> /usr/bin/start.sh
RUN echo 'sh' >> /usr/bin/start.sh
