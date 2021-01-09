import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MenuUserService } from 'src/app/core/services/menu-user.service';
import { PerfilFuncionalidadeService } from 'src/app/core/services/perfil-funcionalidade.service';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';
import { UserContextService } from 'src/app/core/services/user-context.service';
import { UsuarioService } from 'src/app/core/services/usuario.service';
import { takeUntilDestroy } from 'src/app/shared/take-until-destroy';
import { Md5 } from 'ts-md5/dist/md5';

@Component({
  selector: 'app-alterar-senha',
  templateUrl: './alterar-senha.component.html',
  styleUrls: ['./alterar-senha.component.scss']
})
export class AlterarSenhaComponent implements OnInit, OnDestroy {

  formAlterarSenha: FormGroup;

  showCurrentPassword: boolean;
  showNewPassword: boolean;
  showConfirmPassword: boolean;

  contemPeloMenosUmaLetra = false;
  contemTamanhoMinimo = false;

  labelMostrarSenha: string;
  labelOcultarSenha: string;

  constructor(
    private formBuilder: FormBuilder,
    private snackBar: SnackBarService,
    private translateService: TranslateService,
    private route: Router,
    private userContextService: UserContextService,
    private usuarioService: UsuarioService,
    private perfilService: PerfilFuncionalidadeService,
    private menuUserService: MenuUserService
  ) { }

  ngOnInit() {
    this.criarForm();
    this.labelMostrarSenha = this.translateService.instant('PORTAL.SENHA.FORM.LBL_MOSTRAR_SENHA');
    this.labelOcultarSenha = this.translateService.instant('PORTAL.SENHA.FORM.LBL_OCULTAR_SENHA');
  }

  criarForm() {
    this.formAlterarSenha = this.formBuilder.group({
      senhaAtual: ['', Validators.compose([])],
      novaSenha: ['', Validators.compose([Validators.required])],
      confirmarNovaSenha: ['', Validators.compose([Validators.required])],
    });
  }

  confirmarAlteracao() {
    if (!this.formAlterarSenha.valid) {
      this.snackBar.open(this.translateService.instant('PORTAL.MSG_CAMPO_OBRIGATORIO'), 3500, 'X');
      return;
    }
    if (this.formAlterarSenha.get('novaSenha').value !== this.formAlterarSenha.get('confirmarNovaSenha').value) {
      this.snackBar.open(this.translateService.instant('PORTAL.SENHA.MENSAGENS.NOVA_SENHA_NAO_CONFERE'), 7000, 'X');
      return;
    }
    if (!this.senhaAtendeCriteriosEstabelecidos()) {
      this.snackBar.open(this.translateService.instant('PORTAL.SENHA.MENSAGENS.SENHA_NAO_ATENDE_CRITERIOS'), 7000, 'X');
      return;
    }

    const senhaPlana = this.formAlterarSenha.get('senhaAtual').value;
    const senhaMd5 = Md5.hashStr(this.formAlterarSenha.get('senhaAtual').value);

    const senha = this.userContextService.getIsPrimeiroAcesso() === true ? senhaPlana : senhaMd5;

    const bodyPatch = {
      condutorId: this.userContextService.getDados().condutorId,
      senhaAtual: senha,
      novaSenha: Md5.hashStr(this.formAlterarSenha.get('novaSenha').value)
    };

    this.usuarioService
      .patch(
        Number(this.userContextService.getID()),
        bodyPatch
      ).pipe(
        takeUntilDestroy(this)
      ).subscribe(res => {
        if (!this.userContextService.getIsPrimeiroAcesso()) {
          this.snackBar.success(this.translateService.instant('PORTAL.MSG_USUARIO_ATUALIZADO_SUCESSO'), 3500, 'X');
          this.route.navigateByUrl('home');
          return;
        }
        this.patchPrimeiroAcesso();
      }, err => {
        if (err.error.message.error === 'SENHA_ATUAL_INCORRETA') {
          this.snackBar.open(this.translateService.instant('PORTAL.SENHA.MENSAGENS.SENHA_ATUAL_NAO_CONFERE'), 3500, 'X');
        }
        if (err.error.message.error === 'USUARIO_NAO_CADASTRADO') {
          this.snackBar.open(this.translateService.instant('PORTAL.SENHA.MENSAGENS.USUARIO_NAO_CADASTRADO'), 3500, 'X');
        }
      });
  }

  senhaAtendeCriteriosEstabelecidos(): boolean {
    this.contemPeloMenosUmaLetra = this.formAlterarSenha.get('novaSenha').value.match(/[a-z]/i);
    this.contemTamanhoMinimo = this.formAlterarSenha.get('novaSenha').value.length >= 8;

    return this.contemPeloMenosUmaLetra && this.contemTamanhoMinimo;
  }

  private patchPrimeiroAcesso(): void {
    this.usuarioService.patchPermissaoAcesso(this.userContextService.getID())
      .pipe(
        takeUntilDestroy(this))
      .subscribe(res => {
        this.voltar();
      }, err => {
        this.snackBar.error(this.translateService.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
      });
  }

  password(password): void {
    switch (password) {
      case 'current': {
        this.showCurrentPassword = !this.showCurrentPassword;
        break;
      }
      case 'new': {
        this.showNewPassword = !this.showNewPassword;
        break;
      }
      case 'confirm': {
        this.showConfirmPassword = !this.showConfirmPassword;
        break;
      }
    }
  }

  cancelar(): void {
    this.route.navigateByUrl('home');
  }

  voltar(): void {
    this.usuarioService.get(JSON.parse(this.userContextService.getID()))
      .pipe(takeUntilDestroy(this))
      .subscribe(res => {
        this.perfilService.get(res.data.perfilUsuarioId)
          .pipe(takeUntilDestroy(this))
          .subscribe(perfil => {
            res.data.userPermissions = perfil['data'].results;
            this.userContextService.setDados(res.data);
            this.menuUserService.sidebarRefreshFunction();

            this.snackBar.success(this.translateService.instant('PORTAL.MSG_USUARIO_ATUALIZADO_SUCESSO'), 3500, 'X');
            this.route.navigateByUrl('home');
          }, perfil => { });
      }, res => {
        this.snackBar.error(this.translateService.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
      });
  }

  ngOnDestroy(): void { }
}
