import * as _ from 'lodash';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FiltroIndicadoresStorage } from 'src/app/core/services/filtro-indicadores-storage.service';
import { SinistroService } from 'src/app/core/services/sinistro.service';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';
import { ChartsMV } from 'src/app/shared/interfaces/charts.model';
import { Util } from 'src/app/shared/util/utils';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-dashboard-sinistros',
  templateUrl: './dashboard-sinistros.component.html',
  styleUrls: ['./dashboard-sinistros.component.scss']
})
export class DashboardSinistrosComponent implements AfterViewInit {
  @ViewChild('graficos') graficos: ElementRef;

  functionSearch = this.getResponse.bind(this);
  limparCharts = this.limparChart.bind(this);

  notFoundResults = false;
  showDashboard = false;

  colunasExcel: any[];
  totalizadores: any[];
  charts: ChartsMV[];

  constructor(
    private translate: TranslateService,
    private snackBar: SnackBarService,
    private sinistroService: SinistroService,
    private cdr: ChangeDetectorRef,
    private filtroIndicadores: FiltroIndicadoresStorage
  ) { }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  private getResponse(formValue: any): void {
    this.showDashboard = false;
    this.notFoundResults = false;

    this.filtroIndicadores.filtroPesquisa = formValue;
    this.filtroIndicadores.currentService = this.sinistroService;
    this.filtroIndicadores.methodService = 'getIndicadores';
    this.filtroIndicadores.exportMethod = this.exportarExcel.bind(this);

    this.sinistroService.getIndicadores(formValue).subscribe(res => {
      if (_.isNil(res.data.sinistroCards)) {
        this.notFoundResults = true;
        this.showDashboard = false;
        this.charts = [];
        this.snackBar.open(this.translate.instant('PORTAL.NAO_HA_DADOS'), 3500, 'X');
        return;
      }

      this.montarTotalizadores(res.data.sinistroCards[0]);
      this.formatarDadosCharts(res.data);
    }, res => {
      this.notFoundResults = true;
      if (res.error && res.error.message && res.error.message.error && res.error.message.error.includes('Nenhum registo')) {
        this.snackBar.open(this.translate.instant('PORTAL.NAO_HA_DADOS'), 3500, 'X');
        return;
      }
      this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  private getColunasExcel(): any[] {
    this.colunasExcel = [{
      descricao: 'Código',
      key: 'CodigoSinistro'
    }, {
      descricao: 'Tipo Sinistro',
      key: 'DescricaoSinistroTipo'
    }, {
      descricao: 'Culpado',
      key: 'DeclaracaoCulpaSinistro'
    }, {
      descricao: 'Período Sinistros',
      key: 'PeriodoSinistro'
    }, {
      descricao: 'Data',
      key: 'DataSinistro'
    }, {
      descricao: 'Modelo',
      key: 'Modelo'
    }, {
      descricao: 'Marca',
      key: 'Marca'
    }, {
      descricao: 'Grupo',
      key: 'Grupo'
    }, {
      descricao: 'Grupo Econômico',
      key: 'GrupoEconomico'
    }, {
      descricao: 'Nome Fantasia',
      key: 'NomeFantasia'
    }, {
      descricao: 'Regional',
      key: 'Regional'
    }, {
      descricao: 'Centro de Custo',
      key: 'CentroCusto'
    }, {
      descricao: 'Condutor',
      key: 'NomeMotorista'
    }, {
      descricao: 'Master',
      key: 'CodigoContratoMaster'
    }, {
      descricao: 'Cidade/UF',
      key: 'Cidade_UF'
    }];

    return this.colunasExcel;
  }

  private exportarExcel(dados: any[]): void {
    const data = [];

    dados.forEach((element) => {
      const dataTemp = {};
      const colunas = this.getColunasExcel();

      colunas.forEach(column => {
        if (typeof element[column.key] === 'boolean') {
          dataTemp[column.descricao] = element[column.key] ? 'Sim' : 'Não';
          return;
        }
        if (column.key.toLowerCase().includes('data')) {
          if (element[column.key]) {
            dataTemp[column.descricao] = Util.formataData(element[column.key], 'DD/MM/YYYY');
          } else {
            dataTemp[column.descricao] = '-';
          }
          return;
        }
        dataTemp[column.descricao] = element[column.key] || '-';
      });

      data.push(dataTemp);
    });

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'Indicadores_Sinistros.xlsx');
  }

  private limparChart(): void {
    this.charts = [];
    this.showDashboard = false;
    this.notFoundResults = false;
  }

  private montarTotalizadores(totalizadores: any): void {
    this.totalizadores = [
      { nome: 'SINISTROS', valor: totalizadores.sinistros, show: Util.hasPermission('INDICADORES_SINISTROS_CARD_SINISTROS') },
      { nome: 'QTD. CULPA COND.', valor: totalizadores.qtdCulpaCond, show: Util.hasPermission('INDICADORES_SINISTROS_CARD_CULPA') },
      { nome: 'QTD PERDA TOTAL', valor: totalizadores.qtdPT, show: Util.hasPermission('INDICADORES_SINISTROS_CARD_PT') }
    ];
  }

  private formatarDadosCharts(values: any): void {
    const charts = {
      sinistroPorPeriodo: {
        filter: values.sinistroPorPeriodo,
        data: values.sinistroPorPeriodo.map(item => {
          return [
            `${Util.getMes(String(Number(item.mes) - 1)).abr}/${item.ano}`,
            item.quantidadeSinistro,
            item.quantidadeSinistro
          ];
        })
      },
      sinistroPorDia: {
        filter: values.sinistroPorDia,
        data: values.sinistroPorDia.map(item => {
          return [
            item.diaSemana,
            Number(Number(item.porcentagemSinistro * 100).toFixed(2)),
            Number(Number(item.porcentagemSinistro * 100).toFixed(2))
          ];
        })
      },
      sinistroHorario: {
        filter: values.sinistroHorario,
        data: values.sinistroHorario.map(item => {
          return [
            item.faixaHorario,
            Number(Number(item.porcentagemSinistros * 100).toFixed(2))
          ];
        })
      },
      sinistroHorarioComercial: {
        filter: values.sinistroHorarioComercial,
        data: values.sinistroHorarioComercial.map(item => {
          return [
            item.faixaHorario,
            Number(Number(item.porcentagemSinistros * 100).toFixed(2))
          ];
        })
      },
      sinistroTipos: {
        filter: values.sinistroTipos.map(item => {
          return { id: item.tipoId };
        }),
        data: values.sinistroTipos.map(item => {
          return [
            item.descricaoSinistroTipo,
            item.quantidadeSinistro,
            `${Number(Number(item.porcentagemSinistro * 100).toFixed(2))}%`
          ];
        })
      },
      sinistroPlacas: {
        filter: values.sinistroPlacas,
        data: values.sinistroPlacas.map(item => {
          return [
            item.placa,
            item.quantidadeSinistro,
            item.quantidadeSinistro
          ];
        })
      },
      declaracaoCulpa: {
        filter: values.declaracaoCulpa.map(item => {
          return { id: item.declaracaoCulpa };
        }),
        data: values.declaracaoCulpa.map(item => {
          return [
            item.declaracaoCulpaSinistro,
            item.quantidadeSinistro,
            `${Number(Number(item.porcentagemSinistro * 100).toFixed(2))}%`
          ];
        })
      }
    };

    this.montarCharts(charts);
  }

  private montarCharts(values: any): void {
    this.charts = [{
      label: 'PORTAL.INDICADORES_SINISTRO.LABEL.CHART_SINISTRO_PERIODO',
      mock: false,
      show: Util.hasPermission('INDICADORES_SINISTROS_PERIODO'),
      columnChart: {
        label: this.translate.instant('PORTAL.INDICADORES_SINISTRO.LABEL.CHART_SINISTRO_PERIODO'),
        canFilter: true,
        id: 'periodo',
        columnWidth: '60%',
        verticalTitle: '',
        horizontalTitle: '',
        columns: ['Título', { label: 'Quantidade', type: 'number' }, { role: 'annotation' }],
        data: values.sinistroPorPeriodo
      }
    }, {
      label: 'PORTAL.INDICADORES_SINISTRO.LABEL.CHART_SINISTRO_DIAS',
      mock: false,
      show: Util.hasPermission('INDICADORES_SINISTROS_DIA'),
      pieChart: {
        label: this.translate.instant('PORTAL.INDICADORES_SINISTRO.LABEL.CHART_SINISTRO_DIAS'),
        canFilter: true,
        id: 'diaSemana',
        verticalTitle: 'Valor R$',
        horizontalTitle: 'Meses',
        pieHoleSize: '0.5',
        position: {
          left: 70
        },
        columns: ['Título', { label: 'Porcentagem', type: 'number' }, { role: 'annotation' }],
        data: values.sinistroPorDia
      }
    }, {
      label: 'PORTAL.INDICADORES_SINISTRO.LABEL.CHART_SINISTRO_ENTRE_HORARIOS',
      mock: false,
      show: Util.hasPermission('INDICADORES_SINISTROS_HORARIO'),
      pieChart: {
        label: this.translate.instant('PORTAL.INDICADORES_SINISTRO.LABEL.CHART_SINISTRO_ENTRE_HORARIOS'),
        canFilter: true,
        id: 'faixaHorario',
        verticalTitle: '',
        horizontalTitle: '',
        pieHoleSize: '0.5',
        columns: ['Título', { label: 'Porcentagem', type: 'number' }],
        data: values.sinistroHorario
      }
    }, {
      label: 'PORTAL.INDICADORES_SINISTRO.LABEL.CHART_SINISTRO_HORARIO_COMERCIAL',
      mock: false,
      show: Util.hasPermission('INDICADORES_SINISTROS_HORARIO_COMERCIAL'),
      pieChart: {
        label: this.translate.instant('PORTAL.INDICADORES_SINISTRO.LABEL.CHART_SINISTRO_HORARIO_COMERCIAL'),
        canFilter: true,
        id: 'faixaHorarioComercial',
        verticalTitle: '',
        horizontalTitle: '',
        pieHoleSize: '0.5',
        columns: ['Título', { label: 'Porcentagem', type: 'number' }],
        data: values.sinistroHorarioComercial
      }
    }, {
      label: 'PORTAL.INDICADORES_SINISTRO.LABEL.CHART_TIPO_SINISTRO',
      mock: false,
      show: Util.hasPermission('INDICADORES_SINISTROS_TIPO'),
      barChart: {
        showCar: false,
        label: this.translate.instant('PORTAL.INDICADORES_SINISTRO.LABEL.CHART_TIPO_SINISTRO'),
        canFilter: true,
        id: 'tipoSinistro',
        columnWidth: '50px',
        verticalTitle: '',
        horizontalTitle: '',
        columns: ['Título', { label: '', type: 'number' }, { role: 'annotation' }],
        data: values.sinistroTipos
      }
    }, {
      label: 'PORTAL.INDICADORES_SINISTRO.LABEL.CHART_PRINCIPAL_PLACA_SINISTRO',
      mock: false,
      show: Util.hasPermission('INDICADORES_SINISTROS_PLACAS'),
      barChart: {
        showCar: false,
        label: this.translate.instant('PORTAL.INDICADORES_SINISTRO.LABEL.CHART_PRINCIPAL_PLACA_SINISTRO'),
        canFilter: true,
        id: 'placa',
        columnWidth: '50px',
        verticalTitle: '',
        horizontalTitle: '',
        columns: ['Título', { label: '', type: 'number' }, { role: 'annotation' }],
        position: {
          left: '20%'
        },
        data: values.sinistroPlacas
      }
    }, {
      label: 'PORTAL.INDICADORES_SINISTRO.LABEL.CHART_DECLARACA_CULPA',
      mock: false,
      show: Util.hasPermission('INDICADORES_SINISTROS_CULPA'),
      barChart: {
        showCar: false,
        label: this.translate.instant('PORTAL.INDICADORES_SINISTRO.LABEL.CHART_DECLARACA_CULPA'),
        canFilter: true,
        id: 'codigoDeclaracaoCulpa',
        columnWidth: '50px',
        verticalTitle: '',
        horizontalTitle: '',
        columns: ['Título', { label: '', type: 'number' }, { role: 'annotation' }],
        data: values.declaracaoCulpa
      }
    }];

    this.showDashboard = true;
    this.filtroIndicadores.graficosHtml = this.graficos.nativeElement;
  }
}
