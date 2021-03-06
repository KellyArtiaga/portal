export interface VeiculoZeroKM {
  cnpj: string;
  cliente: string;
  contratoMasterId: number;
  motivo: string;
  placa: string;
  chassi: string;
  modelo: string;
  cor: string;
  acessorios: string;
  tonalidadeCor: string;
  anoFabricacaoModelo: string;
  dataIncioLocacao: number;
  logradouro: string;
  numeroLogradouro: number;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  enderecoEntrega: string;
  situacaoPedido: string;
  pedidoCompraId: number;
  validacaoPedido: boolean;
  emLicenciamento: boolean;
  aguardandoFaturamento: boolean;
  acessorizacao: boolean;
  expedicaoTransporte: boolean;
  veiculoDisponivel: boolean;
  entregue: boolean;
}
