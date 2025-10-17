/*
  Warnings:

  - You are about to drop the column `procedimentos` on the `Guia` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Guia" DROP COLUMN "procedimentos";

-- CreateTable
CREATE TABLE "Procedimento" (
    "id" SERIAL NOT NULL,
    "sequencialItem" TEXT NOT NULL,
    "dataExecucao" TEXT,
    "horaInicial" TEXT,
    "horaFinal" TEXT,
    "codigoTabela" TEXT,
    "codigoProcedimento" TEXT,
    "descricaoProcedimento" TEXT,
    "quantidadeExecutada" INTEGER,
    "viaAcesso" TEXT,
    "tecnicaUtilizada" TEXT,
    "reducaoAcrescimo" DOUBLE PRECISION,
    "valorUnitario" DOUBLE PRECISION,
    "valorTotal" DOUBLE PRECISION,
    "nomeProfissional" TEXT,
    "identEquipe" JSONB,
    "guiaId" INTEGER NOT NULL,

    CONSTRAINT "Procedimento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Procedimento_guiaId_sequencialItem_key" ON "Procedimento"("guiaId", "sequencialItem");

-- AddForeignKey
ALTER TABLE "Procedimento" ADD CONSTRAINT "Procedimento_id_fkey" FOREIGN KEY ("id") REFERENCES "Guia"("id") ON DELETE CASCADE ON UPDATE CASCADE;
