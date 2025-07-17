#!/bin/sh
echo "Starting Nginx server..."
echo "Using PORT: $PORT"

# Replace the port in Nginx config
sed -i -e "s|listen 8080|listen $PORT|g" /etc/nginx/conf.d/default.conf

# Verify the config is valid
echo "Testing Nginx configuration..."
nginx -t || { echo "Nginx configuration test failed"; exit 1; }

echo "Nginx configuration:"
cat /etc/nginx/conf.d/default.conf

# Start Nginx in foreground mode
echo "Starting Nginx..."
nginx -g "daemon off;"