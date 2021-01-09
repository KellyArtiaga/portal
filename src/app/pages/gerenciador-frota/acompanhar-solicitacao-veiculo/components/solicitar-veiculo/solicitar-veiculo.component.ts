import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange, MatMenuTrigger } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { filter, find } from 'lodash';
import { debounceTime, startWith, tap } from 'rxjs/operators';
import { EmailService } from 'src/app/core/services/email.service';
import { EmailStructureComponent } from 'src/app/shared/components/email-structure/email-structure.component';
import { CiaService } from '../../../../../core/services/cia.service';
import { ClientesService } from '../../../../../core/services/cliente.service';
import { CombustivelService } from '../../../../../core/services/combustiveis.service';
import { ConsultaCepService } from '../../../../../core/services/consulta-cep.service';
import { CorService } from '../../../../../core/services/cores.service';
import { GrupoClienteMaringaService } from '../../../../../core/services/grupo-cliente-maringa.service';
import { SnackBarService } from '../../../../../core/services/snack-bar.service';
import { SolicitacaoSubstituicaoService } from '../../../../../core/services/solicitacao-substituicao.service';
import { UserContextService } from '../../../../../core/services/user-context.service';
import { UsuarioService } from '../../../../../core/services/usuario.service';
import { VeiculoEquipamentoSolicitacaoSubstituicaoService } from '../../../../../core/services/veiculo-equipamento-solicitacao-substituicao.service';
import { VeiculoModeloService } from '../../../../../core/services/veiculo-modelo.service';
import { VeiculoSolicitacaoSubstituicaoService } from '../../../../../core/services/veiculo-solicitacao-substituicao.service';
import { VeiculoService } from '../../../../../core/services/veiculos.service';
import { CombustivelMV } from '../../../../../shared/interfaces/combustivel.model';
import { CommonMV } from '../../../../../shared/interfaces/common.model';
import { CorMV } from '../../../../../shared/interfaces/cores.model';
import { EquipamentosMV } from '../../../../../shared/interfaces/equipamentos.model';
import { VeiculoModeloMV } from '../../../../../shared/interfaces/veiculo-modelo.model';
import { Util } from '../../../../../shared/util/utils';


@Component({
  selector: 'app-solicitar-veiculo',
  templateUrl: './solicitar-veiculo.component.html',
  styleUrls: ['./solicitar-veiculo.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SolicitarVeiculoComponent implements OnInit {

  @ViewChild(MatMenuTrigger) acessorios: MatMenuTrigger;
  @ViewChild('cidadeAutoField') cidadeAutoField: ElementRef;
  @ViewChild('observacaoField') observacaoField: ElementRef;

  codigoEdicao: number;
  codigoDevolucao: number;

  resumeValues: any[] = [];
  cardResumoOptions: any;
  cardVeiculos: any[] = [{}];
  ufs = [] as Array<any>;
  clientes: any[];
  gruposClientes: any[];
  veiculo: any;

  form: FormGroup;
  observacoes = new FormControl();

  acessoriosModelo: EquipamentosMV[];
  motivoSolicitacao: CommonMV[] = [{
    id: 'I',
    description: 'Inclusão'
  }, {
    id: 'S',
    description: 'Renovação'
  }];

  motivoSubstituicao: CommonMV[] = [{
    id: 'I',
    description: 'Idade'
  }, {
    id: 'K',
    description: 'KM'
  }, {
    id: 'P',
    description: 'Perda Total'
  }, {
    id: 'R',
    description: 'Roubo'
  }, {
    id: 'U',
    description: 'Upgrade'
  }, {
    id: 'D',
    description: 'Downgrade'
  }];

  cores: CorMV[];
  modelos: VeiculoModeloMV[];
  combustiveis: CombustivelMV[];

  cidades = {
    data: [] as Array<any>,
    filteredData: [] as Array<any>
  };

  veiculosSubstituidos = {
    data: [] as Array<any>,
    filteredData: [] as Array<any>
  };

  cias = [] as Array<any>;

  situacaoSolicitacao: any;

  isEdition: boolean;

  constructor(
    private clienteService: ClientesService,
    private veiculoService: VeiculoService,
    private corService: CorService,
    private combustivelServive: CombustivelService,
    private modeloService: VeiculoModeloService,
    private userContext: UserContextService,
    private grupoClienteService: GrupoClienteMaringaService,
    private snackBar: SnackBarService,
    private translate: TranslateService,
    private consultaCEPService: ConsultaCepService,
    private solicitacaoSubstituicaoService: SolicitacaoSubstituicaoService,
    private veiculoSolicitacaoSubstituicaoService: VeiculoSolicitacaoSubstituicaoService,
    private veiculoEquipamentoSolicitacaoSubstituicaoService: VeiculoEquipamentoSolicitacaoSubstituicaoService,
    private usuarioService: UsuarioService,
    private activeRouter: ActivatedRoute,
    private ciaService: CiaService,
    private router: Router,
    private emailService: EmailService
  ) { }

  ngOnInit() {
    this.isEdition = false;
    this.criarForm();

    this.activeRouter.params.subscribe(params => {
      if (params && params.id) {
        this.cardVeiculos = [];
        this.codigoEdicao = params.id;
        this.solicitacaoSubstituicaoService.getById(params.id).subscribe(res => {
          if (res.data) {
            this.preencherCamposEdicao(res.data);
          }
        }, err => {
          this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
        });

        this.activeRouter.queryParams.subscribe(queries => {
          if (queries) {
            this.isEdition = true;
            this.situacaoSolicitacao = queries.situacaoSolicitacao;

            if (this.exibirAprovarReprovar()) {
              this.cardResumoOptions = {
                footerLabel: 'Cancelar Solicitação',
                footerClass: 'text-card-red',
                footerFunction: this.reprovarCancelarSolicitacao.bind(this)
              };
            } else {
              this.cardResumoOptions = {};
            }

            this.resumeValues = [{
              subtitle: this.translate.instant('PORTAL.SOLICITACAO_VEICULO.LABEL.CODIGO'),
              value: params.id
            }, {
              subtitle: this.translate.instant('PORTAL.SOLICITACAO_VEICULO.LABEL.CODIGO_DEVOLUCAO'),
              value: this.codigoDevolucao || ' - '
            }, {
              subtitle: this.translate.instant('PORTAL.SOLICITACAO_VEICULO.LABEL.SITUACAO'),
              value: this.situacaoSolicitacao
            }, {
              subtitle: this.translate.instant('PORTAL.SOLICITACAO_VEICULO.LABEL.DATA_EMISSAO'),
              value: queries.dataEmissao ? Util.formataData(Number(queries.dataEmissao)) : ''
            }];
          }
        });
      }
    });
  }

  private criarForm(): void {
    this.form = new FormGroup({
      cliente: new FormControl('', Validators.compose([Validators.required])),
      emailResponsavel: new FormControl('', Validators.compose([Validators.required, Validators.email])),
      uf: new FormControl(''),
      cidade: new FormControl(''),
      solicitante: new FormControl('', Validators.compose([Validators.required])),
      emailSolicitante: new FormControl('', Validators.compose([Validators.required, Validators.email])),
      motivoSolicitacao: new FormControl('', Validators.compose([Validators.required])),
      veiculoSubstituido: new FormControl(''),
      motivoSubstituicao: new FormControl(''),
      cia: new FormControl(''),
      grupoCliente: new FormControl('')
    });

    Util.disableFieldForm(this.form, ['veiculoSubstituido', 'motivoSubstituicao', 'motivoSolicitacao', 'cidade']);

    this.preencherCombos();
    this.getClientes();
  }

  private getClientes(): void {
    this.clienteService.getClienteCondutor(Number(this.userContext.getCondutorId())).subscribe(res => {
      this.clientes = res.data.results;
    }, res => {
      this.snackBar.error(res.error.message || this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500);
    });
  }

  preencherCamposEdicao(principal: any): void {
    this.isEdition = true;
    this.form.get('emailResponsavel').setValue(principal.emailResponsavel);
    this.form.get('emailSolicitante').setValue(principal.emailUsuario);
    this.form.get('veiculoSubstituido').setValue(principal.veiculoId);
    this.form.get('motivoSubstituicao').setValue(principal.motivoSubstituicao);
    this.form.get('grupoCliente').setValue(principal.grupoClienteId);

    if (principal.ciaId) {
      const cia = this.cias.findIndex(item => item.id === principal.ciaId);
      this.form.get('cia').setValue(cia);
    }

    this.usuarioService.get(principal.inseridoPor).subscribe(res => {
      this.form.get('solicitante').setValue(res.data.nomeUsuario);
    }, err => {
      this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });

    this.clienteService.get(principal.clienteId).subscribe(res => {
      const clienteSolicitante = this.clientes.findIndex(item => item.clienteId === principal.clienteId);

      this.form.get('cliente').setValue(this.clientes[clienteSolicitante]);

      this.enableMotivoSolicitacao(principal.motivoSolicitacaoId);

      if (principal.motivoSubstituicao) {
        const motivo = this.motivoSubstituicao.find(item => item.description === principal.motivoSubstituicao);
        this.form.get('motivoSubstituicao').setValue(motivo.id);
      }
    }, err => {
      this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });

    this.consultaCEPService.getMunicipio(principal.municipioEntregaVeiculoId).subscribe(res => {
      this.form.get('uf').setValue(res.data.uf);
      this.form.get('cidade').setValue(res.data);
    }, err => {
      this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });

    this.preencherCardsEdicao(principal.id);
  }

  preencherCardsEdicao(solicitacaoSubstituicaoId: any) {
    this.veiculoSolicitacaoSubstituicaoService.getAll(solicitacaoSubstituicaoId).subscribe(res => {
      if (res.data && res.data.results) {
        res.data.results.forEach(veiculo => {
          veiculo.codigoCor = veiculo.corId;
          veiculo.codigoCombustivel = veiculo.combustivelId;
          veiculo.codigoModeloVeiculoSolicitado = veiculo.modeloVeiculoSolicitadoId;

          this.veiculoEquipamentoSolicitacaoSubstituicaoService.getAll({ veiculoSolicitacaoId: veiculo.id }).subscribe(res1 => {
            veiculo.acessorios = res1.data.results;
          }, res1 => {
            this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
          });

          this.cardVeiculos.push(veiculo);
        });
      }
    }, res => {
      this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  preencherCombos() {
    this.getCores();
    this.getCombustiveis();
    this.carregarUFs();
    this.carregarCidades();

    if (this.hasPerfilClaro()) {
      this.getCIA();
      this.getGrupoCliente();
    }
  }

  private getGrupoCliente(): void {
    this.grupoClienteService.getAll().subscribe(res => {
      this.gruposClientes = res.data.results;
    }, res => {
      this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  private getCIA(): void {
    const cia = this.form.get('cia');

    cia.valueChanges.pipe(
      tap(() => cia.value),
      debounceTime(300),
      startWith(''),
    ).subscribe(value => {
      if (typeof value === 'string') {
        this.ciaService.all({ descricao: value }).subscribe(res => {
          this.cias = res.data.results;
        }, err => {
          this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
        });
      }
    });
  }

  private getCores(): void {
    this.corService.getAll().subscribe(res => {
      this.cores = res.data.results;
    }, res => {
      this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  private getCombustiveis(): void {
    this.combustivelServive.getAll().subscribe(res => {
      this.combustiveis = res.data.results;
    }, res => {
      this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  carregarUFs(): void {
    this.consultaCEPService.getAllUF().subscribe(res => {
      this.ufs = res.data;
    }, res => {
      this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  carregarCidades(): void {
    const cidade = this.form.get('cidade');

    cidade.valueChanges.pipe(
      tap(() => cidade.value),
      debounceTime(300),
      startWith(''),
    ).subscribe(value => {
      if (!value || (typeof value === 'string' && value.length < 3)) {
        this.cidades.filteredData = [];
        return;
      }

      if (typeof cidade.value === 'string') {
        const selectedUf = this.form.get('uf').value;
        this.consultaCEPService.getAllMunicipio({ uf: selectedUf, cidade: value }).subscribe(res => {
          if (res.data.length === 0) {
            this.snackBar.open(this.translate.instant('PORTAL.MSG_CIDADE_NOT_FOUND'), 3500, 'X');
          }

          this.cidades.filteredData = res.data;
        }, err => {
          this.snackBar.error(err.error.message || this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
        });
      }
    });
  }

  carregarVeiculosSubstituidos(): void {
    const clienteId = [this.form.get('cliente').value.clienteId];

    this.veiculoService.getFrotas({ clientesId: clienteId }).subscribe(res => {
      this.veiculosSubstituidos.data = res.data.results;
      this.veiculosSubstituidos.filteredData = this.veiculosSubstituidos.data;
    }, err => {
      this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  menuAcessorios(isClosing: boolean, idxCard: number): void {
    if (!isClosing) {
      this.veiculoService.getEquipamentos().subscribe(res => {
        this.acessoriosModelo = res.data.results.map(value => {
          if (this.cardVeiculos[idxCard].acessorios && this.cardVeiculos[idxCard].acessorios.length > 0) {
            value['checked'] = !!find(this.cardVeiculos[idxCard].acessorios, ['equipamentoId', value.equipamentoId]);
          } else {
            value['checked'] = false;
          }

          return value;
        });
      }, res => {
        this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
      });
    } else {
      this.cardVeiculos[idxCard].acessorios = filter(this.acessoriosModelo, ['checked', true]);
      this.acessoriosModelo = [];
    }
  }

  formataDocumento(str: string): string {
    if (!str) {
      return '';
    }
    return Util.formataDocumento(str);
  }

  onCheck(event: MatCheckboxChange, index: number): void {
    this.acessoriosModelo[index].checked = event.checked;
  }

  closeMenu(): void {
    if (this.acessorios.menuOpened) {
      this.acessorios.closeMenu();
    }
  }

  reprovarCancelarSolicitacao(situacao: string): void {
    this.observacoes.setValidators([Validators.required]);
    this.observacoes.updateValueAndValidity();

    if (!this.observacoes.valid) {
      this.snackBar.open(this.translate.instant('PORTAL.MSG_CAMPO_OBRIGATORIO'), 3500, 'X');
      this.observacoes.markAsTouched({ onlySelf: true });
      this.observacaoField.nativeElement.focus();
      return;
    }

    const body = {
      situacao: situacao ? situacao : 'C',
      observacao: this.observacoes.value,
      usuarioId: this.userContext.getUsuarioId()
    };
    this.patchSolicitacao(this.codigoEdicao, body, situacao === 'R' ? 'REPROVAR' : 'CANCELAR');
  }

  voltar(): void {
    this.router.navigate(['gerenciador-frota/acompanhar-solicitacao']);
  }

  getEmailsBodies(solicitacaoId, acao): Array<any> {

    const bodies = [];

    this.getEmailParams(solicitacaoId).forEach(params => {

      switch (acao) {
        case 'GRAVAR':
          if (!this.hasPerfilClaro()) {
            bodies.push({
              body: EmailStructureComponent.emailSolicitacaoSubstituicaoAprovada(params),
              destinatarios: (this.form.get('cliente').value.emailsRelacionamento || '').replace(' ', '')
            });
          } else {
            bodies.push({
              body: EmailStructureComponent.emailSolicitacaoSubstituicaoRecebida(params),
              destinatarios: this.form.get('emailResponsavel').value
            });
          }
          break;
        case 'APROVAR':
          bodies.push({
            body: EmailStructureComponent.emailSolicitacaoSubstituicaoAprovada(params),
            destinatarios: this.form.get('emailResponsavel').value
          });
          break;
        case 'REPROVAR':
          bodies.push({
            body: EmailStructureComponent.emailSolicitacaoSubstituicaoReprovada(params),
            destinatarios: this.form.get('emailSolicitante').value
          });
          break;
        case 'CANCELAR':
          bodies.push({
            body: EmailStructureComponent.emailSolicitacaoSubstituicaoCancelada(params),
            destinatarios: this.form.get('emailSolicitante').value
          });
          break;
      }
    });

    return bodies;
  }

  enviarEmail(solicitacaoId: number, acao: string) {
    this.getEmailsBodies(solicitacaoId, acao).forEach(email => {

      email.from = 'noreply@unidas.com.br';

      email.to = [];
      email.to.push('thiago.bhzt@gmail.com');
      if (email.destinatarios) {
        email.destinatarios.split(';').forEach(destinatario => {
          email.to.push(destinatario);
        });
      }

      email.subject = email.body.subject;
      email.html = email.body.html;

      if (this.form.get('emailResponsavel').value) {
        this.emailService.postEmail(email).subscribe(res => { }, res => {
          this.snackBar.error(res.error.message || this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500);
        });
      }
    });
  }

  getEmailParams(solicitacaoId: number): Array<any> {

    const _this = this;
    const params = [];

    if (_this.cardVeiculos.length > 0) {
      _this.cardVeiculos.forEach(veiculo => {
        const quantidadeVeiculoSolicitado = veiculo.quantidadeVeiculoSolicitado;
        const cor = _this.cores.find(item => +item.id === +veiculo.codigoCor).descricao;
        const combustivel = _this.combustiveis.find(item => +item.id === +veiculo.codigoCombustivel).descricao;
        const opcionais = veiculo.acessorios && veiculo.acessorios.length > 0 ? veiculo.acessorios.map(item => item.descricao) : null;

        const motivoSolicitacao = _this.form.get('motivoSolicitacao').value;
        const veiculoSubstituido = _this.form.get('veiculoSubstituido').value;

        const param = {
          solicitante: _this.form.get('solicitante').value,
          cliente: _this.form.get('cliente').value.nomeFantasia,
          clienteId: _this.form.get('cliente').value.clienteId,
          cidade: _this.form.get('cidade').value.municipio,
          cidadeEntrega: _this.form.get('cidade').value.municipio,
          quantidade: quantidadeVeiculoSolicitado,
          placa: veiculoSubstituido ? veiculoSubstituido.placa : null,
          modelo: veiculoSubstituido ? veiculoSubstituido.modelo : null,
          motivoSolicitacao: motivoSolicitacao ? motivoSolicitacao.description : null,
          grupoCliente: _this.form.get('grupoCliente').value,
        };

        param['motivoReprovacao'] = _this.observacoes.value;
        param['solicitacaoId'] = solicitacaoId;
        param['combustivel'] = combustivel;
        param['opcionais'] = opcionais;
        param['cor'] = cor;

        params.push(param);
      });
    }

    return params;
  }

  private patchSolicitacao(id: number, body: any, acao: string): void {
    this.veiculoSolicitacaoSubstituicaoService.patch(id, body).subscribe(res => {
      this.enviarEmail(id, acao);
      this.snackBar.success(this.translate.instant('PORTAL.SOLICITACAO_VEICULO.MESSAGES.SUCESSO_ENVIO'), 3500, 'X');
      this.voltar();
    }, res => {
      this.snackBar.error(res.error.message || this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500);
    });
  }

  aprovar(): void {
    this.observacoes.setValidators(null);
    this.observacoes.markAsUntouched();

    const body = {
      situacao: 'A',
      observacao: this.observacoes.value,
      usuarioId: this.userContext.getUsuarioId()
    };

    this.patchSolicitacao(this.codigoEdicao, body, 'APROVAR');
  }

  deleteCard(index: number): void {
    this.cardVeiculos.splice(index, 1);
  }

  adicionarCardModelo(): void {
    if (this.cardVeiculos.length === 2 || !this.isValidCard()) {
      this.snackBar.open(this.translate.instant('PORTAL.MSG_CAMPO_OBRIGATORIO'), 3500, 'X');
      return;
    }
    this.cardVeiculos.push({});
  }

  changeMotivo(): void {
    if (Util.getFormValue(this.form, 'motivoSolicitacao') === 'S') {
      Util.enableFieldForm(this.form, ['veiculoSubstituido', 'motivoSubstituicao']);
      Util.habilitarValidacoes(this.form, ['veiculoSubstituido', 'motivoSubstituicao']);

      this.carregarVeiculosSubstituidos();

      if (this.cardVeiculos.length > 1) {
        this.cardVeiculos.pop();
      }
    } else {
      if (this.form.get('veiculoSubstituido').value || this.form.get('motivoSubstituicao').value) {
        this.form.get('veiculoSubstituido').setValue(null);
        this.form.get('motivoSubstituicao').setValue(null);

        this.veiculosSubstituidos.data = [];
        this.veiculosSubstituidos.filteredData = [];
      }

      Util.disableFieldForm(this.form, ['veiculoSubstituido', 'motivoSubstituicao']);
      Util.desabilitarValidacoes(this.form, ['veiculoSubstituido', 'motivoSubstituicao']);
    }
  }

  changeModelo(event: any, veiculo: VeiculoModeloMV) {
    if (this.hasPerfilClaro()) {
      const modelo = this.modelos.find(item => +item.id === +event.value);
      veiculo.valorLocacao = modelo ? modelo.valorLocacao : 0;
    }
  }

  exibirAprovarReprovar(): boolean {
    return this.isEdition && (this.hasPerfilClaro() && this.isGestor() && this.canUpdate());
  }

  hasPerfilClaro(): boolean {
    // tslint:disable-next-line: max-line-length

    return this.userContext.getDados().grupoEconomico.nome === 'CLARO' ||
      this.userContext.getDados().grupoEconomico.nome.includes('CLARO');
  }

  isGestor(): boolean {
    return this.userContext.getPerfil() === 'GESTOR';
  }

  canUpdate(): boolean {
    if (this.isEdition) {
      return this.situacaoSolicitacao.toLowerCase() === 'aguardando aprovação';
    }

    return true;
  }

  displayCia(cia: any): string {
    if (cia) {
      return cia['descricao'];
    }
  }

  salvar(): void {
    if (!this.form.valid || !this.observacoes.valid) {
      this.snackBar.open(this.translate.instant('PORTAL.MSG_CAMPO_OBRIGATORIO'), 3500, 'X');
      return;
    }

    if (typeof this.form.get('cidade').value === 'string') {
      window.scrollTo(0, 0);
      this.cidadeAutoField.nativeElement.focus();
      this.snackBar.open(this.translate.instant('PORTAL.MSG_CAMPO_OBRIGATORIO'), 3500, 'X');
      return;
    }

    if (!this.codigoEdicao) {
      this.veiculoSolicitacaoSubstituicaoService.post(this.montarObjetoSubmit()).subscribe(res => {
        this.enviarEmail(Number(res.data.insertId), 'GRAVAR');
        this.snackBar.success(this.translate.instant('PORTAL.SOLICITACAO_VEICULO.MESSAGES.SUCESSO_ENVIO'), 3500, 'X');
        this.voltar();
      }, res => {
        if (res.error.message.error === 'QUANTIDADE_MODELOS_MOTIVO_SUBSTITUICAO') {
          this.snackBar.open(this.translate.instant('PORTAL.MSG_QUANTIDADE_MODELOS_MOTIVO_SUBSTITUICAO'), 3500, 'X');
          return;
        }
        this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
      });
    } else {
      this.veiculoSolicitacaoSubstituicaoService.put(this.codigoEdicao, this.montarObjetoSubmit()).subscribe(res => {
        this.snackBar.success(this.translate.instant('PORTAL.SOLICITACAO_VEICULO.MESSAGES.SUCESSO_ENVIO'), 3500, 'X');
      }, res => {
        this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
      });
    }
  }

  montarObjetoSubmit(): any {
    const obj = {};
    obj['codigoUsuario'] = Number(this.userContext.getID()) || null;
    obj['codigoCliente'] = Number(this.form.get('cliente').value.clienteId) || null;
    obj['emailResponsavelSolicitacao'] = this.form.get('emailResponsavel').value || null;
    obj['codigoMunicipioEntregaVeiculo'] = this.form.get('cidade').value.id || null;
    obj['solicitante'] = this.form.get('solicitante').value || null;
    obj['emailUsuarioSolicitante'] = this.form.get('emailSolicitante').value || null;
    obj['motivoSolicitacao'] = this.form.get('motivoSolicitacao').value || null;
    if (this.form.get('veiculoSubstituido').value) {
      obj['veiculoId'] = Number(this.form.get('veiculoSubstituido').value.veiculoId) || null;
    }
    obj['motivoSubstituicao'] = this.form.get('motivoSubstituicao').value || null;
    obj['codigoGrupoCliente'] = this.form.get('grupoCliente').value || null;
    obj['observacao'] = this.observacoes.value || null;

    const cia = this.form.get('cia').value;
    obj['codigoCIA'] = typeof cia !== 'string' ? cia.id : null;

    this.montarObjetosVeiculos(obj);

    return obj;
  }

  montarObjetosVeiculos(obj: any) {
    const veiculosSolicitacaoSubstituicao = [];
    const codigosEquipamentos = [];

    let id = 0;
    this.cardVeiculos.forEach(card => {
      const veiculo = { id: id += 1 };

      Object.keys(card).forEach(key => {
        if (key.includes('quantidade') || key.includes('finalPlaca')) {
          veiculo[key] = Number(card[key]);
        } else if (key !== 'acessorios') {
          veiculo[key] = card[key];
        } else {
          const equipamentos = card[key];
          equipamentos.forEach(eqp => {
            const equipamento = {
              codigoVeiculosSolicitacaoSubstituicao: veiculo.id,
              codigoEquipamento: eqp['equipamentoId']
            };
            codigosEquipamentos.push(equipamento);
          });
        }
      });
      veiculosSolicitacaoSubstituicao.push(veiculo);
    });

    obj['veiculosSolicitacaoSubstituicao'] = veiculosSolicitacaoSubstituicao;
    obj['codigosEquipamentos'] = codigosEquipamentos;
  }

  private getModelos(clienteId: number): void {
    const filtros = {
      clienteId: clienteId
    };

    this.modeloService.getAll(filtros).subscribe(res => {
      this.modelos = res.data.results;
    }, res => {
      this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  private isValidCard(): boolean {
    const requiredInput = ['modelo', 'cor', 'combustivel', 'quantidade'];
    if (this.hasPerfilClaro()) {
      requiredInput.push('valorLocacao');
    }

    const inputs = [];

    if (this.cardVeiculos.length === 1) {
      this.cardVeiculos.forEach(card => {
        Object.keys(card).forEach(key => {
          if (!card[key]) {
            inputs.push(key);
          }
        });
      });

      if (inputs.includes(requiredInput)) {
        return false;
      }
    }

    return true;
  }

  enableCidade(): void {
    const cidade = this.form.get('cidade');
    this.cidades.filteredData = [];
    cidade.reset();
    cidade.enable();
  }

  displayCidade(cidade: any) {
    if (cidade) {
      return cidade['municipio'];
    }
  }

  enableMotivoSolicitacao(motivoSolicitacaoId?: string): void {
    const field = this.form.get('motivoSolicitacao');
    field.enable();

    if (motivoSolicitacaoId === 'S' || field.value === 'S') {
      this.carregarVeiculosSubstituidos();
    }

    if (motivoSolicitacaoId) {
      const motivo = this.motivoSolicitacao.find(item => item.id === motivoSolicitacaoId);
      field.setValue(motivo.id);
    }

    this.getModelos(this.form.get('cliente').value.clienteId);
  }

  displayVeiculo(veiculo: any) {
    if (veiculo) {
      return veiculo['placa'];
    }
  }

  filtrarPlaca() {
    let placa = this.form.get('veiculoSubstituido').value;
    placa = placa.placa || placa;

    if (placa) {
      placa = placa.toUpperCase();
      this.veiculosSubstituidos.filteredData = this.veiculosSubstituidos.data.filter(item => item.placa.includes(placa));
    } else {
      this.veiculosSubstituidos.filteredData = this.veiculosSubstituidos.data;
    }
  }

}
