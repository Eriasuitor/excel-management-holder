FROM keymetrics/pm2:latest-alpine
WORKDIR /app
COPY src src
COPY package.json .
COPY ecosystem.config.js .
COPY .sequelizerc .
COPY node_modules node_modules

# RUN npm install --production

EXPOSE 10086

# CMD ["sleep", "5"]
# CMD ["echo", "Start to initialize mysql"]
# CMD ["export", "NODE_ENV=audit"]
# CMD ["node_modules/.bin/sequelize", "db:create", "--charset", "utf8mb4", "--collate", "utf8mb4_unicode_ci"]
# CMD ["node", "src/bin/sync"]
# CMD [ "pm2-runtime", "start", "ecosystem.config.js", "--env", "audit" ]