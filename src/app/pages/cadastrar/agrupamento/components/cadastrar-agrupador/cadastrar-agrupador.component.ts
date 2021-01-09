import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { CentroCustoRegionalService } from 'src/app/core/services/centro-custo-regional.service';
import { CentroCustoService } from 'src/app/core/services/centro-custo.service';
import { DadosModalService } from 'src/app/core/services/dados-modal.service';
import { RegionalService } from 'src/app/core/services/regionais.service';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';
import { UserContextService } from 'src/app/core/services/user-context.service';
import { ModalConfirmComponent } from 'src/app/shared/components/modal-confirm/modal-confirm.component';
import { DadosModalMV } from 'src/app/shared/interfaces/dados-modal.model';
import { Util } from 'src/app/shared/util/utils';

@Component({
  selector: 'app-cadastrar-agrupador',
  templateUrl: './cadastrar-agrupador.component.html',
  styleUrls: ['./cadastrar-agrupador.component.scss']
})
export class CadastrarAgrupadorComponent implements OnInit {
  @ViewChild('inputDescricao') inputDescricao: ElementRef;

  agrupadores: any[] = [];

  isEdition: boolean;

  formAgrupador: FormGroup;

  buttonSubmitText: string;
  alertClass: string;

  selectedRadio: any;

  situacoes = [{
    id: 'R',
    descricao: 'Regional'
  }, {
    id: 'C',
    descricao: 'Centro de Custo'
  }];

  situacaoEdit: string;

  constructor(
    private modalService: NgbModal,
    private translate: TranslateService,
    private snackBar: SnackBarService,
    private centroscustoregionaisService: CentroCustoRegionalService,
    private userContext: UserContextService,
    private dadosModalService: DadosModalService,
    private centroCustoService: CentroCustoService,
    private regionalService: RegionalService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.isEdition = !!this.activatedRoute.snapshot.params['id'];
    this.buttonSubmitText = !this.isEdition ? 'PORTAL.BUTTONS.BTN_ADD' : 'PORTAL.BUTTONS.BTN_SAVE';

    this.criaForm();
  }

  private criaForm(): void {
    this.formAgrupador = new FormGroup({
      id: new FormControl('', Validators.compose([])),
      situacao: new FormControl('', Validators.compose([Validators.required])),
      descricao: new FormControl('', Validators.compose([Validators.required]))
    });

    if (this.isEdition) {
      this.situacaoEdit = this.activatedRoute.snapshot.params['tipo'];

      this.formAgrupador.get('id').setValue(this.activatedRoute.snapshot.params['id']);

      if (this.situacaoEdit === 'R') {
        this.getById(this.regionalService.getById(this.activatedRoute.snapshot.params['id']));
      } else {
        this.getById(this.centroCustoService.getById(this.activatedRoute.snapshot.params['id']));
      }
    }
  }

  private getById(service: Observable<any>): void {
    service.subscribe(res => {
      this.formAgrupador.get('situacao').setValue(this.situacoes.find(item => item.id === this.activatedRoute.snapshot.params['tipo']));
      this.formAgrupador.get('descricao').setValue(res.data.descricao);
    }, res => {
      this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  adicionarAgrupador(): void {
    if (!this.isEdition && this.agrupadores.length === 15) {
      this.snackBar.open(this.translate.instant('PORTAL.AGRUPADORES.MENSAGENS.MAXIMO_AGRUPADORES_INSERIDOS'), 7000, 'X');
      return;
    }

    Util.habilitarValidacoes(this.formAgrupador, ['situacao', 'descricao']);


    if (this.formAgrupador.controls.situacao.hasError('required')) {
      this.selectedRadio = true;
    } else {
      this.selectedRadio = false;
    }

    Util.validateAllFormFields(this.formAgrupador);

    if (!this.formAgrupador.valid) {
      this.snackBar.open(this.translate.instant('PORTAL.MSG_CAMPO_OBRIGATORIO'), 7000, 'X');
      return;
    }


    if (!this.isEdition) {
      if (this.agrupadores.length > 0) {
        if (this.agrupadores.some(agrupador => agrupador.descricao.toLowerCase() === Util.getFormValue(this.formAgrupador, 'descricao').toLowerCase())) {
          this.inputDescricao.nativeElement.focus();
          this.snackBar.open(this.translate.instant('PORTAL.AGRUPADORES.MENSAGENS.AGRUPADOR_JA_CADASTRADO').replace('${1}', this.formAgrupador.get('descricao').value), 7000, 'X');
          return;
        }
      }
      this.agrupadores.push({
        tipo: Util.getFormValue(this.formAgrupador, 'situacao')['id'],
        descricaoTipo: Util.getFormValue(this.formAgrupador, 'situacao')['descricao'],
        descricao: Util.getFormValue(this.formAgrupador, 'descricao')
      });

      this.limparCampos();
    } else {
      this.alterarCadastro();
    }
  }

  salvarCadastro(): void {
    const body = {
      centrosCustosRegionais: this.montarObjetoPost()
    };

    this.centroscustoregionaisService.post(body).subscribe(res => {
      this.snackBar.success(this.translate.instant('PORTAL.AGRUPADORES.MENSAGENS.SUCESSO_CADASTRO_SUCESSO'), 7000, 'X');
      this.goToSearch();
    }, res => {
      this.verifyResponse(res);
    });
  }

  private montarObjetoPost(): any[] {
    const arr = this.agrupadores.map(item => {
      return {
        grupoEconomicoId: this.userContext.getGrupoEconomicoId(),
        usuarioId: this.userContext.getUsuarioId(),
        tipo: item.tipo,
        descricao: item.descricao
      };
    });

    return arr;
  }

  alterarCadastro(): void {
    let service;
    if (this.situacaoEdit === 'R') {
      service = this.regionalService;
    } else {
      service = this.centroCustoService;
    }

    const body = {
      descricao: this.formAgrupador.get('descricao').value,
      grupoEconomicoId: this.userContext.getGrupoEconomicoId(),
      usuarioId: this.userContext.getUsuarioId()
    };

    service.put(this.activatedRoute.snapshot.params['id'], body).subscribe(res => {
      this.snackBar.success(this.translate.instant('PORTAL.AGRUPADORES.MENSAGENS.ALTERADO_CADASTRO_SUCESSO'), 7000, 'X');
      this.limparCampos();
      this.goToSearch();
    }, res1 => {
      this.verifyResponse(res1);
    });
  }

  private verifyResponse(response: any): void {
    if (response.error.message.error.includes('REGIONAL_CADASTRADA') || response.error.message.error.includes('CENTRO_CUSTO_CADASTRADO')) {
      const valorExistente = response.error.message.error.split('@');
      const mensagemCentroCusto = this.translate.instant('PORTAL.AGRUPADORES.MENSAGENS.AGRUPADOR_JA_CADASTRADO');

      if (this.isEdition) {
        this.inputDescricao.nativeElement.focus();
      }

      this.snackBar.open(mensagemCentroCusto.replace('${1}',
        this.isEdition ?
          this.formAgrupador.get('descricao').value :
          valorExistente[1]),
        7000,
        'X'
      );
    } else {
      this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    }
  }

  limparCampos(): void {
    this.formAgrupador.reset();
    this.selectedRadio = false;
    Util.desabilitarValidacoes(this.formAgrupador, 'descricao');
  }

  confirmarRemocao(idx: number): void {
    const conteudoModal: DadosModalMV = {
      titulo: 'PORTAL.AGRUPADORES.MENSAGENS.REMOVER_CADASTRO_AGRUPADOR',
      conteudo: '',
      modalMensagem: true,
      dados: []
    };

    this.dadosModalService.set(conteudoModal);

    const modalConfirm = this.modalService.open(ModalConfirmComponent);

    modalConfirm.componentInstance.botaoSecundario = 'PORTAL.BTN_NAO';
    modalConfirm.componentInstance.botaoPrimario = 'PORTAL.BTN_SIM';

    modalConfirm.result.then(result => {
      this.dadosModalService.set(null);
      if (result) {
        this.agrupadores.splice(idx, 1);
        this.snackBar.success(this.translate.instant('PORTAL.AGRUPADORES.MENSAGENS.REMOVIDO_CADASTRO_SUCESSO'), 7000, 'X');
      }
    });
  }

  confirmarCancelamento(): void {
    if (this.agrupadores.length === 0) {
      this.goToSearch();
      return;
    }
    const conteudoModal: DadosModalMV = {
      titulo: 'PORTAL.LABELS.LBL_ALERT',
      conteudo: '',
      modalMensagem: true,
      dados: []
    };

    this.dadosModalService.set(conteudoModal);

    const modalConfirm = this.modalService.open(ModalConfirmComponent);

    modalConfirm.componentInstance.mensagem = this.translate.instant('PORTAL.AGRUPADORES.MENSAGENS.CANCELAR_CADASTRO');
    modalConfirm.componentInstance.botaoSecundario = 'PORTAL.BTN_NAO';
    modalConfirm.componentInstance.botaoPrimario = 'PORTAL.BTN_SIM';

    modalConfirm.result.then(result => {
      this.dadosModalService.set(null);
      if (result) {
        this.goToSearch();
      }
    });
  }

  addClass(element: ElementRef, cssClass: string, remove: boolean): void {
    if (!remove) {
      element['path'][3].classList.add(cssClass);
    } else {
      element['path'][3].classList.remove(cssClass);
    }
  }

  private goToSearch(): void {
    this.router.navigateByUrl('cadastrar/agrupadores');
  }
}
