FROM node:20-alpine AS builder

# Install pnpm and protoc dependencies
RUN apk add --no-cache protoc
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Generate Proto
RUN pnpm proto:generate-ai-service

# Build NestJS
RUN pnpm build

FROM node:20-alpine

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
# Reinstall only production dependencies to keep the image small
RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/proto ./proto
COPY --from=builder /app/apps/ai/generated ./apps/ai/generated

EXPOSE 8000
CMD ["node", "dist/main"]
