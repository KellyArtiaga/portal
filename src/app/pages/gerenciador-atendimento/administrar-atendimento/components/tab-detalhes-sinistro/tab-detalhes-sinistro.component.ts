import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ArquivoService } from 'src/app/core/services/arquivos.service';
import { AtendimentoClienteService } from 'src/app/core/services/atendimentos-clientes.service';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';
import { ArquivoMV } from 'src/app/shared/interfaces/arquivos.model';

@Component({
  selector: 'app-tab-detalhes-sinistro',
  templateUrl: './tab-detalhes-sinistro.component.html',
  styleUrls: ['./tab-detalhes-sinistro.component.scss']
})
export class TabDetalhesSinistroComponent implements OnInit {
  formDetalhesSinistro: FormGroup;

  docs: Array<ArquivoMV> = [];
  images: Array<ArquivoMV> = [];
  videos: Array<ArquivoMV> = [];

  constructor(
    private atendimentoService: AtendimentoClienteService,
    private snackBar: SnackBarService,
    private arquivoService: ArquivoService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.criaForm();

    this.getAtendimentoSinistro();
    this.getArquivosAtendimento();
  }

  getAtendimentoSinistro(): void {
    this.atendimentoService.getSinistro(this.atendimentoService.getStored().atendimentoId).subscribe(res => {
      if (res.data.results.length > 0) {
        this.criaForm(res.data.results[0]);
      }
    }, res => {
      this.snackBar.error(res.error.message, 7000);
    });
  }

  getArquivosAtendimento(): void {
    const url = this.arquivoService.recuperarArquivo();

    this.arquivoService.getAll(
      'ATENDIMENTO',
      this.atendimentoService.getStored().atendimentoId
    ).subscribe(response => {
      if (response.error) {
        this.snackBar.error('Ocorreu um erro! Tente novamente mais tarde.', 7000);
        return;
      }
      if (response.data != null) {
        response.data.forEach((docApi: ArquivoMV) => {
          docApi.safeURL = this.sanitizer.bypassSecurityTrustResourceUrl(`${url}${docApi.href}`);
          docApi.href = `${url}${docApi.href}`;

          if (
            docApi.extensao === 'jpg' ||
            docApi.extensao === 'png' ||
            docApi.extensao === 'jpeg' ||
            docApi.extensao === 'jfif' ||
            docApi.extensao === 'gif'
          ) {
            docApi.isImage = true;
            this.images.push(docApi);
          } else if (docApi.extensao === 'mp4') {
            docApi.isVideo = true;
            this.videos.push(docApi);
          } else {
            docApi.isDoc = true;
            this.docs.push(docApi);
          }
        });
      }
    }, res => { });
  }

  criaForm(sinistro?: any): void {
    this.formDetalhesSinistro = new FormGroup({
      'vitima': new FormControl(sinistro && sinistro.existeVitima ? sinistro.existeVitima : ''),
      'vitimaFatal': new FormControl(sinistro && sinistro.existeVitimaFatal ? sinistro.existeVitimaFatal : ''),
      'motivoSinistro': new FormControl(sinistro && sinistro.motivoSinistro ? sinistro.motivoSinistro : ''),
      'logradouro': new FormControl(sinistro && sinistro.logradouroSinistro ? sinistro.logradouroSinistro : ''),
      'cidade': new FormControl(sinistro && sinistro.cidadeSinistro ? sinistro.cidadeSinistro : ''),
      'estado': new FormControl(sinistro && sinistro.estadoSinistro ? sinistro.estadoSinistro : ''),
      'cep': new FormControl(sinistro && sinistro.cepSinistro ? sinistro.cepSinistro : ''),
      'boletimOcorrencia': new FormControl(sinistro && sinistro.boletimOcorrenciaSinistro ? sinistro.boletimOcorrenciaSinistro : ''),
      'dataSinistro': new FormControl(sinistro && sinistro.dataSinistro ? new Date(sinistro.dataSinistro) : '')
    });
  }
}
