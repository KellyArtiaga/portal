import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { AfterContentChecked, AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { ArquivoService } from 'src/app/core/services/arquivos.service';
import { AtendimentoStorageService } from 'src/app/core/services/atendimento-storage.service';
import { AtendimentoClienteService } from 'src/app/core/services/atendimentos-clientes.service';
import { ConsultaCepService } from 'src/app/core/services/consulta-cep.service';
import { SinistroService } from 'src/app/core/services/sinistro.service';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';
import { UserContextService } from 'src/app/core/services/user-context.service';
import { VeiculoService } from 'src/app/core/services/veiculos.service';
import { ColunasTabelaMV } from 'src/app/shared/interfaces/colunas-tabela.model';
import { Util } from 'src/app/shared/util/utils';

@Component({
  selector: 'app-manutencao-aba-um',
  templateUrl: './manutencao-aba-um.component.html',
  styleUrls: ['./manutencao-aba-um.component.scss']
})
export class ManutencaoAbaUmComponent implements OnInit, AfterViewInit, AfterContentChecked {

  @ViewChild('sinistrosAnterioresTable') sinistrosAnterioresTable: ElementRef;
  @ViewChild('preventivaField') preventivaField: ElementRef;
  @ViewChild('corretivaField') corretivaField: ElementRef;
  @ViewChild('sinistroField') sinistroField: ElementRef;
  @ViewChild('acessorioField') acessorioField: ElementRef;
  @ViewChild('execucaoField') execucaoField: ElementRef;
  @ViewChild('fileInput') fileInput: ElementRef;

  form: FormGroup;
  formArquivos: FormGroup;
  abaZeroForm: any;

  isEdicao: boolean;
  atendimentoId: number;
  alreadyChecked: boolean;
  isGoBackToAdministrarAtendimento: boolean;

  // Menu responsivo
  items = [
    {
      name: 'Preventiva',
      icon: 'pfu-preventiva',
      tag: 'preventiva',
      condition: 'preventiva'
    },
    {
      name: 'Corretiva',
      icon: 'pfu-corretiva',
      tag: 'corretiva',
      condition: 'corretiva',
      children: [
        {
          name: 'Acessórios',
          icon: 'pfu-acessorios',
          tag: 'acessorio',
          condition: 'acessorio'
        }
      ]
    },
    {
      name: 'Sinistro',
      icon: 'pfu-sinistro',
      tag: 'sinistro',
      condition: 'sinistro',
      children: [
        {
          name: 'Execuçao',
          icon: 'pfu-sinistro',
          tag: 'execucao',
          condition: 'execucao',
        }
      ]
    }
  ];

  // Combos
  preventivas = [] as Array<any>;
  corretivas = [] as Array<any>;
  acessorios = [] as Array<any>;
  sinistros = [] as Array<any>;
  execucoes = [{ id: 1, descricaoQuestionario: 'Registro de sinistro sem agendamento de parada', selected: false },
  { id: 2, descricaoQuestionario: 'Realizar a manutenção de um sinistro registrado anteriormente', selected: false }] as Array<any>;
  tiposSinistro = [] as Array<any>;

  // Validações
  itensConsiderarRaio = [] as Array<any>;
  itensSocorroMecanico = [] as Array<any>;
  itensComFornecedorOuCRLV = [] as Array<any>;

  itensConsiderarRaioPreventiva = [] as Array<any>;
  itensSocorroMecanicoPreventiva = [] as Array<any>;
  itensComFornecedorOuCRLVPreventiva = [] as Array<any>;

  itensConsiderarRaioCorretiva = [] as Array<any>;
  itensSocorroMecanicoCorretiva = [] as Array<any>;
  itensComFornecedorOuCRLVCorretiva = [] as Array<any>;

  itensConsiderarRaioSinistro = [] as Array<any>;
  itensSocorroMecanicoSinistro = [] as Array<any>;
  itensComFornecedorOuCRLVSinistro = [] as Array<any>;

  isAcessorio: boolean;
  isRevisao: boolean;
  isSinistro: boolean;
  isOutrosServicos: boolean;
  isCorretivaComPneu: boolean;
  isSegundaVia: boolean;
  isRecallFabrica: boolean;
  isAutoServico: boolean;
  isConcessionaria: boolean;
  isGarantia: boolean;
  isGarantiaUltimoServicoExecutadoCorretiva: boolean;
  isGarantiaUltimoServicoExecutadoSinistro: boolean;
  isRouboFurtoOuVeiculoApreendido: boolean;
  isComplementoServicosObrigatorio: boolean;

  showExecucao: boolean;
  comDocumentacaoSinistro: boolean;
  comDocumentacaoSinistroAnterior: boolean;

  // Upload de documentos
  tipoArquivos: any[] = Util.getTipoArquivos();
  arquivosParaExcluir = [] as Array<string>;
  descricaoArquivo = new FormControl();
  docUpload = [] as Array<any>;
  currentDoc: any;
  totalDocs = 0;

  ultimaExecucao: any;

  combosServicosExibidos = [] as Array<string>;
  sinistrosSemAgendamentoParada = [] as Array<any>;

  numPage = 1;
  numRows = 20;
  totalRows: number;

  // Responsividade
  show = '';
  small: boolean;
  aba: HTMLElement;
  showCard: string;
  isActive: boolean;

  now = new Date().toISOString();

  constructor(
    private formBuilder: FormBuilder,
    private snackBar: SnackBarService,
    private translate: TranslateService,
    private atendimentoClienteService: AtendimentoClienteService,
    private veiculoService: VeiculoService,
    private consultaCepService: ConsultaCepService,
    private userContextService: UserContextService,
    private sinistroService: SinistroService,
    private activatedRoute: ActivatedRoute,
    private arquivoService: ArquivoService,
    public breakpointObserver: BreakpointObserver,
    private sanitizer: DomSanitizer

  ) { }

  ngOnInit() {
    this.isGoBackToAdministrarAtendimento = this.activatedRoute.queryParams['value'].goBackTo === 'administrar-atendimento';

    this.createForm();

    this.breakpointObserver
      .observe(['(min-width: 768px)'])
      .subscribe((state: BreakpointState) => {
        if (state.matches) {
          this.small = false;
          this.isActive = true;
        } else {
          this.small = true;
          this.toggleDisplay('preventiva');
          this.isActive = false;
          this.show = 'preventiva';
        }
      });
  }

  toggleDisplay(aba: any) {
    this.show = aba ? aba.tag : '';
  }

  ngAfterViewInit(): void {
    const _this = this;

    _this.activatedRoute.queryParams.subscribe(params => {
      _this.combosServicosExibidos = params['tpsAt'] ? params['tpsAt'].split('-') : [];

      if (params['atendimentoId'] && (params['tpsAt'] !== 's' || this.isGoBackToAdministrarAtendimento)) {
        _this.atendimentoId = +params['atendimentoId'];
      } else {
        _this.atendimentoId = null;
      }

      if (!_this.combosServicosExibidos.includes('s')) {
        this.comDocumentacaoSinistro = false;
      }
    });
  }

  ngAfterContentChecked(): void {
    if (AtendimentoStorageService.abaZeroForm
      && AtendimentoStorageService.abaZeroForm.value
      && AtendimentoStorageService.abaSelecionada === 1) {
      this.abaZeroForm = AtendimentoStorageService.abaZeroForm.value;

      if (AtendimentoStorageService.resetarAbaUm) {
        this.resetPage();
      }

      if (!this.alreadyChecked) {
        this.preencherCombos();
      }

      if (!this.alreadyChecked && this.atendimentoId) {
        this.verificarSeEConcessionaria();
        this.carregarAtendimentoEdicao(this.atendimentoId);
      } else {
        this.alreadyChecked = true;
      }

      if (!this.comDocumentacaoSinistro) {
        this.resetaCamposDocumentacaoSinistro();
      }
    }
  }

  createForm() {
    this.form = this.formBuilder.group({
      'preventiva': ['', Validators.compose([])],
      'corretiva': ['', Validators.compose([])],
      'sinistro': ['', Validators.compose([])],
      'acessorio': ['', Validators.compose([])],
      'execucao': ['', Validators.compose([])],
      'complementoServicos': ['', Validators.compose([])],

      'logradouroSinistro': ['', Validators.compose([])],
      'cepSinistro': ['', Validators.compose([])],
      'bairroSinistro': ['', Validators.compose([])],
      'ufSinistro': ['', Validators.compose([])],
      'cidadeSinistro': ['', Validators.compose([])],
      'municipioSinistroId': ['', Validators.compose([])],
      'nomeTerceiro': ['', Validators.compose([])],
      'celularTerceiro': ['', Validators.compose([])],
      'relatoOcorrido': ['', Validators.compose([])],

      'tipoSinistro': ['', Validators.compose([])],
      'dataSinistro': ['', Validators.compose([])],
      'horaSinistro': ['', Validators.compose([])],
      'timestampSinistro': ['', Validators.compose([])],
      'numeroBoletimOcorrencia': ['', Validators.compose([])],
      'hasVitima': ['', Validators.compose([])],
      'hasVitimaFatal': ['', Validators.compose([])],
      'hasEnvolvimentoTerceiros': ['', Validators.compose([])],

      'isIgnorarRaio': ['', Validators.compose([])],
      'isSemFornecedorOuCRLV': ['', Validators.compose([])],
      'isSegundaVia': ['', Validators.compose([])],
      'isRecallFabrica': ['', Validators.compose([])],
      'isAutoServico': ['', Validators.compose([])],
      'isConcessionaria': ['', Validators.compose([])],
      'isOutrosServicos': ['', Validators.compose([])],
      'isGarantia': ['', Validators.compose([])],
      'isGarantiaUltimoServicoExecutado': ['', Validators.compose([])],
      'isSinistro': ['', Validators.compose([])],
      'isRevisao': ['', Validators.compose([])],
      'isCorretivaComPneu': ['', Validators.compose([])],
      'isSocorroMecanico': ['', Validators.compose([])],
      'isRouboFurtoOuVeiculoApreendido': ['', Validators.compose([])],

      'checklistServicos': ['', Validators.compose([])],
      'descricaoOcorridoGeral': ['', Validators.compose([])],

      'arquivosParaExcluir': ['', Validators.compose([])],

      'isPreventivaEdicao': ['', Validators.compose([])],
      'isCorretivaEdicao': ['', Validators.compose([])],
      'isSinistroEdicao': ['', Validators.compose([])],

      'sinistroAnteriorVinculado': ['', Validators.compose([])],
      'semAgendamentoParada': ['', Validators.compose([])],

      'sinistroAnteriorId': ['', Validators.compose([])],

      'atendimentoLoja': ['', Validators.compose([])],
      'siglaLojaUnidas': ['', Validators.compose([])],

      'tipoManutencao': ['', Validators.compose([])]
    });

    this.formArquivos = new FormGroup({
      tipoArquivo: new FormControl('')
    });

    this.preencherCombos();
  }

  carregarAtendimentoEdicao(atendimentoId?: number) {
    const atendimento = AtendimentoStorageService.atendimento;

    if (atendimento) {
      this.preencherTelaEdicao();
    } else if (atendimentoId) {
      this.atendimentoClienteService.get(atendimentoId).subscribe(res => {
        AtendimentoStorageService.atendimento = res.data;
        this.preencherTelaEdicao();
      }, err => {
        this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
      });
    }
  }

  private preencherTelaEdicao() {
    const atendimento = AtendimentoStorageService.atendimento;

    this.isEdicao = true;
    this.alreadyChecked = true;
    this.form.get('isPreventivaEdicao').setValue(atendimento.preventiva);
    this.form.get('isCorretivaEdicao').setValue(atendimento.corretiva);
    this.form.get('isSinistroEdicao').setValue(atendimento.sinistro);
    this.form.get('sinistroAnteriorVinculado').setValue(atendimento.sinistroAnteriorVinculado);
    this.form.get('atendimentoLoja').setValue(atendimento.atendimentoLoja);
    this.disableAndCheckServicosDuranteEdicao('PREVENTIVA', atendimento);
    this.disableAndCheckServicosDuranteEdicao('CORRETIVA', atendimento);
    this.disableAndCheckServicosDuranteEdicao('SINISTRO', atendimento);
    this.disableAndCheckServicosExecucao(atendimento);
    this.form.get('complementoServicos').setValue(atendimento.complementoServicos);
  }

  private disableAndCheckServicosExecucao(atendimento: any) {
    this.execucaoField['options']._results.forEach(option => {
      let id = 0;
      if (option.value.id === 1 && atendimento.semAgendamentoParada) {
        id = option.value.id;
        option.selected = true;
        option.value.selected = true;
      }
      if (option.value.id === 2 && atendimento.sinistroAnteriorVinculado) {
        id = option.value.id;
        option.selected = true;
        option.value.selected = true;
      }
      if (id !== 0) {
        this.changeExecucao({
          option: {
            value: {
              id: id
            }
          }
        });
      }
      option.value.disabled = true;
    });
  }

  adicionarArquivoEdicao(file: any, blob: Blob, tipoArquivo: string): void {

    const input = new FormData();
    const tipoDocumento = this.tipoArquivos
      .find(item => String(item.descricao.replace(/\s/g, '_')).toLowerCase() === file.tipo.toLowerCase());

    input.append('file', blob, file.descricao);

    const doc = {
      id: file.id,
      file: blob,
      descricao: file.descricao,
      fileFormData: input,
      dadosAPICliente: {
        atendimentoId: 0,
        descricaoArquivo: file.descricao,
        tipoDocumento: tipoDocumento,
        usuarioId: Number(this.userContextService.getID())
      },
      tipoArquivo: tipoArquivo
    };

    AtendimentoStorageService.setArquivos(doc);

    this.totalDocs++;
  }

  private resetaCamposDocumentacaoSinistro() {
    this.form.get('logradouroSinistro').reset();
    this.form.get('cepSinistro').reset();
    this.form.get('bairroSinistro').reset();
    this.form.get('ufSinistro').reset();
    this.form.get('cidadeSinistro').reset();
    this.form.get('municipioSinistroId').reset();
    this.form.get('tipoSinistro').reset();
    this.form.get('dataSinistro').reset();
    this.form.get('horaSinistro').reset();
    this.form.get('isSinistro').reset();
    this.form.get('nomeTerceiro').reset();
    this.form.get('celularTerceiro').reset();
    this.form.get('relatoOcorrido').reset();
    this.form.get('numeroBoletimOcorrencia').reset();
    this.form.get('hasVitima').reset();
    this.form.get('hasVitimaFatal').reset();
    this.totalDocs = 0;
    AtendimentoStorageService.removeAllArquivos();
  }

  resetPage() {
    this.isAcessorio = false;
    this.isRevisao = false;
    this.isSinistro = false;
    this.isOutrosServicos = false;
    this.isCorretivaComPneu = false;
    this.isSegundaVia = false;
    this.isRecallFabrica = false;
    this.isAutoServico = false;
    this.isConcessionaria = false;
    this.isGarantia = false;
    this.comDocumentacaoSinistro = false;
    this.form.reset();
    this.form.markAsPristine();
    this.formArquivos.reset();
    this.acessorios = [];
    this.atendimentoId = this.activatedRoute.queryParams['value'].atendimentoId;
    this.alreadyChecked = false;
    this.now = new Date().toISOString();
    AtendimentoStorageService.resetarAbaUm = false;
    AtendimentoStorageService.resetarAbaDois = true;
    AtendimentoStorageService.removeAllArquivos();

    this.preencherCombos();

    this.verificarSeEConcessionaria();
  }

  private verificarSeEConcessionaria() {
    if (AtendimentoStorageService.abaZeroForm.value.veiculo.veiculoId) {
      this.veiculoService.get(AtendimentoStorageService.abaZeroForm.value.veiculo.veiculoId).subscribe(res => {
        this.isAutoServico = res.data.autoServico;
        this.isConcessionaria = res.data.planoManutencao === 'C';
      }, err => {
        this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
      });
    }
  }

  preencherCombos() {
    this.atendimentoClienteService.getQuestionario('PREVENTIVA').subscribe(
      res => {
        this.preventivas = res.data.results;
      }, err => {
        this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
      });

    this.atendimentoClienteService.getQuestionario('CORRETIVA').subscribe(
      res => {
        this.corretivas = res.data.results;
      }, err => {
        this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
      });

    this.atendimentoClienteService.getQuestionario('SINISTRO').subscribe(
      res => {
        this.sinistros = res.data.results;
      }, err => {
        this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
      });

    this.sinistroService.getTipos().subscribe(
      res => {
        res.data.results.forEach(item => {
          if (!item.desativado) {
            this.tiposSinistro.push(item);
          }
        });
      }, err => {
        this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
      });

    this.resetarListaExecucao();
  }

  disableAndCheckServicosDuranteEdicao(fieldName: string, atendimento: any) {
    if (!this[`${fieldName.toLowerCase()}Field`]) {
      return;
    }

    this.atendimentoClienteService.getQuestionario(fieldName, { atendimentoId: atendimento.atendimentoId }).subscribe(
      res => {
        const itens = res.data.results;

        this[`${fieldName.toLowerCase()}Field`]['options']._results.forEach(option => {
          if (itens.find(item => item.questionarioAtendimentoId === option.value.questionarioAtendimentoId)) {
            option.selected = true;
            option.value.selected = true;
            option.value.disabled = true;
          }
        });

        const method = fieldName.substr(0, 1).toUpperCase() + fieldName.substr(1, fieldName.length).toLowerCase();
        this[`change${method}`]();

        if (fieldName === 'CORRETIVA') {
          this.isAcessorio = itens.find(item => ['Acessórios (Implementos)'].includes(item.descricaoQuestionario));
          this.veiculoService.getEquipamentos({ veiculoId: atendimento.veiculoId }).subscribe(
            res1 => {
              if (this.isAcessorio) {
                this.acessorioField['options']._results.forEach(option => {
                  if (res.data.results.find(item => item.equipamentoId === option.value.equipamentoId)) {
                    option.value.selected = true;
                    option.value.disabled = true;
                  }
                });
              }
            }, err1 => {
              this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
            });
        }

        if (fieldName === 'SINISTRO') {

          if (this.isGoBackToAdministrarAtendimento) {
            this[`${fieldName.toLowerCase()}Field`]['options']._results.forEach(option => {
              option.value.disabled = true;
            });
          }

          this.preencherSinistroEdicao(atendimento.atendimentoId, 'EDICAO');
        }
      }, err => {
        this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
      });
  }

  preencherSinistroEdicao(atendimentoId: number, tipoArquivo: string) {
    const _this = this;

    _this.atendimentoClienteService.getSinistro(atendimentoId).subscribe(res => {
      let sinistro = res.data.results;
      if (sinistro && sinistro[0]) {
        sinistro = sinistro[0];

        setTimeout(() => {
          _this.form.get('cepSinistro').setValue(sinistro.cepSinistro);
          _this.form.get('bairroSinistro').setValue(sinistro.bairroSinistro);
          _this.form.get('ufSinistro').setValue(sinistro.estadoSinistro);
          _this.form.get('logradouroSinistro').setValue(sinistro.logradouroSinistro);
          _this.form.get('cidadeSinistro').setValue(sinistro.cidadeSinistro);
          _this.form.get('municipioSinistroId').setValue(sinistro.municipioSinistroId);

          _this.form.get('hasVitima').setValue(sinistro.existeVitima);
          _this.form.get('hasVitimaFatal').setValue(sinistro.existeVitimaFatal);
          _this.form.get('hasEnvolvimentoTerceiros').setValue(sinistro.existeTerceiro);

          _this.form.get('relatoOcorrido').setValue(sinistro.descricaoOcorridoSinistro);
          _this.form.get('nomeTerceiro').setValue(sinistro.nomeTerceiro);
          _this.form.get('celularTerceiro').setValue(sinistro.telefoneTerceiro);

          _this.form.get('dataSinistro').setValue(sinistro.dataSinistro ? new Date(sinistro.dataSinistro) : null);
          let horaSinistro = sinistro.horaSinistro;
          horaSinistro = horaSinistro ? horaSinistro.substring(horaSinistro.indexOf('T') + 1, horaSinistro.lastIndexOf(':')) : null;
          horaSinistro = horaSinistro.replace(':', '');
          _this.form.get('horaSinistro').setValue(horaSinistro);
          _this.form.get('timestampSinistro').setValue(sinistro.dataSinistro ? new Date(sinistro.dataSinistro) : null);

          const tipoSinistro = _this.form.get('tipoSinistro');
          if (tipoSinistro) {
            tipoSinistro.setValue(_this.tiposSinistro.filter(
              item => item.descricao.toLowerCase() === sinistro.motivoSinistro.toLowerCase())[0].tipoId);
          }

          _this.form.get('numeroBoletimOcorrencia').setValue(sinistro.boletimOcorrenciaSinistro);

          _this.form.get('semAgendamentoParada').setValue(sinistro.semAgendamentoParada);
          AtendimentoStorageService.atendimento.semAgendamentoParada = sinistro.semAgendamentoParada;

          _this.carregarArquivosSinistroEdicao(atendimentoId, tipoArquivo);
        });
      }
    }, err => {
      _this.snackBar.error(_this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  private carregarArquivosSinistroEdicao(atendimentoId: number, tipoArquivo: string) {
    const _this = this;
    const url = this.arquivoService.recuperarArquivo();

    _this.arquivoService.getAll('ATENDIMENTO', atendimentoId).subscribe(response => {
      if (response.error) {
        _this.snackBar.error(_this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
        return;
      }

      if (response.data) {
        response.data.forEach(element => {
          _this.sanitizer.bypassSecurityTrustResourceUrl(`${url}${element.href}`);
          _this.arquivoService.getFromURL(`${url}${element.href}`).subscribe(blob => {
            _this.adicionarArquivoEdicao(element, blob, tipoArquivo);
          }, err => {
            console.log(err);
          });
        });
      }
    }, error => {
      _this.snackBar.error(_this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  validarForm() {
    const preventiva = this.form.get('preventiva');
    const corretiva = this.form.get('corretiva');
    const sinistro = this.form.get('sinistro');

    if (!this.isSemAgendamentoParada() && (!preventiva.value || preventiva.value.length === 0)
      && (!corretiva.value || corretiva.value.length === 0)
      && (!sinistro.value || sinistro.value.length === 0)) {

      preventiva.setErrors({ 'incorrect': true });
      corretiva.setErrors({ 'incorrect': true });
      sinistro.setErrors({ 'incorrect': true });
      this.snackBar.open(this.translate.instant('PORTAL.MANUTENCAO.MESSAGE.SERVICO_OBRIGATORIO'), 7000, 'X');

      return false;
    } else {
      preventiva.setErrors(null);
      corretiva.setErrors(null);
      sinistro.setErrors(null);
    }

    if (!this.form.valid) {
      this.snackBar.open(this.translate.instant('PORTAL.MSG_CAMPO_OBRIGATORIO'), 3500, 'X');
      Util.validateAllFormFields(this.form);
      // Anexos não são mais obrigatórios em nenhuma situação
      return false;
    }

    if (this.form.get('sinistroAnteriorVinculado').value && !this.form.get('sinistroAnteriorId').value) {
      this.snackBar.open(this.translate.instant('PORTAL.MANUTENCAO.MESSAGE.SINISTRO_ANTERIOR_OBRIGATORIO'), 7000, 'X');
      return false;
    }

    this.fillForm();

    return true;
  }

  fillForm() {
    // Preenche o checklist de serviços
    const checklistServicos = [];
    this.preencherChecklistServicos(checklistServicos, 'preventiva');
    this.preencherChecklistServicos(checklistServicos, 'corretiva');
    this.preencherChecklistServicos(checklistServicos, 'sinistro');
    this.form.get('checklistServicos').setValue(checklistServicos);

    // Ignorar Raio
    this.itensConsiderarRaio = [];
    this.itensConsiderarRaio = this.itensConsiderarRaio.concat(this.itensConsiderarRaioPreventiva);
    this.itensConsiderarRaio = this.itensConsiderarRaio.concat(this.itensConsiderarRaioCorretiva);
    this.itensConsiderarRaio = this.itensConsiderarRaio.concat(this.itensConsiderarRaioSinistro);
    this.form.get('isIgnorarRaio').setValue(this.itensConsiderarRaio.length === 0);

    // Com Fornecedor ou CRLV
    this.itensComFornecedorOuCRLV = [];
    this.itensComFornecedorOuCRLV = this.itensComFornecedorOuCRLV.concat(this.itensComFornecedorOuCRLVPreventiva);
    this.itensComFornecedorOuCRLV = this.itensComFornecedorOuCRLV.concat(this.itensComFornecedorOuCRLVCorretiva);
    this.itensComFornecedorOuCRLV = this.itensComFornecedorOuCRLV.concat(this.itensComFornecedorOuCRLVSinistro);
    const isSemFornecedorOuCRLV = this.itensComFornecedorOuCRLV.length === 0;
    this.form.get('isSemFornecedorOuCRLV').setValue(isSemFornecedorOuCRLV);

    this.form.get('isSegundaVia').setValue(this.isSegundaVia);
    this.form.get('isRecallFabrica').setValue(this.isRecallFabrica);
    this.form.get('isAutoServico').setValue(this.isAutoServico);
    this.form.get('isConcessionaria').setValue(this.isConcessionaria);
    this.form.get('isOutrosServicos').setValue(this.isOutrosServicos);
    this.form.get('isGarantia').setValue(this.isGarantia);
    this.form.get('isGarantiaUltimoServicoExecutado')
      .setValue(this.isGarantiaUltimoServicoExecutadoCorretiva ? 1 : this.isGarantiaUltimoServicoExecutadoSinistro ? 2 : null);
    this.form.get('isSinistro').setValue(this.isSinistro);
    this.form.get('isRevisao').setValue(this.isRevisao);
    this.form.get('isCorretivaComPneu').setValue(this.isCorretivaComPneu);
    this.form.get('isRouboFurtoOuVeiculoApreendido').setValue(this.isRouboFurtoOuVeiculoApreendido);

    // Anula a regra de Concessionária
    if (this.isConcessionaria && (this.isSinistro || this.isCorretivaComPneu)) {
      this.form.get('isConcessionaria').setValue(false);
    }

    this.itensSocorroMecanico = this.itensSocorroMecanico.concat(this.itensSocorroMecanicoPreventiva);
    this.itensSocorroMecanico = this.itensSocorroMecanico.concat(this.itensSocorroMecanicoCorretiva);
    this.itensSocorroMecanico = this.itensSocorroMecanico.concat(this.itensSocorroMecanicoSinistro);
    this.form.get('isSocorroMecanico').setValue(!!(this.itensSocorroMecanico && this.itensSocorroMecanico.length > 0));

    this.form.get('descricaoOcorridoGeral').setValue(this.getDescricaoOcorridoGeral());

    this.form.get('semAgendamentoParada').setValue(this.isSemAgendamentoParada());

    this.form.get('arquivosParaExcluir').setValue(this.arquivosParaExcluir);

    AtendimentoStorageService.abaUmForm = this.form;
  }

  preencherChecklistServicos(checklistServicos: Array<number>, nomeCombo: string) {
    const itensCombo = this.form.get(nomeCombo).value;
    if (itensCombo) {
      itensCombo.forEach(item => {
        if (!item.semFornecedor && !item.crlv) {
          checklistServicos.push(item.questionarioAtendimentoId);
        }
      });
    }
  }

  isSemAgendamentoParada(): boolean {
    const execucao = this.form.get('execucao').value || [];
    return !!((!this.isEdicao && !!(execucao.find(item => item.descricaoQuestionario.includes('sem agendamento'))))
      || this.isEdicao && AtendimentoStorageService.atendimento.sinistro
      && AtendimentoStorageService.atendimento.semAgendamentoParada);
  }

  getDescricaoOcorridoGeral(): string {

    // Data atual - usuário logado
    let ocorrido = moment(new Date()).format('DD/MM/YYYY HH:MM:SS');
    ocorrido = ocorrido.concat(' - ' + this.userContextService.getDados().nomeUsuario + '\n');

    // Preventivas
    const preventivas = this.form.get('preventiva').value;
    if (preventivas) {
      preventivas.forEach(item => {
        const index = preventivas.indexOf(item);
        if (index > 0 && preventivas.indexOf(item) < preventivas.length) {
          ocorrido = ocorrido.concat(item.descricaoQuestionario + ', ');
        } else {
          ocorrido = ocorrido.concat(item.descricaoQuestionario + '.\n');
        }
      });
    }

    // Corretivas
    const corretivas = this.form.get('corretiva').value;
    if (corretivas) {
      corretivas.forEach(item => {
        const index = corretivas.indexOf(item);
        if (index > 0 && corretivas.indexOf(item) < corretivas.length) {
          ocorrido = ocorrido.concat(item.descricaoQuestionario + ', ');
        } else {
          ocorrido = ocorrido.concat(item.descricaoQuestionario + '.\n');
        }
      });
    }

    // Acessórios
    this.acessorios.forEach(item => {
      const index = this.acessorios.indexOf(item);
      if (index > 0 && index < this.acessorios.length) {
        ocorrido = ocorrido.concat(item.descricao + ', ');
      } else {
        ocorrido = ocorrido.concat(item.descricao + '.\n');
      }
    });

    // Sinistros
    const sinistros = this.form.get('sinistro').value;
    if (sinistros) {
      sinistros.forEach(item => {
        const index = sinistros.indexOf(item);
        if (index > 0 && sinistros.indexOf(item) < sinistros.length) {
          ocorrido = ocorrido.concat(item.descricaoQuestionario + ', ');
        } else {
          ocorrido = ocorrido.concat(item.descricaoQuestionario + '.\n');
        }
      });
    }

    let complementos = this.form.get('complementoServicos').value;
    complementos = complementos ? complementos + '\n' : '';
    ocorrido = ocorrido + complementos;

    return ocorrido;
  }

  rmvUndf(list: any): Array<any> {
    return list ? list : [];
  }

  getSelection(event: any): Array<any> {
    let values;

    if (event && event.selectedOptions.selected) {
      values = [];
      event.selectedOptions.selected.forEach(selected => {
        values.push(selected.value);
      });
    }

    return values;
  }

  changePreventiva(event?: any) {
    this.isRevisao = false;
    this.itensConsiderarRaioPreventiva = [];
    this.itensSocorroMecanicoPreventiva = [];
    this.itensComFornecedorOuCRLVPreventiva = [];
    AtendimentoStorageService.resetarAbaDois = true;

    const values = this.getSelection(event) || this.form.get('preventiva').value;
    if (values && values.length > 0) {

      this.form.get('tipoManutencao').setValue(1);

      this.itensConsiderarRaioPreventiva = this.itensConsiderarRaioPreventiva.concat(
        this.rmvUndf(values.filter(item => item.ignorarRaio === false))
      );
      this.itensConsiderarRaioPreventiva = this.itensConsiderarRaioPreventiva.filter(Boolean);

      this.itensSocorroMecanicoPreventiva = this.itensSocorroMecanicoPreventiva.concat(
        this.rmvUndf(values.filter(item => item.socorroMecanico === true))
      );
      this.itensSocorroMecanicoPreventiva = this.itensSocorroMecanicoPreventiva.filter(Boolean);

      this.itensComFornecedorOuCRLVPreventiva = this.itensComFornecedorOuCRLVPreventiva.concat(
        this.rmvUndf(values.filter(item => item.crlv === false && item.semFornecedor === false))
      );
      this.itensComFornecedorOuCRLVPreventiva = this.itensComFornecedorOuCRLVPreventiva.filter(Boolean);

      this.isRevisao = !!(values.find(item => item.revisao === true));
    }
  }

  changeCorretiva(event?: any) {
    this.isGarantia = false;
    this.isAcessorio = false;
    this.isSegundaVia = false;
    this.isRecallFabrica = false;
    this.isOutrosServicos = false;
    this.isCorretivaComPneu = false;
    this.itensConsiderarRaioCorretiva = [];
    this.itensSocorroMecanicoCorretiva = [];
    this.itensComFornecedorOuCRLVCorretiva = [];
    this.isComplementoServicosObrigatorio = false;
    AtendimentoStorageService.resetarAbaDois = true;

    const values = this.getSelection(event) || this.form.get('corretiva').value;
    if (values && values.length > 0) {
      this.isGarantia = !!values.find(item => item.garantia === true);

      this.form.get('tipoManutencao').setValue(1);

      if (values.find(item => ['Acessórios (Implementos)'].includes(item.descricaoQuestionario))) {
        if (this.acessorios.length === 0) {
          this.veiculoService.getEquipamentos({ veiculoId: this.abaZeroForm['veiculo'].veiculoId }).subscribe(
            res => {
              this.acessorios = res.data.results;
              this.isAcessorio = this.acessorios.length > 0;
              this.isAcessorio
                ? this.form.get('acessorio').setValidators(Validators.compose([Validators.required]))
                : this.form.get('acessorio').clearValidators();
            }, err => {
              this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
              this.isAcessorio = false;
            });
        } else {
          this.isAcessorio = true;
        }
      } else if (!values.find(item => ['Acessórios (Implementos)'].includes(item.descricaoQuestionario))) {
        this.isAcessorio = false;
        this.form.get('acessorio').reset();
        this.form.get('acessorio').setErrors(null);
        this.form.get('acessorio').markAsPristine();
      }

      if (values.find(item => ['Outros Serviços'].includes(item.descricaoQuestionario))) {
        this.isOutrosServicos = true;
        if (!this.isEdicao) {
          this.isComplementoServicosObrigatorio = true;
        } else {
          this.isComplementoServicosObrigatorio = false;
        }
      } else {
        this.isOutrosServicos = false;
        this.isComplementoServicosObrigatorio = false;
      }

      if (!this.isComplementoServicosObrigatorio) {
        this.isComplementoServicosObrigatorio = this.isGarantia;
      }

      if (values.find(item => item.descricaoQuestionario.toLowerCase().includes('via placa')
        || item.descricaoQuestionario.toLowerCase().includes('via de crlv'))) {
        /* const sinistros = this.form.get('sinistro').value;
        if (sinistros && sinistros.find(item => item.descricaoQuestionario.toLowerCase().includes('apreendido')
          || item.descricaoQuestionario.toLowerCase().includes('furto'))) {
          this.isSegundaVia = true;
        } else {
          this.isSegundaVia = false;
        } */
        this.isSegundaVia = true;
      } else {
        this.isSegundaVia = false;
      }

      if (values.find(item =>
        ['Garantia / Recall de Fábrica', 'Vidros - Quebra ou Trinca'].includes(item.descricaoQuestionario))) {
        this.isRecallFabrica = true;
      } else {
        this.isRecallFabrica = false;
      }

      this.isCorretivaComPneu = !!values.find(item => ['Pneu'].includes(item.descricaoQuestionario));

      this.itensConsiderarRaioCorretiva = this.itensConsiderarRaioCorretiva.concat(
        this.rmvUndf(values.filter(item => item.ignorarRaio === false))
      );
      this.itensConsiderarRaioCorretiva = this.itensConsiderarRaioCorretiva.filter(Boolean);

      this.itensSocorroMecanicoCorretiva = this.itensSocorroMecanicoCorretiva.concat(
        this.rmvUndf(values.filter(item => item.socorroMecanico === true))
      );
      this.itensSocorroMecanicoCorretiva = this.itensSocorroMecanicoCorretiva.filter(Boolean);

      this.itensComFornecedorOuCRLVCorretiva = this.itensComFornecedorOuCRLVCorretiva.concat(
        this.rmvUndf(values.filter(item => item.crlv === false && item.semFornecedor === false))
      );
      this.itensComFornecedorOuCRLVCorretiva = this.itensComFornecedorOuCRLVCorretiva.filter(Boolean);

      if (values.find(item => item.descricaoQuestionario.includes('ltimo serviço executado'))) {
        this.isGarantiaUltimoServicoExecutadoCorretiva = true;
      } else {
        this.isGarantiaUltimoServicoExecutadoCorretiva = false;
      }
    } else {
      this.isAcessorio = false;
    }
  }

  changeSinistro(event?: any) {
    this.isSinistro = false;
    this.isSegundaVia = false;
    this.showExecucao = false;
    this.itensConsiderarRaioSinistro = [];
    this.itensSocorroMecanicoSinistro = [];
    this.itensComFornecedorOuCRLVSinistro = [];
    this.comDocumentacaoSinistro = false;
    this.comDocumentacaoSinistroAnterior = false;
    AtendimentoStorageService.resetarAbaDois = true;

    const values = this.getSelection(event) || this.form.get('sinistro').value;
    if (values && values.length > 0) {
      this.isSinistro = values.length > 0;

      this.form.get('tipoManutencao').setValue(2);

      this.itensConsiderarRaioSinistro = this.itensConsiderarRaioSinistro.concat(
        this.rmvUndf(values.filter(item => item.ignorarRaio === false))
      );
      this.itensConsiderarRaioSinistro = this.itensConsiderarRaioSinistro.filter(Boolean);

      this.itensSocorroMecanicoSinistro = this.itensSocorroMecanicoSinistro.concat(
        this.rmvUndf(values.filter(item => item.socorroMecanico === true))
      );
      this.itensSocorroMecanicoSinistro = this.itensSocorroMecanicoSinistro.filter(Boolean);

      this.itensComFornecedorOuCRLVSinistro = this.itensComFornecedorOuCRLVSinistro.concat(
        this.rmvUndf(values.filter(item => item.crlv === false && item.semFornecedor === false))
      );
      this.itensComFornecedorOuCRLVSinistro = this.itensComFornecedorOuCRLVSinistro.filter(Boolean);

      if (values.find(item => item.descricaoQuestionario.toLowerCase().includes('apreendido')
        || item.descricaoQuestionario.toLowerCase().includes('furto'))) {
        this.isRouboFurtoOuVeiculoApreendido = true;
        this.resetarListaExecucao();
      } else {
        this.isRouboFurtoOuVeiculoApreendido = false;

        const veiculo = this.abaZeroForm['veiculo'];
        this.showExecucao = !this.isEdicao || (this.isEdicao && (veiculo && veiculo.manutencaoSinistro !== false));

        if (!this.showExecucao) {
          this.resetarListaExecucao();
        } else {
          this.getSinistrosSemAgendamentoParada();
        }
      }

      if (values.find(item => item.descricaoQuestionario.includes('ltimo serviço executado'))) {
        this.isGarantiaUltimoServicoExecutadoSinistro = true;
      } else {
        this.isGarantiaUltimoServicoExecutadoSinistro = false;
      }

      this.comDocumentacaoSinistro = (!this.isEdicao || (this.isEdicao && this.combosServicosExibidos.includes('s')))
        && (!!values.find(item => item.semDocumentacaoSinistro === false) || this.comDocumentacaoSinistroAnterior);

      if (!this.comDocumentacaoSinistro) {
        this.resetaCamposDocumentacaoSinistro();
      }
    }

  }

  resetarListaExecucao(): void {
    this.ultimaExecucao = null;
    this.form.get('sinistroAnteriorId').setValue(null);
    this.form.get('semAgendamentoParada').setValue(false);
    this.form.get('sinistroAnteriorVinculado').setValue(false);
    this.form.get('execucao').setValue(null);
    this.execucoes.forEach(item => {
      item.selected = false;
    });
    this.sinistrosSemAgendamentoParada.forEach(item => {
      item.selected = false;
    });
  }

  changeExecucao(event?: any) {
    AtendimentoStorageService.resetarAbaDois = true;

    const value = event ? event.option.value : this.form.get('execucao').value[0];
    const id = value.id;

    if (this.ultimaExecucao === id) {
      this.resetarListaExecucao();
      return;
    } else {
      if (id === 1) {
        this.execucoes[0].selected = true;
        this.execucoes[1].selected = false;
        this.form.get('semAgendamentoParada').setValue(true);
        this.form.get('sinistroAnteriorVinculado').setValue(false);
        this.sinistrosSemAgendamentoParada.forEach(item => {
          item.selected = false;
        });
      } else if (id === 2) {
        this.execucoes[0].selected = false;
        this.execucoes[1].selected = true;
        this.form.get('sinistroAnteriorVinculado').setValue(true);
        this.form.get('semAgendamentoParada').setValue(false);
      }
    }

    this.ultimaExecucao = id;
  }

  changeCEP(event) {
    const cep = Util.removeSpecialCharacters(event.target.value);

    if (cep.length === 8) {
      if (!Util.validarCEP(cep)) {
        this.form.controls['cepSinistro'].setErrors({ 'incorrect': true });
        this.snackBar.open(this.translate.instant('PORTAL.MSG_CEP_INVALIDO'), 3500, 'X');
        return;
      }
      this.form.controls['cepSinistro'].setErrors(null);

      this.consultaCepService.getEnderecoByCep(cep).subscribe(res => {
        if (res.data.length === 0) {
          this.snackBar.open(this.translate.instant('PORTAL.MSG_CEP_INVALIDO'), 3500, 'X');
          return;
        }
        this.form.get('logradouroSinistro').setValue(res.data.tipo + ' ' + res.data.logradouro);
        this.form.get('bairroSinistro').setValue(res.data.bairro);
        this.form.get('ufSinistro').setValue(res.data.uf);
        this.form.get('cidadeSinistro').setValue(res.data.cidade);
        this.form.get('municipioSinistroId').setValue(res.data.cidadeId);
      }, err => {
        this.snackBar.error(this.translate.instant('PORTAL.MSG_CEP_INVALIDO'), 3500, 'X');
      });
    }
  }

  changeDataSinistro(event: any) {
    if (this.form.get('horaSinistro').value) {
      let hora = this.form.get('horaSinistro').value.substr(0, 2);
      hora = hora + ':' + this.form.get('horaSinistro').value.substr(2, 4);
      this.changeHoraSinistro({ target: { value: hora } });
    }
  }

  changeHoraSinistro(event) {
    let horaSinistro = event.target.value;
    if (horaSinistro && horaSinistro.length === 5) {
      horaSinistro = horaSinistro.split(':');
      if (horaSinistro[0] > 23 || horaSinistro[1] > 59) {
        this.form.get('horaSinistro').setValue(null);
        this.snackBar.open(this.translate.instant('PORTAL.MSG_HORA_INVALIDA'), 3500, 'X');
      } else {
        const timestamp = moment(
          this.form.get('dataSinistro').value
        ).hours(
          horaSinistro[0]
        ).minutes(horaSinistro[1]).toDate().getTime();

        if (timestamp > new Date().getTime()) {
          this.form.get('horaSinistro').setValue(null);
          this.snackBar.open(this.translate.instant('PORTAL.DATA_HORA_MAIOR_ATUAL'), 3500, 'X');
          return;
        }

        this.form.get('timestampSinistro').setValue(timestamp);
      }
    } else if (event.type === 'change') {
      this.form.get('horaSinistro').setValue(null);
      this.snackBar.open(this.translate.instant('PORTAL.MSG_HORA_INVALIDA'), 3500, 'X');
    }
  }

  checkCombo(option) {
    if (!option.disabled) {
      option.selected = !option.selected;
    }
  }

  onFileChange(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];

      this.fileInput.nativeElement.value = null;

      if (file.size / 1000 > 3100) {
        this.snackBar.open(this.translate.instant('PORTAL.MSG_TAMANHO_ARQUIVO_INVALIDO'), 7000, 'X');
        return;
      }

      this.currentDoc = file;
    }
  }

  adicionarArquivo(): void {
    if (!this.currentDoc) {
      this.snackBar.open(this.translate.instant('PORTAL.MSG_SELECIONAR_ARQUIVO'), 3500, 'X');
      return;
    }
    if (!this.formArquivos.value) {
      this.snackBar.open(this.translate.instant('PORTAL.MSG_NOME_TIPO_OBRIGATORIO'), 3500, 'X');
      return;
    }

    const input = new FormData();
    const docType = this.currentDoc.type.split('/')[1];
    const tipoArquivo = String(this.formArquivos.get('tipoArquivo').value.descricao.replace(/\s/g, '_')).toLowerCase();
    const descricaoArquivo = `${tipoArquivo}.${docType}`;
    const fileToUpload: File = this.currentDoc;

    input.append('file', fileToUpload, descricaoArquivo);

    const doc = {
      file: this.currentDoc,
      descricao: descricaoArquivo,
      fileFormData: input,
      dadosAPICliente: {
        atendimentoId: 0,
        descricaoArquivo: descricaoArquivo,
        tipoDocumento: this.formArquivos.get('tipoArquivo').value,
        usuarioId: Number(this.userContextService.getID())
      }
    };

    this.formArquivos.reset();
    this.formArquivos.get('tipoArquivo').setValue(null);
    this.formArquivos.get('tipoArquivo').setErrors(null);

    AtendimentoStorageService.setArquivos(doc);
    this.currentDoc = null;
    this.totalDocs++;
  }

  removerArquivo(arquivo: any): void {
    this.removerArquivoLocal(arquivo);
  }

  removerArquivoLocal(arquivo: any): void {
    if (AtendimentoStorageService.removeArquivos(arquivo)) {
      this.totalDocs--;

      if (arquivo.id) {
        this.arquivosParaExcluir.push(arquivo.id);
      }

      this.snackBar.success(this.translate.instant('PORTAL.MSG_ARQUIVO_REMOVIDO_SUCESSO'), 3500, 'X');
      return;
    }

    this.snackBar.open(this.translate.instant('PORTAL.MSG_ARQUIVO_REMOVIDO_ERROR'), 3500, 'X');
  }

  getArquivos() {
    return AtendimentoStorageService.getArquivos();
  }

  getCondition(condition: any) {
    if (condition === 'execucao') {
      return (!this.showExecucao || this.ocultarComboServicos('s'));
    } else if (condition === 'acessorio') {
      return (!this.isAcessorio);
    } else if (condition === 'corretiva') {
      return (this.ocultarComboServicos('c'));
    } else if (condition === 'preventiva') {
      return (this.ocultarComboServicos && this.ocultarComboServicos('p'));
    } else if (condition === 'sinistro') {
      return (this.ocultarComboServicos('s'));
    }
  }

  ocultarComboServicos(servico: string) {
    return this.combosServicosExibidos.length > 0 && !this.combosServicosExibidos.includes(servico);
  }

  getSinistrosSemAgendamentoParada(eventTable?: number) {
    const _this = this;
    _this.numPage = eventTable || 1;

    const veiculoId = _this.abaZeroForm['veiculo'].veiculoId;

    const sinistros = [];
    const servicosSinistro = _this.form.get('sinistro').value || [];
    servicosSinistro.forEach(sinistro => {
      sinistros.push(sinistro.questionarioAtendimentoId);
    });

    _this.atendimentoClienteService.getSinistroSemAgendamentoParada(veiculoId, sinistros).subscribe(res => {
      _this.totalRows = res.data.totalRows;
      _this.numPage = res.data.numPage;
      _this.numRows = res.data.numRows;
      _this.sinistrosSemAgendamentoParada = res.data.results;

      _this.sinistrosSemAgendamentoParada.forEach(item => {
        item.checkbox = true;
        item.selected = false;
      });

      const atendimento = AtendimentoStorageService.atendimento;
      if (res.data.results.length === 0 || atendimento && atendimento.sinistroAnteriorVinculado) {
        _this.execucaoField['options']._results[1].value.disabled = true;
      } else {
        _this.execucaoField['options']._results[1].value.disabled = false;
      }
    }, err => {
      _this.snackBar.error(_this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  getColunasTabela(): Array<ColunasTabelaMV> {
    const colunas: Array<ColunasTabelaMV> = [
      {
        description: this.translate.instant('PORTAL.LABELS.SELECIONE'),
        columnDef: 'selecione', checkbox: true, style: { minWidth: 50 },
        checkConfig: {
          function: this.changeTableCheckbox.bind(this)
        }
      },
      {
        description: this.translate.instant('PORTAL.MANUTENCAO.COLUMNS_SINISTRO_ANTERIOR_VINCULADO.SINISTRO'),
        columnDef: 'sinistroId', style: {
          minWidth: 70
        }
      },
      {
        description: this.translate.instant('PORTAL.MANUTENCAO.COLUMNS_SINISTRO_ANTERIOR_VINCULADO.ATENDIMENTO_INICIAL'),
        columnDef: 'atendimentoId', style: {
          minWidth: 70
        }
      },
      {
        description: this.translate.instant('PORTAL.MANUTENCAO.COLUMNS_SINISTRO_ANTERIOR_VINCULADO.TIPO_SERVICO'),
        columnDef: 'descricaoSinistro', style: {
          minWidth: 100
        }
      },
      {
        description: this.translate.instant('PORTAL.MANUTENCAO.COLUMNS_SINISTRO_ANTERIOR_VINCULADO.DATA_SERVICO'),
        columnDef: 'dataSinistro', datetime: true, style: {
          minWidth: 100
        }
      }
    ];

    return colunas;
  }

  changeTableCheckbox(element: any): void {

    element.selected = !element.selected;

    this.sinistrosSemAgendamentoParada.forEach(item => {
      if (item.sinistroId !== element.sinistroId) {
        item.selected = false;
      }
    });

    if (element.selected && element.descricaoSinistro.toLowerCase().includes('acidente')
      || element.descricaoSinistro.toLowerCase().includes('furto')
      || element.descricaoSinistro.toLowerCase().includes('arrombamento')) {

      this.comDocumentacaoSinistroAnterior = true;

      const arquivos = AtendimentoStorageService.arquivos.find(item => item.tipoArquivo === 'SINISTRO_ANTERIOR');
      if (arquivos && Array.isArray(arquivos)) {
        arquivos.forEach(arquivo => {
          AtendimentoStorageService.removeArquivos(arquivo);
        });
      } else {
        AtendimentoStorageService.removeArquivos(arquivos);
      }

      this.preencherSinistroEdicao(element.atendimentoId, 'SINISTRO_ANTERIOR');
      this.comDocumentacaoSinistro = true;
    } else {
      const values = this.form.get('sinistro').value;
      this.comDocumentacaoSinistro = (!this.isEdicao || (this.isEdicao && this.combosServicosExibidos.includes('s')))
        && (!!values.find(item => item.semDocumentacaoSinistro === false) || this.comDocumentacaoSinistroAnterior);
    }

    this.form.get('sinistroAnteriorId').setValue(element.selected ? element.sinistroId : null);

    setTimeout(() => {
      this.sinistrosAnterioresTable['genericTable']._forceRenderDataRows();
    });
  }

  isComDocumentacaoSinitro() {
    const sinistros = this.form.get('sinistro').value;
    return sinistros ? !!sinistros.find(sinistro => sinistro.semDocumentacaoSinistro === false) : false;
  }

}
