# Use Bun image from the Docker Hub
FROM oven/bun:debian

# Set PORT
ENV PORT=3000

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy app files
COPY . .

# Install only necessary production dependencies
RUN bun install --frozen-lockfile --production

# Generate Prisma
RUN bun run generate

# Run the application
CMD ["bun", "start"]
