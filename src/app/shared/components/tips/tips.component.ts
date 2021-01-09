import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-tips',
  templateUrl: './tips.component.html',
  styleUrls: ['./tips.component.scss']
})
export class TipsComponent implements OnInit {
  @Input() title: string;
  @Input() textContent: string;

  constructor() { }

  ngOnInit() { }
}
