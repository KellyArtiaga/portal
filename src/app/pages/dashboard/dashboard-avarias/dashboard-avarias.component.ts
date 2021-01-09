import { CurrencyPipe } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { AvariasService } from 'src/app/core/services/avarias.service';
import { FiltroIndicadoresStorage } from 'src/app/core/services/filtro-indicadores-storage.service';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';
import { ChartsMV } from 'src/app/shared/interfaces/charts.model';
import { Util } from 'src/app/shared/util/utils';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-dashboard-avarias',
  templateUrl: './dashboard-avarias.component.html',
  styleUrls: ['./dashboard-avarias.component.scss']
})
export class DashboardAvariasComponent {
  @ViewChild('graficos') graficos: ElementRef;

  functionSearch = this.getResponse.bind(this);
  clearFunction = this.limparCharts.bind(this);

  notFoundResults = false;
  showDashboard = false;

  totalizadores: any[];
  colunasExcel: any[];
  charts: ChartsMV[];

  constructor(
    private currencyService: CurrencyPipe,
    private translate: TranslateService,
    private snackBar: SnackBarService,
    private avariasService: AvariasService,
    private filtroIndicadores: FiltroIndicadoresStorage
  ) { }

  private getResponse(formValue: any): void {
    this.filtroIndicadores.filtroPesquisa = formValue;
    this.filtroIndicadores.currentService = this.avariasService;
    this.filtroIndicadores.methodService = 'getResponseGraficos';
    this.filtroIndicadores.exportMethod = this.exportarExcel.bind(this);

    this.avariasService.getResponseGraficos(formValue).subscribe(res => {
      if (_.isNil(res.data.avariaCards)) {
        this.notFoundResults = true;
        this.showDashboard = false;
        this.charts = [];
        this.snackBar.open(this.translate.instant('PORTAL.NAO_HA_DADOS'), 3500, 'X');
        return;
      }

      this.montarTotalizadores(res.data.avariaCards[0]);
      this.formatarDadosCharts(res.data);
    }, res => {
      this.notFoundResults = true;
      this.showDashboard = true;
      this.charts = [];

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
      key: 'CodigoMaterial'
    }, {
      descricao: 'Data',
      key: 'DataAbertura'
    }, {
      descricao: 'Quantidade',
      key: 'Quantidade'
    }, {
      descricao: 'Material',
      key: 'DescricaoMaterial'
    }, {
      descricao: 'Valor Total - Reembolso',
      key: 'ValorReembolso'
    }, {
      descricao: 'Modelo',
      key: 'ModeloVeiculo'
    }, {
      descricao: 'Marca',
      key: 'MarcaVeiculo'
    }, {
      descricao: 'KM',
      key: 'OdometroAtual'
    }, {
      descricao: 'Grupo',
      key: 'GrupoVeiculo'
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
      key: 'Condutor'
    }, {
      descricao: 'Master',
      key: 'CodigoContratoMaster'
    }, {
      descricao: 'Atendimento',
      key: 'CodigoAtendimento'
    }, {
      descricao: 'Cidade',
      key: 'Municipio'
    }, {
      descricao: 'UF',
      key: 'Estado'
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
        if (column.key.toLowerCase().includes('valor')) {
          dataTemp[column.descricao] = this.currencyService.transform(
            typeof element[column.key] === 'number' ? element[column.key] : 0,
            'BRL'
          );
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
    XLSX.writeFile(wb, 'Indicadores_Avarias.xlsx');
  }

  private montarTotalizadores(totalizador: any): void {
    this.totalizadores = [
      { nome: 'VALOR TOTAL', valor: `${this.currencyService.transform(totalizador.valorTotal, 'BRL')}`, show: Util.hasPermission('INDICADORES_AVARIAS_CARD_TOTAL') },
      { nome: 'Nº DE CHAMADOS', valor: totalizador.numeroChamados, show: Util.hasPermission('INDICADORES_AVARIAS_CARD_CHAMADOS') },
      { nome: 'MANUTENÇÃO', valor: totalizador.numeroChamadosManutencao, show: Util.hasPermission('INDICADORES_AVARIAS_CARD_MANUTENCAO') },
      { nome: 'SINISTROS', valor: totalizador.numeroChamadosSinistro, show: Util.hasPermission('INDICADORES_AVARIAS_CARD_SINISTROS') }
    ];
  }

  private formatarDadosCharts(dados: any): void {
    const charts = {
      avariaMes: {
        filter: dados.avariaMes,
        data: dados.avariaMes.map(item => {
          return [
            `${item.mesAno.split(', ')[0].substring(0, 3)}/${item.mesAno.split(', ')[1]}`,
            item.quantidadeAvarias,
            this.currencyService.transform(item.valorAvarias, 'BRL')
          ];
        })
      },
      avariaCategoria: {
        filter: dados.avariaCategoria,
        data: dados.avariaCategoria.map(item => {
          return [
            item.descricaoCategoriaGerencial,
            item.quantidadeAvarias,
            this.currencyService.transform(item.valorAvarias, 'BRL')
          ];
        })
      },
      avariaFinalidade: {
        filter: dados.avariaFinalidade,
        data: dados.avariaFinalidade.map(item => {
          return [
            item.descricaoManutencaoFinalidade,
            Number(Number(item.porcentagemAvarias * 100).toFixed(2)),
            Number(Number(item.porcentagemAvarias * 100).toFixed(2))
          ];
        })
      },
      avariaItens: {
        filter: dados.avariaItens,
        data: dados.avariaItens.map(item => {
          return [
            item.descricaoMaterial,
            item.quantidadeAvarias,
            this.currencyService.transform(item.valorAvarias, 'BRL')
          ];
        })
      },
      avariaPlacas: {
        filter: dados.avariaPlacas,
        data: dados.avariaPlacas.map(item => {
          return [
            item.placa,
            item.valorAvarias,
            this.currencyService.transform(item.valorAvarias, 'BRL')
          ];
        })
      }
    };

    charts.avariaItens.data.sort((a, b) => {
      return b[1] - a[1];
    });

    this.montarCharts(charts);
  }

  private montarCharts(values: any): void {
    this.charts = [{
      label: 'PORTAL.INDICADORES_AVARIAS.LABEL.CHART_AVARIAS_PERIODO',
      mock: false,
      show: Util.hasPermission('INDICADORES_AVARIAS_PERIODO'),
      columnChart: {
        label: this.translate.instant('PORTAL.INDICADORES_AVARIAS.LABEL.CHART_AVARIAS_PERIODO'),
        canFilter: true,
        id: 'periodo',
        columnWidth: '60%',
        verticalTitle: '',
        horizontalTitle: '',
        columns: ['Título', { label: 'Avarias', type: 'number' }, { label: 'Valor', type: 'number' }],
        series: {
          1: {
            type: 'line'
          }
        },
        legend: {
          position: 'bottom'
        },
        data: values.avariaMes
      }
    }, {
      label: 'PORTAL.INDICADORES_AVARIAS.LABEL.CHART_VALOR_DESPESAS',
      mock: false,
      show: Util.hasPermission('INDICADORES_AVARIAS_DESPESA_FINALIDADE'),
      pieChart: {
        label: this.translate.instant('PORTAL.INDICADORES_AVARIAS.LABEL.CHART_VALOR_DESPESAS'),
        canFilter: true,
        id: 'manutencaoFinalidadeId',
        verticalTitle: 'Valor R$',
        horizontalTitle: 'Meses',
        pieHoleSize: '0.5',
        position: {
          left: 70
        },
        columns: ['Título', { label: 'Porcentagem', type: 'number' }, { role: 'annotation' }],
        data: values.avariaFinalidade
      }
    }, {
      label: 'PORTAL.INDICADORES_AVARIAS.LABEL.CHART_AVARIAS_CATEGORIA',
      mock: false,
      show: Util.hasPermission('INDICADORES_AVARIAS_CATEGORIA'),
      barChart: {
        showCar: false,
        label: this.translate.instant('PORTAL.INDICADORES_AVARIAS.LABEL.CHART_AVARIAS_CATEGORIA'),
        canFilter: true,
        id: 'categoriaId',
        columns: ['Título', { label: 'Quantidade', type: 'number' }, { role: 'annotation' }],
        data: values.avariaCategoria
      }
    }, {
      label: 'PORTAL.INDICADORES_AVARIAS.LABEL.CHART_PRINCIPAIS_PLACAS',
      mock: false,
      show: Util.hasPermission('INDICADORES_AVARIAS_PLACAS'),
      barChart: {
        showCar: false,
        label: this.translate.instant('PORTAL.INDICADORES_AVARIAS.LABEL.CHART_PRINCIPAIS_PLACAS'),
        canFilter: true,
        id: 'placa',
        columnWidth: '50px',
        verticalTitle: 'Placas',
        horizontalTitle: '',
        columns: ['Título', { label: 'Valor (R$)', type: 'number' }, { role: 'annotation' }],
        data: values.avariaPlacas
      }
    }, {
      label: 'PORTAL.INDICADORES_AVARIAS.LABEL.CHART_PRINCIPAIS_ITENS',
      mock: false,
      show: Util.hasPermission('INDICADORES_AVARIAS_ITENS'),
      barChart: {
        showCar: false,
        label: this.translate.instant('PORTAL.INDICADORES_AVARIAS.LABEL.CHART_PRINCIPAIS_ITENS'),
        canFilter: true,
        id: 'materialId',
        verticalTitle: 'Item',
        horizontalTitle: '',
        position: {
          left: '50%',
          top: '5%',
          bottom: '15%'
        },
        width: '100%', height: '100%', chartArea: { width: '100%', height: '100%' }
        ,
        columns: ['Título', { label: 'Valor (R$)', type: 'number' }, { role: 'annotation' }],
        data: values.avariaItens
      }
    }];

    this.showDashboard = true;
    this.filtroIndicadores.graficosHtml = this.graficos.nativeElement;
  }

  private limparCharts(): void {
    this.charts = [];
    this.showDashboard = false;
    this.notFoundResults = false;
  }
}
