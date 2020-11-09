import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeModulesComponent } from './node-modules.component';

describe('NodeModulesComponent', () => {
  let component: NodeModulesComponent;
  let fixture: ComponentFixture<NodeModulesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NodeModulesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NodeModulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
