/*
  Warnings:

  - You are about to drop the `Guia` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Procedimento` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Procedimento" DROP CONSTRAINT "Procedimento_id_fkey";

-- DropTable
DROP TABLE "Guia";

-- DropTable
DROP TABLE "Procedimento";

-- CreateTable
CREATE TABLE "guia" (
    "id" SERIAL NOT NULL,
    "numeroGuiaPrestador" TEXT NOT NULL,
    "numeroGuiaOperadora" TEXT,
    "numeroCarteira" TEXT,
    "senha" TEXT,
    "dataAutorizacao" TIMESTAMP(3),
    "dataValidadeSenha" TIMESTAMP(3),
    "atendimentoRN" TEXT,
    "tipoTransacao" TEXT,
    "loteGuia" TEXT,
    "caraterAtendimento" TEXT,
    "tipoFaturamento" TEXT,
    "dataInicioFaturamento" TIMESTAMP(3),
    "dataFinalFaturamento" TIMESTAMP(3),
    "tipoInternacao" TEXT,
    "regimeInternacao" TEXT,
    "diagnostico" TEXT,
    "indicadorAcidente" TEXT,
    "motivoEncerramento" TEXT,
    "outrasDespesas" JSONB,
    "valorTotalProcedimentos" DOUBLE PRECISION,
    "valorTotalDiarias" DOUBLE PRECISION,
    "valorTotalTaxasAlugueis" DOUBLE PRECISION,
    "valorTotalMateriais" DOUBLE PRECISION,
    "valorTotalMedicamentos" DOUBLE PRECISION,
    "valorTotalOPME" DOUBLE PRECISION,
    "valorTotalGasesMedicinais" DOUBLE PRECISION,
    "valorTotalGeral" DOUBLE PRECISION,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guia_procedimentos" (
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

    CONSTRAINT "guia_procedimentos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "guia_numeroGuiaPrestador_key" ON "guia"("numeroGuiaPrestador");

-- CreateIndex
CREATE UNIQUE INDEX "guia_procedimentos_guiaId_sequencialItem_key" ON "guia_procedimentos"("guiaId", "sequencialItem");

-- AddForeignKey
ALTER TABLE "guia_procedimentos" ADD CONSTRAINT "guia_procedimentos_id_fkey" FOREIGN KEY ("id") REFERENCES "guia"("id") ON DELETE CASCADE ON UPDATE CASCADE;
