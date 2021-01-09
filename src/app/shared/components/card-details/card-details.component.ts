import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-card-details',
  templateUrl: './card-details.component.html',
  styleUrls: ['./card-details.component.scss']
})
export class CardDetailsComponent implements OnInit {
  @Input() title: string;
  @Input() values: any[];
  @Input() options?: any;

  constructor() { }

  ngOnInit() { }
}
