import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { AtendimentoStorageService } from 'src/app/core/services/atendimento-storage.service';
import { DadosModalService } from 'src/app/core/services/dados-modal.service';
import { FornecedorService } from 'src/app/core/services/fornecedores.service';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';
import { UserContextService } from 'src/app/core/services/user-context.service';
// tslint:disable-next-line: max-line-length
import { ModalFornecedoresComponent } from 'src/app/pages/gerenciador-atendimento/manutencao/components/manutencao-aba-dois/components/modal-fornecedores/modal-fornecedores.component';
import { ModalConfirmComponent } from 'src/app/shared/components/modal-confirm/modal-confirm.component';
import { DadosModalMV } from 'src/app/shared/interfaces/dados-modal.model';
import { Util } from 'src/app/shared/util/utils';

@Component({
  selector: 'app-manutencao-list-fornecedor',
  templateUrl: './manutencao-list-fornecedor.component.html',
  styleUrls: ['./manutencao-list-fornecedor.component.scss']
})
export class ManutencaoListFornecedorComponent implements OnInit {

  veiculo: any;

  listaFornecedores = [] as Array<any>;
  servicosFornecedor = [] as Array<any>;
  servicosRestantes = [] as Array<any>;

  fornecedoresSelecionados = [] as Array<any>;

  showTableSelecionado: boolean;
  showMensagemEndereco: boolean;
  firstSearch: boolean;
  isRevisao: boolean;
  tipoManutencao: boolean;

  dataSource = new MatTableDataSource(this.listaFornecedores);

  constructor(
    private snackBar: SnackBarService,
    private translate: TranslateService,
    private fornecedorService: FornecedorService,
    private modalService: NgbModal,
    private dadosModalService: DadosModalService,
    private userContextService: UserContextService
  ) { }

  ngOnInit() {
    this.firstSearch = true;
    this.showTableSelecionado = false;
  }

  sortTable(event: Event): void {
    return Util.sortTable(event, this.dataSource);
  }

  pesquisar(form: FormGroup) {
    this.veiculo = AtendimentoStorageService.abaZeroForm.value['veiculo'];
    form.get('veiculoId').setValue(this.veiculo.veiculoId);
    form.get('tipoManutencao').setValue(this.tipoManutencao);
    form.get('planoManutencaoId').setValue(this.veiculo.planoManutencaoId);

    this.isRevisao = AtendimentoStorageService.abaUmForm.value['isRevisao'];

    const date = new Date();
    const millis = date.getTime();
    const hours = Util.formataData(millis, 'HH:MM');

    if ((this.userContextService.getPerfil() === 'ASSISTENCIA')
      && (date.getDay() === 0 || date.getDay() === 6)
      || (+hours.split(':')[0] > 18 || +hours.split(':')[0] > 18 && +hours.split(':')[1] > 0)) {
      form.get('fornecedor24Horas').setValue(true);
    }

    this.listaFornecedores = [];

    if (this.servicosRestantes.length > 0) {
      const listaServicos = this.getAnyFieldFromArray(this.servicosRestantes, 'questionarioAtendimentoId').toString();
      form.get('listaServicos').setValue(listaServicos);

      this.showMensagemEndereco = true;
      this.getFornecedorRaio(form, 3);
    }
  }

  getFornecedorRaio(form: FormGroup, km: number): void {
    const _this = this;
    let modalOpened = false;

    _this.fornecedorService.getPorRaio(form.value, km).subscribe(res => {
      if (res.data.results.length === 0) {
        if (km === 3) {
          _this.getFornecedorRaio(form, 6);
          return;
        }
        if (km === 6) {
          _this.getFornecedorRaio(form, 9);
          return;
        }
        if (km === 9) {
          if (form.get('fornecedor24Horas').value) {
            form.get('fornecedor24Horas').setValue(false);
            _this.getFornecedorRaio(form, null);
            return;
          }

          if (_this.showMensagemEndereco) {
            _this.showMensagemEndereco = false;

            if (AtendimentoStorageService.abaUmForm.value['isGarantiaUltimoServicoExecutado']) {
              _this.snackBar.open(_this.translate.instant('PORTAL.MSG_FORNECEDOR_ANTERIOR_NOT_FOUND'), 7000, 'X');
            } else {
              _this.snackBar.open(_this.translate.instant('PORTAL.MSG_FORNECEDOR_NOT_FOUND'), 7000, 'X');
            }
          }
        }
      } else {
        _this.firstSearch = false;

        res.data.results.forEach(fornecedor => {
          // Ajuste teste integrado
          if (fornecedor.telefone) {
            fornecedor.telefone = Util.formataTelefone(fornecedor.telefone);
          }
          _this.listaFornecedores.push(fornecedor);
        });

        const maiorPrevisaoEntrega = this.getMaiorPrevisaoEntrega(this.extrairFornecedores()) as any;

        if (_this.servicosRestantes.length > 0) {
          _this.dadosModalService.set({
            fornecedoresPesquisados: _this.listaFornecedores,
            fornecedoresExistentes: _this.fornecedoresSelecionados,
            veiculo: _this.veiculo,
            isRevisao: _this.isRevisao,
            servicosRestantes: _this.getAnyFieldFromArray(_this.servicosRestantes, 'questionarioAtendimentoId').toString(),
            servicosRestantesDescricao: _this.getAnyFieldFromArray(_this.servicosRestantes, 'descricaoQuestionario').toString(),
            maiorPrevisaoEntrega: maiorPrevisaoEntrega
          });

          if (!modalOpened) {
            modalOpened = true;
            const modal = _this.modalService.open(ModalFornecedoresComponent, { size: 'lg' });
            modal.result.then(result => {
              if (!result) {
                return;
              }
              _this.checkFornecedor(result);
            });
          }
        }
      }
    }, res => {
      _this.listaFornecedores = [];
      if (res.status === 500) {
        _this.snackBar.error(_this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
      } else {
        _this.snackBar.error(res.error.message, 3500);
      }
    });
  }

  hasFornecedores(): boolean {
    return this.fornecedoresSelecionados.length > 0;
  }

  checkFornecedor(result: any): void {
    const _this = this;
    if (result) {
      _this.firstSearch = false;
      const dadosFornecedor = AtendimentoStorageService.fornecedorSelecionado;

      if (dadosFornecedor.fornecedor.listaCodigoServico) {
        const servicos = _this.removeDuplicatesArray(dadosFornecedor.fornecedor.listaCodigoServico.split(', '));
        _this.servicosFornecedor = _this.servicosFornecedor.concat(servicos);
      }

      _this.servicosFornecedor.forEach(codigo => {
        const index = _this.servicosRestantes.findIndex(item => item.questionarioAtendimentoId === +codigo);
        if (index !== -1) {
          _this.servicosRestantes.splice(index, 1);
        }
      });

      _this.fornecedoresSelecionados.push(dadosFornecedor);

      _this.showTableSelecionado = true;
    } else {
      _this.firstSearch = true;
    }
  }

  deselectFornecedor(fornecedor: any): void {

    if (fornecedor.existeRequisicao) {
      this.snackBar.open(this.translate.instant('PORTAL.ATENDIMENTO.MESSAGES.EXISTE_REQUISICAO_COMPRA'), 3500, 'X');
      return;
    }

    const conteudoModal: DadosModalMV = {
      titulo: 'PORTAL.AGENDAMENTO.TITLE.REMOVER',
      conteudo: '',
      modalMensagem: true,
      dados: []
    };

    this.dadosModalService.set(conteudoModal);

    const modalConfirm = this.modalService.open(ModalConfirmComponent);
    modalConfirm.componentInstance.mensagem = 'PORTAL.AGENDAMENTO.MESSAGE.MSG_CONFIRMAR_REMOVER';
    modalConfirm.componentInstance.botaoSecundario = 'PORTAL.BTN_NAO';
    modalConfirm.componentInstance.botaoPrimario = 'PORTAL.BTN_SIM';

    modalConfirm.result.then(result => {
      this.dadosModalService.set(null);
      if (result) {
        this.removerFornecedor(fornecedor);
      }
    });
  }

  removerFornecedor(fornecedor: any) {
    if (!fornecedor.listaDescricaoServico) {
      fornecedor.listaDescricaoServico = '';
    }

    const idsAbaUm = [];
    const servicosPesquisaRaio = AtendimentoStorageService.getServicosPesquisaRaio();
    servicosPesquisaRaio.forEach(item => {
      idsAbaUm.push({ questionarioAtendimentoId: item.questionarioAtendimentoId, descricaoQuestionario: item.descricaoQuestionario });
    });

    if (fornecedor.listaCodigoServico) {

      let ids;
      if (typeof fornecedor.listaCodigoServico === 'string') {
        ids = fornecedor.listaCodigoServico.replace(' ', '').split(',');
      } else {
        ids = fornecedor.listaCodigoServico;
      }

      idsAbaUm.filter(item => ids.includes(String(item.questionarioAtendimentoId))).forEach(item => {
        this.servicosRestantes.push(item);
      });
    } else if (fornecedor.listaDescricaoServico) {
      idsAbaUm.filter(item => fornecedor.listaDescricaoServico.includes(item.descricaoQuestionario)).forEach(item => {
        this.servicosRestantes.push(item);
      });
    }

    const servicosId = this.getAnyFieldFromArray(this.servicosRestantes, 'questionarioAtendimentoId').toString();
    if ((servicosId.split(',') || []).length > 0) {
      if (this.fornecedoresSelecionados.length === 0) {
        this.showTableSelecionado = false;
      } else {
        this.showTableSelecionado = true;
      }
    }

    this.fornecedoresSelecionados = AtendimentoStorageService.removeStoredFornecedor(this.fornecedoresSelecionados, fornecedor);
    this.snackBar.success('Fornecedor removido com sucesso.', 3500, 'X');
  }

  removeDuplicatesArray(arr: Array<any>): Array<any> {
    return arr.filter((v: any, i: any) => arr.indexOf(v) === i);
  }

  getServicosRestantesDescricao(): Array<any> {
    return this.getAnyFieldFromArray(this.servicosRestantes, 'descricaoQuestionario');
  }

  getAnyFieldFromArray(itens: Array<any>, fieldName): Array<any> {
    const list = [];
    itens.forEach(item => {
      list.push(item[fieldName]);
    });
    return list;
  }

  extrairFornecedores(): Array<any> {

    if (!this.fornecedoresSelecionados) {
      return;
    }

    return this.fornecedoresSelecionados.map(item => {
      return item.fornecedor;
    });
  }

  getMaiorPrevisaoEntrega(fornecedores: Array<any>): number {

    if (fornecedores.length === 0) {
      return null;
    }

    fornecedores = fornecedores.map(item => {
      item.dataPrevisaoEntregaTime = typeof item.dataPrevisaoEntrega === 'string'
        ? Util.removerTimezone(item.dataPrevisaoEntrega)
        : item.dataPrevisaoEntrega;
      item.dataPrevisaoEntregaTime = new Date(item.dataPrevisaoEntrega).getTime();
      return item;
    });

    const sortDates = (a, b) => {
      return b.dataPrevisaoEntregaTime - a.dataPrevisaoEntregaTime;
    };

    const fornecedoresSorted = fornecedores.sort(sortDates);

    return fornecedoresSorted[0].dataPrevisaoEntregaTime;
  }

}
