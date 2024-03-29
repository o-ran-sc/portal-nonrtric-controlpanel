# License

Copyright (C) 2020 Nordix Foundation.
Licensed under the Apache License, Version 2.0 (the "License")
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

For more information about license please see the [LICENSE](LICENSE.txt) file for details.

## O-RAN-SC docker-compose files

The docker compose file helps the user to deploy the components of nonrtric control panel with one command.

NOTE:
docker image urls & tags are in file ```.env```

To install the Control Panel and gateway, run the following command:

```shell
docker-compose --env-file .env -f docker-compose.yaml -f control-panel/docker-compose.yaml -f nonrtric-gateway/docker-compose.yaml up -d
```

To remove the containers, use the command:

```shell
docker-compose --env-file .env -f docker-compose.yaml -f control-panel/docker-compose.yaml -f nonrtric-gateway/docker-compose.yaml down
```
