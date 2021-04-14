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

import { async, TestBed } from "@angular/core/testing";

import { NotificationService } from "./notification.service";
import { ToastrService } from "ngx-toastr";

describe("NotificationService", () => {
  let service: NotificationService;
  let toastrSpy: jasmine.SpyObj<ToastrService>;

  beforeEach(async(() => {
    toastrSpy = jasmine.createSpyObj("ToastrService", [
      "success",
      "warning",
      "error",
    ]);

    TestBed.configureTestingModule({
      providers: [{ provide: ToastrService, useValue: toastrSpy }],
    });
    service = TestBed.inject(NotificationService);
  }));

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should open success with provided message and correct configuration", () => {
    service.success("Success!");

    expect(toastrSpy.success).toHaveBeenCalledWith("Success!", "", {
      timeOut: 10000,
      closeButton: true,
    });
  });

  it("should open error with provided message and correct configuration", () => {
    service.error("Error!");

    expect(toastrSpy.error).toHaveBeenCalledWith("Error!", "", {
      disableTimeOut: true,
      closeButton: true,
    });
  });
});
