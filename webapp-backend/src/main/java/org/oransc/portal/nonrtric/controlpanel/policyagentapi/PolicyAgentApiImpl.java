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
import org.oransc.portal.nonrtric.controlpanel.model.ImmutablePolicyInfo;
import org.oransc.portal.nonrtric.controlpanel.model.PolicyInfo;
import org.oransc.portal.nonrtric.controlpanel.model.PolicyInstances;
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
            JsonArray policytype_ids = JsonParser.parseString(rsp.getBody()).getAsJsonObject() //
                .get("policytype_ids") //
                .getAsJsonArray(); //

            logger.debug("policytype_ids '{}'", policytype_ids);
            for (JsonElement policytype_id : policytype_ids) {

                String type_id = policytype_id.getAsString();

                JsonObject schemaObj = getIndividualPolicySchema(type_id);
                PolicyType pt = new PolicyType(type_id, schemaObj.toString());
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

    private String getTimeStampUTC() {
        return java.time.Instant.now().toString();
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

            PolicyInstances result = new PolicyInstances();

            for (JsonElement policy_id : policyInstances) {

                String p_id = policy_id.getAsString();

                ResponseEntity<Object> ans = getPolicyInstance(p_id);

                JsonObject policy_info = JsonParser.parseString(ans.getBody().toString()).getAsJsonObject(); //

                PolicyInfo p = ImmutablePolicyInfo.builder().id(policy_info.get("policy_id").getAsString()) //
                    .isTransient(policy_info.get("transient").getAsBoolean()) //
                    .json(policy_info.get("policy_data").getAsJsonObject()).lastModified(getTimeStampUTC()) //
                    .ric(policy_info.get("ric_id").getAsString()) //
                    .service(policy_info.get("service_id").getAsString()) //
                    .status_notification_uri(policy_info.get("status_notification_uri").getAsString()) //
                    .type(policy_info.get("policytype_id").getAsString()).build(); //

                result.add(p);
            }

            return new ResponseEntity<>(gson.toJson(result), rsp.getStatusCode());
        } catch (Exception e) {
            return ErrorResponseHandler.handleException(e);
        }
    }

    @Override
    public ResponseEntity<Object> getPolicyInstance(String policyInstanceId) {
        try {
            String url = "/v2/policies/" + policyInstanceId;
            ResponseEntity<String> rsp = webClient.getForEntity(url).block();
            JsonObject obj = JsonParser.parseString(rsp.getBody()).getAsJsonObject();
            String str = obj.toString();
            return new ResponseEntity<>(str, rsp.getStatusCode());
        } catch (Exception e) {
            ResponseEntity<String> rsp = ErrorResponseHandler.handleException(e);
            return new ResponseEntity<>(rsp.getBody(), rsp.getStatusCode());
        }
    }

    @Override
    public ResponseEntity<String> putPolicy(String policyTypeIdString, String policyInstanceId, Object instance,
        String ric) {
        String url = "/v2/policies/";

        try {
            String jsonStr = "{\n" + //
                " \"policy_id\": \"" + policyInstanceId + "\",\n" + //
                " \"policytype_id\": \"" + policyTypeIdString + "\",\n" + //
                " \"ric_id\": \"" + ric + "\",\n" + //
                " \"policy_data\": " + instance + ",\n" + //
                " \"service_id\": \"ric-registration\",\n" + //
                // " \"lastModified\":" + getTimeStampUTC() + ",\n" + //
                " \"status_notification_uri\": \"http://callback-receiver:8090/callbacks/test\",\n" + //
                " \"transient\": true\n" + //
                "}"; //
            logger.debug("jsonStr '{}'", jsonStr);

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
            List<RicInfo> rspParsed = gson.fromJson(gson.toJson(rics), listType);
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
