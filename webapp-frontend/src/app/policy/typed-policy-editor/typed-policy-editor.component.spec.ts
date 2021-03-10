// -
//   ========================LICENSE_START=================================
//   O-RAN-SC
//   %%
//   Copyright (C) 2021: Nordix Foundation
//   %%
//   Licensed under the Apache License, Version 2.0 (the "License");
//   you may not use this file except in compliance with the License.
//   You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//   Unless required by applicable law or agreed to in writing, software
//   distributed under the License is distributed on an "AS IS" BASIS,
//   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//   See the License for the specific language governing permissions and
//   limitations under the License.
//   ========================LICENSE_END===================================
//

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { TypedPolicyEditorComponent } from './typed-policy-editor.component';

describe('TypedPolicyEditorComponent', () => {
  let component: TestTypedPolicyEditorComponentHostComponent;
  let fixture: ComponentFixture<TestTypedPolicyEditorComponentHostComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        BrowserModule,
        BrowserAnimationsModule,
        MatIconModule
      ],
      declarations: [
        TypedPolicyEditorComponent,
        TestTypedPolicyEditorComponentHostComponent
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestTypedPolicyEditorComponentHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have JSON form visible and JSON and JSON Schema not visible', () => {
    let propertiesHeading = fixture.debugElement.nativeElement.querySelector('#propertiesHeading');
    expect(propertiesHeading).toBeTruthy();
    expect(propertiesHeading.innerText).toContain('Properties');
    let propertiesIcon = fixture.debugElement.nativeElement.querySelector('#propertiesIcon');
    expect(propertiesIcon).toBeTruthy();
    expect(propertiesIcon.innerText).toEqual('expand_less');
    let jsonForm = fixture.debugElement.nativeElement.querySelector('json-schema-form');
    expect(jsonForm).toBeTruthy();

    let jsonHeading = fixture.debugElement.nativeElement.querySelector('#jsonHeading');
    expect(jsonHeading).toBeTruthy();
    expect(jsonHeading.innerText).toContain('JSON')
    let jsonIcon = fixture.debugElement.nativeElement.querySelector('#jsonIcon');
    expect(jsonIcon).toBeTruthy();
    expect(jsonIcon.innerText).toEqual('expand_more');
    let jsonDiv = fixture.debugElement.nativeElement.querySelector('#jsonDiv');
    expect(jsonDiv).toBeFalsy();

    let schemaHeading = fixture.debugElement.nativeElement.querySelector('#schemaHeading');
    expect(schemaHeading).toBeTruthy();
    expect(schemaHeading.innerText).toContain('JSON Schema');
    let schemaIcon = fixture.debugElement.nativeElement.querySelector('#schemaIcon');
    expect(schemaIcon).toBeTruthy();
    expect(schemaIcon.innerText).toEqual('expand_more');
    let schemaDiv = fixture.debugElement.nativeElement.querySelector('#schemaDiv');
    expect(schemaDiv).toBeFalsy();
  });

  it('should hide JSON form', () => {
    let propertiesHeading = fixture.debugElement.nativeElement.querySelector('#propertiesHeading');
    expect(propertiesHeading).toBeTruthy();
    propertiesHeading.click();
    fixture.detectChanges();

    let propertiesIcon = fixture.debugElement.nativeElement.querySelector('#propertiesIcon');
    expect(propertiesIcon).toBeTruthy();
    expect(propertiesIcon.innerText).toEqual('expand_more');
    let propertiesDiv = fixture.debugElement.nativeElement.querySelector('propertiesDiv');
    expect(propertiesDiv).toBeFalsy();
  });

  it('should show JSON with text for dark mode', () => {
    let jsonHeading = fixture.debugElement.nativeElement.querySelector('#jsonHeading');
    expect(jsonHeading).toBeTruthy();
    jsonHeading.click();
    fixture.detectChanges();

    let jsonIcon = fixture.debugElement.nativeElement.querySelector('#jsonIcon');
    expect(jsonIcon).toBeTruthy();
    expect(jsonIcon.innerText).toEqual('expand_less');
    let jsonDiv = fixture.debugElement.nativeElement.querySelector('#jsonDiv');
    expect(jsonDiv).toBeTruthy();
    let jsonText = jsonDiv.querySelector('pre');
    expect(jsonText.classList).toContain('text__dark');
  });

  it('should show JSON Schema with text for dark mode', () => {
    let schemaHeading = fixture.debugElement.nativeElement.querySelector('#schemaHeading');
    expect(schemaHeading).toBeTruthy();
    schemaHeading.click();
    fixture.detectChanges();

    let schemaIcon = fixture.debugElement.nativeElement.querySelector('#schemaIcon');
    expect(schemaIcon).toBeTruthy();
    expect(schemaIcon.innerText).toEqual('expand_less');
    let schemaDiv = fixture.debugElement.nativeElement.querySelector('#schemaDiv');
    expect(schemaDiv).toBeTruthy();
    let jsonSchemaText = schemaDiv.querySelector('pre');
    expect(jsonSchemaText.classList).toContain('text__dark');
  });

  @Component({
    selector: `typed-policy-editor-host-component`,
    template: `<nrcp-typed-policy-editor [jsonObject]="policyJson" [jsonSchemaObject]="jsonSchemaObject" [darkMode]="true"></nrcp-typed-policy-editor>`
  })
  class TestTypedPolicyEditorComponentHostComponent {
    policyJson: string = '{"A":"A"}';
    jsonSchemaObject: string = 'policy_schema": { "$schema": "http://json-schema.org/draft-07/schema#", "description": "Type 1 policy type", "additionalProperties": false, "title": "1", "type": "object", "properties": { "A": "string" }, "required": [ "A" ]}';
  }
});
