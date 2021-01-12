/*-
 * ========================LICENSE_START=================================
 * O-RAN-SC
 * %%
 * Copyright (C) 2019 Nordix Foundation
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

package org.oransc.portal.nonrtric.controlpanel.model;

import com.google.gson.annotations.SerializedName;

import lombok.Builder;

import org.immutables.gson.Gson;

@Gson.TypeAdapters
@Builder
public class PolicyInfo {
    @SerializedName(value = "id", alternate = "policy_id")
    public String policyId;

    @SerializedName(value = "type", alternate = "policytype_id")
    public String policyTypeId;

    @SerializedName(value = "ric", alternate = "ric_id")
    public String ricId;

    @SerializedName(value = "json", alternate = "policy_data")
    public Object policyData;

    @SerializedName(value = "service", alternate = "service_id")
    public String serviceId;

    @SerializedName("transient")
    public boolean isTransient = false;

    @SerializedName(value = "statusNotificationUri", alternate = "status_notification_uri")
    public String statusNotificationUri = "";

    @SerializedName("lastModified")
    public String lastModified = "";

    public boolean validate() {
        return policyId != null && policyTypeId != null && ricId != null && policyData != null && serviceId != null;
    }

}
