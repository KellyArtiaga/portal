import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SolicitacaoSubstituicaoService } from 'src/app/core/services/solicitacao-substituicao.service';
import * as XLSX from 'xlsx';
import { SnackBarService } from '../../../core/services/snack-bar.service';
import { ColunasTabelaMV } from '../../../shared/interfaces/colunas-tabela.model';
import { VeiculoZeroKM } from '../../../shared/interfaces/veiculo-zero-km.model';
import { Util } from '../../../shared/util/utils';

@Component({
  selector: 'app-acompanhar-solicitacao-veiculo',
  templateUrl: './acompanhar-solicitacao-veiculo.component.html',
  styleUrls: ['./acompanhar-solicitacao-veiculo.component.scss']
})
export class AcompanharSolicitacaoVeiculoComponent implements OnInit {

  solicitacoes: VeiculoZeroKM[] = [];

  clearFilter = this.clearData.bind(this);
  filterData = this.pesquisar.bind(this);

  showTable: boolean;
  showExport = false;
  paginar = true;

  numPage = 1;
  numRows = 20;
  totalRows: number;
  filters: any;

  constructor(
    private snackBar: SnackBarService,
    private translate: TranslateService,
    private solicitacaoSubstituicaoService: SolicitacaoSubstituicaoService,
    private router: Router
  ) { }

  ngOnInit() { }

  pesquisar(filtros): void {
    this.paginar = true;
    this.getSolicitacoes(filtros);
  }

  getSolicitacoes(eventTable?: any) {
    this.paginar = !!this.paginar;

    if (typeof eventTable === 'object') {
      this.filters = eventTable;
    }
    if (this.paginar) {
      this.solicitacoes = [];
    }
    if (this.numPage === 1) {
      this.showTable = false;
    }

    this.filters.numPage = typeof eventTable === 'number' ? eventTable : this.numPage;
    this.filters.numRows = this.numRows;
    this.filters.paginar = this.paginar;

    this.solicitacaoSubstituicaoService.getAcompanhamentos(this.filters).subscribe(res => {
      if (this.paginar) {
        this.solicitacoes = res.data.results.map(values => {
          values.action = true;
          values.icones = [{
            function: this.editarSolicitacao.bind(this),
            label: this.translate.instant('PORTAL.LABELS.DETALHES_SOLICITACAO'),
            info: false,
            show: true,
            cssClass: this.getIconColor(values.situacaoSolicitacao),
            svg: 'pfu-list',
            id: 'iconList '
          },
          {
            function: this.visualizarEmails.bind(this),
            label: this.translate.instant('PORTAL.NOTIFICACAO_MULTA.LABELS.VISUALIZAR_EMAILS'),
            info: false,
            show: true,
            svg: 'pfu-email-icon'
          }];

          return values;
        });

        this.totalRows = res.data.totalRows || 0;
        this.showExport = this.totalRows > 0;
        this.showTable = true;
        return;
      }
      this.gerarExcel(res.data.results);
    }, err => {
      this.solicitacoes = [];
      this.showTable = true;
      this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  private getIconColor(situacao: string): string {
    if (situacao === 'Aprovado') {
      return 'icon-list-blue';
    } else if (situacao === 'Reprovado' || situacao === 'Cancelado') {
      return 'icon-list-red';
    } else {
      return 'icon-list';
    }
  }

  private editarSolicitacao(solicitacao: any): void {
    this.router.navigate([`gerenciador-frota/solicitar-veiculo/${solicitacao.id}`], {
      queryParams: {
        dataEmissao: solicitacao.dataEmissao,
        situacaoSolicitacao: solicitacao.situacaoSolicitacao
      },
      queryParamsHandling: 'merge'
    });
  }

  clearData(): void {
    this.solicitacoes = [];
    this.showTable = false;
    this.paginar = true;
  }

  showInsert(): void {
    this.router.navigateByUrl('gerenciador-frota/solicitar-veiculo');
  }

  exportExcel(): void {
    this.paginar = false;
    this.getSolicitacoes();
  }

  gerarExcel(allSolicitacoes: any): void {
    const data = [];
    allSolicitacoes.forEach((element) => {
      const dataTemp = {};
      const colunas = this.getColunasTabela();
      colunas.pop();

      colunas.forEach(column => {
        if (column.date) {
          dataTemp[column.description] = Util.formataData(element[column.columnDef], column.dateFormat);
        } else {
          dataTemp[column.description] = element[column.columnDef];
        }
      });

      data.push(dataTemp);
    });

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'Lista-Solicitacao-Veiculo.xlsx');

    this.paginar = true;
  }

  getColunasTabela() {
    const colunas: ColunasTabelaMV[] = [
      {
        description: this.translate.instant('PORTAL.ACOMPANHAR_SOLICITACAO_VEICULO.COLUMN.CODIGO'),
        columnDef: 'id',
        style: {
          minWidth: 100
        }
      },
      {
        description: this.translate.instant('PORTAL.ACOMPANHAR_SOLICITACAO_VEICULO.COLUMN.CLIENTE'),
        columnDef: 'nomeFantasia',
        style: {
          minWidth: 100
        }
      },
      {
        description: this.translate.instant('PORTAL.ACOMPANHAR_SOLICITACAO_VEICULO.COLUMN.DATA_EMISSAO'),
        columnDef: 'dataEmissao', date: true,
        style: {
          minWidth: 80
        }
      },
      {
        description: this.translate.instant('PORTAL.ACOMPANHAR_SOLICITACAO_VEICULO.COLUMN.MOTIVO'),
        columnDef: 'motivoSolicitacao',
        style: {
          minWidth: 145
        }
      },
      {
        description: this.translate.instant('PORTAL.ACOMPANHAR_SOLICITACAO_VEICULO.COLUMN.SOLICITANTE'),
        columnDef: 'nomeSolicitante',
        style: {
          minWidth: 150
        }
      },
      {
        description: this.translate.instant('PORTAL.ACOMPANHAR_SOLICITACAO_VEICULO.COLUMN.SITUACAO'),
        columnDef: 'situacaoSolicitacao',
        style: {
          minWidth: 100
        }
      },
      {
        description: this.translate.instant('PORTAL.LABELS.ACOES_TABELA'),
        columnDef: 'action',
        action: true,
        style: {
          minWidth: 70
        }
      },
    ];
    return colunas;
  }
  visualizarEmails(item: any): void {
    this.solicitacaoSubstituicaoService.veiculoSolicitacaoSelecionado = item;
    this.router.navigate(['gerenciador-frota/email-solicitar-veiculo']);
  }

}
