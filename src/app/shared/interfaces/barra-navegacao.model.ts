export interface BarraNavegacaoMV {
  prosseguir?: any;
  voltar?: any;
  edicao?: boolean;
  salvar?: boolean;
  aba: number;
  canDeactivate?: boolean;
  reset?: boolean;
  dadosUsuario?: Object;
  idCondutor?: number;
  habilitar: {
    dadosPessoais?: boolean;
    contato?: boolean;
    dadosResidenciais?: boolean;
    dadosAdicionais?: boolean;
    habilitacao?: boolean;
    prosseguir?: boolean;
  };
  validar: {
    dadosPessoais?: boolean;
    contato?: boolean;
    dadosResidenciais?: boolean;
    dadosAdicionais?: boolean;
    habilitacao?: boolean;
  };
  mostrar: {
    prosseguir?: boolean;
    voltar?: boolean;
    cancelar?: boolean;
    dadosPessoais?: boolean;
    contato?: boolean;
    dadosResidenciais?: boolean;
    dadosAdicionais?: boolean;
    habilitacao?: boolean;
  };
  navegar: boolean;
  label: {
    prosseguir: string;
    voltar: string;
  };
  icone: {
    prosseguir: string;
    voltar: string;
  };
}
