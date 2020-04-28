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
import java.util.Map;
import org.immutables.gson.Gson;
import org.immutables.value.Value;
import org.oransc.portal.nonrtric.controlpanel.model.ImmutablePolicyInfo;
import org.oransc.portal.nonrtric.controlpanel.model.PolicyInfo;
import org.oransc.portal.nonrtric.controlpanel.model.PolicyInstances;
import org.oransc.portal.nonrtric.controlpanel.model.PolicyType;
import org.oransc.portal.nonrtric.controlpanel.model.PolicyTypes;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

@Component("PolicyAgentApi")
public class PolicyAgentApiImpl implements PolicyAgentApi {
    private static final Logger logger = LoggerFactory.getLogger(MethodHandles.lookup().lookupClass());
    private static final String CREATE_SCHEMA = "create_schema";

    RestTemplate restTemplate;

    private static com.google.gson.Gson gson = new GsonBuilder() //
        .serializeNulls() //
        .create(); //

    private final String urlPrefix;

    @Autowired
    public PolicyAgentApiImpl(
        @org.springframework.beans.factory.annotation.Value("${policycontroller.url.prefix}") final String urlPrefix) {
        this(urlPrefix, new RestTemplate());
        logger.debug("ctor prefix '{}'", urlPrefix);
    }

    public PolicyAgentApiImpl(String urlPrefix, RestTemplate restTemplate) {
        this.urlPrefix = urlPrefix;
        this.restTemplate = restTemplate;
    }

    private String baseUrl() {
        return urlPrefix;
    }

    @Value.Immutable
    @Gson.TypeAdapters
    interface PolicyTypeInfo {

        public String name();

        public String schema();
    }

    @Override
    public ResponseEntity<String> getAllPolicyTypes() {
        try {
            String url = baseUrl() + "/policy_schemas";
            ResponseEntity<String> rsp = this.restTemplate.getForEntity(url, String.class);
            if (!rsp.getStatusCode().is2xxSuccessful()) {
                return rsp;
            }

            PolicyTypes result = new PolicyTypes();

            JsonArray schemas = JsonParser.parseString(rsp.getBody()).getAsJsonArray();
            for (JsonElement schema : schemas) {
                JsonObject schemaObj = schema.getAsJsonObject();
                if (schemaObj.getAsJsonObject(CREATE_SCHEMA) != null
                        && schemaObj.getAsJsonObject(CREATE_SCHEMA).get("title") != null) {
                    String title = schemaObj.getAsJsonObject(CREATE_SCHEMA).get("title").getAsString();
                    String schemaAsStr = schemaObj.toString();
                    PolicyType pt = new PolicyType(title, schemaAsStr);
                    result.add(pt);
                } else {
                    logger.warn("Ignoring schema: {}", schemaObj);
                }
            }
            return new ResponseEntity<>(gson.toJson(result), rsp.getStatusCode());
        } catch (Exception e) {
            return handleException(e);
        }
    }

    @Override
    public ResponseEntity<String> getPolicyInstancesForType(String type) {
        String url = baseUrl() + "/policies?type={type}";
        Map<String, ?> uriVariables = Map.of("type", type);
        ResponseEntity<String> rsp = this.restTemplate.getForEntity(url, String.class, uriVariables);
        if (!rsp.getStatusCode().is2xxSuccessful()) {
            return rsp;
        }

        try {
            Type listType = new TypeToken<List<ImmutablePolicyInfo>>() {}.getType();
            List<PolicyInfo> rspParsed = gson.fromJson(rsp.getBody(), listType);
            PolicyInstances result = new PolicyInstances();
            for (PolicyInfo p : rspParsed) {
                result.add(p);
            }
            return new ResponseEntity<>(gson.toJson(result), rsp.getStatusCode());
        } catch (Exception e) {
            return handleException(e);
        }
    }

    @Override
    public ResponseEntity<Object> getPolicyInstance(String id) {
        String url = baseUrl() + "/policy?id={id}";
        Map<String, ?> uriVariables = Map.of("id", id);

        return this.restTemplate.getForEntity(url, Object.class, uriVariables);
    }

    @Override
    public ResponseEntity<String> putPolicy(String policyTypeIdString, String policyInstanceId, Object json,
        String ric) {
        String url = baseUrl() + "/policy?type={type}&id={id}&ric={ric}&service={service}";
        Map<String, ?> uriVariables = Map.of( //
            "type", policyTypeIdString, //
            "id", policyInstanceId, //
            "ric", ric, //
            "service", "controlpanel");

        try {
            this.restTemplate.put(url, createJsonHttpEntity(json), uriVariables);
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (Exception e) {
            return handleException(e);
        }
    }

    @Override
    public ResponseEntity<String> deletePolicy(String policyInstanceId) {
        String url = baseUrl() + "/policy?id={id}";
        Map<String, ?> uriVariables = Map.of("id", policyInstanceId);
        try {
            this.restTemplate.delete(url, uriVariables);
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (Exception e) {
            return handleException(e);
        }

    }

    @Value.Immutable
    @Gson.TypeAdapters
    interface RicInfo {
        public String ricName();

        public Collection<String> nodeNames();

        public Collection<String> policyTypes();
    }

    @Override
    public ResponseEntity<String> getRicsSupportingType(String typeName) {
        String url = baseUrl() + "/rics?policyType={typeName}";
        Map<String, ?> uriVariables = Map.of("typeName", typeName);
        String rsp = this.restTemplate.getForObject(url, String.class, uriVariables);

        try {
            Type listType = new TypeToken<List<ImmutableRicInfo>>() {}.getType();
            List<RicInfo> rspParsed = gson.fromJson(rsp, listType);
            Collection<String> result = new ArrayList<>(rspParsed.size());
            for (RicInfo ric : rspParsed) {
                result.add(ric.ricName());
            }
            return new ResponseEntity<>(gson.toJson(result), HttpStatus.OK);
        } catch (Exception e) {
            return handleException(e);
        }
    }

    private HttpEntity<Object> createJsonHttpEntity(Object content) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return new HttpEntity<>(content, headers);
    }

    private ResponseEntity<String> handleException(Exception throwable) {
        if (throwable instanceof HttpClientErrorException) {
            HttpClientErrorException e = (HttpClientErrorException) throwable;
            return new ResponseEntity<>(e.getMessage(), e.getStatusCode());
        } else if (throwable instanceof HttpServerErrorException) {
            HttpServerErrorException e = (HttpServerErrorException) throwable;
            return new ResponseEntity<>(e.getResponseBodyAsString(), e.getStatusCode());
        }
        return new ResponseEntity<>(throwable.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }

}
