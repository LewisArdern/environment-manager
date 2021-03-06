"use strict";

module.exports = {
  "id": "ConsulConnectCommon",
  "$schema": "http://json-schema.org/draft-04/schema#",
  "title": "ConsulConnectCommon",
  "description": "Set data required to connect to Consul",
  "type": "object",
  "properties": {
    "environment": {"$ref": "EnvironmentName"}
  },
  "required": ["environment"]
};
