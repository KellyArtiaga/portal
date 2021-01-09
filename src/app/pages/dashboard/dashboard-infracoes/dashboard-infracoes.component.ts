import { CurrencyPipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { FiltroIndicadoresStorage } from 'src/app/core/services/filtro-indicadores-storage.service';
import { MultasService } from 'src/app/core/services/multas.service';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';
import { UserContextService } from 'src/app/core/services/user-context.service';
import { ChartsMV } from 'src/app/shared/interfaces/charts.model';
import { IndicadoresInfracoesMV } from 'src/app/shared/interfaces/indicadores-infracoes.model';
import { Util } from 'src/app/shared/util/utils';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-dashboard-infracoes',
  templateUrl: './dashboard-infracoes.component.html',
  styleUrls: ['./dashboard-infracoes.component.scss']
})
export class DashboardInfracoesComponent implements AfterViewInit {
  @ViewChild('graficos') graficos: ElementRef;

  functionSearch = this.getResponse.bind(this);
  clearSearch = this.limparDados.bind(this);

  notFoundResults = false;
  showDashboard = false;

  totalizadores: any[];
  colunasExcel: any[];

  charts: ChartsMV[];
  indicadores: IndicadoresInfracoesMV;

  constructor(
    private currencyService: CurrencyPipe,
    private translate: TranslateService,
    private multasService: MultasService,
    private userContext: UserContextService,
    private snackBar: SnackBarService,
    private cdr: ChangeDetectorRef,
    private filtroIndicadores: FiltroIndicadoresStorage
  ) { }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  limparDados(): void {
    this.showDashboard = false;
    this.notFoundResults = false;
    this.charts = [];
    this.totalizadores = [];
    this.indicadores = {};
  }

  private getResponse(formValue?: any): void {
    let filtro;
    this.showDashboard = false;
    this.notFoundResults = false;

    if (formValue) {
      if (!formValue.clientesId) {
        formValue.clientesId = this.filtroIndicadores.clientes;
      }
      formValue.dataInicio = new Date(formValue.dataInicio).getTime();

      if (formValue.dataFim) {
        formValue.dataFim = new Date(formValue.dataFim).getTime();
      }

      filtro = formValue;
    }

    this.filtroIndicadores.filtroPesquisa = filtro;
    this.filtroIndicadores.currentService = this.multasService;
    this.filtroIndicadores.methodService = 'getResponseGraficos';
    this.filtroIndicadores.exportMethod = this.exportarExcel.bind(this);

    this.multasService.getResponseGraficos(filtro).subscribe(res => {
      if (_.isNil(res.data.cards)) {
        this.notFoundResults = true;
        this.showDashboard = false;
        this.indicadores = {};
        this.snackBar.open(this.translate.instant('PORTAL.NAO_HA_DADOS'), 3500, 'X');
        return;
      }

      this.indicadores = {};
      this.montarTotalizadores(res.data.cards[0]);
      this.formatarGraficos(res.data);
    }, res => {
      this.notFoundResults = true;
      this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  private getColunasExcel(): any[] {
    this.colunasExcel = [{
      descricao: 'Código',
      key: 'CodigoInfracao'
    }, {
      descricao: 'AIT',
      key: 'AutoInfracao'
    }, {
      descricao: 'AIT Origem',
      key: 'AitOriginaria'
    }, {
      descricao: 'Infração',
      key: 'ClassificacaoInfracao'
    }, {
      descricao: 'Valor Reembolso',
      key: 'ValorReembolso'
    }, {
      descricao: 'Data Infração',
      key: 'DataInfracao'
    }, {
      descricao: 'Hora Infração',
      key: 'HoraInfracao'
    }, {
      descricao: 'Periodo Dia',
      key: 'PeriodoDia'
    }, {
      descricao: 'Status Veículo',
      key: 'Status'
    }, {
      descricao: 'Faturado',
      key: 'ValorFaturado'
    }, {
      descricao: 'Identificado',
      key: 'InfracaoNIC'
    }, {
      descricao: 'Nome do Motorista',
      key: 'NomeCondutor'
    }, {
      descricao: 'Placa',
      key: 'Placa'
    }, {
      descricao: 'Modelo',
      key: 'ModeloVeiculo'
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
      key: 'DescricaoCentroCusto'
    }, {
      descricao: 'Master',
      key: 'CodigoContratoMaster'
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
        if (column.key === 'InfracaoNIC') {
          dataTemp[column.descricao] = element[column.key] === 'S' ? 'Sim' : 'Não';
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
    XLSX.writeFile(wb, 'Indicadores_Infracoes.xlsx');
  }

  private montarTotalizadores(totais: any): void {
    this.totalizadores = [
      { nome: 'Nº DE MULTAS', valor: totais.quantidadeInfracoes, show: Util.hasPermission('INDICADORES_INFRACOES_CARD_MULTAS') },
      { nome: 'DESPESAS COM MULTAS', valor: this.currencyService.transform(totais.gastosInfracoes, 'BRL'), show: Util.hasPermission('INDICADORES_INFRACOES_CARD_DESPESAS') },
      { nome: 'MÉDIA DE DESPESAS (R$/QTD)', valor: this.currencyService.transform(totais.mediaGastosInfracoes, 'BRL'), show: Util.hasPermission('INDICADORES_INFRACOES_CARD_MEDIA_DESPESAS') },
      { nome: 'NÚMERO DE NICs', valor: totais.numeroNICs, show: Util.hasPermission('INDICADORES_INFRACOES_CARD_NIC') },
      { nome: 'INFRAÇÕES GRAVÍSSIMAS', valor: totais.infracoesGravissimas, show: Util.hasPermission('INDICADORES_INFRACOES_CARD_INFRACOES') }
    ];
  }

  private formatarGraficos(dados: any): void {
    this.indicadores.infracoesPeriodo = {
      filter: dados.infracoesMes,
      data: dados.infracoesMes.map(item => {
        return [
          item.mesAno,
          item.quantidadeMultas,
          Number(item.valorMultas).toFixed(2)
        ];
      })
    };

    this.indicadores.principaisMotivos = {
      filter: dados.infracoesMotivos,
      data: dados.infracoesMotivos.map(item => {
        return [
          item.descricaoInfracao,
          item.quantidadeMultas,
          this.currencyService.transform(item.valorMultas, 'BRL')
        ];
      })
    };

    this.indicadores.infracoesHorario = {
      filter: dados.infracoesHorarios,
      data: dados.infracoesHorarios.map(item => {
        return [
          item.faixaHorario,
          Number(Number(item.porcentagemMultas * 100).toFixed(2))
        ];
      })
    };

    this.indicadores.infracoesDiaSemana = {
      filter: dados.infracoesDia,
      data: dados.infracoesDia.map(item => {
        return [
          item.diaSemana,
          Number(Number(item.porcentagemMultas * 100).toFixed(2))
        ];
      })
    };

    this.indicadores.infracoesHorarioComercial = {
      filter: dados.infracoesHorarioComercial,
      data: dados.infracoesHorarioComercial.map(item => {
        return [
          item.faixaHorario,
          Number(Number(item.porcentagemMultas * 100).toFixed(2))
        ];
      })
    };

    this.indicadores.principaisPlacas = {
      filter: dados.placaInfratoras,
      data: dados.placaInfratoras.map(item => {
        return [
          item.placa,
          item.quantidadeMultas,
          this.currencyService.transform(Number(Number(item.valorMultas).toFixed(2)), 'BRL')
        ];
      })
    };

    this.indicadores.infracoesNIC = {
      filter: dados.placasInfratorasNic,
      data: dados.placasInfratorasNic.map(item => {
        return [
          item.placa,
          item.quantidadeMultas,
          this.currencyService.transform(Number(item.valorMultas).toFixed(2), 'BRL')
        ];
      })
    };

    this.indicadores.prazoIdentificacao = {
      filter: dados.vencimentoNotificacao,
      data: dados.vencimentoNotificacao.map(item => {
        let arr: any[] = null;

        if (item.mesVencimentoNotificacao) {
          arr = [
            `${item.mesVencimentoNotificacao}/${item.anoVencimentoNotificacao}`,
            item.quantidadeMultas,
            this.currencyService.transform(Number(item.valorMultas).toFixed(2), 'BRL')
          ];
        }

        return arr;
      })
    };

    this.indicadores.infracoesCentroCusto = {
      filter: dados.infracoesCentroCusto,
      data: dados.infracoesCentroCusto.map(item => {
        let arr: any[] = null;

        if (!_.isNil(item.descricaoCentroCusto) && !_.isNil(item.porcentagemMultas)) {
          arr = [
            item.descricaoCentroCusto,
            item.porcentagemMultas
          ];
        }

        return arr;
      })
    };

    this.indicadores.infracoesCentroCusto.data = this.indicadores.infracoesCentroCusto.data.filter(value => !_.isNil(value));
    this.indicadores.prazoIdentificacao.data = this.indicadores.prazoIdentificacao.data.filter(Boolean);
    this.indicadores.principaisPlacas.data.sort((a, b) => {
      return b[1] - a[1];
    });

    this.montarCharts();
  }

  private montarCharts(): void {
    this.charts = [{
      label: 'PORTAL.INDICADORES_INFRACOES.LABEL.CHART_INFRACOES_PERIODO_MES',
      mock: false,
      show: Util.hasPermission('INDICADORES_INFRACOES_MES'),
      columnChart: {
        label: this.translate.instant('PORTAL.INDICADORES_INFRACOES.LABEL.CHART_INFRACOES_PERIODO_MES'),
        canFilter: true,
        id: 'periodoMes',
        columnWidth: '20px',
        verticalTitle: 'Quantidade',
        horizontalTitle: '',
        position: {
          left: '10%',
          top: '0',
          bottom: '15%'
        },
        top: 0,
        left: 0,
        backgroundColor: 'transparent',
        columns: ['Título', { label: 'Infrações', type: 'number' }, { label: 'Valor Infração', type: 'number' }],
        series: {
          0: { targetAxisIndex: 0 },
          1: { targetAxisIndex: 1, type: 'line' }
        },
        legend: {
          position: 'bottom'
        },
        data: this.indicadores.infracoesPeriodo
      }
    }, {
      label: 'PORTAL.INDICADORES_INFRACOES.LABEL.CHART_INFRACOES_PERIODO_DIA',
      mock: false,
      show: Util.hasPermission('INDICADORES_INFRACOES_DIA'),
      pieChart: {
        label: this.translate.instant('PORTAL.INDICADORES_INFRACOES.LABEL.CHART_INFRACOES_PERIODO_DIA'),
        canFilter: true,
        id: 'periodoDia',
        verticalTitle: 'Valor R$',
        horizontalTitle: 'Meses',
        pieHoleSize: '  0.5',
        position: {
          left: 70
        },
        columns: ['Título', { label: 'Porcentagem', type: 'number' }],
        data: this.indicadores.infracoesDiaSemana
      }
    }, {
      label: 'PORTAL.INDICADORES_INFRACOES.LABEL.CHART_INFRACOES_HORARIOS',
      mock: false,
      show: Util.hasPermission('INDICADORES_INFRACOES_HORARIO'),
      pieChart: {
        label: this.translate.instant('PORTAL.INDICADORES_INFRACOES.LABEL.CHART_INFRACOES_HORARIOS'),
        canFilter: true,
        id: 'infracoesHorarios',
        verticalTitle: '',
        horizontalTitle: '',
        pieHoleSize: '  0.5',
        position: {
          left: 70
        },
        columns: ['Título', { label: 'Porcentagem', type: 'number' }],
        data: this.indicadores.infracoesHorario
      }
    }, {
      label: 'PORTAL.INDICADORES_INFRACOES.LABEL.CHART_DESPESA_MULTAS',
      mock: false,
      show: Util.hasPermission('INDICADORES_INFRACOES_DESPESA'),
      pieChart: {
        label: this.translate.instant('PORTAL.INDICADORES_INFRACOES.LABEL.CHART_DESPESA_MULTAS'),
        canFilter: true,
        id: 'despesaMultas',
        verticalTitle: 'Valor R$',
        horizontalTitle: 'Meses',
        pieHoleSize: '  0.5',
        position: {
          left: 70
        },
        columns: ['Título', { label: 'Porcentagem', type: 'number' }],
        data: this.indicadores.infracoesHorarioComercial
      }
    }, {
      label: 'PORTAL.INDICADORES_INFRACOES.LABEL.CHART_PRINCIPAIS_PLACAS',
      mock: false,
      show: Util.hasPermission('INDICADORES_INFRACOES_PLACAS'),
      barChart: {
        showCar: false,
        label: this.translate.instant('PORTAL.INDICADORES_INFRACOES.LABEL.CHART_PRINCIPAIS_PLACAS'),
        canFilter: true,
        verticalTitle: 'Placas',
        id: 'placa',
        horizontalTitle: '',
        position: {
          left: '20%',
          top: '0',
          bottom: '15%'
        },
        width: '100%',
        top: 0,
        left: 0,
        backgroundColor: 'transparent',
        columns: ['Valor', { label: 'Valor (R$)', type: 'number' }, { role: 'annotation' }],
        data: this.indicadores.principaisPlacas
      }
    }, {
      label: 'PORTAL.INDICADORES_INFRACOES.LABEL.CHART_PRINCIPAIS_MOTIVOS',
      mock: false,
      show: Util.hasPermission('INDICADORES_INFRACOES_MOTIVOS'),
      barChart: {
        showCar: false,
        label: this.translate.instant('PORTAL.INDICADORES_INFRACOES.LABEL.CHART_PRINCIPAIS_MOTIVOS'),
        canFilter: true,
        id: 'infracaoId',
        legendFontSize: 10,
        titleFontSize: 10,
        tooltipFontSize: 10,
        isStacked: 'absolute',
        hAxis: {
          labelFontSize: 10,
        },
        verticalTitle: 'Motivos',
        columns: ['Título', { label: 'Quantidade', type: 'number' }, { role: 'annotation' }],
        data: this.indicadores.principaisMotivos,

        position: {
          left: '70%',
          top: '5%',
          bottom: '15%'
        },
        width: '100%',
        top: 0,
        left: 0, chartArea: { width: '50%', height: '100%' }
      }
    }, {
      label: 'PORTAL.INDICADORES_INFRACOES.LABEL.CHART_INFRACOES_NIC',
      mock: false,
      show: Util.hasPermission('INDICADORES_INFRACOES_NIC'),
      barChart: {
        showCar: false,
        label: this.translate.instant('PORTAL.INDICADORES_INFRACOES.LABEL.CHART_INFRACOES_NIC'),
        canFilter: true,
        id: 'placa',
        columns: ['Título', { label: 'Quantidade', type: 'number' }, { role: 'annotation' }],
        data: this.indicadores.infracoesNIC
      }
    }, {
      label: 'PORTAL.INDICADORES_INFRACOES.LABEL.CHART_PRAZO_IDENTIFICACAO',
      mock: false,
      show: Util.hasPermission('INDICADORES_INFRACOES_IDENTIFICACAO'),
      barChart: {
        showCar: false,
        label: this.translate.instant('PORTAL.INDICADORES_INFRACOES.LABEL.CHART_PRAZO_IDENTIFICACAO'),
        canFilter: true,
        id: 'prazoIdentificacao',
        columnWidth: '50px',
        verticalTitle: '',
        horizontalTitle: '',
        columns: ['Título', { label: '', type: 'number' }, { role: 'annotation' }],
        data: this.indicadores.prazoIdentificacao
      }
    }, {
      label: 'PORTAL.INDICADORES_INFRACOES.LABEL.CHART_DESPESAS_MULTAS',
      show: Util.hasPermission('INDICADORES_INFRACOES_DESPESAS'),
      mock: false,
      pieChart: {
        label: this.translate.instant('PORTAL.INDICADORES_INFRACOES.LABEL.CHART_DESPESAS_MULTAS'),
        canFilter: false,
        id: 'despesasMultas',
        verticalTitle: '',
        horizontalTitle: '',
        pieHoleSize: '0',
        columns: ['Título', { label: 'Porcentagem', type: 'number' }],
        data: this.indicadores.infracoesCentroCusto
      }
    }];

    this.showDashboard = true;
    this.filtroIndicadores.graficosHtml = this.graficos.nativeElement;
  }
}
