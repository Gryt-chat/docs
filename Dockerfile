FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./
COPY node_modules ./node_modules
RUN yarn install --frozen-lockfile --ignore-scripts --ignore-engines

COPY . .
RUN npx fumadocs-mdx && yarn build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

ENV NODE_ENV=production
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
