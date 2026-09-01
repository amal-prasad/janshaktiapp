FROM mcr.microsoft.com/playwright:v1.56.0-noble

RUN apt-get update \
    && apt-get install -y --no-install-recommends ghostscript fonts-noto-devanagari \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

EXPOSE 8080
CMD ["node", "dist/server.js"]
