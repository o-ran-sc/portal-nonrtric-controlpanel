/*-
 * ========================LICENSE_START=================================
 * O-RAN-SC
 * %%
 * Copyright (C) 2021 Nordix Foundation
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

import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from "@angular/common/http";
import { Injectable, Injector } from "@angular/core";
import { Observable, of, throwError } from "rxjs";
import * as policyinstance1 from "./mock/policy-instance-1.json";
import * as noTypePolicies from "./mock/no-type-policies.json";
import * as type0Policies from "./mock/type0-policies.json";
import * as type1Policies from "./mock/type1-policies.json";
import * as policyinstance2 from "./mock/policy-instance-2.json";
import * as noTypePolicyinstance from "./mock/policy-instance-notype.json";
import * as policyinstance1Status from "./mock/policy-instance-1-status.json";
import * as policyinstance2Status from "./mock/policy-instance-2-status.json";
import * as producerIds from "./mock/producerids.json";
import * as producer1 from "./mock/producer1.json";
import * as producer2 from "./mock/producer2.json";
import * as producer3 from "./mock/producer3.json";
import * as producerstatus1 from "./mock/producer-status1.json";
import * as producerstatus2 from "./mock/producer-status2.json";
import * as producerstatus3 from "./mock/producer-status3.json";
import * as policytypes1 from "./mock/policy-type1.json";
import * as policytypes0 from "./mock/policy-type0.json";
import * as policyinstanceedit from "./mock/policy-instance-edit.json";
import * as ric1 from "./mock/ric1.json";
import * as ric2 from "./mock/ric2.json";
import * as ricconfig from "./mock/ric-configuration.json";
import * as jobIds from "./mock/jobids.json";
import * as infoJob1 from "./mock/info-job1.json";
import * as infoJob2 from "./mock/info-job2.json";
import * as infoJob3 from "./mock/info-job3.json";
import * as job1Status from "./mock/job1-status.json";
import * as job2Status from "./mock/job2-status.json";
import * as job3Status from "./mock/job3-status.json";
import { delay } from "rxjs/operators";

const POLICY_PATH = "/a1-policy/v2"
const INFO_PATH = "/data-producer/v1"
const CONSUMER_PATH = "/data-consumer/v1"

const urls = [
  {
    url: POLICY_PATH + "/policy-types/1",
    json: policytypes1,
  },
  {
    url: POLICY_PATH + "/policy-types/0",
    json: policytypes0,
  },
  {
    url: POLICY_PATH + "/policies?policytype_id=",
    json: noTypePolicies,
  },
  {
    url: POLICY_PATH + "/policies?policytype_id=0",
    json: type0Policies,
  },
  {
    url: POLICY_PATH + "/policies?policytype_id=1",
    json: type1Policies,
  },
  {
    url: POLICY_PATH + "/policies/2001",
    json: noTypePolicyinstance,
  },
  {
    url: POLICY_PATH + "/policies/2000",
    json: policyinstance1,
  },
  {
    url: POLICY_PATH + "/policies/2100",
    json: policyinstance2,
  },
  {
    url: POLICY_PATH + "/policies/2001/status",
    json: policyinstance1Status,
  },
  {
    url: POLICY_PATH + "/policies/2000/status",
    json: policyinstance1Status,
  },
  {
    url: POLICY_PATH + "/policies/2100/status",
    json: policyinstance2Status,
  },
  {
    url: POLICY_PATH + "/policies/2000?type=",
    json: policyinstanceedit,
  },
  {
    url: POLICY_PATH + "/policies/2100?type=",
    json: policyinstanceedit,
  },
  {
    url: POLICY_PATH + "/policies/2000?type=1",
    json: policyinstanceedit,
  },
  {
    url: POLICY_PATH + "/policies/2100?type=1",
    json: policyinstanceedit,
  },
  {
    url: POLICY_PATH + "/policies/2000?ric=ric1&type=1",
    json: "",
  },
  {
    url: POLICY_PATH + "/rics?policytype_id=0",
    json: ric1,
  },
  {
    url: POLICY_PATH + "/rics?policytype_id=1",
    json: ric1,
  },
  {
    url: POLICY_PATH + "/rics?policytype_id=",
    json: ric2,
  },
  {
    url: INFO_PATH + "/info-producers",
    json: producerIds,
  },
  {
    url: INFO_PATH + "/info-producers/producer1",
    json: producer1,
  },
  {
    url: INFO_PATH + "/info-producers/producer2",
    json: producer2,
  },
  {
    url: INFO_PATH + "/info-producers/producer3",
    json: producer3,
  },
  {
    url: INFO_PATH + "/info-producers/producer1/status",
    json: producerstatus1,
  },
  {
    url: INFO_PATH + "/info-producers/producer2/status",
    json: producerstatus2,
  },
  {
    url: INFO_PATH + "/info-producers/producer3/status",
    json: producerstatus3,
  },
  {
    url: CONSUMER_PATH + "/info-jobs",
    json: jobIds,
  },
  {
    url: CONSUMER_PATH + "/info-jobs/job1",
    json: infoJob1,
  },
  {
    url: CONSUMER_PATH + "/info-jobs/job2",
    json: infoJob2,
  },
  {
    url: CONSUMER_PATH + "/info-jobs/job3",
    json: infoJob3,
  },
  {
    url: CONSUMER_PATH + "/info-jobs/job1/status",
    json: job1Status,
  },
  {
    url: CONSUMER_PATH + "/info-jobs/job2/status",
    json: job2Status,
  },
  {
    url: CONSUMER_PATH + "/info-jobs/job3/status",
    json: job3Status,
  },
  {
    url: '/a1-policy/v2/configuration',
    json: ricconfig
  }
];

@Injectable()
export class HttpMockRequestInterceptor implements HttpInterceptor {
  private toggleTypes = true;

  constructor(private injector: Injector) { }

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    let result: HttpResponse<any>;
    if (request.method === "PUT" && request.url.includes("policies")) {
      result = new HttpResponse({ status: 200 });
    } else if (request.method === "DELETE") {
      result = new HttpResponse({ status: 204 });
    } else if (request.url === POLICY_PATH + "/policy-types") {
      result = this.getAlternatingNoOfTypes();
    } else {
      for (const element of urls) {
        if (request.url === element.url) {
          result = new HttpResponse({
            status: 200,
            body: (element.json as any).default,
          });
        }
      }
    }

    if (result) {
      console.log(
        "Mock answering http call :" + request.method + " " + request.url,
        request.method === "PUT" ? request.body : null
      );
      console.log("Returning: " + result.status, result.body);
      // Adding a delay to simulate real server call.
      return of(result).pipe(delay(10));
    } else {
      return next.handle(request);
    }
  }

  getAlternatingNoOfTypes(): HttpResponse<any> {
    let result: HttpResponse<any>;
    if (this.toggleTypes) {
      this.toggleTypes = false;
      result = new HttpResponse({
        status: 200,
        body: JSON.parse('{"policytype_ids": ["","1","0"]}'),
      });
    } else {
      this.toggleTypes = true;
      result = new HttpResponse({
        status: 200,
        body: JSON.parse('{"policytype_ids": ["","1"]}'),
      });
    }
    return result;
  }

}
