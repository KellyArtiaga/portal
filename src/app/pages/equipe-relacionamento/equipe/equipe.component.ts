import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-equipe',
  templateUrl: './equipe.component.html',
  styleUrls: ['./equipe.component.scss']
})
export class EquipeComponent implements OnInit {
  areas = [{
    img: 'assets/images/area_img01.png',
    title: 'Comercial',
    list: '.Aumento de frotas, Renovação do Contrato; .Aditivos  Contratuais.'
  },
  {
    img: 'assets/images/area_img02.png',
    title: 'Implantação',
    list: '.Alinhamento de gestão dos pedidos e entregas.'
  },
  {
    img: 'assets/images/area_img03.png',
    title: 'Operações',
    list: '.Acompanhamento de nível de serviço contratado.'
  },
  {
    img: 'assets/images/area_img04.png',
    title: 'Adm. de contratos',
    list: '.Acompanhar faturamento; .Apuração e cobrança de KM excedente.'
  },
  {
    img: 'assets/images/area_img05.png',
    title: 'Gestão de Multas',
    list: '.Acompanhamento de multas de trânsito.'
  },
  {
    img: 'assets/images/area_img06.png',
    title: 'Desmobilização',
    list: '.Mapeamento veículos a serem devolvidos; .Estratégia de devolução.'
  }
  ];
  equipe = [{
    cargo: 'Gerente de Relacionamento',
    nome: 'Osnan Couto',
    img: 'assets/images/osnan.jpg',
    celular: '(31) 99547-1950',
    email: 'osnan.couto@unidas.com.br'
  },
  {
    cargo: 'Coordenador de Relacionamento',
    nome: 'Deilsa Patricia',
    img: 'assets/images/deilsa.jpg',
    celular: '(31) 98484-9535',
    email: 'deilsa.ramos@unidas.com.br'
  },
  {
    cargo: 'Analista de Relacionamento',
    nome: 'Phelippe Dias',
    img: 'assets/images/phellipe.jpg',
    celular: '(11) 97435-8706',
    email: 'phelippe.dias@unidas.com.br'
  },
  ];
  constructor() { }

  ngOnInit() {
  }

}
