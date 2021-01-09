import { style } from '@angular/animations';
import 'fullcalendar';

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import allLocales from '@fullcalendar/core/locales-all';
import * as $ from 'jquery';
import * as moment from 'moment';

@Component({
  selector: 'app-full-calendar',
  templateUrl: './full-calendar.component.html',
  styleUrls: ['./full-calendar.component.scss']
})
export class FullCalendarComponent implements OnInit {
  @Input()
  set configurations(config: any) {
    if (config) {
      this.defaultConfigurations = config;
    }
  }
  @Input() eventos: any;

  @Output() onEventClick = new EventEmitter<any>();
  @Output() onDayClick = new EventEmitter<any>();

  private defaultConfigurations: any;

  constructor() { }

  ngOnInit() {
    moment.locale('pt-br');
    this.createCalendar();
  }

  formatEvents(): any {
    const evts = [];
    if (this.eventos) {
      this.eventos.forEach(evt => {
        let data = evt.data.split('T')[0].split('-');
        data = new Date(data[0], data[1] - 1, data[2]);
        data = moment(data);
        evts.push({
          title: 'Disponível',
          start: data,
          end: data
        });
      });
    }
    return evts;
  }

  createCalendar(): void {
    const eventos = this.formatEvents();

    this.defaultConfigurations = {
      locales: allLocales,
      locale: 'pt-br',
      height: 400,
      monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
      monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
      dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sabado'],
      dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'],
      editable: false,
      eventLimit: true,
      titleFormat: 'MMMM YYYY',
      header: {
        left: 'title',
        center: '',
        right: 'prev,next today,month'
      },
      buttonText: {
        today: 'Hoje',
        month: 'Mês',
        week: 'Semana',
        day: 'Dia'
      },
      views: {
        agenda: {
          eventLimit: 2
        }
      },
      eventColor: '#095B9D',
      eventTextColor: '#FFFFFF',
      displayEventTime: false,
      displayEventEnd: false,
      dayClick: (date, jsEvent, activeView) => {
        const dados = {
          date: date,
          jsEvent: jsEvent,
          activeView: activeView
        };

        this.onDayClick.emit(dados);
      },
      eventClick: (info) => {
        this.onEventClick.emit(info);
      },
      allDaySlot: false,
      slotDuration: moment.duration('00:15:00'),
      slotLabelInterval: moment.duration('01:00:00'),
      firstDay: 1,
      selectable: true,
      selectHelper: true,
      events: eventos,
    };

    $('#full-calendar').fullCalendar(
      this.defaultConfigurations
    );
  }
}
