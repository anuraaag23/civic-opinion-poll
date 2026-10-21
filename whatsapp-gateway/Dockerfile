FROM node:20-alpine

# Install dependencies required for sharp/libvips if needed
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

# Persistent session directory
VOLUME ["/app/baileys_auth_info"]

ENV PORT=3001
EXPOSE 3001

CMD ["node", "server.mjs"]
