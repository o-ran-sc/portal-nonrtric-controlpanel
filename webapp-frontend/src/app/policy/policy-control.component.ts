/*-
 * ========================LICENSE_START=================================
 * O-RAN-SC
 * %%
 * Copyright (C) 2019 Nordix Foundation
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
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { BehaviorSubject } from 'rxjs';

import { PolicyTypes, PolicyTypeSchema } from '@interfaces/policy.types';
import { UiService } from '@services/ui/ui.service';
import { PolicyService } from '@services/policy/policy.service';

class PolicyTypeInfo {
    constructor(public type: PolicyTypeSchema) { }

    isExpanded: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
}

@Component({
    selector: 'nrcp-policy-control',
    templateUrl: './policy-control.component.html',
    styleUrls: ['./policy-control.component.scss'],
    animations: [
        trigger('detailExpand', [
            state('collapsed, void', style({ height: '0px', minHeight: '0', display: 'none' })),
            state('expanded', style({ height: '*' })),
            transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
            transition('expanded <=> void', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
        ]),
    ],
})
export class PolicyControlComponent implements OnInit {

    policyTypeInfo = new Map<string, PolicyTypeInfo>();
    policyTypeIds: Array<string>;
    darkMode: boolean;

    constructor(
        private dialog: MatDialog,
        private policyService: PolicyService,
        private ui: UiService) { }

    ngOnInit() {
        this.ui.darkModeState.subscribe((isDark) => {
            this.darkMode = isDark;
        });
        this.policyService.getPolicyTypes().subscribe((policyType: PolicyTypes) => {
            this.policyTypeIds = policyType.policytype_ids;
            }
        );
    }
}
