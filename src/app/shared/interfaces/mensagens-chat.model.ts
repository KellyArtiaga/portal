export interface MensagensChatMV {
  mensagemId: number;
  dataHora: string;
  texto: string;
  usuario: string;
  situacao: string;
  mensagemCliente: boolean;
  situacaoId: number;
  mensagemAutomatica: boolean;
  identificadorServico: number;
  lidaPortal: boolean;
  dataRespostaChat: number;
  respostaChat: string;
  modificadoPor: string;
  modificadoEm: string;
}
