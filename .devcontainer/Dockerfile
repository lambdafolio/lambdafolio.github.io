ARG NODE_VERSION=26.9.0

# Use the parameterized Node.js version
FROM node:${NODE_VERSION}-bookworm

# Re-declare after FROM so it is in scope for ENV and RUN instructions
ARG NODE_ENV=development

# Set working directory
WORKDIR /workspace/lambdafolio

# Nuxt Content needs a native SQLite driver (better-sqlite3) — its prebuilt
# binaries are downloaded by npm ci, no system libraries required.
# Git is already present in the node base image (Studio/publish workflows use it).

# Copy package files first for better Docker layer caching
COPY package*.json ./

# Install dependencies
RUN npm ci

ENV NODE_ENV=${NODE_ENV}

# Fix ownership of app files so the node user can read/write them
RUN chown -R node:node /workspace/lambdafolio

# Switch to non-root user so all container processes (and devcontainer lifecycle
# hooks such as postStartCommand) run as node, preventing root-owned files in
# the mounted workspace volume.
USER node

# Expose the port that Nuxt/Nitro will run on
EXPOSE 3000