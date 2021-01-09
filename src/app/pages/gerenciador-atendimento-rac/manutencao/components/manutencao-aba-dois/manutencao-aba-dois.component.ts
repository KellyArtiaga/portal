import { AfterContentChecked, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { AtendimentoStorageService } from 'src/app/core/services/atendimento-storage.service';
import { AtendimentoClienteService } from 'src/app/core/services/atendimentos-clientes.service';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';
import { UserContextService } from 'src/app/core/services/user-context.service';
import { VeiculoService } from 'src/app/core/services/veiculos.service';
import { FornecedorAtendimentoMV } from 'src/app/shared/interfaces/fornecedor-atendimento.model';
import { Util } from 'src/app/shared/util/utils';

@Component({
  selector: 'app-manutencao-aba-dois',
  templateUrl: './manutencao-aba-dois.component.html',
  styleUrls: ['./manutencao-aba-dois.component.scss']
})
export class ManutencaoAbaDoisComponent implements OnInit, AfterContentChecked {

  @ViewChild('filtroFornecedores') filtroFornecedores: ElementRef;
  @ViewChild('fornecedorList') fornecedorList: ElementRef;

  form: FormGroup;
  kmVeiculo = new FormControl('', Validators.compose([]));

  planosManutencaoExecutar = [] as Array<any>;
  abaZeroForm: any;
  abaUmForm: any;

  veiculo: any;

  hideAgendamento: boolean;
  showDatasParada: boolean;
  exibirFornecedores: boolean;

  isIgnorarRaio: boolean;
  isSemFornecedorOuCRLV: boolean;
  isSegundaVia: boolean;
  isRecallFabrica: boolean;
  isConcessionaria: boolean;
  isOutrosServicos: boolean;
  isGarantia: boolean;
  isSinistro: boolean;
  isCorretivaComPneu: boolean;
  isIsencao: boolean;
  isRevisao: boolean;
  isAutoServico: boolean;
  isSemAgendamentoParada: boolean;
  isRegistroSinistro: boolean;
  isGarantiaUltimoServicoExecutado: boolean;

  kmAlterado: boolean;
  alreadyChecked: boolean;
  pesquisaFornecedorRealizada: boolean;

  kmInformado: any;

  now = new Date().toISOString();

  callPesquisar = this.pesquisar.bind(this);

  constructor(
    private formBuilder: FormBuilder,
    private snackBar: SnackBarService,
    private translateService: TranslateService,
    private veiculoService: VeiculoService,
    private activatedRoute: ActivatedRoute,
    private atendimentoClienteService: AtendimentoClienteService,
    private userContextService: UserContextService
  ) { }

  ngOnInit() {
    this.createForm();
  }

  ngAfterContentChecked(): void {
    if (AtendimentoStorageService.abaSelecionada === 2
      && (AtendimentoStorageService.abaZeroForm && AtendimentoStorageService.abaZeroForm.value)
      && (AtendimentoStorageService.abaUmForm && AtendimentoStorageService.abaUmForm.value)) {

      this.abaZeroForm = AtendimentoStorageService.abaZeroForm.value;
      this.abaUmForm = AtendimentoStorageService.abaUmForm.value;
      this.veiculo = this.abaZeroForm['veiculo'];
      this.isIgnorarRaio = this.abaUmForm['isIgnorarRaio'];
      this.isSemFornecedorOuCRLV = this.abaUmForm['isSemFornecedorOuCRLV'];
      this.isSegundaVia = this.abaUmForm['isSegundaVia'];
      this.isRecallFabrica = this.abaUmForm['isRecallFabrica'];
      this.isAutoServico = this.abaUmForm['isAutoServico'];
      this.isConcessionaria = this.abaUmForm['isConcessionaria'];
      this.isOutrosServicos = this.abaUmForm['isOutrosServicos'];
      this.isGarantia = this.abaUmForm['isGarantia'];
      this.isSinistro = this.abaUmForm['isSinistro'];
      this.isRevisao = this.abaUmForm['isRevisao'];
      this.isCorretivaComPneu = this.abaUmForm['isCorretivaComPneu'];
      this.isSemAgendamentoParada = this.abaUmForm['isSemAgendamentoParada'];
      this.isRegistroSinistro = this.abaUmForm['isRegistroSinistro'];
      this.isGarantiaUltimoServicoExecutado = this.abaUmForm['isGarantiaUltimoServicoExecutado'];

      if (AtendimentoStorageService.resetarAbaDois) {
        AtendimentoStorageService.resetarAbaDois = false;
        this.resetPage();
      }

      if (!this.alreadyChecked) {
        this.alreadyChecked = true;
        this.prepararEdicao();
      }

      this.hideAgendamento = this.abaUmForm['hideAgendamento'] || this.isSemAgendamentoParada;
    }
  }

  createForm() {
    this.form = this.formBuilder.group({
      'placa': ['', Validators.compose([])],
      'tipoUso': ['', Validators.compose([])],
      'modelo': ['', Validators.compose([])],
      'kmVeiculo': ['', Validators.compose([])],
      'ultimoPlanoExecutado': ['', Validators.compose([])],
      'planoManutencaoExecutar': ['', Validators.compose([])],
      'registrarAtualizacaoKm': ['', Validators.compose([])]
    });

    this.form.setControl('kmVeiculo', this.kmVeiculo);
  }

  preeencherCampos() {
    this.form.get('placa').disable();
    this.form.get('tipoUso').disable();
    this.form.get('modelo').disable();
    this.form.get('ultimoPlanoExecutado').disable();
    this.form.get('planoManutencaoExecutar').disable();

    this.form.get('placa').setValue(this.veiculo.placa);
    this.form.get('tipoUso').setValue(this.veiculo.tipoUso);
    this.form.get('modelo').setValue(this.veiculo.modelo);
    this.form.get('ultimoPlanoExecutado').setValue(this.veiculo.ultimoPlano);
  }

  prepararEdicao() {
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['atendimentoId']) {
        this.atendimentoClienteService.get(params['atendimentoId']).subscribe(res => {
          this.preencherCamposEdicao(+params['atendimentoId']);
        }, err => {
          AtendimentoStorageService.atendimento = null;
          this.snackBar.error(this.translateService.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
        });
      } else {
        AtendimentoStorageService.atendimento = null;
      }
    });
  }

  preencherCamposEdicao(atendimentoId: number) {
    const _this = this;
    const agendamento = AtendimentoStorageService.atendimento;

    if (!agendamento) {
      this.atendimentoClienteService.get(atendimentoId).subscribe(res => {
        AtendimentoStorageService.atendimento = res.data;
        this.preencherCamposEdicao(atendimentoId);
      }, err => {
        AtendimentoStorageService.atendimento = null;
        this.snackBar.error(this.translateService.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
      });
      return;
    }

    _this.form.get('placa').setValue(agendamento.placa);
    _this.form.get('tipoUso').setValue(agendamento.tipoUso);
    _this.form.get('modelo').setValue(agendamento.modelo);
    _this.form.get('ultimoPlanoExecutado').setValue(agendamento.codigoPlanoManutencao);
    _this.kmVeiculo.setValue(agendamento.odometroAtual);
    _this.changeKM({ target: { value: agendamento.odometroAtual } }, agendamento);

    if (agendamento.odometroAtual) {
      _this.form.get('kmVeiculo').disable();
    }
  }

  private preencherGridFornecedoresEdicao(_this: this, agendamento: any) {
    _this.atendimentoClienteService.getFornecedor(agendamento.atendimentoId).subscribe(res => {
      if (_this.fornecedorList) {
        let servicosJaSelecionados = '';
        _this.fornecedorList['servicosRestantes'] = [];
        _this.fornecedorList['fornecedoresSelecionados'] = [];

        res.data.results.forEach(element => {
          element.municipio = element.cidade;
          element.telefone = Util.formataTelefone(element.telefone);
          element.endereco = `${element.logradouro}, ${element.numero}, ${element.bairro}`;
          element.listaDescricaoServico = element.servicos;
          _this.fornecedorList['fornecedoresSelecionados'].push({ fornecedor: element });

          if (element.servicos) {
            servicosJaSelecionados += (element.servicos.toLowerCase().trim() + ' ');
          }
        });
        _this.filtroFornecedores['enderecoFornecedorEdicao'] = agendamento.enderecoFornecedor;

        AtendimentoStorageService.getServicosPesquisaRaio().forEach(servico => {
          if (!servicosJaSelecionados || !servicosJaSelecionados.includes(servico.descricaoQuestionario.toLowerCase().trim())) {
            _this.fornecedorList['servicosRestantes'].push(servico);
          }
        });
      }

      if (_this.filtroFornecedores) {
        _this.filtroFornecedores['enderecoFornecedorEdicao'] = agendamento.enderecoFornecedor;
      }
    }, err => {
      _this.snackBar.error(_this.translateService.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  resetPage() {
    this.form.reset();
    this.kmVeiculo.reset();
    this.kmAlterado = false;
    this.alreadyChecked = false;
    this.hideAgendamento = false;
    this.exibirFornecedores = false;
    this.pesquisaFornecedorRealizada = false;
    this.now = new Date().toISOString();
    this.form.get('kmVeiculo').enable();
    this.preeencherCampos();
  }

  validarForm(): boolean {

    Util.validateAllFormFields(this.form);

    if (this.filtroFornecedores) {
      Util.validateAllFormFields(this.filtroFornecedores['form']);
    }

    if (!this.form.valid || (this.filtroFornecedores && !this.filtroFornecedores['form'].valid)) {
      this.snackBar.open(this.translateService.instant('PORTAL.MSG_CAMPO_OBRIGATORIO'), 3500, 'X');
      return false;
    }

    if (this.exibirFornecedores) {
      const remainingServices = this.getServicosFaltando();
      if (!this.fornecedorList || this.fornecedorList['fornecedoresSelecionados'].length < 1) {
        //this.snackBar.open(`Escolha fornecedor(es) para os serviços: ${remainingServices.toString()}.`, 7000, 'X');
        //return false;
      }
    }

    if (!this.isRevisao) {
      this.form.get('planoManutencaoExecutar').setValue(null);
    }

    return true;
  }

  getServicosFaltando(): any {
    if (this.fornecedorList) {
      return this.fornecedorList['getServicosRestantesDescricao']();
    }
  }

  validarExibicaoFornecedores() {
    if (!this.verificarSeEDataParada()) {
      this.exibirFornecedores = true;

      if (this.isSemFornecedorOuCRLV) {
        this.exibirFornecedores = false;
      }

      if (this.isGarantia && !this.isGarantiaUltimoServicoExecutado) {
        this.hideAgendamento = false;
        this.exibirFornecedores = false;
      }

    } else {
      this.hideAgendamento = false;
      this.exibirFornecedores = false;
    }

    if (this.isConcessionaria) {
      this.hideAgendamento = false;
      this.exibirFornecedores = false;
    }

    if (this.isSemAgendamentoParada) {
      this.hideAgendamento = true;
      this.exibirFornecedores = false;
    }

    // Sobrepõe todas as outras regras
    this.hideAgendamento = false;
    this.exibirFornecedores = true;
  }

  verificarSeEDataParada() {
    let isDataParada;

    let isencao;
    if (this.isRevisao) {
      // Define a inseção do veiculo
      isencao = this.isIsencao;
    }

    // Pneu ou sinistro cancela a regra da concessionária
    // Não tem pneu nem sinistro
    if (!isencao && !this.isPneuOuSinistro()) {
      // Roda a regra da concessionária
      isDataParada = this.isDataParada();
    }

    if (!isDataParada) {
      // Data de parada específica para clientes
      isDataParada = this.isAutoServico;
    }

    return isDataParada;
  }

  isDataParada(): boolean {
    return this.isIgnorarRaio || this.isSegundaVia || this.isRecallFabrica;
  }

  isPneuOuSinistro(): boolean {
    return this.isCorretivaComPneu || (this.isSinistro && !this.isSegundaVia);
  }

  changeKM(value: any, agendamento?: any) {
    const _this = this;
    const veiculo = _this.abaZeroForm['veiculo'];

    _this.planosManutencaoExecutar = [];

    if (value) {
      _this.form.get('kmVeiculo').setValue(value);
      _this.veiculoService.getPlanoManutencao({ km: value, veiculoId: veiculo.veiculoId }).subscribe(res => {
        if (res.data.results && res.data.results.length > 0) {
          const planoManutencao = res.data.results[0];
          _this.form.get('registrarAtualizacaoKm').setValue(planoManutencao.registrarAtualizacaoKm);

          if (planoManutencao.id > 0) {
            AtendimentoStorageService.abaZeroForm.value['veiculo'].planoManutencaoId = planoManutencao.id;
            _this.isIsencao = planoManutencao.isencao;
            _this.form.get('planoManutencaoExecutar').setValue(planoManutencao.id);
          }

          _this.form.get('ultimoPlanoExecutado').setValue(planoManutencao.ultimoPlanoRealizado);

          _this.validarExibicaoFornecedores();

          if (agendamento) {
            _this.preencherGridFornecedoresEdicao(_this, agendamento);
          } else if (_this.fornecedorList) {
            _this.fornecedorList['servicosRestantes'] = AtendimentoStorageService.getServicosPesquisaRaio();
          }
        }
        _this.kmAlterado = value > 0;
      }, err => {
        console.log(err);
      });
    } else {
      this.hideAgendamento = false;
      this.exibirFornecedores = false;
      this.form.get('kmVeiculo').enable();
    }
  }

  getFornecedoresSelecionados(): any[] {
    if (this.fornecedorList && this.fornecedorList['fornecedoresSelecionados']
      && this.fornecedorList['fornecedoresSelecionados'].length > 0) {
      const fornecedores = [];

      this.fornecedorList['fornecedoresSelecionados'].forEach(item => {
        const fornecedor = item.fornecedor;

        const obj: FornecedorAtendimentoMV = {
          fornecedorId: item.fornecedor.fornecedorId,
          dataPrevisaoEntrega: Util.removerTime(fornecedor.dataPrevisaoEntrega),
          horaPrevisaoEntrega: Util.removerDate(fornecedor.dataPrevisaoEntrega),
          dataPrevisaoParada: Util.removerTime(fornecedor.dataPrevisaoParada),
          horaPrevisaoParada: Util.removerDate(fornecedor.dataPrevisaoParada),
          listaCodigoCategoria: item.fornecedor.listaCodigoCategoria,
          servicos: item.fornecedor.listaDescricaoServico
        };

        fornecedores.push(obj);
      });
      return fornecedores;
    }
    return [];
  }

  getFormData(): any {
    return this.form;
  }

  getEnderecoCliente(): string {
    if (this.fornecedorList && this.fornecedorList['form'] && this.fornecedorList['form'].value) {
      return this.fornecedorList['form'].value.endereco;
    } else if (this.filtroFornecedores) {
      return this.filtroFornecedores['form'].value.endereco;
    }
    return null;
  }

  getMunicipioCliente(): string {
    if (this.fornecedorList && this.fornecedorList['form'] && this.fornecedorList['form'].value) {
      return this.fornecedorList['form'].value.municipioId;
    } else if (this.filtroFornecedores) {
      return this.filtroFornecedores['form'].value.municipioId;
    }
    return null;
  }

  pesquisar(form: FormGroup) {

    form.get('isencao').setValue(this.isRevisao && this.isIsencao);
    form.get('segmentoNegocioId').setValue(this.abaZeroForm['segmentoNegocioId']);

    this.kmInformado = this.abaZeroForm.kmVeiculo;
    this.changeKM(this.kmInformado);
    Util.validateAllFormFields(this.form);
    // Fix click duplo pesquisa
    this.kmAlterado = true;
    this.exibirFornecedores = true;
    this.fornecedorList['servicosRestantes'] = AtendimentoStorageService.getServicosPesquisaRaio();

    if (this.kmAlterado && this.exibirFornecedores && !this.hideAgendamento && this.fornecedorList) {

      if (!this.form.valid || !this.filtroFornecedores['form'].valid) {
        this.snackBar.open(this.translateService.instant('PORTAL.MSG_CAMPO_OBRIGATORIO'), 3500, 'X');
        return;
      }

      if (this.fornecedorList['fornecedoresSelecionados'].length === 3) {
        this.snackBar.open(this.translateService.instant('PORTAL.AGENDAMENTO.TITLE.LIMITE_OFICINAS_ATINGIDO'), 3500, 'X');
        return;
      }

      if (this.isGarantiaUltimoServicoExecutado) {
        this.fornecedorList['tipoManutencao'] = this.abaUmForm.tipoManutencao;
      }

      this.fornecedorList['pesquisar'](form);
    }

    this.pesquisaFornecedorRealizada = true;
  }

  getRac(): any {

    let tokenRac = this.userContextService.getTokenRac();
    if (tokenRac) {
      tokenRac = JSON.parse(tokenRac);
    }

    return tokenRac;
  }

  getDescricaoDatasParada() {
    let message = '';
    if (!this.exibirFornecedores && !this.hideAgendamento) {
      message = 'Sugestões de horários de parada do cliente:\n';

      message += '1) ' + moment(this.form.get('dataParadaUm').value).format('DD/MM/YYYY')
        + ' - ' + Util.formatarHora(this.form.get('horaParadaUm').value) + '\n';
      message += '2) ' + moment(this.form.get('dataParadaDois').value).format('DD/MM/YYYY')
        + ' - ' + Util.formatarHora(this.form.get('horaParadaDois').value) + '\n';
      message += '3) ' + moment(this.form.get('dataParadaTres').value).format('DD/MM/YYYY')
        + ' - ' + Util.formatarHora(this.form.get('horaParadaTres').value) + '\n';
    }
    return message;
  }

}
