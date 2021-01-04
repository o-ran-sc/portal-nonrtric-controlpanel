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
package org.oransc.portal.nonrtric.controlpanel.policyagentapi;

import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.reflect.TypeToken;

import java.lang.invoke.MethodHandles;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.immutables.gson.Gson;
import org.immutables.value.Value;
import org.oransc.portal.nonrtric.controlpanel.model.PolicyInfo;
import org.oransc.portal.nonrtric.controlpanel.model.PolicyInstance;
import org.oransc.portal.nonrtric.controlpanel.model.PolicyType;
import org.oransc.portal.nonrtric.controlpanel.model.PolicyTypes;
import org.oransc.portal.nonrtric.controlpanel.util.AsyncRestClient;
import org.oransc.portal.nonrtric.controlpanel.util.ErrorResponseHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

@Component("PolicyAgentApi")
public class PolicyAgentApiImpl implements PolicyAgentApi {
    private static final Logger logger = LoggerFactory.getLogger(MethodHandles.lookup().lookupClass());

    private final AsyncRestClient webClient;

    private static com.google.gson.Gson gson = new GsonBuilder() //
        .serializeNulls() //
        .create(); //

    @Autowired
    public PolicyAgentApiImpl(
        @org.springframework.beans.factory.annotation.Value("${policycontroller.url.prefix}") final String urlPrefix) {
        this(new AsyncRestClient(urlPrefix));
        logger.debug("ctor prefix '{}'", urlPrefix);
    }

    public PolicyAgentApiImpl(AsyncRestClient webClient) {
        this.webClient = webClient;
    }

    @Override
    public ResponseEntity<String> getAllPolicyTypes() {
        try {
            final String url = "/v2/policy-types";
            ResponseEntity<String> rsp = webClient.getForEntity(url).block();
            if (!rsp.getStatusCode().is2xxSuccessful()) {
                return rsp;
            }

            PolicyTypes result = new PolicyTypes();
            JsonArray policyTypeIds = JsonParser.parseString(rsp.getBody()).getAsJsonObject() //
                .get("policytype_ids") //
                .getAsJsonArray(); //

            for (JsonElement policyTypeId : policyTypeIds) {

                String typeId = policyTypeId.getAsString();

                JsonObject schemaObj = getIndividualPolicySchema(typeId);
                PolicyType pt = new PolicyType(typeId, schemaObj.toString());
                result.add(pt);
            }
            return new ResponseEntity<>(gson.toJson(result), rsp.getStatusCode());
        } catch (Exception e) {
            return ErrorResponseHandler.handleException(e);
        }
    }

    public JsonObject getIndividualPolicySchema(String id) {
        try {
            final String url = "/v2/policy-types/" + id;
            ResponseEntity<String> rsp = webClient.getForEntity(url).block();
            if (!rsp.getStatusCode().is2xxSuccessful()) {
                return null;
            }

            JsonObject policy_schema = JsonParser.parseString(rsp.getBody()).getAsJsonObject() //
                .get("policy_schema") //
                .getAsJsonObject(); //

            return policy_schema;
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    public ResponseEntity<String> getPolicyInstancesForType(String type) {
        try {
            String url = "/v2/policies?policytype_id=" + type;
            ResponseEntity<String> rsp = webClient.getForEntity(url).block();
            if (!rsp.getStatusCode().is2xxSuccessful()) {
                return rsp;
            }
            JsonArray policyInstances = JsonParser.parseString(rsp.getBody()).getAsJsonObject() //
                .get("policy_ids") //
                .getAsJsonArray(); //

            List<Object> res = new ArrayList<>();
            for (JsonElement p : policyInstances) {
                ResponseEntity<Object> policyInstance = getIndividualPolicyInstance(p.getAsString());
                res.add(policyInstance.getBody());
            }

            return new ResponseEntity<>(gson.toJson(res), rsp.getStatusCode());
        } catch (Exception e) {
            return ErrorResponseHandler.handleException(e);
        }
    }

    public ResponseEntity<Object> getIndividualPolicyInstance(String id) {
        try {
            String url = "/v2/policies/" + id;
            ResponseEntity<String> rsp = webClient.getForEntity(url).block();
            JsonObject obj = JsonParser.parseString(rsp.getBody()).getAsJsonObject();
            PolicyInfo i = gson.fromJson(obj, PolicyInfo.class);
            return new ResponseEntity<>(i, rsp.getStatusCode());
        } catch (Exception e) {
            ResponseEntity<String> rsp = ErrorResponseHandler.handleException(e);
            return new ResponseEntity<>(rsp.getBody(), rsp.getStatusCode());
        }
    }

    @Override
    public ResponseEntity<Object> getPolicyInstance(String id) {
        ResponseEntity<Object> rsp = getIndividualPolicyInstance(id);
        PolicyInfo i = (PolicyInfo) rsp.getBody();
        return new ResponseEntity<>(i.policyData, rsp.getStatusCode());
    }

    private String getTimeStampUTC() {
        return java.time.Instant.now().toString();
    }

    @Override
    public ResponseEntity<String> putPolicy(String policyTypeIdString, String policyInstanceId, Object json,
        String ric) {
        String url = "/v2/policies/";

        JsonElement data = JsonParser.parseString(json.toString()).getAsJsonObject();

        PolicyInstance i = PolicyInstance.builder() //
            .policyId(policyInstanceId) //
            .policyTypeId(policyTypeIdString) //
            .ricId(ric) //
            .policyData(data) //
            .serviceId("controlpanel") //
            .lastModified(getTimeStampUTC()) //
            .build(); //

        try {
            String jsonStr = gson.toJson(i, PolicyInstance.class);
            logger.debug("PolicyInstance: " + jsonStr);
            webClient.putForEntity(url, jsonStr).block();
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (Exception e) {
            return ErrorResponseHandler.handleException(e);
        }
    }

    @Override
    public ResponseEntity<String> deletePolicy(String policyInstanceId) {
        String url = "/v2/policies/" + policyInstanceId;
        try {
            webClient.deleteForEntity(url).block();
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (Exception e) {
            return ErrorResponseHandler.handleException(e);
        }
    }

    @Value.Immutable
    @Gson.TypeAdapters
    interface RicInfo {
        public String ric_id();

        public Collection<String> managed_element_ids();

        public Collection<String> policytype_ids();
    }

    @Override
    public ResponseEntity<String> getRicsSupportingType(String typeName) {
        try {
            String url = "/v2/rics?policytype_id=" + typeName;
            ResponseEntity<String> rsp = webClient.getForEntity(url).block();
            if (!rsp.getStatusCode().is2xxSuccessful()) {
                return rsp;
            }

            JsonArray rics = JsonParser.parseString(rsp.getBody()).getAsJsonObject() //
                .get("rics") //
                .getAsJsonArray(); //

            Type listType = new TypeToken<List<ImmutableRicInfo>>() {}.getType();
            List<RicInfo> rspParsed = gson.fromJson(rics, listType);
            Collection<String> result = new ArrayList<>(rspParsed.size());
            for (RicInfo ric : rspParsed) {
                result.add(ric.ric_id());
            }
            String json = gson.toJson(result);
            return new ResponseEntity<>(json, HttpStatus.OK);
        } catch (Exception e) {
            return ErrorResponseHandler.handleException(e);
        }
    }
}
