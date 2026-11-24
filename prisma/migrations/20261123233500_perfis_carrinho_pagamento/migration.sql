-- CreateEnum
CREATE TYPE "Perfil" AS ENUM ('ADMIN', 'FUNCIONARIO', 'CLIENTE');

-- AlterEnum
BEGIN;
CREATE TYPE "MetodoPagamento_new" AS ENUM ('PIX', 'CARTAO_CREDITO', 'CARTAO_DEBITO');
ALTER TABLE "pagamentos" ALTER COLUMN "metodo" TYPE "MetodoPagamento_new" USING ("metodo"::text::"MetodoPagamento_new");
ALTER TYPE "MetodoPagamento" RENAME TO "MetodoPagamento_old";
ALTER TYPE "MetodoPagamento_new" RENAME TO "MetodoPagamento";
DROP TYPE "MetodoPagamento_old";
COMMIT;

-- AlterEnum
ALTER TYPE "StatusPagamento" ADD VALUE 'FALHOU';

-- DropForeignKey
ALTER TABLE "_AgendamentoServicos" DROP CONSTRAINT "_AgendamentoServicos_A_fkey";

-- DropForeignKey
ALTER TABLE "_AgendamentoServicos" DROP CONSTRAINT "_AgendamentoServicos_B_fkey";

-- AlterTable
ALTER TABLE "agendamentos" ADD COLUMN     "duracaoTotalMinutos" INTEGER NOT NULL,
ADD COLUMN     "valorTotal" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "funcionarios" ADD COLUMN     "ativo" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "pagamentos" ADD COLUMN     "codigoPix" TEXT,
ADD COLUMN     "transacaoId" TEXT;

-- AlterTable
ALTER TABLE "servicos" ADD COLUMN     "imagemUrl" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "isAdmin",
ADD COLUMN     "perfil" "Perfil" NOT NULL DEFAULT 'CLIENTE';

-- DropTable
DROP TABLE "_AgendamentoServicos";

-- CreateTable
CREATE TABLE "agendamento_servicos" (
    "agendamentoId" INTEGER NOT NULL,
    "servicoId" INTEGER NOT NULL,
    "precoCobrado" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "agendamento_servicos_pkey" PRIMARY KEY ("agendamentoId","servicoId")
);

-- AddForeignKey
ALTER TABLE "agendamento_servicos" ADD CONSTRAINT "agendamento_servicos_agendamentoId_fkey" FOREIGN KEY ("agendamentoId") REFERENCES "agendamentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamento_servicos" ADD CONSTRAINT "agendamento_servicos_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "servicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

