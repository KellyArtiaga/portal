import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { debounceTime, startWith, tap } from 'rxjs/operators';
import { CentroCustoService } from 'src/app/core/services/centro-custo.service';
import { RegionalService } from 'src/app/core/services/regionais.service';
import { VeiculoReservaService } from 'src/app/core/services/veiculoreserva.service';

import { AuthService } from '../../../core/services/auth.service';
import { ClientesService } from '../../../core/services/cliente.service';
import { ConsultaCepService } from '../../../core/services/consulta-cep.service';
import { SnackBarService } from '../../../core/services/snack-bar.service';
import { UserContextService } from '../../../core/services/user-context.service';
import { VeiculoService } from '../../../core/services/veiculos.service';
import { ClienteCondutorMV } from '../../../shared/interfaces/cliente-condutor.model';
import { ColunasTabelaMV } from '../../../shared/interfaces/colunas-tabela.model';
import { PermissoesAcessoMV } from '../../../shared/interfaces/permissoes-acesso.model';
import { Util } from '../../../shared/util/utils';
import * as _ from 'lodash';

@Component({
  selector: 'app-acompanhar-veiculo-reserva',
  templateUrl: './acompanhar-veiculo-reserva.component.html',
  styleUrls: ['./acompanhar-veiculo-reserva.component.scss']
})
export class AcompanharVeiculoReservaComponent implements OnInit {

  filtro: FormGroup;
  veiculosReserva = [];

  ufs: any[] = [];
  status: any[] = [];
  clientes: any[] = [];
  filteredCidades = [];
  placas = {
    data: [],
    filteredPlacas: []
  };
  regionais = [] as Array<any>;
  centrosCustos = [] as Array<any>;

  showExport = false;

  paginar = true;
  showTable = false;

  totalRows: number;
  numPage = 1;
  numRows = 20;

  constructor(
    private router: Router,
    private translate: TranslateService,
    private snackBar: SnackBarService,
    private consultaCEP: ConsultaCepService,
    private userContext: UserContextService,
    private clienteService: ClientesService,
    private veiculoService: VeiculoService,
    private veiculoReservaService: VeiculoReservaService,
    private regionalService: RegionalService,
    private centroCustoService: CentroCustoService,
  ) { }

  ngOnInit() {
    this.criaFormFiltro();
    this.getClientes();
    this.getUFs();
    this.initListener();
  }

  private criaFormFiltro(): void {
    this.filtro = new FormGroup({
      clientes: new FormControl(''),
      placa: new FormControl(null),
      status: new FormControl(null),
      ufSolicitacao: new FormControl(null),
      cidadeSolicitacao: new FormControl(null),
      regionais: new FormControl(''),
      centrosCustos: new FormControl(''),
    });

    this.filtro.get('cidadeSolicitacao').disable();

    this.preencherComboStatus();
    this.carregarCombo();
  }

  preencherComboStatus() {
    this.status = [
      this.translate.instant('PORTAL.VEICULO_RESERVA.LABELS.STATUS_ITENS.AGUARDANDO_PARADA'),
      this.translate.instant('PORTAL.VEICULO_RESERVA.LABELS.STATUS_ITENS.DISPENSADO_CLIENTE'),
      this.translate.instant('PORTAL.VEICULO_RESERVA.LABELS.STATUS_ITENS.SEM_DIREITO_RESERVA'),
      this.translate.instant('PORTAL.VEICULO_RESERVA.LABELS.STATUS_ITENS.PENDENTE_RESERVA'),
      this.translate.instant('PORTAL.VEICULO_RESERVA.LABELS.STATUS_ITENS.DENTRO_PERIODO_MANUTENCAO'),
      this.translate.instant('PORTAL.VEICULO_RESERVA.LABELS.STATUS_ITENS.SUBSTITUICAO_TEMPORARIA'),
      this.translate.instant('PORTAL.VEICULO_RESERVA.LABELS.STATUS_ITENS.PENDENTE_DESTROCA'),
      this.translate.instant('PORTAL.VEICULO_RESERVA.LABELS.STATUS_ITENS.DESTROCADO'),
      this.translate.instant('PORTAL.VEICULO_RESERVA.LABELS.STATUS_ITENS.SUBSTITUICAO_DEFINITVA'),
      this.translate.instant('PORTAL.VEICULO_RESERVA.LABELS.STATUS_ITENS.VEICULO_ENTREGUE')
    ];
  }

  carregarCombo(): void {
    this.regionalService.getAll({ grupoEconomicoId: Number(this.userContext.getGrupoEconomicoId()) }).subscribe(res1 => {

      const todos = {
        id: 0,
        descricao: 'Todos',
        selecionado: false
      };

      this.regionais = res1.data.results;
      this.regionais.unshift(todos);


      this.centroCustoService.getAll({ grupoEconomicoId: Number(this.userContext.getGrupoEconomicoId()) }).subscribe(res2 => {
        this.centrosCustos = res2.data.results;
        this.centrosCustos.unshift(todos);

      }, res2 => {
        this.snackBar.error(res2.error.message, 3500, 'X');
      });
    }, res1 => {
      this.snackBar.error(res1.error.message, 3500, 'X');
    });
  }

  markAll(item, formControlName, arrayItens): void {
    if (item.id !== 0) {
      return;
    }

    if (item.id === 0 && !item.selecionado) {
      this.filtro.get(formControlName).setValue(arrayItens);
      item.selecionado = true;
    } else {
      this.filtro.get(formControlName).setValue([]);
      item.selecionado = false;
    }
  }

  private initListener(): void {
    this.filtro.get('cidadeSolicitacao').valueChanges.pipe(
      tap(() =>
        this.filtro.get('cidadeSolicitacao').value &&
        this.filtro.get('cidadeSolicitacao').value.length >= 3
      ),
      debounceTime(100),
      startWith(''),
    ).subscribe(value => {
      if (!value || value.length < 3) {
        this.filteredCidades = [];
        return;
      }

      if (typeof this.filtro.get('cidadeSolicitacao').value === 'string') {
        const selectedUf = this.filtro.get('ufSolicitacao').value;
        const filter = {
          uf: selectedUf.uf,
          cidade: value
        };

        this.consultaCEP.getAllMunicipio(filter).subscribe(res => {
          if (res.data.length === 0) {
            this.snackBar.open(this.translate.instant('PORTAL.MSG_CIDADE_NOT_FOUND'), 7000, 'X');
          }
          this.filteredCidades = res.data;
        }, res => {
          this.snackBar.error(res.error.message || this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
        });
      }
    });
  }

  getColunasTabela(): Array<ColunasTabelaMV> {
    const colunas: Array<ColunasTabelaMV> = [
      {
        description: this.translate.instant('PORTAL.VEICULO_RESERVA.LABELS.NUM_RESERVA'), columnDef: 'numeroReserva', style: {
          minWidth: 80
        }
      },
      {
        description: this.translate.instant('PORTAL.VEICULO_RESERVA.LABELS.PLACA'), columnDef: 'placa', placa: true, style: {
          minWidth: 80
        }
      },
      {
        description: this.translate.instant('PORTAL.VEICULO_RESERVA.LABELS.STATUS'), columnDef: 'situacaoSubstituicao', style: {
          minWidth: 80
        }
      },
      {
        description: this.translate.instant('PORTAL.VEICULO_RESERVA.LABELS.PLACA_RESERVA'), columnDef: 'placaVeiculoReserva', placa: true,
        style: {
          minWidth: 100
        }
      },
      {
        description: this.translate.instant('PORTAL.VEICULO_RESERVA.LABELS.LOCAL_RETIRADA'), columnDef: 'endereco',
        style: {
          minWidth: 120
        }
      },
      {
        description: this.translate.instant('PORTAL.VEICULO_RESERVA.LABELS.DATA_HORA'), columnDef: 'dataSolicitacao', datetime: true,
        dateFormat: 'DD/MM/YYYY HH:MM', style: {
          minWidth: 80
        }
      },
      {
        description: this.translate.instant('PORTAL.LABELS.ACOES'), columnDef: 'action', action: true, style: {
          minWidth: 80
        }
      }
    ];

    return colunas;
  }

  getClientes(): void {
    const condutorId = this.userContext.getCondutorId();
    if (condutorId) {
      this.clienteService.getClienteCondutor(Number(condutorId)).subscribe(res => {
        const todos = {
          id: 0,
          nomeFantasia: 'Todos',
          selecionado: false
        };

        this.clientes = res.data.results;
        this.clientes.unshift(todos);
      }, err => {
        this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
      });
    }
  }

  getUFs(): void {
    this.consultaCEP.getAllUF().subscribe(res => {
      this.ufs = res.data;
    }, res => {
      this.snackBar.error(res.error.message, 7000, 'X');
    });
  }

  getVeiculos(opened: boolean): void {
    if (opened) {
      return;
    }

    this.filtro.get('placa').setValue(null);

    if (Util.getClientesId(this.filtro).length === 0) {
      this.filtro.get('placa').disable();
      return;
    }

    const filtro = {
      clientesId: Util.getClientesId(this.filtro)
    };

    this.veiculoService.getAll(filtro).subscribe(res => {
      this.filtro.get('placa').enable();

      this.placas.data = res.data.results;
      this.placas.filteredPlacas = res.data.results;
    }, res => {
      this.filtro.get('placa').disable();
      this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  verificarClientesPlacas(event, cliente): void {
    if (event && !event.isUserInput) {
      return;
    }

    if (
      Array.isArray(this.filtro.get('clientes').value) &&
      this.filtro.get('clientes').value.some(item => item.clienteId === cliente.clienteId)
    ) {
      this.placas.data = this.placas.data.filter(element => element['clienteId'] !== cliente.clienteId);
      this.placas.filteredPlacas = this.placas.data;

      if (this.placas.data.length === 0) {
        this.filtro.get('placa').disable();
      }
    }
  }

  filtrarPlaca(): void {
    let filter = this.filtro.get('placa').value;
    filter = filter.placa || filter;

    if (filter) {
      filter = filter.toUpperCase();
      this.placas.filteredPlacas = this.placas.data.filter(item => item.placa.includes(filter));
    } else {
      this.placas.filteredPlacas = this.placas.data;
    }
  }

  getFiltros(): any {
    const clientes = Util.getClientesId(this.filtro);
    const regionais = Util.getRegionaisId(this.filtro);
    const centrosCustos = Util.getCentrosCustosId(this.filtro);
    const veiculo = Util.getFormValue(this.filtro, 'placa');
    const status = Util.getFormValue(this.filtro, 'status');
    const ufSolicitacao = Util.getFormValue(this.filtro, 'ufSolicitacao');
    const cidadeSolicitacao = Util.getFormValue(this.filtro, 'cidadeSolicitacao');

    const filtro = {
      clientesId: clientes,
      regionaisId: regionais,
      centrosCustoId: centrosCustos,
      veiculoId: veiculo ? veiculo.veiculoId : null,
      status: status ? status : null,
      ufSolicitacao: ufSolicitacao ? ufSolicitacao.uf : null,
      cidadeSolicitacao: cidadeSolicitacao ? cidadeSolicitacao.municipio : null,
      paginar: this.paginar,
      linhasPagina: this.numRows,
      numeroPagina: this.numPage
    };

    if (_.isEmpty(filtro.clientesId) && _.isEmpty(filtro.regionaisId) && _.isEmpty(filtro.centrosCustoId)) {
      filtro.clientesId = Util.getClientesId(this.filtro, 'clientesDisponiveis');
    }

    return filtro;
  }

  pesquisar(eventTable?: number): void {
    if (!this.filtro.valid) {
      this.snackBar.open(this.translate.instant('PORTAL.MSG_CAMPO_OBRIGATORIO'), 3500, 'X');
      return;
    }

    if (this.getFiltros().numeroPagina === 1) {
      this.showTable = false;
    }

    if (typeof eventTable === 'number') {
      this.getFiltros().numeroPagina = eventTable;
    }

    this.veiculoReservaService.getGerenciamento(this.getFiltros()).subscribe(res => {
      this.veiculosReserva = res.data.results.map(value => {
        value.action = true;
        value.icones = [{
          label: `E-mail - ${value.placa}`,
          function: this.visualizarEmails.bind(this),
          info: false,
          show: !!value.dataEnvioAvisoReservaDisponivel,
          svg: 'pfu-email-blue'
        }];

        return value;
      });

      this.totalRows = res.data.totalRows;
      this.showExport = this.totalRows > 0;
      this.showTable = true;
    }, err => {
      this.veiculosReserva = [];
      this.showTable = true;
      this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  getAtendimentos(event: any) {
    this.veiculoReservaService.getAll(this.getFiltros()).subscribe(res => {
      this.veiculosReserva = res.data.results;
    }, err => {
      this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  getPermissao(): PermissoesAcessoMV {
    if (!AuthService.getRouteRoles()) {
      return {};
    }
    return AuthService.getRouteRoles();
  }

  visualizarEmails(item: any): void {
    this.veiculoReservaService.veiculoReservaSelecionado = item;
    this.router.navigate([`gerenciador-atendimento/email-veiculo-reserva`]);
  }

  enableInputCidade(): void {
    this.filtro.get('cidadeSolicitacao').enable();
    this.filtro.get('cidadeSolicitacao').setValue('');
    this.filteredCidades = [];
  }

  display(cidade: any) {
    if (cidade) {
      return cidade['municipio'];
    }
  }

  displayPlaca(veiculo: any): string {
    if (veiculo) {
      return veiculo['placa'];
    }
  }

  clearSearch(): void {
    this.filtro.reset();
    this.filtro.setErrors(null);
    this.filtro.get('cidadeSolicitacao').disable();

    this.placas.data = [];
    this.placas.filteredPlacas = [];
    this.filteredCidades = [];

    this.veiculosReserva = [];
    this.showTable = false;
  }

  getAllVeiculos(): void {
    this.paginar = false;
    this.pesquisar();
  }
}
