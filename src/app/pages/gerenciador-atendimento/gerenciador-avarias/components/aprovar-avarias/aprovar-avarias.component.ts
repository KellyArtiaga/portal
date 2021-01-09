import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { findIndex } from 'lodash';
import { ReplaySubject } from 'rxjs';

import { StatusItemCartaAvariaEnum } from '../../../../../../assets/data/enums/status-item-avaria.enum';
import { CartaAvariaService } from '../../../../../core/services/carta-avaria.service';
import { ResumoAvariasService } from '../../../../../core/services/resumo-avarias.service';
import { SnackBarService } from '../../../../../core/services/snack-bar.service';
import { UserContextService } from '../../../../../core/services/user-context.service';
import { CartaAvariasMV } from '../../../../../shared/interfaces/carta-avarias.model';
import { ColunasTabelaMV } from '../../../../../shared/interfaces/colunas-tabela.model';
import { MateriasAvariasMV } from '../../../../../shared/interfaces/materiais-avarias.model';
import { PostAvariasMV } from '../../../../../shared/interfaces/post-avarias.model';
import { ResumoAvariasMV } from '../../../../../shared/interfaces/resumo-avarias.model';
import { Util } from 'src/app/shared/util/utils';
import { CartaAutorizacaoCobrancaService } from 'src/app/core/services/cartas-autorizacoes.service';

@Component({
  selector: 'app-aprovar-avarias',
  templateUrl: './aprovar-avarias.component.html',
  styleUrls: ['./aprovar-avarias.component.scss']
})
export class AprovarAvariasComponent implements OnInit {

  @ViewChild('genericTable') genericTable: ElementRef;
  @Output() return = new EventEmitter();

  cartaAvarias: Array<CartaAvariasMV> = [];
  resumoAvarias: Array<ResumoAvariasMV> = [];
  inputDataSubject = new ReplaySubject<any>(1);

  filtro: any;

  showOS: boolean;
  isSearch: boolean;
  showTable: boolean;
  showResumo: boolean;
  toggle: boolean;
  emAnalise: boolean;
  isRequiredObservacao: boolean;

  formCartaAvarias: FormGroup;

  numPage = 1;
  numRows = 20;
  somaTotal = 0;
  somaAprovados = 0;
  somaReprovados = 0;
  totalRows: number;
  atendimentoId: number;

  cartaAvaria: any;

  observacao: string;
  tipoAvaria: string;

  constructor(
    private resumoAvariasService: ResumoAvariasService,
    private cartaAvariaService: CartaAvariaService,
    private snackBar: SnackBarService,
    private translateService: TranslateService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private userContext: UserContextService,
    private cartaAutorizacaoService: CartaAutorizacaoCobrancaService
  ) { }

  ngOnInit() {
    this.criaForm();

    this.emAnalise = false;
    this.isSearch = true;
    this.showTable = false;
    this.showResumo = false;

    this.atendimentoId = Number(this.activatedRoute.snapshot.params['id']);
    this.tipoAvaria = this.activatedRoute.snapshot.params['tipo'];

    this.getCartaAvarias();
  }

  criaForm(): void {
    this.formCartaAvarias = new FormGroup({
      possiveisCausasProblemas: new FormControl(),
      impactoNaoExecucaoTrocaPeca: new FormControl(),
      aprovadoPor: new FormControl(this.getNomeUsuario()),
      observacao: new FormControl('', Validators.required)
    });
  }

  filtrarAvarias(filtro?: any): void {
    if (!filtro) {
      this.showTable = false;
      this.cartaAvarias = [];
    } else {
      this.showTable = true;
      this.filtro = filtro;
    }
  }

  limparTabela() {
    this.showTable = false;
    this.cartaAvarias = [];
  }

  getCartaAvarias(): void {
    if (this.tipoAvaria === 'C') {
      this.cartaAvariaService.getCartaAvarias(this.atendimentoId).subscribe(res => {
        this.montarCorpoAvarias(this.tipoAvaria === 'C' ? res.data.results : res.data, this.tipoAvaria === 'C' ? res.data.totalRows : null);
      }, res => {
        this.cartaAvarias = [];
        this.snackBar.error(res.message.error, 7000);
      });
    } else {
      this.cartaAutorizacaoService.getCartaAvarias(this.atendimentoId).subscribe(res => {
        this.montarCorpoAvarias(this.tipoAvaria === 'C' ? res.data.results : res.data, this.tipoAvaria === 'C' ? res.data.totalRows : null);
      }, res => {
        this.cartaAvarias = [];
        this.snackBar.error(res.message.error, 7000);
      });
    }
  }

  private montarCorpoAvarias(results: any, totalRows?: number): void {
    this.cartaAvarias = results;
    this.observacao = results;

    if (totalRows) {
      this.totalRows = totalRows;
    }

    this.inputDataSubject.next(this.cartaAvarias);

    this.cartaAvarias.forEach(item => {
      item.toggle = true;

      item.situacao = item.statusItem && item.statusItem === 'R' ? 'REPROVADOR' : 'APROVADO';

      item.isAtivo = item.situacao === 'REPROVADOR';
      item.emAnalise = item.situacao === 'EM_ANALISE';
      item.toggleReadOnly = item.situacao === 'APROVADO';
    });

    this.isRequiredObservacao = this.cartaAvarias.some(avaria => avaria.isAtivo);

    this.setObservacoesValidation();
    this.getValorTotalServicos();

    if (this.tipoAvaria === 'C') {
      this.getHistoricoAvaria();
    } else {
      this.getCabecalhoDevolucao();
    }

    this.showTable = true;
  }

  private getCabecalhoDevolucao(): void {
    this.cartaAutorizacaoService.getById(this.atendimentoId).subscribe(res => {
      res.data.km = res.data.odometroAtual;
      res.data.dataAtendimento = res.data.inseridoEm;
      res.data.ordemServico = res.data.osId;

      this.cartaAvaria = res.data;
    }, res => {
      this.snackBar.error(res.message.error, 7000);
    });
  }

  private getHistoricoAvaria(): void {
    this.resumoAvariasService.getHistorico(this.atendimentoId).subscribe(res => {
      this.resumoAvarias = res.data.results;
      this.resumoAvarias.forEach(item => {
        if (item.dataAtendimento) {
          item.dataAtendimento = item.dataAtendimento.replace('Z', '');
        }
      });

      this.cartaAvaria = this.resumoAvarias[0];

      if (this.cartaAvaria) {
        this.formCartaAvarias.get('possiveisCausasProblemas').setValue(this.cartaAvaria.possiveisCausasProblemas ? this.cartaAvaria.possiveisCausasProblemas : null);
        this.formCartaAvarias.get('impactoNaoExecucaoTrocaPeca').setValue(this.cartaAvaria.impactoNaoExecucaoTrocaPeca ? this.cartaAvaria.impactoNaoExecucaoTrocaPeca : null);
        this.formCartaAvarias.get('observacao').setValue(this.cartaAvaria.observacao ? this.cartaAvaria.observacao : null);
      }

      this.showResumo = true;
    }, res => {
      this.resumoAvarias = [];
      this.snackBar.error(res.message.error, 7000);
      this.showResumo = true;
    });
  }

  getNomeUsuario(): string {
    if (!this.userContext.getDados() || !this.userContext.getDados().nomeUsuario) {
      return '-';
    }
    return this.userContext.getDados().nomeUsuario;
  }

  getColunasTabela(): Array<ColunasTabelaMV> {
    const colunas: Array<ColunasTabelaMV> = [
      {
        description: this.translateService.instant('PORTAL.AVARIAS.APROVAR.SERVICO'), columnDef: this.tipoAvaria === 'D' ? 'descricaoItem' : 'material', style: {
          minWidth: 200
        }
      },
      {
        description: this.translateService.instant('PORTAL.AVARIAS.APROVAR.QUANTIDADE'), columnDef: 'quantidade', style: {
          minWidth: 100
        }
      },
      {
        description: this.translateService.instant('PORTAL.AVARIAS.APROVAR.REEMBOLSO'), columnDef: 'valorReembolso',
        currency: true, style: {
          minWidth: 100
        }
      },
      {
        description: this.translateService.instant('PORTAL.LABELS.ACOES'),
        columnDef: 'ativo: toggle', class: 'text-center active: toggle', toggle: true, style: { minWidth: 200 }, toggleConfig: {
          leftLabel: this.translateService.instant('PORTAL.LABELS.APROVADO'),
          rightLabel: this.translateService.instant('PORTAL.LABELS.REPROVADO'),
          function: this.changeStatusToggle.bind(this)
        }
      }
    ];

    return colunas;
  }

  changeStatusToggle(event: any) {
    const idx = findIndex(this.cartaAvarias, event);
    if (event) {
      if (event.situacao === 'REPROVADOR') {
        event.situacao = 'APROVADO';
        event.isAtivo = !event.isAtivo;
      } else if (event.situacao === 'EM_ANALISE' || event.situacao === 'APROVADO') {
        event.situacao = 'REPROVADOR';
        event.isAtivo = !event.isAtivo;
      }
    }

    this.cartaAvarias[idx] = event;
    this.alterarValor();
  }

  aprovarAll(event: any): void {
    this.inputDataSubject.next(this.cartaAvarias.forEach(item => {
      if (!item.toggleReadOnly) {
        item.situacao = 'APROVADO';
        item.isAtivo = false;
      }
    }));
    this.genericTable['updateTable']();
    this.alterarValor();
  }

  reprovarAll(event: any): void {
    this.inputDataSubject.next(this.cartaAvarias.forEach(item => {
      if (!item.toggleReadOnly) {
        item.situacao = 'REPROVADOR';
        item.isAtivo = true;
      }
    }));
    this.genericTable['updateTable']();
    this.alterarValor();
  }

  voltar(): void {
    this.formCartaAvarias.reset();
    this.router.navigateByUrl('gerenciador-atendimento/gerenciador-avarias');
  }

  getValorTotalServicos(): void {
    this.somaTotal = 0;
    this.somaAprovados = 0;
    this.somaReprovados = 0;
    this.cartaAvarias.forEach(item => {
      this.somaTotal += item.valorReembolso;
      if (item.situacao === 'APROVADO') {
        this.somaAprovados += item.valorReembolso;
      } else if (item.situacao === 'REPROVADOR') {
        this.somaReprovados += item.valorReembolso;
      } else if (item.situacao === 'EM_ANALISE') {
        this.somaAprovados += item.valorReembolso;
      }
    });
  }

  alterarValor() {
    this.somaAprovados = 0;
    this.somaReprovados = 0;

    this.isRequiredObservacao = this.cartaAvarias.some(avaria => avaria.isAtivo);

    this.cartaAvarias.forEach(item => {
      if (item.situacao === 'APROVADO') {
        this.somaAprovados += item.valorReembolso;
      } else if (item.situacao === 'REPROVADOR') {
        this.somaReprovados += item.valorReembolso;
      } else if (item.situacao === 'EM_ANALISE') {
        this.somaAprovados += item.valorReembolso;
      }
    });

    this.setObservacoesValidation();
  }

  salvarAvarias(): void {
    Util.validateAllFormFields(this.formCartaAvarias);

    if (this.tipoAvaria === 'C' && !this.formCartaAvarias.valid) {
      this.snackBar.open(this.translateService.instant('PORTAL.MSG_CAMPO_OBRIGATORIO'), 7000, 'X');
      return;
    }
    const materiaisAvaria: MateriasAvariasMV[] = [];

    this.cartaAvarias.forEach((value: CartaAvariasMV) => {
      const itens: MateriasAvariasMV = {
        aprovado: value.situacao === 'APROVADO',
        codigoRequisicaoItem: value.requisicaoId,
        material: value.material,
        quantidade: value.quantidade,
        valorReembolso: value.valorReembolso
      };

      materiaisAvaria.push(itens);
    });

    if (this.tipoAvaria === 'C') {
      const postObj: PostAvariasMV = {
        aprovadoPor: this.userContext.getDados().nomeUsuario,
        cliente: this.userContext.getDados().nomeCliente,
        codigoAtendimento: this.atendimentoId,
        codigoAtendimentoFornecedor: this.getResumoCartaAvaria().atendimentoFornecedorId,
        codigoContratoMaster: this.getResumoCartaAvaria().contratoMasterId,
        codigoRequisicao: this.getResumoCartaAvaria().requisicaoId,
        codigoSAC: this.getResumoCartaAvaria().evento,
        dataAtendimento: this.getResumoCartaAvaria().dataAtendimento,
        franquia: this.getResumoCartaAvaria().franquia,
        laudoCausa: this.getResumoCartaAvaria().possiveisCausasProblemas || '',
        laudoImpacto: this.getResumoCartaAvaria().impactoNaoExecucaoTrocaPeca || '',
        materiais: materiaisAvaria,
        modelo: this.getResumoCartaAvaria().modelo,
        observacao: this.formCartaAvarias.get('observacao').value ? this.formCartaAvarias.get('observacao').value : '',
        odometroAtual: this.getResumoCartaAvaria().km,
        percentualProtecaoAvaria: this.getResumoCartaAvaria().percentualProtecaoAvaria,
        placa: this.getResumoCartaAvaria().placa,
        prazoLiberacao: this.getResumoCartaAvaria().prazoLiberacao,
        prazoLiberacaoExtenso: this.getResumoCartaAvaria().prazoLiberacaoExtenso,
        telefone: this.getResumoCartaAvaria().telefone,
        valorCobrado: this.getResumoCartaAvaria().valorCobrado,
        valorFIPE: this.getResumoCartaAvaria().valorFipe
      };

      this.cartaAvariaService.postAvarias(postObj).subscribe(res => {
        this.patchAvarias();
      }, res => {
        if (res.status === 200) {
          this.patchAvarias();
        } else {
          this.snackBar.error(res.error, 7000, 'X');
        }
      });
    } else {
      this.putvarias();
    }
  }

  private putvarias(): void {
    this.cartaAutorizacaoService.putAprovacao(this.atendimentoId, this.getPatchAvarias()).subscribe(res => {
      this.onSuccessAprovacao();
    }, res => {
      this.snackBar.error(this.translateService.instant('PORTAL.MSG_ERRO_INESPERADO'), 7000, 'X');
    });
  }

  private patchAvarias(): void {
    this.cartaAvariaService.patchAvarias(this.atendimentoId, this.getPatchAvarias()).subscribe(res1 => {
      this.onSuccessAprovacao();
    }, res1 => {
      this.snackBar.error(this.translateService.instant('PORTAL.MSG_ERRO_INESPERADO'), 7000, 'X');
    });
  }

  private onSuccessAprovacao(): void {
    this.router.navigateByUrl('gerenciador-atendimento/gerenciador-avarias');
    this.snackBar.success('Itens atualizados com sucesso!', 7000, 'X');
  }

  private getPatchAvarias(): any {
    const itensCarta = [];
    this.cartaAvarias.forEach((valor: CartaAvariasMV) => {
      const itens = {
        atendimentosClientesFornecedorControleAvariaId: this.tipoAvaria === 'D' ? valor['id'] : valor['itemCartaAvariaId'],
        atendimentosClientesFornecedorControleAvariaStatus: this.tipoAvaria === 'D' ? valor['statusItem'] : StatusItemCartaAvariaEnum[valor.situacao]
      };

      itensCarta.push(itens);
    });

    const patchObj = {
      observacao: this.formCartaAvarias.get('observacao').value,
      atendimentoId: Number(this.atendimentoId),
      usuarioId: Number(this.userContext.getID()),
      itensCarta: itensCarta,
      itensCartaAvaria: itensCarta
    };

    if (this.tipoAvaria === 'D') {
      delete patchObj.atendimentoId;
      delete patchObj.itensCartaAvaria;
    } else {
      delete patchObj.observacao;
      delete patchObj.itensCarta;
    }

    return patchObj;
  }

  private getResumoCartaAvaria(): ResumoAvariasMV {
    return this.resumoAvarias[0];
  }

  private setObservacoesValidation(): void {
    this.formCartaAvarias.get('observacao').setValidators(this.isRequiredObservacao ? Validators.required : null);
  }
}
