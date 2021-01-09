import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { BoxEmailMV } from 'src/app/shared/interfaces/box-email.model';
import { GenericMenuBoxMV } from 'src/app/shared/interfaces/generic-menu-box.model';
import { MenuMV } from 'src/app/shared/interfaces/menu.model';

@Component({
  selector: 'app-emails-indicacao',
  templateUrl: './emails-indicacao.component.html',
  styleUrls: ['./emails-indicacao.component.scss']
})
export class EmailsIndicacaoComponent implements OnInit {

  dataMenuBox: GenericMenuBoxMV;

  constructor(
    private router: Router,
    private _sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    const menuData: MenuMV[] = [
      {
        menuBody: 'E-mail 1',
        menuFunction: this.loadEmail.bind(this),
        data: 'E-mail 1'
      },
      {
        menuBody: 'E-mail 2',
        menuFunction: this.loadEmail.bind(this),
        data: 'E-mail 2'
      },
      {
        menuBody: 'E-mail 3',
        menuFunction: this.loadEmail.bind(this),
        data: 'E-mail 3'
      }
    ];

    this.dataMenuBox = {
      menuBodyStyle: { textAlign: 'left', fontSize: '10px' },
      menuData: menuData,
      backFunction: this.backToMultas.bind(this),
      menuNoHeaderAndFooter: true
    };
  }

  loadEmail(email) {
    this.dataMenuBox.boxEmail = null;
    const emails: Map<string, BoxEmailMV> = new Map();

    const style = this._sanitizer.bypassSecurityTrustHtml(
      `<style>
      .cell-separator {
        width: 20px;
      }

      table {
        font-size: 10px;
        position: relative;
        z-index: 4;
        margin-top: -144px;
        margin-left: 14px;
      }

      table td {
        padding-right: 5px;
        padding-left: 5px;
        vertical-align: top;
        width: 139px;
      }

      .itemStyleNone {
        list-style: none;
      }
      </style>`);

    const header = `<h5>Prezado Cliente 1,</h5>
      <p>Você está recebendo em anexo a cópia da Notificação de Infração de Trânsito.</p>
      <p>Abaixo há informações relacionadas à infração e prazo limite para indicação do condutor à Unidas.</p>`;

    const whitespace = '<p></p>';

    const info = `<p><b>Auto de infração:</b> V500073342</p>
      <p><b>Placa:</b> QOQ5508</p>
      <p><b>Código da infração:</b> 74630</p>
      <p><b>Modelo:</b> SANDERO</p>
      <p><b>Data e hora da infração:</b> 18/07/19 09:27</p>
      <p><b>CNPJ:</b> 474.973.670/0012-6</p>
      <p><b>Data limite para indicação do condutor:</b> 21/08/19</p>
      <p><b>Data limite para envio a Unidas:</b> 16/08/19</p>
      <p><b>Valor estimado da infração com desconto:</b> R$ 156.18</p>`;

    const image = `<img src='assets/svg/procedimento-infracao.svg' height='329px'>`;

    const procedimentos = `<table>
      <tr>
      <td>- Acesse o Portal no botão abaixo.</td>
      <td class='cell-separator'></td>
      <td>- O Gestor visualiza se a infração está associada, caso contrário, ele deverá associar o condutor correto ao veículo.</td>
      <td class='cell-separator'></td>
      <td>- O condutor deve conferir os dados, gerar o termo de compromisso, digitalizar e assinar.</td>
      <td class='cell-separator'></td>
      <td><p>Adiciona os documentos digitalizados no sistema:</p> <p>- CNH do Condutor</p> <p>- Termo de Compromisso</li></p>
      <td class='cell-separator'></td>
      <td>Pronto! Está tudo certo!</td>
      </tr>
      </table>`;

    const htmls = [];
    htmls.push(style, header, whitespace, info, image, procedimentos);

    const htmls2 = [];
    htmls2.push('<h5>Header 2</h5>', whitespace, 'info2');

    const htmls3 = [];
    htmls3.push('<h5>Header 3</h5>', whitespace, 'info3');

    const boxEmail1: BoxEmailMV = {
      contents: [
        {
          isHtml: true,
          htmls: htmls
        },
        {
          isPanel: true,
          panelStyle: { marginTop: '18px' },
          panels: [
            {
              title: 'Procedimento para Recurso de Infrações de Trânsito - Unidas S/A',
              body: `<p></p>
            <p>COMO RECORRER</p>
            <p>Caso o locatário não concorde com a infração de trânsito deverá verificar na
            notificação ou no site do órgão emissor qual o procedimento e documentos necessários.</p>
            <p>A maioria dos órgãos solicita que seja elaborada uma carta de defesa, contendo os dados de
            identificação do veículo e dados da autuação solicitando o cancelamento da multa.</p>
            <p>Este requerimento deve ser entregue juntamente com uma cópia dos documentos:</p>
            <ul>
              <li>Notificação da Autuação - preenchida caso o condutor queira se indicar.</li>
              <li>CNH (Carteira Nacional de Habilitação) ou Permissão para Dirigir.</li>
              <li>Demais documentos que comprovem a tese.</li>
            </ul>
            <p>Enviar via correios com AR para:</p>
            <ul class='itemStyleNone'>
              <li><b>Departamento de Multas - Unidas</b></li>
              <li><b>Alameda Santos, 438</b></li>
              <li><b>Cerqueira César - São Paulo - SP</b></li>
              <li><b>CEP 01418-000</b></li>
            </ul>
            <p>IMPORTANTE: O envio do procedimento de recurso não isenta o locatário do pagamento
            da multa, mas lhe proporciona o direito ao reembolso, caso o recurso seja julgado procedente.</p>
            <p>O acompanhamento de recurso junto ao órgão será de responsabilidade do locatário.</p>
            <p>Ressaltamos que a identificação e o recurso são processo julgados por setores diferentes dentro
            do órgão de trânsito e solicitamos o envio da indicação separadamente do recurso.</p>
            <p>Atenciosamente, UNIDAS S/A Departamento de Multas</p>
            <p>No caso de dúvidas entre em contato sac@unidas.com.br ou pelo nosso contato ao SAC</p>`
            },
            {
              title: 'Como Indicar - Via Correio',
              body: `<p></p>
            <p>1 - Imprimir e preencher com caneta azul a notificação em anexo;</p>
            <p>2 - Assinar a notificação, apenas no campo do condutor infrator.
            A assinatura deve ser idêntica à que consta em sua CNH (Carteira Nacional de Habilitação) ou da permissão para dirigir;</p>
            <p>3 - Atentar-se as exigências estabelecidas por cada órgão;</p>
            <p>4 - Enviar via correios notificação preenchida + CNH do condutor (cópia em tamanho original) com AR para:</p>
            <p></p>
            <ul class='itemStyleNone'>
              <li><b>Departamento de Multas - Unidas</b></li>
              <li><b>Alameda Santos, 438</b></li>
              <li><b>CEP: 01418-000</b></li>
              <li><b>Cerqueira César, São Paulo – SP</b></li>
            </ul>`
            },
            {
              title: 'Condutor Estrangeiro ou Residente no Exterior',
              body: `<p></p>
            <p>1 - Preencher a notificação e assinar no campo de condutor infrator;</p>
            <p>2 - Enviar cópia da Carteira de Habilitação do país de origem;</p>
            <p>3 - Enviar cópia do Passaporte, página da foto com o número do passaporte e
            página do carimbo da data de entrada no Brasil (quando houver)</p>
            <p></p>
            <p>IMPORTANTE: Caso a indicação seja recebida fora do padrão solicitado a mesma será considerada invalida.</p>`
            }
          ]
        },
        {
          isHtml: true,
          htmls: [`<p></p>
          <p>No caso de dúvidas entre em contato com o <b>Customer Service</b> responsável da sua empresa.</p>
          <p>Não responda este e-mail, gerado automaticamente pela operação.</p>
          <p>Atenciosamente,</p>
          <p><b>Departamento de Multas Unidas.</b></p>`]
        }
      ]
    };


    const boxEmail2: BoxEmailMV = {
      contents: [{
        isHtml: true,
        htmls: htmls2
      }]
    };

    const boxEmail3: BoxEmailMV = {
      contents: [{
        isHtml: true,
        htmls: htmls3
      }]
    };


    emails.set('E-mail 1', boxEmail1);
    emails.set('E-mail 2', boxEmail2);
    emails.set('E-mail 3', boxEmail3);

    const emailMulta = emails.get(email.data);

    this.dataMenuBox.boxEmail = emailMulta ? emailMulta : null;
  }

  backToMultas() {
    this.router.navigate(['gerenciador-infracoes/indicacoes-eletronicas']);
  }
}
