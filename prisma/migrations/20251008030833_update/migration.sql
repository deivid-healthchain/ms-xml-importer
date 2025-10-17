/*
  Warnings:

  - You are about to drop the column `billingId` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `changes` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `entityType` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `ipAddress` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `justification` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `newData` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `oldData` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `sessionId` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `userAgent` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `validationStatus` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `accommodationStatus` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `accommodationType` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `admissionDate` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `cpf` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `currentAccommodation` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `insuranceNumber` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `insurancePlan` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `insuranceValidity` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `medicalRecordNumber` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `observations` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `responsibleDoctor` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `rg` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `roomNumber` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `validationStatus` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `actualDuration` on the `procedures` table. All the data in the column will be lost.
  - You are about to drop the column `auditNotes` on the `procedures` table. All the data in the column will be lost.
  - You are about to drop the column `auditorId` on the `procedures` table. All the data in the column will be lost.
  - You are about to drop the column `completedDate` on the `procedures` table. All the data in the column will be lost.
  - You are about to drop the column `currentPort` on the `procedures` table. All the data in the column will be lost.
  - You are about to drop the column `lastAuditDate` on the `procedures` table. All the data in the column will be lost.
  - You are about to drop the column `portDivergence` on the `procedures` table. All the data in the column will be lost.
  - You are about to drop the column `riskLevel` on the `procedures` table. All the data in the column will be lost.
  - You are about to drop the column `validationStatus` on the `procedures` table. All the data in the column will be lost.
  - You are about to drop the `billing_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `documents` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `procedimentosExecutados` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[code]` on the table `procedures` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `entity` to the `audit_logs` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `action` on the `audit_logs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `category` to the `procedures` table without a default value. This is not possible if the table is not empty.
  - Added the required column `complexity` to the `procedures` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `procedures` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProcedureCategory" AS ENUM ('GENERAL_SURGERY', 'CARDIAC_SURGERY', 'ORTHOPEDIC_SURGERY', 'NEUROSURGERY', 'PLASTIC_SURGERY', 'GYNECOLOGICAL_SURGERY', 'UROLOGICAL_SURGERY', 'OPHTHALMOLOGICAL_SURGERY', 'OTOLARYNGOLOGICAL_SURGERY', 'VASCULAR_SURGERY', 'THORACIC_SURGERY', 'PEDIATRIC_SURGERY', 'EMERGENCY_SURGERY', 'DIAGNOSTIC_PROCEDURE', 'THERAPEUTIC_PROCEDURE');

-- CreateEnum
CREATE TYPE "ProcedureComplexity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH', 'PORTE_1', 'PORTE_2', 'PORTE_3', 'PORTE_4', 'PORTE_ESPECIAL');

-- CreateEnum
CREATE TYPE "AnesthesiaType" AS ENUM ('LOCAL', 'REGIONAL', 'GENERAL', 'SEDATION', 'NONE');

-- CreateEnum
CREATE TYPE "SurgicalRole" AS ENUM ('MAIN_SURGEON', 'ASSISTANT_SURGEON', 'ANESTHESIOLOGIST', 'NURSE', 'TECHNICIAN', 'RESIDENT');

-- CreateEnum
CREATE TYPE "MaterialStatus" AS ENUM ('REQUESTED', 'APPROVED', 'DELIVERED', 'USED', 'RETURNED', 'EXPIRED', 'REJECTED');

-- CreateEnum
CREATE TYPE "MaterialUrgency" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "MaterialRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ORDERED', 'DELIVERED', 'CANCELLED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ProcedureStatus" ADD VALUE 'CONFIRMED';
ALTER TYPE "ProcedureStatus" ADD VALUE 'POSTPONED';
ALTER TYPE "ProcedureStatus" ADD VALUE 'APPROVED';
ALTER TYPE "ProcedureStatus" ADD VALUE 'REJECTED';

-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_billingId_fkey";

-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_patientId_fkey";

-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_procedureId_fkey";

-- DropForeignKey
ALTER TABLE "billing_items" DROP CONSTRAINT "billing_items_patientId_fkey";

-- DropForeignKey
ALTER TABLE "billing_items" DROP CONSTRAINT "billing_items_procedureId_fkey";

-- DropForeignKey
ALTER TABLE "documents" DROP CONSTRAINT "documents_patientId_fkey";

-- DropForeignKey
ALTER TABLE "procedures" DROP CONSTRAINT "procedures_patientId_fkey";

-- DropIndex
DROP INDEX "audit_logs_action_idx";

-- DropIndex
DROP INDEX "audit_logs_createdAt_idx";

-- DropIndex
DROP INDEX "audit_logs_entityType_entityId_idx";

-- DropIndex
DROP INDEX "audit_logs_userId_idx";

-- DropIndex
DROP INDEX "audit_logs_validationStatus_idx";

-- DropIndex
DROP INDEX "patients_admissionDate_idx";

-- DropIndex
DROP INDEX "patients_cpf_idx";

-- DropIndex
DROP INDEX "patients_cpf_key";

-- DropIndex
DROP INDEX "patients_insurancePlan_idx";

-- DropIndex
DROP INDEX "patients_medicalRecordNumber_idx";

-- DropIndex
DROP INDEX "patients_medicalRecordNumber_key";

-- DropIndex
DROP INDEX "patients_responsibleDoctor_idx";

-- DropIndex
DROP INDEX "patients_roomNumber_idx";

-- DropIndex
DROP INDEX "patients_status_idx";

-- DropIndex
DROP INDEX "patients_validationStatus_idx";

-- DropIndex
DROP INDEX "procedures_code_idx";

-- DropIndex
DROP INDEX "procedures_patientId_idx";

-- DropIndex
DROP INDEX "procedures_portDivergence_idx";

-- DropIndex
DROP INDEX "procedures_riskLevel_idx";

-- DropIndex
DROP INDEX "procedures_scheduledDate_idx";

-- DropIndex
DROP INDEX "procedures_status_idx";

-- DropIndex
DROP INDEX "procedures_validationStatus_idx";

-- AlterTable
ALTER TABLE "audit_logs" DROP COLUMN "billingId",
DROP COLUMN "changes",
DROP COLUMN "description",
DROP COLUMN "entityType",
DROP COLUMN "ipAddress",
DROP COLUMN "justification",
DROP COLUMN "metadata",
DROP COLUMN "newData",
DROP COLUMN "oldData",
DROP COLUMN "sessionId",
DROP COLUMN "userAgent",
DROP COLUMN "validationStatus",
ADD COLUMN     "entity" TEXT NOT NULL,
ADD COLUMN     "newValues" JSONB,
ADD COLUMN     "oldValues" JSONB,
DROP COLUMN "action",
ADD COLUMN     "action" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "patients" DROP COLUMN "accommodationStatus",
DROP COLUMN "accommodationType",
DROP COLUMN "address",
DROP COLUMN "admissionDate",
DROP COLUMN "cpf",
DROP COLUMN "currentAccommodation",
DROP COLUMN "gender",
DROP COLUMN "insuranceNumber",
DROP COLUMN "insurancePlan",
DROP COLUMN "insuranceValidity",
DROP COLUMN "medicalRecordNumber",
DROP COLUMN "observations",
DROP COLUMN "responsibleDoctor",
DROP COLUMN "rg",
DROP COLUMN "roomNumber",
DROP COLUMN "status",
DROP COLUMN "validationStatus",
ALTER COLUMN "birthDate" DROP NOT NULL,
ALTER COLUMN "phone" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL;

-- AlterTable
ALTER TABLE "procedures" DROP COLUMN "actualDuration",
DROP COLUMN "auditNotes",
DROP COLUMN "auditorId",
DROP COLUMN "completedDate",
DROP COLUMN "currentPort",
DROP COLUMN "lastAuditDate",
DROP COLUMN "portDivergence",
DROP COLUMN "riskLevel",
DROP COLUMN "validationStatus",
ADD COLUMN     "actualPort" INTEGER,
ADD COLUMN     "anesthesiaType" "AnesthesiaType",
ADD COLUMN     "basePrice" DECIMAL(10,2),
ADD COLUMN     "category" "ProcedureCategory" NOT NULL,
ADD COLUMN     "complexity" "ProcedureComplexity" NOT NULL,
ADD COLUMN     "complications" TEXT,
ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "performedDate" TIMESTAMP(3),
ADD COLUMN     "postOperativeInstructions" TEXT,
ADD COLUMN     "preOperativeExams" TEXT[],
ADD COLUMN     "requiresAuthorization" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "subcategory" TEXT,
ADD COLUMN     "tags" TEXT[],
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'SCHEDULED';

-- DropTable
DROP TABLE "billing_items";

-- DropTable
DROP TABLE "documents";

-- DropTable
DROP TABLE "procedimentosExecutados";

-- DropEnum
DROP TYPE "AccommodationStatus";

-- DropEnum
DROP TYPE "AccommodationType";

-- DropEnum
DROP TYPE "AuditAction";

-- DropEnum
DROP TYPE "BillingCategory";

-- DropEnum
DROP TYPE "BillingStatus";

-- DropEnum
DROP TYPE "CoverageType";

-- DropEnum
DROP TYPE "DocumentCategory";

-- DropEnum
DROP TYPE "EntityType";

-- DropEnum
DROP TYPE "Gender";

-- DropEnum
DROP TYPE "PatientStatus";

-- DropEnum
DROP TYPE "RiskLevel";

-- DropEnum
DROP TYPE "ValidationStatus";

-- CreateTable
CREATE TABLE "surgical_team_members" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "SurgicalRole" NOT NULL,
    "crm" TEXT,
    "specialty" TEXT,
    "procedureId" TEXT NOT NULL,

    CONSTRAINT "surgical_team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procedure_materials" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "supplier" TEXT,
    "batchNumber" TEXT,
    "expirationDate" TIMESTAMP(3),
    "status" "MaterialStatus" NOT NULL DEFAULT 'REQUESTED',
    "procedureId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "procedure_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "port_validations" (
    "id" TEXT NOT NULL,
    "suggestedPort" INTEGER NOT NULL,
    "actualPort" INTEGER NOT NULL,
    "isValid" BOOLEAN NOT NULL,
    "discrepancy" INTEGER NOT NULL,
    "reason" TEXT,
    "validatedBy" TEXT,
    "validatedAt" TIMESTAMP(3),
    "procedureId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "port_validations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "port_validation_rules" (
    "id" TEXT NOT NULL,
    "procedureCode" TEXT NOT NULL,
    "procedureName" TEXT NOT NULL,
    "category" "ProcedureCategory" NOT NULL,
    "complexity" "ProcedureComplexity" NOT NULL,
    "minimumPort" INTEGER NOT NULL,
    "maximumPort" INTEGER NOT NULL,
    "recommendedPort" INTEGER NOT NULL,
    "factors" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "port_validation_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "material_requests" (
    "id" TEXT NOT NULL,
    "procedureId" TEXT NOT NULL,
    "materialCode" TEXT NOT NULL,
    "materialName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "urgency" "MaterialUrgency" NOT NULL DEFAULT 'MEDIUM',
    "requestedBy" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "status" "MaterialRequestStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "material_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "port_validation_rules_procedureCode_key" ON "port_validation_rules"("procedureCode");

-- CreateIndex
CREATE UNIQUE INDEX "procedures_code_key" ON "procedures"("code");

-- AddForeignKey
ALTER TABLE "procedures" ADD CONSTRAINT "procedures_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surgical_team_members" ADD CONSTRAINT "surgical_team_members_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "procedures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedure_materials" ADD CONSTRAINT "procedure_materials_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "procedures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "port_validations" ADD CONSTRAINT "port_validations_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "procedures"("id") ON DELETE CASCADE ON UPDATE CASCADE;
