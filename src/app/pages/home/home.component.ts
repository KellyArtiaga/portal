import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbCarouselConfig } from '@ng-bootstrap/ng-bootstrap';
import { UserContextService } from 'src/app/core/services/user-context.service';
import { Util } from 'src/app/shared/util/utils';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [NgbCarouselConfig]
})
export class HomeComponent implements OnInit {

  placaLogada: boolean;

  constructor(
    private router: Router,
    private userContextService: UserContextService
  ) { }

  ngOnInit(): void {
    this.validarPlacaLogada();
  }

  hasPermissao(funcionalidade: string) {
    return Util.hasPermissaoMenu(this.userContextService, funcionalidade);
  }

  validarPlacaLogada() {
    setTimeout(() => {
      this.placaLogada = !!localStorage.getItem('placaLogada');
    }, 1000);
  }

  goToPage(route: string) {
    this.router.navigateByUrl(route);
  }

}
