FROM node:20-alpine

# O Prisma precisa do OpenSSL para rodar o engine no Alpine
RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

RUN npm install && npx prisma generate

COPY . .

EXPOSE 3000

# Ao ligar: aplica as migrations pendentes, cria o admin/dados iniciais (se ainda não existirem)
# e sobe o servidor
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma generate && node prisma/seed.js && node server.js"]
