/*-
 * ========================LICENSE_START=================================
 * Copyright (C) 2020 Nordix Foundation. All rights reserved.
 * ======================================================================
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
import lombok.Builder;

import org.immutables.gson.Gson;

@Gson.TypeAdapters
@ApiModel(value = "ei_producer", description = "The EI producer")
@Builder
public class ProducerInfo {

    @ApiModelProperty(value = "Idenitity of the EI producer", required = true)
    @SerializedName("ei_producer_id")
    public String id;

    @ApiModelProperty(value = "Types provided by the EI producer", required = true)
    @SerializedName("ei_producer_types")
    public String[] types;

    @ApiModelProperty(value = "Status of the EI producer", required = true)
    @SerializedName("status")
    public String status;

}
