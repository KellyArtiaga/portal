import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { TipoInfracaoDescricao, TipoInfracaoEnum } from 'src/assets/data/enums/tipo-infracao.enum';
import { TranslateService } from '@ngx-translate/core';
import { ColunasTabelaMV } from 'src/app/shared/interfaces/colunas-tabela.model';
import { Router } from '@angular/router';
import { ModalInfoRecursoComponent } from './modal-info-recurso/modal-info-recurso.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DadosModalMV } from 'src/app/shared/interfaces/dados-modal.model';
import { DadosModalService } from 'src/app/core/services/dados-modal.service';
import { UserContextService } from 'src/app/core/services/user-context.service';
import { Util } from 'src/app/shared/util/utils';
import { MultasAcompanhamentosService } from 'src/app/core/services/multas-acompanhamentos.service';
import { ArquivoService } from 'src/app/core/services/arquivos.service';
import { environment } from 'src/environments/environment';
import { MultasService } from 'src/app/core/services/multas.service';

@Component({
  selector: 'app-detalhes-infracao',
  templateUrl: './detalhes-infracao.component.html',
  styleUrls: ['./detalhes-infracao.component.scss']
})
export class DetalhesInfracaoComponent implements OnInit, OnDestroy {
  infracao: any = {};
  isNotificacao: boolean;
  statusIndicacao: any = [];
  cliente: any;
  showTable: boolean = false;
  showTableEmail: boolean = false;
  showTableAnexo: boolean = false;
  emailInfracao: any = [];
  listaAnexos: any = [];

  condutor: any;

  showValue: any = {};
  constructor(
    private translate: TranslateService,
    private router: Router,
    private modal: NgbModal,
    private dadosModalService: DadosModalService,
    private userContext: UserContextService,
    private acompanhamentoService: MultasAcompanhamentosService,
    private arquivosService: ArquivoService,
    private multasService: MultasService
  ) { }

  ngOnInit() {
    this.cliente = this.userContext.getDados();
    Object.assign(this.infracao, JSON.parse(window.sessionStorage.getItem('infracao')));
    this.isNotificacao = this.infracao.descricaoTipoInfracao === TipoInfracaoDescricao.get(TipoInfracaoEnum.NOTIFICACAO);
    document.getElementById('tituloDetalhes').setAttribute('data-content', this.isNotificacao ?
      this.translate.instant('PORTAL.INDICACOES_ELETRONICAS.DETALHES_NOTIFICACAO') :
      this.translate.instant('PORTAL.INDICACOES_ELETRONICAS.DETALHES_INFRACAO'));
    document.getElementById('tituloHistoricoEmail').setAttribute('data-content', this.translate.instant('PORTAL.INDICACOES_ELETRONICAS.HISTORICO_EMAIL'));
    document.getElementById('tituloHistoricoAnexo').setAttribute('data-content', this.translate.instant('PORTAL.INDICACOES_ELETRONICAS.HISTORICO_ANEXO'));
    this.formatarDados();
  }

  formatarDados() {
    const api = "MULTAS"
    this.showValue.cliente = this.cliente.nomeCliente;
    this.showValue.placa = Util.formataPlaca(this.infracao.placa);
    this.showValue.dataHora = this.infracao.autuacao + Util.formatarHora(this.infracao.hora);
    this.showValue.dataVencimento = Util.formataData(this.infracao.dtLimiteFici);
    this.showValue.numeroAit = this.infracao.numeroAit;
    if (!this.isNotificacao) {
      this.showValue.dataVencimento = this.infracao.dataVencimento;
    }

    this.acompanhamentoService.getAcompanhamentosByMultaId(this.infracao.multaId).subscribe(res => {


      const body = { idMulta: this.infracao.multaId };
      this.multasService.getCondutorMulta(body).subscribe(resp => {

        this.condutor = resp.data[0];

      });

      if (this.isNotificacao) {
        res.data.results.forEach(element => {
          if (element.acao && element.acao === 'S') {
            let status = {
              status: element.descricao,
              data: element.dtInseridoEm
            }
            this.statusIndicacao.push(status);
          }
        })
        this.showTable = true;
        document.getElementById('tituloHistoricoStatusIndicacao').setAttribute('data-content',
          this.translate.instant('PORTAL.INDICACOES_ELETRONICAS.HISTORICO_STATUS_INDICACAO'));

      }


      // res.data.results.forEach(element => {
      //   if (element.acao && element.acao === 'E') {
      //     let email = {
      //       descricao: element.descricao,
      //       data: element.dtInseridoEm,
      //     }
      //     this.emailInfracao.push(email);
      //   }
      // });


      // this.showTableEmail = true;
    });
    this.arquivosService.getAll('NOTIFICACAO', this.infracao.multaId, undefined, api).subscribe(res => {
      this.showTableAnexo = false;
      res.data.forEach(element => {
        if (element.tipo === 'OUTROS' || element.tipo === 'TERMO_IMAGEM' || element.tipo === null)
          this.listaAnexos.push(element);
      });

      this.showTableAnexo = true;
    });

    this.arquivosService.getAll('MULTA', this.infracao.multaId, 'OUTROS', api).subscribe(res => {
      this.showTableAnexo = false;
      res.data.forEach(element => {
        this.listaAnexos.push(element);
      });

      this.showTableAnexo = true;
    });

    this.arquivosService.getAll('EMAIL_NOTIFICACAO_MULTA', this.infracao.multaId, undefined, api).subscribe(res => {
      this.showTableEmail = false;
      res.data.forEach(element => {
        if (element.descricao === "") {
          element.descricao = this.translate.instant("PORTAL.INDICACOES_ELETRONICAS.EMAIL_DEFAULT");
        }
        // element.inseridoEm = Util.formataData(element.inseridoEm, 'DD/MM/YYYY');
        this.emailInfracao.push(element);
      });

      this.showTableEmail = true;
    });

  }

  getColunasTabela(): ColunasTabelaMV[] {
    const colunas: ColunasTabelaMV[] = [
      {
        description: this.translate.instant('PORTAL.LABELS.STATUS'), columnDef: 'status', style: {
          minWidth: 80
        }
      },
      {
        description: this.translate.instant('PORTAL.LABELS.DATA_STATUS'), columnDef: 'data', date: true, style: {
          minWidth: 200
        }
      },
      // {
      //   description: this.translate.instant('PORTAL.LABELS.ACOES'), columnDef: 'action', action: true, icones: [
      //     {
      //       info: false,
      //       svg: 'pfu-indicar-multa',
      //       style: { cursor: 'pointer' },
      //       label: this.translate.instant('PORTAL.INDICACOES_ELETRONICAS.INDICAR_MULTA'),
      //       function: this.indicarInfracao.bind(this)
      //     }
      //   ]
      // }
    ];

    return colunas;
  }

  getColunasTabelaEmail(): ColunasTabelaMV[] {
    const colunas: ColunasTabelaMV[] = [
      {
        description: this.translate.instant('PORTAL.LABELS.DESCRICAO'), columnDef: 'descricao', style: {
          minWidth: 80
        }
      },
      {
        description: this.translate.instant('PORTAL.LABELS.DATA_EMAIL'), columnDef: 'inseridoEm', date: true, style: {
          minWidth: 200
        }
      },
      {
        description: this.translate.instant('PORTAL.LABELS.ACOES'), columnDef: 'action', action: true, icones: [
          {
            info: false,
            svg: 'pfu-detalhe-multa',
            style: { cursor: 'pointer' },
            label: this.translate.instant('PORTAL.INDICACOES_ELETRONICAS.EMAIL'),
            function: this.exibirEmail.bind(this)
          }
        ]
      }
    ];

    return colunas;
  }

  getColunasTabelaAnexos(): ColunasTabelaMV[] {
    const colunas: ColunasTabelaMV[] = [
      {
        description: this.translate.instant('PORTAL.LABELS.TIPO'), columnDef: 'tipo', style: {
          minWidth: 80
        }
      },
      {
        description: this.translate.instant('PORTAL.LABELS.DESCRICAO'), columnDef: 'descricao', style: {
          minWidth: 80
        }
      },
      {
        description: this.translate.instant('PORTAL.LABELS.DATA_ANEXO'), columnDef: 'inseridoEm', date: true, style: {
          minWidth: 200
        }
      },
      {
        description: this.translate.instant('PORTAL.LABELS.ACOES'), columnDef: 'action', action: true, icones: [
          {
            info: false,
            svg: 'pfu-detalhe-multa',
            style: { cursor: 'pointer' },
            label: this.translate.instant('PORTAL.INDICACOES_ELETRONICAS.ANEXO'),
            function: this.exibirAnexo.bind(this)
          }
        ]
      }
    ];

    return colunas;
  }

  exibirEmail(event) {
    window.open(environment.APIArquivos + event.href);
  }

  exibirAnexo(event) {
    window.open(environment.APIArquivos + event.href)
  }

  indicarInfracao() {
    const multaSelecionada = JSON.stringify(this.infracao);
    sessionStorage.setItem('multa', multaSelecionada);
    this.router.navigate([`gerenciador-infracoes/indicacoes-eletronicas/${this.infracao.multaId}`]);
  }

  openModalInfoRecursos() {
    const conteudoModal: DadosModalMV = {
      titulo: 'PORTAL.INDICACOES_ELETRONICAS.INFORMACAOES_RECURSO',
      conteudo: '',
      modalMensagem: false,
      dados: []
    };

    this.dadosModalService.set(conteudoModal);
    this.modal.open(ModalInfoRecursoComponent, { size: 'lg' });
  }

  ngOnDestroy() {
    window.sessionStorage.removeItem('infracao');
  }

  voltar() {
    this.router.navigateByUrl('gerenciador-infracoes/indicacoes-eletronicas')
  }
}
