/*-
 * ========================LICENSE_START=================================
 * O-RAN-SC
 * %%
 * Copyright (C) 2020 Nordix Foundation
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

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;

import java.util.Collection;

import lombok.Builder;

import org.immutables.gson.Gson;

@Gson.TypeAdapters
@ApiModel(value = "producer_registration_info", description = "Information for an EI producer")
@Builder
public class ProducerRegistrationInfo {

    @Gson.TypeAdapters
    @ApiModel(value = "producer_ei_type_registration_info", description = "Information for an EI type")
    @Builder
    public static class ProducerEiTypeRegistrationInfo {

        @ApiModelProperty(value = "EI type identity", required = true)
        @SerializedName("ei_type_identity")
        public String eiTypeId;

        @ApiModelProperty(value = "Json schema for the job data")
        @SerializedName("ei_job_data_schema")
        public Object jobDataSchema;
    }

    @ApiModelProperty(value = "Supported EI type IDs", required = true)
    @SerializedName("supported_ei_types")
    public Collection<String> supportedTypeIds;

    @ApiModelProperty(value = "callback for EI job", required = true)
    @SerializedName("ei_job_callback_url")
    public String jobCallbackUrl;

    @ApiModelProperty(value = "callback for producer supervision", required = true)
    @SerializedName("ei_producer_supervision_callback_url")
    public String producerSupervisionCallbackUrl;
}
