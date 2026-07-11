# Stage 1: Build the React application
FROM node:20-alpine AS build
WORKDIR /app

# Copy package descriptors and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Serve using Nginx
FROM nginx:stable-alpine
WORKDIR /usr/share/nginx/html

# Copy build output to Nginx document root
COPY --from=build /app/dist ./

# Copy Nginx template configuration
COPY default.conf.template /etc/nginx/templates/default.conf.template

# Default Cloud Run PORT environment variable
ENV PORT=8080

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
