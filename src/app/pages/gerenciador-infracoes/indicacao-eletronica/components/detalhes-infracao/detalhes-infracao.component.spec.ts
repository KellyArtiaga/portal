import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalhesInfracaoComponent } from './detalhes-infracao.component';

describe('DetalhesInfracaoComponent', () => {
  let component: DetalhesInfracaoComponent;
  let fixture: ComponentFixture<DetalhesInfracaoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetalhesInfracaoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetalhesInfracaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
