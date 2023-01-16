# O-RAN-SC Non-RT RIC Control Panel Web Application

The O-RAN Non-RT RIC Control Panel provides administrative and operator functions for a Near-RT RIC through the A1 API.
This web app consists of an Angular (version 9) front end, see [frontend](webapp-frontend/README.md),
and a Java (version 11) Spring Cloud Gateway (version 2020.0.0), see [gateway](nonrtric-gateway/README.md).

Please see the documentation in the docs/ folder.

The backend server publishes live API documentation at the
URL `http://your-host-name-here:8080/swagger-ui.html`

## License

Copyright (C) 2019 AT&T Intellectual Property. All rights reserved.
Modifications Copyright (C) 2019 Nordix Foundation
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
