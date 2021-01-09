import { Component, HostListener, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { ReplaySubject } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { CentroCustoService } from 'src/app/core/services/centro-custo.service';
import { EmailService } from 'src/app/core/services/email.service';
import { RegionalService } from 'src/app/core/services/regionais.service';
import { EmailPost } from 'src/app/shared/interfaces/email.model';
import { PermissoesAcessoMV } from 'src/app/shared/interfaces/permissoes-acesso.model';
import { TipoPerfil } from 'src/assets/data/enums/tipo-perfil.enum';
import { ArquivoService } from '../../../core/services/arquivos.service';
import { BarraNavegacaoService } from '../../../core/services/barra-navegacao.service';
import { ClientesService } from '../../../core/services/cliente.service';
import { CondutorService } from '../../../core/services/condutor.service';
import { ConsultaCepService } from '../../../core/services/consulta-cep.service';
import { ReloadListasService } from '../../../core/services/reload-listas.service';
import { SnackBarService } from '../../../core/services/snack-bar.service';
import { UserContextService } from '../../../core/services/user-context.service';
import { CanDeactivateComponent } from '../../../shared/can-deactivate.component';
import { BarraNavegacaoMV } from '../../../shared/interfaces/barra-navegacao.model';
import { ColunasTabelaMV } from '../../../shared/interfaces/colunas-tabela.model';
import { PostCondutorMV } from '../../../shared/interfaces/post-condutor.model';
import { Util } from '../../../shared/util/utils';

@Component({
  selector: 'app-usuario-condutor',
  templateUrl: './usuario-condutor.component.html',
  styleUrls: ['./usuario-condutor.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UsuarioCondutorComponent implements OnInit, CanDeactivateComponent, OnDestroy {

  dataInputSubject = new ReplaySubject<any>(1);

  aba;

  condutores: any[];
  filtros: any;
  regionais = [] as Array<any>;
  centrosCustos = [] as Array<any>;

  showTable = true;
  isSearch = true;
  numRows = 20;
  numPage = 1;

  formUsuario: FormGroup;

  totalRows: number;
  condutorId: number;

  descricaoGenerica: string;
  mensagemInformacao: string;
  search: string;
  backTo: string;

  private entidadeId: string;

  constructor(
    private barraNavegacao: BarraNavegacaoService,
    private userContext: UserContextService,
    private condutorService: CondutorService,
    private clienteService: ClientesService,
    private snackBar: SnackBarService,
    private consultaCEP: ConsultaCepService,
    private activeRoute: ActivatedRoute,
    private router: Router,
    private translate: TranslateService,
    private arquivoService: ArquivoService,
    private emailService: EmailService,
    private regionalService: RegionalService,
    private centroCustoService: CentroCustoService
  ) { }

  ngOnInit(): void {
    this.formUsuario = new FormGroup({
      clientesId: new FormControl(''),
      centrosCustoId: new FormControl(''),
      regionaisId: new FormControl('')
    });

    this.inicializar();
  }

  private inicializar() {
    const _this = this;

    ReloadListasService.reset();
    _this.barraNavegacao.reiniciar();

    _this.setAba();

    _this.entidadeId = 'CONDUTOR';

    _this.barraNavegacao.setTabAtual('dadosPessoais');
    _this.barraNavegacao.get().edicao = !!_this.activeRoute.snapshot.params['id'];

    if (!_this.activeRoute.queryParams['value'].new && _this.barraNavegacao.get().edicao) {
      _this.showInsert();
      _this.getDadosCondutorEdicao(_this.activeRoute.snapshot.params['id']);
      _this.condutorId = _this.activeRoute.snapshot.params['id'];
    } else if (!!_this.activeRoute.queryParams['value'].new) {
      _this.backTo = _this.activeRoute.queryParams['value'].backTo;
      _this.showInsert();
    } else {
      _this.getCondutor();
      // _this.carregarCombos();
    }

    ReloadListasService.get('salvarCondutor').subscribe(data => {
      if (data === 'salvar') {
        _this.montarObjeto(_this.barraNavegacao.get().dadosUsuario);
      } else if (data === 'editar') {
        if (!_this.isAllTabsValid()) {
          if (_this.barraNavegacao.get().aba !== 3) {
            _this.snackBar.open(_this.translate.instant('PORTAL.MSG_CAMPO_OBRIGATORIO'), 7000, 'X');
          }
        } else {
          if (_this.barraNavegacao.get().aba !== 4) {
            _this.barraNavegacao.get().aba = 4;
            return;
          }
          _this.montarObjetoPut();
        }
      }
    });
  }

  setAba() {
    this.aba = {
      navegacao: {
        dadosPessoais: () => {
          this.barraNavegacao.get().salvar = false;
          this.barraNavegacao.label('prosseguir', 'Avançar');
          this.barraNavegacao.icone('prosseguir', 'arrow_forward');

          this.barraNavegacao.habilitar('prosseguir', this.barraNavegacao.get().validar.dadosPessoais || false);
        },
        contato: () => {
          this.barraNavegacao.get().salvar = false;
          this.barraNavegacao.label('prosseguir', 'Avançar');
          this.barraNavegacao.icone('prosseguir', 'arrow_forward');

          this.barraNavegacao.habilitar('prosseguir', this.barraNavegacao.get().validar.contato || false);
        },
        endereco: () => {
          this.barraNavegacao.get().salvar = false;
          this.barraNavegacao.label('prosseguir', 'Avançar');
          this.barraNavegacao.icone('prosseguir', 'arrow_forward');

          this.barraNavegacao.habilitar('prosseguir', true);
          this.barraNavegacao.validar('dadosResidenciais', true);
        },
        habilitacao: () => {
          this.barraNavegacao.get().salvar = false;
          this.barraNavegacao.label('prosseguir', 'Avançar');
          this.barraNavegacao.icone('prosseguir', 'arrow_forward');

          this.barraNavegacao.habilitar('prosseguir', true);
        },
        dadosAdicionais: () => {
          this.barraNavegacao.get().salvar = true;
          this.barraNavegacao.label('prosseguir', 'Salvar');
          this.barraNavegacao.icone('prosseguir', 'check');

          this.barraNavegacao.habilitar('prosseguir', this.barraNavegacao.get().validar.dadosAdicionais || false);
        }
      }
    };
  }

  carregarCombos(): void {
    this.regionalService.getAll({ grupoEconomicoId: Number(this.userContext.getGrupoEconomicoId()) }).subscribe(res1 => {
      this.regionais = res1.data.results;
      this.regionais.unshift({
        id: 0,
        descricao: 'Todos(as)',
        selecionado: false
      });

      this.centroCustoService.getAll({ grupoEconomicoId: Number(this.userContext.getGrupoEconomicoId()) }).subscribe(res2 => {
        this.centrosCustos = res2.data.results;
        this.centrosCustos.unshift({
          id: 0,
          descricao: 'Todos(as)',
          selecionado: false
        });
      }, res2 => {
        this.snackBar.error(res2.error.message, 3500, 'X');
      });
    }, res1 => {
      this.snackBar.error(res1.error.message, 3500, 'X');
    });
  }

  getPermissao(): PermissoesAcessoMV {
    if (!AuthService.getRouteRoles()) {
      return {};
    }
    return AuthService.getRouteRoles();
  }

  pesquisar(): void {
    this.getCondutor();
  }

  isAllTabsValid(): boolean {
    for (let index = 0; index <= 4; index++) {
      if (index === 0) {
        this.barraNavegacao.setTabAtual('dadosPessoais');
        ReloadListasService.get('dadosPessoais').emit();
        if (!this.barraNavegacao.get().validar.dadosPessoais) {
          this.barraNavegacao.get().aba = index;
          return false;
        }
      }
      if (index === 1) {
        this.barraNavegacao.setTabAtual('contato');
        ReloadListasService.get('contato').emit();
        if (!this.barraNavegacao.get().validar.contato) {
          this.barraNavegacao.get().aba = index;
          return false;
        }
      }
      if (index === 2) {
        this.barraNavegacao.setTabAtual('endereco');
        ReloadListasService.get('endereco').emit();
        if (!this.barraNavegacao.get().validar.dadosResidenciais) {
          this.barraNavegacao.get().aba = index;
          return false;
        }
      }
      if (index === 3) {
        this.barraNavegacao.setTabAtual('habilitacao');
        ReloadListasService.get('habilitacao').emit();
        if (!this.barraNavegacao.get().validar.habilitacao) {
          this.barraNavegacao.get().aba = index;
          return false;
        }
      }
      if (index === 4) {
        this.barraNavegacao.setTabAtual('dadosAdicionais');
        ReloadListasService.get('dadosAdicionais').emit();
        if (!this.barraNavegacao.get().validar.dadosAdicionais) {
          this.barraNavegacao.get().aba = index;
          return false;
        }
      }
    }
    return true;
  }

  getDadosCondutorEdicao(id: string): void {
    const callback = (res) => {
      this.montarObjetoEdicao(res.data);
    };

    this.condutorService.getById(Number(id)).subscribe(res => {
      this.barraNavegacao.habilitar(['dadosPessoais', 'habilitacao', 'contato', 'dadosResidenciais', 'dadosAdicionais']);

      if (res.data.grupoEconomico.id !== this.userContext.getGrupoEconomicoId()) {
        this.snackBar.open(this.translate.instant('PORTAL.USUARIO.MENSAGENS.USUARIO_DIFERENTE_CLIENTE'), 7000, 'X');
        this.router.navigateByUrl('cadastrar/usuario');
        return;
      }

      this.clienteService.get(Number(res.data.clienteId)).subscribe(res1 => {
        res.data.cliente = res.data.nomeFantasiaCliente;
        this.consultaCEP.getMunicipio(Number(res.data.municipioId)).subscribe(res2 => {
          res.data.dadosMunicipio = res2.data;

          this.consultaCEP.getMunicipio(Number(res.data.municipioEmissorId)).subscribe(res3 => {
            res.data.dadosMunicipioEmissor = res3.data;

            callback(res);
          }, res3 => {
            this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 7000);
          });
        }, res2 => {
          this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 7000);
        });
      }, res1 => {
        this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 7000);
      });
    }, res => {
      this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 7000);
    });
  }

  montarObjetoEdicao(dados: any): void {
    this.barraNavegacao.get().idCondutor = dados.codigoCondutor;
    let obj = null;

    obj = {
      dadosPessoais: {
        id: dados.codigoCondutor,
        status: dados.status,
        nomeCondutor: dados.nomeCondutor,
        dataNascimento: dados.dataNascimento,
        rg: dados.rg,
        cpf: dados.cpf,
        cnpj: dados.cnpjCliente,
        nomePai: dados.nomePai,
        nomeMae: dados.nomeMae,
        orgaoEmissor: dados.orgaoEmissorRG
      },
      contato: {
        telefone: dados.telefone,
        celular: dados.celular,
        email: dados.email
      },
      endereco: {
        cep: dados.cep,
        logradouro: dados.logradouro,
        numero: dados.numero,
        complemento: dados.complemento,
        bairro: dados.bairro,
        uf: dados.dadosMunicipio && dados.dadosMunicipio.uf ? dados.dadosMunicipio.uf : '',
        cidade: dados.dadosMunicipio && dados.dadosMunicipio.municipio ? dados.dadosMunicipio.municipio : '',
        municipioId: dados.municipioId,
      },
      habilitacao: {
        numeroRegistro: dados.numeroRegistro,
        habilitacaoCategoriaId: dados.habilitacaoCategoriaId === 0 ? null : dados.habilitacaoCategoriaId,
        dataValidade: dados.dataValidade || null,
        dataPrimeiraHabilitacao: dados.dataPrimeiraHabilitacao || null,
        municipioEmissorId: dados.municipioEmissorId,
        dataEmissao: dados.dataEmissao || null,
        municipio: dados.dadosMunicipioEmissor && dados.dadosMunicipioEmissor.municipio ? dados.dadosMunicipioEmissor.municipio : '',
        observacoes: dados.observacoes,
        ufEmissor: dados.dadosMunicipioEmissor || ''
      },
      dadosAdicionais: {
        assinaMulta: dados.assinaMulta,
        formaContato: dados.condutorFormaContatoId,
        cliente: { id: dados.clienteId, cliente: dados.cliente },
        chavePerfilUsuario: dados.chaveCondutorPerfilUsuario,
        grupoEconomico: dados.grupoEconomico,
        clientes: dados.clientes,
        regionais: dados.regionais,
        centrosCusto: dados.centrosCusto,
        atividades: dados.atividades,
        produtos: dados.produtos,
        enderecoCrlv: dados.enderecoCrlv,
        aprovacaoNivel1: dados.aprovacaoNivel1,
        aprovacaoNivel2: dados.aprovacaoNivel2
      }
    };

    this.getCNH(obj);

    this.barraNavegacao.setDados(obj.dadosPessoais, 'dadosPessoais');
    this.barraNavegacao.setDados(obj.contato, 'contato');
    this.barraNavegacao.setDados(obj.endereco, 'endereco');
    this.barraNavegacao.setDados(obj.dadosAdicionais, 'dadosAdicionais');
  }

  private getCNH(dados: any): void {
    const url = this.arquivoService.recuperarArquivo();
    this.barraNavegacao.setDados(dados.habilitacao, 'habilitacao');
    // this.arquivoService.getAll(
    //   this.entidadeId,
    //   dados.dadosPessoais.id,
    //   'CNH'
    // ).subscribe(response => {
    //   if (response.error) {
    //     this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    //     return;
    //   }
    //   if (response.data && response.data[0]) {
    //     response.data[0].safeURL = this.sanitizer.bypassSecurityTrustResourceUrl(`${url}${response.data[0].href}`);
    //     response.data[0].href = `${url}${response.data[0].href}`;

    //     this.barraNavegacao.setCondutorCNH(response.data[0]);
    //   }
    //   this.barraNavegacao.setDados(dados.habilitacao, 'habilitacao');
    // }, res => {
    //   this.barraNavegacao.setDados(dados.habilitacao, 'habilitacao');
    //   this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    // });
  }

  getColunasTabela(): ColunasTabelaMV[] {
    const colunas: ColunasTabelaMV[] = [
      { description: this.translate.instant('PORTAL.USUARIO.LBL_GRUPO_ECONOMICO'), columnDef: 'nomeGrupoEconomico' },
      { description: this.translate.instant('PORTAL.USUARIO.LBL_CODIGO'), columnDef: 'id' },
      { description: this.translate.instant('PORTAL.USUARIO.LBL_NOME'), columnDef: 'nomeCondutor' },
      { description: this.translate.instant('PORTAL.USUARIO.LBL_CPF'), columnDef: 'cpf', documento: true },
      { description: this.translate.instant('PORTAL.USUARIO.LBL_TIPO_PERFIL'), columnDef: 'nomeTipoPerfil' },
      { description: this.translate.instant('PORTAL.LABELS.ACOES'), columnDef: 'action', action: true, width: 10 }
    ];

    return colunas;
  }

  private postCNH(idCondutor: number): void {
    this.arquivoService
      .postArquivo(
        Number(this.userContext.getID()),
        this.entidadeId,
        Number(idCondutor),
        'CNH',
        this.barraNavegacao.getCondutorCNH()['descricao'],
        this.barraNavegacao.getCondutorCNH()['fileFormData']
      ).subscribe(res => {
        this.barraNavegacao.editedCNHId = null;
      }, res => {
        this.snackBar.open(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
      });
  }

  validation(tabType: string): boolean {
    if (!this.barraNavegacao.get().edicao) {
      return true;
    }
    switch (tabType) {
      case 'dadosPessoais':
        if (this.barraNavegacao.get().dadosUsuario['dadosPessoais']) {
          return true;
        }
        return false;
      case 'dadosAdicionais':
        if (this.barraNavegacao.get().dadosUsuario['dadosAdicionais']) {
          return true;
        }
        return false;
      case 'contato':
        if (this.barraNavegacao.get().dadosUsuario['contato']) {
          return true;
        }
        return false;
      case 'endereco':
        if (this.barraNavegacao.get().dadosUsuario['endereco']) {
          return true;
        }
        return false;
      case 'habilitacao':
        if (this.barraNavegacao.get().dadosUsuario['habilitacao']) {
          return true;
        }
        return false;
    }
  }

  getCondutor(eventTable?: number): void {
    this.condutores = [];
    this.numPage = eventTable || 1;

    if (this.numPage === 1) {
      this.showTable = false;
    }

    this.filtros = {
      clientesId: this.formUsuario.get('clientesId').value ? this.formUsuario.get('clientesId').value : null,
      centrosCustoId: this.formUsuario.get('centrosCustoId').value ? this.formUsuario.get('centrosCustoId').value : null,
      regionaisId: this.formUsuario.get('regionaisId').value ? this.formUsuario.get('regionaisId').value : null,
      descricaoGenerica: this.descricaoGenerica || null,
      numRows: this.numRows,
      numPage: eventTable || 1
    };

    this.condutorService.get(this.filtros).subscribe(res => {
      this.totalRows = res.data.totalRows;
      this.condutores = res.data.results.map(item => {
        item.action = true;

        item.nomeTipoPerfil = _.isNil(item.tipoPerfil) ? null : TipoPerfil[item.tipoPerfil];

        item.nomeGrupoEconomico = _.get(item, 'grupoEconomico.nome');

        item.icones = [{
          function: this.setInformacaoes.bind(this),
          info: true,
          show: true,
          svg: 'pfu-info'
        },
        {
          function: this.goToEdition.bind(this),
          label: this.translate.instant('PORTAL.LABELS.EDITAR'),
          info: false,
          show: this.getPermissao().alterar,
          svg: 'pfu-edit'
        }];

        item.id = item.codigoCondutor;
        if (item.cpf) {
          item.cpf = item.cpf.replace(/\s/g, '');
        }
        return item;
      });

      this.showTable = true;
    }, res => {
      this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 7000, 'X');
      this.condutores = [];
      this.showTable = true;
    });
  }

  canDeactivate(): boolean {
    return false;
  }

  @HostListener('window:beforeunload', ['$event']) unloadNotification($event: any) { }

  getNavegacao(): BarraNavegacaoMV {
    return this.barraNavegacao.get();
  }

  select(event: MatTabChangeEvent) {
    this.barraNavegacao.get().aba = event.index;

    if (event.index === 0) {
      this.barraNavegacao.setTabAtual('dadosPessoais');
      this.aba.navegacao.dadosPessoais();
      return;
    }
    if (event.index === 1) {
      this.barraNavegacao.setTabAtual('contato');
      this.aba.navegacao.contato();
      return;
    }
    if (event.index === 2) {
      this.barraNavegacao.setTabAtual('endereco');
      this.aba.navegacao.endereco();
      return;
    }
    if (event.index === 3) {
      this.barraNavegacao.setTabAtual('habilitacao');
      this.aba.navegacao.habilitacao();
      return;
    }
    if (event.index === 4) {
      this.barraNavegacao.setTabAtual('dadosAdicionais');
      this.aba.navegacao.dadosAdicionais();
      return;
    }
  }

  showInsert(): void {
    this.barraNavegacao.setCondutorCNH(null);
    this.isSearch = !this.isSearch;
    this.showTable = false;
  }

  goToEdition(dados: any): void {
    this.router.navigateByUrl(`cadastrar/usuario/${dados.id}`);
    this.showInsert();
  }

  clearSearch(): void {
    this.descricaoGenerica = '';
    this.formUsuario.reset();

    this.showTable = false;

    this.getCondutor();
  }

  cancelar(): void {
    this.isSearch = !this.isSearch;
    this.showTable = !this.showTable;
    this.barraNavegacao.reiniciar();
    if (this.backTo) {
      this.router.navigate([this.backTo]);
      return;
    }
    this.clearSearch();
    this.router.navigate(['cadastrar/usuario']);

    this.inicializar();
  }

  setInformacaoes(dados: any) {
    const modificadoEm = dados.modificadoEm
      ? Util.formataData(dados.modificadoEm, 'DD/MM/YYYY HH:MM')
      : Util.formataData(dados.inseridoEm, 'DD/MM/YYYY HH:MM');

    this.mensagemInformacao = `Registro inserido em ${Util.formataData(dados.inseridoEm, 'DD/MM/YYYY HH:MM')} por
    ${dados.usuarioCriador} e atualizado pela última vez em ${modificadoEm}
    por ${dados.usuarioModificador ? dados.usuarioModificador : dados.usuarioCriador}.`;
  }

  montarObjetoPut(): void {
    const dados = this.barraNavegacao.get().dadosUsuario;
    let objDadosPessoais: any = {};
    let objEndereco: any = {};
    let objHab: any = {};

    objDadosPessoais = {
      status: dados['dadosPessoais'].status ? 'ATIVO' : 'INATIVO',
      nome: dados['dadosPessoais'].nome || null,
      dataNascimento: new Date(dados['dadosPessoais'].dataNascimento).getTime() || null,
      rg: dados['dadosPessoais'].rg || null,
      orgaoEmissor: dados['dadosPessoais'].orgaoEmissor || null,
      cpf: dados['dadosPessoais'].cpf || null,
      cnpj: dados['dadosPessoais'].cnpjCliente || null,
      nomeMae: dados['dadosPessoais'].nomeMae || null,
      nomePai: dados['dadosPessoais'].nomePai || null,
      telefone: dados['contato'].telefone || null,
      celular: dados['contato'].celular || null,
      email: dados['contato'].email || null,
      grupoEconomico: dados['dadosAdicionais'].grupoEconomico,
      perfil: dados['dadosAdicionais'].perfil,
      clientes: dados['dadosAdicionais'].clientes,
      regionais: dados['dadosAdicionais'].regionais,
      centrosCusto: dados['dadosAdicionais'].centrosCusto,
      produtos: dados['dadosAdicionais'].produtos,
      atividades: dados['dadosAdicionais'].atividades,
      aprovacaoNivel1: dados['dadosAdicionais'].aprovacaoNivel1,
      aprovacaoNivel2: dados['dadosAdicionais'].aprovacaoNivel2,
      enderecoCrlv: dados['dadosAdicionais'].enderecoCrlv,
      assinaMulta: dados['dadosAdicionais'].assinaMulta || false,
      condutorFormaContatoId: dados['dadosAdicionais'].formaContato || null,
      usuarioId: this.userContext.getUsuarioId()
    };
    objEndereco = {
      cep: dados['endereco'].cep || null,
      logradouro: dados['endereco'].logradouro || null,
      numero: dados['endereco'].numero || null,
      complemento: dados['endereco'].complemento || null,
      bairro: dados['endereco'].bairro || null,
      uf: dados['endereco'].uf || null,
      municipioId: dados['endereco'].municipioId || null,
      usuarioId: this.userContext.getUsuarioId()
    };
    objHab = {
      numeroRegistro: dados['habilitacao'].numeroRegistro || null,
      habilitacaoCategoriaId: Number(dados['habilitacao'].habilitacaoCategoriaId) === 0
        ? null : Number(dados['habilitacao'].habilitacaoCategoriaId),
      dataValidade: new Date(dados['habilitacao'].dataValidade).getTime() || null,
      dataPrimeiraHabilitacao: new Date(dados['habilitacao'].dataPrimeiraHabilitacao).getTime() || null,
      municipioEmissorId: dados['habilitacao'].municipioEmissorId || null,
      dataEmissao: new Date(dados['habilitacao'].dataEmissao).getTime() || null,
      observacoes: dados['habilitacao'].observacoes || null,
      usuarioId: this.userContext.getUsuarioId()
    };

    this.putCondutor(objDadosPessoais, objEndereco, objHab);
  }

  montarObjeto(dados: any): void {
    const obj: PostCondutorMV = {
      status: 'ATIVO',
      nome: dados['dadosPessoais'].nome,
      dataNascimento: new Date(dados['dadosPessoais'].dataNascimento).getTime(),
      rg: dados['dadosPessoais'].rg,
      orgaoEmissor: dados['dadosPessoais'].orgaoEmissor,
      cpf: dados['dadosPessoais'].cpf,
      nomeMae: dados['dadosPessoais'].nomeMae,
      nomePai: dados['dadosPessoais'].nomePai,
      telefone: dados['contato'].telefone,
      celular: dados['contato'].celular,
      email: dados['contato'].email,
      cep: dados['endereco'].cep,
      logradouro: dados['endereco'].logradouro,
      numero: dados['endereco'].numero,
      complemento: dados['endereco'].complemento,
      bairro: dados['endereco'].bairro,
      uf: dados['endereco'].uf,
      municipioId: dados['endereco'].municipioId,
      numeroRegistro: dados['habilitacao'].numeroRegistro,
      habilitacaoCategoriaId: Number(dados['habilitacao'].habilitacaoCategoriaId) === 0
        ? null : Number(dados['habilitacao'].habilitacaoCategoriaId),
      dataValidade: new Date(dados['habilitacao'].dataValidade).getTime(),
      dataPrimeiraHabilitacao: new Date(dados['habilitacao'].dataPrimeiraHabilitacao).getTime(),
      municipioEmissorId: dados['habilitacao'].municipioEmissorId,
      dataEmissao: new Date(dados['habilitacao'].dataEmissao).getTime(),
      observacoes: dados['habilitacao'].observacoes,
      perfil: dados['dadosAdicionais'].perfil,
      assinaMulta: dados['dadosAdicionais'].assinaMulta,
      condutorFormaContatoId: dados['dadosAdicionais'].formaContato,
      usuarioId: Number(this.userContext.getUsuarioId()),
      informaEndereco: true,
      informaHabilitacao: true,
      criarUsuarioPortalCliente: true,
      grupoEconomico: dados['dadosAdicionais'].grupoEconomico,
      clientes: dados['dadosAdicionais'].clientes,
      regionais: dados['dadosAdicionais'].regionais,
      centrosCusto: dados['dadosAdicionais'].centrosCusto,
      produtos: dados['dadosAdicionais'].produtos,
      atividades: dados['dadosAdicionais'].atividades,
      aprovacaoNivel1: dados['dadosAdicionais'].aprovacaoNivel1,
      aprovacaoNivel2: dados['dadosAdicionais'].aprovacaoNivel2,
      enderecoCrlv: dados['dadosAdicionais'].enderecoCrlv,
    };

    this.salvarCondutor(obj);
  }

  private putCondutor(objCondutor: any, objEndereco: any, objHab: any): void {
    this.condutorService.put(this.barraNavegacao.get().idCondutor, objCondutor).subscribe(res => {
      this.putEndereco(objEndereco, objHab);
    }, res => {
      this.snackBar.error(res.error.message || this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  private putEndereco(endereco: any, objHab: any): void {
    this.condutorService.putEndereco(this.barraNavegacao.get().idCondutor, endereco).subscribe(res => {
      this.putHabilitacao(objHab);
    }, res => {
      this.snackBar.error(res.error.message || this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  private putHabilitacao(habilitacao): void {
    this.condutorService.putHabilitacao(this.barraNavegacao.get().idCondutor, habilitacao).subscribe(res => {
      this.snackBar.success('Usuário alterado com sucesso!', 7000, 'X');
      this.putCNH(this.condutorId);
      this.cancelar();
    }, res => {
      this.snackBar.error(res.error.message || this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  private salvarCondutor(obj: PostCondutorMV): void {
    this.condutorService.post(obj).subscribe(res => {
      if (this.backTo) {
        this.condutorService.setStoredId(Number(res.data.condutorId));
      }
      if (this.barraNavegacao.getCondutorCNH() && this.barraNavegacao.getCondutorCNH()['fileFormData']) {
        this.postCNH(res.data.condutorId);
      }

      this.emailConfirmacao(obj, res.data);
    }, res => {
      if (res.error.message.error === 'CONDUTOR_JA_CADASTRADO') {
        this.snackBar.open(this.translate.instant('PORTAL.MSG_CONDUTOR_JA_CADASTRADO'), 7000, 'X');
      } else {
        this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 7000, 'X');
      }
    });
  }

  private putCNH(idCondutor: number): void {
    const cnh = this.barraNavegacao.getCondutorCNH();
    const imageId = cnh && cnh['id'] ? cnh['id'] : this.barraNavegacao.editedCNHId;

    if (!cnh) {
      if (imageId) {
        this.deleteCNH(imageId);
      }
      return;
    }
    if (!imageId) {
      this.postCNH(this.activeRoute.snapshot.params['id']);
      return;
    }
    if (!cnh.descricao || !cnh.fileFormData) {
      return;
    }

    this.arquivoService.putArquivo(
      imageId,
      Number(this.userContext.getID()),
      this.entidadeId,
      Number(idCondutor),
      'CNH',
      cnh.descricao,
      cnh.fileFormData
    ).subscribe(res => {
      this.barraNavegacao.editedCNHId = null;
    }, res => {
      this.snackBar.open(res.error.message || this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  private deleteCNH(id: string): void {
    this.arquivoService.deleteArquivo(id).subscribe(res => {
      this.barraNavegacao.editedCNHId = null;
    }, res => {
      this.snackBar.open(res.error.message || this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  private emailConfirmacao(condutor: PostCondutorMV, responseCondutor: any): void {
    const email: EmailPost = {};
    email.from = `noreply@unidas.com.br`;
    email.to = ['unidastestebh@gmail.com', condutor.email];
    email.subject = `${responseCondutor.nomeUsuario}, seja bem-vindo ao Portal do Cliente`;

    email.html = '<html><head></head><body style="max-width:1080px">';
    email.html = '<div style="color: #707070; font-family: sans-serif;">';
    // tslint:disable-next-line: max-line-length
    email.html += `<img src='https://qasunidas.unidas.com.br:8005/api/v1/attachments/6CD2E829-16D9-4665-BCF4-E712D910261B' height='auto' width='100%' style=" margin-bottom:20px" />`;
    // tslint:disable-next-line: max-line-length
    email.html += `<div style="margin-bottom:20px">Bem-vindo ao Frota 360, o portal do cliente Unidas. Você é cliente da empresa líder em terceirização de frotas corporativas do Brasil e estamos muito felizes de ter você com a gente!</div>`;
    // tslint:disable-next-line: max-line-length
    email.html += `<div>Aqui estão seus dados de acesso:</div>`;
    // tslint:disable-next-line: max-line-length
    email.html += `<div><b>Usuário: </b><span style="font-weight: bold; color: #005b9e; text-decoration: underline;">${condutor.email}</span></div>`;
    // tslint:disable-next-line: max-line-length
    email.html += `<div style="margin-bottom:20px"><b>Senha: </b><span style="font-weight: bold; color: #005b9e; text-decoration: underline;">${responseCondutor.senha}</span>.</div>`;

    email.html += `<div>Após o primeiro acesso você deve alterar sua senha.</div>`;
    email.html += `<div>Através do Frota 360, você tem acesso a informações atualizadas sobre a sua frota e pode gerir seu contrato com mobilidade e praticidade.</div>`;
    email.html += `<div style="margin-bottom:20px">Vamos juntos.</div>`;
    email.html += `<div style="display: flex !important; justify-content: center !important;">`;
    email.html += `<a href="${this.userContext.getLoginURL()}" target="_blank">`;
    // tslint:disable-next-line: max-line-length
    email.html += `<img src='https://qasunidas.unidas.com.br:8005/api/v1/attachments/0F36FB4D-648A-4B8F-A522-AEB17F0DCDFE' height='50px' width='200px' />`;
    email.html += '</a>';
    email.html += '</div>';
    email.html += '</div>';
    email.html += '</body></html>';

    this.emailService.postEmail(email).subscribe(res => {
      this.snackBar.success('Usuário cadastrado com sucesso!', 7000, 'X');
      this.cancelar();
    }, res => {
      this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  ngOnDestroy(): void {
    this.barraNavegacao.setTabAtual('dadosPessoais');
    this.barraNavegacao.reiniciar();
    this.barraNavegacao.setCondutorCNH(null);
  }
}
