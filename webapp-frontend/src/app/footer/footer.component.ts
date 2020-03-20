/*-
 * ========================LICENSE_START=================================
 * O-RAN-SC
 * %%
 * Copyright (C) 2019 AT&T Intellectual Property
 * Modifications Copyright (C) 2019 Nordix Foundation
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
import { Component, OnInit } from '@angular/core';
import { ControlpanelSuccessTransport } from '../interfaces/controlpanel.types';
import { ControlpanelService } from '../services/controlpanel/controlpanel.service';
import { UiService } from '../services/ui/ui.service';

@Component({
  selector: 'rd-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})

/**
 * Fetches the version on load for display in the footer
 */
export class FooterComponent implements OnInit {
  darkMode: boolean;
  controlpanelVersion: string;

  // Inject the service
  constructor(private controlpanelService: ControlpanelService,
    private ui: UiService) { }

  ngOnInit() {
    this.controlpanelVersion = '0.0';
    // this.controlpanelService.getVersion().subscribe((res: ControlpanelSuccessTransport) => this.controlpanelVersion = res.data);
    this.ui.darkModeState.subscribe((isDark) => {
      this.darkMode = isDark;
    });
  }

}
