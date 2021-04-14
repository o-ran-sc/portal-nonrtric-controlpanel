/*-
 * ========================LICENSE_START=================================
 * O-RAN-SC
 * %%
 * Copyright (C) 2019 AT&T Intellectual Property
 * %%
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================LICENSE_END===================================
 */

import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { ConfirmDialogComponent } from "./confirm-dialog.component";
import { MatDialogModule } from "@angular/material/dialog";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { HarnessLoader } from "@angular/cdk/testing";
import { MatButtonHarness } from "@angular/material/button/testing";

describe("ConfirmDialogComponent", () => {
  let component: ConfirmDialogComponent;
  let fixture: ComponentFixture<ConfirmDialogComponent>;
  let loader: HarnessLoader;

  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<any>>;

  beforeEach(async(() => {
    dialogRefSpy = jasmine.createSpyObj("MatDialogRef", ["close"]);

    TestBed.configureTestingModule({
      declarations: [ConfirmDialogComponent],
      imports: [MatDialogModule],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: { heading: "Delete Policy", message: "Do?" },
        },
        { provide: MatDialogRef, useValue: dialogRefSpy },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it("should create and contain correct title, message and buttons", async () => {
    expect(component).toBeTruthy();

    const title = fixture.debugElement.nativeElement.querySelector("#title");
    expect(title.innerText).toEqual("Delete Policy");

    const message = fixture.debugElement.nativeElement.querySelector(
      "#message"
    );
    expect(message.innerText).toEqual("Do?");

    const cancelButton = fixture.debugElement.nativeElement.querySelector(
      "#cancelButton"
    );
    expect(cancelButton).toBeTruthy();

    const okButton = fixture.debugElement.nativeElement.querySelector(
      "#okButton"
    );
    expect(okButton).toBeTruthy();
  });

  it("should close dialog with true when Ok button clicked", async () =>{
    let okButton: MatButtonHarness = await loader.getHarness(
      MatButtonHarness.with({ selector: "#okButton" })
    );
    await okButton.click();

    expect(dialogRefSpy.close).toHaveBeenCalledWith(true);
  });

  it("should close dialog without data when Cancel button clicked", async () =>{
    let cancelButton: MatButtonHarness = await loader.getHarness(
      MatButtonHarness.with({ selector: "#cancelButton" })
    );
    await cancelButton.click();

    expect(dialogRefSpy.close).toHaveBeenCalledWith("");
  });
});
