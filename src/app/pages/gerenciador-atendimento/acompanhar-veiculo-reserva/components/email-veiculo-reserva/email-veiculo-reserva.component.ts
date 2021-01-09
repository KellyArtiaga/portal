import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { VeiculoReservaService } from 'src/app/core/services/veiculoreserva.service';
import { BoxEmailMV } from 'src/app/shared/interfaces/box-email.model';
import { GenericMenuBoxMV } from 'src/app/shared/interfaces/generic-menu-box.model';
import { Util } from 'src/app/shared/util/utils';

@Component({
  selector: 'app-email-veiculo-reserva',
  templateUrl: './email-veiculo-reserva.component.html',
  styleUrls: ['./email-veiculo-reserva.component.scss']
})
export class EmailVeiculoReservaComponent implements OnInit {
  dataMenuBox: GenericMenuBoxMV;

  constructor(
    private router: Router,
    private _sanitizer: DomSanitizer,
    private veiculoReservaService: VeiculoReservaService
  ) { }

  ngOnInit() {
    if (!this.veiculoReservaService || !this.veiculoReservaService.veiculoReservaSelecionado) {
      this.backTo();
    }

    this.dataMenuBox = {
      menuBodyStyle: { textAlign: 'left', fontSize: '10px' },
      menuData: null,
      backFunction: this.backTo.bind(this),
      menuNoHeaderAndFooter: true
    };
    this.loadEmail();
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

    const image = `<img src='assets/images/veiculo_reserva_liberado.png' height='auto' width='100%'>`;

    const procedimentos = `
    <p>
      <h6>Prezado (a) ${this.veiculoReservaService.veiculoReservaSelecionado['solicitante']},</h6>
    </p>
    <p>O seu VEÍCULO RESERVA está liberado!</p>
    <p>
      O veículo reserva de placa ${this.veiculoReservaService.veiculoReservaSelecionado['placaVeiculoReserva']} já está disponível
      para ser retirado no endereço ${this.veiculoReservaService.veiculoReservaSelecionado['fornecedor']} /
      ${this.veiculoReservaService.veiculoReservaSelecionado['enderecoVeiculoReserva']} /
      ${this.veiculoReservaService.veiculoReservaSelecionado['telefoneFornecedor']} às
      ${Util.formataData(this.veiculoReservaService.veiculoReservaSelecionado['dataEnvioAvisoReservaDisponivel'], 'HH:mm')} horas do dia
      ${Util.formataData(this.veiculoReservaService.veiculoReservaSelecionado['dataEnvioAvisoReservaDisponivel'], 'DD/MM/YYYY')}.
    </p>
    <p>
      Somente o condutor indicado poderá retirar o veículo, caso necessário, informar com antecedência a alteração dos dados do
      condutor.
    </p>
    <p>
      A devolução do veículo deve ocorrer imediatamente no mesmo local de retirada após a finalização dos reparos do titular.
      A não devolução acarretará em cobranças de diárias excedentes.
    </p>
    <p>
      O reserva deverá ser devolvido nas mesmas condições em que foi retirado, a não devolução acarretará cobrança de taxas extras.
    </p>
    </p>
    <p>É sempre um prazer atendê-lo!</p>
    <p>Equipe Unidas</p>`;

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

    this.dataMenuBox.boxEmail = boxEmail1;
  }

  backTo(): void {
    sessionStorage.removeItem('veiculoReserva');
    this.router.navigate(['gerenciador-atendimento/acompanhar-veiculo-reserva']);
  }
}
