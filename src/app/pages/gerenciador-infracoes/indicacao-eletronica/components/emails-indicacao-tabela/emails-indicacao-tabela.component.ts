import { Component, OnInit } from '@angular/core';
import { ColunasTabelaMV } from 'src/app/shared/interfaces/colunas-tabela.model';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { ArquivoService } from 'src/app/core/services/arquivos.service';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-emails-indicacao-tabela',
  templateUrl: './emails-indicacao-tabela.component.html',
  styleUrls: ['./emails-indicacao-tabela.component.scss']
})
export class EmailsIndicacaoTabelaComponent implements OnInit {

  infracao: any = [];
  emails: any = [];
  showTableEmail: boolean = false;

  constructor(
    private translate: TranslateService,
    private arquivosService: ArquivoService,
    private router: Router

  ) { }

  ngOnInit() {
    Object.assign(this.infracao, JSON.parse(window.sessionStorage.getItem('infracao')));
    this.getEmails();
    document.getElementById('tituloHistoricoEmail').setAttribute('data-content', this.translate.instant('PORTAL.INDICACOES_ELETRONICAS.HISTORICO_EMAIL'));

  }

  getEmails() {
    const api = "MULTAS"
    this.arquivosService.getAll('EMAIL_NOTIFICACAO_MULTA', this.infracao.multaId, undefined, api).subscribe(res => {
      this.showTableEmail = false;
      res.data.forEach(element => {
        if (element.descricao === "") {
          element.descricao = this.translate.instant("PORTAL.INDICACOES_ELETRONICAS.EMAIL_DEFAULT");
        }
        // element.inseridoEm = Util.formataData(element.inseridoEm, 'DD/MM/YYYY');
        this.emails.push(element);
      });

      this.showTableEmail = true;
    });
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

  exibirEmail(event) {
    window.open(environment.APIArquivos + event.href);
  }

  voltar() {
    this.router.navigateByUrl('gerenciador-infracoes/indicacoes-eletronicas')
  }

}
