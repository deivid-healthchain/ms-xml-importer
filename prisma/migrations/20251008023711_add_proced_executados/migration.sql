-- CreateEnum
CREATE TYPE "AccommodationStatus" AS ENUM ('CORRECT', 'INCORRECT');

-- CreateEnum
CREATE TYPE "AccommodationType" AS ENUM ('APARTMENT', 'SHARED');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'VIEW', 'APPROVE', 'REJECT');

-- CreateEnum
CREATE TYPE "BillingCategory" AS ENUM ('PROCEDURE', 'MATERIAL', 'MEDICATION', 'EXAM', 'ACCOMMODATION', 'OTHER');

-- CreateEnum
CREATE TYPE "BillingStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'BILLED');

-- CreateEnum
CREATE TYPE "CoverageType" AS ENUM ('INCLUDED', 'EXTRA', 'BLOCKED');

-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('EXAM', 'PRESCRIPTION', 'REPORT', 'IMAGE', 'OTHER');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('PATIENT', 'PROCEDURE', 'BILLING', 'MATERIAL', 'USER');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "PatientStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'TRANSFERRED', 'DISCHARGED');

-- CreateEnum
CREATE TYPE "ProcedureStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'PENDING_APPROVAL');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ValidationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'UNDER_REVIEW');

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entityType" "EntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "description" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userRole" TEXT NOT NULL,
    "oldData" JSONB,
    "newData" JSONB,
    "changes" JSONB,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "validationStatus" "ValidationStatus",
    "justification" TEXT,
    "metadata" JSONB,
    "patientId" TEXT,
    "procedureId" TEXT,
    "billingId" TEXT,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_items" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "patientId" TEXT NOT NULL,
    "procedureId" TEXT,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "BillingCategory" NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "port" INTEGER,
    "coverageType" "CoverageType" NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL,
    "requesterId" TEXT NOT NULL,
    "requesterName" TEXT NOT NULL,
    "requestDate" TIMESTAMP(3) NOT NULL,
    "status" "BillingStatus" NOT NULL,
    "validationStatus" "ValidationStatus" NOT NULL,
    "auditNotes" TEXT,
    "rejectionReason" TEXT,

    CONSTRAINT "billing_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "patientId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "category" "DocumentCategory" NOT NULL,
    "description" TEXT,
    "blobUrl" TEXT NOT NULL,
    "containerName" TEXT NOT NULL,
    "blobName" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "uploadedByName" TEXT NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patients" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "fullName" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "rg" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "gender" "Gender" NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "medicalRecordNumber" TEXT NOT NULL,
    "admissionDate" TIMESTAMP(3) NOT NULL,
    "roomNumber" TEXT NOT NULL,
    "responsibleDoctor" TEXT NOT NULL,
    "insurancePlan" TEXT NOT NULL,
    "insuranceNumber" TEXT NOT NULL,
    "insuranceValidity" TIMESTAMP(3) NOT NULL,
    "accommodationType" "AccommodationType" NOT NULL,
    "currentAccommodation" "AccommodationType" NOT NULL,
    "accommodationStatus" "AccommodationStatus" NOT NULL,
    "observations" TEXT,
    "status" "PatientStatus" NOT NULL,
    "validationStatus" "ValidationStatus" NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procedures" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "suggestedPort" INTEGER NOT NULL,
    "currentPort" INTEGER NOT NULL,
    "portDivergence" BOOLEAN NOT NULL DEFAULT false,
    "status" "ProcedureStatus" NOT NULL,
    "validationStatus" "ValidationStatus" NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL,
    "lastAuditDate" TIMESTAMP(3),
    "auditorId" TEXT,
    "auditNotes" TEXT,
    "scheduledDate" TIMESTAMP(3),
    "completedDate" TIMESTAMP(3),
    "estimatedDuration" INTEGER,
    "actualDuration" INTEGER,

    CONSTRAINT "procedures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcedimentoExecutado" (
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

    CONSTRAINT "ProcedimentoExecutado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_validationStatus_idx" ON "audit_logs"("validationStatus");

-- CreateIndex
CREATE INDEX "billing_items_category_idx" ON "billing_items"("category");

-- CreateIndex
CREATE INDEX "billing_items_code_idx" ON "billing_items"("code");

-- CreateIndex
CREATE INDEX "billing_items_patientId_idx" ON "billing_items"("patientId");

-- CreateIndex
CREATE INDEX "billing_items_procedureId_idx" ON "billing_items"("procedureId");

-- CreateIndex
CREATE INDEX "billing_items_requestDate_idx" ON "billing_items"("requestDate");

-- CreateIndex
CREATE INDEX "billing_items_status_idx" ON "billing_items"("status");

-- CreateIndex
CREATE INDEX "billing_items_validationStatus_idx" ON "billing_items"("validationStatus");

-- CreateIndex
CREATE INDEX "documents_category_idx" ON "documents"("category");

-- CreateIndex
CREATE INDEX "documents_createdAt_idx" ON "documents"("createdAt");

-- CreateIndex
CREATE INDEX "documents_patientId_idx" ON "documents"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "patients_cpf_key" ON "patients"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "patients_medicalRecordNumber_key" ON "patients"("medicalRecordNumber");

-- CreateIndex
CREATE INDEX "patients_admissionDate_idx" ON "patients"("admissionDate");

-- CreateIndex
CREATE INDEX "patients_cpf_idx" ON "patients"("cpf");

-- CreateIndex
CREATE INDEX "patients_insurancePlan_idx" ON "patients"("insurancePlan");

-- CreateIndex
CREATE INDEX "patients_medicalRecordNumber_idx" ON "patients"("medicalRecordNumber");

-- CreateIndex
CREATE INDEX "patients_responsibleDoctor_idx" ON "patients"("responsibleDoctor");

-- CreateIndex
CREATE INDEX "patients_roomNumber_idx" ON "patients"("roomNumber");

-- CreateIndex
CREATE INDEX "patients_status_idx" ON "patients"("status");

-- CreateIndex
CREATE INDEX "patients_validationStatus_idx" ON "patients"("validationStatus");

-- CreateIndex
CREATE INDEX "procedures_code_idx" ON "procedures"("code");

-- CreateIndex
CREATE INDEX "procedures_patientId_idx" ON "procedures"("patientId");

-- CreateIndex
CREATE INDEX "procedures_portDivergence_idx" ON "procedures"("portDivergence");

-- CreateIndex
CREATE INDEX "procedures_riskLevel_idx" ON "procedures"("riskLevel");

-- CreateIndex
CREATE INDEX "procedures_scheduledDate_idx" ON "procedures"("scheduledDate");

-- CreateIndex
CREATE INDEX "procedures_status_idx" ON "procedures"("status");

-- CreateIndex
CREATE INDEX "procedures_validationStatus_idx" ON "procedures"("validationStatus");

-- CreateIndex
CREATE INDEX "ProcedimentoExecutado_patientid_idx" ON "ProcedimentoExecutado"("patientid");

-- CreateIndex
CREATE INDEX "ProcedimentoExecutado_procedureid_idx" ON "ProcedimentoExecutado"("procedureid");

-- CreateIndex
CREATE INDEX "ProcedimentoExecutado_dataexecucao_idx" ON "ProcedimentoExecutado"("dataexecucao");

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_billingId_fkey" FOREIGN KEY ("billingId") REFERENCES "billing_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "procedures"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_items" ADD CONSTRAINT "billing_items_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_items" ADD CONSTRAINT "billing_items_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "procedures"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedures" ADD CONSTRAINT "procedures_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
