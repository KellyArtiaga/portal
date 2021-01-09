import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import html2canvas from 'html2canvas';
import * as jspdf from 'jspdf';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
import { FiltroIndicadoresStorage } from 'src/app/core/services/filtro-indicadores-storage.service';
import { ChartsMV } from '../../interfaces/charts.model';
import { ChartModalComponent } from '../chart-modal/chart-modal.component';

@Component({
  selector: 'app-card-chart',
  templateUrl: './card-chart.component.html',
  styleUrls: ['./card-chart.component.scss']
})
export class CardChartComponent implements OnInit {

  @Input() charts: any[];
  @Input() functionFiltro: string;
  @Input() formFiltro: any;
  @Input() indicadoresGerais?: boolean;

  constructor(
    private modalService: NgbModal,
    private filtroIndicadorService: FiltroIndicadoresStorage,
    private router: Router
  ) { }

  ngOnInit(): void {
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
  }

  baixarPDF(): void {

    const svgElements = document.body.querySelectorAll('svg');
    svgElements.forEach(function (item) {
      item.setAttribute('width', String(item.getBoundingClientRect().width));
      item.style.width = null;
    });

    html2canvas(this.filtroIndicadorService.graficosHtml, { allowTaint: true }).then(canvas => {
      const imgWidth = 208;
      const pageHeight = 295;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      const heightLeft = imgHeight;

      const contentDataURL = canvas.toDataURL('image/png');
      const pdf = new jspdf('p', 'mm', 'a4');
      const position = 0;
      pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
      pdf.save('MYPdf.pdf'); // Generated PDF
    });

    return;

    html2canvas(this.filtroIndicadorService.graficosHtml).then(canvas => {
      const contentDataURL = canvas.toDataURL('image/png');
      const pdf = new jspdf('p', 'mm', 'a4');

      const pageHeight = 295;
      const imageWidth = 208;
      const imageHeight = canvas.height * imageWidth / canvas.width;

      let position = 10;
      let heightLeft = imageHeight;

      pdf.addImage(contentDataURL, 'PNG', 0, position, imageWidth, imageHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position += heightLeft - imageHeight; // top padding for other pages
        pdf.addPage();
        pdf.addImage(contentDataURL, 'PNG', 0, position, imageWidth, imageHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('Graficos.pdf');
    });
  }

  downloadExcel(): void {
    const filtro = this.filtroIndicadorService.filtroPesquisa;
    filtro.base = true;

    this.filtroIndicadorService.currentService[this.filtroIndicadorService.methodService](filtro).subscribe(res => {
      this.filtroIndicadorService.exportMethod(res.data);
    });
  }

  expandirChart(chartData: ChartsMV): void {
    const modal = this.modalService.open(ChartModalComponent);
    const chartType = this.verifyChartType(chartData);

    modal.componentInstance.modalChartTitle = chartData.label;
    modal.componentInstance.chartType = chartType;
    modal.componentInstance.chartData = chartData[chartType];
    modal.componentInstance.cards = chartData.cards;
    modal.componentInstance.filterFunction = this.functionFiltro;

    modal.result.then(res => {
      this.filtroIndicadorService.modalClose = null;
    });
  }

  verifyChartType(chart: any): any {
    const keys = Object.keys(chart);
    let chartType: any;

    if (keys && keys.length > 0) {
      chartType = keys.map(item => {
        if (typeof item === 'string' && item !== 'label') {
          return item;
        }
      });
    }

    chartType = chartType.filter(Boolean);

    return chartType.filter(item => item.includes('tableDetails') || item.toLowerCase().includes('chart'))[0];
  }

  getMockClass(chart: any): any {
    if (chart.mock || chart.mock === undefined || chart.mock == null) {
      return 'mock-card';
    }
    return '';
  }

  goTo(url: string): void {
    this.filtroIndicadorService.filtroPesquisa = this.formFiltro;

    this.router.navigateByUrl(url);
  }

}
