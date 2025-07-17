# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY start.sh /start.sh

# Make sure nginx binds to the port expected by Cloud Run
ENV PORT=8080
EXPOSE 8080

# Make startup script executable
RUN chmod +x /start.sh

# Add health check verification
HEALTHCHECK --interval=5s --timeout=3s CMD curl -f http://localhost:$PORT/health || exit 1

CMD ["/start.sh"]