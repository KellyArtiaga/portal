import { PlatformLocation } from '@angular/common';
import { Injectable } from '@angular/core';
import { PermissoesAcessoMV } from 'src/app/shared/interfaces/permissoes-acesso.model';
import { ItensSidebarMV } from 'src/app/shared/interfaces/sidebar-itens.model';
import * as _ from 'lodash';
import { AppConfig } from '../../../assets/config/app.config';
const TIPO_PERFIL_CONDUTOR = 'C';

@Injectable({
  providedIn: 'root'
})
export class UserContextService {

  private url: string;
  private roles: any;

  constructor(
    private platformLocation: PlatformLocation
  ) {
    this.url = encodeURI(`${(this.platformLocation as any).location.origin}/home`);
  }

  getEmailPadrao(): string {
    return AppConfig.EMAIL_PADRAO;
  }

  getUsuarioId(): string {
    return this.getDados().id || this.getDados().usuarioId;
  }

  // getGrupoEconomicoId(): string {
  //   return this.getDados().grupoEconomicoId;
  // }

  getCnpj(): string {
    return this.getDados().cpfCnpjCliente;
  }

  getCPF(): string {
    return this.getDados().cpfCondutor;
  }

  getCondutorId(): string {
    return localStorage.getItem('dados') ? JSON.parse(localStorage.getItem('dados')).condutorId : null;
  }

  getClienteId(): string {
    return this.getDados().clienteId;
  }

  getPerfilId(): string {
    return this.getDados().perfilUsuarioId;
  }

  getNomeUsuario(): string {
    return this.getDados().nomeUsuario;
  }

  getPerfil(): string {
    return this.getDados().chavePerfilUsuario;
  }

  getGrupoEconomico(): any {
    return this.getDados().grupoEconomico;
  }

  getTipoPerfil(): any {
    return this.getDados().tipoPerfil || TIPO_PERFIL_CONDUTOR;
  }

  getGrupoEconomicoId(): any {
    return this.getDados()['grupoEconomicoId'];
  }

  setDados(dadosUsuario): void {
    localStorage.setItem('dados', JSON.stringify(dadosUsuario));
  }

  getIsMaster(): boolean {
    if (!localStorage.getItem('master') || localStorage.getItem('master') === 'undefined') {
      return false;
    }
    return JSON.parse(localStorage.getItem('master')) || false;
  }

  getIsPrimeiroAcesso(): boolean {
    if (localStorage.getItem('dados')) {
      return JSON.parse(localStorage.getItem('dados'))['primeiroAcesso'] || false;
    }
    return false;
  }

  getDados(): any {
    return JSON.parse(localStorage.getItem('dados')) || null;
  }

  setID(id: string): void {
    localStorage.setItem('usuarioId', id);
  }

  setToken(token): void {
    localStorage.setItem('token', token);
  }

  setRoles(roles: any): void {
    localStorage.setItem('roles', JSON.stringify(roles));
  }

  setSegmentoProduto(segmentoProdutoId: any): void {
    localStorage.setItem('segmentoProdutoId', segmentoProdutoId);
  }

  getSegmentoProduto(): any {
    return localStorage.getItem('segmentoProdutoId');
  }

  getRoles(): ItensSidebarMV[] {
    return JSON.parse(localStorage.getItem('roles'));
  }

  setRouteRoles(roles: PermissoesAcessoMV): void {
    this.roles = roles;
  }

  getRouteRoles(): PermissoesAcessoMV {
    return this.roles;
  }

  getID() {
    if (!localStorage.getItem('usuarioId')) {
      return this.getDados().id || this.getDados().usuarioId;
    }
    return localStorage.getItem('usuarioId');
  }

  getTokenBearer(): string {
    // tslint:disable-next-line:max-line-length
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoxLCJ1c2VybmFtZSI6InVuaWRhcyIsInBhc3N3b3JkIjoidW5pZGFzMjAxOCJ9LCJpYXQiOjE1NDM5MjYzMDB9.4xXJcamVoGlBXWCBFUUj--RmjMpThdjVX9qsBjC_2PU';
  }

  getToken() {
    return localStorage.getItem('token') || null;
  }

  removeToken() {
    localStorage.clear();
  }

  logout(): void {
    localStorage.clear();

    const appURL = this.url;
    const loginAppURL = AppConfig.LOGIN_APP_URL;
    window.location.href = `${loginAppURL}?source_system=${appURL}&system_code=${AppConfig.SYSTEM_CODE}`;
  }

  setTokenRac(token: string): void {
    localStorage.setItem('tokenRac', token);
  }

  getTokenRac(): string {
    return localStorage.getItem('tokenRac');
  }

  getLoginURL(): string {
    const appURL = this.getLocalUrl() || AppConfig.APP_URL;
    const loginAppURL = AppConfig.LOGIN_APP_URL;

    return `${loginAppURL}?source_system=${appURL}&system_code=${AppConfig.SYSTEM_CODE}`;
  }

  getLocalUrl(): string {
    return encodeURI(`${(this.platformLocation as any).location.origin}/home`);
  }
}
