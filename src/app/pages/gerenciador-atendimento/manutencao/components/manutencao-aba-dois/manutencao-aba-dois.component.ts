import { AfterContentChecked, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { AtendimentoStorageService } from 'src/app/core/services/atendimento-storage.service';
import { AtendimentoClienteService } from 'src/app/core/services/atendimentos-clientes.service';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';
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
  kmVeiculo = new FormControl('', [Validators.required]);

  planosManutencaoExecutar = [] as Array<any>;
  abaZeroForm: any;
  abaUmForm: any;

  veiculo: any;

  exibirTresDatasParada: boolean;
  exibirFornecedores: boolean;
  semAgendamentoParada: boolean;
  pesquisaFornecedorRealizada: boolean;

  isIgnorarRaio: boolean;
  isSemFornecedorOuCRLV: boolean;
  isSegundaVia: boolean;
  isRecallFabrica: boolean;
  isConcessionaria: boolean;
  isGarantia: boolean;
  isSinistro: boolean;
  isCorretivaComPneu: boolean;
  isIsencao: boolean;
  isRevisao: boolean;
  isAutoServico: boolean;
  isGarantiaUltimoServicoExecutado: boolean;
  isRouboFurtoOuVeiculoApreendido: boolean;

  kmAlterado: boolean;
  alreadyChecked: boolean;

  now = new Date().toISOString();

  callPesquisar = this.pesquisar.bind(this);

  constructor(
    private formBuilder: FormBuilder,
    private snackBar: SnackBarService,
    private translateService: TranslateService,
    private veiculoService: VeiculoService,
    private activatedRoute: ActivatedRoute,
    private atendimentoClienteService: AtendimentoClienteService,
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
      this.isGarantia = this.abaUmForm['isGarantia'];
      this.isSinistro = this.abaUmForm['isSinistro'];
      this.isRevisao = this.abaUmForm['isRevisao'];
      this.isCorretivaComPneu = this.abaUmForm['isCorretivaComPneu'];
      this.semAgendamentoParada = this.abaUmForm['semAgendamentoParada'];
      this.isGarantiaUltimoServicoExecutado = this.abaUmForm['isGarantiaUltimoServicoExecutado'];
      this.isRouboFurtoOuVeiculoApreendido = this.abaUmForm['isRouboFurtoOuVeiculoApreendido'];

      if (AtendimentoStorageService.resetarAbaDois) {
        AtendimentoStorageService.resetarAbaDois = false;
        this.resetPage();
      }

      if (!this.alreadyChecked) {
        this.alreadyChecked = true;
        this.prepararEdicao();
      }
    }
  }

  createForm() {
    this.form = this.formBuilder.group({
      'placa': ['', Validators.compose([])],
      'tipoUso': ['', Validators.compose([])],
      'modelo': ['', Validators.compose([])],
      'kmVeiculo': ['', Validators.required],
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

    if (agendamento.dataParada1 && agendamento.dataParada2 && agendamento.dataParada3) {
      _this.createDatasParadaControls();
      setTimeout(() => {
        _this.form.get('dataParadaUm').setValue(new Date(Util.removerTimezone(agendamento.dataParada1)));
        _this.form.get('dataParadaDois').setValue(new Date(Util.removerTimezone(agendamento.dataParada2)));
        _this.form.get('dataParadaTres').setValue(new Date(Util.removerTimezone(agendamento.dataParada3)));
        _this.pesquisaFornecedorRealizada = true;
      }, 100);
    }

    if (agendamento.horaParada1 && agendamento.horaParada2 && agendamento.horaParada3) {
      _this.createDatasParadaControls();
      const horaParada1 = agendamento.horaParada1.substring(0, agendamento.horaParada1.lastIndexOf(':'));
      const horaParada2 = agendamento.horaParada2.substring(0, agendamento.horaParada2.lastIndexOf(':'));
      const horaParada3 = agendamento.horaParada3.substring(0, agendamento.horaParada3.lastIndexOf(':'));
      _this.form.get('horaParadaUm').setValue(horaParada1.replace(':', ''));
      _this.form.get('horaParadaDois').setValue(horaParada2.replace(':', ''));
      _this.form.get('horaParadaTres').setValue(horaParada3.replace(':', ''));
      _this.pesquisaFornecedorRealizada = true;
    }
  }

  private preencherGridFornecedoresEdicao(_this: this, agendamento: any) {
    _this.atendimentoClienteService.getFornecedor(agendamento.atendimentoId).subscribe(res => {
      if (_this.fornecedorList) {
        let servicosJaSelecionados = '';
        _this.fornecedorList['servicosRestantes'] = [];

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
    this.exibirTresDatasParada = false;
    this.exibirFornecedores = false;
    this.semAgendamentoParada = false;
    this.pesquisaFornecedorRealizada = false;
    this.now = new Date().toISOString();
    this.form.get('kmVeiculo').enable();
    this.preeencherCampos();
  }

  validarForm(): boolean {

    if (this.isTresDatasParada()) {
      if (!this.form.get('dataParadaUm')
        || !this.form.get('dataParadaDois')
        || !this.form.get('dataParadaTres')) {
        this.createDatasParadaControls();
      }
      this.pesquisaFornecedorRealizada = true;
    }

    Util.validateAllFormFields(this.form);

    if (this.filtroFornecedores) {
      Util.validateAllFormFields(this.filtroFornecedores['form']);
    }

    if (!this.form.valid || (this.filtroFornecedores && !this.filtroFornecedores['form'].valid)) {
      this.snackBar.open(this.translateService.instant('PORTAL.MSG_CAMPO_OBRIGATORIO'), 3500, 'X');
      return false;
    }

    if (this.isTresDatasParada()) {
      const invalid = !this.form.get('dataParadaUm').value
        || !this.form.get('dataParadaDois').value
        || !this.form.get('dataParadaTres').value;

      if (invalid) {
        this.snackBar.open(this.translateService.instant('PORTAL.MSG_CAMPO_OBRIGATORIO'), 3500, 'X');
        this.form.setErrors({ invalid: true });
        return false;
      }
    } else if (this.isExibirFornecedores()) {
      const remainingServices = this.getServicosFaltando();
      if (!this.fornecedorList || this.fornecedorList['fornecedoresSelecionados'].length < 1) {
        this.snackBar.open(`Escolha fornecedor(es) para os serviços: ${remainingServices.toString()}.`, 7000, 'X');
        return false;
      }
    }

    if (!this.isRevisao) {
      this.form.get('planoManutencaoExecutar').setValue(null);
    }

    return true;
  }

  limparErrosDataParada() {
    this.form.get('dataParadaUm').setErrors(null);
    this.form.get('horaParadaUm').setErrors(null);
    this.form.get('dataParadaDois').setErrors(null);
    this.form.get('horaParadaDois').setErrors(null);
    this.form.get('dataParadaTres').setErrors(null);
    this.form.get('horaParadaTres').setErrors(null);
  }

  getServicosFaltando(): any {
    if (this.fornecedorList) {
      return this.fornecedorList['getServicosRestantesDescricao']();
    }
  }

  validarRegrasDeExibicao() {

    // Exibir Três Datas de Parada
    this.exibirTresDatasParada = this.validarTresDatasParada();

    // Exibir Pesquisa de Fornecedores
    this.exibirFornecedores = !this.exibirTresDatasParada;

    // Sem Fornecedor ou CRLV
    if (this.isSemFornecedorOuCRLV) {
      this.semAgendamentoParada = true;
    }

    // Segunda Via
    if (this.isSegundaVia) {
      this.semAgendamentoParada = true;
    }

    // Roubo / Furto ou Veículo Apreendido
    if (this.isRouboFurtoOuVeiculoApreendido) {
      this.semAgendamentoParada = true;
    }

    // Sem Agendamento de Parada
    if (this.semAgendamentoParada) {
      this.exibirTresDatasParada = false;
      this.exibirFornecedores = false;
    }

  }

  validarTresDatasParada() {
    let isTresDatasParada;

    // Verifica se não é Pneu nem Sinistro e é Ignorar Raio ou Recall de Fábrica
    isTresDatasParada = (!this.isCorretivaComPneu && !this.isSinistro) && (this.isIgnorarRaio || this.isRecallFabrica);

    // Verifica se é Auto Serviço
    isTresDatasParada = isTresDatasParada || this.isAutoServico;

    // Verifica se há Isenção para Revisão do veículo
    isTresDatasParada = isTresDatasParada || (this.isRevisao && this.isIsencao);

    // Verifica se há Garantia (Ignora Garantia do Último Servico Executado)
    isTresDatasParada = isTresDatasParada || (this.isGarantia && !this.isGarantiaUltimoServicoExecutado);

    // Verifica se é Concessionária
    isTresDatasParada = isTresDatasParada || this.isConcessionaria;

    return isTresDatasParada;
  }

  isTresDatasParada(): boolean {
    return this.exibirTresDatasParada && !this.semAgendamentoParada;
  }

  isExibirFornecedores(): boolean {
    return this.exibirFornecedores && !this.semAgendamentoParada;
  }

  keyUpKM(event: any) {
    if (!event.target.value) {
      this.form.get('kmVeiculo').setValue(0);
      this.resetPage();
    }
  }

  changeKM(event: any, agendamento?: any) {
    const _this = this;
    _this.planosManutencaoExecutar = [];

    let km;
    if (event.target.value && typeof event.target.value === 'string') {
      km = event.target.value.replace('.', '').substring(0, event.target.value.indexOf(' ') - 1);
    } else if (typeof event.target.value === 'number') {
      km = event.target.value;
    }

    if (!km) {
      km = 0;
    }

    if (+km) {
      km = +km;
      const veiculo = _this.abaZeroForm['veiculo'];

      _this.form.get('kmVeiculo').setValue(km);
      _this.veiculoService.getPlanoManutencao({ km: km, veiculoId: veiculo.veiculoId }).subscribe(res => {
        if (res.data.results && res.data.results[0]) {
          const planoManutencao = res.data.results[0];
          _this.form.get('registrarAtualizacaoKm').setValue(planoManutencao.registrarAtualizacaoKm);

          if (planoManutencao.id > 0) {
            AtendimentoStorageService.abaZeroForm.value['veiculo'].planoManutencaoId = planoManutencao.id;

            _this.isIsencao = planoManutencao.isencao;

            if (planoManutencao.acaoPlano === 'USER_SELECT') {
              _this.planosManutencaoExecutar.push({
                id: 0,
                descriptionPlanoManutencao: 'Selecione',
                mensagem: null
              });

              _this.form.get('planoManutencaoExecutar').enable();
              _this.form.get('planoManutencaoExecutar').valueChanges.subscribe(id => {
                const plano = _this.planosManutencaoExecutar.find(item => item.id === id);
                if (plano && plano.mensagem) {
                  _this.snackBar.open(planoManutencao.mensagem, 10000, 'X');
                }
              });
            }

            _this.planosManutencaoExecutar.push(
              {
                id: planoManutencao.id,
                descriptionPlanoManutencao: planoManutencao.descricaoPlanoManutencao,
                mensagem: planoManutencao.mensagem
              });

            if (planoManutencao.acaoPlano === 'USER_SELECT') {
              _this.form.get('planoManutencaoExecutar').setValue(0);
            } else {
              _this.form.get('planoManutencaoExecutar').setValue(planoManutencao.id);
            }
          }

          setTimeout(() => {
            const planoManutencaoExecutar = document.getElementById('planoManutencaoExecutar');
            const label = planoManutencaoExecutar.getElementsByClassName('mat-select-value-text')[0];
            if (planoManutencao.acaoPlano === 'SELECT_PAINT') {
              label.setAttribute('style', 'font-weight: bold; color: red;');
            }
          });

          _this.form.get('ultimoPlanoExecutado').setValue(planoManutencao.ultimoPlanoRealizado);

          if (planoManutencao.acaoPlano !== 'USER_SELECT' && planoManutencao.mensagem) {
            _this.snackBar.open(planoManutencao.mensagem, 10000, 'X');
          }

          _this.validarRegrasDeExibicao();

          if (_this.filtroFornecedores) {
            _this.filtroFornecedores['semAgendamentoParada'] = _this.semAgendamentoParada;
          }

          setTimeout(() => {
            if (agendamento) {
              _this.preencherGridFornecedoresEdicao(_this, agendamento);
            } else if (_this.fornecedorList) {
              _this.fornecedorList['servicosRestantes'] = AtendimentoStorageService.getServicosPesquisaRaio();
            }
          }, 100);
        }
        _this.kmAlterado = km > 0;
      }, err => {
        console.log(err);
      });
    } else {
      this.exibirTresDatasParada = false;
      this.exibirFornecedores = false;
      this.semAgendamentoParada = false;
      this.form.get('kmVeiculo').enable();
    }
  }

  changeDataParada(field: string) {
    let data = this.form.get(field).value;
    data = data ? new Date(data) : null;

    if (data && (data.getDay() === 0 || data.getDay() === 6)) {
      const message = this.translateService.instant('PORTAL.MANUTENCAO.MESSAGE.DIA_UTIL');
      this.form.get(field).setValue(null);
      this.snackBar.open(this.translateService.instant(message.replace('{0}', Util.formataData(data))), 3500, 'X');
      this.form.get(field).setValue(null);
      return;
    }

    if (this.isRevisao && !this.isMinHorasDiferenca(data, 72)) {
      const message = this.translateService.instant('PORTAL.MANUTENCAO.MESSAGE.ANTECEDENCIA_72_HORAS');
      this.snackBar.open(message, 7000, 'X');
      this.form.get(field).setValue(null);
      return;
    }

    if (this.isDataParadaRepetida(field)) {
      const message = this.translateService.instant('PORTAL.MANUTENCAO.MESSAGE.INFORMAR_DATAS_DISTINTAS');
      this.snackBar.open(message, 7000, 'X');
      this.form.get(field).setValue(null);
    }
  }

  isDataParadaRepetida(field: string): boolean {
    const data = this.form.get(field);
    const dataUm = this.form.get('dataParadaUm');
    const dataDois = this.form.get('dataParadaDois');
    const dataTres = this.form.get('dataParadaTres');

    if (dataUm.value && data !== dataUm && data.value.toISOString() === dataUm.value.toISOString()) {
      return true;
    }

    if (dataDois.value && data !== dataDois && data.value.toISOString() === dataDois.value.toISOString()) {
      return true;
    }

    if (dataTres.value && data !== dataTres && data.value.toISOString() === dataTres.value.toISOString()) {
      return true;
    }

    return false;
  }

  isMinHorasDiferenca(data: any, minDiff: number) {
    data = data.getTime();
    const now = new Date().getTime();
    if ((data - now) / (60 * 60 * 1000) < minDiff) {
      return false;
    }

    return true;
  }

  changeHoraParada(event: any, field: string) {
    let hora = event.target.value;
    if (hora && hora.length === 5) {
      hora = hora.split(':');
      if (hora[0] > 23 || hora[1] > 59) {
        this.form.get(field).setValue(null);
        this.snackBar.open(this.translateService.instant('PORTAL.MSG_HORA_INVALIDA'), 3500, 'X');
        return;
      }

      if (this.veiculo.servicoLevaTraz === 'S') {
        if (+hora[0] < 10 || (+hora[0] > 17 || (+hora[0] >= 17 && +hora[1] > 0))) {
          this.form.get(field).setValue(null);
          this.snackBar.open(this.translateService.instant('PORTAL.MANUTENCAO.MESSAGE.HORARIO_ATENDIMENTO_LEVA_TRAZ'), 7000, 'X');
          return;
        }
      } else {
        if (+hora[0] < 8 || (+hora[0] > 18 || (+hora[0] >= 18 && +hora[1] > 0))) {
          this.form.get(field).setValue(null);
          this.snackBar.open(this.translateService.instant('PORTAL.MANUTENCAO.MESSAGE.HORARIO_ATENDIMENTO'), 7000, 'X');
          return;
        }
      }
    } else if (event.type === 'change') {
      this.form.get(field).setValue(null);
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

    Util.validateAllFormFields(this.form);

    if (this.isTresDatasParada()) {

      if (!this.form.get('dataParadaUm')
        || !this.form.get('dataParadaDois')
        || !this.form.get('dataParadaTres')) {
        this.createDatasParadaControls();
      }

      this.form.get('dataParadaUm').setErrors(null);
      this.form.get('horaParadaUm').setErrors(null);
      this.form.get('dataParadaDois').setErrors(null);
      this.form.get('horaParadaDois').setErrors(null);
      this.form.get('dataParadaTres').setErrors(null);
      this.form.get('horaParadaTres').setErrors(null);

      if (!this.form.valid || !this.filtroFornecedores['form'].valid) {
        this.snackBar.open(this.translateService.instant('PORTAL.MSG_CAMPO_OBRIGATORIO'), 3500, 'X');
        return;
      }

    } else if (this.kmAlterado && this.isExibirFornecedores()) {

      this.form.removeControl('dataParadaUm');
      this.form.removeControl('horaParadaUm');
      this.form.removeControl('dataParadaDois');
      this.form.removeControl('horaParadaDois');
      this.form.removeControl('dataParadaTres');
      this.form.removeControl('horaParadaTres');

      if (!this.form.valid || !this.filtroFornecedores['form'].valid) {
        this.snackBar.open(this.translateService.instant('PORTAL.MSG_CAMPO_OBRIGATORIO'), 3500, 'X');

        if (this.filtroFornecedores['form'].get('municipioId').valid) {
          this.filtroFornecedores['form'].get('cidade').setErrors(null);
        } else {
          this.filtroFornecedores['form'].get('cidade').setErrors({ invalid: true });
        }

        return;
      }

      if (this.fornecedorList['fornecedoresSelecionados'].length === 3) {
        this.snackBar.open(this.translateService.instant('PORTAL.AGENDAMENTO.TITLE.LIMITE_OFICINAS_ATINGIDO'), 3500, 'X');
        return;
      } else if (this.fornecedorList['servicosRestantes'].length === 0) {
        this.snackBar.open(this.translateService.instant('PORTAL.AGENDAMENTO.TITLE.TODOS_OS_FORNECEDORES_SELECIONADOS'), 3500, 'X');
        return;
      }

      if (this.isGarantiaUltimoServicoExecutado) {
        this.fornecedorList['tipoManutencao'] = this.abaUmForm.tipoManutencao;
      }

      this.fornecedorList['pesquisar'](form);
    } else {
      if (!this.form.valid || !this.filtroFornecedores['form'].valid) {
        this.snackBar.open(this.translateService.instant('PORTAL.MSG_CAMPO_OBRIGATORIO'), 3500, 'X');
        return;
      }
    }

    this.pesquisaFornecedorRealizada = true;
  }

  createDatasParadaControls() {
    this.form.setControl('dataParadaUm', new FormControl('', [Validators.required]));
    this.form.setControl('horaParadaUm', new FormControl('', [Validators.required]));
    this.form.setControl('dataParadaDois', new FormControl('', [Validators.required]));
    this.form.setControl('horaParadaDois', new FormControl('', [Validators.required]));
    this.form.setControl('dataParadaTres', new FormControl('', [Validators.required]));
    this.form.setControl('horaParadaTres', new FormControl('', [Validators.required]));

    this.form.get('dataParadaUm').disable();
    this.form.get('dataParadaDois').disable();
    this.form.get('dataParadaTres').disable();
  }

  getDescricaoDatasParada() {
    let message = '';
    if (this.isTresDatasParada()) {
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
