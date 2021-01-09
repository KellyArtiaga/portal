import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-help-legenda-acessorio',
  templateUrl: './help-legenda-acessorio.component.html',
  styleUrls: ['./help-legenda-acessorio.component.scss']
})
export class HelpLegendaAcessorioComponent implements OnInit {

  @Input() acessorios: Array<any>;

  constructor() { }

  ngOnInit() { }

  getLegenda(): any[] {
    return this.acessorios;
  }
}
