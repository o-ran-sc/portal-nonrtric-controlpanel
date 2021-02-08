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
import { Component, OnInit } from '@angular/core';
import { UiService } from './services/ui/ui.service';
import { CookieService } from 'ngx-cookie';

@Component({
  selector: 'nrcp-root',
  templateUrl: './controlpanel.component.html',
  styleUrls: ['./controlpanel.component.scss']
})
export class ControlpanelComponent implements OnInit {
  private showMenu = false;
  private darkMode: boolean;
  private 'DARK_MODE_COOKIE' = 'darkMode';

  constructor(private cookieService: CookieService, private ui: UiService) {
  }

  ngOnInit() {
    const dark = this.cookieService.get(this.DARK_MODE_COOKIE);
    if (dark) {
      this.ui.darkModeState.next(dark === 'yes');
    }

    this.ui.darkModeState.subscribe((value) => {
      this.darkMode = value;
    });
  }

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  modeToggleSwitch() {
    this.ui.darkModeState.next(!this.darkMode);
    this.cookieService.put(this.DARK_MODE_COOKIE, this.darkMode ? 'yes' : 'no');
  }

}
