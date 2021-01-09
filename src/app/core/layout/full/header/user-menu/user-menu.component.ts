import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ItensSidebarMV } from 'src/app/shared/interfaces/sidebar-itens.model';

import { MenuUserService } from '../../../../../../app/core/services/menu-user.service';
import { UserContextService } from '../../../../../../app/core/services/user-context.service';
import {
  ModalEfetuarLoginComponent,
} from '../../../../../../app/shared/components/modal-efetuar-login/modal-efetuar-login.component';

@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UserMenuComponent implements OnInit {
  @Input() efetuarLoginFunction: Function;

  menuUser: ItensSidebarMV[];

  placaLogada: boolean;

  constructor(
    public menuUserService: MenuUserService,
    private _userContextService: UserContextService,
    private _router: Router,
    private modalService: NgbModal
  ) { }

  menuitem: any;

  ngOnInit() {
    this.montarMenu();
  }

  getIsMaster(): boolean {
    return this._userContextService.getIsMaster();
  }

  montarMenu(): void {
    this.placaLogada = !!localStorage.getItem('placaLogada');
    this.menuUser = this.menuUserService.getMenuUserItems();
  }

  toPage(state) {
    this._router.navigateByUrl(state);
  }

  getUsername(): string {
    if (this._userContextService.getDados()) {
      if (localStorage.getItem('placaLogada')) {
        return this._userContextService.getDados().nomeCliente;
      }

      return this._userContextService.getDados().nomeUsuario ? this._userContextService.getDados().nomeUsuario : this._userContextService.getDados().nomeCondutor;
    }
    return '';
  }

  getEmail(): string {
    if (this._userContextService.getDados() && this._userContextService.getDados().email) {
      return this._userContextService.getDados().email;
    }
    return '';
  }

  openModal(): void {
    const modal = this.modalService.open(ModalEfetuarLoginComponent, { size: 'lg' });
    modal.result.then(val => {
      this.efetuarLoginFunction(val);
    });
  }

  logout(): void {
    this._userContextService.logout();
  }
}
