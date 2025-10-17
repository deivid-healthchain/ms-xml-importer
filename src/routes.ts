import express, { Request, Response } from 'express';
import multer from 'multer';
import AdmZip from 'adm-zip';
import fs from 'fs';
import { prisma } from './db';
import { parseTISS } from './parser';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

/**
 * Processa o conteúdo de um XML, extrai guias e procedimentos,
 * e os insere no banco, sem sobrescrever ou apagar registros existentes.
 */
async function processAndStoreXml(xmlContent: string, fileName: string) {
  console.log(`Processando arquivo ${fileName}...`);
  const guias = await parseTISS(xmlContent);

  if (!guias || guias.length === 0) {
    console.log(`Nenhuma guia encontrada em ${fileName}.`);
    return;
  }

  for (const guiaData of guias) {
    const { procedimentos, ...dadosGuia } = guiaData;

    try {
      // 1️⃣ Verifica se a guia já existe
      const guiaExistente = await prisma.guia.findUnique({
        where: { numeroGuiaPrestador: dadosGuia.numeroGuiaPrestador },
      });

      if (guiaExistente) {
        console.log(`Guia ${dadosGuia.numeroGuiaPrestador} já existe. Ignorando criação.`);
        continue;
      }

      // 2️⃣ Insere a nova guia
      const novaGuia = await prisma.guia.create({
        data: dadosGuia,
      });
      console.log(`✅ Guia ${novaGuia.numeroGuiaPrestador} inserida com ID ${novaGuia.id}`);

      // 3️⃣ Insere os procedimentos, se houver
      if (procedimentos && procedimentos.length > 0) {
        // Remove duplicatas com base na constraint @@unique([guiaId, sequencialItem])
        const procedimentosFiltrados = procedimentos.filter(
          (p: any, index: number, self: any[]) =>
            index === self.findIndex(t => t.sequencialItem === p.sequencialItem)
        );

        await prisma.procedimento.createMany({
          data: procedimentosFiltrados.map((proc: any) => ({
            ...proc,
            guiaId: novaGuia.id,
          })),
          skipDuplicates: true, // evita erro em caso de conflito único
        });

        console.log(`${procedimentosFiltrados.length} procedimentos adicionados para a guia ${novaGuia.numeroGuiaPrestador}.`);
      } else {
        console.log(`Guia ${novaGuia.numeroGuiaPrestador} sem procedimentos.`);
      }
    } catch (error) {
      console.error(`❌ Erro ao processar guia ${guiaData.numeroGuiaPrestador}:`, error);
    }
  }
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

    if (mimetype === 'application/zip' || originalname.endsWith('.zip')) {
      console.log(' ZIP detectado. Extraindo XMLs...');
      const zip = new AdmZip(path);
      const xmlEntries = zip.getEntries().filter(e => e.entryName.endsWith('.xml'));

      if (xmlEntries.length === 0) {
        return res.status(400).json({ error: 'Nenhum arquivo XML encontrado no ZIP.' });
      }

      for (const entry of xmlEntries) {
        const xmlContent = entry.getData().toString('utf-8');
        await processAndStoreXml(xmlContent, entry.entryName);
      }
    } else if (
      mimetype === 'application/xml' ||
      mimetype === 'text/xml' ||
      originalname.endsWith('.xml')
    ) {
      console.log(' XML único detectado. Processando...');
      const xmlContent = fs.readFileSync(path, 'utf-8');
      await processAndStoreXml(xmlContent, originalname);
    } else {
      return res.status(400).json({ error: 'Tipo de arquivo não suportado. Envie um .zip ou .xml.' });
    }

    res.json({ message: '✅ Arquivo(s) processado(s) com sucesso. Novas guias foram inseridas.' });
  } catch (err) {
    console.error(' Erro ao processar o upload:', err);
    res.status(500).json({ error: 'Erro interno ao processar o arquivo.' });
  } finally {
    if (req.file) {
      fs.unlinkSync(req.file.path);
      console.log(` Arquivo temporário ${req.file.path} removido.`);
    }
  }
});

export default router;
