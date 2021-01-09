import { Injectable } from '@angular/core';

import { SIDEBAR_ITENS, USER_MENU_ITEMS } from '../../../assets/data/sidebar-itens';

@Injectable({
  providedIn: 'root'
})
export class MenuUserService {
  private sidebarRefresh: Function;

  constructor() { }

  getMenuItems() {
    return SIDEBAR_ITENS;
  }

  getMenuUserItems() {
    return USER_MENU_ITEMS;
  }

  get sidebarRefreshFunction(): Function {
    return this.sidebarRefresh;
  }

  set sidebarRefreshFunction(_function) {
    this.sidebarRefresh = _function;
  }
}
