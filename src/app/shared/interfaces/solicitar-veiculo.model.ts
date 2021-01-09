export interface SolicitarVeiculoMV {
  codigoMVA?: number;
  codigoCliente: number;
  emailUsuarioSolicitante: string;
  emailResponsavelSolicitacao: string;
  motivoSolicitacao: string;
  motivoSubstituicao?: string;
  codigoGrupoCliente?: number;
  codigoCIA?: number;
  codigoDevolucao?: number;
  codigoMunicipioEntregaVeiculo?: number;
  modelos: [
    {
      codigoModeloVeiculoSolicitado: number;
      quantidadeVeiculoSolicitado: number;
      finalPlacaVeiculoSubstituido: number;
      codigoCor: number;
      codigoCombustivel: number;
    }
  ];
  observacao: number;
  codigoUsuario: number;
}
