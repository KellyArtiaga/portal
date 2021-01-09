import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DadosModalService {
  private dadosModal: any;

  constructor() { }

  get(): any {
    return this.dadosModal;
  }

  set(dadosModal: any): void {
    this.dadosModal = dadosModal;
  }
}
