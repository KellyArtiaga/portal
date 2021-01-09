import { Component, HostListener, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { JWTEncodeService } from 'src/app/core/services/jwt-encode.service';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';
import { UserContextService } from 'src/app/core/services/user-context.service';
import { AppConfig } from 'src/assets/config/app.config';
import { CondutorService } from 'src/app/core/services/condutor.service';
import { ClientesService } from 'src/app/core/services/cliente.service';

@Component({
  selector: 'app-faturamento',
  templateUrl: './faturamento.component.html',
  styleUrls: ['./faturamento.component.scss']
})
export class FaturamentoComponent implements OnInit {
  trustedUrl: any;
  showIframe = false;
  urlToOpen: string;
  listaClientes: any = [];
  listaAtividades: any = [];

  constructor(
    private jwtEncode: JWTEncodeService,
    private userContext: UserContextService,
    private sanitizer: DomSanitizer,
    private snackBar: SnackBarService,
    private translate: TranslateService,
    private condutorService: CondutorService,
    private clienteService: ClientesService
  ) { }

  ngOnInit() {
    this.carregarCamposToken();
  }

  carregarCamposToken(): void {
    this.condutorService.getById(Number(this.userContext.getCondutorId())).subscribe(res => {

      this.clienteService.getClienteCondutor(Number(this.userContext.getCondutorId())).subscribe(resp => {

        if (res.data.chaveCondutorPerfilUsuario === 'ADMINISTRADOR') {
          resp.data.results.map((item, i) => {
            this.listaClientes.push(item.id);
          });
        } else {
          if (res.data.clientes) {
            res.data.clientes.map(clientes => {
              this.listaClientes.push(clientes.id);
            });
          }
        }

        if (res.data.atividades) {
          res.data.atividades.map(atividades => {
            this.listaAtividades.push(atividades.id);
          });
        }
        this.getJWT();

      });
    });
  }

  getClienteCondutorCNPJ(): void {

  }

  private getSecret(): string {
    return 'Unidas@2019';
  }

  private getDadosUsuario(): any {
    let nivel: string;
    const nivelAprovacao1 = this.userContext.getDados()['aprovacaoNivel1'] ? '1' : null;
    const nivelAprovacao2 = this.userContext.getDados()['aprovacaoNivel2'] ? '2' : null;

    if (nivelAprovacao2) {
      nivel = nivelAprovacao2;
    } else if (nivelAprovacao1) {
      nivel = nivelAprovacao1;
    } else {
      nivel = '';
    }

    //listaNiveis.push(nivelAprovacao1, nivelAprovacao2);
    return {
      codigoUsuario: this.userContext.getDados()['id'],
      login: this.userContext.getDados()['email'],
      cpf: this.userContext.getDados()['cpfCondutor'],
      nomeUsuario: this.userContext.getDados()['nomeUsuario'],
      perfilUsuario: this.userContext.getDados()['descricaoPerfilUsuario'],
      clientes: this.listaClientes,
      sub: '1234567890',
      regionais: [],
      atividade: this.listaAtividades,
      nivel: nivel
    };
  }

  @HostListener('document:click') clickout(): void { }

  private getJWT(): void {
    const body = {
      secret: this.getSecret(),
      value: this.getDadosUsuario()
    };

    this.jwtEncode.encode(body).subscribe(res => {
      console.log(res.data.token);
      this.iframeLoader(res.data.token);
    }, res => {
      this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  getUrl(): string {
    return AppConfig.URL_CAPERE + '/Faturamento/FaturamentoIntegracao_Lista.aspx?token=${token}';
  }

  iframeLoader(token: string): void {
    this.urlToOpen = this.getUrl().replace('${token}', token);

    /*
    let url = '';
    if (!/^ http[s] ?: \/\//.test(this.urlToOpen)) {
      //url += 'http://';
    }

    url += this.urlToOpen;
    */

    this.trustedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.urlToOpen);

    this.showIframe = true;
  }
}
