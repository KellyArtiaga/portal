import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatMenu } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { moment } from 'fullcalendar';
import { AtendimentoClienteService } from 'src/app/core/services/atendimentos-clientes.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { CentroCustoService } from 'src/app/core/services/centro-custo.service';
import { ClientesService } from 'src/app/core/services/cliente.service';
import { RegionalService } from 'src/app/core/services/regionais.service';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';
import { UserContextService } from 'src/app/core/services/user-context.service';
import { VeiculoService } from 'src/app/core/services/veiculos.service';
import { ModalDateMV } from 'src/app/shared/interfaces/modal-date.model';
import { PermissoesAcessoMV } from 'src/app/shared/interfaces/permissoes-acesso.model';
import { VeiculosMV } from 'src/app/shared/interfaces/veiculos.model';
import { Util } from 'src/app/shared/util/utils';
import * as _ from 'lodash';

@Component({
  selector: 'app-filtro-atendimento',
  templateUrl: './filtro-atendimento.component.html',
  styleUrls: ['./filtro-atendimento.component.scss']
})
export class FiltroAdministrarAtendimentoComponent implements OnInit {
  @ViewChild('dateTimeMenu') dateTimeMenu: MatMenu;

  @Output() limparFiltro = new EventEmitter();
  @Output() filtrar = new EventEmitter();

  formFiltro: FormGroup;
  cnpjs: Array<any> = [];

  logadoPlaca = !!localStorage.getItem('placaLogada');
  placaLogada = localStorage.getItem('placaLogada');

  regionais = [] as Array<any>;
  centrosCustos = [] as Array<any>;
  status: any[] = [
    { id: 'TODOS', descricao: 'Todos' },
    { id: 'ABERTO', descricao: 'Aberto' },
    { id: 'FECHADO', descricao: 'Fechado' },
    { id: 'CANCELADO', descricao: 'Cancelado' }
  ];
  placas = {
    data: [] as Array<VeiculosMV>,
    filteredData: [] as Array<VeiculosMV>,
  };
  dadosSearch: any;

  modalDateParams: ModalDateMV;

  constructor(
    private userContext: UserContextService,
    private snackBar: SnackBarService,
    private veiculoService: VeiculoService,
    private translateService: TranslateService,
    private clienteService: ClientesService,
    private atendimentoService: AtendimentoClienteService,
    private snackBarService: SnackBarService,
    private regionalService: RegionalService,
    private centroCustoService: CentroCustoService,
  ) { }

  ngOnInit() {
    this.criaForm();
  }

  getPermissao(): PermissoesAcessoMV {
    if (!AuthService.getRouteRoles()) {
      return {};
    }
    return AuthService.getRouteRoles();
  }

  criaForm(): void {
    this.getCnpj();

    this.formFiltro = new FormGroup({
      'clientes': new FormControl(''),
      'codigoAtendimento': new FormControl(''),
      'placa': new FormControl(''),
      'dataInicio': new FormControl(''),
      'dataFim': new FormControl(''),
      'regionais': new FormControl(''),
      'centrosCustos': new FormControl(''),
      'status': new FormControl('TODOS'),
      'periodo': new FormControl('', Validators.compose([Validators.required])),
    });

    if (this.logadoPlaca) {
      this.formFiltro.get('clientes').setValue([this.userContext.getClienteId()]);
      this.formFiltro.get('placa').setValue(this.placaLogada);
      this.display({ placa: this.formFiltro.get('placa').value });
      this.formFiltro.get('placa').disable();
    }

    if (this.atendimentoService.lastRequestFilter) {
      const filtro = {
        'clientes': this.atendimentoService.lastRequestFilter['clientesId'],
        'codigoAtendimento': this.atendimentoService.lastRequestFilter['atendimentoId'],
        'placa': this.atendimentoService.lastRequestFilter['placa'],
        'dataInicio': this.atendimentoService.lastRequestFilter['dataInicio'],
        'dataFim': this.atendimentoService.lastRequestFilter['dataFim'],
        'regionais': this.atendimentoService.lastRequestFilter['regionaisId'],
        'centrosCustos': this.atendimentoService.lastRequestFilter['centrosCustoId'],
        'status': this.atendimentoService.lastRequestFilter['situacao'] === '' ?
          'TODOS' :
          this.atendimentoService.lastRequestFilter['situacao'],
        'periodo': `${Util.formataData(this.atendimentoService.lastRequestFilter['dataInicio'], 'DD/MM/YYYY')} - ${Util.formataData(
          isNaN(this.atendimentoService.lastRequestFilter['dataFim']) ?
            new Date().getTime() :
            new Date(this.atendimentoService.lastRequestFilter['dataFim']).getTime(), 'DD/MM/YYYY')}`
      };

      Object.keys(filtro).forEach(item => {
        this.formFiltro.get(item).setValue(filtro[item]);
      });
    }

    if (!this.getPermissao().pesquisar) {
      this.formFiltro.disable();
    }

    this.modalDateParams = {
      campoPeriodo: this.formFiltro.get('periodo'),
      campoDataInicio: this.formFiltro.get('dataInicio'),
      campoDataFim: this.formFiltro.get('dataFim'),
      matMenu: this.dateTimeMenu
    };
  }

  abrirFiltro() {
    this.formFiltro.get('dataInicio').setValue('');
    this.formFiltro.get('dataFim').setValue('');
  }

  getVeiculos(opened: boolean): void {
    if (opened) {
      return;
    }

    this.formFiltro.get('placa').setValue(null);

    if (this.formFiltro.get('clientesId').value.length === 0) {
      this.formFiltro.get('placa').disable();
      return;
    }

    const filtro = {
      clientesId: this.formFiltro.get('clientesId').value
    };

    this.veiculoService.getAll(filtro).subscribe(res => {
      this.placas.data = res.data.results;
      this.placas.filteredData = this.placas.data;

      this.formFiltro.get('placa').enable();

      if (this.dadosSearch) {
        this.formFiltro.get('placa').setValue(
          this.placas.filteredData.filter(p => p.veiculoId === this.dadosSearch.veiculoId)[0]);
        this.pesquisar();
      }
    }, res => {
      this.formFiltro.get('placa').disable();
      this.snackBar.error(this.translateService.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  verificarClientesPlacas(event, cliente): void {
    if (event && !event.isUserInput) {
      return;
    }

    if (!this.logadoPlaca) {
      this.formFiltro.get('placa').setValue(null);
    }

    if (
      Array.isArray(this.formFiltro.get('clientes').value) &&
      this.formFiltro.get('clientes').value.some(item => item.clienteId === cliente.clienteId)
    ) {
      this.placas.data = this.placas.data.filter(element => element['clienteId'] !== cliente.clienteId);
      this.placas.filteredData = this.placas.data;

      if (this.placas.data.length === 0) {
        this.formFiltro.get('placa').disable();
      }

      return;
    }
  }

  getCnpj(): void {
    this.clienteService.getClienteCondutor(Number(this.userContext.getCondutorId())).subscribe(res => {

      this.cnpjs = res.data.results;

      if (!this.logadoPlaca) {
        const todos = {
          id: 0,
          nomeFantasia: 'Todos',
          clienteId: 0
        };

        this.cnpjs.unshift(todos);
      }

      if (this.logadoPlaca) {
        this.formFiltro.get('clientes').setValue(this.cnpjs);
        this.formFiltro.get('clientes').disable();
      } else {
        this.formFiltro.get('clientes').setValue(null);

        if (this.atendimentoService.lastRequestFilter && this.atendimentoService.lastRequestFilter['clientesId']) {
          this.formFiltro.get('clientes').setValue(this.cnpjs.map(cliente => {
            if (this.atendimentoService.lastRequestFilter['clientesId'].includes(cliente.clienteId)) {
              return cliente;
            }
          }).filter(Boolean));
        }
      }
      this.regionalService.getAll({ grupoEconomicoId: Number(this.userContext.getGrupoEconomicoId()) }).subscribe(res1 => {

        const todos1 = {
          id: 0,
          descricao: 'Todos',
          selecionado: false
        };

        this.regionais = res1.data.results;
        this.regionais.unshift(todos1);

        if (this.atendimentoService.lastRequestFilter && this.atendimentoService.lastRequestFilter['regionaisId']) {
          this.formFiltro.get('regionais').setValue(this.regionais.map(regional => {
            if (this.atendimentoService.lastRequestFilter['regionaisId'].includes(regional.clienteId)) {
              return regional;
            }
          }).filter(Boolean));
        }

        this.centroCustoService.getAll({ grupoEconomicoId: Number(this.userContext.getGrupoEconomicoId()) }).subscribe(res2 => {

          const todos2 = {
            id: 0,
            descricao: 'Todos',
            selecionado: false
          };

          this.centrosCustos = res2.data.results;
          this.centrosCustos.unshift(todos2);

          if (this.atendimentoService.lastRequestFilter && this.atendimentoService.lastRequestFilter['centrosCustoId']) {
            this.formFiltro.get('regionais').setValue(this.centrosCustos.map(centroCusto => {
              if (this.atendimentoService.lastRequestFilter['centrosCustoId'].includes(centroCusto.id)) {
                return centroCusto;
              }
            }).filter(Boolean));
          }

        }, res2 => {
          this.snackBarService.error(res2.error.message, 3500, 'X');
        });
      }, res1 => {
        this.snackBarService.error(res1.error.message, 3500, 'X');
      });
    }, res => {
      this.snackBar.error(this.translateService.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  pesquisar(): void {
    let dataInicio = null;
    let dataFim = null;

    if (this.formFiltro.get('codigoAtendimento').value) {
      this.desabilitarValidacoes('clientes');
      this.desabilitarValidacoes('periodo');
    } else {
      this.habilitarValidacoes('clientes');
      this.habilitarValidacoes('periodo');

      dataInicio = moment(this.formFiltro.get('dataInicio').value, 'DD/MM/YYYY').toDate();
      dataFim = moment(this.formFiltro.get('dataFim').value, 'DD/MM/YYYY').toDate();
    }

    const obj = {
      clientesId: Util.getClientesId(this.formFiltro),
      regionaisId: Util.getRegionaisId(this.formFiltro),
      centrosCustoId: Util.getCentrosCustosId(this.formFiltro),
      placa: this.logadoPlaca ? this.placaLogada
        : this.formFiltro.get('placa').value ? this.formFiltro.get('placa').value.placa
          : null,
      atendimentoId: this.formFiltro.get('codigoAtendimento').value,
      dataInicio: dataInicio ? dataInicio.getTime() : null,
      dataFim: dataFim ? dataFim.getTime() : null,
      situacao: this.formFiltro.get('status').value === 'TODOS' ? '' : this.formFiltro.get('status').value,
    };

    if (_.isEmpty(obj.clientesId) && _.isEmpty(obj.regionaisId) && _.isEmpty(obj.centrosCustoId)) {
      obj.clientesId = Util.getClientesId(this.formFiltro, 'clientesDisponiveis');
    }

    if (!this.formFiltro.valid) {
      this.snackBar.open(this.translateService.instant('PORTAL.MSG_CAMPO_OBRIGATORIO'), 7000, 'X');
      return;
    }

    this.formFiltro.enable();

    if (this.logadoPlaca) {
      this.formFiltro.get('clientes').disable();
      this.formFiltro.get('placa').disable();
    }

    this.filtrar.emit(obj);
  }

  clearSearch(): void {
    this.placas = {
      data: [],
      filteredData: []
    };

    this.formFiltro.reset();
    this.limparFiltro.emit();
    this.formFiltro.get('status').setValue('TODOS');
    this.desabilitarValidacoes('clientes');
    this.desabilitarValidacoes('periodo');

    this.atendimentoService.lastRequestFilter = null;
  }

  markAll(item, formControlName, arrayItens): void {
    if (item.id !== 0) {
      return;
    }

    if (item.id === 0 && !item.selecionado) {
      this.formFiltro.get(formControlName).setValue(arrayItens);
      item.selecionado = true;
    } else {
      this.formFiltro.get(formControlName).setValue([]);
      item.selecionado = false;
    }
  }

  desabilitarValidacoes(campo): void {
    this.formFiltro.get(campo).clearValidators();
    this.formFiltro.get(campo).updateValueAndValidity();
  }

  habilitarValidacoes(campo) {
    // this.formFiltro.get(campo).setValidators([Validators.required]);
    this.formFiltro.get(campo).updateValueAndValidity();
  }

  formataDocumento(str: string): string {
    if (!str) {
      return '';
    }

    return Util.formataDocumento(str);
  }

  filtrarPlaca(): void {
    let filter = this.formFiltro.get('placa').value;

    if (filter) {
      filter = filter.placa || filter;
      filter = filter.toUpperCase();
      this.placas.filteredData = this.placas.data.filter(item => item.placa.includes(filter));
    } else {
      this.placas.filteredData = this.placas.data;
    }
  }

  display(veiculo: any): string {
    if (veiculo) {
      return veiculo.placa;
    }
  }
}
