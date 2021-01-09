import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { NgxXml2jsonService } from 'ngx-xml2json';
import { ReplaySubject } from 'rxjs';
import { DadosModalService } from 'src/app/core/services/dados-modal.service';
import { FeriadoService } from 'src/app/core/services/feriados.service';
import { FornecedorService } from 'src/app/core/services/fornecedores.service';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';
import { VeiculoEntregaDevolucaoService } from 'src/app/core/services/veiculo-entrega-devolucao.service';
import { VeiculoModeloService } from 'src/app/core/services/veiculo-modelo.service';

import { ColunasTabelaMV } from '../../interfaces/colunas-tabela.model';
import { DadosModalMV } from '../../interfaces/dados-modal.model';
import { Util } from '../../util/utils';
import { ModalAvisoRetiradaComponent } from '../modal-aviso-retirada/modal-aviso-retirada.component';
import { ModalConfirmComponent } from '../modal-confirm/modal-confirm.component';

@Component({
  selector: 'app-modal-fornecedor-agendar',
  templateUrl: './modal-fornecedor-agendar.component.html',
  styleUrls: ['./modal-fornecedor-agendar.component.scss']
})
export class ModalFornecedorAgendarComponent implements OnInit, OnDestroy {
  @ViewChild('veiculosTable') veiculosTable: ElementRef;
  @ViewChild('fornecedoresTable') fornecedoresTable: ElementRef;

  inputDataSubject = new ReplaySubject<any>(1);

  datas: any[] = [];
  feriados: any[] = [];

  isZeroKM: boolean;
  filtroFornecedor: FormGroup;
  filtroCondutor: FormGroup;

  dataEvento = new FormControl('', Validators.compose([Validators.required]));
  dataEventoTimestamp = new FormControl('');
  horario = new FormControl('', Validators.compose([Validators.required]));

  coordenadasFornecedor: any;
  dadosCalendario: any[];
  veiculosModelos: any[];
  veiculoSelecionadoTable: any[];
  veiculos: any[] = [];
  fornecedores: any[] = [];
  veiculosSelecionados: any[] = [];
  veiculosIndisponibilidade: any[] = [];
  veiculosAvisoDisponibilidade: any[] = [];

  clienteId: number;

  tipo: string;

  modalRetiradaConfirm: NgbModalRef;

  isEditar: boolean;
  showCalendar: boolean;
  showFornecedores: boolean;
  showVeiculos: boolean;
  isSelectedToday: boolean;
  searchFornecedores = true;

  veiculosFiltro = {
    filteredData: [],
    data: []
  };

  situacoes = [
    {
      id: 'D',
      descricao: 'Devolução'
    },
    {
      id: 'E',
      descricao: 'Disponível para Agendamento'
    }
  ];

  fornecedorSelecionado: any;
  ultimoFornecedorSelecionado: any;

  isDevolucao: boolean;

  numPage = 0;
  totalRowsFornecedores = 0;
  totalRowsVeiculos = 0;

  veiculoToEdit = null;

  constructor(
    private translateService: TranslateService,
    private snackBar: SnackBarService,
    private activeModal: NgbActiveModal,
    private fornecedorService: FornecedorService,
    private veiculoEntregaDevolucao: VeiculoEntregaDevolucaoService,
    private veiculosModelosService: VeiculoModeloService,
    private modalService: NgbModal,
    private dadosModalService: DadosModalService,
    private feriadoService: FeriadoService,
    private ngxXml2jsonService: NgxXml2jsonService
  ) { }

  ngOnInit(): void {
    moment.locale('pt-BR');

    this.showFornecedores = false;
    this.showVeiculos = false;
    this.showCalendar = false;

    if (this.veiculoSelecionadoTable && this.veiculoSelecionadoTable.length > 0) {
      this.veiculosSelecionados = this.veiculoSelecionadoTable;
    }

    this.criaForm();
  }

  private criaForm(): void {
    if (this.isZeroKM) {
      this.filtroCondutor = new FormGroup({
        condutor: new FormControl()
      });
    }
    this.filtroFornecedor = new FormGroup({
      placa: new FormControl(),
      tipo: new FormControl(),
      modelo: new FormControl()
    });

    this.isDevolucao = this.tipo === 'D' && !this.isZeroKM;

    this.getVeiculos();
    this.getModelos();

    this.filtroFornecedor.get('tipo').setValue(this.isDevolucao ? 'D' : 'E');
  }

  private getModelos(): void {
    this.veiculosModelosService.getAll({ clienteId: this.clienteId }).subscribe(res2 => {
      this.veiculosModelos = res2.data.results;

      this.getVeiculos(null, false);
    }, res2 => {
      this.snackBar.error(res2.error.message, 3500, 'X');
    });
  }

  private getFornecedores(km?: number): void {
    const kmAmpliacao = km ? km : 3;
    const filtro = {
      latitude: this.coordenadasFornecedor.lat,
      longitude: this.coordenadasFornecedor.lng,
      municipioId: this.coordenadasFornecedor.municipioId,
      entregaDevolucao: true
    };

    this.showFornecedores = false;

    this.fornecedorService.getPorRaio(filtro, kmAmpliacao).subscribe(res1 => {
      if (res1.data.results.length === 0) {
        if (kmAmpliacao === 3) {
          this.getFornecedores(6);
          return;
        }
        if (kmAmpliacao === 6) {
          this.getFornecedores(9);
          return;
        }
        if (km === 9 && !this.isEditar) {
          this.snackBar.open(this.translateService.instant('PORTAL.MSG_FORNECEDOR_NOT_FOUND'), 7000, 'X');
        }
      } else {
        this.fornecedores = res1.data.results.map(fornecedor => {
          fornecedor.checkbox = true;
          fornecedor.checkReadOnly = this.isEditar || (this.veiculoToEdit && Object.keys(this.veiculoToEdit).length > 0);

          if (this.veiculoToEdit) {
            fornecedor.selected = fornecedor.fornecedorId === this.veiculoToEdit.fornecedorId;
          }
          if (this.fornecedorSelecionado) {
            fornecedor.selected = fornecedor.fornecedorId === this.fornecedorSelecionado.fornecedorId;
            this.getCalendarioFornecedor(this.fornecedorSelecionado);
          }

          if (fornecedor.telefone) {
            fornecedor.telefone = Util.formataTelefone(Util.removeSpecialCharacters(fornecedor.telefone));
          }

          return fornecedor;
        });

        if (this.isEditar || (this.veiculoToEdit && Object.keys(this.veiculoToEdit).length > 0)) {
          this.fornecedores = this.fornecedores.filter(fornecedor => {
            return fornecedor.fornecedorId === this.veiculoToEdit.fornecedorId;
          });
        }

        this.totalRowsFornecedores = res1.data.totalRows;
        this.getFeriados();
      }

      this.showFornecedores = true;

      if (this.veiculoToEdit) {
        this.fornecedorSelecionado = this.fornecedores.find(item => item.fornecedorId === this.veiculoToEdit.fornecedorId);
        this.getCalendarioFornecedor(this.veiculoToEdit);
      }
    }, res1 => {
      this.fornecedores = [];
      this.showFornecedores = true;
      this.snackBar.error(res1.error.message, 3500, 'X');
    });
  }

  private getFeriados(ano?: number, date?: number): void {
    const filtro = {
      ano: ano ? ano : null
    };

    this.feriadoService.getFeriados(filtro).subscribe(res => {

      // const parser = new DOMParser();
      // const xml = parser.parseFromString(res, 'text/xml');
      // const obj: any = this.ngxXml2jsonService.xmlToJson(xml);

      // const feriadosNacionais = obj.events.event.filter(item => item.type === 'Feriado Nacional');

      // feriadosNacionais.forEach(feriado => {
      //   this.feriados.push(feriado.date);
      // });

      /**
       * Converte formato da data
       * @param data Data no formato yyyy-mm-dd
       */
      let getDateFormat = (data) => {
        try {
          return moment(new Date(`${data} 00:00`)).format('DD/MM/YYYY');
        } catch (err) {
          return null;
        }
      }

      const feriadosNacionais = res.data.data.filter((item) => { return item.feriadoNacional; });

      feriadosNacionais.forEach(feriado => {
        this.feriados.push(getDateFormat(feriado.data));
      });

      if (
        date &&
        (new Date(date).getDay() === 0 || new Date(date).getDay() === 6) ||
        this.feriados.includes(moment(date).format('DD/MM/YYYY'))
      ) {
        const message = this.translateService.instant('PORTAL.MANUTENCAO.MESSAGE.DIA_UTIL');
        this.snackBar.open(this.translateService.instant(message.replace('{0}', Util.formataData(date))), 3500, 'X');
        this.dataEvento.setValue(null);
        this.horario.setValue(null);

        if (this.modalRetiradaConfirm) {
          this.modalRetiradaConfirm.close();
        }
      }
    });
  }

  private getPlacaSelecionada(): string {
    if (this.filtroFornecedor.get('placa').value) {
      if (typeof this.filtroFornecedor.get('placa').value === 'string') {
        return this.filtroFornecedor.get('placa').value;
      } else {
        return this.filtroFornecedor.get('placa').value.placa;
      }
    }
  }

  private getVeiculos(eventTable?: number, paginar?: boolean): void {
    this.numPage = eventTable ? eventTable : this.numPage;

    const filtro = {
      clienteId: this.clienteId,
      situacao: this.filtroFornecedor.get('tipo').value ? this.filtroFornecedor.get('tipo').value : this.tipo,
      modeloId: this.filtroFornecedor.get('modelo').value,
      paginar: typeof paginar === 'boolean' ? paginar : true,
      placa: this.veiculoToEdit ? this.veiculoToEdit.placa : this.getPlacaSelecionada(),
      numRows: 10,
      numPage: this.numPage
    };

    this.veiculoEntregaDevolucao.getAll(filtro).subscribe(res => {
      if (filtro.paginar) {
        this.veiculos = res.data.results.map(item => {
          item.checkbox = true;

          if (item.telefone) {
            item.telefone = Util.formataTelefone(Util.removeSpecialCharacters(item.telefone));
          }
          if (this.veiculosSelecionados.length > 0) {
            const idx = this.veiculosSelecionados.findIndex(veiculo => veiculo.veiculoId === item.veiculoId);

            if (idx !== -1) {
              item = this.veiculosSelecionados[idx];
            }
          }

          return item;
        });

        // if (this.veiculos.some(veiculo => veiculo.data)) {
        //   if (this.isDevolucao) {
        //     this.getFornecedores();
        //   }
        // }

        if (this.veiculoToEdit) {
          this.veiculoToEdit.selected = true;
          this.veiculoToEdit.checkReadOnly = true;

          if (this.isEditar && !this.isZeroKM) {
            this.veiculoToEdit.checkbox = true;

            this.veiculoToEdit.nomeFantasia = this.veiculoToEdit.fornecedor;
            this.veiculoToEdit.endereco = this.veiculoToEdit.logradouro;

            this.veiculos.push(this.veiculoToEdit);
            this.fornecedores.push(this.veiculoToEdit);
          }

          if (this.isDevolucao) {
            this.getFornecedores();
          } else {
            if (this.veiculosSelecionados.findIndex(veiculo => veiculo.veiculoId === this.veiculoToEdit.veiculoId) === -1) {
              this.veiculosSelecionados.push(this.veiculoToEdit);
            }

            if (this.isZeroKM) {
              //this.veiculoToEdit.logradouro = this.veiculos[0].logradouro;
              //this.veiculoToEdit.veiculoId = this.veiculos[0].veiculoId;
              this.veiculos = [];
              this.veiculosSelecionados = [];
              this.veiculos.push(this.veiculoToEdit);
              this.veiculosSelecionados.push(this.veiculoToEdit);
            }

            this.showCalendar = true;

            if (this.veiculoToEdit.data) {
              this.dataEvento.setValue(this.veiculoToEdit.data.split(' ')[0]);
              this.horario.setValue(this.veiculoToEdit.data.split(' ')[1].substring(0, 5));
            }
          }

          const idxEdit = this.veiculos.findIndex(veiculo => veiculo.veiculoId === this.veiculoToEdit.veiculoId);

          if (idxEdit !== -1) {
            this.veiculos[idxEdit] = this.veiculoToEdit;
          }
        }

        this.totalRowsVeiculos = res.data.totalRows;
        this.showVeiculos = true;

        return;
      }

      this.veiculosFiltro = {
        filteredData: res.data.results,
        data: res.data.results
      };
    }, res => {
      if (filtro.paginar) {
        this.veiculos = [];
        this.showVeiculos = true;
      }
      this.snackBar.error(res.error.message, 3500, 'X');
    });
  }

  getColunasTabelaVeiculo(): ColunasTabelaMV[] {

    const colunas: ColunasTabelaMV[] = [];

    colunas.push(
      {
        description: '',
        columnDef: 'checkbox',
        checkbox: true, style: {
          minWidth: 35,
          maxWidth: 35
        },
        checkConfig: {
          function: this.checkboxVeiculos.bind(this)
        }
      });

    if (this.isZeroKM) {
      colunas.push({
        description: this.translateService.instant('PORTAL.LABELS.LBL_CONDUTOR'),
        columnDef: 'condutor',
        style: { minWidth: 80 }
      });
    }

    colunas.push(
      { description: this.translateService.instant('PORTAL.LABELS.LBL_PLACA'), columnDef: 'placa', style: { minWidth: 80, maxWidth: 80 } },
      { description: this.translateService.instant('PORTAL.LABELS.LBL_SITUACAO'), columnDef: 'situacao', style: { minWidth: 80, maxWidth: 80 } },
      { description: this.translateService.instant('PORTAL.MODAL_FORNECEDOR_AGENDAR.LABELS.FORNECEDOR'), columnDef: 'fornecedor', style: { minWidth: 90 } },
      { description: this.translateService.instant('PORTAL.MODAL_FORNECEDOR_AGENDAR.LABELS.LOGRADOURO'), columnDef: 'logradouro', style: { minWidth: 90 } },
      { description: this.translateService.instant('PORTAL.MODAL_FORNECEDOR_AGENDAR.LABELS.TELEFONE'), columnDef: 'telefone', style: { minWidth: 80 } },
      { description: this.translateService.instant('PORTAL.MODAL_FORNECEDOR_AGENDAR.LABELS.DATA'), columnDef: 'data', style: { minWidth: 80 } }
    );

    return colunas;
  }

  getColunasTabelaFornecedor(): ColunasTabelaMV[] {
    const colunas: ColunasTabelaMV[] = [
      {
        description: null,
        columnDef: 'checkbox',
        checkbox: true,
        style: {
          minWidth: 35,
          maxWidth: 35
        },
        checkConfig: {
          function: this.checkboxFornecedor.bind(this)
        }
      },
      { description: this.translateService.instant('PORTAL.MODAL_FORNECEDOR_AGENDAR.LABELS.FORNECEDOR'), columnDef: 'nomeFantasia', style: { minWidth: 80 } },
      { description: this.translateService.instant('PORTAL.MODAL_FORNECEDOR_AGENDAR.LABELS.TELEFONE'), columnDef: 'telefone', style: { minWidth: 80 } },
      { description: this.translateService.instant('PORTAL.MODAL_FORNECEDOR_AGENDAR.LABELS.ENDERECO'), columnDef: 'endereco', style: { minWidth: 90 } },
      {
        description: this.translateService.instant('PORTAL.MODAL_FORNECEDOR_AGENDAR.LABELS.VAGAS_DISPONIVEIS'),
        columnDef: 'quantidadeVagasEntregaDevolucao',
        style: {
          minWidth: 80
        }
      }
    ];

    return colunas;
  }

  private checkboxVeiculos(value: any): void {
    const idx = this.veiculos.findIndex(item => item.veiculoId === value.veiculoId);

    if (this.veiculosSelecionados.findIndex(item => item.veiculoId === value.veiculoId) !== -1) {
      this.veiculosSelecionados.splice(this.veiculosSelecionados.findIndex(item => item.veiculoId === value.veiculoId), 1);

      this.showFornecedores = this.veiculos.some(item1 => item1.selected === true);

      if (this.veiculosSelecionados.length === 0) {
        this.showFornecedores = false;
        this.showCalendar = false;
        this.fornecedorSelecionado = null;
      }

      if (this.isDevolucao || value.situacao === 'Devolucao') {
        this.veiculos[idx].fornecedor = null;
        this.veiculos[idx].telefone = null;
        this.veiculos[idx].logradouro = null;
        this.veiculos[idx].fornecedorId = null;
      }
      this.veiculos[idx].data = null;

      this.veiculos[idx].selected = false;

      setTimeout(() => {
        this.veiculosTable['genericTable']._forceRenderDataRows();
      });

      return;
    }

    // Regra se contrato ainda nao tem data de fechamento
    if (value.situacao === 'Devolucao' && !value.dataFechamentoContrato) {
      const conteudoModal: DadosModalMV = {
        titulo: 'PORTAL.LABELS.LBL_ALERT',
        conteudo: '',
        modalMensagem: true,
        dados: []
      };

      this.dadosModalService.set(conteudoModal);

      const modalConfirm = this.modalService.open(ModalConfirmComponent);

      modalConfirm.componentInstance.mensagem = 'PORTAL.AGENDAR_ENTREGA_DEVOLUCAO.MESSAGES.CONTRATO_PENDENTE_VENCIMENTO_CONFIRM';
      modalConfirm.componentInstance.botaoSecundario = 'PORTAL.BTN_NAO';
      modalConfirm.componentInstance.botaoPrimario = 'PORTAL.BTN_SIM';

      modalConfirm.result.then(result => {
        this.dadosModalService.set(null);

        if (result) {
          this.veiculos[idx].tableIdx = idx;
          this.veiculos[idx].selected = !this.veiculos[idx].selected;

          this.veiculosSelecionados.push(value);

          this.validarVeiculosSelecionado();
        } else {
          this.veiculos[idx].selected = false;
        }

        setTimeout(() => {
          this.veiculosTable['genericTable']._forceRenderDataRows();
        });
      });
    } else {
      this.veiculos[idx].tableIdx = idx;
      this.veiculos[idx].selected = !this.veiculos[idx].selected;

      this.veiculosSelecionados.push(value);

      this.validarVeiculosSelecionado();
    }
  }

  private validarVeiculosSelecionado(): void {
    this.showFornecedores = this.veiculos.some(item1 => item1.selected === true);

    if (!this.isDevolucao) {
      this.showCalendar = true;
      if (!this.feriados || this.feriados.length === 0) {
        this.getFeriados();
      }
    } else {
      if (this.searchFornecedores) {
        this.searchFornecedores = false;
        this.getFornecedores();
      }

      if (this.fornecedorSelecionado && Object.keys(this.fornecedorSelecionado).length > 0) {
        const veiculos = this.veiculosSelecionados;
        const qtdVeiculosSelecionados = veiculos.length;

        if (this.fornecedorSelecionado.quantidadeVagasEntregaDevolucao) {
          if (qtdVeiculosSelecionados > this.fornecedorSelecionado.quantidadeVagasEntregaDevolucao) {
            this.snackBar.open(
              this.translateService.instant('PORTAL.AGENDAR_ENTREGA_DEVOLUCAO.MESSAGES.INDISPONIBILIDADE_FORNECEDOR'), 10000, 'X'
            );
          }
        }
      }
    }
  }

  private checkboxFornecedor(value: any): void {
    if (this.fornecedorSelecionado) {
      if (this.fornecedorSelecionado.fornecedorId === value.fornecedorId) {
        this.fornecedorSelecionado = null;
      } else {
        const index = this.fornecedores.findIndex(item => item.fornecedorId === this.fornecedorSelecionado.fornecedorId);
        const indexSelecionado = this.fornecedores.findIndex(item => item.fornecedorId === value.fornecedorId);

        if (index !== -1) {
          this.fornecedores[index].selected = false;
          this.fornecedorSelecionado = value;
          this.fornecedores[indexSelecionado].selected = true;

          this.fornecedoresTable['genericTable']._forceRenderDataRows();
        }
      }
    } else {
      this.fornecedorSelecionado = value;
    }

    if (this.fornecedorSelecionado && Object.keys(this.fornecedorSelecionado).length > 0) {
      const veiculos = this.veiculosSelecionados;
      const qtdVeiculosSelecionados = veiculos.length;

      if (this.fornecedorSelecionado.quantidadeVagasEntregaDevolucao) {
        if (qtdVeiculosSelecionados > this.fornecedorSelecionado.quantidadeVagasEntregaDevolucao) {
          this.snackBar.open(
            this.translateService.instant('PORTAL.AGENDAR_ENTREGA_DEVOLUCAO.MESSAGES.INDISPONIBILIDADE_FORNECEDOR'), 10000, 'X'
          );
        }
      }

      this.showCalendar = false;
      this.getCalendarioFornecedor(value);
    } else {
      this.showCalendar = false;
    }
  }

  private getCalendarioFornecedor(fornecedor: any): void {
    this.fornecedorService.getDadosCalendario(fornecedor.fornecedorId).subscribe(res => {
      this.dadosCalendario = res.data.results;

      this.datas = this.dadosCalendario.map(item => {
        return moment(new Date(Util.removerTimezone(item.data))).format('DD/MM/YYYY');
      });

      if (this.veiculoToEdit) {
        if (this.veiculoToEdit.dataTimestamp) {
          this.dataEvento.setValue(Util.formataData(this.veiculoToEdit.dataTimestamp.value, 'DD/MM/YYYY'));
          this.horario.setValue(Util.formataData(this.veiculoToEdit.dataTimestamp.value, 'HH:mm'));
        }
      }

      this.showCalendar = true;
    }, res => {
      this.snackBar.error(res.error.message, 3500, 'X');
    });
  }

  limparPesquisa(): void {
    this.filtroFornecedor.reset();
    this.filtroFornecedor.setErrors(null);

    if (this.tipo === 'A') {
      this.filtroFornecedor.get('situacao').setValue(this.tipo);
    }

    this.pesquisar();
  }

  getCalendario(): any[] {
    return this.dadosCalendario;
  }

  pesquisar(): void {
    this.showFornecedores = false;
    this.showVeiculos = false;
    this.showCalendar = false;

    this.getVeiculos();
  }

  dadosDia(event: any): void {
    if (this.validarDataSelecionada(event, false)) {
      this.preencherDatas(event);
    }
  }

  dadosEvento(event: any): void {
    if (this.validarDataSelecionada(event, false)) {
      this.preencherDatas(event);
    }
  }

  closeModal() {
    this.veiculoToEdit = null;

    this.closeModalWithValues(this.veiculosSelecionados.filter(item => item.confirmado), this.isDevolucao ? this.fornecedorSelecionado : null);
  }

  private validarDataSelecionada(obj: any, validarHora: boolean): boolean {
    let dataSelecionada = obj ? this.converterData(obj.start || obj.date || obj.target.value) : 0;
    this.isSelectedToday = false;

    if (
      this.feriados.filter(item => item.includes(new Date(dataSelecionada).getFullYear())).length === 0 &&
      new Date(dataSelecionada).getFullYear() > new Date().getFullYear() ||
      new Date(dataSelecionada).getFullYear() < new Date().getFullYear() &&
      !validarHora
    ) {
      this.getFeriados(new Date(dataSelecionada).getFullYear(), new Date(dataSelecionada).getTime());

      return;
    }

    if (!this.horario.value) {
      this.horario.setValue('08:00');
    }

    if (Util.formataData(new Date(dataSelecionada).getTime(), 'DD/MM/YYYY') === Util.formataData(new Date().getTime(), 'DD/MM/YYYY')) {
      this.isSelectedToday = true;
      this.horario.setValue(`
        ${new Date().getHours() < 10 ? '0' + new Date().getHours() : new Date().getHours()}:
        ${new Date().getMinutes() < 10 ? '0' + new Date().getMinutes() : new Date().getMinutes()}
      `);
    }

    let time = this.horario.value || '';
    if (time.length === 4) {
      time = time.substring(0, 2) + ':' + time.substring(2, 4);
    }

    if (this.isDevolucao && (!this.fornecedorSelecionado || Object.keys(this.fornecedorSelecionado).length === 0)) {
      this.snackBar.open(this.translateService.instant('PORTAL.ATENDIMENTO.MESSAGES.FORNECEDOR_NAO_SELECIONADO'), 7000, 'X');
      return false;
    }

    if (dataSelecionada > 0 && validarHora) {
      const dateTime = new Date(dataSelecionada);
      dataSelecionada = moment(dateTime)
        .hours(time.split(':')[0])
        .minutes(time.split(':')[1])
        .seconds(0)
        .milliseconds(0)
        .toDate().getTime();
    }

    let hoje = new Date() as any;

    if (validarHora) {
      hoje = hoje.setSeconds(0, 0);
    } else {
      hoje = hoje.setHours(0, 0, 0, 0);
    }

    if (dataSelecionada < hoje) {
      this.snackBar.open(this.translateService.instant('PORTAL.CALENDARIO.MESSAGES.DATA_RETROATIVA'), 3500, 'X');
      this.dataEvento.setValue(null);
      this.horario.setValue(null);
      return false;
    }

    if (
      (new Date(dataSelecionada).getDay() === 0 || new Date(dataSelecionada).getDay() === 6) ||
      this.feriados.includes(moment(dataSelecionada).format('DD/MM/YYYY'))
    ) {
      const message = this.translateService.instant('PORTAL.MANUTENCAO.MESSAGE.DIA_UTIL');
      this.snackBar.open(this.translateService.instant(message.replace('{0}', Util.formataData(obj.date))), 3500, 'X');
      this.dataEvento.setValue(null);
      this.horario.setValue(null);
      return false;
    }

    if (this.isDevolucao && !this.datas.includes(moment(dataSelecionada).format('DD/MM/YYYY')) && !validarHora) {
      this.veiculosIndisponibilidade = this.veiculos.filter(item => item.selected);
      this.snackBar.open(
        this.translateService.instant('PORTAL.AGENDAR_ENTREGA_DEVOLUCAO.MESSAGES.INDISPONIBILIDADE_FORNECEDOR'), 10000, 'X'
      );
    }

    if (!this.isDevolucao && !validarHora) {
      if (this.veiculosSelecionados.length > 0) {
        this.veiculosSelecionados.forEach(item => {
          if (!item.data && item.dataAvisoDisponibilidade) {
            if (this.getDiasUteis(moment(item.dataAvisoDisponibilidade.replace('Z', '')), moment(dataSelecionada)) > 2) {
              const existeVeiculo = this.veiculosAvisoDisponibilidade.findIndex(item1 => item1 === item);

              if (existeVeiculo === -1) {
                item.dataAvisoDisponibilidade = Util.formataData(
                  this.converterData(new Date(item.dataAvisoDisponibilidade)).getTime(), 'DD/MM/YYYY'
                );

                this.veiculosAvisoDisponibilidade.push(item);
              }
            }
          }
        });
      }

      if (this.veiculosAvisoDisponibilidade.length > 0) {
        const conteudoModal: DadosModalMV = {
          titulo: 'PORTAL.LABELS.LBL_ALERT',
          conteudo: '',
          modalMensagem: true,
          dados: []
        };

        this.dadosModalService.set(conteudoModal);

        this.modalRetiradaConfirm = this.modalService.open(ModalAvisoRetiradaComponent);


        this.modalRetiradaConfirm.componentInstance.veiculosAvisoDisponibilidade = this.veiculosAvisoDisponibilidade;
        this.modalRetiradaConfirm.componentInstance.mensagem = 'PORTAL.AGENDAR_ENTREGA_DEVOLUCAO.MESSAGES.AVISO_PRAZO_RETIRADA_CONFIRM';
        this.modalRetiradaConfirm.componentInstance.botaoSecundario = 'PORTAL.BTN_NAO';
        this.modalRetiradaConfirm.componentInstance.botaoPrimario = 'PORTAL.BTN_SIM';

        this.modalRetiradaConfirm.result.then(result => {
          this.dadosModalService.set(null);

          if (!result) {
            this.dataEvento.setValue(null);
            this.horario.setValue(null);
          } else {
            this.veiculosAvisoDisponibilidade = [];
          }
        });
      }
    }

    return true;
  }

  private preencherDatas(event: any): void {
    let date = event.start || event.date || event.target.value;

    if (!date) {
      return;
    }

    date = this.converterData(date);

    this.dataEvento.setValue(Util.formataData(date, 'DD/MM/YYYY'));

    date = moment(date)
      .hours(this.horario.value.substring(0, 2))
      .minutes(this.horario.value.substr(2))
      .seconds(0)
      .milliseconds(0)
      .toDate().getTime();

    this.dataEventoTimestamp.setValue(date);
  }

  private converterData(date: any): any {
    date = date.toISOString().split('-');
    date[2] = date[2].includes('T') ? date[2].split('T')[0] : date[2];
    return new Date(date[0], (Number(date[1]) - 1), date[2]);
  }

  changeHora(event: any): void {
    if (event.target.value && event.target.value.length === 5) {
      let horaSinistro = event.target.value;
      horaSinistro = horaSinistro.split(':');

      if (this.isSelectedToday) {
        if (Number(horaSinistro[0]) < new Date().getHours() || (Number(horaSinistro[0]) <= new Date().getHours() && Number(horaSinistro[1]) < new Date().getMinutes())) {
          this.horario.setValue(null);
          this.snackBar.open(this.translateService.instant('PORTAL.MSG_HORA_INVALIDA'), 3500, 'X');
        }
      }
      if (Number(horaSinistro[0]) < 8 || (Number(horaSinistro[0]) > 18 || (Number(horaSinistro[0]) >= 18 && Number(horaSinistro[1]) > 0))) {
        this.horario.setValue(null);
        this.snackBar.open(this.translateService.instant('PORTAL.MSG_HORA_INVALIDA'), 3500, 'X');
      }

      this.horario.setErrors(null);
      this.horario.updateValueAndValidity();
    } else if (event.type === 'change') {
      this.horario.setValue(null);
      this.snackBar.open(this.translateService.instant('PORTAL.MSG_HORA_INVALIDA'), 3500, 'X');
    }
  }

  filtrarPlaca(): void {
    let filter = this.filtroFornecedor.get('placa').value;
    filter = filter.placa || filter;

    if (filter) {
      filter = filter.toUpperCase();
      this.veiculosFiltro.filteredData = this.veiculosFiltro.data.filter(item => item.placa.includes(filter));
    } else {
      this.veiculosFiltro.filteredData = this.veiculosFiltro.data;
    }
  }

  displayPlaca(veiculo: any): string {
    if (veiculo) {
      return veiculo['placa'];
    }
  }

  validarCamposSelecionados(): void {
    if (this.tipo === 'A') {
      if (
        this.veiculosSelecionados.filter(item => item.situacao === 'Devolucao').length >
        this.veiculosSelecionados.filter(item => item.situacao === 'Disponível para Agendamento').length
      ) {
        this.snackBar.open('Favor selecionar um veiculo para Entrega.', 7000, 'X');
        return;
      }
      if (
        this.veiculosSelecionados.filter(item => item.situacao === 'Disponível para Agendamento').length >
        this.veiculosSelecionados.filter(item => item.situacao === 'Devolucao').length
      ) {
        this.snackBar.open('Favor selecionar um veiculo para Devolução.', 7000, 'X');
        return;
      }
    }
    if (!this.dataEvento.valid || !this.horario.valid) {
      this.dataEvento.setErrors({ incorrect: true });
      this.horario.setErrors({ incorrect: true });

      this.snackBar.open(this.translateService.instant('PORTAL.MSG_CAMPO_OBRIGATORIO'), 7000, 'X');
      return;
    }

    setTimeout(() => {
      const idxVeiculos = [];
      const fornecedor = this.fornecedorSelecionado;
      const veiculos = this.veiculosSelecionados.filter(item => !item.data);

      let alertaIndisponibilidade = false;
      let alertaContrato = false;

      if (this.isDevolucao) {
        if (fornecedor.quantidadeVagasEntregaDevolucao) {
          alertaIndisponibilidade = veiculos.length > fornecedor.quantidadeVagasEntregaDevolucao;
        }

        this.fornecedores[this.fornecedores.findIndex(forn => forn === this.fornecedorSelecionado)] = fornecedor;
      }

      if (this.veiculoToEdit) {
        if (this.isDevolucao) {
          this.veiculoToEdit.fornecedor = fornecedor.nomeFantasia;
          this.veiculoToEdit.telefone = fornecedor.telefone ? Util.formataTelefone(Util.removeSpecialCharacters(fornecedor.telefone)) : null;
          this.veiculoToEdit.logradouro = fornecedor.endereco;
          this.veiculoToEdit.fornecedorId = fornecedor.fornecedorId;
        }
        this.veiculoToEdit.data = `${this.dataEvento.value} ${Util.formatarHora(this.horario.value)}`;
      } else {
        veiculos.forEach(veiculo => {
          if (this.isDevolucao) {
            veiculo.fornecedor = fornecedor.nomeFantasia;
            veiculo.telefone = Util.formataTelefone(Util.removeSpecialCharacters(fornecedor.telefone));
            veiculo.logradouro = fornecedor.endereco;
            veiculo.fornecedorId = fornecedor.fornecedorId;

            alertaContrato = !veiculo.dataFechamentoContrato;

            if (alertaContrato) {
              veiculo.mensagem = this.translateService.instant(
                'PORTAL.AGENDAR_ENTREGA_DEVOLUCAO.MESSAGES.CONTRATO_PENDENTE_VENCIMENTO_TABLE'
              );
            } else if (this.veiculosIndisponibilidade.findIndex(itemVeiculo => itemVeiculo.veiculoId === veiculo.veiculoId) !== -1) {
              veiculo.mensagem = this.translateService.instant('PORTAL.AGENDAR_ENTREGA_DEVOLUCAO.MESSAGES.INDISPONIBILIDADE_FORNECEDOR');
            }
          } else if (this.tipo === 'A') {
            if (veiculo.situacao === 'Devolucao' && this.veiculosSelecionados.findIndex(item => item.situacao === 'Disponível para Agendamento') !== -1) {
              const veiculoFornecedor = this.veiculosSelecionados[this.veiculosSelecionados.findIndex(item => item.situacao === 'Disponível para Agendamento')];

              veiculo.fornecedor = veiculoFornecedor.fornecedor;
              veiculo.telefone = veiculoFornecedor.telefone ? Util.formataTelefone(Util.removeSpecialCharacters(veiculoFornecedor.telefone)) : null;
              veiculo.logradouro = veiculoFornecedor.logradouro;
              veiculo.fornecedorId = veiculoFornecedor.fornecedorId || null;
            }
          }

          veiculo.data = `${this.dataEvento.value} ${Util.formatarHora(this.horario.value)}`;
          idxVeiculos.push(veiculo.tableIdx);
        });

        idxVeiculos.forEach(veiculoEntregaIdx => {
          this.veiculos[veiculoEntregaIdx] = veiculos.find(veiculoEditado => veiculoEditado.tableIdx === veiculoEntregaIdx);
          this.veiculos[veiculoEntregaIdx].selected = !this.veiculos[veiculoEntregaIdx].selected;
          this.veiculos[veiculoEntregaIdx].confirmado = true;
        });
      }

      this.datas = [];
      this.veiculosIndisponibilidade = [];

      this.dataEvento.reset();
      this.horario.reset();

      this.ultimoFornecedorSelecionado = this.fornecedorSelecionado;
      this.fornecedorSelecionado = null;

      this.veiculosTable['genericTable']._forceRenderDataRows();

      if (this.isDevolucao) {
        this.fornecedoresTable['genericTable']._forceRenderDataRows();
      }

      this.showFornecedores = this.veiculoToEdit && Object.keys(this.veiculoToEdit).length > 0;
      this.showCalendar = this.veiculoToEdit && Object.keys(this.veiculoToEdit).length > 0;
    });
  }

  cancelar(): void {
    this.activeModal.close();
  }

  salvarFornecedorSelecionado(): void {
    const veiculosSelecionados = this.veiculosSelecionados;

    if (veiculosSelecionados.length === 0) {
      this.snackBar.open('Selecione veiculo(s) para realizar o agendamento.', 7000, 'X');
      return;
    }
    if (this.isDevolucao) {
      if (
        veiculosSelecionados.length > 0 &&
        veiculosSelecionados.filter(item => !!item.fornecedorId).length === 0 && !this.fornecedorSelecionado
      ) {
        this.snackBar.open('Selecione um fornecedor para realizar o agendamento.', 7000, 'X');
        return;
      }
      if ((veiculosSelecionados.length > 0 && this.fornecedorSelecionado) && (!this.dataEvento.value || !this.horario.value)) {
        this.snackBar.open('Selecione uma data para devolução do(s) veículo(s).', 7000, 'X');
        return;
      }
    } else if (this.tipo === 'A') {
      if (
        veiculosSelecionados.filter(item => item.situacao === 'Devolucao').length >
        veiculosSelecionados.filter(item => item.situacao === 'Disponível para Agendamento').length
      ) {
        this.snackBar.open('Favor selecionar um veiculo para Entrega.', 7000, 'X');
        return;
      }
      if (
        veiculosSelecionados.filter(item => item.situacao === 'Disponível para Agendamento').length >
        veiculosSelecionados.filter(item => item.situacao === 'Devolucao').length
      ) {
        this.snackBar.open('Favor selecionar um veiculo para Devolução.', 7000, 'X');
        return;
      }
    }

    let fornecedor;

    if (this.veiculosSelecionados.some(item => !item.data)) {
      this.snackBar.open('Favor selecionar Previsão Parada do(s) veículo(s).', 7000, 'X');
      return;
    }

    if (this.isDevolucao) {
      fornecedor = this.ultimoFornecedorSelecionado;
      this.closeModalWithValues(veiculosSelecionados, fornecedor);
    } else {
      this.closeModalWithValues(veiculosSelecionados, fornecedor, this.isZeroKM);
    }
  }

  private closeModalWithValues(veiculos: any, fornecedor?: any, statusVeiculo?: any): void {
    veiculos.forEach(veiculo => {
      veiculo.dataTimestamp = this.dataEventoTimestamp;
      veiculo.entrega = veiculo.situacao === 'Disponível para Agendamento';
      veiculo.cep = fornecedor ? fornecedor.cep : null;
      veiculo.estado = fornecedor ? fornecedor.estado : null;
      veiculo.tipo = veiculo.entrega ? 'E' : 'D';
      veiculo.statusVeiculo = statusVeiculo;
    });

    this.activeModal.close(veiculos);
  }

  private getDiasUteis(d1: any, d2: any): number {
    const days = d2.diff(d1, 'days') + 1;
    let newDay: any = d1,
      workingDays = 0,
      sundays = 0,
      saturdays = 0;

    for (let i = 0; i <= days; i++) {
      const day = new Date(newDay).getDay();
      newDay = d1.add(1, 'days').toDate();
      const isWeekend = ((day % 6) === 0);
      if (!isWeekend) {
        workingDays++;
      } else {
        if (day === 6) {
          saturdays++;
        }
        if (day === 0) {
          sundays++;
        }
      }
    }

    return workingDays - 1;
  }

  adicionarCondutor() {

    const idx = this.veiculos.findIndex(item => item.selected === true);

    this.veiculos[idx].condutor = this.filtroCondutor.get('condutor').value;

    setTimeout(() => {
      this.veiculosTable['genericTable']._forceRenderDataRows();
    });

  }

  ngOnDestroy(): void {
    this.veiculoToEdit = null;
    this.veiculosModelos = [];
    this.veiculosSelecionados = [];
    this.veiculosFiltro = {
      data: [],
      filteredData: []
    };
    this.veiculoSelecionadoTable = [];
  }
}
