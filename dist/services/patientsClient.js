"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const httpClient_1 = __importDefault(require("./httpClient"));
const CHECK_MS_PATIENTS = process.env.MS_PATIENTS_URL || 'http://localhost/api/v1/patients';
const CHECK_PATIENTS_HEALTH = process.env.MS_PATIENTS_HEALTH || 'http://localhost/patients';
class PatientsClient {
    constructor() {
        const apiKey = process.env.MS_PATIENTS_API_KEY || process.env.MS_API_KEY || process.env.API_KEY;
        const apiKeyHeader = process.env.MS_PATIENTS_API_KEY_HEADER || process.env.MS_API_KEY_HEADER || process.env.API_KEY_HEADER || 'x-api-key';
        const useAuth = ((process.env.MS_PATIENTS_USE_BEARER || process.env.MS_USE_BEARER_AUTH) === 'true');
        this.client = new httpClient_1.default(CHECK_MS_PATIENTS, 30000, {
            apiKey,
            apiKeyHeader,
            useAuth,
        });
        this.healthClient = new httpClient_1.default(CHECK_PATIENTS_HEALTH, 10000, {
            apiKey,
            apiKeyHeader,
            useAuth: false, // health endpoints geralmente não exigem bearer
        });
    }
    /**
     * Health check do serviço
     */
    async healthCheck() {
        return await this.healthClient.get('/health');
    }
    /**
     * Busca paciente por número da carteira
     */
    async findByInsuranceNumber(insuranceNumber) {
        try {
            return await this.client.get(`/patients/insurance/${insuranceNumber}`);
        }
        catch (error) {
            if (error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    }
    async createFromXml(patientData) {
        // Normalize fields to match the ms-patients createPatientFromXml contract.
        const fullName = patientData.nomeBeneficiario || patientData.fullName || 'NOME PENDENTE';
        const nameParts = String(fullName).trim().split(/\s+/);
        const firstName = nameParts[0] || 'NOME';
        const lastName = nameParts.slice(1).join(' ') || 'SOBRENOME';
        // Birth date normalization: ensure ISO string
        let birthDate = undefined;
        if (patientData.dataNascimento) {
            try {
                const d = new Date(patientData.dataNascimento);
                if (!isNaN(d.getTime()))
                    birthDate = d.toISOString();
            }
            catch (e) {
                birthDate = String(patientData.dataNascimento);
            }
        }
        else if (patientData.birthDate) {
            try {
                const d = new Date(patientData.birthDate);
                if (!isNaN(d.getTime()))
                    birthDate = d.toISOString();
            }
            catch (e) {
                birthDate = String(patientData.birthDate);
            }
        }
        // Gender mapping: support multiple XML conventions
        const sexo = (patientData.sexo || patientData.gender || '').toString().toUpperCase();
        let gender = 'OTHER';
        if (sexo === 'F' || sexo === 'FEMALE')
            gender = 'FEMALE';
        else if (sexo === 'M' || sexo === 'MALE')
            gender = 'MALE';
        // CPF: gerar 11 dígitos aleatórios quando não fornecido
        let cpf = patientData.cpf || patientData.cpfNumber || '';
        if (!cpf || String(cpf).trim() === '' || String(cpf) === '00000000000') {
            // Gera 11 dígitos aleatórios para o CPF
            cpf = Array.from({ length: 11 }, () => Math.floor(Math.random() * 10)).join('');
        }
        const payload = {
            // contract fields expected by ms-patients
            firstName,
            lastName,
            fullName,
            cpf,
            birthDate,
            gender,
            phone: patientData.telefone || patientData.phone || '(00) 00000-0000',
            email: patientData.email || patientData.emailAddress || 'nao-informado@email.com',
            address: patientData.endereco || patientData.address || 'Não informado',
            insuranceNumber: patientData.numeroCarteira || patientData.insuranceNumber,
            insurancePlan: patientData.plano || patientData.insurancePlan,
            accommodationType: 'STANDARD',
            // keep original Portuguese keys as well to maximize compatibility
            numeroCarteira: patientData.numeroCarteira,
            nomeBeneficiario: patientData.nomeBeneficiario,
            atendimentoRN: patientData.atendimentoRN,
            // include any other fields (non-destructive) but put them last
            ...patientData,
        };
        console.log('➡️  Enviando payload para ms-patients /api/v1/patients/from-xml:', JSON.stringify(payload));
        try {
            return await this.client.post('/patients/from-xml', payload);
        }
        catch (error) {
            // Ensure we log the full response body when available to capture stack
            // and error details returned by the ms-patients service.
            console.error('❌ Erro ao criar paciente - resposta do ms-patients:', error.response?.data || error.message);
            throw error;
        }
    }
    /**
     * Busca paciente por ID
     */
    async findById(patientId) {
        return await this.client.get(`/patients/${patientId}`);
    }
    /**
     * Deleta paciente (para rollback)
     */
    async delete(patientId) {
        return await this.client.delete(`/patients/${patientId}`);
    }
}
exports.default = new PatientsClient();
//# sourceMappingURL=patientsClient.js.map