import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { VeiculoReservaService } from 'src/app/core/services/veiculoreserva.service';
import { BoxEmailMV } from 'src/app/shared/interfaces/box-email.model';
import { GenericMenuBoxMV } from 'src/app/shared/interfaces/generic-menu-box.model';
import { SolicitacaoSubstituicaoService } from 'src/app/core/services/solicitacao-substituicao.service';
import { VeiculoService } from 'src/app/core/services/veiculos.service';

@Component({
  selector: 'app-email-solicitar-veiculo',
  templateUrl: './email-solicitar-veiculo.component.html',
  styleUrls: ['./email-solicitar-veiculo.component.scss']
})
export class EmailSolicitarVeiculoComponent implements OnInit {

  solicitacao = [];
  dataMenuBox: GenericMenuBoxMV;

  constructor(
    private router: Router,
    private _sanitizer: DomSanitizer,
    private solicitacaoSubstituicaoService: SolicitacaoSubstituicaoService,
    private veiculoService: VeiculoService
  ) { }

  ngOnInit() {

    this.dataMenuBox = {
      menuBodyStyle: { textAlign: 'left', fontSize: '10px' },
      menuData: null,
      backFunction: this.back.bind(this),
      menuNoHeaderAndFooter: true
    };

    this.carregarDadosEmail();

  }

  carregarDadosEmail() {
    this.solicitacaoSubstituicaoService.getById(this.solicitacaoSubstituicaoService.veiculoSolicitacaoSelecionado['id']).subscribe(res => {

      this.solicitacao = res.data;
      if (this.solicitacao['veiculoId']) {
        this.veiculoService.get(this.solicitacao['veiculoId']).subscribe(res2 => {

          this.solicitacao['placa'] = res2.data.placa;
          this.solicitacao['modelo'] = res2.data.modelo;

          this.loadEmail();
        });
      } else {
        this.loadEmail();
      }
    });
  }

  loadEmail() {
    this.dataMenuBox.boxEmail = null;

    const emails: Map<string, BoxEmailMV> = new Map();
    const style = this._sanitizer.bypassSecurityTrustHtml(
      `<style>
      .cell-separator {
        width: 20px;
      }
      .page-content{
        background: whitesmoke;
      }
      .menu-container{
        display:none;
      }
      table {
        font-size: 10px;
        position: relative;
        z-index: 4;
        margin-top: 30px;
        margin-left: 14px;
      }

      table td {
        padding-right: 5px;
        padding-left: 5px;
        vertical-align: top;
        width: 139px;
      }
      img{
        position:	relative;
      }
      .img-text{
        position:absolute;
        top:25%;
        left:20px;

      }
      .itemStyleNone {
        list-style: none;
      }
      </style>`
    );

    const header = ``;

    const whitespace = '<p></p>';

    const info = ``;

    const image = `<img src='assets/svg/email_veiculo01.svg' height='auto' width='100%'>`;

    const procedimentos = `<h5>Prezado Cliente ${this.solicitacaoSubstituicaoService.veiculoSolicitacaoSelecionado['nomeSolicitante']},</h5>
    <p>A Solicitação de Veículo Nº ${this.solicitacao['id']} foi <b>aprovada</b>!
    </p><p><b>Cliente:</b> ${this.solicitacaoSubstituicaoService.veiculoSolicitacaoSelecionado['nomeFantasia']}</p>
    <p><b>Código do Cliente:</b> ${this.solicitacao['clienteId']}</p>
    <p><b>Cidade:</b> ${this.solicitacao['municipio']}</p>
    <p><b>Cidade Entrega:</b> ${this.solicitacao['municipio']}</p>
    <p><b>Quantidade de veículos:</b> 1</p>
    <p><b>Placa do Veículo</b>${this.solicitacao['placa'] ? this.solicitacao['placa'] : ' - '}</p>
    <p><b>Modelo do Veículo:</b>${this.solicitacao['modelo'] ? this.solicitacao['modelo'] : ' - '}</p>
    <p><b>Motivo Solicitação:</b> ${this.solicitacao['motivoSolicitacao']}</p>
    <p class="center"><img (click)="back()" style="cursor:pointer" src='https://qasunidas.unidas.com.br:8005/api/v1/attachments/EA28ADA1-D646-4325-8DA3-3743FA79239B' height='50px' width='200px' /></p>`;

    const htmls = [];
    htmls.push(style, header, whitespace, info, image, procedimentos);

    const boxEmail1: BoxEmailMV = {
      contents: [
        {
          isHtml: true,
          htmls: htmls
        }
      ]
    };

    emails.set('E-mail 1', boxEmail1);

    this.dataMenuBox.boxTitle = ' ';
    this.dataMenuBox.boxEmail = boxEmail1;
  }

  back(): void {
    sessionStorage.removeItem('veiculoSolicitacao');
    this.router.navigate(['gerenciador-frota/acompanhar-solicitacao']);
  }
}
