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

    let guias = mensagem.prestadorParaOperadora?.loteGuias?.guiasTISS?.guiaResumoInternacao;
    if (!guias) {
        console.log("Nenhuma <guiaResumoInternacao> foi encontrada no XML.");
        return [];
    }
    if (!Array.isArray(guias)) {
        guias = [guias];
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

            return {
                sequencialItem: p.sequencialItem,
                dataExecucao: p.dataExecucao || null,
                horaInicial: p.horaInicial || null,
                horaFinal: p.horaFinal || null,
                codigoTabela: procedimento.codigoTabela || null,
                codigoProcedimento: procedimento.codigoProcedimento || null,
                descricaoProcedimento: procedimento.descricaoProcedimento || null,
                quantidadeExecutada: parseInt(p.quantidadeExecutada, 10),
                viaAcesso: p.viaAcesso || null,
                tecnicaUtilizada: p.tecnicaUtilizada || null,
                reducaoAcrescimo: parseFloat(p.reducaoAcrescimo),
                valorUnitario: parseFloat(p.valorUnitario),
                valorTotal: parseFloat(p.valorTotal),
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

        const guiaCompleta: GuiaCompleta = {
            numeroGuiaPrestador: guia.cabecalhoGuia?.numeroGuiaPrestador,
            numeroGuiaOperadora: guia.dadosAutorizacao?.numeroGuiaOperadora,
            numeroCarteira: guia.dadosBeneficiario?.numeroCarteira,
            senha: guia.dadosAutorizacao?.senha,
            dataAutorizacao: guia.dadosAutorizacao?.dataAutorizacao ? new Date(guia.dadosAutorizacao.dataAutorizacao) : undefined,
            dataValidadeSenha: guia.dadosAutorizacao?.dataValidadeSenha ? new Date(guia.dadosAutorizacao.dataValidadeSenha) : undefined,
            atendimentoRN: guia.dadosBeneficiario?.atendimentoRN,
            tipoTransacao,
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