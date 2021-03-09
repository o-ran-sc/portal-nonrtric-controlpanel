import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { TypedPolicyEditorComponent } from './typed-policy-editor.component';

describe('TypedPolicyEditorComponent', () => {
  let component: TypedPolicyEditorComponent;
  let fixture: ComponentFixture<TypedPolicyEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        MatIconModule
      ],
      declarations: [
        TypedPolicyEditorComponent
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TypedPolicyEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
