import express, { Request, Response } from 'express';
import multer from 'multer';
import AdmZip from 'adm-zip';
import fs from 'fs';
import { parseTISS } from './parser';
import orchestrator from './services/orchestrator';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

/**
 * Processa o conteúdo de um XML usando o orquestrador
 */
async function processAndStoreXml(xmlContent: string, fileName: string) {
  console.log(`\n📄 Processando arquivo ${fileName}...`);
  const guias = await parseTISS(xmlContent);

  if (!guias || guias.length === 0) {
    console.log(`⚠️  Nenhuma guia encontrada em ${fileName}.`);
    return {
      fileName,
      guiasProcessed: 0,
      results: [],
    };
  }

  console.log(`📋 ${guias.length} guia(s) encontrada(s) em ${fileName}`);

  // Usar orquestrador para processar todas as guias
  const results = await orchestrator.processMultipleGuias(guias);

  const successCount = results.filter(r => r.success).length;
  const failureCount = results.filter(r => !r.success).length;
  const validationIssuesCount = results.reduce(
    (acc, r) => acc + (r.validationIssues?.length || 0),
    0
  );

  console.log(`\n✅ Processamento concluído:`);
  console.log(`   - Sucesso: ${successCount}`);
  console.log(`   - Falhas: ${failureCount}`);
  console.log(`   - Divergências encontradas: ${validationIssuesCount}`);

  return {
    fileName,
    guiasProcessed: guias.length,
    successCount,
    failureCount,
    validationIssuesCount,
    results,
  };
}

/**
 * Endpoint principal: Upload de arquivo (ZIP ou XML)
 */
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  }

  try {
    const { path, originalname, mimetype } = req.file;
    const processResults: any[] = [];

    if (mimetype === 'application/zip' || originalname.endsWith('.zip')) {
      console.log('📦 ZIP detectado. Extraindo XMLs...');
      const zip = new AdmZip(path);
      const xmlEntries = zip.getEntries().filter(e => e.entryName.endsWith('.xml'));

      if (xmlEntries.length === 0) {
        return res.status(400).json({ error: 'Nenhum arquivo XML encontrado no ZIP.' });
      }

      console.log(`📦 ${xmlEntries.length} arquivo(s) XML encontrado(s) no ZIP`);

      for (const entry of xmlEntries) {
        const xmlContent = entry.getData().toString('utf-8');
        const result = await processAndStoreXml(xmlContent, entry.entryName);
        processResults.push(result);
      }
    } else if (
      mimetype === 'application/xml' ||
      mimetype === 'text/xml' ||
      originalname.endsWith('.xml')
    ) {
      console.log('📄 XML único detectado. Processando...');
      const xmlContent = fs.readFileSync(path, 'utf-8');
      const result = await processAndStoreXml(xmlContent, originalname);
      processResults.push(result);
    } else {
      return res.status(400).json({ 
        error: 'Tipo de arquivo não suportado. Envie um .zip ou .xml.' 
      });
    }

    // Calcular totais
    const totalGuias = processResults.reduce((acc, r) => acc + r.guiasProcessed, 0);
    const totalSuccess = processResults.reduce((acc, r) => acc + (r.successCount || 0), 0);
    const totalFailures = processResults.reduce((acc, r) => acc + (r.failureCount || 0), 0);
    const totalValidationIssues = processResults.reduce(
      (acc, r) => acc + (r.validationIssuesCount || 0),
      0
    );

    res.json({
      success: true,
      message: '✅ Arquivo(s) processado(s) com sucesso.',
      summary: {
        filesProcessed: processResults.length,
        totalGuias,
        totalSuccess,
        totalFailures,
        totalValidationIssues,
      },
      details: processResults,
    });
  } catch (err: any) {
    console.error('❌ Erro ao processar o upload:', err);
    res.status(500).json({ 
      error: 'Erro interno ao processar o arquivo.',
      details: err.message,
    });
  } finally {
    if (req.file) {
      fs.unlinkSync(req.file.path);
      console.log(`🗑️  Arquivo temporário ${req.file.path} removido.`);
    }
  }
});

/**
 * Endpoint de health check
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'ms-xml-importer',
    timestamp: new Date().toISOString(),
  });
});

export default router;

