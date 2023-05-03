import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresentatorComponent } from './presentator.component';

describe('PresentatorComponent', () => {
  let component: PresentatorComponent;
  let fixture: ComponentFixture<PresentatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PresentatorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PresentatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
