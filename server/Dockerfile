# Build stage: compile TypeScript -> dist/. Uses devDependencies (typescript), discarded after.
FROM node:24-slim AS build
WORKDIR /app
# @swisseph/node has no prebuilt binary for this exact platform/Node combo, so npm falls back to
# compiling it from source via node-gyp - which needs Python + a C/C++ toolchain to do so.
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Runtime stage: production dependencies only, plus the compiled output.
# Native modules (@swisseph/node) are reinstalled fresh here (not copied from the build stage)
# so npm resolves the Linux-glibc prebuilt binary for this container's actual platform - the
# slim (Debian, glibc) base is deliberate over alpine (musl) for that reason.
FROM node:24-slim
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist

# Cloud Run sets $PORT and expects the container to listen on it - index.ts already reads
# process.env.PORT and binds 0.0.0.0, so no code changes were needed for this.
EXPOSE 8080
CMD ["node", "dist/index.js"]
