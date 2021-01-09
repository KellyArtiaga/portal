import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { distinctUntilChanged } from 'rxjs/operators';

import { BarraNavegacaoService } from '../../../../../core/services/barra-navegacao.service';
import { CondutorService } from '../../../../../core/services/condutor.service';
import { PerfilService } from '../../../../../core/services/perfil.service';
import { ReloadListasService } from '../../../../../core/services/reload-listas.service';
import { SnackBarService } from '../../../../../core/services/snack-bar.service';
import { UserContextService } from '../../../../../core/services/user-context.service';
import { PerfilMV } from '../../../../../shared/interfaces/perfil.model';
import { Util } from '../../../../../shared/util/utils';
import { CepEnderecoComponent } from '../cep-endereco/cep-endereco.component';
import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { FormUtils } from 'src/app/shared/util/form-utils';
import { MatRadioChange } from '@angular/material';
@Component({
  selector: 'app-usuario-condutor-dados-adicionais',
  templateUrl: './usuario-condutor-dados-adicionais.component.html',
  styleUrls: ['./usuario-condutor-dados-adicionais.component.scss']
})
export class UsuarioCondutorDadosAdicionaisComponent implements OnInit {

  @Input() formValue: any;

  formDadosAdicionais: FormGroup;
  grupoEconomico: any;
  formaContatos: any[];
  perfis: PerfilMV[];
  subject = new Subject<any>();
  isPerfilSelecaoGrupoEconomico = true;
  isNecessarioEndCrlv = false;
  isNecessarioProdutos = false;
  isNiveisNecessarios = false;
  descricaoPerfilMeuUsuario: string;
  desabilitarGrupoEconomico: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private barraNavegacao: BarraNavegacaoService,
    private perfilService: PerfilService,
    private condutorService: CondutorService,
    private snackBar: SnackBarService,
    private translate: TranslateService,
    private userContext: UserContextService
  ) { }

  ngOnInit(): void {
    this.grupoEconomico = this.userContext.getGrupoEconomico();
    this.criaForm();
    this.fetchPerfis();
    this.fetchFormaContato();

    this.formDadosAdicionais.statusChanges.subscribe(value => {
      if (this.barraNavegacao.get().aba !== 4) {
        return;
      }
      this.barraNavegacao.habilitar('prosseguir', value === 'VALID');
      this.barraNavegacao.mostrar('cancelar', value === 'VALID');
      this.barraNavegacao.validar('dadosAdicionais', value === 'VALID');
    });
    ReloadListasService.get('dadosAdicionais').subscribe(data => {
      Util.validateAllFormFields(this.formDadosAdicionais);

      this.barraNavegacao.validar('dadosAdicionais', this.formDadosAdicionais.valid);

      this.barraNavegacao.concatUserData(this.formDadosAdicionais.value);
    });
    ReloadListasService.get('resetDadosAdicionais').subscribe(data => {
      this.formDadosAdicionais.reset();
    });
  }

  criaForm(): void {
    const isDadosCarregados = this.formValue && this.formValue.dadosAdicionais;
    const isCepCarregado = isDadosCarregados && !_.isNil(this.formValue.dadosAdicionais.enderecoCrlv);
    const nomePerfil = this.userContext.getIsMaster() ? 'Master' : this.userContext.getDados().descricaoPerfilUsuario;

    this.formDadosAdicionais = this.formBuilder.group({
      descricaoPerfilMeuUsuario: [nomePerfil],
      perfil: ['', Validators.compose([Validators.required, FormUtils.requireId('chavePerfilUsuario')])],
      grupoEconomico: ['', Validators.compose([Validators.required, FormUtils.requireId()])],
      tipoRestricao: [null],
      clientes: [],
      regionais: [],
      centrosCusto: [],
      atividades: [],
      produtos: [],
      enderecoCrlv: CepEnderecoComponent.criarFormulario(
        this.formBuilder,
        isCepCarregado ? this.formValue.dadosAdicionais.enderecoCrlv : null
      ),
      formaContato: [''],
      aprovacaoNivel1: [false, Validators.compose([])],
      aprovacaoNivel2: [false, Validators.compose([])]
    });

    const clientesCtrl = this.formDadosAdicionais.get('clientes');
    const regionaisCtrl = this.formDadosAdicionais.get('regionais');
    const centrosCustoCtrl = this.formDadosAdicionais.get('centrosCusto');
    const atividadesCtrl = this.formDadosAdicionais.get('atividades');
    const produtosCtrl = this.formDadosAdicionais.get('produtos');
    const grupoEconCtrl = this.formDadosAdicionais.get('grupoEconomico');
    const tipoRestricao = this.formDadosAdicionais.get('tipoRestricao');
    const aprovacaoNivel1Ctrl = this.formDadosAdicionais.get('aprovacaoNivel1');
    const aprovacaoNivel2Ctrl = this.formDadosAdicionais.get('aprovacaoNivel2');

    tipoRestricao.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe((tipoRestricao) => {
        if (_.isNil(tipoRestricao)) {
          return;
        }
        if (tipoRestricao === 'C') {
          clientesCtrl.enable();
          regionaisCtrl.disable();
          centrosCustoCtrl.disable();
        } else if (tipoRestricao === 'R') {
          clientesCtrl.disable();
          regionaisCtrl.enable();
          centrosCustoCtrl.disable();
        } else if (tipoRestricao === 'U') {
          clientesCtrl.disable();
          regionaisCtrl.disable();
          centrosCustoCtrl.enable();
        }
      });

    this.formDadosAdicionais.get('perfil').valueChanges
      .pipe(distinctUntilChanged())
      .subscribe((perfil) => {
        if (_.isNil(perfil)) {
          return;
        }

        this.desabilitarGrupoEconomico = true;

        if (perfil.tipoPerfil === 'A') {
          tipoRestricao.disable();
          atividadesCtrl.disable();
          produtosCtrl.disable();
          clientesCtrl.disable();
          regionaisCtrl.disable();
          centrosCustoCtrl.disable();
          tipoRestricao.reset();
          atividadesCtrl.reset();
          produtosCtrl.reset();
          clientesCtrl.reset();
          regionaisCtrl.reset();
          centrosCustoCtrl.reset();
          this.desabilitarGrupoEconomico = false;
        } else {
          if (!_.isNil(this.grupoEconomico)) {
            grupoEconCtrl.setValue(this.grupoEconomico);
          }
          atividadesCtrl.enable();
          produtosCtrl.enable();
          if (perfil.tipoPerfil === 'G') {
            tipoRestricao.enable();
            clientesCtrl.enable();
            regionaisCtrl.enable();
            centrosCustoCtrl.enable();

            tipoRestricao.setValidators(Validators.required);
            tipoRestricao.updateValueAndValidity();
          } else {
            tipoRestricao.disable();
            clientesCtrl.disable();
            regionaisCtrl.disable();
            centrosCustoCtrl.disable();
            tipoRestricao.reset();
            clientesCtrl.reset();
            regionaisCtrl.reset();
            centrosCustoCtrl.reset();
          }
        }
      });

    atividadesCtrl.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe((atividades) => {
        this.isNecessarioEndCrlv = _(atividades).find((atividade) => atividade.chave === 'RECEBIMENTO_CRLV') != null;
        this.isNecessarioProdutos = true;
        this.isNiveisNecessarios = _(atividades).find(
          (atividade) => !_.isNil(atividade.chave)
            && atividade.chave.indexOf('MEDICAO') >= 0
        ) != null;
        const endereco = this.formDadosAdicionais.get('enderecoCrlv');
        if (this.isNecessarioEndCrlv) {
          endereco.enable();
        } else {
          endereco.disable();
        }

        if (this.isNiveisNecessarios) {
          aprovacaoNivel1Ctrl.enable();
          aprovacaoNivel2Ctrl.enable();
        } else {
          aprovacaoNivel1Ctrl.disable();
          aprovacaoNivel2Ctrl.disable();
        }

        if (this.isNecessarioProdutos) {
          produtosCtrl.enable();
        } else {
          produtosCtrl.disable();
        }
      });

    if (isDadosCarregados) {
      const dados = this.formValue.dadosAdicionais;
      dados.cliente.nomeFantasia = dados.cliente.cliente;

      this.formDadosAdicionais.get('perfil').setValue({ chavePerfilUsuario: dados.chavePerfilUsuario });
      this.formDadosAdicionais.get('formaContato').setValue(dados.formaContato);
      this.formDadosAdicionais.get('grupoEconomico').setValue(dados.grupoEconomico);
      this.formDadosAdicionais.get('clientes').setValue(dados.clientes);
      this.formDadosAdicionais.get('regionais').setValue(dados.regionais);
      this.formDadosAdicionais.get('centrosCusto').setValue(dados.centrosCusto);

      const tipoRes = !_.isEmpty(dados.clientes) ? 'C'
        : !_.isEmpty(dados.regionais) ? 'R'
          : !_.isEmpty(dados.centrosCusto) ? 'U' : null;
      tipoRestricao.setValue(tipoRes);
      tipoRestricao.enable();

      this.formDadosAdicionais.get('atividades').setValue(dados.atividades);
      this.formDadosAdicionais.get('produtos').setValue(dados.produtos);

      if (dados.enderecoCrlv) {
        this.formDadosAdicionais.get('enderecoCrlv').setValue(dados.enderecoCrlv);
      }

      this.formDadosAdicionais.get('aprovacaoNivel1').setValue(dados.aprovacaoNivel1);
      this.formDadosAdicionais.get('aprovacaoNivel2').setValue(dados.aprovacaoNivel2);

      tipoRestricao.setValidators(Validators.required);
      tipoRestricao.updateValueAndValidity();

      if (tipoRes) {
        this.validarAgrupador(tipoRes);
      }

      if (this.isExibirNiveis()) {
        this.formDadosAdicionais.get('aprovacaoNivel1').setValidators(Validators.required);
        this.formDadosAdicionais.get('aprovacaoNivel2').setValidators(Validators.required);
      } else {
        this.formDadosAdicionais.get('aprovacaoNivel1').setValidators(null);
        this.formDadosAdicionais.get('aprovacaoNivel2').setValidators(null);
      }

      this.formDadosAdicionais.updateValueAndValidity();
      this.barraNavegacao.validar('dadosAdicionais', this.formDadosAdicionais.valid);
    }
  }

  onLoadAtividades(event: any): void {
    const ativCtrl = this.formDadosAdicionais.get('atividades');
    const atividadesSelecionadas = ativCtrl.value;

    if (event.data && !_.isEmpty(event.data) && !_.isEmpty(atividadesSelecionadas)) {
      const idsAtividades = _(atividadesSelecionadas).map('id').value();
      ativCtrl.setValue(
        _(event.data).filter((ativ) => idsAtividades.includes(ativ.id)).value()
      );
    }
  }

  isPossivelSelecionarGrupoEconomico(): boolean {
    return this.isPerfilSelecaoGrupoEconomico && this.userContext.getIsMaster() && !this.desabilitarGrupoEconomico;
  }

  isPossivelSelecionarAgrupadores(): boolean {
    const perfil = this.formDadosAdicionais.get('perfil').value;
    if (_.isNil(perfil)) {
      return false;
    }
    return ['G'].includes(perfil.tipoPerfil);
  }

  isPossivelSelecionarAtividadesGrupos(): boolean {
    const perfil = this.formDadosAdicionais.get('perfil').value;
    if (_.isNil(perfil)) {
      return false;
    }
    return ['G', 'C'].includes(perfil.tipoPerfil);
  }

  isExibirEnderecoCrlv(): boolean {
    return this.isPossivelSelecionarAtividadesGrupos() && this.isNecessarioEndCrlv;
  }

  isExibirProdutos(): boolean {
    return this.isNecessarioProdutos;
  }

  isExibirGrupoEconomico(): boolean {
    return !_.isNil(this.formDadosAdicionais.get('perfil').value);
  }

  isExibirNiveis(): boolean {
    return this.isNiveisNecessarios;
  }

  display(cliente: any) {
    if (cliente) {
      return cliente['nomeFantasia'];
    }
  }

  fetchFormaContato(): void {
    this.condutorService.getAllFormaContato().subscribe(res => {
      this.formaContatos = res.data;
    }, res => {
      this.snackBar.error(res.error.message, 7000);
    });
  }

  fetchPerfis(): void {
    const idGrupoEcon = this.userContext.getIsMaster() ? null : this.grupoEconomico.id;
    this.perfilService.getAll(idGrupoEcon).subscribe(res => {
      this.perfis = _(res.data.results).filter((perfil) => this.perfilService.filtrar(perfil)).value();
      const perfilCtrl = this.formDadosAdicionais.get('perfil');
      const perfilWithId = perfilCtrl.value;
      if (!_.isNil(perfilWithId) && _.isString(perfilWithId.chavePerfilUsuario)) {
        perfilCtrl.setValue(
          _(this.perfis).find((perfil) => perfil.chavePerfilUsuario === perfilWithId.chavePerfilUsuario)
        );
      }
    }, res => {
      this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  formataDocumento(str: string): string {
    if (!str) {
      return;
    }
    return Util.formataDocumento(str);
  }

  changeTipoRestricao($event: MatRadioChange): void {
    if ($event.value === 'C') {
      this.formDadosAdicionais.get('clientes').setValidators(Validators.required);
    }
    if ($event.value === 'R') {
      this.formDadosAdicionais.get('regionais').setValidators(Validators.required);
    }
    if ($event.value === 'U') {
      this.formDadosAdicionais.get('centrosCusto').setValidators(Validators.required);
    }

    setTimeout(() => {
      this.formDadosAdicionais.updateValueAndValidity();
      this.barraNavegacao.validar('dadosAdicionais', this.formDadosAdicionais.valid);
    });
  }

  validarAgrupador(tipo: string): void {
    if (tipo === 'C') {
      this.formDadosAdicionais.get('clientes').setValidators(Validators.required);
    }
    if (tipo === 'R') {
      this.formDadosAdicionais.get('regionais').setValidators(Validators.required);
    }
    if (tipo === 'U') {
      this.formDadosAdicionais.get('centrosCusto').setValidators(Validators.required);
    }

    setTimeout(() => {
      this.formDadosAdicionais.updateValueAndValidity();
      this.barraNavegacao.validar('dadosAdicionais', this.formDadosAdicionais.valid);
    });
  }

  isRequiredNivel(): boolean {
    if (this.isExibirNiveis()) {
      if (!!this.formDadosAdicionais.get('aprovacaoNivel1').value || !!this.formDadosAdicionais.get('aprovacaoNivel2').value) {
        this.formDadosAdicionais.get('aprovacaoNivel1').setValidators(null);
        this.formDadosAdicionais.get('aprovacaoNivel2').setValidators(null);
        this.formDadosAdicionais.updateValueAndValidity();

        return false;
      } else {
        this.formDadosAdicionais.get('aprovacaoNivel1').setValidators(Validators.required);
        this.formDadosAdicionais.get('aprovacaoNivel2').setValidators(Validators.required);
        this.formDadosAdicionais.updateValueAndValidity();

        return true;
      }
    } else {
      this.formDadosAdicionais.get('aprovacaoNivel1').setValidators(null);
      this.formDadosAdicionais.get('aprovacaoNivel2').setValidators(null);
      this.formDadosAdicionais.updateValueAndValidity();

      return false;
    }
  }
}
