# Guia de Implementação - ms-xml-importer (Refatoração Completa)

## Visão Geral

O ms-xml-importer será refatorado para orquestrar chamadas a todos os microsserviços necessários para criar um paciente completo com todos os dados do XML.

## Arquitetura Proposta

```
ms-xml-importer/
├── src/
│   ├── index.ts                    # Servidor Express
│   ├── routes.ts                   # Rotas HTTP
│   ├── parser.ts                   # Parser XML (já existe)
│   ├── db.ts                       # Conexão Prisma (já existe)
│   ├── services/
│   │   ├── orchestrator.service.ts # Orquestrador principal (NOVO)
│   │   ├── patient.client.ts       # Cliente ms-patients (NOVO)
│   │   ├── procedure.client.ts     # Cliente ms-procedures (NOVO)
│   │   ├── billing.client.ts       # Cliente ms-billing (NOVO)
│   │   ├── audit.client.ts         # Cliente ms-audit (NOVO)
│   │   └── validation.service.ts   # Validações de domínio (NOVO)
│   └── types/
│       └── import-result.types.ts  # Tipos de resultado (NOVO)
```

## 1. Tipos de Resultado

**Arquivo**: `src/types/import-result.types.ts` (CRIAR NOVO)

```typescript
export interface ImportResult {
  success: boolean;
  guiaId?: string;
  patientId?: string;
  proceduresCreated: number;
  billingAccountId?: string;
  validations: ValidationResult[];
  errors: string[];
  warnings: string[];
}

export interface ValidationResult {
  type: 'PORTE' | 'DOMAIN' | 'MATERIAL' | 'VALUE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  message: string;
  field?: string;
  expectedValue?: string;
  actualValue?: string;
}

export interface PatientData {
  insuranceNumber: string;
  fullName?: string;
  atendimentoRN?: string;
}

export interface ProcedureData {
  code: string;
  name: string;
  porte?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  executionDate?: string;
  professionalName?: string;
}

export interface BillingData {
  accountNumber: string;
  patientId: string;
  totalAmount: number;
  items: BillingItemData[];
}

export interface BillingItemData {
  description: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}
```

## 2. Cliente ms-patients

**Arquivo**: `src/services/patient.client.ts` (CRIAR NOVO)

```typescript
import axios from 'axios';

const MS_PATIENTS_URL = process.env.MS_PATIENTS_URL || 'http://localhost:3000/api/v1';

export class PatientClient {
  /**
   * Busca paciente por número da carteira
   */
  async findByInsuranceNumber(insuranceNumber: string) {
    try {
      const response = await axios.get(
        `${MS_PATIENTS_URL}/patients/insurance/${insuranceNumber}`
      );
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Cria paciente a partir de dados do XML
   */
  async createFromXML(data: {
    insuranceNumber: string;
    fullName?: string;
    atendimentoRN?: string;
  }) {
    try {
      const response = await axios.post(
        `${MS_PATIENTS_URL}/patients/from-xml`,
        data
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Error creating patient from XML:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Busca ou cria paciente
   */
  async findOrCreate(data: {
    insuranceNumber: string;
    fullName?: string;
    atendimentoRN?: string;
  }) {
    // Tentar buscar primeiro
    let patient = await this.findByInsuranceNumber(data.insuranceNumber);
    
    // Se não encontrou, criar
    if (!patient) {
      patient = await this.createFromXML(data);
    }
    
    return patient;
  }
}
```

## 3. Cliente ms-procedures

**Arquivo**: `src/services/procedure.client.ts` (CRIAR NOVO)

```typescript
import axios from 'axios';

const MS_PROCEDURES_URL = process.env.MS_PROCEDURES_URL || 'http://localhost:3002/api/v1';

export class ProcedureClient {
  /**
   * Valida porte de um procedimento
   */
  async validatePorte(procedureCode: string, porte: string) {
    try {
      const response = await axios.post(
        `${MS_PROCEDURES_URL}/procedures/validate-porte`,
        { procedureCode, porte }
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Error validating porte:', error.response?.data || error.message);
      return {
        isValid: false,
        message: 'Erro ao validar porte',
        severity: 'HIGH'
      };
    }
  }

  /**
   * Valida múltiplos portes em lote
   */
  async validatePorteBatch(procedures: Array<{ code: string; porte: string }>) {
    try {
      const response = await axios.post(
        `${MS_PROCEDURES_URL}/procedures/validate-porte-batch`,
        { procedures }
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Error validating porte batch:', error.response?.data || error.message);
      return { summary: {}, results: [] };
    }
  }

  /**
   * Cria procedimento
   */
  async create(data: any) {
    try {
      const response = await axios.post(
        `${MS_PROCEDURES_URL}/procedures`,
        data
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Error creating procedure:', error.response?.data || error.message);
      throw error;
    }
  }
}
```

## 4. Cliente ms-billing

**Arquivo**: `src/services/billing.client.ts` (CRIAR NOVO)

```typescript
import axios from 'axios';

const MS_BILLING_URL = process.env.MS_BILLING_URL || 'http://localhost:3003/api/v1';

export class BillingClient {
  /**
   * Cria conta de faturamento
   */
  async createAccount(data: {
    accountNumber: string;
    patientId: string;
    totalAmount: number;
    status?: string;
  }) {
    try {
      const response = await axios.post(
        `${MS_BILLING_URL}/billing/accounts`,
        data
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Error creating billing account:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Adiciona item à conta de faturamento
   */
  async addItem(accountId: string, data: {
    description: string;
    category: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }) {
    try {
      const response = await axios.post(
        `${MS_BILLING_URL}/billing/accounts/${accountId}/items`,
        data
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Error adding billing item:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Adiciona múltiplos itens em lote
   */
  async addItemsBatch(accountId: string, items: any[]) {
    const results = [];
    for (const item of items) {
      try {
        const result = await this.addItem(accountId, item);
        results.push(result);
      } catch (error) {
        console.error('Error adding item:', item, error);
      }
    }
    return results;
  }
}
```

## 5. Cliente ms-audit

**Arquivo**: `src/services/audit.client.ts` (CRIAR NOVO)

```typescript
import axios from 'axios';

const MS_AUDIT_URL = process.env.MS_AUDIT_URL || 'http://localhost:3004/api/v1';

export class AuditClient {
  /**
   * Registra log de importação de XML
   */
  async logXMLImport(data: {
    fileName: string;
    patientId?: string;
    guiaId?: string;
    status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
    validations: any[];
    errors: string[];
  }) {
    try {
      const response = await axios.post(
        `${MS_AUDIT_URL}/audit/xml-import`,
        data
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Error logging XML import:', error.response?.data || error.message);
      // Não falhar a importação se o log falhar
      return null;
    }
  }

  /**
   * Registra validação
   */
  async logValidation(data: {
    entityId: string;
    entityType: string;
    validationType: string;
    result: any;
  }) {
    try {
      const response = await axios.post(
        `${MS_AUDIT_URL}/audit/validations`,
        data
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Error logging validation:', error.response?.data || error.message);
      return null;
    }
  }
}
```

## 6. Serviço de Validação de Domínio

**Arquivo**: `src/services/validation.service.ts` (CRIAR NOVO)

```typescript
import { prisma } from '../db';

export class ValidationService {
  /**
   * Valida código de via de acesso
   */
  async validateViaAcesso(codigo: string): Promise<boolean> {
    if (!codigo) return true; // Opcional
    
    const exists = await prisma.tbdomViaAcesso.findUnique({
      where: { codigoTermo: codigo }
    });
    return !!exists;
  }

  /**
   * Valida código de técnica utilizada
   */
  async validateTecnicaUtilizada(codigo: string): Promise<boolean> {
    if (!codigo) return true; // Opcional
    
    const exists = await prisma.tbdomTecnicaUtilizada.findUnique({
      where: { codigoTermo: codigo }
    });
    return !!exists;
  }

  /**
   * Valida código de tabela de procedimento
   */
  async validateCodigoTabela(codigo: string): Promise<boolean> {
    if (!codigo) return true;
    
    const exists = await prisma.tbdomCodigoTabela.findUnique({
      where: { codigoTermo: codigo }
    });
    return !!exists;
  }

  /**
   * Valida todos os códigos de domínio de um procedimento
   */
  async validateProcedureDomains(procedimento: any) {
    const validations = [];

    if (procedimento.codigoTabela) {
      const valid = await this.validateCodigoTabela(procedimento.codigoTabela);
      if (!valid) {
        validations.push({
          type: 'DOMAIN',
          severity: 'MEDIUM',
          message: `Código de tabela inválido: ${procedimento.codigoTabela}`,
          field: 'codigoTabela'
        });
      }
    }

    if (procedimento.viaAcesso) {
      const valid = await this.validateViaAcesso(procedimento.viaAcesso);
      if (!valid) {
        validations.push({
          type: 'DOMAIN',
          severity: 'LOW',
          message: `Via de acesso inválida: ${procedimento.viaAcesso}`,
          field: 'viaAcesso'
        });
      }
    }

    if (procedimento.tecnicaUtilizada) {
      const valid = await this.validateTecnicaUtilizada(procedimento.tecnicaUtilizada);
      if (!valid) {
        validations.push({
          type: 'DOMAIN',
          severity: 'LOW',
          message: `Técnica utilizada inválida: ${procedimento.tecnicaUtilizada}`,
          field: 'tecnicaUtilizada'
        });
      }
    }

    return validations;
  }
}
```

## 7. Orquestrador Principal

**Arquivo**: `src/services/orchestrator.service.ts` (CRIAR NOVO)

```typescript
import { PatientClient } from './patient.client';
import { ProcedureClient } from './procedure.client';
import { BillingClient } from './billing.client';
import { AuditClient } from './audit.client';
import { ValidationService } from './validation.service';
import { prisma } from '../db';
import { ImportResult, ValidationResult } from '../types/import-result.types';

export class OrchestratorService {
  private patientClient: PatientClient;
  private procedureClient: ProcedureClient;
  private billingClient: BillingClient;
  private auditClient: AuditClient;
  private validationService: ValidationService;

  constructor() {
    this.patientClient = new PatientClient();
    this.procedureClient = new ProcedureClient();
    this.billingClient = new BillingClient();
    this.auditClient = new AuditClient();
    this.validationService = new ValidationService();
  }

  /**
   * Processa uma guia completa do XML
   */
  async processGuia(guiaData: any, fileName: string): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      proceduresCreated: 0,
      validations: [],
      errors: [],
      warnings: []
    };

    try {
      console.log(`\n📋 Processando guia ${guiaData.numeroGuiaPrestador}...`);

      // 1️⃣ BUSCAR OU CRIAR PACIENTE
      console.log('👤 Buscando/criando paciente...');
      const patient = await this.patientClient.findOrCreate({
        insuranceNumber: guiaData.numeroCarteira,
        fullName: guiaData.nomeBeneficiario || undefined,
        atendimentoRN: guiaData.atendimentoRN
      });
      result.patientId = patient.id;
      console.log(`✅ Paciente: ${patient.id}`);

      // 2️⃣ VALIDAR PORTES DOS PROCEDIMENTOS
      console.log('🔍 Validando portes dos procedimentos...');
      const proceduresForValidation = guiaData.procedimentos.map((p: any) => ({
        code: p.codigoProcedimento,
        porte: p.porte || '0'
      }));

      const porteValidation = await this.procedureClient.validatePorteBatch(proceduresForValidation);
      
      if (porteValidation.results) {
        for (const validation of porteValidation.results) {
          if (!validation.isValid) {
            result.validations.push({
              type: 'PORTE',
              severity: validation.severity,
              message: validation.message,
              expectedValue: validation.expectedPorte || undefined,
              actualValue: validation.actualPorte
            });
          }
        }
      }

      console.log(`   Portes validados: ${porteValidation.summary?.total || 0}`);
      console.log(`   Divergências: ${porteValidation.summary?.invalid || 0}`);

      // 3️⃣ VALIDAR CÓDIGOS DE DOMÍNIO
      console.log('🔍 Validando códigos de domínio...');
      for (const proc of guiaData.procedimentos) {
        const domainValidations = await this.validationService.validateProcedureDomains(proc);
        result.validations.push(...domainValidations);
      }

      // 4️⃣ CRIAR CONTA DE FATURAMENTO
      console.log('💰 Criando conta de faturamento...');
      const billingAccount = await this.billingClient.createAccount({
        accountNumber: guiaData.numeroGuiaPrestador,
        patientId: patient.id,
        totalAmount: guiaData.valorTotalGeral || 0,
        status: 'PENDING'
      });
      result.billingAccountId = billingAccount.id;
      console.log(`✅ Conta de faturamento: ${billingAccount.id}`);

      // 5️⃣ ADICIONAR ITENS DE FATURAMENTO (PROCEDIMENTOS)
      console.log('📝 Adicionando procedimentos ao faturamento...');
      const billingItems = guiaData.procedimentos.map((proc: any) => ({
        description: proc.descricaoProcedimento || proc.codigoProcedimento,
        category: 'PROCEDURE',
        quantity: proc.quantidadeExecutada || 1,
        unitPrice: proc.valorUnitario || 0,
        totalPrice: proc.valorTotal || 0
      }));

      await this.billingClient.addItemsBatch(billingAccount.id, billingItems);
      result.proceduresCreated = billingItems.length;
      console.log(`✅ ${billingItems.length} procedimentos adicionados`);

      // 6️⃣ ADICIONAR OUTRAS DESPESAS (MATERIAIS, MEDICAMENTOS)
      if (guiaData.outrasDespesas && guiaData.outrasDespesas.length > 0) {
        console.log('📦 Adicionando outras despesas...');
        const otherItems = guiaData.outrasDespesas.map((desp: any) => ({
          description: desp.descricao || 'Despesa',
          category: desp.tipo || 'OTHER',
          quantity: desp.quantidade || 1,
          unitPrice: desp.valorUnitario || 0,
          totalPrice: desp.valorTotal || 0
        }));

        await this.billingClient.addItemsBatch(billingAccount.id, otherItems);
        console.log(`✅ ${otherItems.length} outras despesas adicionadas`);
      }

      // 7️⃣ CRIAR GUIA NO BANCO LOCAL
      console.log('💾 Salvando guia no banco...');
      const { procedimentos, ...dadosGuia } = guiaData;
      
      const guia = await prisma.guia.create({
        data: {
          ...dadosGuia,
          patientId: patient.id,
          billingAccountId: billingAccount.id
        }
      });
      result.guiaId = guia.id;

      // Criar procedimentos locais
      if (procedimentos && procedimentos.length > 0) {
        await prisma.procedimento.createMany({
          data: procedimentos.map((proc: any) => ({
            ...proc,
            guiaId: guia.id
          })),
          skipDuplicates: true
        });
      }

      console.log(`✅ Guia salva: ${guia.id}`);

      // 8️⃣ REGISTRAR AUDITORIA
      console.log('📊 Registrando auditoria...');
      await this.auditClient.logXMLImport({
        fileName,
        patientId: patient.id,
        guiaId: guia.id,
        status: result.validations.length > 0 ? 'PARTIAL' : 'SUCCESS',
        validations: result.validations,
        errors: result.errors
      });

      result.success = true;
      console.log(`\n✅ Guia ${guiaData.numeroGuiaPrestador} processada com sucesso!`);

    } catch (error: any) {
      console.error(`\n❌ Erro ao processar guia:`, error.message);
      result.errors.push(error.message);
      result.success = false;

      // Registrar erro na auditoria
      await this.auditClient.logXMLImport({
        fileName,
        status: 'FAILED',
        validations: result.validations,
        errors: result.errors
      });
    }

    return result;
  }
}
```

## 8. Atualizar Rotas

**Arquivo**: `src/routes.ts` (MODIFICAR)

```typescript
import express, { Request, Response } from 'express';
import multer from 'multer';
import AdmZip from 'adm-zip';
import fs from 'fs';
import { parseTISS } from './parser';
import { OrchestratorService } from './services/orchestrator.service';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });
const orchestrator = new OrchestratorService();

/**
 * Endpoint principal: Upload de arquivo (ZIP ou XML)
 */
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  }

  const results = [];
  const summary = {
    totalGuias: 0,
    successfulGuias: 0,
    failedGuias: 0,
    totalValidations: 0,
    totalErrors: 0
  };

  try {
    const { path, originalname, mimetype } = req.file;

    let xmlFiles: Array<{ name: string; content: string }> = [];

    // Processar ZIP ou XML
    if (mimetype === 'application/zip' || originalname.endsWith('.zip')) {
      console.log('📦 ZIP detectado. Extraindo XMLs...');
      const zip = new AdmZip(path);
      const xmlEntries = zip.getEntries().filter(e => e.entryName.endsWith('.xml'));

      if (xmlEntries.length === 0) {
        return res.status(400).json({ error: 'Nenhum arquivo XML encontrado no ZIP.' });
      }

      xmlFiles = xmlEntries.map(entry => ({
        name: entry.entryName,
        content: entry.getData().toString('utf-8')
      }));
    } else if (
      mimetype === 'application/xml' ||
      mimetype === 'text/xml' ||
      originalname.endsWith('.xml')
    ) {
      console.log('📄 XML único detectado. Processando...');
      xmlFiles = [{
        name: originalname,
        content: fs.readFileSync(path, 'utf-8')
      }];
    } else {
      return res.status(400).json({ error: 'Tipo de arquivo não suportado. Envie um .zip ou .xml.' });
    }

    // Processar cada XML
    for (const xmlFile of xmlFiles) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📄 Processando arquivo: ${xmlFile.name}`);
      console.log('='.repeat(60));

      const guias = await parseTISS(xmlFile.content);

      if (!guias || guias.length === 0) {
        console.log(`⚠️ Nenhuma guia encontrada em ${xmlFile.name}.`);
        continue;
      }

      summary.totalGuias += guias.length;

      for (const guiaData of guias) {
        const result = await orchestrator.processGuia(guiaData, xmlFile.name);
        results.push(result);

        if (result.success) {
          summary.successfulGuias++;
        } else {
          summary.failedGuias++;
        }

        summary.totalValidations += result.validations.length;
        summary.totalErrors += result.errors.length;
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 RESUMO DA IMPORTAÇÃO');
    console.log('='.repeat(60));
    console.log(`Total de guias: ${summary.totalGuias}`);
    console.log(`✅ Sucesso: ${summary.successfulGuias}`);
    console.log(`❌ Falhas: ${summary.failedGuias}`);
    console.log(`⚠️ Validações: ${summary.totalValidations}`);
    console.log(`🔴 Erros: ${summary.totalErrors}`);
    console.log('='.repeat(60));

    res.json({
      message: '✅ Processamento concluído',
      summary,
      results
    });

  } catch (err) {
    console.error('❌ Erro ao processar o upload:', err);
    res.status(500).json({ error: 'Erro interno ao processar o arquivo.' });
  } finally {
    if (req.file) {
      fs.unlinkSync(req.file.path);
      console.log(`🗑️ Arquivo temporário removido`);
    }
  }
});

export default router;
```

## 9. Variáveis de Ambiente

**Arquivo**: `.env` (CRIAR/ATUALIZAR)

```env
PORT=3001
DATABASE_URL=postgresql://lazarus:Yr6fhese@lazarus-dbsql.postgres.database.azure.com:5432/postgres?sslmode=require

# URLs dos microsserviços
MS_PATIENTS_URL=http://localhost:3000/api/v1
MS_PROCEDURES_URL=http://localhost:3002/api/v1
MS_BILLING_URL=http://localhost:3003/api/v1
MS_AUDIT_URL=http://localhost:3004/api/v1
```

## Resumo das Alterações

1. ✅ Criar estrutura de serviços (clients + orchestrator)
2. ✅ Criar tipos de resultado de importação
3. ✅ Implementar clientes para cada microsserviço
4. ✅ Implementar serviço de validação de domínio
5. ✅ Implementar orquestrador principal
6. ✅ Refatorar rotas para usar orquestrador
7. ✅ Adicionar logs detalhados
8. ✅ Adicionar tratamento de erros robusto

## Fluxo de Execução

```
1. Upload XML → Parser
2. Para cada guia:
   a. Buscar/Criar Paciente (ms-patients)
   b. Validar Portes (ms-procedures)
   c. Validar Códigos de Domínio (tabelas tbdom*)
   d. Criar Conta de Faturamento (ms-billing)
   e. Adicionar Itens de Faturamento (ms-billing)
   f. Salvar Guia no Banco Local
   g. Registrar Auditoria (ms-audit)
3. Retornar Resultado Consolidado
```

## Testes

```bash
# Testar importação
curl -X POST http://localhost:3001/api/upload \
  -F "file=@/path/to/xml/file.xml"
```

