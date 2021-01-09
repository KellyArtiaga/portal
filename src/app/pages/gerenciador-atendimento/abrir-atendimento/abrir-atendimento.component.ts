import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-abrir-atendimento',
  templateUrl: './abrir-atendimento.component.html',
  styleUrls: ['./abrir-atendimento.component.scss']
})
export class AbrirAtendimentoComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() { }

  goToPage(route: string) {
    this.router.navigateByUrl(route);
  }
}
