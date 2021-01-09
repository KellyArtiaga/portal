export interface VeiculoSolicitacaoSubstituicaoMV {
  veiculoId: number;
  codigoCliente: number;
  emailUsuarioSolicitante: string;
  emailResponsavelSolicitacao: string;
  motivoSolicitacao: string;
  motivoSubstituicao: string;
  codigoGrupoCliente: number;
  codigoCIA: number;
  codigoDevolucao: number;
  codigoMunicipioEntregaVeiculo: number;
  observacao: string;
  veiculosSolicitacaoSubstituicao: [{
    codigoVeiculosSolicitacaoSubstituicao: number;
    codigoModeloVeiculoSolicitado: number;
    quantidadeVeiculoSolicitado: number;
    finalPlacaVeiculoSubstituido: number;
    codigoCor: number;
    codigoCombustivel: number
  }];
  codigosEquipamentos: [{
    codigoVeiculosSolicitacaoSubstituicao: number;
    codigoEquipamento: number
  }];
  codigoUsuario: number;
}
