-- CreateTable
CREATE TABLE "procedimentosExecutados" (
    "id" SERIAL NOT NULL,
    "patientid" TEXT,
    "procedureid" TEXT,
    "loteguia" TEXT NOT NULL,
    "tipotransacao" TEXT NOT NULL,
    "numeroguiaprestador" TEXT NOT NULL,
    "numerocarteira" TEXT NOT NULL,
    "dataexecucao" TIMESTAMP(3),
    "codigoprocedimento" TEXT NOT NULL,
    "descricaoprocedimento" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "valorunitario" DOUBLE PRECISION NOT NULL,
    "valortotal" DOUBLE PRECISION NOT NULL,
    "nomeprofissional" TEXT NOT NULL,
    "sequencialItem" TEXT,
    "horaInicial" TEXT,
    "horaFinal" TEXT,
    "codigoTabela" TEXT,
    "viaAcesso" TEXT,
    "tecnicaUtilizada" TEXT,
    "reducaoAcrescimo" DOUBLE PRECISION,
    "identEquipe" TEXT,

    CONSTRAINT "procedimentosExecutados_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "procedimentosExecutados_patientid_idx" ON "procedimentosExecutados"("patientid");

-- CreateIndex
CREATE INDEX "procedimentosExecutados_procedureid_idx" ON "procedimentosExecutados"("procedureid");

-- CreateIndex
CREATE INDEX "procedimentosExecutados_dataexecucao_idx" ON "procedimentosExecutados"("dataexecucao");
