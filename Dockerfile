FROM golang:1.24-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git

# Install sqlc
RUN go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest

# Show Go version for debugging
RUN go version

# Copy go.mod and go.sum first for better caching
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Generate SQL code (optional if you've already committed the generated files)
RUN sqlc generate

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o app .

# Create the runtime container
FROM alpine:3.18

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache ca-certificates tzdata

# Copy binary from builder stage
COPY --from=builder /app/app .
# Copy migrations and other necessary files
COPY --from=builder /app/db/migrations ./db/migrations
COPY --from=builder /app/public ./public
COPY --from=builder /app/start.sh .

# Ensure directories exist
RUN mkdir -p ./public/images

# Ensure the default profile picture is copied from the source
COPY --from=builder /app/public/images/default_pfp.jpg ./public/images/default_pfp.jpg

# Ensure start.sh is executable
RUN chmod +x ./start.sh

# Set environment variables
ENV GIN_MODE=release
ENV ENV=production

# Start the application using the start.sh script
CMD ["./start.sh"]