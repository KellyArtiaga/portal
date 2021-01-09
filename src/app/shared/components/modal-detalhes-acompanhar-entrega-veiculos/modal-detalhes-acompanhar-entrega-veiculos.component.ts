import { Component, OnInit } from '@angular/core';
import { DadosModalService } from 'src/app/core/services/dados-modal.service';
import { TranslateService } from '@ngx-translate/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CurrencyPipe } from '@angular/common';
import { Util } from '../../util/utils';

@Component({
  selector: 'app-modal-detalhes-acompanhar-entrega-veiculos',
  templateUrl: './modal-detalhes-acompanhar-entrega-veiculos.component.html',
  styleUrls: ['./modal-detalhes-acompanhar-entrega-veiculos.component.scss']
})
export class ModalDetalhesAcompanharEntregaVeiculosComponent implements OnInit {

  dados: any;

  constructor(
    private dadosModal: DadosModalService,
    private translate: TranslateService,
    private activeModal: NgbActiveModal,
    private currencyService: CurrencyPipe,

  ) { }

  ngOnInit() {
    this.dados = this.dadosModal.get();
  }

  showValue(value: any, column: any): any {
    if (column.data) {
      return Util.formataData(value);
    }

    if (column.boolean) {
      return value ? 'Sim' : 'Não'
    }

    if (column.placa) {
      return Util.formataPlaca(value);
    }

    if (column.documento) {
      return Util.formataDocumento(value);
    }

    return value;
  }
  getTitulos(): Array<any> {
    const titulos: any[] = [
      { columnDef: this.translate.instant('PORTAL.MODAL_DETALHES_ACOMPANHAR_ENTREGA_VEICULOS.CLIENTE'), description: 'cliente' },
      { columnDef: this.translate.instant('PORTAL.MODAL_DETALHES_ACOMPANHAR_ENTREGA_VEICULOS.REGIONAL'), description: 'regional' },
      { columnDef: this.translate.instant('PORTAL.MODAL_DETALHES_ACOMPANHAR_ENTREGA_VEICULOS.CENTRO_CUSTO'), description: 'centroCusto' },
      // { columnDef: this.translate.instant('PORTAL.MODAL_DETALHES_ACOMPANHAR_ENTREGA_VEICULOS.CNPJ'), description: 'cnpj', documento: true },
      { columnDef: this.translate.instant('PORTAL.MODAL_DETALHES_ACOMPANHAR_ENTREGA_VEICULOS.CONTRATO_MASTER'), description: 'contratoMasterId' },
      { columnDef: this.translate.instant('PORTAL.MODAL_DETALHES_ACOMPANHAR_ENTREGA_VEICULOS.CODIGO_IMPLANTACAO'), description: 'codigoImplantacao' },
      { columnDef: this.translate.instant('PORTAL.MODAL_DETALHES_ACOMPANHAR_ENTREGA_VEICULOS.MOTIVO'), description: 'motivo' },
      { columnDef: this.translate.instant('PORTAL.MODAL_DETALHES_ACOMPANHAR_ENTREGA_VEICULOS.PLACA'), description: 'placa', placa: true },
      { columnDef: this.translate.instant('PORTAL.MODAL_DETALHES_ACOMPANHAR_ENTREGA_VEICULOS.CHASSI'), description: 'chassi' },
      { columnDef: this.translate.instant('PORTAL.MODAL_DETALHES_ACOMPANHAR_ENTREGA_VEICULOS.RENAVAM'), description: 'renavam' },
      { columnDef: this.translate.instant('PORTAL.MODAL_DETALHES_ACOMPANHAR_ENTREGA_VEICULOS.MODELO'), description: 'modelo' },
      { columnDef: this.translate.instant('PORTAL.MODAL_DETALHES_ACOMPANHAR_ENTREGA_VEICULOS.COR'), description: 'cor' },
      { columnDef: this.translate.instant('PORTAL.MODAL_DETALHES_ACOMPANHAR_ENTREGA_VEICULOS.TONALIDADE'), description: 'tonalidadeCor' },
      { columnDef: this.translate.instant('PORTAL.MODAL_DETALHES_ACOMPANHAR_ENTREGA_VEICULOS.ANO_FABRICACAO_MODELO'), description: 'anoFabricacaoModelo' },
      { columnDef: this.translate.instant('PORTAL.MODAL_DETALHES_ACOMPANHAR_ENTREGA_VEICULOS.ACESSORIOS'), description: 'acessorios' },
      { columnDef: this.translate.instant('PORTAL.MODAL_DETALHES_ACOMPANHAR_ENTREGA_VEICULOS.STATUS'), description: 'status' },
      { columnDef: this.translate.instant('PORTAL.MODAL_DETALHES_ACOMPANHAR_ENTREGA_VEICULOS.CONDUTOR'), description: 'condutor' },
      { columnDef: this.translate.instant('PORTAL.MODAL_DETALHES_ACOMPANHAR_ENTREGA_VEICULOS.VEICULO_DISPONIVEL'), description: 'veiculoDisponivel', boolean: true },
      { columnDef: this.translate.instant('PORTAL.MODAL_DETALHES_ACOMPANHAR_ENTREGA_VEICULOS.SEMANA_ENTREGA'), description: 'semanaEntrega' },
      { columnDef: this.translate.instant('PORTAL.MODAL_DETALHES_ACOMPANHAR_ENTREGA_VEICULOS.DATA_AVISO_DISPONIBILIDADE'), description: 'dataAvisoDisponibilidade', data: true },
      { columnDef: this.translate.instant('PORTAL.MODAL_DETALHES_ACOMPANHAR_ENTREGA_VEICULOS.LOCAL_ENTREGA'), description: 'localEntrega' },
      { columnDef: this.translate.instant('PORTAL.MODAL_DETALHES_ACOMPANHAR_ENTREGA_VEICULOS.ENDERECO_ENTREGA'), description: 'enderecoEntrega' },
      { columnDef: this.translate.instant('PORTAL.MODAL_DETALHES_ACOMPANHAR_ENTREGA_VEICULOS.DATA_PREVISAO_ENTREGA'), description: 'dataPrevisaoEntrega', data: true },
      { columnDef: this.translate.instant('PORTAL.MODAL_DETALHES_ACOMPANHAR_ENTREGA_VEICULOS.AGENDAMENTO_RETIRADA'), description: 'agendamentoRetirada', data: true },
      { columnDef: this.translate.instant('PORTAL.MODAL_DETALHES_ACOMPANHAR_ENTREGA_VEICULOS.ENTREGUE'), description: 'entregue', boolean: true },
      { columnDef: this.translate.instant('PORTAL.MODAL_DETALHES_ACOMPANHAR_ENTREGA_VEICULOS.DATA_INICIO_LOCACAO'), description: 'dataInicioLocacao', data: true }
    ];

    return titulos;
  }

  closeModal(): void {
    this.dadosModal.set(null);
    this.activeModal.close();
  }
}
