import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatInput, MatInputModule } from '@angular/material/input';
import { MatInputHarness } from '@angular/material/input/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NoTypePolicyEditorComponent } from './no-type-policy-editor.component';

let formGroup: FormGroup = new FormGroup({});

describe('NoTypePolicyEditorComponent', () => {
  let component: TestNoTypePolicyEditorComponentHostComponent;
  let fixture: ComponentFixture<TestNoTypePolicyEditorComponentHostComponent>;
  let loader: HarnessLoader;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        MatButtonModule,
        MatInputModule
      ],
      declarations: [
        NoTypePolicyEditorComponent,
        TestNoTypePolicyEditorComponentHostComponent
      ],
      providers: [
        FormBuilder
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestNoTypePolicyEditorComponentHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be added to form group with required validator', async () => {
    let textArea: MatInputHarness = await loader.getHarness(MatInputHarness.with({ selector: '#policyJsonTextArea' }));

    expect(formGroup.get('policyJsonTextArea')).toBeTruthy();
    expect(await textArea.isRequired()).toBeTruthy();
  });

  it('should contain provided policy json and enabled Format button', async () => {
    let textArea: MatInputHarness = await loader.getHarness(MatInputHarness.with({ selector: '#policyJsonTextArea' }));
    expect(await textArea.getValue()).toEqual('{"A":"A"}');

    console.log('Validity:',formGroup.valid);
    let formatButton: MatButtonHarness = await loader.getHarness(MatButtonHarness.with({ selector: '#formatButton' }));
    expect(await formatButton.isDisabled()).toBeFalsy();
  });

  it('Format button should be disabled wen json not valid', async () => {
    let textArea: MatInputHarness = await loader.getHarness(MatInputHarness.with({ selector: '#policyJsonTextArea' }));
    await textArea.setValue('{');

    let formatButton: MatButtonHarness = await loader.getHarness(MatButtonHarness.with({ selector: '#formatButton' }));
    // expect(await formatButton.isDisabled()).toBeTruthy();
  });
});

@Component({
  selector: `no-type-policy-editor-host-component`,
  template: `<nrcp-no-type-policy-editor [policyJson]="this.policyJson" [instanceForm]="instanceForm"></nrcp-no-type-policy-editor>`
})
export class TestNoTypePolicyEditorComponentHostComponent {
  @ViewChild(NoTypePolicyEditorComponent)
  private noTypePolicyEditorComponentHostComponent: NoTypePolicyEditorComponent;
  instanceForm: FormGroup = formGroup;
  policyJson: string = '{"A":"A"}';
}
