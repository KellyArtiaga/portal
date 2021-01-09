import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ControlePreventivaService } from 'src/app/core/services/controle-preventiva.service';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';
import { ColunasTabelaMV } from 'src/app/shared/interfaces/colunas-tabela.model';
import { Status } from 'src/assets/data/enums/status.enum';
import { TipoUtilizacao } from 'src/assets/data/enums/tipo-utilizacao.enum';
import { ProcessoMV } from 'src/app/shared/interfaces/processo.model';

@Component({
  selector: 'app-modal-detalhes',
  templateUrl: './modal-detalhes.component.html',
  styleUrls: ['./modal-detalhes.component.scss']
})
export class ModalDetalhesComponent implements OnInit {
  data: any;
  revisoes: any;
  icone: any;
  cliente: any;

  detalhesRecuperados: boolean;
  isNormal: boolean;
  isSevero: boolean;
  isMisto: boolean;

  processos: ProcessoMV[];

  totalRows: number;

  tipoUtilizacao: string;
  lineOneTitle: string;
  lineTwoTitle: string;

  constructor(
    private controlePreventivaService: ControlePreventivaService,
    private snackBar: SnackBarService,
    private router: Router,
    private modal: NgbActiveModal,
    private translateService: TranslateService
  ) { }

  ngOnInit() {
    this.lineOneTitle = this.translateService.instant('PORTAL.CONTROLE_PREVENTIVAS.LBL_REAL');
    this.lineTwoTitle = this.translateService.instant('PORTAL.CONTROLE_PREVENTIVAS.LBL_IDEAL');
    this.isMisto = this.tipoUtilizacao === TipoUtilizacao.MISTO;
    this.isNormal = this.tipoUtilizacao === TipoUtilizacao.NORMAL;
    this.isSevero = this.tipoUtilizacao === TipoUtilizacao.SEVERO;
    this.detalhesRecuperados = false;
    this.getRevisoes();
    this.icone = { svg: 'pfu-car-icon' };
  }

  getRevisoes() {
    this.controlePreventivaService.all(this.data, 'detalhe').subscribe(res => {
      this.filterResult(res.data.results);
      this.definePeriodicity();
      this.convertToProcessos();
      this.totalRows = this.revisoes.length;
      this.detalhesRecuperados = true;
    }, error => {
      this.snackBar.open(error.message, 3000);
    });
  }

  filterResult(data: any): void {
    this.revisoes = data.filter(element => element.status !== Status.NO_PRAZO);
    const revisoesNoPrazo = data.filter(element => element.status === Status.NO_PRAZO);
    if (revisoesNoPrazo.length !== 0) {
      revisoesNoPrazo.length >= 2 ? this.revisoes.push.apply(this.revisoes, revisoesNoPrazo.slice(0, 2)) :
        this.revisoes.push(revisoesNoPrazo.first());
    }
  }

  definePeriodicity(): void {
    this.revisoes = this.revisoes.map(element => {
      const index = this.revisoes.indexOf(element);
      if (index !== 0) {
        element.intervaloPeriodicidadeReal = element.intervaloPeriodicidadeReal + this.revisoes[index - 1].intervaloPeriodicidadeReal;
      }
      return element;
    });
  }

  convertToProcessos() {
    this.processos = this.revisoes.map(element => {
      const processo: ProcessoMV = {
        status: element.status,
        infoLinha1: '-', // Calcular situação do tempo atual
        infoLinha2: `${element.intervaloPeriodicidadeReal} meses`
      };
      return processo;
    });
  }

  getColunasTabela(): ColunasTabelaMV[] {
    const colunas: ColunasTabelaMV[] = [
      { description: this.translateService.instant('PORTAL.LABELS.LBL_REVISAO'), columnDef: 'revisao' },
      { description: this.translateService.instant('PORTAL.CONTROLE_PREVENTIVAS.LBL_DATA_REVISAO'), columnDef: 'dataRevisao', date: true },
      { description: this.translateService.instant('PORTAL.CONTROLE_PREVENTIVAS.LBL_KM_REVISAO'), columnDef: 'kmRevisao' },
      { description: this.translateService.instant('PORTAL.LABELS.LBL_STATUS'), columnDef: 'status' },
      { description: this.translateService.instant('PORTAL.CONTROLE_PREVENTIVAS.LBL_TIPO_UTILIZACAO'), columnDef: 'tipoUtilizacao' }
    ];
    return colunas;
  }

  goToManutencoesRealizadas() {
    this.modal.close();
    const veiculo = {
      placa: this.revisoes[0].placa,
      modelo: this.revisoes[0].modelo
    };

    const dadosPesquisa = {
      veiculoId: this.data.veiculoId,
      clientes: this.cliente,
      veiculo: veiculo
    };
    const dadosVeiculo: NavigationExtras = {
      queryParams: { 'pesquisa': JSON.stringify(dadosPesquisa) },
      fragment: 'anchor',
      skipLocationChange: true
    };
    this.router.navigate(['gerenciador-atendimento/manutencoes-realizadas'], dadosVeiculo);
  }
}
