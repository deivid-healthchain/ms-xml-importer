"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const adm_zip_1 = __importDefault(require("adm-zip"));
const fs_1 = __importDefault(require("fs"));
const parser_1 = require("./parser");
const orchestrator_1 = __importDefault(require("./services/orchestrator"));
const router = express_1.default.Router();
const upload = (0, multer_1.default)({
    dest: 'uploads/',
    limits: {
        fileSize: 3 * 1024 * 1024 // 3MB
    }
});
/**
 * Processa o conteúdo de um XML usando o orquestrador (ASSÍNCRONO)
 */
async function processAndStoreXmlAsync(xmlContent, fileName) {
    console.log(`\n📄 Processando arquivo ${fileName} (assíncrono)...`);
    try {
        const guias = await (0, parser_1.parseTISS)(xmlContent);
        if (!guias || guias.length === 0) {
            console.log(`⚠️  Nenhuma guia encontrada em ${fileName}.`);
            return;
        }
        console.log(`📋 ${guias.length} guia(s) encontrada(s) em ${fileName}`);
        // Processar cada guia de forma assíncrona
        for (const guia of guias) {
            try {
                const result = await orchestrator_1.default.processGuia(guia);
                if (result.success) {
                    console.log(`✅ Guia ${guia.numeroGuiaPrestador} processada com sucesso (ID: ${result.guiaId})`);
                }
                else {
                    console.log(`⚠️  Guia ${guia.numeroGuiaPrestador} não foi processada: ${result.error}`);
                }
            }
            catch (error) {
                console.error(`❌ Erro ao processar guia ${guia.numeroGuiaPrestador}:`, error.message);
            }
        }
    }
    catch (error) {
        console.error(`❌ Erro ao processar arquivo ${fileName}:`, error.message);
    }
}
/**
 * Extrai números das guias do XML para retorno imediato
 */
async function extractGuiaNumbers(xmlContent) {
    try {
        const guias = await (0, parser_1.parseTISS)(xmlContent);
        return guias.map(g => g.numeroGuiaPrestador).filter(Boolean);
    }
    catch (error) {
        return [];
    }
}
/**
 * @swagger
 * /api/upload:
 *   post:
 *     tags: [Upload]
 *     summary: Upload de arquivo XML ou ZIP
 *     description: |
 *       Faz upload de um arquivo XML TISS (padrão ANS) ou ZIP contendo múltiplos XMLs.
 *       O processamento é assíncrono - a resposta é retornada imediatamente com os números das guias,
 *       enquanto o processamento completo ocorre em segundo plano.
 *
 *       **Formatos aceitos:**
 *       - `.xml` - Arquivo XML TISS único
 *       - `.zip` - Arquivo ZIP contendo um ou mais XMLs TISS
 *
 *       **Limite de tamanho:** 3 MB por arquivo
 *
 *       **Encodings suportados:**
 *       - UTF-8
 *       - ISO-8859-1 (Latin-1)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo XML ou ZIP contendo XMLs TISS
 *     responses:
 *       200:
 *         description: Arquivo recebido e processamento iniciado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "✅ Arquivo recebido! 3 guia(s) sendo processada(s) em segundo plano."
 *                 guias:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Números das guias identificadas no XML
 *                   example: ["GUIA-2025-001", "GUIA-2025-002", "GUIA-2025-003"]
 *                 totalGuias:
 *                   type: integer
 *                   example: 3
 *                 status:
 *                   type: string
 *                   enum: [PROCESSANDO]
 *                   example: PROCESSANDO
 *       400:
 *         description: Erro de validação
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Nenhum arquivo enviado."
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erro interno ao processar o arquivo."
 *                 details:
 *                   type: string
 *                   example: "XML parsing error: Invalid character"
 */
router.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }
    const { path, originalname, mimetype } = req.file;
    const guiaNumbers = [];
    try {
        if (mimetype === 'application/zip' || originalname.endsWith('.zip')) {
            console.log('📦 ZIP detectado. Extraindo XMLs...');
            const zip = new adm_zip_1.default(path);
            const xmlEntries = zip.getEntries().filter(e => e.entryName.endsWith('.xml'));
            if (xmlEntries.length === 0) {
                return res.status(400).json({ error: 'Nenhum arquivo XML encontrado no ZIP.' });
            }
            console.log(`📦 ${xmlEntries.length} arquivo(s) XML encontrado(s) no ZIP`);
            // Extrair números das guias de todos os XMLs
            for (const entry of xmlEntries) {
                const xmlContent = entry.getData().toString('utf-8');
                const numbers = await extractGuiaNumbers(xmlContent);
                guiaNumbers.push(...numbers);
                // Processar de forma assíncrona (não bloqueia resposta)
                setImmediate(() => processAndStoreXmlAsync(xmlContent, entry.entryName));
            }
        }
        else if (mimetype === 'application/xml' ||
            mimetype === 'text/xml' ||
            originalname.endsWith('.xml')) {
            console.log('📄 XML único detectado. Processando...');
            // Ler XML como buffer primeiro para detectar encoding
            const xmlBuffer = fs_1.default.readFileSync(path);
            let xmlContent = xmlBuffer.toString('utf-8');
            // Detectar encoding do XML (ISO-8859-1 ou UTF-8)
            const encodingMatch = xmlContent.match(/encoding=["']([^"']+)["']/);
            if (encodingMatch && encodingMatch[1].toLowerCase().includes('iso-8859')) {
                console.log(`🔄 Detectado encoding ${encodingMatch[1]}, convertendo para UTF-8...`);
                // Recodificar de ISO-8859-1 para UTF-8
                xmlContent = xmlBuffer.toString('latin1');
            }
            // Extrair números das guias
            const numbers = await extractGuiaNumbers(xmlContent);
            guiaNumbers.push(...numbers);
            // Processar de forma assíncrona (não bloqueia resposta)
            setImmediate(() => processAndStoreXmlAsync(xmlContent, originalname));
        }
        else {
            return res.status(400).json({
                error: 'Tipo de arquivo não suportado. Envie um .zip ou .xml.'
            });
        }
        // Retornar imediatamente com os números das guias
        res.json({
            success: true,
            message: `✅ Arquivo recebido! ${guiaNumbers.length} guia(s) sendo processada(s) em segundo plano.`,
            guias: guiaNumbers,
            totalGuias: guiaNumbers.length,
            status: 'PROCESSANDO',
        });
    }
    catch (err) {
        console.error('❌ Erro ao processar o upload:', err);
        res.status(500).json({
            error: 'Erro interno ao processar o arquivo.',
            details: err.message,
        });
    }
    finally {
        // Remover arquivo temporário após um delay (para permitir processamento assíncrono)
        if (req.file) {
            setTimeout(() => {
                try {
                    if (fs_1.default.existsSync(req.file.path)) {
                        fs_1.default.unlinkSync(req.file.path);
                        console.log(`🗑️  Arquivo temporário ${req.file.path} removido.`);
                    }
                }
                catch (error) {
                    console.error(`⚠️  Erro ao remover arquivo temporário:`, error);
                }
            }, 5000); // 5 segundos de delay
        }
    }
});
/**
 * @swagger
 * /api/health:
 *   get:
 *     tags: [Health]
 *     summary: Verificação de saúde do serviço
 *     description: Retorna o status do serviço e timestamp atual
 *     responses:
 *       200:
 *         description: Serviço operacional
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 service:
 *                   type: string
 *                   example: ms-xml-importer
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-03-18T10:30:00.000Z"
 */
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'ms-xml-importer',
        timestamp: new Date().toISOString(),
    });
});
exports.default = router;
//# sourceMappingURL=routes.js.map