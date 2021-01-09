import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ReplaySubject } from 'rxjs';
import * as XLSX from 'xlsx';
import { AuthService } from '../../../core/services/auth.service';
import { MultasService } from '../../../core/services/multas.service';
import { SnackBarService } from '../../../core/services/snack-bar.service';
import { ColunasTabelaMV } from '../../../shared/interfaces/colunas-tabela.model';
import { MultasMV } from '../../../shared/interfaces/multas.model';
import { PermissoesAcessoMV } from '../../../shared/interfaces/permissoes-acesso.model';
import { takeUntilDestroy } from '../../../shared/take-until-destroy';
import { TipoInfracaoDescricao, TipoInfracaoEnum } from 'src/assets/data/enums/tipo-infracao.enum';
import { MultasAcompanhamentosService } from 'src/app/core/services/multas-acompanhamentos.service';
import { environment } from 'src/environments/environment';
import { ArquivoService } from 'src/app/core/services/arquivos.service';
import { StatusNotificacaoEnum, StatusNotificacao, StatusNotificacaoDescricao } from 'src/assets/data/enums/status-notificacao.enum';


@Component({
  selector: 'app-indicacao-eletronica',
  templateUrl: './indicacao-eletronica.component.html',
  styleUrls: ['./indicacao-eletronica.component.scss']
})
export class IndicacaoEletronicaComponent implements OnInit, OnDestroy {
  filtro: any;
  filtroFull: any;
  multas: Array<MultasMV> = [];
  allMultas: Array<MultasMV> = [];

  dataInputSubj = new ReplaySubject<any>(1);

  showTable: boolean;
  paginar = true;
  showExport = false;

  totalRows: number;
  numPage = 1;
  numRows = 20;

  constructor(
    private multasService: MultasService,
    private translate: TranslateService,
    private snackBar: SnackBarService,
    private router: Router,
    private arquivosService: ArquivoService

  ) { }

  ngOnInit() {
    if (sessionStorage.getItem('filtro')) {
      this.filtroFull = JSON.parse(sessionStorage.getItem('filtro'));
      sessionStorage.removeItem('filtro');
    }
  }

  setFiltro(filter: any): void {
    this.filtro = filter;

    this.getMultas();
  }

  getMultas(eventTable?: any): void {
    this.filtro.paginar = this.paginar;
    this.filtro.numRows = this.paginar ? this.numRows : null;

    if (eventTable) {
      this.filtro.numPage = this.paginar ? eventTable : null;
    } else {
      this.filtro.numPage = this.paginar ? this.numPage : null;
    }

    if (this.filtro.paginar && this.filtro.numPage === 1) {
      this.showTable = false;
    }

    this.multasService.getAll(this.filtro)
      .pipe(takeUntilDestroy(this))
      .subscribe(res => {
        if (this.paginar) {
          this.multas = res.data.results.map(value => {
            value.action = true;
            value.icones = [
              {
                function: this.detalhesMulta.bind(this),
                label: 'Detalhes da multa',
                info: false,
                show: true,
                svg: 'pfu-detalhes-frota'
              },
              {
                function: this.visualizarMulta.bind(this),
                label: 'Visualizar multa',
                info: false,
                show: true,
                svg: 'pfu-detalhe-multa'
              },
              {
                function: this.indicarMulta.bind(this),
                label: 'Indicar multa',
                info: false,
                show: (value.descricaoTipoInfracao === TipoInfracaoDescricao.get(TipoInfracaoEnum.NOTIFICACAO) && (value.idStatusIndicacaoNotificacao !== StatusNotificacaoEnum.IA)),
                svg: 'pfu-indicar-multa'
              },
              {
                function: this.visualizarEmails.bind(this),
                label: this.translate.instant('PORTAL.NOTIFICACAO_MULTA.LABELS.VISUALIZAR_EMAILS'),
                info: false,
                show: true,
                svg: 'pfu-email-icon'
              }
            ];
            value.status = StatusNotificacaoDescricao.get(value.idStatusIndicacaoNotificacao);
            if (value.status === undefined || value.status === null) {
              value.status = StatusNotificacaoDescricao.get(1);
            }

            return value;
          });
          this.totalRows = res.data.totalRows;
          this.showExport = this.totalRows > 0;
        } else {
          this.exportar(res.data.results);
        }

        this.showTable = true;
      }, res => {
        this.multas = [];
        this.showTable = true;
        this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
      });
  }

  limparTable(): void {
    this.multas = [];
    this.showTable = false;
  }

  getAllMultas(): void {
    this.paginar = false;
    this.getMultas();
  }

  getPermissao(): PermissoesAcessoMV {
    if (!AuthService.getRouteRoles()) {
      return {};
    }

    return AuthService.getRouteRoles();
  }

  private getIconesStatus(): any[] {
    return [
      {
        label: 'E-mail',
        svg: 'pfu-email-multa',
        iconColor: this.getIconColor.bind(this),
        lineColor: this.getLineColor.bind(this)
      },
      {
        label: 'Associar Condutor',
        svg: 'pfu-associar-condutor-branco',
        iconColor: this.getIconColor.bind(this),
        lineColor: this.getLineColor.bind(this)
      },
      {
        label: 'Documentação',
        svg: 'pfu-documentacao-multa',
        iconColor: this.getIconColor.bind(this),
        lineColor: this.getLineColor.bind(this)
      }
    ];
  }

  getColunasTabela(): ColunasTabelaMV[] {
    const colunas: ColunasTabelaMV[] = [
      {
        description: this.translate.instant('PORTAL.NOTIFICACAO_MULTA.LABELS.NUMERO_AIT'), columnDef: 'numeroAit', style: {
          minWidth: 70,
        }
      },
      {
        description: this.translate.instant('PORTAL.NOTIFICACAO_MULTA.LABELS.PLACA'), columnDef: 'placa', placa: true, style: {
          minWidth: 70,

        }
      },
      {
        description: this.translate.instant('PORTAL.NOTIFICACAO_MULTA.LABELS.INFRACAO'), columnDef: 'infracao', style: {
          minWidth: 150,
        }
      },
      {
        description: this.translate.instant('PORTAL.NOTIFICACAO_MULTA.LABELS.VALOR_COBRADO'),
        columnDef: 'valorCobrado',
        currency: true,
      },
      {
        description: this.translate.instant('PORTAL.NOTIFICACAO_MULTA.LABELS.DATA_EMISSAO'), columnDef: 'dataEmissao'
      },
      {
        description: this.translate.instant('PORTAL.NOTIFICACAO_MULTA.LABELS.DATA_VENCIMENTO'), columnDef: 'dataVencimento'
      },
      {
        description: this.translate.instant('PORTAL.NOTIFICACAO_MULTA.LABELS.NOME_INDICADO'), columnDef: 'nomeMotorista', style: {
          minWidth: 140,
        }
      },
      {
        description: this.translate.instant('PORTAL.NOTIFICACAO_MULTA.LABELS.STATUS'),
        columnDef: 'status',
      },
      {
        description: this.translate.instant('PORTAL.NOTIFICACAO_MULTA.LABELS.ACOES'), columnDef: 'action', action: true, style: {
          minWidth: 140,
        }
      }
    ];

    return colunas;
  }

  getIconColor() {
    return 'icone_azul';
  }

  getLineColor() {
    return 'mat-stepper-line-blue';
  }

  private indicarMulta(multa: MultasMV): void {
    multa.cliente = this.filtro.cliente;
    this.setMultaSelecionada(multa);
    const multaSelecionada = JSON.stringify(multa);
    sessionStorage.setItem('multa', multaSelecionada);
    sessionStorage.setItem('filtro', JSON.stringify(this.filtro));
    this.router.navigate([`gerenciador-infracoes/indicacoes-eletronicas/${multa.multaId}`]);
  }

  private visualizarMulta(multa: MultasMV): void {
    const api = 'MULTAS';
    this.arquivosService.getAll('NOTIFICACAO', multa.multaId, 'OUTROS', api).subscribe(res => {
      if (res.data.length > 0) {
        window.open(environment.APIArquivos + res.data[res.data.length - 1].href);
      } else {
        this.snackBar.open('Não existe anexo para esta infração', 3500, 'X')
      }
    });
  }

  private setMultaSelecionada(multa: MultasMV): void {
    this.multasService.set(multa);
  }

  private detalhesMulta(multa: MultasMV): void {
    window.sessionStorage.setItem('filtro', JSON.stringify(this.filtro))
    window.sessionStorage.setItem('infracao', JSON.stringify(multa));
    this.router.navigate([`gerenciador-infracoes/detalhes-infracao/${multa.multaId}`]);
  }

  public exportar(multas: any[]): void {
    const data = [];
    multas.forEach((element) => {
      const dataTemp = {};

      this.getColunasTabela().forEach(column => {
        dataTemp[column.description] = element[column.columnDef];
      });

      data.push(dataTemp);
    });

    this.allMultas = [];
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'Lista-Multas.xlsx');

    this.paginar = true;
  }

  visualizarEmails(multa: MultasMV) {
    window.sessionStorage.setItem('filtro', JSON.stringify(this.filtro))
    window.sessionStorage.setItem('infracao', JSON.stringify(multa));
    this.router.navigate(['gerenciador-infracoes/emails-indicacoes-lista']);
  }

  ngOnDestroy(): void { }
}
