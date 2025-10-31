import { parseStringPromise } from "xml2js";

// Interface para o formato dos procedimentos, prontos para a criação no Prisma
interface ProcedimentoProntoParaCriar {
    sequencialItem: string; 
    dataExecucao?: string;
    horaInicial?: string;
    horaFinal?: string;
    codigoTabela?: string;
    codigoProcedimento?: string;
    descricaoProcedimento?: string;
    quantidadeExecutada?: number;
    viaAcesso?: string;
    tecnicaUtilizada?: string;
    reducaoAcrescimo?: number;
    valorUnitario?: number;
    valorTotal?: number;
    nomeProfissional?: string;
    identEquipe?: any;
}

// Interface que representa o objeto completo da Guia, como será retornado pelo parser
interface GuiaCompleta {
    numeroGuiaPrestador: string;
    numeroGuiaOperadora?: string;
    numeroCarteira?: string;
    senha?: string;
    dataAutorizacao?: Date;
    dataValidadeSenha?: Date;
    atendimentoRN?: string;
    tipoTransacao?: string;
    tipoGuia?: string; // Campo adicionado para armazenar o nome da tag da guia
    loteGuia?: string;
    caraterAtendimento?: string;
    tipoFaturamento?: string;
    dataInicioFaturamento?: Date;
    dataFinalFaturamento?: Date;
    tipoInternacao?: string;
    regimeInternacao?: string;
    diagnostico?: string;
    indicadorAcidente?: string;
    motivoEncerramento?: string;
    procedimentos: ProcedimentoProntoParaCriar[]; // Array de procedimentos formatados
    outrasDespesas: any[];
    valorTotalProcedimentos?: number;
    valorTotalDiarias?: number;
    valorTotalTaxasAlugueis?: number;
    valorTotalMateriais?: number;
    valorTotalMedicamentos?: number;
    valorTotalOPME?: number;
    valorTotalGasesMedicinais?: number;
    valorTotalGeral?: number;
    observacao?: string;
}

/**
 * Analisa o conteúdo de um XML TISS e extrai os dados completos das guias.
 * @param xmlContent O conteúdo do XML como string.
 * @returns Uma promessa que resolve para um array de objetos de Guia.
 */
export async function parseTISS(xmlContent: string): Promise<GuiaCompleta[]> {
    const json = await parseStringPromise(xmlContent, {
        explicitArray: false,
        tagNameProcessors: [name => name.replace('ans:', '')]
    });

    const mensagem = json.mensagemTISS;
    if (!mensagem) {
        console.error("Estrutura TISS inválida: a tag <mensagemTISS> não foi encontrada.");
        return [];
    }

    const tipoTransacao = mensagem.cabecalho?.identificacaoTransacao?.tipoTransacao;
    const loteGuia = mensagem.prestadorParaOperadora?.loteGuias?.numeroLote;
    const guiasTISSNode = mensagem.prestadorParaOperadora?.loteGuias?.guiasTISS;

    if (!guiasTISSNode || typeof guiasTISSNode !== 'object') {
        console.log("Nenhuma estrutura <guiasTISS> válida foi encontrada no XML.");
        return [];
    }

    // Identifica dinamicamente o tipo de guia (primeira chave encontrada)
    const tiposDeGuiaEncontrados = Object.keys(guiasTISSNode);
    if (tiposDeGuiaEncontrados.length === 0) {
        console.log("Nenhum tipo de guia encontrado dentro de <guiasTISS>.");
        return [];
    }
    const tipoGuia = tiposDeGuiaEncontrados[0]; // Pega o primeiro tipo de guia encontrado
    let guias = guiasTISSNode[tipoGuia]; // Acessa os dados da guia usando a chave identificada

    if (!guias) {
        console.log(`Nenhuma guia do tipo <${tipoGuia}> foi encontrada no XML.`);
        return [];
    }
    if (!Array.isArray(guias)) {
        guias = [guias]; // Garante que guias seja sempre um array
    }

    return guias.map((guia: any) => {
        let procedimentosRaw = guia.procedimentosExecutados?.procedimentoExecutado || [];
        if (!Array.isArray(procedimentosRaw)) {
            procedimentosRaw = [procedimentosRaw];
        }

        const procedimentosFormatados: ProcedimentoProntoParaCriar[] = procedimentosRaw.map((p: any) => {
            let nomeProfissional = "N/A";
            const identEquipe = p.identEquipe?.identificacaoEquipe;
            if (identEquipe) {
                const equipePrincipal = Array.isArray(identEquipe) ? identEquipe[0] : identEquipe;
                nomeProfissional = equipePrincipal?.nomeProf || "N/A";
            }
            const procedimento = p.procedimento || {};

            // Validação robusta para sequencialItem

            return {
                sequencialItem: p.sequencialItem, // Garante que é sempre um número
                dataExecucao: p.dataExecucao || null,
                horaInicial: p.horaInicial || null,
                horaFinal: p.horaFinal || null,
                codigoTabela: procedimento.codigoTabela || null,
                codigoProcedimento: procedimento.codigoProcedimento || null,
                descricaoProcedimento: procedimento.descricaoProcedimento || null,
                quantidadeExecutada: parseInt(p.quantidadeExecutada, 10) || 0, // Valor padrão 0 se NaN
                viaAcesso: p.viaAcesso || null,
                tecnicaUtilizada: p.tecnicaUtilizada || null,
                reducaoAcrescimo: parseFloat(p.reducaoAcrescimo) || 0, // Valor padrão 0 se NaN
                valorUnitario: parseFloat(p.valorUnitario) || 0, // Valor padrão 0 se NaN
                valorTotal: parseFloat(p.valorTotal) || 0, // Valor padrão 0 se NaN
                nomeProfissional,
                identEquipe: p.identEquipe || null,
            };
        });

        let outrasDespesas = guia.outrasDespesas?.despesa || [];
        if (!Array.isArray(outrasDespesas)) {
            outrasDespesas = [outrasDespesas];
        }

        const dadosInternacao = guia.dadosInternacao || {};
        const dadosSaida = guia.dadosSaidaInternacao || {};
        const valores = guia.valorTotal || {};
        const dadosAutorizacao = guia.dadosAutorizacao || {};
        const dadosBeneficiario = guia.dadosBeneficiario || {};

        const guiaCompleta: GuiaCompleta = {
            numeroGuiaPrestador: guia.cabecalhoGuia?.numeroGuiaPrestador,
            numeroGuiaOperadora: dadosAutorizacao.numeroGuiaOperadora,
            numeroCarteira: dadosBeneficiario.numeroCarteira,
            senha: dadosAutorizacao.senha,
            dataAutorizacao: dadosAutorizacao.dataAutorizacao ? new Date(dadosAutorizacao.dataAutorizacao) : undefined,
            dataValidadeSenha: dadosAutorizacao.dataValidadeSenha ? new Date(dadosAutorizacao.dataValidadeSenha) : undefined,
            atendimentoRN: dadosBeneficiario.atendimentoRN,
            tipoTransacao,
            tipoGuia: tipoGuia, // Armazena o nome da tag
            loteGuia,
            caraterAtendimento: dadosInternacao.caraterAtendimento,
            tipoFaturamento: dadosInternacao.tipoFaturamento,
            dataInicioFaturamento: dadosInternacao.dataInicioFaturamento ? new Date(dadosInternacao.dataInicioFaturamento) : undefined,
            dataFinalFaturamento: dadosInternacao.dataFinalFaturamento ? new Date(dadosInternacao.dataFinalFaturamento) : undefined,
            tipoInternacao: dadosInternacao.tipoInternacao,
            regimeInternacao: dadosInternacao.regimeInternacao,
            diagnostico: dadosSaida.diagnostico,
            indicadorAcidente: dadosSaida.indicadorAcidente,
            motivoEncerramento: dadosSaida.motivoEncerramento,
            procedimentos: procedimentosFormatados,
            outrasDespesas,
            valorTotalProcedimentos: parseFloat(valores.valorProcedimentos) || 0,
            valorTotalDiarias: parseFloat(valores.valorDiarias) || 0,
            valorTotalTaxasAlugueis: parseFloat(valores.valorTaxasAlugueis) || 0,
            valorTotalMateriais: parseFloat(valores.valorMateriais) || 0,
            valorTotalMedicamentos: parseFloat(valores.valorMedicamentos) || 0,
            valorTotalOPME: parseFloat(valores.valorOPME) || 0,
            valorTotalGasesMedicinais: parseFloat(valores.valorGasesMedicinais) || 0,
            valorTotalGeral: parseFloat(valores.valorTotalGeral) || 0,
            observacao: guia.observacao,
        };
        return guiaCompleta;
    });
}