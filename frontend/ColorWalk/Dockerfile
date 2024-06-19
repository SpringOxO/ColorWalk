FROM node:latest

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

# 全局安装 Angular CLI
RUN npm install -g @angular/cli

COPY . .

ENTRYPOINT ["ng", "serve", "--host", "0.0.0.0", "--port", "4200"]