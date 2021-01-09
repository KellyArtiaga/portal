import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ReplaySubject } from 'rxjs';
import { PerfilFuncionalidadeService } from 'src/app/core/services/perfil-funcionalidade.service';

import { SnackBarService } from '../../../../app/core/services/snack-bar.service';
import { UserContextService } from '../../../../app/core/services/user-context.service';
import { UsuarioService } from '../../../../app/core/services/usuario.service';
import { ColunasTabelaMV } from '../../interfaces/colunas-tabela.model';
import { takeUntilDestroy } from '../../take-until-destroy';
import { Util } from '../../util/utils';
import { TipoPerfil } from 'src/assets/data/enums/tipo-perfil.enum';

@Component({
  selector: 'app-modal-efetuar-login',
  templateUrl: './modal-efetuar-login.component.html',
  styleUrls: ['./modal-efetuar-login.component.scss']
})
export class ModalEfetuarLoginComponent implements OnInit, OnDestroy {
  dataInputSubject = new ReplaySubject<any>(1);

  formEfetuarLogin: FormGroup;

  usuarios: any[];

  showTable: boolean;

  totalRows: number;

  constructor(
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private usuarioService: UsuarioService,
    private userContext: UserContextService,
    private snackBar: SnackBarService,
    private translate: TranslateService,
    private perfilService: PerfilFuncionalidadeService
  ) { }

  ngOnInit() {
    this.criaFormEfetuarLogin();
  }

  criaFormEfetuarLogin(): void {
    this.formEfetuarLogin = this.formBuilder.group({
      descricaoGenerica: ['', Validators.compose([])]
    });
  }

  getColunasTabela(): ColunasTabelaMV[] {
    const colunas: ColunasTabelaMV[] = [
      {
        description: 'ID', columnDef: 'id', style: {
          minWidth: 50
        }
      },
      // {
      //   description: 'CNPJ', columnDef: 'cpfCnpjCliente', documento: true, style: {
      //     minWidth: 120
      //   }
      // },
      // {
      //   description: 'Cliente', columnDef: 'nomeCliente', style: {
      //     minWidth: 100
      //   }
      // },
      {
        description: 'Grupo Econômico', columnDef: 'nomeGrupoEconomico', style: {
          minWidth: 100
        }
      },
      {
        description: 'Nome', columnDef: 'nomeUsuario', style: {
          minWidth: 115
        }
      },
      {
        description: 'Tipo de Perfil', columnDef: 'descricaoTipoPerfil', style: {
          minWidth: 75
        }
      },
      {
        description: this.translate.instant('PORTAL.LABELS.ACOES_TABELA'),
        columnDef: 'action',
        action: true,
        style: {
          minWidth: 50
        },
        icones: [{
          svg: 'pfu-signin',
          label: 'Efetuar login',
          function: this.selecionarCliente.bind(this)
        }]
      }
    ];

    return colunas;
  }

  selecionarCliente(usuario: any): void {
    this.usuarios.forEach(element => {
      if (element.id === usuario['id']) {
        this.closeModal(true, element);
      }
    });
  }

  pesquisaClientes(eventTable?: number, buttonClick?: boolean): void {
    if (buttonClick) {
      this.showTable = false;
    }

    const filtro = {
      numPage: eventTable || 1,
      numRows: 5,
      descricaoGenerica: null
    };

    if (this.formEfetuarLogin.get('descricaoGenerica').value) {
      filtro.descricaoGenerica = Util.removeSpecialCharacters(this.formEfetuarLogin.get('descricaoGenerica').value);
    }

    this.usuarioService.getByDescricao(filtro).subscribe(res => {
      this.usuarios = res.data.results;
      this.usuarios.forEach((usuario) => {
        usuario.descricaoTipoPerfil = TipoPerfil[usuario.tipoPerfil];
        usuario.nomeGrupoEconomico = !!usuario.grupoEconomico ? usuario.grupoEconomico.nome : null;
      });
      this.totalRows = res.data.totalRows;
      this.showTable = true;
    }, res => {
      this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  closeModal(newLogin?: boolean, value?: any): void {
    if (!this.userContext.getDados() && !value) {
      this.snackBar.open(this.translate.instant('PORTAL.EFETUAR_LOGIN.MESSAGE.SELECIONE_UM_USUARIO'), 7000, 'X');
      return;
    }
    if (newLogin) {
      this.getPermissoes(value);
    } else {
      this.activeModal.close();
    }
  }

  private getPermissoes(data: any): void {
    const userData = data;
    this.perfilService.get(userData.perfilUsuarioId)
      .pipe(takeUntilDestroy(this))
      .subscribe(perfil => {
        userData.userPermissions = perfil['data'].results;

        this.activeModal.close(userData);
      }, perfil => {
        this.activeModal.close(userData);
      });
  }

  limpar(): void {
    this.formEfetuarLogin.reset();
    this.showTable = false;
  }

  ngOnDestroy(): void { }
}
