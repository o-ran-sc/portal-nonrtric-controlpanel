/*-
 * ========================LICENSE_START=================================
 * O-RAN-SC
 * %%
 * Copyright (C) 2019 AT&T Intellectual Property
 * Modifications Copyright (C) 2020 Nordix Foundation
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
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ControlpanelSuccessTransport, EcompUser } from '../../interfaces/controlpanel.types';

@Injectable({
  providedIn: 'root'
})

/**
 * Services to query the Controlpanel's admin endpoints.
 */
export class ControlpanelService {

  private basePath = 'api/admin/';

  constructor(private httpClient: HttpClient) {
    // injects to variable httpClient
  }

 /**
   * Checks app health
   * @returns Observable that should yield a ControlpanelSuccessTransport
   */
  getHealth(): Observable<ControlpanelSuccessTransport> {
    return this.httpClient.get<ControlpanelSuccessTransport>(this.basePath + 'health');
  }

  /**
   * Gets Controlpanel version details
   * @returns Observable that should yield a ControlpanelSuccessTransport object
   */
  getVersion(): Observable<ControlpanelSuccessTransport> {
    return this.httpClient.get<ControlpanelSuccessTransport>(this.basePath + 'version');
  }

  /**
   * Gets Controlpanel users
   * @returns Observable that should yield a EcompUser array
   */
  getUsers(): Observable<EcompUser[]> {
    return this.httpClient.get<EcompUser[]>(this.basePath + 'user');
  }

}
