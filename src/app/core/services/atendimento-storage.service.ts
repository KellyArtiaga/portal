export class AtendimentoStorageService {

  public static abaSelecionada = 0;

  public static functionSalvar: Function;

  // Form's
  public static abaZeroForm: any;
  public static abaUmForm: any;
  public static abaDoisForm: any;

  // Atendimento
  public static atendimento: any;

  // Calendario AbaDois
  public static fornecedor: any;
  public static calendarioFornecedor: any;
  public static fornecedorSelecionado: any;

  // Arquivos AbaUm
  public static arquivos: Array<any> = [];

  // Flag's resetar abas
  public static resetarAbaUm: boolean;
  public static resetarAbaDois: boolean;

  static removeStoredFornecedor(listaFornecedores: Array<any>, fornecedor: any): Array<any> {
    const index = listaFornecedores.findIndex(item => item.fornecedor.fornecedorId === fornecedor.fornecedorId);

    if (index !== -1) {
      listaFornecedores.splice(index, 1);
    }
    return listaFornecedores;
  }

  static getServicosPesquisaRaio(): Array<any> {
    let servicosPesquisaRaio = [];
    let formUm = AtendimentoStorageService.abaUmForm;

    if (AtendimentoStorageService.abaSelecionada === 2 && formUm && formUm.value) {
      formUm = formUm.value;
      const preventivas = formUm['preventiva'] || [];
      const corretivas = formUm['corretiva'] || [];
      const sinistros = formUm['sinistro'] || [];

      servicosPesquisaRaio = preventivas.filter(item => item.crlv === false && item.semFornecedor === false);
      servicosPesquisaRaio = servicosPesquisaRaio.concat(corretivas.filter(item => item.crlv === false && item.semFornecedor === false));
      servicosPesquisaRaio = servicosPesquisaRaio.concat(sinistros.filter(item => item.crlv === false && item.semFornecedor === false));
    }

    return servicosPesquisaRaio;
  }

  static setArquivos(arquivo: any): void {
    AtendimentoStorageService.arquivos.push(arquivo);
  }

  static getArquivos(): any {
    return AtendimentoStorageService.arquivos;
  }

  static removeArquivos(arquivo: any): boolean {
    const index = AtendimentoStorageService.arquivos.findIndex(item => item.descricao === arquivo.descricao);

    if (index !== -1) {
      AtendimentoStorageService.arquivos.splice(index, 1);
      return true;
    }
    return false;
  }

  static removeAllArquivos() {
    AtendimentoStorageService.arquivos = [];
  }

  static reset() {
    AtendimentoStorageService.atendimento = null;
    AtendimentoStorageService.fornecedor = null;
    AtendimentoStorageService.fornecedorSelecionado = null;
    AtendimentoStorageService.calendarioFornecedor = null;
    AtendimentoStorageService.abaZeroForm = null;
    AtendimentoStorageService.abaUmForm = null;
    AtendimentoStorageService.abaDoisForm = null;
    AtendimentoStorageService.abaSelecionada = 0;
    AtendimentoStorageService.removeAllArquivos();
  }

}
