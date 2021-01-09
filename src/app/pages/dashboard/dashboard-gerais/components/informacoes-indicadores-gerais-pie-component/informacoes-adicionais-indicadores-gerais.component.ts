import { Component, Input } from '@angular/core';
import { InformacoesAdicionaisGraficosMV } from 'src/app/shared/interfaces/informacoes-adicionais.model';

@Component({
  selector: 'app-informacoes-adicionais-indicadores-gerais-component',
  templateUrl: './informacoes-adicionais-indicadores-gerais.component.html',
  styleUrls: ['./informacoes-adicionais-indicadores-gerais.component.scss']
})
export class InformacoesAdicionaisIndicadoresGeraisComponent {
  @Input() cards: InformacoesAdicionaisGraficosMV[];

  constructor() { }

  carregarDadosAdicionaisIndicadoresGeraisLineChart() {
    const info1 = {
      icon: 'pfu-icone-financeiro',
      label: 'Total Despesas',
      value: 2000
    };
    const info2 = {
      icon: 'pfu-icone-financeiro',
      label: 'Total Locação',
      value: 3000
    };
    const info3 = {
      icon: 'pfu-icone-financeiro',
      label: 'Total Extras',
      value: 4000
    };
  }

  carregarDadosAdicionaisIndicadoresGeraisPieChart() {
    const info1 = {
      icon: 'pfu-icone_sinistro',
      label: 'Sinistro',
      value: 20
    };
    const info2 = {
      icon: 'pfu-icone-condutor',
      label: 'Qtd Culpa Condutor',
      value: 30
    };
    const info3 = {
      icon: 'pfu-icone-pt',
      label: 'Qtd PT',
      value: 40
    };
  }

  carregarDadosAdicionaisIndicadoresGeraisBarChart() {
    const info1 = {
      icon: 'pfu-icon-dash-car',
      label: 'Qtd Total',
      value: 20
    };
    const info2 = {
      icon: 'pfu-icone-calendar',
      label: 'Idade Média',
      value: 30
    };
    const info3 = {
      icon: 'pfu-icon-dash-car',
      label: 'Qtd Modelos Ativos',
      value: 40
    };
  }

  carregarDadosAdicionaisIndicadoresGeraisSteppedAreaChart() {
    const info1 = {
      icon: 'pfu-icone-atend',
      label: 'Qtde Atendimentos',
      value: 20
    };
    const info2 = {
      icon: 'pfu-icone-usuario-lar',
      label: '% Abertura Usuário',
      value: 80
    };
    const info3 = {
      icon: 'pfu-icone-atend',
      label: '% Manual. Preventida',
      value: 70
    };
  }

  carregarDadosAdicionaisIndicadoresGeraisColumnChart() {
    const info1 = {
      icon: 'pfu-icone-avarias',
      label: 'Valor Total',
      value: 10000
    };
    const info2 = {
      icon: 'pfu-icone-avarias',
      label: 'Número de Chamadas',
      value: 800
    };
    const info3 = {
      icon: 'pfu-icone-dash-avarias',
      label: 'Manutenção',
      value: 680
    };
    const info4 = {
      icon: 'pfu-icone-dash-avarias',
      label: 'Sinistros',
      value: 20
    };
  }

  carregarDadosAdicionaisIndicadoresGeraisColumnChartInfracoes() {
    const info1 = {
      label: 'Nº de Multas',
      value: 56
    };
    const info2 = {
      label: 'Despesas com Multas',
      value: 'R$ 8.982'
    };
    const info3 = {
      label: 'Despesa Média',
      value: 'R$ 160,40'
    };
  }

}
