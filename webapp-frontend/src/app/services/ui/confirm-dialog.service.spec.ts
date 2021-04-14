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

import { TestBed } from "@angular/core/testing";

import { ConfirmDialogService } from "./confirm-dialog.service";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { UiService } from "./ui.service";
import { ConfirmDialogComponent } from "@app/ui/confirm-dialog/confirm-dialog.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

describe("ConfirmDialogService", () => {
  let matDialogSpy: jasmine.SpyObj<MatDialog>;
  let service: ConfirmDialogService;

  beforeEach(() => {
    matDialogSpy = jasmine.createSpyObj("MatDialog", ["open"]);

    TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule, MatDialogModule],
      providers: [
        { provide: MatDialog, useValue: matDialogSpy },
        UiService,
      ],
    });

    service = TestBed.inject(ConfirmDialogService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should open confirm dialog with correct dark mode and data", () => {
    const uiService: UiService = TestBed.inject(UiService);
    uiService.darkModeState.next(false);

    service.openConfirmDialog("Heading", "Message");

    expect(matDialogSpy.open).toHaveBeenCalledWith(ConfirmDialogComponent, {
      panelClass: "",
      width: "480px",
      position: { top: "100px" },
      data: {
        heading: "Heading",
        message: "Message",
      },
    });

    uiService.darkModeState.next(true);

    service.openConfirmDialog("Heading", "Message");

    expect(matDialogSpy.open).toHaveBeenCalledWith(ConfirmDialogComponent, {
      panelClass: "dark-theme",
      width: "480px",
      position: { top: "100px" },
      data: {
        heading: "Heading",
        message: "Message",
      },
    });
  });
});
