# #region dockerfile
# Stage 1: install everything (TypeScript is a dev dependency) and compile.
FROM node:22-slim AS build
WORKDIR /app
# package files first: npm ci stays cached until the dependencies change.
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
# Compile, then drop dev dependencies so only runtime packages get copied on.
RUN npm run build && npm prune --omit=dev

# Stage 2: compiled JavaScript and production node_modules only.
FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production PORT=8080
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
# The node image ships a non-root "node" user.
USER node
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:8080/status').then(r => process.exit(r.ok ? 0 : 1), () => process.exit(1))"
CMD ["node", "dist/main.js"]
# #endregion
