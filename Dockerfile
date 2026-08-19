FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --ignore-scripts --ignore-engines

COPY . .
RUN npx fumadocs-mdx && yarn build

FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

ENV NODE_ENV=production

# Next's standalone server binds to process.env.HOSTNAME, and Docker sets that
# to the container id. So without this it listens on the container's own IP and
# nothing else — 127.0.0.1 and localhost are both refused from inside. The site
# still works, because the port mapping targets that IP, but anything probing
# from within the container cannot reach it. That is why the healthcheck had
# been failing for days while the site was up.
ENV HOSTNAME=0.0.0.0

EXPOSE 3000

# 127.0.0.1 rather than localhost: on Alpine, localhost can resolve to ::1
# first, and the server is listening on IPv4.
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/').then(r=>process.exit(r.ok?0:1)).catch(e=>{console.error(e.cause?.code||e.message);process.exit(1)})"

CMD ["node", "server.js"]
