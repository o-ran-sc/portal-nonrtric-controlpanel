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

import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.gson.annotations.SerializedName;

import org.immutables.gson.Gson;
import org.immutables.value.Value;

@Value.Immutable
@Gson.TypeAdapters
public interface PolicyInfo {

    @SerializedName("policy_id")
    @JsonProperty("policy_id")
    public String id();

    @SerializedName("policytype_id")
    @JsonProperty("policytype_id")
    public String type();

    @SerializedName("ric_id")
    @JsonProperty("ric_id")
    public String ric();

    @SerializedName("policy_data")
    @JsonProperty("policy_data")
    public Object json();

    @SerializedName("service_id")
    @JsonProperty("service_id")
    public String service();

    @SerializedName("lastModified")
    @JsonProperty("lastModified")
    public String lastModified();

    @SerializedName("status_notification_uri")
    @JsonProperty("status_notification_uri")
    public String status_notification_uri();

    @SerializedName("transient")
    @JsonProperty("transient")
    public boolean isTransient();
}
