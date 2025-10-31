import { prisma } from '../db';
import patientsClient from './patientsClient';
import proceduresClient from './proceduresClient';

interface GuiaData {
  numeroGuiaPrestador: string;
  numeroCarteira?: string;
  nomeBeneficiario?: string;
  procedimentos?: any[];
  [key: string]: any;
}

interface OrchestrationResult {
  success: boolean;
  guiaId?: string;
  patientId?: string;
  proceduresCreated?: number;
  validationIssues?: any[];
  error?: string;
  rollbackPerformed?: boolean;
}

/**
 * Orquestrador com suporte a transações e rollback
 * Implementa Saga Pattern para consistência entre microsserviços
 */
class Orchestrator {
  /**
   * Verifica se todos os serviços necessários estão disponíveis
   */
  private async healthCheck(): Promise<{ healthy: boolean; unavailableServices: string[] }> {
    const unavailableServices: string[] = [];

    // Verificar ms-patients
    try {
      await patientsClient.healthCheck();
      console.log('✅ ms-patients está disponível');
    } catch (error) {
      console.error('❌ ms-patients não está disponível');
      unavailableServices.push('ms-patients');
    }

    // Verificar ms-procedures
    try {
      await proceduresClient.healthCheck();
      console.log('✅ ms-procedures está disponível');
    } catch (error) {
      console.error('❌ ms-procedures não está disponível');
      unavailableServices.push('ms-procedures');
    }

    return {
      healthy: unavailableServices.length === 0,
      unavailableServices,
    };
  }

  /**
   * Deleta um paciente (rollback)
   */
  private async rollbackPatient(patientId: string): Promise<void> {
    try {
      console.log(`🔄 Rollback: Deletando paciente ${patientId}...`);
      await patientsClient.delete(patientId);
      console.log(`✅ Paciente ${patientId} deletado com sucesso`);
    } catch (error: any) {
      console.error(`❌ Erro ao deletar paciente ${patientId}:`, error.message);
      // Não propagar erro de rollback para não mascarar o erro original
    }
  }

  /**
   * Deleta uma guia (rollback)
   */
  private async rollbackGuia(guiaId: number): Promise<void> {
    try {
      console.log(`🔄 Rollback: Deletando guia ${guiaId}...`);
      await prisma.guia.delete({
        where: { id: guiaId },
      });
      console.log(`✅ Guia ${guiaId} deletada com sucesso`);
    } catch (error: any) {
      console.error(`❌ Erro ao deletar guia ${guiaId}:`, error.message);
    }
  }

  /**
   * Deleta procedimentos criados no ms-procedures (rollback)
   */
  private async rollbackProcedures(procedureIds: string[]): Promise<void> {
    console.log(`🔄 Rollback: Deletando ${procedureIds.length} procedimentos...`);

    for (const procedureId of procedureIds) {
      try {
        await proceduresClient.delete(procedureId);
        console.log(`✅ Procedimento ${procedureId} deletado`);
      } catch (error: any) {
        console.error(`❌ Erro ao deletar procedimento ${procedureId}:`, error.message);
      }
    }
  }

  /**
   * Processa uma guia completa do XML com suporte a transações
   */
  async processGuia(guiaData: GuiaData): Promise<OrchestrationResult> {
    console.log(`\n🔄 Orquestrando importação da guia ${guiaData.numeroGuiaPrestador}...`);

    let createdPatientId: string | null = null;
    let createdGuiaId: number | null = null;
    let createdProcedureIds: string[] = [];
    let rollbackPerformed = false;

    try {
      // ========================================
      // ETAPA 0: Health Check
      // ========================================
      console.log('\n📋 Verificando disponibilidade dos serviços...');
      const health = await this.healthCheck();

      if (!health.healthy) {
        throw new Error(
          `Serviços indisponíveis: ${health.unavailableServices.join(', ')}. ` +
          `Não é possível processar a guia sem todos os serviços ativos.`
        );
      }

      // ========================================
      // ETAPA 1: Verificar se guia já existe
      // ========================================
      const guiaExistente = await prisma.guia.findUnique({
        where: { numeroGuiaPrestador: guiaData.numeroGuiaPrestador },
      });

      if (guiaExistente) {
        console.log(`⚠️  Guia ${guiaData.numeroGuiaPrestador} já existe. Pulando.`);
        return {
          success: false,
          error: 'Guia já existe',
        };
      }

      // ========================================
      // ETAPA 2: Buscar ou criar paciente
      // ========================================
      let patientId: string | null = null;

      if (guiaData.numeroCarteira) {
        console.log(`\n👤 Buscando paciente com carteira ${guiaData.numeroCarteira}...`);

        const existingPatient = await patientsClient.findByInsuranceNumber(guiaData.numeroCarteira);

        if (existingPatient) {
          patientId = existingPatient.data?.id || existingPatient.id;
          console.log(`✅ Paciente encontrado: ${patientId}`);
        } else {
          console.log(`📝 Paciente não encontrado. Criando novo paciente...`);

          try {
            const newPatient = await patientsClient.createFromXml({
              numeroCarteira: guiaData.numeroCarteira
              /*nomeBeneficiario: guiaData.nomeBeneficiario,
              // Campos obrigatórios com valores padrão
              cpf: 'PENDENTE',
              rg: 'PENDENTE',
              birthDate: new Date(),
              gender: 'OTHER',
              phone: 'PENDENTE',
              email: 'pendente@temp.com',
              address: 'PENDENTE',
              medicalRecordNumber: `TEMP-${guiaData.numeroCarteira}`,
              admissionDate: new Date(),
              roomNumber: 'PENDENTE',
              responsibleDoctor: 'PENDENTE',
              insurancePlan: 'PENDENTE',
              insuranceValidity: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 ano
              accommodationType: 'STANDARD',
              currentAccommodation: 'STANDARD',
              accommodationStatus: 'OCCUPIED',
              status: 'ACTIVE',
              validationStatus: 'PENDING'*/
            });

            patientId = newPatient.data?.id || newPatient.id;
            createdPatientId = patientId; // Marcar para possível rollback
            console.log(`✅ Paciente criado: ${patientId}`);
          } catch (error: any) {
            throw new Error(`Falha ao criar paciente: ${error.message}`);
          }
        }
      }

      // ========================================
      // ETAPA 3: Validar que há procedimentos
      // ========================================
      const procedimentos = guiaData.procedimentos || [];

      if (procedimentos.length === 0) {
        throw new Error('Não é possível criar uma guia de auditoria sem procedimentos');
      }

      console.log(`\n🔬 ${procedimentos.length} procedimentos para processar`);

      // ========================================
      // ETAPA 4: Criar guia no banco
      // ========================================
      const { procedimentos: _, ...dadosGuia } = guiaData;

      // Prisma will throw on unknown fields (e.g. 'tipoGuia').
      // Only allow fields that exist on the Guia model to avoid
      // "Unknown argument `xxx`" errors coming from Prisma.
      const allowedGuiaFields = new Set([
        'numeroGuiaPrestador', 'numeroGuiaOperadora', 'numeroCarteira', 'senha',
        'dataAutorizacao', 'dataValidadeSenha', 'atendimentoRN', 'tipoTransacao', 'loteGuia',
        'patientId', 'caraterAtendimento', 'tipoFaturamento', 'dataInicioFaturamento', 'dataFinalFaturamento',
        'tipoInternacao', 'regimeInternacao', 'diagnostico', 'indicadorAcidente', 'motivoEncerramento',
        'outrasDespesas', 'valorTotalProcedimentos', 'valorTotalDiarias', 'valorTotalTaxasAlugueis',
        'valorTotalMateriais', 'valorTotalMedicamentos', 'valorTotalOPME', 'valorTotalGasesMedicinais',
        'valorTotalGeral', 'observacao', 'tipoGuia', 'patientId'
      ]);

      const sanitizedData: any = {};
      for (const key of Object.keys(dadosGuia)) {
        if (allowedGuiaFields.has(key)) {
          sanitizedData[key] = (dadosGuia as any)[key];
        } else {
          // silently ignore unknown fields but log for visibility
          console.log(`⚠️ Ignorando campo desconhecido ao criar guia: ${key}`);
        }
      }

      // ensure patientId is set when available
      if (patientId) sanitizedData.patientId = patientId;

      console.log('\n📄 Criando guia...');
      const novaGuia = await prisma.guia.create({
        data: sanitizedData,
      });

      createdGuiaId = novaGuia.id; // Marcar para possível rollback
      console.log(`✅ Guia criada: ${novaGuia.id}`);

      // ========================================
      // ETAPA 5: Criar procedimentos no ms-procedures
      // ========================================
      console.log('\n🔬 Criando procedimentos no ms-procedures...');
      const validationIssues: any[] = [];

      for (let i = 0; i < procedimentos.length; i++) {
        const proc = procedimentos[i];
        console.log(`\n  [${i + 1}/${procedimentos.length}] Processando procedimento ${proc.codigoProcedimento || 'sem código'}...`);

        try {
          // Validar porte se disponível
          let porteValidation = null;
          if (proc.codigoProcedimento && proc.grauParticipacao) {
            try {
              porteValidation = await proceduresClient.validatePorte(
                proc.codigoProcedimento,
                proc.grauParticipacao
              );

              if (!porteValidation.isValid) {
                validationIssues.push({
                  type: 'PORTE_DIVERGENCE',
                  procedureCode: proc.codigoProcedimento,
                  reported: proc.grauParticipacao,
                  expected: porteValidation.expectedPorte,
                  severity: porteValidation.severity,
                });

                console.log(`  ⚠️  Divergência de porte: informado ${proc.grauParticipacao}, esperado ${porteValidation.expectedPorte}`);
              } else {
                console.log(`  ✅ Porte validado: ${proc.grauParticipacao}`);
              }
            } catch (error: any) {
              // Validação de porte falhou, mas não bloqueia criação
              console.error(`  ⚠️  Erro ao validar porte (continuando):`, error.message);
            }
          }

          // Criar procedimento no ms-procedures
          const createdProcedure = await proceduresClient.create({
            patientId: patientId,
            guiaId: novaGuia.id,
            code: proc.codigoProcedimento,
            description: proc.descricaoProcedimento,
            quantity: proc.quantidadeExecutada,
            unitPrice: proc.valorUnitario,
            totalPrice: proc.valorTotal,
            executionDate: proc.dataExecucao,
            reportedPorte: proc.grauParticipacao,
            validatedPorte: porteValidation?.expectedPorte,
            porteValidation: porteValidation,
            // Adicionar outros campos conforme necessário
          });

          const procedureId = createdProcedure.data?.id || createdProcedure.id;
          createdProcedureIds.push(procedureId);
          console.log(`  ✅ Procedimento criado no ms-procedures: ${procedureId}`);

        } catch (error: any) {
          // ERRO CRÍTICO: Falha ao criar procedimento
          console.error(`  ❌ ERRO CRÍTICO ao criar procedimento:`, error.message);
          throw new Error(
            `Falha ao criar procedimento ${i + 1}/${procedimentos.length} ` +
            `(código: ${proc.codigoProcedimento}): ${error.message}`
          );
        }
      }

      // ========================================
      // ETAPA 6: Salvar procedimentos localmente
      // ========================================
      console.log('\n💾 Salvando procedimentos no banco local...');

      for (const proc of procedimentos) {
        try {
          await prisma.procedimento.create({
            data: {
              ...proc,
              guiaId: novaGuia.id,
            },
          });
        } catch (error: any) {
          console.error(`⚠️  Erro ao salvar procedimento localmente:`, error.message);
          // Não bloqueia, pois o procedimento já foi criado no ms-procedures
        }
      }

      console.log(`✅ Procedimentos salvos localmente`);

      // ========================================
      // SUCESSO FINAL
      // ========================================
      console.log('\n✅ ========================================');
      console.log('✅ IMPORTAÇÃO CONCLUÍDA COM SUCESSO');
      console.log('✅ ========================================');
      console.log(`✅ Guia: ${novaGuia.id}`);
      console.log(`✅ Paciente: ${patientId || 'N/A'}`);
      console.log(`✅ Procedimentos criados: ${createdProcedureIds.length}`);
      if (validationIssues.length > 0) {
        console.log(`⚠️  Divergências de porte: ${validationIssues.length}`);
      }

      return {
        success: true,
        guiaId: novaGuia.id.toString(),
        patientId: patientId || undefined,
        proceduresCreated: createdProcedureIds.length,
        validationIssues: validationIssues.length > 0 ? validationIssues : undefined,
      };

    } catch (error: any) {
      // ========================================
      // ERRO: Executar Rollback
      // ========================================
      console.error('\n❌ ========================================');
      console.error('❌ ERRO NA ORQUESTRAÇÃO - INICIANDO ROLLBACK');
      console.error('❌ ========================================');
      console.error(`❌ Erro: ${error.message}`);

      rollbackPerformed = true;

      // Rollback em ordem reversa da criação

      // 1. Deletar procedimentos criados no ms-procedures
      if (createdProcedureIds.length > 0) {
        await this.rollbackProcedures(createdProcedureIds);
      }

      // 2. Deletar guia criada
      if (createdGuiaId !== null) {
        await this.rollbackGuia(createdGuiaId);
      }

      // 3. Deletar paciente criado (apenas se foi criado nesta transação)
      if (createdPatientId !== null) {
        await this.rollbackPatient(createdPatientId);
      }

      console.error('\n❌ Rollback concluído. Nenhum dado foi persistido.');

      return {
        success: false,
        error: error.message,
        rollbackPerformed: true,
      };
    }
  }

  /**
   * Processa múltiplas guias
   */
  async processMultipleGuias(guias: GuiaData[]): Promise<OrchestrationResult[]> {
    const results: OrchestrationResult[] = [];

    for (const guia of guias) {
      const result = await this.processGuia(guia);
      results.push(result);

      // Se falhou com rollback, pode querer parar o processamento
      if (!result.success && result.rollbackPerformed) {
        console.log('\n⚠️  Parando processamento de guias devido a erro crítico.');
        break;
      }
    }

    return results;
  }
}

export default new Orchestrator();

