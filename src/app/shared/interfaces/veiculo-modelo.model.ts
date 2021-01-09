export interface VeiculoModeloMV {
  valorLocacao: number | string;
  id: number;
  descricao: string;
  marcaId: number;
  grupoVeiculoId: number;
  capacidadeTanque: number;
  montadoraId: number;
  veiculoTipoId: number;
  veiculoModeloTipoId: number;
  numeroPortas: number;
  motorizacaoId: number;
  materialId: number;
  fipeId: string;
  grupoVeiculoSuprimentoId: number;
  bau: string;
  categoriaGerencialId: number;
  periodoMesGarantiaFabricante: number;
}
