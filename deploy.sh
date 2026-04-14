#!/bin/bash

# Exit on any error
set -e

echo "Building SplitBite Containers..."

# Ensure we have the latest base image
docker compose down

# Build docker images (server and client need their respective Dockerfiles)
docker compose build

# Start services
echo "Starting services in background..."
docker compose up -d

echo "Deployment complete."
docker compose ps
