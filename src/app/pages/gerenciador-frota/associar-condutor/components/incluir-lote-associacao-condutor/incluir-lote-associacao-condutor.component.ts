import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { distinctUntilChanged } from 'rxjs/operators';
import { CondutorVeiculoService } from 'src/app/core/services/condutor-veiculo.service';
import { DadosModalService } from 'src/app/core/services/dados-modal.service';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';
import { UserContextService } from 'src/app/core/services/user-context.service';
import { VeiculoService } from 'src/app/core/services/veiculos.service';
import { ModalConfirmComponent } from 'src/app/shared/components/modal-confirm/modal-confirm.component';
import { DadosModalMV } from 'src/app/shared/interfaces/dados-modal.model';
import { FormUtils } from 'src/app/shared/util/form-utils';
import { FormatUtil } from 'src/app/shared/util/format.util';
import { Util } from 'src/app/shared/util/utils';
import { environment } from 'src/environments/environment';

const MSG_CONDUTOR_VEICULO_JA_ASSOCIADO = /^(CONDUTOR_JA_ASSOCIADO|VEICULO_JA_ASSOCIADO)_(\d+)$/.compile();


@Component({
  selector: 'app-incluir-lote-associacao-condutor',
  templateUrl: './incluir-lote-associacao-condutor.component.html',
  styleUrls: ['./incluir-lote-associacao-condutor.component.scss']
})
export class IncluirLoteAssociacaoCondutorComponent implements OnInit {

  form: FormGroup;
  formItem: FormGroup;
  grupoEconomico: any;
  cepEndpoint = environment.APICep;
  options: any;
  saveLabel: any;
  originalValue : any;

  constructor(
    private veiculoService: VeiculoService,
    private condutorVeiculoService : CondutorVeiculoService,
    private router : Router,
    private activeRoute: ActivatedRoute,
    private userContext: UserContextService,
    private builder: FormBuilder,
    private snackBar: SnackBarService,
    private cd: ChangeDetectorRef,
    private translate: TranslateService,
    private dadosModalService : DadosModalService,
    private modalService: NgbModal) {
    this.options = {
      successInsertMessage: translate.instant('PORTAL.ASSOCIAR_CONDUTOR.MENSAGENS.MSG_ASSOCIACAO_SALVA')
    }
  }

  ngOnInit(): void {
    this.form = this.builder.group({
      itens: this.builder.array([], Validators.required)
    });
    this.grupoEconomico = this.userContext.getGrupoEconomico();
    this.formItem = this.createFormItem();
    this.activeRoute.params.subscribe((param) => {
      if (!!param.codigoMva) {
        this.veiculoService.get(param.codigoMva, true)
          .subscribe((response) => {
            const veiculo: any = response.data;
            veiculo.id = veiculo.veiculoId;
            veiculo.codigoMva = veiculo.veiculoId;
            this.formItem.get('veiculo').patchValue(veiculo);
            this.cd.detectChanges();
          });
      }
    });
  }

  isBatchEmpty(): boolean {
    const list = this.form.get('itens').value;
    return _.isNil(list) || _.isEmpty(list);
  }

  idDescMapper(idProperty: string, descProperty: string) {
    return (item, { dftIdProp, dftDescProp }) => {
      item[dftIdProp] = item[idProperty];
      item[dftDescProp] = item[descProperty];
      return item;
    }
  }

  isVeiculoLivre() {
    const veiculo = this.formItem.get('veiculo').value;
    if (!veiculo) {
      return false;
    }
    return _.isNil(veiculo.condutorAlocado);
  }

  isVeiculoSelecionado() {
    const veiculo = this.formItem.get('veiculo').value;
    return !_.isNil(veiculo) && !_.isNil(veiculo.codigoMva)
  }

  isVeiculoAssociadoAgrupadores() {
    const veiculo = this.formItem.get('veiculo').value;
    if (!veiculo) {
      return false;
    }
    return !_.isNil(veiculo.grupoEconomico);
  }

  

  private createFormItem(value: any = null) {
    const requireIdValidator = FormUtils.requireId();
    const form = this.builder.group({
      veiculo: [null, [Validators.required, requireIdValidator]],
      grupoEconomico: [this.grupoEconomico, [Validators.required, requireIdValidator]],
      condutor: [null, [requireIdValidator]],
      condutorAnterior: [null, [requireIdValidator]],
      cliente: [null, [requireIdValidator]],
      centroCusto: [null, [requireIdValidator]],
      regional: [null, [requireIdValidator]],
      municipio: [null, [requireIdValidator]],
      descricao: [null, [Validators.maxLength(255)]],
      desalocar: [false],
      desvincular: [false]
    });

    if (_.isNil(value)) {
      form.get('veiculo').valueChanges.pipe(
        distinctUntilChanged()
      ).subscribe((novoVeiculo) => {
        if (!_.isPlainObject(novoVeiculo) || _.isNil(novoVeiculo.codigoMva)) {
          return;
        }
        if (!_.isNil(novoVeiculo.municipio)) {
          novoVeiculo.municipio.municipio = novoVeiculo.municipio.descricao;
          novoVeiculo.municipio.uf = novoVeiculo.uf;
        }

        this.formItem.get('cliente').setValue(novoVeiculo.cliente);
        this.formItem.get('condutorAnterior').setValue(novoVeiculo.condutorAlocado);
        this.formItem.get('centroCusto').setValue(novoVeiculo.centroCusto);
        this.formItem.get('regional').setValue(novoVeiculo.regional);
        this.formItem.get('municipio').setValue(novoVeiculo.municipio);
        this.formItem.get('descricao').setValue(novoVeiculo.descricaoAgrupadores);
        this.formItem.get('desalocar').setValue(false);
        this.formItem.get('desvincular').setValue(false);
        const currentValue = this.formItem.value;
        if (_.isNil(this.originalValue) || _.eq(this.originalValue,currentValue) ) {
          form.markAsPristine();
        }
        this.originalValue = currentValue;
      });

      
    }

    if (!_.isNil(value)) {
      form.patchValue(value);
    }
    return form;
  }

  validateForm(form: FormGroup) {
  }

  addItem() {
    if (this.formItem.invalid) {
      this.snackBar.error(this.translate.instant('PORTAL.MSG_CAMPO_OBRIGATORIO'));
      FormUtils.markChildrenAsDirty(this.formItem);
      return;
    }
 
    const item = this.formItem.value;
    if (_.isNil(_.get(item, 'cliente.id'))
      && _.isNil(_.get(item, 'regional.id'))) {
      this.snackBar.error(this.translate.instant('PORTAL.ASSOCIAR_CONDUTOR.MENSAGENS.MSG_DEFINA_CLIENTE_REGIONAL_OU_CENTRO_CUSTO'));
      FormUtils.markChildrenAsDirty(this.formItem);
      return;
    }
    const itensCtrl = this.form.get('itens') as FormArray;
    const itens = itensCtrl.value;
    if (!_.isEmpty(itens)) {
      let found = _.find(itens, (itemAtual) => itemAtual.veiculo.codigoMva === item.veiculo.codigoMva);
      if (!_.isNil(found)) {
        this.snackBar.error(this.translate.instant('PORTAL.ASSOCIAR_CONDUTOR.MENSAGENS.MSG_VEICULO_INCLUSO_LISTAGEM'));
        return;
      }
      found = _.find(itens, (itemAtual) => {
        const idAtual = _.get(itemAtual, 'condutor.id');
        const idItem = _.get(item, 'condutor.id');
        return idAtual === idItem && !_.isNil(idAtual);
      });
      if (!_.isNil(found)) {
        this.snackBar.error(this.translate.instant('PORTAL.ASSOCIAR_CONDUTOR.MENSAGENS.MSG_CONDUTOR_JA_INCLUSO_LISTAGEM'));
        return;
      }
    }
    
    const addFormItem = () => {
      itensCtrl.push(this.createFormItem(this.formItem.value));
      this.clearItemForm();
    }

    const condutorId = _.get(item, 'condutor.id');
    const condutorAnteriorId = _.get(item, 'condutorAnterior.id');
    if (!_.isNil(condutorId)) {
      this.condutorVeiculoService.validar(
        _.get(item, 'veiculo.codigoMva'),
        condutorId,
        condutorAnteriorId
      )
      .subscribe(
        ()=> addFormItem(),
        (error)=> {
          const msg = _.get(error,'error.message.error');
          if (!_.isNil(msg)) {
            this.snackBar.error(this.translate.instant(`PORTAL.ASSOCIAR_CONDUTOR.MENSAGENS.MSG_${msg}`));
          } else {
            this.snackBar.error(this.translate.instant(`PORTAL.MSG_ERRO_INESPERADO`));
          }
        }
      );
    } else {
      addFormItem();
    }
    
    return this.formItem;
  }


  onSaveException(event: any) {
    const errorMsg = _.get(event, 'error.message.error');
    if (MSG_CONDUTOR_VEICULO_JA_ASSOCIADO.test(errorMsg)) {
      const itensCtrl = this.form.get('itens') as FormArray;
      const res = /(CONDUTOR_JA_ASSOCIADO|VEICULO_JA_ASSOCIADO)_(\d+)/.exec(errorMsg);
      const msg = res[1];
      const entityType = msg.charAt(0);
      const id = parseInt(res[2]);
      const found = _.find(itensCtrl.value, (itemAtual) => {
        return (entityType === 'V' && itemAtual.veiculo.codigoMva === id) ||
          (entityType === 'C' && _.get(itemAtual, 'condutor.id') === id)
      });
      if (!_.isNil(found)) {
        found.destacarDuplicado = true;
      }
      this.snackBar.error(this.translate.instant(`PORTAL.ASSOCIAR_CONDUTOR.MENSAGENS.MSG_${msg}`));
    }
  }

  public clearItemForm() {
    this.formItem.reset();
    this.formItem.get('grupoEconomico').setValue(this.grupoEconomico);
    this.formItem.markAsUntouched();
  }

  removeItem(index: number) {
    const itensCtrl = this.form.get('itens') as FormArray;
    itensCtrl.removeAt(index);
  }

  displayCondutores(item: any) {
    if (_.isNil(item)) {
      return null;
    }
    const cpfFmt = _.isNil(item.cpf) || _.isEmpty(item.cpf)? '' : ' - '+FormatUtil.formatCpfCnpj(item.cpf);
    return `${item.nomeCondutor}${cpfFmt}`
  }

  displayMunicipios(item: any) {
    if (_.isNil(item)) {
      return null;
    }
    return `${item.municipio || item.nome} - ${item.uf}`
  }

  displayPlaca(data: any) {
    if (_.isNil(data)) {
      return null;
    }
    const placa = this.formatarPlaca(data['placa']);
    const emUso = !_.isNil(data.condutorAlocado) ? ' (Em uso)' : '';
    return `${placa} - ${data.modelo}${emUso}`;
  }

  formatarPlaca(placa) {
    return Util.formataPlaca(placa);
  }

  onSave(event: any) {
    this.reset();
  }

  confirmarRemocaoItem(index: number): void {
    const conteudoModal: DadosModalMV = {
      titulo: 'PORTAL.LABELS.LBL_ALERT',
      conteudo: '',
      modalMensagem: true,
      dados: []
    };

    this.dadosModalService.set(conteudoModal);

    const modalConfirm = this.modalService.open(ModalConfirmComponent);

    modalConfirm.componentInstance.mensagem = this.translate.instant('PORTAL.ASSOCIAR_CONDUTOR.MENSAGENS.MSG_CANCELAR_INCLUSAO');
    modalConfirm.componentInstance.botaoSecundario = 'PORTAL.BTN_NAO';
    modalConfirm.componentInstance.botaoPrimario = 'PORTAL.BTN_SIM';

    modalConfirm.result.then(result => {
      this.dadosModalService.set(null);
      if (result) {
        this.removeItem(index);
        this.snackBar.success(this.translate.instant('PORTAL.ASSOCIAR_CONDUTOR.MENSAGENS.MSG_ASSOCIACAO_CANCELADA'));
      }
    });
  }


  confirmarCancelamentoBatch(): void {
    const conteudoModal: DadosModalMV = {
      titulo: 'PORTAL.LABELS.LBL_ALERT',
      conteudo: '',
      modalMensagem: true,
      dados: []
    };

    this.dadosModalService.set(conteudoModal);

    const modalConfirm = this.modalService.open(ModalConfirmComponent);

    modalConfirm.componentInstance.mensagem = this.translate.instant('PORTAL.ASSOCIAR_CONDUTOR.MENSAGENS.MSG_CANCELAR_TODAS_INCLUSOES');
    modalConfirm.componentInstance.botaoSecundario = 'PORTAL.BTN_NAO';
    modalConfirm.componentInstance.botaoPrimario = 'PORTAL.BTN_SIM';

    modalConfirm.result.then(result => {
      this.dadosModalService.set(null);
      if (result) {
        this.back();
      }
    });
  }

  cancel() {
    if (!this.isBatchEmpty()) {
      this.confirmarCancelamentoBatch();
    } else {
      this.back();
    }
  }

  private reset() {
    this.form.reset();
    const itensCtrl = this.form.get('itens') as FormArray;
    _.times(itensCtrl.length, (index) => itensCtrl.removeAt(index));
  }

  private back() {
    this.router.navigate(['/gerenciador-frota/associar-condutor']);
  }

  getCancelLabel() {
    if (!this.isBatchEmpty()) {
      return this.translate.instant('PORTAL.ASSOCIAR_CONDUTOR.BUTTONS.BTN_CANCELAR');
    } else {
      return this.translate.instant('PORTAL.ASSOCIAR_CONDUTOR.BUTTONS.BTN_VOLTAR');
    }
  }

}
