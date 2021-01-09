import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalInfoRecursoComponent } from './modal-info-recurso.component';

describe('ModalInfoRecursoComponent', () => {
  let component: ModalInfoRecursoComponent;
  let fixture: ComponentFixture<ModalInfoRecursoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalInfoRecursoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalInfoRecursoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
