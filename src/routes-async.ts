import express, { Request, Response } from 'express';
import multer from 'multer';
import AdmZip from 'adm-zip';
import fs from 'fs';
import { parseTISS } from './parser';
import orchestrator from './services/orchestrator';

const router = express.Router();
const upload = multer({ 
  dest: 'uploads/',
  limits: {
    fileSize: 3 * 1024 * 1024 // 3MB
  }
});

/**
 * Processa o conteúdo de um XML usando o orquestrador (ASSÍNCRONO)
 */
async function processAndStoreXmlAsync(xmlContent: string, fileName: string) {
  console.log(`\n📄 Processando arquivo ${fileName} (assíncrono)...`);
  
  try {
    const guias = await parseTISS(xmlContent);

    if (!guias || guias.length === 0) {
      console.log(`⚠️  Nenhuma guia encontrada em ${fileName}.`);
      return;
    }

    console.log(`📋 ${guias.length} guia(s) encontrada(s) em ${fileName}`);

    // Processar cada guia de forma assíncrona
    for (const guia of guias) {
      try {
        const result = await orchestrator.processGuia(guia);
        
        if (result.success) {
          console.log(`✅ Guia ${guia.numeroGuiaPrestador} processada com sucesso (ID: ${result.guiaId})`);
        } else {
          console.log(`⚠️  Guia ${guia.numeroGuiaPrestador} não foi processada: ${result.error}`);
        }
      } catch (error: any) {
        console.error(`❌ Erro ao processar guia ${guia.numeroGuiaPrestador}:`, error.message);
      }
    }
  } catch (error: any) {
    console.error(`❌ Erro ao processar arquivo ${fileName}:`, error.message);
  }
}

/**
 * Extrai números das guias do XML para retorno imediato
 */
async function extractGuiaNumbers(xmlContent: string): Promise<string[]> {
  try {
    const guias = await parseTISS(xmlContent);
    return guias.map(g => g.numeroGuiaPrestador).filter(Boolean);
  } catch (error) {
    return [];
  }
}

/**
 * Endpoint principal: Upload de arquivo (ZIP ou XML) - ASSÍNCRONO
 */
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  }

  const { path, originalname, mimetype } = req.file;
  const guiaNumbers: string[] = [];

  try {
    if (mimetype === 'application/zip' || originalname.endsWith('.zip')) {
      console.log('📦 ZIP detectado. Extraindo XMLs...');
      const zip = new AdmZip(path);
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
    } else if (
      mimetype === 'application/xml' ||
      mimetype === 'text/xml' ||
      originalname.endsWith('.xml')
    ) {
      console.log('📄 XML único detectado. Processando...');
      const xmlContent = fs.readFileSync(path, 'utf-8');
      
      // Extrair números das guias
      const numbers = await extractGuiaNumbers(xmlContent);
      guiaNumbers.push(...numbers);
      
      // Processar de forma assíncrona (não bloqueia resposta)
      setImmediate(() => processAndStoreXmlAsync(xmlContent, originalname));
    } else {
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
  } catch (err: any) {
    console.error('❌ Erro ao processar o upload:', err);
    res.status(500).json({ 
      error: 'Erro interno ao processar o arquivo.',
      details: err.message,
    });
  } finally {
    // Remover arquivo temporário após um delay (para permitir processamento assíncrono)
    if (req.file) {
      setTimeout(() => {
        try {
          if (fs.existsSync(req.file!.path)) {
            fs.unlinkSync(req.file!.path);
            console.log(`🗑️  Arquivo temporário ${req.file!.path} removido.`);
          }
        } catch (error) {
          console.error(`⚠️  Erro ao remover arquivo temporário:`, error);
        }
      }, 5000); // 5 segundos de delay
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
