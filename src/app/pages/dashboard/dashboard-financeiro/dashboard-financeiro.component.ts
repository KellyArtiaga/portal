import { CurrencyPipe } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { FiltroIndicadoresStorage } from 'src/app/core/services/filtro-indicadores-storage.service';
import { FinanceiroService } from 'src/app/core/services/financeiro.service';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';
import { ChartsMV } from 'src/app/shared/interfaces/charts.model';
import { Util } from 'src/app/shared/util/utils';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-dashboard-financeiro',
  templateUrl: './dashboard-financeiro.component.html',
  styleUrls: ['./dashboard-financeiro.component.scss']
})
export class DashboardFinanceiroComponent {
  @ViewChild('graficos') graficos: ElementRef;

  functionSearch = this.getResponse.bind(this);
  clearFunction = this.limparCharts.bind(this);

  notFoundResults = false;
  showDashboard = false;

  colunasExcel: any[];
  totalizadores: any[];
  charts: ChartsMV[];

  constructor(
    private currencyService: CurrencyPipe,
    private translate: TranslateService,
    private snackBar: SnackBarService,
    private financeiroService: FinanceiroService,
    private filtroIndicadores: FiltroIndicadoresStorage
  ) { }

  private montarTotalizadores(totalizador: any): void {
    this.totalizadores = [
      {
        nome: 'TOTAL DESPESA',
        valor: `${this.currencyService.transform(totalizador.valorTotal ? totalizador.valorTotal : 0, 'BRL')}`,
        show: Util.hasPermission('INDICADORES_FINANCEIROS_CARD_DESPESA')
      },
      {
        nome: 'TOTAL LOCAÇÃO',
        valor: `${this.currencyService.transform(totalizador.valorTotalLocacao ? totalizador.valorTotalLocacao : 0, 'BRL')}`,
        show: Util.hasPermission('INDICADORES_FINANCEIROS_CARD_LOCACAO')
      },
      {
        nome: 'TOTAL EXTRAS ',
        valor: `${this.currencyService.transform(totalizador.valorTotalExtra ? totalizador.valorTotalExtra : 0, 'BRL')}`,
        show: Util.hasPermission('INDICADORES_FINANCEIROS_CARD_EXTRAS')
      }
    ];
  }

  private getResponse(formValue: any): void {
    this.filtroIndicadores.filtroPesquisa = formValue;
    this.filtroIndicadores.currentService = this.financeiroService;
    this.filtroIndicadores.methodService = 'getResponseGraficos';
    this.filtroIndicadores.exportMethod = this.exportarExcel.bind(this);

    this.financeiroService.getResponseGraficos(formValue).subscribe(res => {
      if (_.isNil(res.data.financeiroCards)) {
        this.notFoundResults = true;
        this.showDashboard = false;
        this.charts = [];
        this.snackBar.open(this.translate.instant('PORTAL.NAO_HA_DADOS'), 3500, 'X');
        return;
      }

      this.montarTotalizadores(res.data.financeiroCards[0]);
      this.formatarDadosCharts(res.data);
    }, res => {
      this.notFoundResults = true;
      this.showDashboard = false;
      this.charts = [];

      if (res.error && res.error.message && res.error.message.error && res.error.message.error.includes('Nenhum')) {
        this.snackBar.open(this.translate.instant('PORTAL.NAO_HA_DADOS'), 3500, 'X');
        return;
      }
      this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
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
    XLSX.writeFile(wb, 'Indicadores_Financeiro.xlsx');
  }

  private getColunasExcel(): any[] {
    this.colunasExcel = [{
      descricao: 'Data Emissão',
      key: 'DataEmissao'
    }, {
      descricao: 'Data de Vencimento',
      key: 'DataVencimento'
    }, {
      descricao: 'Documento',
      key: 'Documento'
    }, {
      descricao: 'Situação da Fatura',
      key: 'SituacaoFatura'
    }, {
      descricao: 'Tipo de Serviço',
      key: 'TipoServico'
    }, {
      descricao: 'Descrição',
      key: 'DetalheTipoServico'
    }, {
      descricao: 'Valor',
      key: 'ValorCobranca'
    }, {
      descricao: 'Status Pagamento',
      key: 'StatusPagamento'
    }, {
      descricao: 'Ano Fiscal',
      key: 'AnoFiscal'
    }, {
      descricao: 'Status do Veiculo',
      key: 'Status'
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
      key: 'CentroCusto'
    }, {
      descricao: 'Condutor',
      key: 'NomeCondutor'
    }, {
      descricao: 'Master',
      key: 'CodigoContratoMaster'
    }, {
      descricao: 'Localidade',
      key: 'Localidade'
    }];

    return this.colunasExcel;
  }

  private formatarDadosCharts(dados: any): void {
    const charts = {
      financeiroMes: {
        filter: dados.financeiroMes,
        data: dados.financeiroMes.map(item => {
          return [
            `${item.mesAno.split(', ')[0].substring(0, 3)}/${item.mesAno.split(', ')[1]}`,
            Number(item.valorAvarias ? item.valorAvarias : 0),
            this.currencyService.transform(item.valorAvarias ? item.valorAvarias : 0, 'BRL')
          ];
        })
      },
      financeiroContrato: {
        filter: dados.financeiroContrato.map(element => {
          element.id = element.contratoId;

          return element;
        }),
        data: dados.financeiroContrato.map(item => {
          return [
            `${String(item.contratoId)} - ${this.currencyService.transform(item.valorFinanceiro ? item.valorFinanceiro : 0, 'BRL')}`,
            Number(Number((item.porcentagemValorFinanceiro ? item.porcentagemValorFinanceiro : 0) * 100).toFixed(2)),
            this.currencyService.transform(item.valorFinanceiro ? item.valorFinanceiro : 0, 'BRL')
          ];
        })
      },
      financeiroServico: {
        filter: dados.financeiroServico,
        data: dados.financeiroServico.map(item => {
          return [
            item.tipoServico,
            Number(Number((item.porcentagemValorServico ? item.porcentagemValorServico : 0) * 100).toFixed(2)),
            this.currencyService.transform(item.valorServico ? item.valorServico : 0, 'BRL')
          ];
        })
      },
      financeiroDetalhesServico: {
        filter: dados.financeiroDetalhesServico,
        data: dados.financeiroDetalhesServico.map(item => {
          this.alterarDescServicosFinanceiros(item);
          return [
            item.detalheTipoServico,
            Number(item.valorDetalheTipoServico),
            this.currencyService.transform(item.valorDetalheTipoServico ? item.valorDetalheTipoServico : 0, 'BRL')
          ];
        })
      },
      financeiroPlacas: {
        filter: dados.financeiroPlacas,
        data: dados.financeiroPlacas.map(item => {
          return [
            item.placa,
            Number(item.valorFinanceiro),
            this.currencyService.transform(item.valorFinanceiro ? item.valorFinanceiro : 0, 'BRL')
          ];
        })
      }
    };

    this.montarCharts(charts);
  }

  private alterarDescServicosFinanceiros(descServicos: any): any {
    switch (descServicos.detalheTipoServico) {
      case 'LOCACAO': return descServicos.detalheTipoServico = 'Locação';
      case 'OS': return descServicos.detalheTipoServico = 'Km Excedente';
      case 'MULTARESCISORIA': return descServicos.detalheTipoServico = 'Multa Rescisoria';
      case 'COMBUSTIVEL': return descServicos.detalheTipoServico = 'Combustível';
      case 'OUTRASCOBRANCAS': return descServicos.detalheTipoServico = 'Outras Cobranças';
      case 'REQUISICAO': return descServicos.detalheTipoServico = 'N.A';
      case 'MOTORISTA': return descServicos.detalheTipoServico = 'N.A';
      case 'TERCEIROS': return descServicos.detalheTipoServico = 'Terceiros';
      case 'CUSTOS': return descServicos.detalheTipoServico = ' N.A';
    }
  }

  private montarCharts(values?: any): void {
    this.charts = [{
      label: 'PORTAL.INDICADORES_FINANCEIRO.LABEL.CHART_TIPO_SERVICO',
      show: Util.hasPermission('INDICADORES_FINANCEIROS_TIPO_SERVICO'),
      mock: false,
      pieChart: {
        label: this.translate.instant('PORTAL.INDICADORES_FINANCEIRO.LABEL.CHART_TIPO_SERVICO'),
        canFilter: true,
        id: 'tipoServico',
        pieHoleSize: ' 0.5',
        top: 0,
        left: 0,
        backgroundColor: 'transparent',
        columns: ['Título', { label: 'Porcentagem', type: 'number' }, { role: 'annotation' }],
        data: values.financeiroServico
      }
    }, {
      label: 'PORTAL.INDICADORES_FINANCEIRO.LABEL.CHART_EVOLUCAO_MENSAL',
      show: Util.hasPermission('INDICADORES_FINANCEIROS_EVOLUCAO_MENSAL'),
      mock: false,
      lineChart: {
        label: this.translate.instant('PORTAL.INDICADORES_FINANCEIRO.LABEL.CHART_EVOLUCAO_MENSAL'),
        canFilter: true,
        id: 'periodo',
        verticalTitle: 'Valor R$',
        horizontalTitle: 'Meses',
        position: {
          top: '0',
          left: '25%',
          bottom: '15%'
        },
        top: 0,
        left: 0,
        columns: ['Título', { label: 'Valor', type: 'number' }, { role: 'annotation' }],
        data: values.financeiroMes
      }
    }, {
      label: 'PORTAL.INDICADORES_FINANCEIRO.LABEL.CHART_CONTRATO',
      show: Util.hasPermission('INDICADORES_FINANCEIROS_CONTRATO'),
      mock: false,
      pieChart: {
        label: this.translate.instant('PORTAL.INDICADORES_FINANCEIRO.LABEL.CHART_CONTRATO'),
        canFilter: true,
        id: 'contratoId',
        pieHoleSize: ' 0.5',
        top: 0,
        left: 0,
        columns: ['Título', { label: 'Porcentagem', type: 'number' }, { role: 'annotation' }],
        data: values.financeiroContrato
      }
    }, {
      label: 'PORTAL.INDICADORES_FINANCEIRO.LABEL.CHART_DETALHAMENTO',
      show: Util.hasPermission('INDICADORES_FINANCEIROS_DETALHAMENTO_SERVICO'),
      mock: false,
      columnChart: {
        label: this.translate.instant('PORTAL.INDICADORES_FINANCEIRO.LABEL.CHART_DETALHAMENTO'),
        canFilter: false,
        id: 'detalhamento',
        columnWidth: '50px',
        verticalTitle: 'Valor (R$)',
        horizontalTitle: '',
        top: 0,
        left: 0,
        columns: ['Título', { label: 'Detalhe Serviço', type: 'number' }, { role: 'annotation' }],
        data: values.financeiroDetalhesServico
      }
    }, {
      label: 'PORTAL.INDICADORES_FINANCEIRO.LABEL.CHART_DESPESAS',
      show: Util.hasPermission('INDICADORES_FINANCEIROS_PLACAS'),
      mock: false,
      columnChart: {
        label: this.translate.instant('PORTAL.INDICADORES_FINANCEIRO.LABEL.CHART_DESPESAS'),
        canFilter: true,
        id: 'placa',
        columnWidth: '20px',
        top: 0,
        left: 0,
        verticalTitle: 'Valor (R$)',
        horizontalTitle: '',
        columns: ['Título', { label: 'Valor Financeiro', type: 'number' }, { role: 'annotation' }],
        data: values.financeiroPlacas
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
