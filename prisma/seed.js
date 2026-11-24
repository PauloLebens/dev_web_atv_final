/**
 * Popula o banco com dados iniciais. Rodar com:
 *   docker compose exec app npx prisma db seed
 * Pode ser executado mais de uma vez sem duplicar dados.
 */
require('dotenv').config();
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Administrador inicial (único jeito de criar o primeiro ADMIN)
  const { ADMIN_NOME, ADMIN_EMAIL, ADMIN_SENHA } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_SENHA) {
    throw new Error('Defina ADMIN_EMAIL e ADMIN_SENHA no .env para criar o administrador.');
  }

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

  for (const servico of servicos) {
    const existe = await prisma.servico.findFirst({ where: { nome: servico.nome } });
    if (!existe) await prisma.servico.create({ data: servico });
  }
  console.log(`Serviços: ${await prisma.servico.count()}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
