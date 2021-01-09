import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { UserContextService } from 'src/app/core/services/user-context.service';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  @Input() loginFunction: Function;

  @Output('menuOpened') menuOpened = new EventEmitter();

  menuItemsLinks: Array<any>;
  menuItemsNotifications: Array<any> = [];

  modalFunction = this.modalLoginFuncion.bind(this);

  isChatOpen = false;
  notifyFlag: boolean;

  hiddenHeader: boolean;

  constructor(
    private translate: TranslateService,
    private activeRoute: ActivatedRoute,
    private userContextService: UserContextService
  ) {

    this.hiddenHeader = false;

    this.activeRoute.queryParams.subscribe(paramsURL => {

      if (paramsURL.tokenRac || this.userContextService.getTokenRac()) {
        this.hiddenHeader = true;
      }
    });
  }

  ngOnInit() {
    this.notifyFlag = false;
  }

  modalLoginFuncion(value: any): void {
    this.loginFunction(value);
  }

  openLink(item) {
    window.open(item.url, '_blank');
  }

  expandedClick(): void {
    this.menuOpened.emit();
  }

  verTodasNotificacoes(): void {
    return;
  }

  mudarLinguagem(pais): void {
    this.translate.use(pais);
    sessionStorage.setItem('language', pais);
    window.location.reload();
  }
}
