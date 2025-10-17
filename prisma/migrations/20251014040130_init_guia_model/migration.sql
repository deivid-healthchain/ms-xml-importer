/*
  Warnings:

  - The values [PENDING_APPROVAL,CONFIRMED,POSTPONED,APPROVED,REJECTED] on the enum `ProcedureStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `actualPort` on the `procedures` table. All the data in the column will be lost.
  - You are about to drop the column `anesthesiaType` on the `procedures` table. All the data in the column will be lost.
  - You are about to drop the column `complications` on the `procedures` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `procedures` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `procedures` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `procedures` table. All the data in the column will be lost.
  - You are about to drop the column `performedDate` on the `procedures` table. All the data in the column will be lost.
  - You are about to drop the column `postOperativeInstructions` on the `procedures` table. All the data in the column will be lost.
  - You are about to drop the column `preOperativeExams` on the `procedures` table. All the data in the column will be lost.
  - You are about to drop the column `scheduledDate` on the `procedures` table. All the data in the column will be lost.
  - You are about to drop the column `suggestedPort` on the `procedures` table. All the data in the column will be lost.
  - You are about to drop the `material_requests` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `port_validation_rules` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `port_validations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `procedimentosExecutados` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `procedure_materials` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `surgical_team_members` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[cpf]` on the table `patients` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[medicalRecordNumber]` on the table `patients` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `entity` on the `audit_logs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `action` on the `audit_logs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `accommodationStatus` to the `patients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accommodationType` to the `patients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `address` to the `patients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissionDate` to the `patients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cpf` to the `patients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currentAccommodation` to the `patients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `patients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `insuranceNumber` to the `patients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `insurancePlan` to the `patients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `insuranceValidity` to the `patients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `medicalRecordNumber` to the `patients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `responsibleDoctor` to the `patients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rg` to the `patients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roomNumber` to the `patients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `patients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `validationStatus` to the `patients` table without a default value. This is not possible if the table is not empty.
  - Made the column `birthDate` on table `patients` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone` on table `patients` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `patients` required. This step will fail if there are existing NULL values in that column.
  - Made the column `estimatedDuration` on table `procedures` required. This step will fail if there are existing NULL values in that column.
  - Made the column `basePrice` on table `procedures` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `category` on the `procedures` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `complexity` on the `procedures` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "PatientStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DISCHARGED', 'TRANSFERRED');

-- CreateEnum
CREATE TYPE "ValidationStatus" AS ENUM ('PENDING', 'VALIDATED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AccommodationType" AS ENUM ('STANDARD', 'PREMIUM', 'VIP', 'ICU');

-- CreateEnum
CREATE TYPE "AccommodationStatus" AS ENUM ('OCCUPIED', 'AVAILABLE', 'MAINTENANCE', 'RESERVED');

-- CreateEnum
CREATE TYPE "BillingStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PAID');

-- CreateEnum
CREATE TYPE "AuditLogAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'VIEW', 'APPROVE', 'REJECT');

-- CreateEnum
CREATE TYPE "AuditLogEntity" AS ENUM ('PATIENT', 'PROCEDURE', 'BILLING', 'DOCUMENT', 'USER');

-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('MEDICAL_RECORD', 'INSURANCE', 'IDENTIFICATION', 'PROCEDURE_REPORT', 'BILLING_DOCUMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "BusinessRuleType" AS ENUM ('VALIDATION', 'CALCULATION', 'WORKFLOW', 'NOTIFICATION');

-- CreateEnum
CREATE TYPE "RuleStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DRAFT');

-- AlterEnum
BEGIN;
CREATE TYPE "ProcedureStatus_new" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
ALTER TABLE "procedures" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "procedures" ALTER COLUMN "status" TYPE "ProcedureStatus_new" USING ("status"::text::"ProcedureStatus_new");
ALTER TYPE "ProcedureStatus" RENAME TO "ProcedureStatus_old";
ALTER TYPE "ProcedureStatus_new" RENAME TO "ProcedureStatus";
DROP TYPE "ProcedureStatus_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "port_validations" DROP CONSTRAINT "port_validations_procedureId_fkey";

-- DropForeignKey
ALTER TABLE "procedure_materials" DROP CONSTRAINT "procedure_materials_procedureId_fkey";

-- DropForeignKey
ALTER TABLE "procedures" DROP CONSTRAINT "procedures_patientId_fkey";

-- DropForeignKey
ALTER TABLE "surgical_team_members" DROP CONSTRAINT "surgical_team_members_procedureId_fkey";

-- AlterTable
ALTER TABLE "audit_logs" ADD COLUMN     "billingAccountId" TEXT,
ADD COLUMN     "changes" JSONB,
ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "sessionId" TEXT,
ADD COLUMN     "userAgent" TEXT,
DROP COLUMN "entity",
ADD COLUMN     "entity" "AuditLogEntity" NOT NULL,
DROP COLUMN "action",
ADD COLUMN     "action" "AuditLogAction" NOT NULL;

-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "accommodationStatus" "AccommodationStatus" NOT NULL,
ADD COLUMN     "accommodationType" "AccommodationType" NOT NULL,
ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "admissionDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "cpf" TEXT NOT NULL,
ADD COLUMN     "currentAccommodation" "AccommodationType" NOT NULL,
ADD COLUMN     "gender" "Gender" NOT NULL,
ADD COLUMN     "insuranceNumber" TEXT NOT NULL,
ADD COLUMN     "insurancePlan" TEXT NOT NULL,
ADD COLUMN     "insuranceValidity" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "medicalRecordNumber" TEXT NOT NULL,
ADD COLUMN     "observations" TEXT,
ADD COLUMN     "responsibleDoctor" TEXT NOT NULL,
ADD COLUMN     "rg" TEXT NOT NULL,
ADD COLUMN     "roomNumber" TEXT NOT NULL,
ADD COLUMN     "status" "PatientStatus" NOT NULL,
ADD COLUMN     "validationStatus" "ValidationStatus" NOT NULL,
ALTER COLUMN "birthDate" SET NOT NULL,
ALTER COLUMN "phone" SET NOT NULL,
ALTER COLUMN "email" SET NOT NULL;

-- AlterTable
ALTER TABLE "procedures" DROP COLUMN "actualPort",
DROP COLUMN "anesthesiaType",
DROP COLUMN "complications",
DROP COLUMN "deletedAt",
DROP COLUMN "duration",
DROP COLUMN "notes",
DROP COLUMN "performedDate",
DROP COLUMN "postOperativeInstructions",
DROP COLUMN "preOperativeExams",
DROP COLUMN "scheduledDate",
DROP COLUMN "suggestedPort",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "patientId" DROP NOT NULL,
ALTER COLUMN "status" DROP DEFAULT,
ALTER COLUMN "estimatedDuration" SET NOT NULL,
ALTER COLUMN "basePrice" SET NOT NULL,
DROP COLUMN "category",
ADD COLUMN     "category" TEXT NOT NULL,
DROP COLUMN "complexity",
ADD COLUMN     "complexity" TEXT NOT NULL;

-- DropTable
DROP TABLE "material_requests";

-- DropTable
DROP TABLE "port_validation_rules";

-- DropTable
DROP TABLE "port_validations";

-- DropTable
DROP TABLE "procedimentosExecutados";

-- DropTable
DROP TABLE "procedure_materials";

-- DropTable
DROP TABLE "surgical_team_members";

-- DropEnum
DROP TYPE "AnesthesiaType";

-- DropEnum
DROP TYPE "MaterialRequestStatus";

-- DropEnum
DROP TYPE "MaterialStatus";

-- DropEnum
DROP TYPE "MaterialUrgency";

-- DropEnum
DROP TYPE "ProcedureCategory";

-- DropEnum
DROP TYPE "ProcedureComplexity";

-- DropEnum
DROP TYPE "SurgicalRole";

-- CreateTable
CREATE TABLE "billing_accounts" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "paidAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "remainingAmount" DECIMAL(10,2) NOT NULL,
    "status" "BillingStatus" NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_items" (
    "id" TEXT NOT NULL,
    "billingAccountId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "procedureId" TEXT,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" "BillingStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "category" "DocumentCategory" NOT NULL,
    "subcategory" TEXT,
    "tags" TEXT[],
    "content" TEXT,
    "summary" TEXT,
    "patientId" TEXT,
    "isProcessed" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_rules" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "code" TEXT NOT NULL,
    "type" "BusinessRuleType" NOT NULL,
    "status" "RuleStatus" NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "conditions" JSONB NOT NULL,
    "actions" JSONB NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "tags" TEXT[],

    CONSTRAINT "business_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dialogues" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "patientId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "tags" TEXT[],

    CONSTRAINT "dialogues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_agents" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "model" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isTraining" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[],

    CONSTRAINT "ai_agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hospital_systems" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "endpoint" TEXT NOT NULL,
    "apiKey" TEXT,
    "config" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isConnected" BOOLEAN NOT NULL DEFAULT false,
    "lastSync" TIMESTAMP(3),
    "version" TEXT NOT NULL DEFAULT '1.0',
    "tags" TEXT[],

    CONSTRAINT "hospital_systems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guia" (
    "id" TEXT NOT NULL,
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
    "procedimentos" JSONB,
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

    CONSTRAINT "Guia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "billing_accounts_accountNumber_key" ON "billing_accounts"("accountNumber");

-- CreateIndex
CREATE INDEX "billing_accounts_patientId_idx" ON "billing_accounts"("patientId");

-- CreateIndex
CREATE INDEX "billing_accounts_accountNumber_idx" ON "billing_accounts"("accountNumber");

-- CreateIndex
CREATE INDEX "billing_accounts_status_idx" ON "billing_accounts"("status");

-- CreateIndex
CREATE INDEX "billing_items_billingAccountId_idx" ON "billing_items"("billingAccountId");

-- CreateIndex
CREATE INDEX "billing_items_patientId_idx" ON "billing_items"("patientId");

-- CreateIndex
CREATE INDEX "billing_items_procedureId_idx" ON "billing_items"("procedureId");

-- CreateIndex
CREATE INDEX "documents_category_idx" ON "documents"("category");

-- CreateIndex
CREATE INDEX "documents_patientId_idx" ON "documents"("patientId");

-- CreateIndex
CREATE INDEX "documents_createdAt_idx" ON "documents"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "business_rules_code_key" ON "business_rules"("code");

-- CreateIndex
CREATE INDEX "business_rules_code_idx" ON "business_rules"("code");

-- CreateIndex
CREATE INDEX "business_rules_type_idx" ON "business_rules"("type");

-- CreateIndex
CREATE INDEX "business_rules_status_idx" ON "business_rules"("status");

-- CreateIndex
CREATE INDEX "business_rules_isActive_idx" ON "business_rules"("isActive");

-- CreateIndex
CREATE INDEX "dialogues_patientId_idx" ON "dialogues"("patientId");

-- CreateIndex
CREATE INDEX "dialogues_type_idx" ON "dialogues"("type");

-- CreateIndex
CREATE INDEX "dialogues_isActive_idx" ON "dialogues"("isActive");

-- CreateIndex
CREATE INDEX "ai_agents_type_idx" ON "ai_agents"("type");

-- CreateIndex
CREATE INDEX "ai_agents_isActive_idx" ON "ai_agents"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "hospital_systems_code_key" ON "hospital_systems"("code");

-- CreateIndex
CREATE INDEX "hospital_systems_code_idx" ON "hospital_systems"("code");

-- CreateIndex
CREATE INDEX "hospital_systems_isActive_idx" ON "hospital_systems"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Guia_numeroGuiaPrestador_key" ON "Guia"("numeroGuiaPrestador");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs"("entity");

-- CreateIndex
CREATE INDEX "audit_logs_entityId_idx" ON "audit_logs"("entityId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_patientId_idx" ON "audit_logs"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "patients_cpf_key" ON "patients"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "patients_medicalRecordNumber_key" ON "patients"("medicalRecordNumber");

-- CreateIndex
CREATE INDEX "patients_cpf_idx" ON "patients"("cpf");

-- CreateIndex
CREATE INDEX "patients_medicalRecordNumber_idx" ON "patients"("medicalRecordNumber");

-- CreateIndex
CREATE INDEX "patients_roomNumber_idx" ON "patients"("roomNumber");

-- CreateIndex
CREATE INDEX "patients_status_idx" ON "patients"("status");

-- CreateIndex
CREATE INDEX "patients_validationStatus_idx" ON "patients"("validationStatus");

-- CreateIndex
CREATE INDEX "procedures_code_idx" ON "procedures"("code");

-- CreateIndex
CREATE INDEX "procedures_category_idx" ON "procedures"("category");

-- CreateIndex
CREATE INDEX "procedures_status_idx" ON "procedures"("status");

-- CreateIndex
CREATE INDEX "procedures_patientId_idx" ON "procedures"("patientId");

-- AddForeignKey
ALTER TABLE "procedures" ADD CONSTRAINT "procedures_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_accounts" ADD CONSTRAINT "billing_accounts_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_items" ADD CONSTRAINT "billing_items_billingAccountId_fkey" FOREIGN KEY ("billingAccountId") REFERENCES "billing_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_items" ADD CONSTRAINT "billing_items_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_items" ADD CONSTRAINT "billing_items_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "procedures"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "procedures"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_billingAccountId_fkey" FOREIGN KEY ("billingAccountId") REFERENCES "billing_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dialogues" ADD CONSTRAINT "dialogues_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
