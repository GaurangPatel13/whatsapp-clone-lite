# Stage 1: Build the Next.js application
FROM node:18 AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy prisma schema
COPY prisma ./prisma/

# Copy source files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Compile ws-server to JavaScript for production
RUN npx tsc --project tsconfig.ws.json

# Stage 2: Production server
FROM node:18 AS runner

WORKDIR /app

# Copy everything from builder that we need at runtime
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/src ./src
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/ws-server.ts ./

# Create public dir if it doesn't exist
RUN mkdir -p ./public

# Environment variables
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["npm", "start"]
