# Stage 1: Build the Next.js application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Compile ws-server to JavaScript for production
RUN npx tsc --project tsconfig.ws.json

# Stage 2: Production server
FROM node:18-alpine AS runner

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci && npm cache clean --force

# Copy Prisma schema and client
COPY prisma ./prisma/

# Copy built application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./

# Copy public folder if it exists (optional static assets)
RUN mkdir -p ./public

# Environment variables
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["npm", "start"]
