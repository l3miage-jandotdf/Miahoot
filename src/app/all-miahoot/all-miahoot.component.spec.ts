import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllMiahootComponent } from './all-miahoot.component';

describe('AllMiahootComponent', () => {
  let component: AllMiahootComponent;
  let fixture: ComponentFixture<AllMiahootComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllMiahootComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllMiahootComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
