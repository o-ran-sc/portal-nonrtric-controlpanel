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
package org.oransc.portal.nonrtric.controlpanel.controller;

import io.swagger.annotations.ApiOperation;

import java.lang.invoke.MethodHandles;

import javax.servlet.http.HttpServletResponse;

import org.oransc.portal.nonrtric.controlpanel.ControlPanelConstants;
import org.oransc.portal.nonrtric.controlpanel.policyagentapi.PolicyAgentApi;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.util.Assert;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Proxies calls from the front end to the Policy Agent API.
 *
 * If a method throws RestClientResponseException, it is handled by
 * {@link CustomResponseEntityExceptionHandler#handleProxyMethodException(Exception, org.springframework.web.context.request.WebRequest)}
 * which returns status 502. All other exceptions are handled by Spring which
 * returns status 500.
 */
@RestController
@RequestMapping(value = PolicyController.CONTROLLER_PATH, produces = MediaType.APPLICATION_JSON_VALUE)
public class PolicyController {

    private static final Logger logger = LoggerFactory.getLogger(MethodHandles.lookup().lookupClass());

    // Publish paths in constants so tests are easy to write
    public static final String CONTROLLER_PATH = ControlPanelConstants.ENDPOINT_PREFIX + "/policy";
    // Endpoints
    public static final String VERSION_METHOD = ControlPanelConstants.VERSION_METHOD;
    public static final String POLICY_TYPES_METHOD = "policytypes";
    public static final String POLICY_TYPE_PARAM = "type";
    public static final String POLICIES_NAME = "policies";
    public static final String POLICY_INSTANCE_ID_NAME = "policy_instance_id";

    // Populated by the autowired constructor
    private final PolicyAgentApi policyAgentApi;

    @Autowired
    public PolicyController(final PolicyAgentApi policyAgentApi) {
        Assert.notNull(policyAgentApi, "API must not be null");
        this.policyAgentApi = policyAgentApi;
        logger.debug("ctor: configured with client type {}", policyAgentApi.getClass().getName());
    }

    /*
     * The fields are defined in the Policy Control Typescript interface.
     */
    @ApiOperation(value = "Gets the policy types from Near-RT RIC")
    @GetMapping(POLICY_TYPES_METHOD)
    @Secured({ControlPanelConstants.ROLE_ADMIN, ControlPanelConstants.ROLE_STANDARD})
    public ResponseEntity<String> getAllPolicyTypes(HttpServletResponse response) {
        logger.debug("getAllPolicyTypes");
        return this.policyAgentApi.getAllPolicyTypes();
    }

    @ApiOperation(value = "Returns the policy instances for the given policy type.")
    @GetMapping(POLICIES_NAME)
    @Secured({ControlPanelConstants.ROLE_ADMIN, ControlPanelConstants.ROLE_STANDARD})
    public ResponseEntity<String> getPolicyInstances(
        @RequestParam(name = "type", required = true) String policyTypeIdString) {
        logger.debug("getPolicyInstances {}", policyTypeIdString);
        return this.policyAgentApi.getPolicyInstancesForType(policyTypeIdString);
    }

    @ApiOperation(value = "Returns a policy instance of a type")
    @GetMapping(POLICIES_NAME + "/{" + POLICY_INSTANCE_ID_NAME + "}")
    @Secured({ControlPanelConstants.ROLE_ADMIN, ControlPanelConstants.ROLE_STANDARD})
    public ResponseEntity<Object> getPolicyInstance(
        @RequestParam(name = "type", required = true) String policyTypeIdString,
        @PathVariable(POLICY_INSTANCE_ID_NAME) String policyInstanceId) {
        logger.debug("getPolicyInstance {}:{}", policyTypeIdString, policyInstanceId);
        return this.policyAgentApi.getPolicyInstance(policyInstanceId);
    }

    @ApiOperation(value = "Creates the policy instances for the given policy type.")
    @PutMapping(POLICIES_NAME + "/{" + POLICY_INSTANCE_ID_NAME + "}")
    @Secured({ControlPanelConstants.ROLE_ADMIN})
    public ResponseEntity<String> putPolicyInstance( //
        @RequestParam(POLICY_TYPE_PARAM) String policyTypeIdString, //
        @RequestParam(name = "ric", required = true) String ric, //
        @PathVariable(POLICY_INSTANCE_ID_NAME) String policyInstanceId, //
        @RequestBody String instance) {
        logger.debug("putPolicyInstance ric: {}, typeId: {}, instanceId: {}, instance: {}", ric, policyTypeIdString,
            policyInstanceId, instance);
        return this.policyAgentApi.putPolicy(policyTypeIdString, policyInstanceId, instance, ric);
    }

    @ApiOperation(value = "Deletes the policy instances for the given policy type.")
    @DeleteMapping(POLICIES_NAME + "/{" + POLICY_INSTANCE_ID_NAME + "}")
    @Secured({ControlPanelConstants.ROLE_ADMIN})
    public ResponseEntity<String> deletePolicyInstance( //
        @RequestParam(POLICY_TYPE_PARAM) String policyTypeIdString,
        @PathVariable(POLICY_INSTANCE_ID_NAME) String policyInstanceId) {
        logger.debug("deletePolicyInstance typeId: {}, instanceId: {}", policyTypeIdString, policyInstanceId);
        return this.policyAgentApi.deletePolicy(policyInstanceId);
    }

    @ApiOperation(value = "Returns the rics supporting the given policy type.")
    @GetMapping("/rics")
    @Secured({ControlPanelConstants.ROLE_ADMIN, ControlPanelConstants.ROLE_STANDARD})
    public ResponseEntity<String> getRicsSupportingType(
        @RequestParam(name = "policyType", required = true) String supportingPolicyType) {
        logger.debug("getRicsSupportingType {}", supportingPolicyType);

        return this.policyAgentApi.getRicsSupportingType(supportingPolicyType);
    }
}
