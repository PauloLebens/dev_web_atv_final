/**
 * Popula o banco com dados iniciais.
 * Roda AUTOMATICAMENTE toda vez que o contêiner da API liga (ver Dockerfile),
 * então precisa ser seguro de repetir:
 * - Admin: só é criado se ainda não existir um usuário com ADMIN_EMAIL.
 * - Serviços de exemplo: só são criados se o catálogo estiver vazio.
 * Também pode ser rodado à mão: docker compose exec app npx prisma db seed
 */
require('dotenv').config();
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Administrador inicial (único jeito de criar o primeiro ADMIN)
  const { ADMIN_NOME, ADMIN_EMAIL, ADMIN_SENHA } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_SENHA) {
    console.warn('ADMIN_EMAIL/ADMIN_SENHA não definidos no .env: administrador não foi criado.');
  } else {
    await criarAdmin(ADMIN_NOME, ADMIN_EMAIL, ADMIN_SENHA);
  }

  await criarServicosExemplo();
}

async function criarAdmin(ADMIN_NOME, ADMIN_EMAIL, ADMIN_SENHA) {
  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL.toLowerCase() },
    update: {},
    create: {
      nome: ADMIN_NOME || 'Administrador',
      email: ADMIN_EMAIL.toLowerCase(),
      senhaHash: await bcrypt.hash(ADMIN_SENHA, 10),
      perfil: 'ADMIN'
    }
  });
  console.log(`Admin: ${admin.email}`);
}

async function criarServicosExemplo() {
  // Só preenche um catálogo vazio, para não recriar serviços que o admin editou ou removeu
  if ((await prisma.servico.count()) > 0) return;

  // Catálogo inicial (baseado no diagrama de objetos)
  const servicos = [
    {
      nome: 'Lavagem Simples - Carro',
      descricao:
        'Limpeza externa completa com aplicação de shampoo automotivo e secagem manual. ' +
        'Inclui limpeza básica das rodas e acabamento com pretinho nos pneus.',
      preco: 120,
      duracaoMinutos: 60
    },
    {
      nome: 'Lavagem Interna - Carro',
      descricao:
        'Higienização detalhada da cabine com aspiração profunda de bancos, carpetes e porta-malas. ' +
        'Limpeza técnica do painel, portas e vidros internos com produtos específicos.',
      preco: 300,
      duracaoMinutos: 120
    }
  ];

  await prisma.servico.createMany({ data: servicos });
  console.log(`Serviços de exemplo criados: ${servicos.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
