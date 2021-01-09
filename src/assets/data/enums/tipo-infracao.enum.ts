export enum TipoInfracaoEnum {
  NOTIFICACAO = 1,
  MULTA = 2,
  AGRAVO = 3
}

export let TipoInfracaoDescricao = new Map<number, string>([
  [TipoInfracaoEnum.NOTIFICACAO, 'Notificação'],
  [TipoInfracaoEnum.MULTA, 'Multas'],
  [TipoInfracaoEnum.AGRAVO, 'Agravo']
]);

export let TipoInfracaoDescricaoFiltro = new Map<number, string>([
  [TipoInfracaoEnum.NOTIFICACAO, 'NOTIFICACAO'],
  [TipoInfracaoEnum.MULTA, 'MULTA'],
  [TipoInfracaoEnum.AGRAVO, 'AGRAVO']
]);
