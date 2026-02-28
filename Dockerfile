FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./
COPY node_modules ./node_modules
RUN yarn install --frozen-lockfile --ignore-scripts --ignore-engines

COPY . .
RUN npx fumadocs-mdx && yarn build

FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

ENV NODE_ENV=production
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
