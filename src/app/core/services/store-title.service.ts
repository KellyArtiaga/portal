import { Injectable } from '@angular/core';
import { UserContextService } from './user-context.service';

@Injectable({
  providedIn: 'root'
})
export class StoreTitleService {
  private title: string;
  private icon: string;

  constructor(
    private userContext: UserContextService
  ) { }

  getTitle(): string {
    return this.title;
  }

  getIcon(): string {
    return this.icon;
  }

  setTitle(titulo: string): void {
    if (this.userContext.getTokenRac()) {
      this.title = 'Manutenção/Sinistro';
      return;
    }
    this.title = titulo;
  }

  setIcon(icon: string): void {
    if (this.userContext.getTokenRac()) {
      return;
    }
    this.icon = icon;
  }
}
