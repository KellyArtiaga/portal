import { SelectionModel } from '@angular/cdk/collections';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { AtendimentoStorageService } from 'src/app/core/services/atendimento-storage.service';
import { DadosModalService } from 'src/app/core/services/dados-modal.service';
import { FornecedorService } from 'src/app/core/services/fornecedores.service';
import { ReloadListasService } from 'src/app/core/services/reload-listas.service';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';
import { ColunasTabelaMV } from '../../../../../../../shared/interfaces/colunas-tabela.model';
import { FornecedorAtendimentoMV } from '../../../../../../../shared/interfaces/fornecedor-atendimento.model';

@Component({
  selector: 'app-modal-fornecedores',
  templateUrl: './modal-fornecedores.component.html',
  styleUrls: ['./modal-fornecedores.component.scss']
})
export class ModalFornecedoresComponent implements OnInit {

  @ViewChild('calendario') calendario: ElementRef;

  selection = new SelectionModel<any>(true, []);

  listaFornecedores: Array<FornecedorAtendimentoMV> = [];
  fornecedores: Array<any> = [];
  listaServicos: string;

  constructor(
    private fornecedorService: FornecedorService,
    private dadosModal: DadosModalService,
    private modalService: NgbActiveModal,
    private translate: TranslateService,
    private snackBar: SnackBarService
  ) { }

  ngOnInit() {
    this.listaFornecedores = this.dadosModal.get()['fornecedoresPesquisados'];
    this.fornecedores = this.dadosModal.get()['fornecedoresExistentes'];
    this.listaServicos = this.dadosModal.get()['servicosRestantesDescricao'];
    this.listenerCloseModal();
  }

  getColunasTabela(): ColunasTabelaMV[] {
    const colunas = [
      { description: 'Oficina', columnDef: 'nomeFantasia' },
      { description: 'Serviços', columnDef: 'listaDescricaoServico' },
      { description: 'Telefone', columnDef: 'telefone', telefone: true },
      { description: 'Endereço', columnDef: 'endereco', width: 200 },
      { description: 'Cidade', columnDef: 'municipio' },
      { description: 'UF', columnDef: 'estado' }
    ];

    return colunas;
  }

  checkFornecedor(fornecedor: any): void {
    this.selection.clear();
    this.selection.toggle(fornecedor);

    let fornecedorExiste = false;
    if (this.fornecedores.length > 0) {
      fornecedorExiste = this.fornecedores.some(item => item.fornecedor.listaCodigoCategoria === fornecedor.listaCodigoCategoria);
    }

    if (fornecedorExiste) {
      this.snackBar.open(`Você já selecionou um fornecedor da categoria: ${fornecedor.listaDescricaoCategoria}.`, 7000, 'X');
      return;
    }

    this.carregarDatasFornecedor(fornecedor);
  }

  carregarDatasFornecedor(fornecedor: any) {
    AtendimentoStorageService.fornecedor = fornecedor;
    this.fornecedorService.getDadosCalendario(fornecedor.fornecedorId, this.dadosModal.get().maiorPrevisaoEntrega).subscribe(
      res => {
        AtendimentoStorageService.calendarioFornecedor = res.data.results;
        setTimeout(() => {
          ReloadListasService.get('preencherCalendario').emit();
        }, 100);
      }, err => {
        this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
      });
  }

  listenerCloseModal() {
    ReloadListasService.get('closeCalendar').subscribe(data => {
      ReloadListasService.reset();
      this.closeModal(true);
    });
  }

  closeModal(ok?: boolean): void {
    ReloadListasService.reset();
    this.modalService.close(ok || false);
  }

  hasValue(): boolean {
    if (this.listaFornecedores.length === 0) {
      return false;
    }
    return true;
  }

  getFornecedor(): any {
    return AtendimentoStorageService.fornecedor;
  }
}
