import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyTypeComponent } from './policy-type.component';

describe('PolicyTypeComponent', () => {
  let component: PolicyTypeComponent;
  let fixture: ComponentFixture<PolicyTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PolicyTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PolicyTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
