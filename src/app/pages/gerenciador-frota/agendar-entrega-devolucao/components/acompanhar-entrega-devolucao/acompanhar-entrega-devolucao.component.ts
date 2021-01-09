import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatMenu } from '@angular/material';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import { AuthService } from 'src/app/core/services/auth.service';
import { CentroCustoService } from 'src/app/core/services/centro-custo.service';
import { ClientesService } from 'src/app/core/services/cliente.service';
import { DadosModalService } from 'src/app/core/services/dados-modal.service';
import { EntregaDevolucaoService } from 'src/app/core/services/entrega-devolucao.service';
import { RegionalService } from 'src/app/core/services/regionais.service';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';
import { UserContextService } from 'src/app/core/services/user-context.service';
import { VeiculoService } from 'src/app/core/services/veiculos.service';
import {
  ModalDetalhesFornecedorComponent,
} from 'src/app/shared/components/modal-detalhes-fornecedor/modal-detalhes-fornecedor.component';
import { ColunasTabelaMV } from 'src/app/shared/interfaces/colunas-tabela.model';
import { ModalDateMV } from 'src/app/shared/interfaces/modal-date.model';
import { PermissoesAcessoMV } from 'src/app/shared/interfaces/permissoes-acesso.model';
import { Util } from 'src/app/shared/util/utils';

@Component({
  selector: 'app-acompanhar-entrega-devolucao',
  templateUrl: './acompanhar-entrega-devolucao.component.html',
  styleUrls: ['./acompanhar-entrega-devolucao.component.scss']
})
export class AcompanharEntregaDevolucaoComponent implements OnInit {
  @ViewChild('dateTimeMenu') dateTimeMenu: MatMenu;

  form: FormGroup;
  now = new Date().toISOString();

  dadosTabela: any;

  filtro: any = {};

  clientes = [] as Array<any>;
  regionais = [] as Array<any>;
  centrosCustos = [] as Array<any>;
  veiculos = {
    data: [] as Array<any>,
    filteredData: [] as Array<any>
  };
  grupoVeiculos = {
    data: [] as Array<any>,
    filteredPlaca: [] as Array<any>
  };
  motivos = [
    {
      id: 'E',
      descricao: 'Receber 0Km'
    },
    {
      id: 'D',
      descricao: 'Devolver Usado'
    }
  ];
  situacoes = [
    {
      id: 'A',
      descricao: 'Todos'
    },
    {
      id: 'G',
      descricao: 'Agendados'
    },
    {
      id: 'T',
      descricao: 'Não Agendado'
    }
  ];

  isEdition: any;

  numPage = 1;
  numRows = 20;
  totalRows = 0;

  showTable: boolean;
  paginar = true;
  disablePlaca = true;

  modalDateParams: ModalDateMV;

  constructor(
    private userContextService: UserContextService,
    private formBuilder: FormBuilder,
    private clientesService: ClientesService,
    private veiculoService: VeiculoService,
    private snackBarService: SnackBarService,
    private translateService: TranslateService,
    private entregaDevolucaoService: EntregaDevolucaoService,
    private router: Router,
    private regionalService: RegionalService,
    private centroCustoService: CentroCustoService,
    private modalService: NgbModal,
    private dadosModal: DadosModalService
  ) { }

  ngOnInit() {
    this.createForm();

    this.modalDateParams = {
      campoPeriodo: this.form.get('periodo'),
      campoDataInicio: this.form.get('dataInicio'),
      campoDataFim: this.form.get('dataFim'),
      matMenu: this.dateTimeMenu
    };
  }

  createForm() {
    this.form = this.formBuilder.group({
      'clientes': ['', Validators.compose([])],
      'clientesId': ['', Validators.compose([])],
      'dataInicio': ['', Validators.compose([])],
      'dataFim': ['', Validators.compose([])],
      'placa': ['', Validators.compose([])],
      'periodo': ['', Validators.compose([])],
      'situacao': ['', Validators.compose([])],
      'tipo': ['', Validators.compose([])],
      'centrosCustos': ['', Validators.compose([])],
      'centrosCustoId': ['', Validators.compose([])],
      'regionais': ['', Validators.compose([])],
      'regionaisId': ['', Validators.compose([])]
    });

    this.form.get('placa').disable();
    this.form.valueChanges.subscribe(values => {
      this.disablePlaca = Util.validarAgrupadores(values);

      if (this.disablePlaca) {
        this.form.get('placa').disable({
          emitEvent: false
        });
      } else {
        this.form.get('placa').enable({
          emitEvent: false
        });
      }
    });
  }

  carregarCombos(): void {
    this.clientesService.getClienteCondutor(Number(this.userContextService.getDados().condutorId)).subscribe(res => {
      this.clientes = res.data.results;
      this.clientes.unshift({
        id: 0,
        nomeFantasia: 'Todos(as)',
        selecionado: false
      })

      if (this.entregaDevolucaoService.clienteSelecionado) {
        const cliente = this.clientes.find(item => item.clienteId === this.entregaDevolucaoService.clienteSelecionado);

        this.form.get('clientes').setValue([cliente]);

        this.pesquisar(1);

        this.getVeiculos(false);
      }

      this.regionalService.getAll({ grupoEconomicoId: Number(this.userContextService.getGrupoEconomicoId()) }).subscribe(res1 => {
        this.regionais = res1.data.results;
        this.regionais.unshift({
          id: 0,
          descricao: 'Todos(as)',
          selecionado: false
        })

        this.centroCustoService.getAll({ grupoEconomicoId: Number(this.userContextService.getGrupoEconomicoId()) }).subscribe(res2 => {
          this.centrosCustos = res2.data.results;
          this.centrosCustos.unshift({
            id: 0,
            descricao: 'Todos(as)',
            selecionado: false
          })
        }, res2 => {
          this.snackBarService.error(res2.error.message, 3500, 'X');
        });
      }, res1 => {
        this.snackBarService.error(res1.error.message, 3500, 'X');
      });
    }, res => {
      this.snackBarService.error(res.error.message, 3500, 'X');
    });
  }

  getVeiculos(event: any): void {
    if (['ctrl', 'alt', 'tab', 'capslock', 'shift', 'meta'].includes(event.key.toLowerCase())) {
      return;
    }
    if (event.target.value && event.target.value.length < 3) {
      return;
    }

    this.veiculoService.getAll(this.form.value).subscribe(res => {
      this.veiculos.data = res.data.results;
      this.veiculos.filteredData = res.data.results;
    }, res => {
      this.snackBarService.error(this.translateService.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  verificarClientesPlacas(event, cliente): void {
    if (event && !event.isUserInput) {
      return;
    }

    if (
      Array.isArray(this.form.get('clientes').value) &&
      this.form.get('clientes').value.some(item => item.clienteId === cliente.clienteId)
    ) {
      this.veiculos.data = this.veiculos.data.filter(element => element['clienteId'] !== cliente.clienteId);
      this.veiculos.filteredData = this.veiculos.data;

      if (this.veiculos.data.length === 0) {
        this.form.get('placa').disable();
      }
    }
  }

  validarAntesDataFim(): void {
    if (this.form.get('dataFim').value) {
      if (moment(this.form.get('dataFim').value).isBefore(this.form.get('dataInicio').value)) {
        this.form.get('dataFim').setValue(null);
        this.form.get('dataFim').setErrors(null);
      }
    }
  }

  displayPlaca(veiculo: any): string {
    if (veiculo) {
      return veiculo['placa'];
    }
  }

  pesquisar(eventTable?: any): void {
    if (!this.form.valid) {
      this.snackBarService.open(this.translateService.instant('PORTAL.MSG_CAMPO_OBRIGATORIO'), 7000, 'X');
      return;
    }

    this.numPage = eventTable || 1;

    this.filtro.clientesId = Util.getClientesId(this.form);
    this.filtro.regionaisId = Util.getRegionaisId(this.form);
    this.filtro.centrosCustoId = Util.getCentrosCustosId(this.form);
    this.filtro.tipo = this.form.get('tipo').value;
    // this.filtro.situacaoAgendamento = this.form.get('situacao').value === 'A' ? null : this.form.get('situacao').value;
    this.filtro.veiculoId = this.form.get('placa').value && this.form.get('placa').value.veiculoId ? this.form.get('placa').value.veiculoId : null;
    this.filtro.dataInicio = this.form.get('dataInicio').value ? new Date(this.form.get('dataInicio').value).getTime() : null;
    this.filtro.dataFim = this.form.get('dataFim').value ? new Date(this.form.get('dataFim').value).getTime() : null;

    this.filtro['paginar'] = this.paginar;
    this.filtro['numRows'] = this.numRows;
    this.filtro['numPage'] = this.numPage;

    if (this.filtro['placa']) {
      if (this.filtro['placa'].placa) {
        this.filtro['placa'] = this.filtro['placa'].placa;
      }
    }
    if (this.filtro['paginar'] && this.filtro['numPage'] === 1) {
      this.showTable = false;
    }

    if (_.isEmpty(this.filtro.clientesId) && _.isEmpty(this.filtro.regionaisId) && _.isEmpty(this.filtro.centrosCustoId)) {
      this.filtro.clientesId = Util.getClientesId(this.form, 'clientesDisponiveis');
    }

    this.entregaDevolucaoService.getAll(this.filtro).subscribe(res => {
      this.dadosTabela = res.data.results.map(value => {
        value.action = true;
        value.tipoId = value.tipo === 'Devolver Usado' ? 'D' : 'E';

        value.icones = [
          {
            function: this.goToEditar.bind(this),
            label: this.translateService.instant('PORTAL.LABELS.EDITAR'),
            info: false,
            show: this.getPermissao().alterar ? this.canEdit(value) : false,
            svg: 'pfu-edit'
          },
          {
            function: this.detalhesFornecedorAgendamento.bind(this),
            label: this.translateService.instant('PORTAL.LABELS.DETALHES_FORNECEDOR'),
            info: false,
            show: true,
            svg: 'pfu-detalhes-frota'
          }
        ];

        return value;
      });

      this.totalRows = res.data.totalRows;
      this.showTable = true;
    }, res => {
      this.dadosTabela = [];
      this.showTable = true;
      this.snackBarService.error(this.translateService.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  private detalhesFornecedorAgendamento(veiculo: any): void {
    const situacao: string = veiculo.tipo.toLowerCase().includes('devolver') ? 'D' : 'E';

    this.entregaDevolucaoService.get(veiculo.entidadeId, situacao).subscribe(res => {
      this.dadosModal.set(res.data.results[0]);
      this.modalService.open(ModalDetalhesFornecedorComponent);
    });
  }

  private canEdit(agendamento: any): boolean {
    const situacao = agendamento.situacao;

    return situacao === 'Atrasado' || situacao === 'Agendado' || situacao === 'Aguardando Aprovação' || situacao === 'Aprovado';
  }

  private goToEditar(agendamento: any): void {
    this.router.navigate([`gerenciador-frota/agendar-entrega-devolucao/${agendamento.entidadeId}/${agendamento.tipoId}`]);
  }

  getColunasTabela(): ColunasTabelaMV[] {
    const colunas: ColunasTabelaMV[] = [
      {
        description: this.translateService.instant('PORTAL.AGENDAR_ENTREGA_DEVOLUCAO.COLUMN.CLIENTE'),
        columnDef: 'cliente', style: {
          minWidth: 120
        }
      },
      {
        description: this.translateService.instant('PORTAL.AGENDAR_ENTREGA_DEVOLUCAO.COLUMN.PLACA'),
        columnDef: 'placa',
        style: {
          minWidth: 120
        }
      },
      {
        description: this.translateService.instant('PORTAL.AGENDAR_ENTREGA_DEVOLUCAO.COLUMN.FORNECEDOR'),
        columnDef: 'fornecedor',
        style: {
          minWidth: 110,
          maxWidth: 110
        }
      },
      {
        description: this.translateService.instant('PORTAL.AGENDAR_ENTREGA_DEVOLUCAO.COLUMN.SOLICITANTE'),
        columnDef: 'solicitante', style: {
          minWidth: 100,
          maxWidth: 100
        }
      },
      {
        description: this.translateService.instant('PORTAL.AGENDAR_ENTREGA_DEVOLUCAO.COLUMN.MOTIVO'),
        columnDef: 'tipo', style: {
          minWidth: 120
        }
      },
      {
        description: this.translateService.instant('PORTAL.AGENDAR_ENTREGA_DEVOLUCAO.COLUMN.DATA_AGENDAMENTO'),
        columnDef: 'dataHoraAgendamento', date: true, style: {
          minWidth: 120
        }
      },
      {
        description: this.translateService.instant('PORTAL.AGENDAR_ENTREGA_DEVOLUCAO.COLUMN.SITUACAO'),
        columnDef: 'situacao', style: {
          minWidth: 120
        }
      },
      {
        description: this.translateService.instant('PORTAL.AGENDAR_ENTREGA_DEVOLUCAO.COLUMN.ACOES'),
        columnDef: 'acoes', action: true, style: {
          minWidth: 80
        }
      }
    ];

    return colunas;
  }

  getPermissao(): PermissoesAcessoMV {
    return AuthService.getRouteRoles();
  }

  abrirFiltro(): void {
    this.form.get('dataInicio').setValue('');
    this.form.get('dataFim').setValue('');
  }

  limparCampos(): void {
    this.form.reset();
    this.form.get('clientes').reset();
    this.form.get('clientes').setErrors(null);
    this.form.get('placa').disable();
    this.form.setErrors(null);
    this.showTable = false;

    this.veiculos = {
      data: [],
      filteredData: []
    };

    this.form.get('placa').disable();
    this.entregaDevolucaoService.clienteSelecionado = null;
  }

  filtrarPlaca(): void {
    let placa = this.form.get('placa').value;
    placa = placa.placa || placa;
    if (placa) {
      placa = placa.toUpperCase();
      this.veiculos.filteredData = this.veiculos.data.filter(item => item.placa.includes(placa));
    } else {
      this.veiculos.filteredData = this.veiculos.data;
    }
  }

  goToNew(): void {
    this.entregaDevolucaoService.clienteSelecionado = Util.getClientesId(this.form)[0];

    this.router.navigateByUrl('gerenciador-frota/agendar-entrega-devolucao');
  }
  markAll(item, formControlName, arrayItens) {
    if (item.id != 0) {
      return;
    }

    if (item.id === 0 && !item.selecionado) {
      this.form.get(formControlName).setValue(arrayItens);
      item.selecionado = true;
    } else {
      this.form.get(formControlName).setValue([]);
      item.selecionado = false;
    }
  }
}
