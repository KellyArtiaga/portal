import { EventEmitter } from '@angular/core';

export class ReloadListasService {

  private static emitters: {
    [nomeEvento: string]: EventEmitter<any>
  } = {};

  static get(nomeEvento: string): EventEmitter<any> {
    if (!ReloadListasService.emitters[nomeEvento]) {
      ReloadListasService.emitters[nomeEvento] = new EventEmitter<any>();
    }
    return ReloadListasService.emitters[nomeEvento];
  }

  static reset() {
    Object.keys(ReloadListasService.emitters).forEach(key => {
      ReloadListasService.emitters[key].unsubscribe();
    });
    ReloadListasService.emitters = {};
  }

}
