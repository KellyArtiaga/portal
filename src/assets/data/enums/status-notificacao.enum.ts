// export enum StatusNotificacaoEnum {
//   AI = 1,
//   DUP = 2,
//   ER = 3,
//   EX = 4,
//   FA = 5,
//   FT = 6,
//   ID = 7,
//   IS = 8,
//   NCR = 9,
//   PE = 10,
//   PT = 11,
//   RO = 12,
//   VE = 13,
//   NC = 14,
// }

export enum StatusNotificacaoEnum {
  SI = 1,
  PE = 2,
  RE = 3,
  ID = 4,
  IEO = 5,
  RO = 6,
  VD = 7,
  IA = 8,
}

export let StatusNotificacao = new Map<number, string>([
  [1, 'Sem Indicação'],
  [2, 'Prazo Expirado'],
  [3, 'Recusado'],
  [4, 'Indicado Divergência'],
  [5, 'Indicado Enviado para Órgão'],
  [6, 'Recusado pelo Órgão'],
  [7, 'Validação de Documento'],
  [8, 'Indicado no Ato']
]);

// export let StatusNotificacaoDescricao = new Map<number, string>([
//   [StatusNotificacaoEnum.AI, 'APROPRIAÇÃO INDÉBITA'],
//   [StatusNotificacaoEnum.DUP, 'DUPLICIDADE'],
//   [StatusNotificacaoEnum.ER, 'ENVIADA P/ RESULTADO']
//   [StatusNotificacaoEnum.EX, 'EXECUTIVO']
//   [StatusNotificacaoEnum.FA, 'FAT. AUTORIZADO']
//   [StatusNotificacaoEnum.FT, 'FATURADO']
//   [StatusNotificacaoEnum.ID, 'MULTA IDENTIFICADA']
//   [StatusNotificacaoEnum.IS, 'INFRAÇÃO ISENTA']
//   [StatusNotificacaoEnum.NCR, 'N. COBRADO N.R.']
//   [StatusNotificacaoEnum.PE, 'PENDENTE (MULTAS)']
//   [StatusNotificacaoEnum.PT, 'PERDA TOTAL']
//   [StatusNotificacaoEnum.RO, 'ROUBADO']
//   [StatusNotificacaoEnum.VE, 'VENDIDO']
//   [StatusNotificacaoEnum.NC, 'NC ']
// ]);

export let StatusNotificacaoDescricao = new Map<number, string>([
  [StatusNotificacaoEnum.SI, 'Sem Indicação'],
  [StatusNotificacaoEnum.PE, 'Prazo Expirado'],
  [StatusNotificacaoEnum.RE, 'Recusado'],
  [StatusNotificacaoEnum.ID, 'Indicado Divergência'],
  [StatusNotificacaoEnum.IEO, 'Indicado Enviado para Órgão'],
  [StatusNotificacaoEnum.RO, 'Recusado pelo Órgão'],
  [StatusNotificacaoEnum.VD, 'Validação de Documento'],
  [StatusNotificacaoEnum.IA, 'Indicado no Ato']
]);
