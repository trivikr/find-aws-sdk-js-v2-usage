//#region rolldown:runtime
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJSMin = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __copyProps = (to, from$1, except, desc$1) => {
	if (from$1 && typeof from$1 === "object" || typeof from$1 === "function") {
		for (var keys = __getOwnPropNames(from$1), i$2 = 0, n = keys.length, key; i$2 < n; i$2++) {
			key = keys[i$2];
			if (!__hasOwnProp.call(to, key) && key !== except) {
				__defProp(to, key, {
					get: ((k) => from$1[k]).bind(null, key),
					enumerable: !(desc$1 = __getOwnPropDesc(from$1, key)) || desc$1.enumerable
				});
			}
		}
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));

//#endregion
//#region node_modules/aws-sdk/lib/json/builder.js
var require_builder$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var util$20 = require_util();
	function JsonBuilder$2() {}
	JsonBuilder$2.prototype.build = function(value, shape) {
		return JSON.stringify(translate$1(value, shape));
	};
	function translate$1(value, shape) {
		if (!shape || value === void 0 || value === null) return void 0;
		switch (shape.type) {
			case "structure": return translateStructure$1(value, shape);
			case "map": return translateMap$1(value, shape);
			case "list": return translateList$1(value, shape);
			default: return translateScalar$1(value, shape);
		}
	}
	function translateStructure$1(structure, shape) {
		if (shape.isDocument) return structure;
		var struct = {};
		util$20.each(structure, function(name, value) {
			var memberShape = shape.members[name];
			if (memberShape) {
				if (memberShape.location !== "body") return;
				var locationName = memberShape.isLocationName ? memberShape.name : name;
				var result = translate$1(value, memberShape);
				if (result !== void 0) struct[locationName] = result;
			}
		});
		return struct;
	}
	function translateList$1(list, shape) {
		var out = [];
		util$20.arrayEach(list, function(value) {
			var result = translate$1(value, shape.member);
			if (result !== void 0) out.push(result);
		});
		return out;
	}
	function translateMap$1(map, shape) {
		var out = {};
		util$20.each(map, function(key, value) {
			var result = translate$1(value, shape.value);
			if (result !== void 0) out[key] = result;
		});
		return out;
	}
	function translateScalar$1(value, shape) {
		return shape.toWireFormat(value);
	}
	/**
	* @api private
	*/
	module.exports = JsonBuilder$2;
}));

//#endregion
//#region node_modules/aws-sdk/lib/json/parser.js
var require_parser = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var util$19 = require_util();
	function JsonParser$2() {}
	JsonParser$2.prototype.parse = function(value, shape) {
		return translate(JSON.parse(value), shape);
	};
	function translate(value, shape) {
		if (!shape || value === void 0) return void 0;
		switch (shape.type) {
			case "structure": return translateStructure(value, shape);
			case "map": return translateMap(value, shape);
			case "list": return translateList(value, shape);
			default: return translateScalar(value, shape);
		}
	}
	function translateStructure(structure, shape) {
		if (structure == null) return void 0;
		if (shape.isDocument) return structure;
		var struct = {};
		var shapeMembers = shape.members;
		var isAwsQueryCompatible = shape.api && shape.api.awsQueryCompatible;
		util$19.each(shapeMembers, function(name, memberShape) {
			var locationName = memberShape.isLocationName ? memberShape.name : name;
			if (Object.prototype.hasOwnProperty.call(structure, locationName)) {
				var value = structure[locationName];
				var result = translate(value, memberShape);
				if (result !== void 0) struct[name] = result;
			} else if (isAwsQueryCompatible && memberShape.defaultValue) {
				if (memberShape.type === "list") struct[name] = typeof memberShape.defaultValue === "function" ? memberShape.defaultValue() : memberShape.defaultValue;
			}
		});
		return struct;
	}
	function translateList(list, shape) {
		if (list == null) return void 0;
		var out = [];
		util$19.arrayEach(list, function(value) {
			var result = translate(value, shape.member);
			if (result === void 0) out.push(null);
			else out.push(result);
		});
		return out;
	}
	function translateMap(map, shape) {
		if (map == null) return void 0;
		var out = {};
		util$19.each(map, function(key, value) {
			var result = translate(value, shape.value);
			if (result === void 0) out[key] = null;
			else out[key] = result;
		});
		return out;
	}
	function translateScalar(value, shape) {
		return shape.toType(value);
	}
	/**
	* @api private
	*/
	module.exports = JsonParser$2;
}));

//#endregion
//#region node_modules/aws-sdk/lib/protocol/helpers.js
var require_helpers = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var util$18 = require_util();
	var AWS$37 = require_core();
	/**
	* Prepend prefix defined by API model to endpoint that's already
	* constructed. This feature does not apply to operations using
	* endpoint discovery and can be disabled.
	* @api private
	*/
	function populateHostPrefix$3(request) {
		if (!request.service.config.hostPrefixEnabled) return request;
		var operationModel = request.service.api.operations[request.operation];
		if (hasEndpointDiscover(request)) return request;
		if (operationModel.endpoint && operationModel.endpoint.hostPrefix) {
			var hostPrefixNotation = operationModel.endpoint.hostPrefix;
			var hostPrefix = expandHostPrefix(hostPrefixNotation, request.params, operationModel.input);
			prependEndpointPrefix(request.httpRequest.endpoint, hostPrefix);
			validateHostname(request.httpRequest.endpoint.hostname);
		}
		return request;
	}
	/**
	* @api private
	*/
	function hasEndpointDiscover(request) {
		var api = request.service.api;
		var operationModel = api.operations[request.operation];
		var isEndpointOperation = api.endpointOperation && api.endpointOperation === util$18.string.lowerFirst(operationModel.name);
		return operationModel.endpointDiscoveryRequired !== "NULL" || isEndpointOperation === true;
	}
	/**
	* @api private
	*/
	function expandHostPrefix(hostPrefixNotation, params, shape) {
		util$18.each(shape.members, function(name, member) {
			if (member.hostLabel === true) {
				if (typeof params[name] !== "string" || params[name] === "") throw util$18.error(/* @__PURE__ */ new Error(), {
					message: "Parameter " + name + " should be a non-empty string.",
					code: "InvalidParameter"
				});
				var regex = new RegExp("\\{" + name + "\\}", "g");
				hostPrefixNotation = hostPrefixNotation.replace(regex, params[name]);
			}
		});
		return hostPrefixNotation;
	}
	/**
	* @api private
	*/
	function prependEndpointPrefix(endpoint, prefix) {
		if (endpoint.host) endpoint.host = prefix + endpoint.host;
		if (endpoint.hostname) endpoint.hostname = prefix + endpoint.hostname;
	}
	/**
	* @api private
	*/
	function validateHostname(hostname) {
		var labels = hostname.split(".");
		var hostPattern = /^[a-zA-Z0-9]{1}$|^[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9]$/;
		util$18.arrayEach(labels, function(label) {
			if (!label.length || label.length < 1 || label.length > 63) throw util$18.error(/* @__PURE__ */ new Error(), {
				code: "ValidationError",
				message: "Hostname label length should be between 1 to 63 characters, inclusive."
			});
			if (!hostPattern.test(label)) throw AWS$37.util.error(/* @__PURE__ */ new Error(), {
				code: "ValidationError",
				message: label + " is not hostname compatible."
			});
		});
	}
	module.exports = { populateHostPrefix: populateHostPrefix$3 };
}));

//#endregion
//#region node_modules/aws-sdk/lib/protocol/json.js
var require_json = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var util$17 = require_util();
	var JsonBuilder$1 = require_builder$1();
	var JsonParser$1 = require_parser();
	var populateHostPrefix$2 = require_helpers().populateHostPrefix;
	function buildRequest$4(req) {
		var httpRequest = req.httpRequest;
		var api = req.service.api;
		var target = api.targetPrefix + "." + api.operations[req.operation].name;
		var version = api.jsonVersion || "1.0";
		var input = api.operations[req.operation].input;
		var builder = new JsonBuilder$1();
		if (version === 1) version = "1.0";
		if (api.awsQueryCompatible) {
			if (!httpRequest.params) httpRequest.params = {};
			Object.assign(httpRequest.params, req.params);
		}
		httpRequest.body = builder.build(req.params || {}, input);
		httpRequest.headers["Content-Type"] = "application/x-amz-json-" + version;
		httpRequest.headers["X-Amz-Target"] = target;
		populateHostPrefix$2(req);
	}
	function extractError$4(resp) {
		var error = {};
		var httpResponse = resp.httpResponse;
		error.code = httpResponse.headers["x-amzn-errortype"] || "UnknownError";
		if (typeof error.code === "string") error.code = error.code.split(":")[0];
		if (httpResponse.body.length > 0) try {
			var e = JSON.parse(httpResponse.body.toString());
			var code$1 = e.__type || e.code || e.Code;
			if (code$1) error.code = code$1.split("#").pop();
			if (error.code === "RequestEntityTooLarge") error.message = "Request body must be less than 1 MB";
			else error.message = e.message || e.Message || null;
			for (var key in e || {}) {
				if (key === "code" || key === "message") continue;
				error["[" + key + "]"] = "See error." + key + " for details.";
				Object.defineProperty(error, key, {
					value: e[key],
					enumerable: false,
					writable: true
				});
			}
		} catch (e$1) {
			error.statusCode = httpResponse.statusCode;
			error.message = httpResponse.statusMessage;
		}
		else {
			error.statusCode = httpResponse.statusCode;
			error.message = httpResponse.statusCode.toString();
		}
		resp.error = util$17.error(/* @__PURE__ */ new Error(), error);
	}
	function extractData$4(resp) {
		var body = resp.httpResponse.body.toString() || "{}";
		if (resp.request.service.config.convertResponseTypes === false) resp.data = JSON.parse(body);
		else {
			var shape = resp.request.service.api.operations[resp.request.operation].output || {};
			resp.data = new JsonParser$1().parse(body, shape);
		}
	}
	/**
	* @api private
	*/
	module.exports = {
		buildRequest: buildRequest$4,
		extractError: extractError$4,
		extractData: extractData$4
	};
}));

//#endregion
//#region node_modules/aws-sdk/lib/query/query_param_serializer.js
var require_query_param_serializer = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var util$16 = require_util();
	function QueryParamSerializer$1() {}
	QueryParamSerializer$1.prototype.serialize = function(params, shape, fn$1) {
		serializeStructure$1("", params, shape, fn$1);
	};
	function ucfirst(shape) {
		if (shape.isQueryName || shape.api.protocol !== "ec2") return shape.name;
		else return shape.name[0].toUpperCase() + shape.name.substr(1);
	}
	function serializeStructure$1(prefix, struct, rules, fn$1) {
		util$16.each(rules.members, function(name, member) {
			var value = struct[name];
			if (value === null || value === void 0) return;
			var memberName = ucfirst(member);
			memberName = prefix ? prefix + "." + memberName : memberName;
			serializeMember(memberName, value, member, fn$1);
		});
	}
	function serializeMap$1(name, map, rules, fn$1) {
		var i$2 = 1;
		util$16.each(map, function(key, value) {
			var position = (rules.flattened ? "." : ".entry.") + i$2++ + ".";
			var keyName = position + (rules.key.name || "key");
			var valueName = position + (rules.value.name || "value");
			serializeMember(name + keyName, key, rules.key, fn$1);
			serializeMember(name + valueName, value, rules.value, fn$1);
		});
	}
	function serializeList$1(name, list, rules, fn$1) {
		var memberRules = rules.member || {};
		if (list.length === 0) {
			if (rules.api.protocol !== "ec2") fn$1.call(this, name, null);
			return;
		}
		util$16.arrayEach(list, function(v, n) {
			var suffix = "." + (n + 1);
			if (rules.api.protocol === "ec2") suffix = suffix + "";
			else if (rules.flattened) {
				if (memberRules.name) {
					var parts = name.split(".");
					parts.pop();
					parts.push(ucfirst(memberRules));
					name = parts.join(".");
				}
			} else suffix = "." + (memberRules.name ? memberRules.name : "member") + suffix;
			serializeMember(name + suffix, v, memberRules, fn$1);
		});
	}
	function serializeMember(name, value, rules, fn$1) {
		if (value === null || value === void 0) return;
		if (rules.type === "structure") serializeStructure$1(name, value, rules, fn$1);
		else if (rules.type === "list") serializeList$1(name, value, rules, fn$1);
		else if (rules.type === "map") serializeMap$1(name, value, rules, fn$1);
		else fn$1(name, rules.toWireFormat(value).toString());
	}
	/**
	* @api private
	*/
	module.exports = QueryParamSerializer$1;
}));

//#endregion
//#region node_modules/aws-sdk/lib/model/collection.js
var require_collection = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var memoizedProperty$3 = require_util().memoizedProperty;
	function memoize(name, value, factory, nameTr) {
		memoizedProperty$3(this, nameTr(name), function() {
			return factory(name, value);
		});
	}
	function Collection$2(iterable, options, factory, nameTr, callback) {
		nameTr = nameTr || String;
		var self = this;
		for (var id in iterable) if (Object.prototype.hasOwnProperty.call(iterable, id)) {
			memoize.call(self, id, iterable[id], factory, nameTr);
			if (callback) callback(id, iterable[id]);
		}
	}
	/**
	* @api private
	*/
	module.exports = Collection$2;
}));

//#endregion
//#region node_modules/aws-sdk/lib/model/shape.js
var require_shape = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var Collection$1 = require_collection();
	var util$15 = require_util();
	function property$4(obj, name, value) {
		if (value !== null && value !== void 0) util$15.property.apply(this, arguments);
	}
	function memoizedProperty$2(obj, name) {
		if (!obj.constructor.prototype[name]) util$15.memoizedProperty.apply(this, arguments);
	}
	function Shape$4(shape, options, memberName) {
		options = options || {};
		property$4(this, "shape", shape.shape);
		property$4(this, "api", options.api, false);
		property$4(this, "type", shape.type);
		property$4(this, "enum", shape.enum);
		property$4(this, "min", shape.min);
		property$4(this, "max", shape.max);
		property$4(this, "pattern", shape.pattern);
		property$4(this, "location", shape.location || this.location || "body");
		property$4(this, "name", this.name || shape.xmlName || shape.queryName || shape.locationName || memberName);
		property$4(this, "isStreaming", shape.streaming || this.isStreaming || false);
		property$4(this, "requiresLength", shape.requiresLength, false);
		property$4(this, "isComposite", shape.isComposite || false);
		property$4(this, "isShape", true, false);
		property$4(this, "isQueryName", Boolean(shape.queryName), false);
		property$4(this, "isLocationName", Boolean(shape.locationName), false);
		property$4(this, "isIdempotent", shape.idempotencyToken === true);
		property$4(this, "isJsonValue", shape.jsonvalue === true);
		property$4(this, "isSensitive", shape.sensitive === true || shape.prototype && shape.prototype.sensitive === true);
		property$4(this, "isEventStream", Boolean(shape.eventstream), false);
		property$4(this, "isEvent", Boolean(shape.event), false);
		property$4(this, "isEventPayload", Boolean(shape.eventpayload), false);
		property$4(this, "isEventHeader", Boolean(shape.eventheader), false);
		property$4(this, "isTimestampFormatSet", Boolean(shape.timestampFormat) || shape.prototype && shape.prototype.isTimestampFormatSet === true, false);
		property$4(this, "endpointDiscoveryId", Boolean(shape.endpointdiscoveryid), false);
		property$4(this, "hostLabel", Boolean(shape.hostLabel), false);
		if (options.documentation) {
			property$4(this, "documentation", shape.documentation);
			property$4(this, "documentationUrl", shape.documentationUrl);
		}
		if (shape.xmlAttribute) property$4(this, "isXmlAttribute", shape.xmlAttribute || false);
		property$4(this, "defaultValue", null);
		this.toWireFormat = function(value) {
			if (value === null || value === void 0) return "";
			return value;
		};
		this.toType = function(value) {
			return value;
		};
	}
	/**
	* @api private
	*/
	Shape$4.normalizedTypes = {
		character: "string",
		double: "float",
		long: "integer",
		short: "integer",
		biginteger: "integer",
		bigdecimal: "float",
		blob: "binary"
	};
	/**
	* @api private
	*/
	Shape$4.types = {
		"structure": StructureShape,
		"list": ListShape,
		"map": MapShape,
		"boolean": BooleanShape,
		"timestamp": TimestampShape,
		"float": FloatShape,
		"integer": IntegerShape,
		"string": StringShape,
		"base64": Base64Shape,
		"binary": BinaryShape
	};
	Shape$4.resolve = function resolve(shape, options) {
		if (shape.shape) {
			var refShape = options.api.shapes[shape.shape];
			if (!refShape) throw new Error("Cannot find shape reference: " + shape.shape);
			return refShape;
		} else return null;
	};
	Shape$4.create = function create(shape, options, memberName) {
		if (shape.isShape) return shape;
		var refShape = Shape$4.resolve(shape, options);
		if (refShape) {
			var filteredKeys = Object.keys(shape);
			if (!options.documentation) filteredKeys = filteredKeys.filter(function(name) {
				return !name.match(/documentation/);
			});
			var InlineShape = function() {
				refShape.constructor.call(this, shape, options, memberName);
			};
			InlineShape.prototype = refShape;
			return new InlineShape();
		} else {
			if (!shape.type) if (shape.members) shape.type = "structure";
			else if (shape.member) shape.type = "list";
			else if (shape.key) shape.type = "map";
			else shape.type = "string";
			var origType = shape.type;
			if (Shape$4.normalizedTypes[shape.type]) shape.type = Shape$4.normalizedTypes[shape.type];
			if (Shape$4.types[shape.type]) return new Shape$4.types[shape.type](shape, options, memberName);
			else throw new Error("Unrecognized shape type: " + origType);
		}
	};
	function CompositeShape(shape) {
		Shape$4.apply(this, arguments);
		property$4(this, "isComposite", true);
		if (shape.flattened) property$4(this, "flattened", shape.flattened || false);
	}
	function StructureShape(shape, options) {
		var self = this;
		var requiredMap = null, firstInit = !this.isShape;
		CompositeShape.apply(this, arguments);
		if (firstInit) {
			property$4(this, "defaultValue", function() {
				return {};
			});
			property$4(this, "members", {});
			property$4(this, "memberNames", []);
			property$4(this, "required", []);
			property$4(this, "isRequired", function() {
				return false;
			});
			property$4(this, "isDocument", Boolean(shape.document));
		}
		if (shape.members) {
			property$4(this, "members", new Collection$1(shape.members, options, function(name, member) {
				return Shape$4.create(member, options, name);
			}));
			memoizedProperty$2(this, "memberNames", function() {
				return shape.xmlOrder || Object.keys(shape.members);
			});
			if (shape.event) {
				memoizedProperty$2(this, "eventPayloadMemberName", function() {
					var members = self.members;
					var memberNames = self.memberNames;
					for (var i$2 = 0, iLen = memberNames.length; i$2 < iLen; i$2++) if (members[memberNames[i$2]].isEventPayload) return memberNames[i$2];
				});
				memoizedProperty$2(this, "eventHeaderMemberNames", function() {
					var members = self.members;
					var memberNames = self.memberNames;
					var eventHeaderMemberNames = [];
					for (var i$2 = 0, iLen = memberNames.length; i$2 < iLen; i$2++) if (members[memberNames[i$2]].isEventHeader) eventHeaderMemberNames.push(memberNames[i$2]);
					return eventHeaderMemberNames;
				});
			}
		}
		if (shape.required) {
			property$4(this, "required", shape.required);
			property$4(this, "isRequired", function(name) {
				if (!requiredMap) {
					requiredMap = {};
					for (var i$2 = 0; i$2 < shape.required.length; i$2++) requiredMap[shape.required[i$2]] = true;
				}
				return requiredMap[name];
			}, false, true);
		}
		property$4(this, "resultWrapper", shape.resultWrapper || null);
		if (shape.payload) property$4(this, "payload", shape.payload);
		if (typeof shape.xmlNamespace === "string") property$4(this, "xmlNamespaceUri", shape.xmlNamespace);
		else if (typeof shape.xmlNamespace === "object") {
			property$4(this, "xmlNamespacePrefix", shape.xmlNamespace.prefix);
			property$4(this, "xmlNamespaceUri", shape.xmlNamespace.uri);
		}
	}
	function ListShape(shape, options) {
		var self = this, firstInit = !this.isShape;
		CompositeShape.apply(this, arguments);
		if (firstInit) property$4(this, "defaultValue", function() {
			return [];
		});
		if (shape.member) memoizedProperty$2(this, "member", function() {
			return Shape$4.create(shape.member, options);
		});
		if (this.flattened) {
			var oldName = this.name;
			memoizedProperty$2(this, "name", function() {
				return self.member.name || oldName;
			});
		}
	}
	function MapShape(shape, options) {
		var firstInit = !this.isShape;
		CompositeShape.apply(this, arguments);
		if (firstInit) {
			property$4(this, "defaultValue", function() {
				return {};
			});
			property$4(this, "key", Shape$4.create({ type: "string" }, options));
			property$4(this, "value", Shape$4.create({ type: "string" }, options));
		}
		if (shape.key) memoizedProperty$2(this, "key", function() {
			return Shape$4.create(shape.key, options);
		});
		if (shape.value) memoizedProperty$2(this, "value", function() {
			return Shape$4.create(shape.value, options);
		});
	}
	function TimestampShape(shape) {
		var self = this;
		Shape$4.apply(this, arguments);
		if (shape.timestampFormat) property$4(this, "timestampFormat", shape.timestampFormat);
		else if (self.isTimestampFormatSet && this.timestampFormat) property$4(this, "timestampFormat", this.timestampFormat);
		else if (this.location === "header") property$4(this, "timestampFormat", "rfc822");
		else if (this.location === "querystring") property$4(this, "timestampFormat", "iso8601");
		else if (this.api) switch (this.api.protocol) {
			case "json":
			case "rest-json":
				property$4(this, "timestampFormat", "unixTimestamp");
				break;
			case "rest-xml":
			case "query":
			case "ec2":
				property$4(this, "timestampFormat", "iso8601");
				break;
		}
		this.toType = function(value) {
			if (value === null || value === void 0) return null;
			if (typeof value.toUTCString === "function") return value;
			return typeof value === "string" || typeof value === "number" ? util$15.date.parseTimestamp(value) : null;
		};
		this.toWireFormat = function(value) {
			return util$15.date.format(value, self.timestampFormat);
		};
	}
	function StringShape() {
		Shape$4.apply(this, arguments);
		var nullLessProtocols = [
			"rest-xml",
			"query",
			"ec2"
		];
		this.toType = function(value) {
			value = this.api && nullLessProtocols.indexOf(this.api.protocol) > -1 ? value || "" : value;
			if (this.isJsonValue) return JSON.parse(value);
			return value && typeof value.toString === "function" ? value.toString() : value;
		};
		this.toWireFormat = function(value) {
			return this.isJsonValue ? JSON.stringify(value) : value;
		};
	}
	function FloatShape() {
		Shape$4.apply(this, arguments);
		this.toType = function(value) {
			if (value === null || value === void 0) return null;
			return parseFloat(value);
		};
		this.toWireFormat = this.toType;
	}
	function IntegerShape() {
		Shape$4.apply(this, arguments);
		this.toType = function(value) {
			if (value === null || value === void 0) return null;
			return parseInt(value, 10);
		};
		this.toWireFormat = this.toType;
	}
	function BinaryShape() {
		Shape$4.apply(this, arguments);
		this.toType = function(value) {
			var buf = util$15.base64.decode(value);
			if (this.isSensitive && util$15.isNode() && typeof util$15.Buffer.alloc === "function") {
				var secureBuf = util$15.Buffer.alloc(buf.length, buf);
				buf.fill(0);
				buf = secureBuf;
			}
			return buf;
		};
		this.toWireFormat = util$15.base64.encode;
	}
	function Base64Shape() {
		BinaryShape.apply(this, arguments);
	}
	function BooleanShape() {
		Shape$4.apply(this, arguments);
		this.toType = function(value) {
			if (typeof value === "boolean") return value;
			if (value === null || value === void 0) return null;
			return value === "true";
		};
	}
	/**
	* @api private
	*/
	Shape$4.shapes = {
		StructureShape,
		ListShape,
		MapShape,
		StringShape,
		BooleanShape,
		Base64Shape
	};
	/**
	* @api private
	*/
	module.exports = Shape$4;
}));

//#endregion
//#region node_modules/aws-sdk/lib/protocol/query.js
var require_query = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var AWS$36 = require_core();
	var util$14 = require_util();
	var QueryParamSerializer = require_query_param_serializer();
	var Shape$3 = require_shape();
	var populateHostPrefix$1 = require_helpers().populateHostPrefix;
	function buildRequest$3(req) {
		var operation = req.service.api.operations[req.operation];
		var httpRequest = req.httpRequest;
		httpRequest.headers["Content-Type"] = "application/x-www-form-urlencoded; charset=utf-8";
		httpRequest.params = {
			Version: req.service.api.apiVersion,
			Action: operation.name
		};
		new QueryParamSerializer().serialize(req.params, operation.input, function(name, value) {
			httpRequest.params[name] = value;
		});
		httpRequest.body = util$14.queryParamsToString(httpRequest.params);
		populateHostPrefix$1(req);
	}
	function extractError$3(resp) {
		var data, body = resp.httpResponse.body.toString();
		if (body.match("<UnknownOperationException")) data = {
			Code: "UnknownOperation",
			Message: "Unknown operation " + resp.request.operation
		};
		else try {
			data = new AWS$36.XML.Parser().parse(body);
		} catch (e) {
			data = {
				Code: resp.httpResponse.statusCode,
				Message: resp.httpResponse.statusMessage
			};
		}
		if (data.requestId && !resp.requestId) resp.requestId = data.requestId;
		if (data.Errors) data = data.Errors;
		if (data.Error) data = data.Error;
		if (data.Code) resp.error = util$14.error(/* @__PURE__ */ new Error(), {
			code: data.Code,
			message: data.Message
		});
		else resp.error = util$14.error(/* @__PURE__ */ new Error(), {
			code: resp.httpResponse.statusCode,
			message: null
		});
	}
	function extractData$3(resp) {
		var req = resp.request;
		var shape = req.service.api.operations[req.operation].output || {};
		var origRules = shape;
		if (origRules.resultWrapper) {
			var tmp = Shape$3.create({ type: "structure" });
			tmp.members[origRules.resultWrapper] = shape;
			tmp.memberNames = [origRules.resultWrapper];
			util$14.property(shape, "name", shape.resultWrapper);
			shape = tmp;
		}
		var parser = new AWS$36.XML.Parser();
		if (shape && shape.members && !shape.members._XAMZRequestId) {
			var requestIdShape = Shape$3.create({ type: "string" }, { api: { protocol: "query" } }, "requestId");
			shape.members._XAMZRequestId = requestIdShape;
		}
		var data = parser.parse(resp.httpResponse.body.toString(), shape);
		resp.requestId = data._XAMZRequestId || data.requestId;
		if (data._XAMZRequestId) delete data._XAMZRequestId;
		if (origRules.resultWrapper) {
			if (data[origRules.resultWrapper]) {
				util$14.update(data, data[origRules.resultWrapper]);
				delete data[origRules.resultWrapper];
			}
		}
		resp.data = data;
	}
	/**
	* @api private
	*/
	module.exports = {
		buildRequest: buildRequest$3,
		extractError: extractError$3,
		extractData: extractData$3
	};
}));

//#endregion
//#region node_modules/aws-sdk/lib/protocol/rest.js
var require_rest = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var util$13 = require_util();
	var populateHostPrefix = require_helpers().populateHostPrefix;
	function populateMethod(req) {
		req.httpRequest.method = req.service.api.operations[req.operation].httpMethod;
	}
	function generateURI(endpointPath, operationPath, input, params) {
		var uri = [endpointPath, operationPath].join("/");
		uri = uri.replace(/\/+/g, "/");
		var queryString = {}, queryStringSet = false;
		util$13.each(input.members, function(name, member) {
			var paramValue = params[name];
			if (paramValue === null || paramValue === void 0) return;
			if (member.location === "uri") {
				var regex = /* @__PURE__ */ new RegExp("\\{" + member.name + "(\\+)?\\}");
				uri = uri.replace(regex, function(_, plus) {
					return (plus ? util$13.uriEscapePath : util$13.uriEscape)(String(paramValue));
				});
			} else if (member.location === "querystring") {
				queryStringSet = true;
				if (member.type === "list") queryString[member.name] = paramValue.map(function(val) {
					return util$13.uriEscape(member.member.toWireFormat(val).toString());
				});
				else if (member.type === "map") util$13.each(paramValue, function(key, value) {
					if (Array.isArray(value)) queryString[key] = value.map(function(val) {
						return util$13.uriEscape(String(val));
					});
					else queryString[key] = util$13.uriEscape(String(value));
				});
				else queryString[member.name] = util$13.uriEscape(member.toWireFormat(paramValue).toString());
			}
		});
		if (queryStringSet) {
			uri += uri.indexOf("?") >= 0 ? "&" : "?";
			var parts = [];
			util$13.arrayEach(Object.keys(queryString).sort(), function(key) {
				if (!Array.isArray(queryString[key])) queryString[key] = [queryString[key]];
				for (var i$2 = 0; i$2 < queryString[key].length; i$2++) parts.push(util$13.uriEscape(String(key)) + "=" + queryString[key][i$2]);
			});
			uri += parts.join("&");
		}
		return uri;
	}
	function populateURI(req) {
		var operation = req.service.api.operations[req.operation];
		var input = operation.input;
		var uri = generateURI(req.httpRequest.endpoint.path, operation.httpPath, input, req.params);
		req.httpRequest.path = uri;
	}
	function populateHeaders(req) {
		var operation = req.service.api.operations[req.operation];
		util$13.each(operation.input.members, function(name, member) {
			var value = req.params[name];
			if (value === null || value === void 0) return;
			if (member.location === "headers" && member.type === "map") util$13.each(value, function(key, memberValue) {
				req.httpRequest.headers[member.name + key] = memberValue;
			});
			else if (member.location === "header") {
				value = member.toWireFormat(value).toString();
				if (member.isJsonValue) value = util$13.base64.encode(value);
				req.httpRequest.headers[member.name] = value;
			}
		});
	}
	function buildRequest$2(req) {
		populateMethod(req);
		populateURI(req);
		populateHeaders(req);
		populateHostPrefix(req);
	}
	function extractError$2() {}
	function extractData$2(resp) {
		var req = resp.request;
		var data = {};
		var r = resp.httpResponse;
		var output = req.service.api.operations[req.operation].output;
		var headers = {};
		util$13.each(r.headers, function(k, v) {
			headers[k.toLowerCase()] = v;
		});
		util$13.each(output.members, function(name, member) {
			var header = (member.name || name).toLowerCase();
			if (member.location === "headers" && member.type === "map") {
				data[name] = {};
				var location = member.isLocationName ? member.name : "";
				var pattern = new RegExp("^" + location + "(.+)", "i");
				util$13.each(r.headers, function(k, v) {
					var result = k.match(pattern);
					if (result !== null) data[name][result[1]] = v;
				});
			} else if (member.location === "header") {
				if (headers[header] !== void 0) {
					var value = member.isJsonValue ? util$13.base64.decode(headers[header]) : headers[header];
					data[name] = member.toType(value);
				}
			} else if (member.location === "statusCode") data[name] = parseInt(r.statusCode, 10);
		});
		resp.data = data;
	}
	/**
	* @api private
	*/
	module.exports = {
		buildRequest: buildRequest$2,
		extractError: extractError$2,
		extractData: extractData$2,
		generateURI
	};
}));

//#endregion
//#region node_modules/aws-sdk/lib/protocol/rest_json.js
var require_rest_json = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var AWS$35 = require_core();
	var util$12 = require_util();
	var Rest$1 = require_rest();
	var Json = require_json();
	var JsonBuilder = require_builder$1();
	var JsonParser = require_parser();
	var METHODS_WITHOUT_BODY = [
		"GET",
		"HEAD",
		"DELETE"
	];
	function unsetContentLength(req) {
		if (util$12.getRequestPayloadShape(req) === void 0 && METHODS_WITHOUT_BODY.indexOf(req.httpRequest.method) >= 0) delete req.httpRequest.headers["Content-Length"];
	}
	function populateBody$1(req) {
		var builder = new JsonBuilder();
		var input = req.service.api.operations[req.operation].input;
		if (input.payload) {
			var params = {};
			var payloadShape = input.members[input.payload];
			params = req.params[input.payload];
			if (payloadShape.type === "structure") {
				req.httpRequest.body = builder.build(params || {}, payloadShape);
				applyContentTypeHeader(req);
			} else if (params !== void 0) {
				req.httpRequest.body = params;
				if (payloadShape.type === "binary" || payloadShape.isStreaming) applyContentTypeHeader(req, true);
			}
		} else {
			req.httpRequest.body = builder.build(req.params, input);
			applyContentTypeHeader(req);
		}
	}
	function applyContentTypeHeader(req, isBinary) {
		if (!req.httpRequest.headers["Content-Type"]) {
			var type = isBinary ? "binary/octet-stream" : "application/json";
			req.httpRequest.headers["Content-Type"] = type;
		}
	}
	function buildRequest$1(req) {
		Rest$1.buildRequest(req);
		if (METHODS_WITHOUT_BODY.indexOf(req.httpRequest.method) < 0) populateBody$1(req);
	}
	function extractError$1(resp) {
		Json.extractError(resp);
	}
	function extractData$1(resp) {
		Rest$1.extractData(resp);
		var req = resp.request;
		var operation = req.service.api.operations[req.operation];
		var rules = req.service.api.operations[req.operation].output || {};
		var parser;
		operation.hasEventOutput;
		if (rules.payload) {
			var payloadMember = rules.members[rules.payload];
			var body = resp.httpResponse.body;
			if (payloadMember.isEventStream) {
				parser = new JsonParser();
				resp.data[rules.payload] = util$12.createEventStream(AWS$35.HttpClient.streamsApiVersion === 2 ? resp.httpResponse.stream : body, parser, payloadMember);
			} else if (payloadMember.type === "structure" || payloadMember.type === "list") {
				var parser = new JsonParser();
				resp.data[rules.payload] = parser.parse(body, payloadMember);
			} else if (payloadMember.type === "binary" || payloadMember.isStreaming) resp.data[rules.payload] = body;
			else resp.data[rules.payload] = payloadMember.toType(body);
		} else {
			var data = resp.data;
			Json.extractData(resp);
			resp.data = util$12.merge(data, resp.data);
		}
	}
	/**
	* @api private
	*/
	module.exports = {
		buildRequest: buildRequest$1,
		extractError: extractError$1,
		extractData: extractData$1,
		unsetContentLength
	};
}));

//#endregion
//#region node_modules/aws-sdk/lib/protocol/rest_xml.js
var require_rest_xml = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var AWS$34 = require_core();
	var util$11 = require_util();
	var Rest = require_rest();
	function populateBody(req) {
		var input = req.service.api.operations[req.operation].input;
		var builder = new AWS$34.XML.Builder();
		var params = req.params;
		var payload = input.payload;
		if (payload) {
			var payloadMember = input.members[payload];
			params = params[payload];
			if (params === void 0) return;
			if (payloadMember.type === "structure") {
				var rootElement = payloadMember.name;
				req.httpRequest.body = builder.toXML(params, payloadMember, rootElement, true);
			} else req.httpRequest.body = params;
		} else req.httpRequest.body = builder.toXML(params, input, input.name || input.shape || util$11.string.upperFirst(req.operation) + "Request");
	}
	function buildRequest(req) {
		Rest.buildRequest(req);
		if (["GET", "HEAD"].indexOf(req.httpRequest.method) < 0) populateBody(req);
	}
	function extractError(resp) {
		Rest.extractError(resp);
		var data;
		try {
			data = new AWS$34.XML.Parser().parse(resp.httpResponse.body.toString());
		} catch (e) {
			data = {
				Code: resp.httpResponse.statusCode,
				Message: resp.httpResponse.statusMessage
			};
		}
		if (data.Errors) data = data.Errors;
		if (data.Error) data = data.Error;
		if (data.Code) resp.error = util$11.error(/* @__PURE__ */ new Error(), {
			code: data.Code,
			message: data.Message
		});
		else resp.error = util$11.error(/* @__PURE__ */ new Error(), {
			code: resp.httpResponse.statusCode,
			message: null
		});
	}
	function extractData(resp) {
		Rest.extractData(resp);
		var parser;
		var req = resp.request;
		var body = resp.httpResponse.body;
		var operation = req.service.api.operations[req.operation];
		var output = operation.output;
		operation.hasEventOutput;
		var payload = output.payload;
		if (payload) {
			var payloadMember = output.members[payload];
			if (payloadMember.isEventStream) {
				parser = new AWS$34.XML.Parser();
				resp.data[payload] = util$11.createEventStream(AWS$34.HttpClient.streamsApiVersion === 2 ? resp.httpResponse.stream : resp.httpResponse.body, parser, payloadMember);
			} else if (payloadMember.type === "structure") {
				parser = new AWS$34.XML.Parser();
				resp.data[payload] = parser.parse(body.toString(), payloadMember);
			} else if (payloadMember.type === "binary" || payloadMember.isStreaming) resp.data[payload] = body;
			else resp.data[payload] = payloadMember.toType(body);
		} else if (body.length > 0) {
			parser = new AWS$34.XML.Parser();
			var data = parser.parse(body.toString(), output);
			util$11.update(resp.data, data);
		}
	}
	/**
	* @api private
	*/
	module.exports = {
		buildRequest,
		extractError,
		extractData
	};
}));

//#endregion
//#region node_modules/aws-sdk/lib/xml/escape-attribute.js
var require_escape_attribute = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Escapes characters that can not be in an XML attribute.
	*/
	function escapeAttribute$1(value) {
		return value.replace(/&/g, "&amp;").replace(/'/g, "&apos;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
	}
	/**
	* @api private
	*/
	module.exports = { escapeAttribute: escapeAttribute$1 };
}));

//#endregion
//#region node_modules/aws-sdk/lib/xml/xml-node.js
var require_xml_node = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var escapeAttribute = require_escape_attribute().escapeAttribute;
	/**
	* Represents an XML node.
	* @api private
	*/
	function XmlNode$1(name, children) {
		if (children === void 0) children = [];
		this.name = name;
		this.children = children;
		this.attributes = {};
	}
	XmlNode$1.prototype.addAttribute = function(name, value) {
		this.attributes[name] = value;
		return this;
	};
	XmlNode$1.prototype.addChildNode = function(child) {
		this.children.push(child);
		return this;
	};
	XmlNode$1.prototype.removeAttribute = function(name) {
		delete this.attributes[name];
		return this;
	};
	XmlNode$1.prototype.toString = function() {
		var hasChildren = Boolean(this.children.length);
		var xmlText = "<" + this.name;
		var attributes = this.attributes;
		for (var i$2 = 0, attributeNames = Object.keys(attributes); i$2 < attributeNames.length; i$2++) {
			var attributeName = attributeNames[i$2];
			var attribute = attributes[attributeName];
			if (typeof attribute !== "undefined" && attribute !== null) xmlText += " " + attributeName + "=\"" + escapeAttribute("" + attribute) + "\"";
		}
		return xmlText += !hasChildren ? "/>" : ">" + this.children.map(function(c) {
			return c.toString();
		}).join("") + "</" + this.name + ">";
	};
	/**
	* @api private
	*/
	module.exports = { XmlNode: XmlNode$1 };
}));

//#endregion
//#region node_modules/aws-sdk/lib/xml/escape-element.js
var require_escape_element = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Escapes characters that can not be in an XML element.
	*/
	function escapeElement$1(value) {
		return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\r/g, "&#x0D;").replace(/\n/g, "&#x0A;").replace(/\u0085/g, "&#x85;").replace(/\u2028/, "&#x2028;");
	}
	/**
	* @api private
	*/
	module.exports = { escapeElement: escapeElement$1 };
}));

//#endregion
//#region node_modules/aws-sdk/lib/xml/xml-text.js
var require_xml_text = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var escapeElement = require_escape_element().escapeElement;
	/**
	* Represents an XML text value.
	* @api private
	*/
	function XmlText$1(value) {
		this.value = value;
	}
	XmlText$1.prototype.toString = function() {
		return escapeElement("" + this.value);
	};
	/**
	* @api private
	*/
	module.exports = { XmlText: XmlText$1 };
}));

//#endregion
//#region node_modules/aws-sdk/lib/xml/builder.js
var require_builder = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var util$10 = require_util();
	var XmlNode = require_xml_node().XmlNode;
	var XmlText = require_xml_text().XmlText;
	function XmlBuilder() {}
	XmlBuilder.prototype.toXML = function(params, shape, rootElement, noEmpty) {
		var xml = new XmlNode(rootElement);
		applyNamespaces(xml, shape, true);
		serialize(xml, params, shape);
		return xml.children.length > 0 || noEmpty ? xml.toString() : "";
	};
	function serialize(xml, value, shape) {
		switch (shape.type) {
			case "structure": return serializeStructure(xml, value, shape);
			case "map": return serializeMap(xml, value, shape);
			case "list": return serializeList(xml, value, shape);
			default: return serializeScalar(xml, value, shape);
		}
	}
	function serializeStructure(xml, params, shape) {
		util$10.arrayEach(shape.memberNames, function(memberName) {
			var memberShape = shape.members[memberName];
			if (memberShape.location !== "body") return;
			var value = params[memberName];
			var name = memberShape.name;
			if (value !== void 0 && value !== null) if (memberShape.isXmlAttribute) xml.addAttribute(name, value);
			else if (memberShape.flattened) serialize(xml, value, memberShape);
			else {
				var element = new XmlNode(name);
				xml.addChildNode(element);
				applyNamespaces(element, memberShape);
				serialize(element, value, memberShape);
			}
		});
	}
	function serializeMap(xml, map, shape) {
		var xmlKey = shape.key.name || "key";
		var xmlValue = shape.value.name || "value";
		util$10.each(map, function(key, value) {
			var entry = new XmlNode(shape.flattened ? shape.name : "entry");
			xml.addChildNode(entry);
			var entryKey = new XmlNode(xmlKey);
			var entryValue = new XmlNode(xmlValue);
			entry.addChildNode(entryKey);
			entry.addChildNode(entryValue);
			serialize(entryKey, key, shape.key);
			serialize(entryValue, value, shape.value);
		});
	}
	function serializeList(xml, list, shape) {
		if (shape.flattened) util$10.arrayEach(list, function(value) {
			var element = new XmlNode(shape.member.name || shape.name);
			xml.addChildNode(element);
			serialize(element, value, shape.member);
		});
		else util$10.arrayEach(list, function(value) {
			var element = new XmlNode(shape.member.name || "member");
			xml.addChildNode(element);
			serialize(element, value, shape.member);
		});
	}
	function serializeScalar(xml, value, shape) {
		xml.addChildNode(new XmlText(shape.toWireFormat(value)));
	}
	function applyNamespaces(xml, shape, isRoot) {
		var uri, prefix = "xmlns";
		if (shape.xmlNamespaceUri) {
			uri = shape.xmlNamespaceUri;
			if (shape.xmlNamespacePrefix) prefix += ":" + shape.xmlNamespacePrefix;
		} else if (isRoot && shape.api.xmlNamespaceUri) uri = shape.api.xmlNamespaceUri;
		if (uri) xml.addAttribute(prefix, uri);
	}
	/**
	* @api private
	*/
	module.exports = XmlBuilder;
}));

//#endregion
//#region node_modules/aws-sdk/lib/model/operation.js
var require_operation = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var Shape$2 = require_shape();
	var util$9 = require_util();
	var property$3 = util$9.property;
	var memoizedProperty$1 = util$9.memoizedProperty;
	function Operation$1(name, operation, options) {
		var self = this;
		options = options || {};
		property$3(this, "name", operation.name || name);
		property$3(this, "api", options.api, false);
		operation.http = operation.http || {};
		property$3(this, "endpoint", operation.endpoint);
		property$3(this, "httpMethod", operation.http.method || "POST");
		property$3(this, "httpPath", operation.http.requestUri || "/");
		property$3(this, "authtype", operation.authtype || "");
		property$3(this, "endpointDiscoveryRequired", operation.endpointdiscovery ? operation.endpointdiscovery.required ? "REQUIRED" : "OPTIONAL" : "NULL");
		var httpChecksumRequired = operation.httpChecksumRequired || operation.httpChecksum && operation.httpChecksum.requestChecksumRequired;
		property$3(this, "httpChecksumRequired", httpChecksumRequired, false);
		memoizedProperty$1(this, "input", function() {
			if (!operation.input) return new Shape$2.create({ type: "structure" }, options);
			return Shape$2.create(operation.input, options);
		});
		memoizedProperty$1(this, "output", function() {
			if (!operation.output) return new Shape$2.create({ type: "structure" }, options);
			return Shape$2.create(operation.output, options);
		});
		memoizedProperty$1(this, "errors", function() {
			var list = [];
			if (!operation.errors) return null;
			for (var i$2 = 0; i$2 < operation.errors.length; i$2++) list.push(Shape$2.create(operation.errors[i$2], options));
			return list;
		});
		memoizedProperty$1(this, "paginator", function() {
			return options.api.paginators[name];
		});
		if (options.documentation) {
			property$3(this, "documentation", operation.documentation);
			property$3(this, "documentationUrl", operation.documentationUrl);
		}
		memoizedProperty$1(this, "idempotentMembers", function() {
			var idempotentMembers = [];
			var input = self.input;
			var members = input.members;
			if (!input.members) return idempotentMembers;
			for (var name$1 in members) {
				if (!members.hasOwnProperty(name$1)) continue;
				if (members[name$1].isIdempotent === true) idempotentMembers.push(name$1);
			}
			return idempotentMembers;
		});
		memoizedProperty$1(this, "hasEventOutput", function() {
			var output = self.output;
			return hasEventStream(output);
		});
	}
	function hasEventStream(topLevelShape) {
		var members = topLevelShape.members;
		var payload = topLevelShape.payload;
		if (!topLevelShape.members) return false;
		if (payload) return members[payload].isEventStream;
		for (var name in members) if (!members.hasOwnProperty(name)) {
			if (members[name].isEventStream === true) return true;
		}
		return false;
	}
	/**
	* @api private
	*/
	module.exports = Operation$1;
}));

//#endregion
//#region node_modules/aws-sdk/lib/model/paginator.js
var require_paginator = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var property$2 = require_util().property;
	function Paginator$1(name, paginator) {
		property$2(this, "inputToken", paginator.input_token);
		property$2(this, "limitKey", paginator.limit_key);
		property$2(this, "moreResults", paginator.more_results);
		property$2(this, "outputToken", paginator.output_token);
		property$2(this, "resultKey", paginator.result_key);
	}
	/**
	* @api private
	*/
	module.exports = Paginator$1;
}));

//#endregion
//#region node_modules/aws-sdk/lib/model/resource_waiter.js
var require_resource_waiter$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var util$8 = require_util();
	var property$1 = util$8.property;
	function ResourceWaiter$1(name, waiter, options) {
		options = options || {};
		property$1(this, "name", name);
		property$1(this, "api", options.api, false);
		if (waiter.operation) property$1(this, "operation", util$8.string.lowerFirst(waiter.operation));
		var self = this;
		[
			"type",
			"description",
			"delay",
			"maxAttempts",
			"acceptors"
		].forEach(function(key) {
			var value = waiter[key];
			if (value) property$1(self, key, value);
		});
	}
	/**
	* @api private
	*/
	module.exports = ResourceWaiter$1;
}));

//#endregion
//#region node_modules/aws-sdk/apis/metadata.json
var require_metadata = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = {
		"acm": {
			"name": "ACM",
			"cors": true
		},
		"apigateway": {
			"name": "APIGateway",
			"cors": true
		},
		"applicationautoscaling": {
			"prefix": "application-autoscaling",
			"name": "ApplicationAutoScaling",
			"cors": true
		},
		"appstream": { "name": "AppStream" },
		"autoscaling": {
			"name": "AutoScaling",
			"cors": true
		},
		"batch": { "name": "Batch" },
		"budgets": { "name": "Budgets" },
		"clouddirectory": {
			"name": "CloudDirectory",
			"versions": ["2016-05-10*"]
		},
		"cloudformation": {
			"name": "CloudFormation",
			"cors": true
		},
		"cloudfront": {
			"name": "CloudFront",
			"versions": [
				"2013-05-12*",
				"2013-11-11*",
				"2014-05-31*",
				"2014-10-21*",
				"2014-11-06*",
				"2015-04-17*",
				"2015-07-27*",
				"2015-09-17*",
				"2016-01-13*",
				"2016-01-28*",
				"2016-08-01*",
				"2016-08-20*",
				"2016-09-07*",
				"2016-09-29*",
				"2016-11-25*",
				"2017-03-25*",
				"2017-10-30*",
				"2018-06-18*",
				"2018-11-05*",
				"2019-03-26*"
			],
			"cors": true
		},
		"cloudhsm": {
			"name": "CloudHSM",
			"cors": true
		},
		"cloudsearch": { "name": "CloudSearch" },
		"cloudsearchdomain": { "name": "CloudSearchDomain" },
		"cloudtrail": {
			"name": "CloudTrail",
			"cors": true
		},
		"cloudwatch": {
			"prefix": "monitoring",
			"name": "CloudWatch",
			"cors": true
		},
		"cloudwatchevents": {
			"prefix": "events",
			"name": "CloudWatchEvents",
			"versions": ["2014-02-03*"],
			"cors": true
		},
		"cloudwatchlogs": {
			"prefix": "logs",
			"name": "CloudWatchLogs",
			"cors": true
		},
		"codebuild": {
			"name": "CodeBuild",
			"cors": true
		},
		"codecommit": {
			"name": "CodeCommit",
			"cors": true
		},
		"codedeploy": {
			"name": "CodeDeploy",
			"cors": true
		},
		"codepipeline": {
			"name": "CodePipeline",
			"cors": true
		},
		"cognitoidentity": {
			"prefix": "cognito-identity",
			"name": "CognitoIdentity",
			"cors": true
		},
		"cognitoidentityserviceprovider": {
			"prefix": "cognito-idp",
			"name": "CognitoIdentityServiceProvider",
			"cors": true
		},
		"cognitosync": {
			"prefix": "cognito-sync",
			"name": "CognitoSync",
			"cors": true
		},
		"configservice": {
			"prefix": "config",
			"name": "ConfigService",
			"cors": true
		},
		"cur": {
			"name": "CUR",
			"cors": true
		},
		"datapipeline": { "name": "DataPipeline" },
		"devicefarm": {
			"name": "DeviceFarm",
			"cors": true
		},
		"directconnect": {
			"name": "DirectConnect",
			"cors": true
		},
		"directoryservice": {
			"prefix": "ds",
			"name": "DirectoryService"
		},
		"discovery": { "name": "Discovery" },
		"dms": { "name": "DMS" },
		"dynamodb": {
			"name": "DynamoDB",
			"cors": true
		},
		"dynamodbstreams": {
			"prefix": "streams.dynamodb",
			"name": "DynamoDBStreams",
			"cors": true
		},
		"ec2": {
			"name": "EC2",
			"versions": [
				"2013-06-15*",
				"2013-10-15*",
				"2014-02-01*",
				"2014-05-01*",
				"2014-06-15*",
				"2014-09-01*",
				"2014-10-01*",
				"2015-03-01*",
				"2015-04-15*",
				"2015-10-01*",
				"2016-04-01*",
				"2016-09-15*"
			],
			"cors": true
		},
		"ecr": {
			"name": "ECR",
			"cors": true
		},
		"ecs": {
			"name": "ECS",
			"cors": true
		},
		"efs": {
			"prefix": "elasticfilesystem",
			"name": "EFS",
			"cors": true
		},
		"elasticache": {
			"name": "ElastiCache",
			"versions": [
				"2012-11-15*",
				"2014-03-24*",
				"2014-07-15*",
				"2014-09-30*"
			],
			"cors": true
		},
		"elasticbeanstalk": {
			"name": "ElasticBeanstalk",
			"cors": true
		},
		"elb": {
			"prefix": "elasticloadbalancing",
			"name": "ELB",
			"cors": true
		},
		"elbv2": {
			"prefix": "elasticloadbalancingv2",
			"name": "ELBv2",
			"cors": true
		},
		"emr": {
			"prefix": "elasticmapreduce",
			"name": "EMR",
			"cors": true
		},
		"es": { "name": "ES" },
		"elastictranscoder": {
			"name": "ElasticTranscoder",
			"cors": true
		},
		"firehose": {
			"name": "Firehose",
			"cors": true
		},
		"gamelift": {
			"name": "GameLift",
			"cors": true
		},
		"glacier": { "name": "Glacier" },
		"health": { "name": "Health" },
		"iam": {
			"name": "IAM",
			"cors": true
		},
		"importexport": { "name": "ImportExport" },
		"inspector": {
			"name": "Inspector",
			"versions": ["2015-08-18*"],
			"cors": true
		},
		"iot": {
			"name": "Iot",
			"cors": true
		},
		"iotdata": {
			"prefix": "iot-data",
			"name": "IotData",
			"cors": true
		},
		"kinesis": {
			"name": "Kinesis",
			"cors": true
		},
		"kinesisanalytics": { "name": "KinesisAnalytics" },
		"kms": {
			"name": "KMS",
			"cors": true
		},
		"lambda": {
			"name": "Lambda",
			"cors": true
		},
		"lexruntime": {
			"prefix": "runtime.lex",
			"name": "LexRuntime",
			"cors": true
		},
		"lightsail": { "name": "Lightsail" },
		"machinelearning": {
			"name": "MachineLearning",
			"cors": true
		},
		"marketplacecommerceanalytics": {
			"name": "MarketplaceCommerceAnalytics",
			"cors": true
		},
		"marketplacemetering": {
			"prefix": "meteringmarketplace",
			"name": "MarketplaceMetering"
		},
		"mturk": {
			"prefix": "mturk-requester",
			"name": "MTurk",
			"cors": true
		},
		"mobileanalytics": {
			"name": "MobileAnalytics",
			"cors": true
		},
		"opsworks": {
			"name": "OpsWorks",
			"cors": true
		},
		"opsworkscm": { "name": "OpsWorksCM" },
		"organizations": { "name": "Organizations" },
		"pinpoint": { "name": "Pinpoint" },
		"polly": {
			"name": "Polly",
			"cors": true
		},
		"rds": {
			"name": "RDS",
			"versions": ["2014-09-01*"],
			"cors": true
		},
		"redshift": {
			"name": "Redshift",
			"cors": true
		},
		"rekognition": {
			"name": "Rekognition",
			"cors": true
		},
		"resourcegroupstaggingapi": { "name": "ResourceGroupsTaggingAPI" },
		"route53": {
			"name": "Route53",
			"cors": true
		},
		"route53domains": {
			"name": "Route53Domains",
			"cors": true
		},
		"s3": {
			"name": "S3",
			"dualstackAvailable": true,
			"cors": true
		},
		"s3control": {
			"name": "S3Control",
			"dualstackAvailable": true,
			"xmlNoDefaultLists": true
		},
		"servicecatalog": {
			"name": "ServiceCatalog",
			"cors": true
		},
		"ses": {
			"prefix": "email",
			"name": "SES",
			"cors": true
		},
		"shield": { "name": "Shield" },
		"simpledb": {
			"prefix": "sdb",
			"name": "SimpleDB"
		},
		"sms": { "name": "SMS" },
		"snowball": { "name": "Snowball" },
		"sns": {
			"name": "SNS",
			"cors": true
		},
		"sqs": {
			"name": "SQS",
			"cors": true
		},
		"ssm": {
			"name": "SSM",
			"cors": true
		},
		"storagegateway": {
			"name": "StorageGateway",
			"cors": true
		},
		"stepfunctions": {
			"prefix": "states",
			"name": "StepFunctions"
		},
		"sts": {
			"name": "STS",
			"cors": true
		},
		"support": { "name": "Support" },
		"swf": { "name": "SWF" },
		"xray": {
			"name": "XRay",
			"cors": true
		},
		"waf": {
			"name": "WAF",
			"cors": true
		},
		"wafregional": {
			"prefix": "waf-regional",
			"name": "WAFRegional"
		},
		"workdocs": {
			"name": "WorkDocs",
			"cors": true
		},
		"workspaces": { "name": "WorkSpaces" },
		"lexmodelbuildingservice": {
			"prefix": "lex-models",
			"name": "LexModelBuildingService",
			"cors": true
		},
		"marketplaceentitlementservice": {
			"prefix": "entitlement.marketplace",
			"name": "MarketplaceEntitlementService"
		},
		"athena": {
			"name": "Athena",
			"cors": true
		},
		"greengrass": { "name": "Greengrass" },
		"dax": { "name": "DAX" },
		"migrationhub": {
			"prefix": "AWSMigrationHub",
			"name": "MigrationHub"
		},
		"cloudhsmv2": {
			"name": "CloudHSMV2",
			"cors": true
		},
		"glue": { "name": "Glue" },
		"pricing": {
			"name": "Pricing",
			"cors": true
		},
		"costexplorer": {
			"prefix": "ce",
			"name": "CostExplorer",
			"cors": true
		},
		"mediaconvert": { "name": "MediaConvert" },
		"medialive": { "name": "MediaLive" },
		"mediapackage": { "name": "MediaPackage" },
		"mediastore": { "name": "MediaStore" },
		"mediastoredata": {
			"prefix": "mediastore-data",
			"name": "MediaStoreData",
			"cors": true
		},
		"appsync": { "name": "AppSync" },
		"guardduty": { "name": "GuardDuty" },
		"mq": { "name": "MQ" },
		"comprehend": {
			"name": "Comprehend",
			"cors": true
		},
		"iotjobsdataplane": {
			"prefix": "iot-jobs-data",
			"name": "IoTJobsDataPlane"
		},
		"kinesisvideoarchivedmedia": {
			"prefix": "kinesis-video-archived-media",
			"name": "KinesisVideoArchivedMedia",
			"cors": true
		},
		"kinesisvideomedia": {
			"prefix": "kinesis-video-media",
			"name": "KinesisVideoMedia",
			"cors": true
		},
		"kinesisvideo": {
			"name": "KinesisVideo",
			"cors": true
		},
		"sagemakerruntime": {
			"prefix": "runtime.sagemaker",
			"name": "SageMakerRuntime"
		},
		"sagemaker": { "name": "SageMaker" },
		"translate": {
			"name": "Translate",
			"cors": true
		},
		"resourcegroups": {
			"prefix": "resource-groups",
			"name": "ResourceGroups",
			"cors": true
		},
		"cloud9": { "name": "Cloud9" },
		"serverlessapplicationrepository": {
			"prefix": "serverlessrepo",
			"name": "ServerlessApplicationRepository"
		},
		"servicediscovery": { "name": "ServiceDiscovery" },
		"workmail": { "name": "WorkMail" },
		"autoscalingplans": {
			"prefix": "autoscaling-plans",
			"name": "AutoScalingPlans"
		},
		"transcribeservice": {
			"prefix": "transcribe",
			"name": "TranscribeService"
		},
		"connect": {
			"name": "Connect",
			"cors": true
		},
		"acmpca": {
			"prefix": "acm-pca",
			"name": "ACMPCA"
		},
		"fms": { "name": "FMS" },
		"secretsmanager": {
			"name": "SecretsManager",
			"cors": true
		},
		"iotanalytics": {
			"name": "IoTAnalytics",
			"cors": true
		},
		"iot1clickdevicesservice": {
			"prefix": "iot1click-devices",
			"name": "IoT1ClickDevicesService"
		},
		"iot1clickprojects": {
			"prefix": "iot1click-projects",
			"name": "IoT1ClickProjects"
		},
		"pi": { "name": "PI" },
		"neptune": { "name": "Neptune" },
		"mediatailor": { "name": "MediaTailor" },
		"eks": { "name": "EKS" },
		"dlm": { "name": "DLM" },
		"signer": { "name": "Signer" },
		"chime": { "name": "Chime" },
		"pinpointemail": {
			"prefix": "pinpoint-email",
			"name": "PinpointEmail"
		},
		"ram": { "name": "RAM" },
		"route53resolver": { "name": "Route53Resolver" },
		"pinpointsmsvoice": {
			"prefix": "sms-voice",
			"name": "PinpointSMSVoice"
		},
		"quicksight": { "name": "QuickSight" },
		"rdsdataservice": {
			"prefix": "rds-data",
			"name": "RDSDataService"
		},
		"amplify": { "name": "Amplify" },
		"datasync": { "name": "DataSync" },
		"robomaker": { "name": "RoboMaker" },
		"transfer": { "name": "Transfer" },
		"globalaccelerator": { "name": "GlobalAccelerator" },
		"comprehendmedical": {
			"name": "ComprehendMedical",
			"cors": true
		},
		"kinesisanalyticsv2": { "name": "KinesisAnalyticsV2" },
		"mediaconnect": { "name": "MediaConnect" },
		"fsx": { "name": "FSx" },
		"securityhub": { "name": "SecurityHub" },
		"appmesh": {
			"name": "AppMesh",
			"versions": ["2018-10-01*"]
		},
		"licensemanager": {
			"prefix": "license-manager",
			"name": "LicenseManager"
		},
		"kafka": { "name": "Kafka" },
		"apigatewaymanagementapi": { "name": "ApiGatewayManagementApi" },
		"apigatewayv2": { "name": "ApiGatewayV2" },
		"docdb": { "name": "DocDB" },
		"backup": { "name": "Backup" },
		"worklink": { "name": "WorkLink" },
		"textract": { "name": "Textract" },
		"managedblockchain": { "name": "ManagedBlockchain" },
		"mediapackagevod": {
			"prefix": "mediapackage-vod",
			"name": "MediaPackageVod"
		},
		"groundstation": { "name": "GroundStation" },
		"iotthingsgraph": { "name": "IoTThingsGraph" },
		"iotevents": { "name": "IoTEvents" },
		"ioteventsdata": {
			"prefix": "iotevents-data",
			"name": "IoTEventsData"
		},
		"personalize": {
			"name": "Personalize",
			"cors": true
		},
		"personalizeevents": {
			"prefix": "personalize-events",
			"name": "PersonalizeEvents",
			"cors": true
		},
		"personalizeruntime": {
			"prefix": "personalize-runtime",
			"name": "PersonalizeRuntime",
			"cors": true
		},
		"applicationinsights": {
			"prefix": "application-insights",
			"name": "ApplicationInsights"
		},
		"servicequotas": {
			"prefix": "service-quotas",
			"name": "ServiceQuotas"
		},
		"ec2instanceconnect": {
			"prefix": "ec2-instance-connect",
			"name": "EC2InstanceConnect"
		},
		"eventbridge": { "name": "EventBridge" },
		"lakeformation": { "name": "LakeFormation" },
		"forecastservice": {
			"prefix": "forecast",
			"name": "ForecastService",
			"cors": true
		},
		"forecastqueryservice": {
			"prefix": "forecastquery",
			"name": "ForecastQueryService",
			"cors": true
		},
		"qldb": { "name": "QLDB" },
		"qldbsession": {
			"prefix": "qldb-session",
			"name": "QLDBSession"
		},
		"workmailmessageflow": { "name": "WorkMailMessageFlow" },
		"codestarnotifications": {
			"prefix": "codestar-notifications",
			"name": "CodeStarNotifications"
		},
		"savingsplans": { "name": "SavingsPlans" },
		"sso": { "name": "SSO" },
		"ssooidc": {
			"prefix": "sso-oidc",
			"name": "SSOOIDC"
		},
		"marketplacecatalog": {
			"prefix": "marketplace-catalog",
			"name": "MarketplaceCatalog",
			"cors": true
		},
		"dataexchange": { "name": "DataExchange" },
		"sesv2": { "name": "SESV2" },
		"migrationhubconfig": {
			"prefix": "migrationhub-config",
			"name": "MigrationHubConfig"
		},
		"connectparticipant": { "name": "ConnectParticipant" },
		"appconfig": { "name": "AppConfig" },
		"iotsecuretunneling": { "name": "IoTSecureTunneling" },
		"wafv2": { "name": "WAFV2" },
		"elasticinference": {
			"prefix": "elastic-inference",
			"name": "ElasticInference"
		},
		"imagebuilder": { "name": "Imagebuilder" },
		"schemas": { "name": "Schemas" },
		"accessanalyzer": { "name": "AccessAnalyzer" },
		"codegurureviewer": {
			"prefix": "codeguru-reviewer",
			"name": "CodeGuruReviewer"
		},
		"codeguruprofiler": { "name": "CodeGuruProfiler" },
		"computeoptimizer": {
			"prefix": "compute-optimizer",
			"name": "ComputeOptimizer"
		},
		"frauddetector": { "name": "FraudDetector" },
		"kendra": { "name": "Kendra" },
		"networkmanager": { "name": "NetworkManager" },
		"outposts": { "name": "Outposts" },
		"augmentedairuntime": {
			"prefix": "sagemaker-a2i-runtime",
			"name": "AugmentedAIRuntime"
		},
		"ebs": { "name": "EBS" },
		"kinesisvideosignalingchannels": {
			"prefix": "kinesis-video-signaling",
			"name": "KinesisVideoSignalingChannels",
			"cors": true
		},
		"detective": { "name": "Detective" },
		"codestarconnections": {
			"prefix": "codestar-connections",
			"name": "CodeStarconnections"
		},
		"synthetics": { "name": "Synthetics" },
		"iotsitewise": { "name": "IoTSiteWise" },
		"macie2": { "name": "Macie2" },
		"codeartifact": { "name": "CodeArtifact" },
		"ivs": { "name": "IVS" },
		"braket": { "name": "Braket" },
		"identitystore": { "name": "IdentityStore" },
		"appflow": { "name": "Appflow" },
		"redshiftdata": {
			"prefix": "redshift-data",
			"name": "RedshiftData"
		},
		"ssoadmin": {
			"prefix": "sso-admin",
			"name": "SSOAdmin"
		},
		"timestreamquery": {
			"prefix": "timestream-query",
			"name": "TimestreamQuery"
		},
		"timestreamwrite": {
			"prefix": "timestream-write",
			"name": "TimestreamWrite"
		},
		"s3outposts": { "name": "S3Outposts" },
		"databrew": { "name": "DataBrew" },
		"servicecatalogappregistry": {
			"prefix": "servicecatalog-appregistry",
			"name": "ServiceCatalogAppRegistry"
		},
		"networkfirewall": {
			"prefix": "network-firewall",
			"name": "NetworkFirewall"
		},
		"mwaa": { "name": "MWAA" },
		"amplifybackend": { "name": "AmplifyBackend" },
		"appintegrations": { "name": "AppIntegrations" },
		"connectcontactlens": {
			"prefix": "connect-contact-lens",
			"name": "ConnectContactLens"
		},
		"devopsguru": {
			"prefix": "devops-guru",
			"name": "DevOpsGuru"
		},
		"ecrpublic": {
			"prefix": "ecr-public",
			"name": "ECRPUBLIC"
		},
		"lookoutvision": { "name": "LookoutVision" },
		"sagemakerfeaturestoreruntime": {
			"prefix": "sagemaker-featurestore-runtime",
			"name": "SageMakerFeatureStoreRuntime"
		},
		"customerprofiles": {
			"prefix": "customer-profiles",
			"name": "CustomerProfiles"
		},
		"auditmanager": { "name": "AuditManager" },
		"emrcontainers": {
			"prefix": "emr-containers",
			"name": "EMRcontainers"
		},
		"healthlake": { "name": "HealthLake" },
		"sagemakeredge": {
			"prefix": "sagemaker-edge",
			"name": "SagemakerEdge"
		},
		"amp": {
			"name": "Amp",
			"cors": true
		},
		"greengrassv2": { "name": "GreengrassV2" },
		"iotdeviceadvisor": { "name": "IotDeviceAdvisor" },
		"iotfleethub": { "name": "IoTFleetHub" },
		"iotwireless": { "name": "IoTWireless" },
		"location": {
			"name": "Location",
			"cors": true
		},
		"wellarchitected": { "name": "WellArchitected" },
		"lexmodelsv2": {
			"prefix": "models.lex.v2",
			"name": "LexModelsV2"
		},
		"lexruntimev2": {
			"prefix": "runtime.lex.v2",
			"name": "LexRuntimeV2",
			"cors": true
		},
		"fis": { "name": "Fis" },
		"lookoutmetrics": { "name": "LookoutMetrics" },
		"mgn": { "name": "Mgn" },
		"lookoutequipment": { "name": "LookoutEquipment" },
		"nimble": { "name": "Nimble" },
		"finspace": { "name": "Finspace" },
		"finspacedata": {
			"prefix": "finspace-data",
			"name": "Finspacedata"
		},
		"ssmcontacts": {
			"prefix": "ssm-contacts",
			"name": "SSMContacts"
		},
		"ssmincidents": {
			"prefix": "ssm-incidents",
			"name": "SSMIncidents"
		},
		"applicationcostprofiler": { "name": "ApplicationCostProfiler" },
		"apprunner": { "name": "AppRunner" },
		"proton": { "name": "Proton" },
		"route53recoverycluster": {
			"prefix": "route53-recovery-cluster",
			"name": "Route53RecoveryCluster"
		},
		"route53recoverycontrolconfig": {
			"prefix": "route53-recovery-control-config",
			"name": "Route53RecoveryControlConfig"
		},
		"route53recoveryreadiness": {
			"prefix": "route53-recovery-readiness",
			"name": "Route53RecoveryReadiness"
		},
		"chimesdkidentity": {
			"prefix": "chime-sdk-identity",
			"name": "ChimeSDKIdentity"
		},
		"chimesdkmessaging": {
			"prefix": "chime-sdk-messaging",
			"name": "ChimeSDKMessaging"
		},
		"snowdevicemanagement": {
			"prefix": "snow-device-management",
			"name": "SnowDeviceManagement"
		},
		"memorydb": { "name": "MemoryDB" },
		"opensearch": { "name": "OpenSearch" },
		"kafkaconnect": { "name": "KafkaConnect" },
		"voiceid": {
			"prefix": "voice-id",
			"name": "VoiceID"
		},
		"wisdom": { "name": "Wisdom" },
		"account": { "name": "Account" },
		"cloudcontrol": { "name": "CloudControl" },
		"grafana": { "name": "Grafana" },
		"panorama": { "name": "Panorama" },
		"chimesdkmeetings": {
			"prefix": "chime-sdk-meetings",
			"name": "ChimeSDKMeetings"
		},
		"resiliencehub": { "name": "Resiliencehub" },
		"migrationhubstrategy": { "name": "MigrationHubStrategy" },
		"appconfigdata": { "name": "AppConfigData" },
		"drs": { "name": "Drs" },
		"migrationhubrefactorspaces": {
			"prefix": "migration-hub-refactor-spaces",
			"name": "MigrationHubRefactorSpaces"
		},
		"evidently": { "name": "Evidently" },
		"inspector2": { "name": "Inspector2" },
		"rbin": { "name": "Rbin" },
		"rum": { "name": "RUM" },
		"backupgateway": {
			"prefix": "backup-gateway",
			"name": "BackupGateway"
		},
		"iottwinmaker": { "name": "IoTTwinMaker" },
		"workspacesweb": {
			"prefix": "workspaces-web",
			"name": "WorkSpacesWeb"
		},
		"amplifyuibuilder": { "name": "AmplifyUIBuilder" },
		"keyspaces": { "name": "Keyspaces" },
		"billingconductor": { "name": "Billingconductor" },
		"pinpointsmsvoicev2": {
			"prefix": "pinpoint-sms-voice-v2",
			"name": "PinpointSMSVoiceV2"
		},
		"ivschat": { "name": "Ivschat" },
		"chimesdkmediapipelines": {
			"prefix": "chime-sdk-media-pipelines",
			"name": "ChimeSDKMediaPipelines"
		},
		"emrserverless": {
			"prefix": "emr-serverless",
			"name": "EMRServerless"
		},
		"m2": { "name": "M2" },
		"connectcampaigns": { "name": "ConnectCampaigns" },
		"redshiftserverless": {
			"prefix": "redshift-serverless",
			"name": "RedshiftServerless"
		},
		"rolesanywhere": { "name": "RolesAnywhere" },
		"licensemanagerusersubscriptions": {
			"prefix": "license-manager-user-subscriptions",
			"name": "LicenseManagerUserSubscriptions"
		},
		"privatenetworks": { "name": "PrivateNetworks" },
		"supportapp": {
			"prefix": "support-app",
			"name": "SupportApp"
		},
		"controltower": { "name": "ControlTower" },
		"iotfleetwise": { "name": "IoTFleetWise" },
		"migrationhuborchestrator": { "name": "MigrationHubOrchestrator" },
		"connectcases": { "name": "ConnectCases" },
		"resourceexplorer2": {
			"prefix": "resource-explorer-2",
			"name": "ResourceExplorer2"
		},
		"scheduler": { "name": "Scheduler" },
		"chimesdkvoice": {
			"prefix": "chime-sdk-voice",
			"name": "ChimeSDKVoice"
		},
		"ssmsap": {
			"prefix": "ssm-sap",
			"name": "SsmSap"
		},
		"oam": { "name": "OAM" },
		"arczonalshift": {
			"prefix": "arc-zonal-shift",
			"name": "ARCZonalShift"
		},
		"omics": { "name": "Omics" },
		"opensearchserverless": { "name": "OpenSearchServerless" },
		"securitylake": { "name": "SecurityLake" },
		"simspaceweaver": { "name": "SimSpaceWeaver" },
		"docdbelastic": {
			"prefix": "docdb-elastic",
			"name": "DocDBElastic"
		},
		"sagemakergeospatial": {
			"prefix": "sagemaker-geospatial",
			"name": "SageMakerGeospatial"
		},
		"codecatalyst": { "name": "CodeCatalyst" },
		"pipes": { "name": "Pipes" },
		"sagemakermetrics": {
			"prefix": "sagemaker-metrics",
			"name": "SageMakerMetrics"
		},
		"kinesisvideowebrtcstorage": {
			"prefix": "kinesis-video-webrtc-storage",
			"name": "KinesisVideoWebRTCStorage"
		},
		"licensemanagerlinuxsubscriptions": {
			"prefix": "license-manager-linux-subscriptions",
			"name": "LicenseManagerLinuxSubscriptions"
		},
		"kendraranking": {
			"prefix": "kendra-ranking",
			"name": "KendraRanking"
		},
		"cleanrooms": { "name": "CleanRooms" },
		"cloudtraildata": {
			"prefix": "cloudtrail-data",
			"name": "CloudTrailData"
		},
		"tnb": { "name": "Tnb" },
		"internetmonitor": { "name": "InternetMonitor" },
		"ivsrealtime": {
			"prefix": "ivs-realtime",
			"name": "IVSRealTime"
		},
		"vpclattice": {
			"prefix": "vpc-lattice",
			"name": "VPCLattice"
		},
		"osis": { "name": "OSIS" },
		"mediapackagev2": { "name": "MediaPackageV2" },
		"paymentcryptography": {
			"prefix": "payment-cryptography",
			"name": "PaymentCryptography"
		},
		"paymentcryptographydata": {
			"prefix": "payment-cryptography-data",
			"name": "PaymentCryptographyData"
		},
		"codegurusecurity": {
			"prefix": "codeguru-security",
			"name": "CodeGuruSecurity"
		},
		"verifiedpermissions": { "name": "VerifiedPermissions" },
		"appfabric": { "name": "AppFabric" },
		"medicalimaging": {
			"prefix": "medical-imaging",
			"name": "MedicalImaging"
		},
		"entityresolution": { "name": "EntityResolution" },
		"managedblockchainquery": {
			"prefix": "managedblockchain-query",
			"name": "ManagedBlockchainQuery"
		},
		"neptunedata": { "name": "Neptunedata" },
		"pcaconnectorad": {
			"prefix": "pca-connector-ad",
			"name": "PcaConnectorAd"
		},
		"bedrock": { "name": "Bedrock" },
		"bedrockruntime": {
			"prefix": "bedrock-runtime",
			"name": "BedrockRuntime"
		},
		"datazone": { "name": "DataZone" },
		"launchwizard": {
			"prefix": "launch-wizard",
			"name": "LaunchWizard"
		},
		"trustedadvisor": { "name": "TrustedAdvisor" },
		"inspectorscan": {
			"prefix": "inspector-scan",
			"name": "InspectorScan"
		},
		"bcmdataexports": {
			"prefix": "bcm-data-exports",
			"name": "BCMDataExports"
		},
		"costoptimizationhub": {
			"prefix": "cost-optimization-hub",
			"name": "CostOptimizationHub"
		},
		"eksauth": {
			"prefix": "eks-auth",
			"name": "EKSAuth"
		},
		"freetier": { "name": "FreeTier" },
		"repostspace": { "name": "Repostspace" },
		"workspacesthinclient": {
			"prefix": "workspaces-thin-client",
			"name": "WorkSpacesThinClient"
		},
		"b2bi": { "name": "B2bi" },
		"bedrockagent": {
			"prefix": "bedrock-agent",
			"name": "BedrockAgent"
		},
		"bedrockagentruntime": {
			"prefix": "bedrock-agent-runtime",
			"name": "BedrockAgentRuntime"
		},
		"qbusiness": { "name": "QBusiness" },
		"qconnect": { "name": "QConnect" },
		"cleanroomsml": { "name": "CleanRoomsML" },
		"marketplaceagreement": {
			"prefix": "marketplace-agreement",
			"name": "MarketplaceAgreement"
		},
		"marketplacedeployment": {
			"prefix": "marketplace-deployment",
			"name": "MarketplaceDeployment"
		},
		"networkmonitor": { "name": "NetworkMonitor" },
		"supplychain": { "name": "SupplyChain" },
		"artifact": { "name": "Artifact" },
		"chatbot": { "name": "Chatbot" },
		"timestreaminfluxdb": {
			"prefix": "timestream-influxdb",
			"name": "TimestreamInfluxDB"
		},
		"codeconnections": { "name": "CodeConnections" },
		"deadline": { "name": "Deadline" },
		"controlcatalog": { "name": "ControlCatalog" },
		"route53profiles": { "name": "Route53Profiles" },
		"mailmanager": { "name": "MailManager" },
		"taxsettings": { "name": "TaxSettings" },
		"applicationsignals": {
			"prefix": "application-signals",
			"name": "ApplicationSignals"
		},
		"pcaconnectorscep": {
			"prefix": "pca-connector-scep",
			"name": "PcaConnectorScep"
		},
		"apptest": { "name": "AppTest" },
		"qapps": { "name": "QApps" },
		"ssmquicksetup": {
			"prefix": "ssm-quicksetup",
			"name": "SSMQuickSetup"
		},
		"pcs": { "name": "PCS" }
	};
}));

//#endregion
//#region node_modules/aws-sdk/lib/model/api.js
var require_api = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var Collection = require_collection();
	var Operation = require_operation();
	var Shape$1 = require_shape();
	var Paginator = require_paginator();
	var ResourceWaiter = require_resource_waiter$1();
	var metadata = require_metadata();
	var util$7 = require_util();
	var property = util$7.property;
	var memoizedProperty = util$7.memoizedProperty;
	function Api$1(api, options) {
		var self = this;
		api = api || {};
		options = options || {};
		options.api = this;
		api.metadata = api.metadata || {};
		var serviceIdentifier = options.serviceIdentifier;
		delete options.serviceIdentifier;
		property(this, "isApi", true, false);
		property(this, "apiVersion", api.metadata.apiVersion);
		property(this, "endpointPrefix", api.metadata.endpointPrefix);
		property(this, "signingName", api.metadata.signingName);
		property(this, "globalEndpoint", api.metadata.globalEndpoint);
		property(this, "signatureVersion", api.metadata.signatureVersion);
		property(this, "jsonVersion", api.metadata.jsonVersion);
		property(this, "targetPrefix", api.metadata.targetPrefix);
		property(this, "protocol", api.metadata.protocol);
		property(this, "timestampFormat", api.metadata.timestampFormat);
		property(this, "xmlNamespaceUri", api.metadata.xmlNamespace);
		property(this, "abbreviation", api.metadata.serviceAbbreviation);
		property(this, "fullName", api.metadata.serviceFullName);
		property(this, "serviceId", api.metadata.serviceId);
		if (serviceIdentifier && metadata[serviceIdentifier]) property(this, "xmlNoDefaultLists", metadata[serviceIdentifier].xmlNoDefaultLists, false);
		memoizedProperty(this, "className", function() {
			var name = api.metadata.serviceAbbreviation || api.metadata.serviceFullName;
			if (!name) return null;
			name = name.replace(/^Amazon|AWS\s*|\(.*|\s+|\W+/g, "");
			if (name === "ElasticLoadBalancing") name = "ELB";
			return name;
		});
		function addEndpointOperation(name, operation) {
			if (operation.endpointoperation === true) property(self, "endpointOperation", util$7.string.lowerFirst(name));
			if (operation.endpointdiscovery && !self.hasRequiredEndpointDiscovery) property(self, "hasRequiredEndpointDiscovery", operation.endpointdiscovery.required === true);
		}
		property(this, "operations", new Collection(api.operations, options, function(name, operation) {
			return new Operation(name, operation, options);
		}, util$7.string.lowerFirst, addEndpointOperation));
		property(this, "shapes", new Collection(api.shapes, options, function(name, shape) {
			return Shape$1.create(shape, options);
		}));
		property(this, "paginators", new Collection(api.paginators, options, function(name, paginator) {
			return new Paginator(name, paginator, options);
		}));
		property(this, "waiters", new Collection(api.waiters, options, function(name, waiter) {
			return new ResourceWaiter(name, waiter, options);
		}, util$7.string.lowerFirst));
		if (options.documentation) {
			property(this, "documentation", api.documentation);
			property(this, "documentationUrl", api.documentationUrl);
		}
		property(this, "awsQueryCompatible", api.metadata.awsQueryCompatible);
	}
	/**
	* @api private
	*/
	module.exports = Api$1;
}));

//#endregion
//#region node_modules/aws-sdk/lib/api_loader.js
var require_api_loader = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	function apiLoader$2(svc, version) {
		if (!apiLoader$2.services.hasOwnProperty(svc)) throw new Error("InvalidService: Failed to load api for " + svc);
		return apiLoader$2.services[svc][version];
	}
	/**
	* @api private
	*
	* This member of AWS.apiLoader is private, but changing it will necessitate a
	* change to ../scripts/services-table-generator.ts
	*/
	apiLoader$2.services = {};
	/**
	* @api private
	*/
	module.exports = apiLoader$2;
}));

//#endregion
//#region node_modules/aws-sdk/vendor/endpoint-cache/utils/LRU.js
var require_LRU = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var LinkedListNode = function() {
		function LinkedListNode$1(key, value) {
			this.key = key;
			this.value = value;
		}
		return LinkedListNode$1;
	}();
	var LRUCache = function() {
		function LRUCache$1(size) {
			this.nodeMap = {};
			this.size = 0;
			if (typeof size !== "number" || size < 1) throw new Error("Cache size can only be positive number");
			this.sizeLimit = size;
		}
		Object.defineProperty(LRUCache$1.prototype, "length", {
			get: function() {
				return this.size;
			},
			enumerable: true,
			configurable: true
		});
		LRUCache$1.prototype.prependToList = function(node) {
			if (!this.headerNode) this.tailNode = node;
			else {
				this.headerNode.prev = node;
				node.next = this.headerNode;
			}
			this.headerNode = node;
			this.size++;
		};
		LRUCache$1.prototype.removeFromTail = function() {
			if (!this.tailNode) return;
			var node = this.tailNode;
			var prevNode = node.prev;
			if (prevNode) prevNode.next = void 0;
			node.prev = void 0;
			this.tailNode = prevNode;
			this.size--;
			return node;
		};
		LRUCache$1.prototype.detachFromList = function(node) {
			if (this.headerNode === node) this.headerNode = node.next;
			if (this.tailNode === node) this.tailNode = node.prev;
			if (node.prev) node.prev.next = node.next;
			if (node.next) node.next.prev = node.prev;
			node.next = void 0;
			node.prev = void 0;
			this.size--;
		};
		LRUCache$1.prototype.get = function(key) {
			if (this.nodeMap[key]) {
				var node = this.nodeMap[key];
				this.detachFromList(node);
				this.prependToList(node);
				return node.value;
			}
		};
		LRUCache$1.prototype.remove = function(key) {
			if (this.nodeMap[key]) {
				var node = this.nodeMap[key];
				this.detachFromList(node);
				delete this.nodeMap[key];
			}
		};
		LRUCache$1.prototype.put = function(key, value) {
			if (this.nodeMap[key]) this.remove(key);
			else if (this.size === this.sizeLimit) {
				var key_1 = this.removeFromTail().key;
				delete this.nodeMap[key_1];
			}
			var newNode = new LinkedListNode(key, value);
			this.nodeMap[key] = newNode;
			this.prependToList(newNode);
		};
		LRUCache$1.prototype.empty = function() {
			var keys = Object.keys(this.nodeMap);
			for (var i$2 = 0; i$2 < keys.length; i$2++) {
				var key = keys[i$2];
				var node = this.nodeMap[key];
				this.detachFromList(node);
				delete this.nodeMap[key];
			}
		};
		return LRUCache$1;
	}();
	exports.LRUCache = LRUCache;
}));

//#endregion
//#region node_modules/aws-sdk/vendor/endpoint-cache/index.js
var require_endpoint_cache = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var LRU_1 = require_LRU();
	var CACHE_SIZE = 1e3;
	/**
	* Inspired node-lru-cache[https://github.com/isaacs/node-lru-cache]
	*/
	var EndpointCache = function() {
		function EndpointCache$1(maxSize) {
			if (maxSize === void 0) maxSize = CACHE_SIZE;
			this.maxSize = maxSize;
			this.cache = new LRU_1.LRUCache(maxSize);
		}
		Object.defineProperty(EndpointCache$1.prototype, "size", {
			get: function() {
				return this.cache.length;
			},
			enumerable: true,
			configurable: true
		});
		EndpointCache$1.prototype.put = function(key, value) {
			var keyString = typeof key !== "string" ? EndpointCache$1.getKeyString(key) : key;
			var endpointRecord = this.populateValue(value);
			this.cache.put(keyString, endpointRecord);
		};
		EndpointCache$1.prototype.get = function(key) {
			var keyString = typeof key !== "string" ? EndpointCache$1.getKeyString(key) : key;
			var now = Date.now();
			var records = this.cache.get(keyString);
			if (records) {
				for (var i$2 = records.length - 1; i$2 >= 0; i$2--) if (records[i$2].Expire < now) records.splice(i$2, 1);
				if (records.length === 0) {
					this.cache.remove(keyString);
					return;
				}
			}
			return records;
		};
		EndpointCache$1.getKeyString = function(key) {
			var identifiers = [];
			var identifierNames = Object.keys(key).sort();
			for (var i$2 = 0; i$2 < identifierNames.length; i$2++) {
				var identifierName = identifierNames[i$2];
				if (key[identifierName] === void 0) continue;
				identifiers.push(key[identifierName]);
			}
			return identifiers.join(" ");
		};
		EndpointCache$1.prototype.populateValue = function(endpoints) {
			var now = Date.now();
			return endpoints.map(function(endpoint) {
				return {
					Address: endpoint.Address || "",
					Expire: now + (endpoint.CachePeriodInMinutes || 1) * 60 * 1e3
				};
			});
		};
		EndpointCache$1.prototype.empty = function() {
			this.cache.empty();
		};
		EndpointCache$1.prototype.remove = function(key) {
			var keyString = typeof key !== "string" ? EndpointCache$1.getKeyString(key) : key;
			this.cache.remove(keyString);
		};
		return EndpointCache$1;
	}();
	exports.EndpointCache = EndpointCache;
}));

//#endregion
//#region node_modules/aws-sdk/lib/sequential_executor.js
var require_sequential_executor = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var AWS$33 = require_core();
	/**
	* @api private
	* @!method on(eventName, callback)
	*   Registers an event listener callback for the event given by `eventName`.
	*   Parameters passed to the callback function depend on the individual event
	*   being triggered. See the event documentation for those parameters.
	*
	*   @param eventName [String] the event name to register the listener for
	*   @param callback [Function] the listener callback function
	*   @param toHead [Boolean] attach the listener callback to the head of callback array if set to true.
	*     Default to be false.
	*   @return [AWS.SequentialExecutor] the same object for chaining
	*/
	AWS$33.SequentialExecutor = AWS$33.util.inherit({
		constructor: function SequentialExecutor$1() {
			this._events = {};
		},
		listeners: function listeners(eventName) {
			return this._events[eventName] ? this._events[eventName].slice(0) : [];
		},
		on: function on(eventName, listener, toHead) {
			if (this._events[eventName]) toHead ? this._events[eventName].unshift(listener) : this._events[eventName].push(listener);
			else this._events[eventName] = [listener];
			return this;
		},
		onAsync: function onAsync(eventName, listener, toHead) {
			listener._isAsync = true;
			return this.on(eventName, listener, toHead);
		},
		removeListener: function removeListener(eventName, listener) {
			var listeners = this._events[eventName];
			if (listeners) {
				var length = listeners.length;
				var position = -1;
				for (var i$2 = 0; i$2 < length; ++i$2) if (listeners[i$2] === listener) position = i$2;
				if (position > -1) listeners.splice(position, 1);
			}
			return this;
		},
		removeAllListeners: function removeAllListeners(eventName) {
			if (eventName) delete this._events[eventName];
			else this._events = {};
			return this;
		},
		emit: function emit(eventName, eventArgs, doneCallback) {
			if (!doneCallback) doneCallback = function() {};
			var listeners = this.listeners(eventName);
			var count = listeners.length;
			this.callListeners(listeners, eventArgs, doneCallback);
			return count > 0;
		},
		callListeners: function callListeners(listeners, args, doneCallback, prevError) {
			var self = this;
			var error = prevError || null;
			function callNextListener(err) {
				if (err) {
					error = AWS$33.util.error(error || /* @__PURE__ */ new Error(), err);
					if (self._haltHandlersOnError) return doneCallback.call(self, error);
				}
				self.callListeners(listeners, args, doneCallback, error);
			}
			while (listeners.length > 0) {
				var listener = listeners.shift();
				if (listener._isAsync) {
					listener.apply(self, args.concat([callNextListener]));
					return;
				} else {
					try {
						listener.apply(self, args);
					} catch (err) {
						error = AWS$33.util.error(error || /* @__PURE__ */ new Error(), err);
					}
					if (error && self._haltHandlersOnError) {
						doneCallback.call(self, error);
						return;
					}
				}
			}
			doneCallback.call(self, error);
		},
		addListeners: function addListeners(listeners) {
			var self = this;
			if (listeners._events) listeners = listeners._events;
			AWS$33.util.each(listeners, function(event, callbacks) {
				if (typeof callbacks === "function") callbacks = [callbacks];
				AWS$33.util.arrayEach(callbacks, function(callback) {
					self.on(event, callback);
				});
			});
			return self;
		},
		addNamedListener: function addNamedListener(name, eventName, callback, toHead) {
			this[name] = callback;
			this.addListener(eventName, callback, toHead);
			return this;
		},
		addNamedAsyncListener: function addNamedAsyncListener(name, eventName, callback, toHead) {
			callback._isAsync = true;
			return this.addNamedListener(name, eventName, callback, toHead);
		},
		addNamedListeners: function addNamedListeners(callback) {
			var self = this;
			callback(function() {
				self.addNamedListener.apply(self, arguments);
			}, function() {
				self.addNamedAsyncListener.apply(self, arguments);
			});
			return this;
		}
	});
	/**
	* {on} is the prefered method.
	* @api private
	*/
	AWS$33.SequentialExecutor.prototype.addListener = AWS$33.SequentialExecutor.prototype.on;
	/**
	* @api private
	*/
	module.exports = AWS$33.SequentialExecutor;
}));

//#endregion
//#region node_modules/aws-sdk/lib/region_config_data.json
var require_region_config_data = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = {
		"rules": {
			"*/*": { "endpoint": "{service}.{region}.amazonaws.com" },
			"cn-*/*": { "endpoint": "{service}.{region}.amazonaws.com.cn" },
			"eu-isoe-*/*": "euIsoe",
			"us-iso-*/*": "usIso",
			"us-isob-*/*": "usIsob",
			"us-isof-*/*": "usIsof",
			"*/budgets": "globalSSL",
			"*/cloudfront": "globalSSL",
			"*/sts": "globalSSL",
			"*/importexport": {
				"endpoint": "{service}.amazonaws.com",
				"signatureVersion": "v2",
				"globalEndpoint": true
			},
			"*/route53": "globalSSL",
			"cn-*/route53": {
				"endpoint": "{service}.amazonaws.com.cn",
				"globalEndpoint": true,
				"signingRegion": "cn-northwest-1"
			},
			"us-gov-*/route53": "globalGovCloud",
			"us-iso-*/route53": {
				"endpoint": "{service}.c2s.ic.gov",
				"globalEndpoint": true,
				"signingRegion": "us-iso-east-1"
			},
			"us-isob-*/route53": {
				"endpoint": "{service}.sc2s.sgov.gov",
				"globalEndpoint": true,
				"signingRegion": "us-isob-east-1"
			},
			"us-isof-*/route53": "globalUsIsof",
			"eu-isoe-*/route53": "globalEuIsoe",
			"*/waf": "globalSSL",
			"*/iam": "globalSSL",
			"cn-*/iam": {
				"endpoint": "{service}.cn-north-1.amazonaws.com.cn",
				"globalEndpoint": true,
				"signingRegion": "cn-north-1"
			},
			"us-iso-*/iam": {
				"endpoint": "{service}.us-iso-east-1.c2s.ic.gov",
				"globalEndpoint": true,
				"signingRegion": "us-iso-east-1"
			},
			"us-gov-*/iam": "globalGovCloud",
			"*/ce": {
				"endpoint": "{service}.us-east-1.amazonaws.com",
				"globalEndpoint": true,
				"signingRegion": "us-east-1"
			},
			"cn-*/ce": {
				"endpoint": "{service}.cn-northwest-1.amazonaws.com.cn",
				"globalEndpoint": true,
				"signingRegion": "cn-northwest-1"
			},
			"us-gov-*/sts": { "endpoint": "{service}.{region}.amazonaws.com" },
			"us-gov-west-1/s3": "s3signature",
			"us-west-1/s3": "s3signature",
			"us-west-2/s3": "s3signature",
			"eu-west-1/s3": "s3signature",
			"ap-southeast-1/s3": "s3signature",
			"ap-southeast-2/s3": "s3signature",
			"ap-northeast-1/s3": "s3signature",
			"sa-east-1/s3": "s3signature",
			"us-east-1/s3": {
				"endpoint": "{service}.amazonaws.com",
				"signatureVersion": "s3"
			},
			"us-east-1/sdb": {
				"endpoint": "{service}.amazonaws.com",
				"signatureVersion": "v2"
			},
			"*/sdb": {
				"endpoint": "{service}.{region}.amazonaws.com",
				"signatureVersion": "v2"
			},
			"*/resource-explorer-2": "dualstackByDefault",
			"*/kendra-ranking": "dualstackByDefault",
			"*/internetmonitor": "dualstackByDefault",
			"*/codecatalyst": "globalDualstackByDefault"
		},
		"fipsRules": {
			"*/*": "fipsStandard",
			"us-gov-*/*": "fipsStandard",
			"us-iso-*/*": { "endpoint": "{service}-fips.{region}.c2s.ic.gov" },
			"us-iso-*/dms": "usIso",
			"us-isob-*/*": { "endpoint": "{service}-fips.{region}.sc2s.sgov.gov" },
			"us-isob-*/dms": "usIsob",
			"cn-*/*": { "endpoint": "{service}-fips.{region}.amazonaws.com.cn" },
			"*/api.ecr": "fips.api.ecr",
			"*/api.sagemaker": "fips.api.sagemaker",
			"*/batch": "fipsDotPrefix",
			"*/eks": "fipsDotPrefix",
			"*/models.lex": "fips.models.lex",
			"*/runtime.lex": "fips.runtime.lex",
			"*/runtime.sagemaker": { "endpoint": "runtime-fips.sagemaker.{region}.amazonaws.com" },
			"*/iam": "fipsWithoutRegion",
			"*/route53": "fipsWithoutRegion",
			"*/transcribe": "fipsDotPrefix",
			"*/waf": "fipsWithoutRegion",
			"us-gov-*/transcribe": "fipsDotPrefix",
			"us-gov-*/api.ecr": "fips.api.ecr",
			"us-gov-*/models.lex": "fips.models.lex",
			"us-gov-*/runtime.lex": "fips.runtime.lex",
			"us-gov-*/access-analyzer": "fipsWithServiceOnly",
			"us-gov-*/acm": "fipsWithServiceOnly",
			"us-gov-*/acm-pca": "fipsWithServiceOnly",
			"us-gov-*/api.sagemaker": "fipsWithServiceOnly",
			"us-gov-*/appconfig": "fipsWithServiceOnly",
			"us-gov-*/application-autoscaling": "fipsWithServiceOnly",
			"us-gov-*/autoscaling": "fipsWithServiceOnly",
			"us-gov-*/autoscaling-plans": "fipsWithServiceOnly",
			"us-gov-*/batch": "fipsWithServiceOnly",
			"us-gov-*/cassandra": "fipsWithServiceOnly",
			"us-gov-*/clouddirectory": "fipsWithServiceOnly",
			"us-gov-*/cloudformation": "fipsWithServiceOnly",
			"us-gov-*/cloudshell": "fipsWithServiceOnly",
			"us-gov-*/cloudtrail": "fipsWithServiceOnly",
			"us-gov-*/config": "fipsWithServiceOnly",
			"us-gov-*/connect": "fipsWithServiceOnly",
			"us-gov-*/databrew": "fipsWithServiceOnly",
			"us-gov-*/dlm": "fipsWithServiceOnly",
			"us-gov-*/dms": "fipsWithServiceOnly",
			"us-gov-*/dynamodb": "fipsWithServiceOnly",
			"us-gov-*/ec2": "fipsWithServiceOnly",
			"us-gov-*/eks": "fipsWithServiceOnly",
			"us-gov-*/elasticache": "fipsWithServiceOnly",
			"us-gov-*/elasticbeanstalk": "fipsWithServiceOnly",
			"us-gov-*/elasticloadbalancing": "fipsWithServiceOnly",
			"us-gov-*/elasticmapreduce": "fipsWithServiceOnly",
			"us-gov-*/events": "fipsWithServiceOnly",
			"us-gov-*/fis": "fipsWithServiceOnly",
			"us-gov-*/glacier": "fipsWithServiceOnly",
			"us-gov-*/greengrass": "fipsWithServiceOnly",
			"us-gov-*/guardduty": "fipsWithServiceOnly",
			"us-gov-*/identitystore": "fipsWithServiceOnly",
			"us-gov-*/imagebuilder": "fipsWithServiceOnly",
			"us-gov-*/kafka": "fipsWithServiceOnly",
			"us-gov-*/kinesis": "fipsWithServiceOnly",
			"us-gov-*/logs": "fipsWithServiceOnly",
			"us-gov-*/mediaconvert": "fipsWithServiceOnly",
			"us-gov-*/monitoring": "fipsWithServiceOnly",
			"us-gov-*/networkmanager": "fipsWithServiceOnly",
			"us-gov-*/organizations": "fipsWithServiceOnly",
			"us-gov-*/outposts": "fipsWithServiceOnly",
			"us-gov-*/participant.connect": "fipsWithServiceOnly",
			"us-gov-*/ram": "fipsWithServiceOnly",
			"us-gov-*/rds": "fipsWithServiceOnly",
			"us-gov-*/redshift": "fipsWithServiceOnly",
			"us-gov-*/resource-groups": "fipsWithServiceOnly",
			"us-gov-*/runtime.sagemaker": "fipsWithServiceOnly",
			"us-gov-*/serverlessrepo": "fipsWithServiceOnly",
			"us-gov-*/servicecatalog-appregistry": "fipsWithServiceOnly",
			"us-gov-*/servicequotas": "fipsWithServiceOnly",
			"us-gov-*/sns": "fipsWithServiceOnly",
			"us-gov-*/sqs": "fipsWithServiceOnly",
			"us-gov-*/ssm": "fipsWithServiceOnly",
			"us-gov-*/streams.dynamodb": "fipsWithServiceOnly",
			"us-gov-*/sts": "fipsWithServiceOnly",
			"us-gov-*/support": "fipsWithServiceOnly",
			"us-gov-*/swf": "fipsWithServiceOnly",
			"us-gov-west-1/states": "fipsWithServiceOnly",
			"us-iso-east-1/elasticfilesystem": { "endpoint": "elasticfilesystem-fips.{region}.c2s.ic.gov" },
			"us-gov-west-1/organizations": "fipsWithServiceOnly",
			"us-gov-west-1/route53": { "endpoint": "route53.us-gov.amazonaws.com" },
			"*/resource-explorer-2": "fipsDualstackByDefault",
			"*/kendra-ranking": "dualstackByDefault",
			"*/internetmonitor": "dualstackByDefault",
			"*/codecatalyst": "fipsGlobalDualstackByDefault"
		},
		"dualstackRules": {
			"*/*": { "endpoint": "{service}.{region}.api.aws" },
			"cn-*/*": { "endpoint": "{service}.{region}.api.amazonwebservices.com.cn" },
			"*/s3": "dualstackLegacy",
			"cn-*/s3": "dualstackLegacyCn",
			"*/s3-control": "dualstackLegacy",
			"cn-*/s3-control": "dualstackLegacyCn",
			"ap-south-1/ec2": "dualstackLegacyEc2",
			"eu-west-1/ec2": "dualstackLegacyEc2",
			"sa-east-1/ec2": "dualstackLegacyEc2",
			"us-east-1/ec2": "dualstackLegacyEc2",
			"us-east-2/ec2": "dualstackLegacyEc2",
			"us-west-2/ec2": "dualstackLegacyEc2"
		},
		"dualstackFipsRules": {
			"*/*": { "endpoint": "{service}-fips.{region}.api.aws" },
			"cn-*/*": { "endpoint": "{service}-fips.{region}.api.amazonwebservices.com.cn" },
			"*/s3": "dualstackFipsLegacy",
			"cn-*/s3": "dualstackFipsLegacyCn",
			"*/s3-control": "dualstackFipsLegacy",
			"cn-*/s3-control": "dualstackFipsLegacyCn"
		},
		"patterns": {
			"globalSSL": {
				"endpoint": "https://{service}.amazonaws.com",
				"globalEndpoint": true,
				"signingRegion": "us-east-1"
			},
			"globalGovCloud": {
				"endpoint": "{service}.us-gov.amazonaws.com",
				"globalEndpoint": true,
				"signingRegion": "us-gov-west-1"
			},
			"globalUsIsof": {
				"endpoint": "{service}.csp.hci.ic.gov",
				"globalEndpoint": true,
				"signingRegion": "us-isof-south-1"
			},
			"globalEuIsoe": {
				"endpoint": "{service}.cloud.adc-e.uk",
				"globalEndpoint": true,
				"signingRegion": "eu-isoe-west-1"
			},
			"s3signature": {
				"endpoint": "{service}.{region}.amazonaws.com",
				"signatureVersion": "s3"
			},
			"euIsoe": { "endpoint": "{service}.{region}.cloud.adc-e.uk" },
			"usIso": { "endpoint": "{service}.{region}.c2s.ic.gov" },
			"usIsob": { "endpoint": "{service}.{region}.sc2s.sgov.gov" },
			"usIsof": { "endpoint": "{service}.{region}.csp.hci.ic.gov" },
			"fipsStandard": { "endpoint": "{service}-fips.{region}.amazonaws.com" },
			"fipsDotPrefix": { "endpoint": "fips.{service}.{region}.amazonaws.com" },
			"fipsWithoutRegion": { "endpoint": "{service}-fips.amazonaws.com" },
			"fips.api.ecr": { "endpoint": "ecr-fips.{region}.amazonaws.com" },
			"fips.api.sagemaker": { "endpoint": "api-fips.sagemaker.{region}.amazonaws.com" },
			"fips.models.lex": { "endpoint": "models-fips.lex.{region}.amazonaws.com" },
			"fips.runtime.lex": { "endpoint": "runtime-fips.lex.{region}.amazonaws.com" },
			"fipsWithServiceOnly": { "endpoint": "{service}.{region}.amazonaws.com" },
			"dualstackLegacy": { "endpoint": "{service}.dualstack.{region}.amazonaws.com" },
			"dualstackLegacyCn": { "endpoint": "{service}.dualstack.{region}.amazonaws.com.cn" },
			"dualstackFipsLegacy": { "endpoint": "{service}-fips.dualstack.{region}.amazonaws.com" },
			"dualstackFipsLegacyCn": { "endpoint": "{service}-fips.dualstack.{region}.amazonaws.com.cn" },
			"dualstackLegacyEc2": { "endpoint": "api.ec2.{region}.aws" },
			"dualstackByDefault": { "endpoint": "{service}.{region}.api.aws" },
			"fipsDualstackByDefault": { "endpoint": "{service}-fips.{region}.api.aws" },
			"globalDualstackByDefault": { "endpoint": "{service}.global.api.aws" },
			"fipsGlobalDualstackByDefault": { "endpoint": "{service}-fips.global.api.aws" }
		}
	};
}));

//#endregion
//#region node_modules/aws-sdk/lib/region_config.js
var require_region_config = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var util$6 = require_util();
	var regionConfig$1 = require_region_config_data();
	function generateRegionPrefix(region) {
		if (!region) return null;
		var parts = region.split("-");
		if (parts.length < 3) return null;
		return parts.slice(0, parts.length - 2).join("-") + "-*";
	}
	function derivedKeys(service) {
		var region = service.config.region;
		var regionPrefix = generateRegionPrefix(region);
		var endpointPrefix = service.api.endpointPrefix;
		return [
			[region, endpointPrefix],
			[regionPrefix, endpointPrefix],
			[region, "*"],
			[regionPrefix, "*"],
			["*", endpointPrefix],
			[region, "internal-*"],
			["*", "*"]
		].map(function(item) {
			return item[0] && item[1] ? item.join("/") : null;
		});
	}
	function applyConfig(service, config) {
		util$6.each(config, function(key, value) {
			if (key === "globalEndpoint") return;
			if (service.config[key] === void 0 || service.config[key] === null) service.config[key] = value;
		});
	}
	function configureEndpoint(service) {
		var keys = derivedKeys(service);
		var useFipsEndpoint = service.config.useFipsEndpoint;
		var useDualstackEndpoint = service.config.useDualstackEndpoint;
		for (var i$2 = 0; i$2 < keys.length; i$2++) {
			var key = keys[i$2];
			if (!key) continue;
			var rules = useFipsEndpoint ? useDualstackEndpoint ? regionConfig$1.dualstackFipsRules : regionConfig$1.fipsRules : useDualstackEndpoint ? regionConfig$1.dualstackRules : regionConfig$1.rules;
			if (Object.prototype.hasOwnProperty.call(rules, key)) {
				var config = rules[key];
				if (typeof config === "string") config = regionConfig$1.patterns[config];
				service.isGlobalEndpoint = !!config.globalEndpoint;
				if (config.signingRegion) service.signingRegion = config.signingRegion;
				if (!config.signatureVersion) config.signatureVersion = "v4";
				var useBearer = (service.api && service.api.signatureVersion) === "bearer";
				applyConfig(service, Object.assign({}, config, { signatureVersion: useBearer ? "bearer" : config.signatureVersion }));
				return;
			}
		}
	}
	function getEndpointSuffix(region) {
		var regionRegexes = {
			"^(us|eu|ap|sa|ca|me)\\-\\w+\\-\\d+$": "amazonaws.com",
			"^cn\\-\\w+\\-\\d+$": "amazonaws.com.cn",
			"^us\\-gov\\-\\w+\\-\\d+$": "amazonaws.com",
			"^us\\-iso\\-\\w+\\-\\d+$": "c2s.ic.gov",
			"^us\\-isob\\-\\w+\\-\\d+$": "sc2s.sgov.gov",
			"^eu\\-isoe\\-west\\-1$": "cloud.adc-e.uk",
			"^us\\-isof\\-\\w+\\-\\d+$": "csp.hci.ic.gov"
		};
		var defaultSuffix = "amazonaws.com";
		var regexes = Object.keys(regionRegexes);
		for (var i$2 = 0; i$2 < regexes.length; i$2++) {
			var regionPattern = RegExp(regexes[i$2]);
			var dnsSuffix = regionRegexes[regexes[i$2]];
			if (regionPattern.test(region)) return dnsSuffix;
		}
		return defaultSuffix;
	}
	/**
	* @api private
	*/
	module.exports = {
		configureEndpoint,
		getEndpointSuffix
	};
}));

//#endregion
//#region node_modules/aws-sdk/lib/region/utils.js
var require_utils = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	function isFipsRegion(region) {
		return typeof region === "string" && (region.startsWith("fips-") || region.endsWith("-fips"));
	}
	function isGlobalRegion(region) {
		return typeof region === "string" && ["aws-global", "aws-us-gov-global"].includes(region);
	}
	function getRealRegion(region) {
		return [
			"fips-aws-global",
			"aws-fips",
			"aws-global"
		].includes(region) ? "us-east-1" : ["fips-aws-us-gov-global", "aws-us-gov-global"].includes(region) ? "us-gov-west-1" : region.replace(/fips-(dkr-|prod-)?|-fips/, "");
	}
	module.exports = {
		isFipsRegion,
		isGlobalRegion,
		getRealRegion
	};
}));

//#endregion
//#region node_modules/aws-sdk/lib/service.js
var require_service = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var AWS$32 = require_core();
	var Api = require_api();
	var regionConfig = require_region_config();
	var inherit$11 = AWS$32.util.inherit;
	var clientCount = 0;
	var region_utils = require_utils();
	/**
	* The service class representing an AWS service.
	*
	* @class_abstract This class is an abstract class.
	*
	* @!attribute apiVersions
	*   @return [Array<String>] the list of API versions supported by this service.
	*   @readonly
	*/
	AWS$32.Service = inherit$11({
		constructor: function Service$2(config) {
			if (!this.loadServiceClass) throw AWS$32.util.error(/* @__PURE__ */ new Error(), "Service must be constructed with `new' operator");
			if (config) {
				if (config.region) {
					var region = config.region;
					if (region_utils.isFipsRegion(region)) {
						config.region = region_utils.getRealRegion(region);
						config.useFipsEndpoint = true;
					}
					if (region_utils.isGlobalRegion(region)) config.region = region_utils.getRealRegion(region);
				}
				if (typeof config.useDualstack === "boolean" && typeof config.useDualstackEndpoint !== "boolean") config.useDualstackEndpoint = config.useDualstack;
			}
			var ServiceClass = this.loadServiceClass(config || {});
			if (ServiceClass) {
				var originalConfig = AWS$32.util.copy(config);
				var svc = new ServiceClass(config);
				Object.defineProperty(svc, "_originalConfig", {
					get: function() {
						return originalConfig;
					},
					enumerable: false,
					configurable: true
				});
				svc._clientId = ++clientCount;
				return svc;
			}
			this.initialize(config);
		},
		initialize: function initialize(config) {
			var svcConfig = AWS$32.config[this.serviceIdentifier];
			this.config = new AWS$32.Config(AWS$32.config);
			if (svcConfig) this.config.update(svcConfig, true);
			if (config) this.config.update(config, true);
			this.validateService();
			if (!this.config.endpoint) regionConfig.configureEndpoint(this);
			this.config.endpoint = this.endpointFromTemplate(this.config.endpoint);
			this.setEndpoint(this.config.endpoint);
			AWS$32.SequentialExecutor.call(this);
			AWS$32.Service.addDefaultMonitoringListeners(this);
			if ((this.config.clientSideMonitoring || AWS$32.Service._clientSideMonitoring) && this.publisher) {
				var publisher = this.publisher;
				this.addNamedListener("PUBLISH_API_CALL", "apiCall", function PUBLISH_API_CALL(event) {
					process.nextTick(function() {
						publisher.eventHandler(event);
					});
				});
				this.addNamedListener("PUBLISH_API_ATTEMPT", "apiCallAttempt", function PUBLISH_API_ATTEMPT(event) {
					process.nextTick(function() {
						publisher.eventHandler(event);
					});
				});
			}
		},
		validateService: function validateService() {},
		loadServiceClass: function loadServiceClass(serviceConfig) {
			var config = serviceConfig;
			if (!AWS$32.util.isEmpty(this.api)) return null;
			else if (config.apiConfig) return AWS$32.Service.defineServiceApi(this.constructor, config.apiConfig);
			else if (!this.constructor.services) return null;
			else {
				config = new AWS$32.Config(AWS$32.config);
				config.update(serviceConfig, true);
				var version = config.apiVersions[this.constructor.serviceIdentifier];
				version = version || config.apiVersion;
				return this.getLatestServiceClass(version);
			}
		},
		getLatestServiceClass: function getLatestServiceClass(version) {
			version = this.getLatestServiceVersion(version);
			if (this.constructor.services[version] === null) AWS$32.Service.defineServiceApi(this.constructor, version);
			return this.constructor.services[version];
		},
		getLatestServiceVersion: function getLatestServiceVersion(version) {
			if (!this.constructor.services || this.constructor.services.length === 0) throw new Error("No services defined on " + this.constructor.serviceIdentifier);
			if (!version) version = "latest";
			else if (AWS$32.util.isType(version, Date)) version = AWS$32.util.date.iso8601(version).split("T")[0];
			if (Object.hasOwnProperty(this.constructor.services, version)) return version;
			var keys = Object.keys(this.constructor.services).sort();
			var selectedVersion = null;
			for (var i$2 = keys.length - 1; i$2 >= 0; i$2--) {
				if (keys[i$2][keys[i$2].length - 1] !== "*") selectedVersion = keys[i$2];
				if (keys[i$2].substr(0, 10) <= version) return selectedVersion;
			}
			throw new Error("Could not find " + this.constructor.serviceIdentifier + " API to satisfy version constraint `" + version + "'");
		},
		api: {},
		defaultRetryCount: 3,
		customizeRequests: function customizeRequests(callback) {
			if (!callback) this.customRequestHandler = null;
			else if (typeof callback === "function") this.customRequestHandler = callback;
			else throw new Error("Invalid callback type '" + typeof callback + "' provided in customizeRequests");
		},
		makeRequest: function makeRequest(operation, params, callback) {
			if (typeof params === "function") {
				callback = params;
				params = null;
			}
			params = params || {};
			if (this.config.params) {
				var rules = this.api.operations[operation];
				if (rules) {
					params = AWS$32.util.copy(params);
					AWS$32.util.each(this.config.params, function(key, value) {
						if (rules.input.members[key]) {
							if (params[key] === void 0 || params[key] === null) params[key] = value;
						}
					});
				}
			}
			var request = new AWS$32.Request(this, operation, params);
			this.addAllRequestListeners(request);
			this.attachMonitoringEmitter(request);
			if (callback) request.send(callback);
			return request;
		},
		makeUnauthenticatedRequest: function makeUnauthenticatedRequest(operation, params, callback) {
			if (typeof params === "function") {
				callback = params;
				params = {};
			}
			var request = this.makeRequest(operation, params).toUnauthenticated();
			return callback ? request.send(callback) : request;
		},
		waitFor: function waitFor(state, params, callback) {
			return new AWS$32.ResourceWaiter(this, state).wait(params, callback);
		},
		addAllRequestListeners: function addAllRequestListeners(request) {
			var list = [
				AWS$32.events,
				AWS$32.EventListeners.Core,
				this.serviceInterface(),
				AWS$32.EventListeners.CorePost
			];
			for (var i$2 = 0; i$2 < list.length; i$2++) if (list[i$2]) request.addListeners(list[i$2]);
			if (!this.config.paramValidation) request.removeListener("validate", AWS$32.EventListeners.Core.VALIDATE_PARAMETERS);
			if (this.config.logger) request.addListeners(AWS$32.EventListeners.Logger);
			this.setupRequestListeners(request);
			if (typeof this.constructor.prototype.customRequestHandler === "function") this.constructor.prototype.customRequestHandler(request);
			if (Object.prototype.hasOwnProperty.call(this, "customRequestHandler") && typeof this.customRequestHandler === "function") this.customRequestHandler(request);
		},
		apiCallEvent: function apiCallEvent(request) {
			var api = request.service.api.operations[request.operation];
			var monitoringEvent = {
				Type: "ApiCall",
				Api: api ? api.name : request.operation,
				Version: 1,
				Service: request.service.api.serviceId || request.service.api.endpointPrefix,
				Region: request.httpRequest.region,
				MaxRetriesExceeded: 0,
				UserAgent: request.httpRequest.getUserAgent()
			};
			var response = request.response;
			if (response.httpResponse.statusCode) monitoringEvent.FinalHttpStatusCode = response.httpResponse.statusCode;
			if (response.error) {
				var error = response.error;
				if (response.httpResponse.statusCode > 299) {
					if (error.code) monitoringEvent.FinalAwsException = error.code;
					if (error.message) monitoringEvent.FinalAwsExceptionMessage = error.message;
				} else {
					if (error.code || error.name) monitoringEvent.FinalSdkException = error.code || error.name;
					if (error.message) monitoringEvent.FinalSdkExceptionMessage = error.message;
				}
			}
			return monitoringEvent;
		},
		apiAttemptEvent: function apiAttemptEvent(request) {
			var api = request.service.api.operations[request.operation];
			var monitoringEvent = {
				Type: "ApiCallAttempt",
				Api: api ? api.name : request.operation,
				Version: 1,
				Service: request.service.api.serviceId || request.service.api.endpointPrefix,
				Fqdn: request.httpRequest.endpoint.hostname,
				UserAgent: request.httpRequest.getUserAgent()
			};
			var response = request.response;
			if (response.httpResponse.statusCode) monitoringEvent.HttpStatusCode = response.httpResponse.statusCode;
			if (!request._unAuthenticated && request.service.config.credentials && request.service.config.credentials.accessKeyId) monitoringEvent.AccessKey = request.service.config.credentials.accessKeyId;
			if (!response.httpResponse.headers) return monitoringEvent;
			if (request.httpRequest.headers["x-amz-security-token"]) monitoringEvent.SessionToken = request.httpRequest.headers["x-amz-security-token"];
			if (response.httpResponse.headers["x-amzn-requestid"]) monitoringEvent.XAmznRequestId = response.httpResponse.headers["x-amzn-requestid"];
			if (response.httpResponse.headers["x-amz-request-id"]) monitoringEvent.XAmzRequestId = response.httpResponse.headers["x-amz-request-id"];
			if (response.httpResponse.headers["x-amz-id-2"]) monitoringEvent.XAmzId2 = response.httpResponse.headers["x-amz-id-2"];
			return monitoringEvent;
		},
		attemptFailEvent: function attemptFailEvent(request) {
			var monitoringEvent = this.apiAttemptEvent(request);
			var response = request.response;
			var error = response.error;
			if (response.httpResponse.statusCode > 299) {
				if (error.code) monitoringEvent.AwsException = error.code;
				if (error.message) monitoringEvent.AwsExceptionMessage = error.message;
			} else {
				if (error.code || error.name) monitoringEvent.SdkException = error.code || error.name;
				if (error.message) monitoringEvent.SdkExceptionMessage = error.message;
			}
			return monitoringEvent;
		},
		attachMonitoringEmitter: function attachMonitoringEmitter(request) {
			var attemptTimestamp;
			var attemptStartRealTime;
			var attemptLatency;
			var callStartRealTime;
			var attemptCount = 0;
			var region;
			var callTimestamp;
			var self = this;
			var addToHead = true;
			request.on("validate", function() {
				callStartRealTime = AWS$32.util.realClock.now();
				callTimestamp = Date.now();
			}, addToHead);
			request.on("sign", function() {
				attemptStartRealTime = AWS$32.util.realClock.now();
				attemptTimestamp = Date.now();
				region = request.httpRequest.region;
				attemptCount++;
			}, addToHead);
			request.on("validateResponse", function() {
				attemptLatency = Math.round(AWS$32.util.realClock.now() - attemptStartRealTime);
			});
			request.addNamedListener("API_CALL_ATTEMPT", "success", function API_CALL_ATTEMPT() {
				var apiAttemptEvent = self.apiAttemptEvent(request);
				apiAttemptEvent.Timestamp = attemptTimestamp;
				apiAttemptEvent.AttemptLatency = attemptLatency >= 0 ? attemptLatency : 0;
				apiAttemptEvent.Region = region;
				self.emit("apiCallAttempt", [apiAttemptEvent]);
			});
			request.addNamedListener("API_CALL_ATTEMPT_RETRY", "retry", function API_CALL_ATTEMPT_RETRY() {
				var apiAttemptEvent = self.attemptFailEvent(request);
				apiAttemptEvent.Timestamp = attemptTimestamp;
				attemptLatency = attemptLatency || Math.round(AWS$32.util.realClock.now() - attemptStartRealTime);
				apiAttemptEvent.AttemptLatency = attemptLatency >= 0 ? attemptLatency : 0;
				apiAttemptEvent.Region = region;
				self.emit("apiCallAttempt", [apiAttemptEvent]);
			});
			request.addNamedListener("API_CALL", "complete", function API_CALL() {
				var apiCallEvent = self.apiCallEvent(request);
				apiCallEvent.AttemptCount = attemptCount;
				if (apiCallEvent.AttemptCount <= 0) return;
				apiCallEvent.Timestamp = callTimestamp;
				var latency = Math.round(AWS$32.util.realClock.now() - callStartRealTime);
				apiCallEvent.Latency = latency >= 0 ? latency : 0;
				var response = request.response;
				if (response.error && response.error.retryable && typeof response.retryCount === "number" && typeof response.maxRetries === "number" && response.retryCount >= response.maxRetries) apiCallEvent.MaxRetriesExceeded = 1;
				self.emit("apiCall", [apiCallEvent]);
			});
		},
		setupRequestListeners: function setupRequestListeners(request) {},
		getSigningName: function getSigningName() {
			return this.api.signingName || this.api.endpointPrefix;
		},
		getSignerClass: function getSignerClass(request) {
			var version;
			var operation = null;
			var authtype = "";
			if (request) {
				operation = (request.service.api.operations || {})[request.operation] || null;
				authtype = operation ? operation.authtype : "";
			}
			if (this.config.signatureVersion) version = this.config.signatureVersion;
			else if (authtype === "v4" || authtype === "v4-unsigned-body") version = "v4";
			else if (authtype === "bearer") version = "bearer";
			else version = this.api.signatureVersion;
			return AWS$32.Signers.RequestSigner.getVersion(version);
		},
		serviceInterface: function serviceInterface() {
			switch (this.api.protocol) {
				case "ec2": return AWS$32.EventListeners.Query;
				case "query": return AWS$32.EventListeners.Query;
				case "json": return AWS$32.EventListeners.Json;
				case "rest-json": return AWS$32.EventListeners.RestJson;
				case "rest-xml": return AWS$32.EventListeners.RestXml;
			}
			if (this.api.protocol) throw new Error("Invalid service `protocol' " + this.api.protocol + " in API config");
		},
		successfulResponse: function successfulResponse(resp) {
			return resp.httpResponse.statusCode < 300;
		},
		numRetries: function numRetries() {
			if (this.config.maxRetries !== void 0) return this.config.maxRetries;
			else return this.defaultRetryCount;
		},
		retryDelays: function retryDelays(retryCount, err) {
			return AWS$32.util.calculateRetryDelay(retryCount, this.config.retryDelayOptions, err);
		},
		retryableError: function retryableError(error) {
			if (this.timeoutError(error)) return true;
			if (this.networkingError(error)) return true;
			if (this.expiredCredentialsError(error)) return true;
			if (this.throttledError(error)) return true;
			if (error.statusCode >= 500) return true;
			return false;
		},
		networkingError: function networkingError(error) {
			return error.code === "NetworkingError";
		},
		timeoutError: function timeoutError(error) {
			return error.code === "TimeoutError";
		},
		expiredCredentialsError: function expiredCredentialsError(error) {
			return error.code === "ExpiredTokenException";
		},
		clockSkewError: function clockSkewError(error) {
			switch (error.code) {
				case "RequestTimeTooSkewed":
				case "RequestExpired":
				case "InvalidSignatureException":
				case "SignatureDoesNotMatch":
				case "AuthFailure":
				case "RequestInTheFuture": return true;
				default: return false;
			}
		},
		getSkewCorrectedDate: function getSkewCorrectedDate() {
			return new Date(Date.now() + this.config.systemClockOffset);
		},
		applyClockOffset: function applyClockOffset(newServerTime) {
			if (newServerTime) this.config.systemClockOffset = newServerTime - Date.now();
		},
		isClockSkewed: function isClockSkewed(newServerTime) {
			if (newServerTime) return Math.abs(this.getSkewCorrectedDate().getTime() - newServerTime) >= 3e5;
		},
		throttledError: function throttledError(error) {
			if (error.statusCode === 429) return true;
			switch (error.code) {
				case "ProvisionedThroughputExceededException":
				case "Throttling":
				case "ThrottlingException":
				case "RequestLimitExceeded":
				case "RequestThrottled":
				case "RequestThrottledException":
				case "TooManyRequestsException":
				case "TransactionInProgressException":
				case "EC2ThrottledException": return true;
				default: return false;
			}
		},
		endpointFromTemplate: function endpointFromTemplate(endpoint) {
			if (typeof endpoint !== "string") return endpoint;
			var e = endpoint;
			e = e.replace(/\{service\}/g, this.api.endpointPrefix);
			e = e.replace(/\{region\}/g, this.config.region);
			e = e.replace(/\{scheme\}/g, this.config.sslEnabled ? "https" : "http");
			return e;
		},
		setEndpoint: function setEndpoint(endpoint) {
			this.endpoint = new AWS$32.Endpoint(endpoint, this.config);
		},
		paginationConfig: function paginationConfig(operation, throwException) {
			var paginator = this.api.operations[operation].paginator;
			if (!paginator) {
				if (throwException) {
					var e = /* @__PURE__ */ new Error();
					throw AWS$32.util.error(e, "No pagination configuration for " + operation);
				}
				return null;
			}
			return paginator;
		}
	});
	AWS$32.util.update(AWS$32.Service, {
		defineMethods: function defineMethods(svc) {
			AWS$32.util.each(svc.prototype.api.operations, function iterator(method) {
				if (svc.prototype[method]) return;
				if (svc.prototype.api.operations[method].authtype === "none") svc.prototype[method] = function(params, callback) {
					return this.makeUnauthenticatedRequest(method, params, callback);
				};
				else svc.prototype[method] = function(params, callback) {
					return this.makeRequest(method, params, callback);
				};
			});
		},
		defineService: function defineService(serviceIdentifier, versions, features) {
			AWS$32.Service._serviceMap[serviceIdentifier] = true;
			if (!Array.isArray(versions)) {
				features = versions;
				versions = [];
			}
			var svc = inherit$11(AWS$32.Service, features || {});
			if (typeof serviceIdentifier === "string") {
				AWS$32.Service.addVersions(svc, versions);
				svc.serviceIdentifier = svc.serviceIdentifier || serviceIdentifier;
			} else {
				svc.prototype.api = serviceIdentifier;
				AWS$32.Service.defineMethods(svc);
			}
			AWS$32.SequentialExecutor.call(this.prototype);
			if (!this.prototype.publisher && AWS$32.util.clientSideMonitoring) {
				var Publisher = AWS$32.util.clientSideMonitoring.Publisher;
				var configProvider = AWS$32.util.clientSideMonitoring.configProvider;
				var publisherConfig = configProvider();
				this.prototype.publisher = new Publisher(publisherConfig);
				if (publisherConfig.enabled) AWS$32.Service._clientSideMonitoring = true;
			}
			AWS$32.SequentialExecutor.call(svc.prototype);
			AWS$32.Service.addDefaultMonitoringListeners(svc.prototype);
			return svc;
		},
		addVersions: function addVersions(svc, versions) {
			if (!Array.isArray(versions)) versions = [versions];
			svc.services = svc.services || {};
			for (var i$2 = 0; i$2 < versions.length; i$2++) if (svc.services[versions[i$2]] === void 0) svc.services[versions[i$2]] = null;
			svc.apiVersions = Object.keys(svc.services).sort();
		},
		defineServiceApi: function defineServiceApi(superclass, version, apiConfig) {
			var svc = inherit$11(superclass, { serviceIdentifier: superclass.serviceIdentifier });
			function setApi(api) {
				if (api.isApi) svc.prototype.api = api;
				else svc.prototype.api = new Api(api, { serviceIdentifier: superclass.serviceIdentifier });
			}
			if (typeof version === "string") {
				if (apiConfig) setApi(apiConfig);
				else try {
					setApi(AWS$32.apiLoader(superclass.serviceIdentifier, version));
				} catch (err) {
					throw AWS$32.util.error(err, { message: "Could not find API configuration " + superclass.serviceIdentifier + "-" + version });
				}
				if (!Object.prototype.hasOwnProperty.call(superclass.services, version)) superclass.apiVersions = superclass.apiVersions.concat(version).sort();
				superclass.services[version] = svc;
			} else setApi(version);
			AWS$32.Service.defineMethods(svc);
			return svc;
		},
		hasService: function(identifier) {
			return Object.prototype.hasOwnProperty.call(AWS$32.Service._serviceMap, identifier);
		},
		addDefaultMonitoringListeners: function addDefaultMonitoringListeners(attachOn) {
			attachOn.addNamedListener("MONITOR_EVENTS_BUBBLE", "apiCallAttempt", function EVENTS_BUBBLE(event) {
				var baseClass = Object.getPrototypeOf(attachOn);
				if (baseClass._events) baseClass.emit("apiCallAttempt", [event]);
			});
			attachOn.addNamedListener("CALL_EVENTS_BUBBLE", "apiCall", function CALL_EVENTS_BUBBLE(event) {
				var baseClass = Object.getPrototypeOf(attachOn);
				if (baseClass._events) baseClass.emit("apiCall", [event]);
			});
		},
		_serviceMap: {}
	});
	AWS$32.util.mixin(AWS$32.Service, AWS$32.SequentialExecutor);
	/**
	* @api private
	*/
	module.exports = AWS$32.Service;
}));

//#endregion
//#region node_modules/aws-sdk/lib/credentials.js
var require_credentials = /* @__PURE__ */ __commonJSMin((() => {
	var AWS$31 = require_core();
	/**
	* Represents your AWS security credentials, specifically the
	* {accessKeyId}, {secretAccessKey}, and optional {sessionToken}.
	* Creating a `Credentials` object allows you to pass around your
	* security information to configuration and service objects.
	*
	* Note that this class typically does not need to be constructed manually,
	* as the {AWS.Config} and {AWS.Service} classes both accept simple
	* options hashes with the three keys. These structures will be converted
	* into Credentials objects automatically.
	*
	* ## Expiring and Refreshing Credentials
	*
	* Occasionally credentials can expire in the middle of a long-running
	* application. In this case, the SDK will automatically attempt to
	* refresh the credentials from the storage location if the Credentials
	* class implements the {refresh} method.
	*
	* If you are implementing a credential storage location, you
	* will want to create a subclass of the `Credentials` class and
	* override the {refresh} method. This method allows credentials to be
	* retrieved from the backing store, be it a file system, database, or
	* some network storage. The method should reset the credential attributes
	* on the object.
	*
	* @!attribute expired
	*   @return [Boolean] whether the credentials have been expired and
	*     require a refresh. Used in conjunction with {expireTime}.
	* @!attribute expireTime
	*   @return [Date] a time when credentials should be considered expired. Used
	*     in conjunction with {expired}.
	* @!attribute accessKeyId
	*   @return [String] the AWS access key ID
	* @!attribute secretAccessKey
	*   @return [String] the AWS secret access key
	* @!attribute sessionToken
	*   @return [String] an optional AWS session token
	*/
	AWS$31.Credentials = AWS$31.util.inherit({
		constructor: function Credentials() {
			AWS$31.util.hideProperties(this, ["secretAccessKey"]);
			this.expired = false;
			this.expireTime = null;
			this.refreshCallbacks = [];
			if (arguments.length === 1 && typeof arguments[0] === "object") {
				var creds = arguments[0].credentials || arguments[0];
				this.accessKeyId = creds.accessKeyId;
				this.secretAccessKey = creds.secretAccessKey;
				this.sessionToken = creds.sessionToken;
			} else {
				this.accessKeyId = arguments[0];
				this.secretAccessKey = arguments[1];
				this.sessionToken = arguments[2];
			}
		},
		expiryWindow: 15,
		needsRefresh: function needsRefresh() {
			var currentTime = AWS$31.util.date.getDate().getTime();
			var adjustedTime = new Date(currentTime + this.expiryWindow * 1e3);
			if (this.expireTime && adjustedTime > this.expireTime) return true;
			else return this.expired || !this.accessKeyId || !this.secretAccessKey;
		},
		get: function get(callback) {
			var self = this;
			if (this.needsRefresh()) this.refresh(function(err) {
				if (!err) self.expired = false;
				if (callback) callback(err);
			});
			else if (callback) callback();
		},
		refresh: function refresh(callback) {
			this.expired = false;
			callback();
		},
		coalesceRefresh: function coalesceRefresh(callback, sync) {
			var self = this;
			if (self.refreshCallbacks.push(callback) === 1) self.load(function onLoad(err) {
				AWS$31.util.arrayEach(self.refreshCallbacks, function(callback$1) {
					if (sync) callback$1(err);
					else AWS$31.util.defer(function() {
						callback$1(err);
					});
				});
				self.refreshCallbacks.length = 0;
			});
		},
		load: function load(callback) {
			callback();
		}
	});
	/**
	* @api private
	*/
	AWS$31.Credentials.addPromisesToClass = function addPromisesToClass(PromiseDependency) {
		this.prototype.getPromise = AWS$31.util.promisifyMethod("get", PromiseDependency);
		this.prototype.refreshPromise = AWS$31.util.promisifyMethod("refresh", PromiseDependency);
	};
	/**
	* @api private
	*/
	AWS$31.Credentials.deletePromisesFromClass = function deletePromisesFromClass() {
		delete this.prototype.getPromise;
		delete this.prototype.refreshPromise;
	};
	AWS$31.util.addPromises(AWS$31.Credentials);
}));

//#endregion
//#region node_modules/aws-sdk/lib/credentials/credential_provider_chain.js
var require_credential_provider_chain = /* @__PURE__ */ __commonJSMin((() => {
	var AWS$30 = require_core();
	/**
	* Creates a credential provider chain that searches for AWS credentials
	* in a list of credential providers specified by the {providers} property.
	*
	* By default, the chain will use the {defaultProviders} to resolve credentials.
	* These providers will look in the environment using the
	* {AWS.EnvironmentCredentials} class with the 'AWS' and 'AMAZON' prefixes.
	*
	* ## Setting Providers
	*
	* Each provider in the {providers} list should be a function that returns
	* a {AWS.Credentials} object, or a hardcoded credentials object. The function
	* form allows for delayed execution of the credential construction.
	*
	* ## Resolving Credentials from a Chain
	*
	* Call {resolve} to return the first valid credential object that can be
	* loaded by the provider chain.
	*
	* For example, to resolve a chain with a custom provider that checks a file
	* on disk after the set of {defaultProviders}:
	*
	* ```javascript
	* var diskProvider = new AWS.FileSystemCredentials('./creds.json');
	* var chain = new AWS.CredentialProviderChain();
	* chain.providers.push(diskProvider);
	* chain.resolve();
	* ```
	*
	* The above code will return the `diskProvider` object if the
	* file contains credentials and the `defaultProviders` do not contain
	* any credential settings.
	*
	* @!attribute providers
	*   @return [Array<AWS.Credentials, Function>]
	*     a list of credentials objects or functions that return credentials
	*     objects. If the provider is a function, the function will be
	*     executed lazily when the provider needs to be checked for valid
	*     credentials. By default, this object will be set to the
	*     {defaultProviders}.
	*   @see defaultProviders
	*/
	AWS$30.CredentialProviderChain = AWS$30.util.inherit(AWS$30.Credentials, {
		constructor: function CredentialProviderChain(providers) {
			if (providers) this.providers = providers;
			else this.providers = AWS$30.CredentialProviderChain.defaultProviders.slice(0);
			this.resolveCallbacks = [];
		},
		resolve: function resolve(callback) {
			var self = this;
			if (self.providers.length === 0) {
				callback(/* @__PURE__ */ new Error("No providers"));
				return self;
			}
			if (self.resolveCallbacks.push(callback) === 1) {
				var index = 0;
				var providers = self.providers.slice(0);
				function resolveNext(err, creds) {
					if (!err && creds || index === providers.length) {
						AWS$30.util.arrayEach(self.resolveCallbacks, function(callback$1) {
							callback$1(err, creds);
						});
						self.resolveCallbacks.length = 0;
						return;
					}
					var provider = providers[index++];
					if (typeof provider === "function") creds = provider.call();
					else creds = provider;
					if (creds.get) creds.get(function(getErr) {
						resolveNext(getErr, getErr ? null : creds);
					});
					else resolveNext(null, creds);
				}
				resolveNext();
			}
			return self;
		}
	});
	/**
	* The default set of providers used by a vanilla CredentialProviderChain.
	*
	* In the browser:
	*
	* ```javascript
	* AWS.CredentialProviderChain.defaultProviders = []
	* ```
	*
	* In Node.js:
	*
	* ```javascript
	* AWS.CredentialProviderChain.defaultProviders = [
	*   function () { return new AWS.EnvironmentCredentials('AWS'); },
	*   function () { return new AWS.EnvironmentCredentials('AMAZON'); },
	*   function () { return new AWS.SsoCredentials(); },
	*   function () { return new AWS.SharedIniFileCredentials(); },
	*   function () { return new AWS.ECSCredentials(); },
	*   function () { return new AWS.ProcessCredentials(); },
	*   function () { return new AWS.TokenFileWebIdentityCredentials(); },
	*   function () { return new AWS.EC2MetadataCredentials() }
	* ]
	* ```
	*/
	AWS$30.CredentialProviderChain.defaultProviders = [];
	/**
	* @api private
	*/
	AWS$30.CredentialProviderChain.addPromisesToClass = function addPromisesToClass(PromiseDependency) {
		this.prototype.resolvePromise = AWS$30.util.promisifyMethod("resolve", PromiseDependency);
	};
	/**
	* @api private
	*/
	AWS$30.CredentialProviderChain.deletePromisesFromClass = function deletePromisesFromClass() {
		delete this.prototype.resolvePromise;
	};
	AWS$30.util.addPromises(AWS$30.CredentialProviderChain);
}));

//#endregion
//#region node_modules/aws-sdk/lib/config.js
var require_config = /* @__PURE__ */ __commonJSMin((() => {
	var AWS$29 = require_core();
	require_credentials();
	require_credential_provider_chain();
	var PromisesDependency;
	/**
	* The main configuration class used by all service objects to set
	* the region, credentials, and other options for requests.
	*
	* By default, credentials and region settings are left unconfigured.
	* This should be configured by the application before using any
	* AWS service APIs.
	*
	* In order to set global configuration options, properties should
	* be assigned to the global {AWS.config} object.
	*
	* @see AWS.config
	*
	* @!group General Configuration Options
	*
	* @!attribute credentials
	*   @return [AWS.Credentials] the AWS credentials to sign requests with.
	*
	* @!attribute region
	*   @example Set the global region setting to us-west-2
	*     AWS.config.update({region: 'us-west-2'});
	*   @return [AWS.Credentials] The region to send service requests to.
	*   @see http://docs.amazonwebservices.com/general/latest/gr/rande.html
	*     A list of available endpoints for each AWS service
	*
	* @!attribute maxRetries
	*   @return [Integer] the maximum amount of retries to perform for a
	*     service request. By default this value is calculated by the specific
	*     service object that the request is being made to.
	*
	* @!attribute maxRedirects
	*   @return [Integer] the maximum amount of redirects to follow for a
	*     service request. Defaults to 10.
	*
	* @!attribute paramValidation
	*   @return [Boolean|map] whether input parameters should be validated against
	*     the operation description before sending the request. Defaults to true.
	*     Pass a map to enable any of the following specific validation features:
	*
	*     * **min** [Boolean] &mdash; Validates that a value meets the min
	*       constraint. This is enabled by default when paramValidation is set
	*       to `true`.
	*     * **max** [Boolean] &mdash; Validates that a value meets the max
	*       constraint.
	*     * **pattern** [Boolean] &mdash; Validates that a string value matches a
	*       regular expression.
	*     * **enum** [Boolean] &mdash; Validates that a string value matches one
	*       of the allowable enum values.
	*
	* @!attribute computeChecksums
	*   @return [Boolean] whether to compute checksums for payload bodies when
	*     the service accepts it (currently supported in S3 and SQS only).
	*
	* @!attribute convertResponseTypes
	*   @return [Boolean] whether types are converted when parsing response data.
	*     Currently only supported for JSON based services. Turning this off may
	*     improve performance on large response payloads. Defaults to `true`.
	*
	* @!attribute correctClockSkew
	*   @return [Boolean] whether to apply a clock skew correction and retry
	*     requests that fail because of an skewed client clock. Defaults to
	*     `false`.
	*
	* @!attribute sslEnabled
	*   @return [Boolean] whether SSL is enabled for requests
	*
	* @!attribute s3ForcePathStyle
	*   @return [Boolean] whether to force path style URLs for S3 objects
	*
	* @!attribute s3BucketEndpoint
	*   @note Setting this configuration option requires an `endpoint` to be
	*     provided explicitly to the service constructor.
	*   @return [Boolean] whether the provided endpoint addresses an individual
	*     bucket (false if it addresses the root API endpoint).
	*
	* @!attribute s3DisableBodySigning
	*   @return [Boolean] whether to disable S3 body signing when using signature version `v4`.
	*     Body signing can only be disabled when using https. Defaults to `true`.
	*
	* @!attribute s3UsEast1RegionalEndpoint
	*   @return ['legacy'|'regional'] when region is set to 'us-east-1', whether to send s3
	*     request to global endpoints or 'us-east-1' regional endpoints. This config is only
	*     applicable to S3 client;
	*     Defaults to 'legacy'
	* @!attribute s3UseArnRegion
	*   @return [Boolean] whether to override the request region with the region inferred
	*     from requested resource's ARN. Only available for S3 buckets
	*     Defaults to `true`
	*
	* @!attribute useAccelerateEndpoint
	*   @note This configuration option is only compatible with S3 while accessing
	*     dns-compatible buckets.
	*   @return [Boolean] Whether to use the Accelerate endpoint with the S3 service.
	*     Defaults to `false`.
	*
	* @!attribute retryDelayOptions
	*   @example Set the base retry delay for all services to 300 ms
	*     AWS.config.update({retryDelayOptions: {base: 300}});
	*     // Delays with maxRetries = 3: 300, 600, 1200
	*   @example Set a custom backoff function to provide delay values on retries
	*     AWS.config.update({retryDelayOptions: {customBackoff: function(retryCount, err) {
	*       // returns delay in ms
	*     }}});
	*   @return [map] A set of options to configure the retry delay on retryable errors.
	*     Currently supported options are:
	*
	*     * **base** [Integer] &mdash; The base number of milliseconds to use in the
	*       exponential backoff for operation retries. Defaults to 100 ms for all services except
	*       DynamoDB, where it defaults to 50ms.
	*
	*     * **customBackoff ** [function] &mdash; A custom function that accepts a
	*       retry count and error and returns the amount of time to delay in
	*       milliseconds. If the result is a non-zero negative value, no further
	*       retry attempts will be made. The `base` option will be ignored if this
	*       option is supplied. The function is only called for retryable errors.
	*
	* @!attribute httpOptions
	*   @return [map] A set of options to pass to the low-level HTTP request.
	*     Currently supported options are:
	*
	*     * **proxy** [String] &mdash; the URL to proxy requests through
	*     * **agent** [http.Agent, https.Agent] &mdash; the Agent object to perform
	*       HTTP requests with. Used for connection pooling. Note that for
	*       SSL connections, a special Agent object is used in order to enable
	*       peer certificate verification. This feature is only supported in the
	*       Node.js environment.
	*     * **connectTimeout** [Integer] &mdash; Sets the socket to timeout after
	*       failing to establish a connection with the server after
	*       `connectTimeout` milliseconds. This timeout has no effect once a socket
	*       connection has been established.
	*     * **timeout** [Integer] &mdash; The number of milliseconds a request can
	*       take before automatically being terminated.
	*       Defaults to two minutes (120000).
	*     * **xhrAsync** [Boolean] &mdash; Whether the SDK will send asynchronous
	*       HTTP requests. Used in the browser environment only. Set to false to
	*       send requests synchronously. Defaults to true (async on).
	*     * **xhrWithCredentials** [Boolean] &mdash; Sets the "withCredentials"
	*       property of an XMLHttpRequest object. Used in the browser environment
	*       only. Defaults to false.
	* @!attribute logger
	*   @return [#write,#log] an object that responds to .write() (like a stream)
	*     or .log() (like the console object) in order to log information about
	*     requests
	*
	* @!attribute systemClockOffset
	*   @return [Number] an offset value in milliseconds to apply to all signing
	*     times. Use this to compensate for clock skew when your system may be
	*     out of sync with the service time. Note that this configuration option
	*     can only be applied to the global `AWS.config` object and cannot be
	*     overridden in service-specific configuration. Defaults to 0 milliseconds.
	*
	* @!attribute signatureVersion
	*   @return [String] the signature version to sign requests with (overriding
	*     the API configuration). Possible values are: 'v2', 'v3', 'v4'.
	*
	* @!attribute signatureCache
	*   @return [Boolean] whether the signature to sign requests with (overriding
	*     the API configuration) is cached. Only applies to the signature version 'v4'.
	*     Defaults to `true`.
	*
	* @!attribute endpointDiscoveryEnabled
	*   @return [Boolean|undefined] whether to call operations with endpoints
	*     given by service dynamically. Setting this config to `true` will enable
	*     endpoint discovery for all applicable operations. Setting it to `false`
	*     will explicitly disable endpoint discovery even though operations that
	*     require endpoint discovery will presumably fail. Leaving it to
	*     `undefined` means SDK only do endpoint discovery when it's required.
	*     Defaults to `undefined`
	*
	* @!attribute endpointCacheSize
	*   @return [Number] the size of the global cache storing endpoints from endpoint
	*     discovery operations. Once endpoint cache is created, updating this setting
	*     cannot change existing cache size.
	*     Defaults to 1000
	*
	* @!attribute hostPrefixEnabled
	*   @return [Boolean] whether to marshal request parameters to the prefix of
	*     hostname. Defaults to `true`.
	*
	* @!attribute stsRegionalEndpoints
	*   @return ['legacy'|'regional'] whether to send sts request to global endpoints or
	*     regional endpoints.
	*     Defaults to 'legacy'.
	*
	* @!attribute useFipsEndpoint
	*   @return [Boolean] Enables FIPS compatible endpoints. Defaults to `false`.
	*
	* @!attribute useDualstackEndpoint
	*   @return [Boolean] Enables IPv6 dualstack endpoint. Defaults to `false`.
	*/
	AWS$29.Config = AWS$29.util.inherit({
		constructor: function Config(options) {
			if (options === void 0) options = {};
			options = this.extractCredentials(options);
			AWS$29.util.each.call(this, this.keys, function(key, value) {
				this.set(key, options[key], value);
			});
		},
		getCredentials: function getCredentials(callback) {
			var self = this;
			function finish(err) {
				callback(err, err ? null : self.credentials);
			}
			function credError(msg, err) {
				return new AWS$29.util.error(err || /* @__PURE__ */ new Error(), {
					code: "CredentialsError",
					message: msg,
					name: "CredentialsError"
				});
			}
			function getAsyncCredentials() {
				self.credentials.get(function(err) {
					if (err) err = credError("Could not load credentials from " + self.credentials.constructor.name, err);
					finish(err);
				});
			}
			function getStaticCredentials() {
				var err = null;
				if (!self.credentials.accessKeyId || !self.credentials.secretAccessKey) err = credError("Missing credentials");
				finish(err);
			}
			if (self.credentials) if (typeof self.credentials.get === "function") getAsyncCredentials();
			else getStaticCredentials();
			else if (self.credentialProvider) self.credentialProvider.resolve(function(err, creds) {
				if (err) err = credError("Could not load credentials from any providers", err);
				self.credentials = creds;
				finish(err);
			});
			else finish(credError("No credentials to load"));
		},
		getToken: function getToken(callback) {
			var self = this;
			function finish(err) {
				callback(err, err ? null : self.token);
			}
			function tokenError(msg, err) {
				return new AWS$29.util.error(err || /* @__PURE__ */ new Error(), {
					code: "TokenError",
					message: msg,
					name: "TokenError"
				});
			}
			function getAsyncToken() {
				self.token.get(function(err) {
					if (err) err = tokenError("Could not load token from " + self.token.constructor.name, err);
					finish(err);
				});
			}
			function getStaticToken() {
				var err = null;
				if (!self.token.token) err = tokenError("Missing token");
				finish(err);
			}
			if (self.token) if (typeof self.token.get === "function") getAsyncToken();
			else getStaticToken();
			else if (self.tokenProvider) self.tokenProvider.resolve(function(err, token) {
				if (err) err = tokenError("Could not load token from any providers", err);
				self.token = token;
				finish(err);
			});
			else finish(tokenError("No token to load"));
		},
		update: function update(options, allowUnknownKeys) {
			allowUnknownKeys = allowUnknownKeys || false;
			options = this.extractCredentials(options);
			AWS$29.util.each.call(this, options, function(key, value) {
				if (allowUnknownKeys || Object.prototype.hasOwnProperty.call(this.keys, key) || AWS$29.Service.hasService(key)) this.set(key, value);
			});
		},
		loadFromPath: function loadFromPath(path) {
			this.clear();
			var options = JSON.parse(AWS$29.util.readFileSync(path));
			var fileSystemCreds = new AWS$29.FileSystemCredentials(path);
			var chain = new AWS$29.CredentialProviderChain();
			chain.providers.unshift(fileSystemCreds);
			chain.resolve(function(err, creds) {
				if (err) throw err;
				else options.credentials = creds;
			});
			this.constructor(options);
			return this;
		},
		clear: function clear() {
			AWS$29.util.each.call(this, this.keys, function(key) {
				delete this[key];
			});
			this.set("credentials", void 0);
			this.set("credentialProvider", void 0);
		},
		set: function set(property$5, value, defaultValue) {
			if (value === void 0) {
				if (defaultValue === void 0) defaultValue = this.keys[property$5];
				if (typeof defaultValue === "function") this[property$5] = defaultValue.call(this);
				else this[property$5] = defaultValue;
			} else if (property$5 === "httpOptions" && this[property$5]) this[property$5] = AWS$29.util.merge(this[property$5], value);
			else this[property$5] = value;
		},
		keys: {
			credentials: null,
			credentialProvider: null,
			region: null,
			logger: null,
			apiVersions: {},
			apiVersion: null,
			endpoint: void 0,
			httpOptions: { timeout: 12e4 },
			maxRetries: void 0,
			maxRedirects: 10,
			paramValidation: true,
			sslEnabled: true,
			s3ForcePathStyle: false,
			s3BucketEndpoint: false,
			s3DisableBodySigning: true,
			s3UsEast1RegionalEndpoint: "legacy",
			s3UseArnRegion: void 0,
			computeChecksums: true,
			convertResponseTypes: true,
			correctClockSkew: false,
			customUserAgent: null,
			dynamoDbCrc32: true,
			systemClockOffset: 0,
			signatureVersion: null,
			signatureCache: true,
			retryDelayOptions: {},
			useAccelerateEndpoint: false,
			clientSideMonitoring: false,
			endpointDiscoveryEnabled: void 0,
			endpointCacheSize: 1e3,
			hostPrefixEnabled: true,
			stsRegionalEndpoints: "legacy",
			useFipsEndpoint: false,
			useDualstackEndpoint: false,
			token: null
		},
		extractCredentials: function extractCredentials(options) {
			if (options.accessKeyId && options.secretAccessKey) {
				options = AWS$29.util.copy(options);
				options.credentials = new AWS$29.Credentials(options);
			}
			return options;
		},
		setPromisesDependency: function setPromisesDependency(dep) {
			PromisesDependency = dep;
			if (dep === null && typeof Promise === "function") PromisesDependency = Promise;
			var constructors = [
				AWS$29.Request,
				AWS$29.Credentials,
				AWS$29.CredentialProviderChain
			];
			if (AWS$29.S3) {
				constructors.push(AWS$29.S3);
				if (AWS$29.S3.ManagedUpload) constructors.push(AWS$29.S3.ManagedUpload);
			}
			AWS$29.util.addPromises(constructors, PromisesDependency);
		},
		getPromisesDependency: function getPromisesDependency() {
			return PromisesDependency;
		}
	});
	/**
	* @return [AWS.Config] The global configuration object singleton instance
	* @readonly
	* @see AWS.Config
	*/
	AWS$29.config = new AWS$29.Config();
}));

//#endregion
//#region node_modules/aws-sdk/lib/http.js
var require_http = /* @__PURE__ */ __commonJSMin((() => {
	var AWS$28 = require_core();
	var inherit$10 = AWS$28.util.inherit;
	/**
	* The endpoint that a service will talk to, for example,
	* `'https://ec2.ap-southeast-1.amazonaws.com'`. If
	* you need to override an endpoint for a service, you can
	* set the endpoint on a service by passing the endpoint
	* object with the `endpoint` option key:
	*
	* ```javascript
	* var ep = new AWS.Endpoint('awsproxy.example.com');
	* var s3 = new AWS.S3({endpoint: ep});
	* s3.service.endpoint.hostname == 'awsproxy.example.com'
	* ```
	*
	* Note that if you do not specify a protocol, the protocol will
	* be selected based on your current {AWS.config} configuration.
	*
	* @!attribute protocol
	*   @return [String] the protocol (http or https) of the endpoint
	*     URL
	* @!attribute hostname
	*   @return [String] the host portion of the endpoint, e.g.,
	*     example.com
	* @!attribute host
	*   @return [String] the host portion of the endpoint including
	*     the port, e.g., example.com:80
	* @!attribute port
	*   @return [Integer] the port of the endpoint
	* @!attribute href
	*   @return [String] the full URL of the endpoint
	*/
	AWS$28.Endpoint = inherit$10({ constructor: function Endpoint(endpoint, config) {
		AWS$28.util.hideProperties(this, [
			"slashes",
			"auth",
			"hash",
			"search",
			"query"
		]);
		if (typeof endpoint === "undefined" || endpoint === null) throw new Error("Invalid endpoint: " + endpoint);
		else if (typeof endpoint !== "string") return AWS$28.util.copy(endpoint);
		if (!endpoint.match(/^http/)) endpoint = ((config && config.sslEnabled !== void 0 ? config.sslEnabled : AWS$28.config.sslEnabled) ? "https" : "http") + "://" + endpoint;
		AWS$28.util.update(this, AWS$28.util.urlParse(endpoint));
		if (this.port) this.port = parseInt(this.port, 10);
		else this.port = this.protocol === "https:" ? 443 : 80;
	} });
	/**
	* The low level HTTP request object, encapsulating all HTTP header
	* and body data sent by a service request.
	*
	* @!attribute method
	*   @return [String] the HTTP method of the request
	* @!attribute path
	*   @return [String] the path portion of the URI, e.g.,
	*     "/list/?start=5&num=10"
	* @!attribute headers
	*   @return [map<String,String>]
	*     a map of header keys and their respective values
	* @!attribute body
	*   @return [String] the request body payload
	* @!attribute endpoint
	*   @return [AWS.Endpoint] the endpoint for the request
	* @!attribute region
	*   @api private
	*   @return [String] the region, for signing purposes only.
	*/
	AWS$28.HttpRequest = inherit$10({
		constructor: function HttpRequest(endpoint, region) {
			endpoint = new AWS$28.Endpoint(endpoint);
			this.method = "POST";
			this.path = endpoint.path || "/";
			this.headers = {};
			this.body = "";
			this.endpoint = endpoint;
			this.region = region;
			this._userAgent = "";
			this.setUserAgent();
		},
		setUserAgent: function setUserAgent() {
			this._userAgent = this.headers[this.getUserAgentHeaderName()] = AWS$28.util.userAgent();
		},
		getUserAgentHeaderName: function getUserAgentHeaderName() {
			return (AWS$28.util.isBrowser() ? "X-Amz-" : "") + "User-Agent";
		},
		appendToUserAgent: function appendToUserAgent(agentPartial) {
			if (typeof agentPartial === "string" && agentPartial) this._userAgent += " " + agentPartial;
			this.headers[this.getUserAgentHeaderName()] = this._userAgent;
		},
		getUserAgent: function getUserAgent() {
			return this._userAgent;
		},
		pathname: function pathname() {
			return this.path.split("?", 1)[0];
		},
		search: function search() {
			var query = this.path.split("?", 2)[1];
			if (query) {
				query = AWS$28.util.queryStringParse(query);
				return AWS$28.util.queryParamsToString(query);
			}
			return "";
		},
		updateEndpoint: function updateEndpoint(endpointStr) {
			var newEndpoint = new AWS$28.Endpoint(endpointStr);
			this.endpoint = newEndpoint;
			this.path = newEndpoint.path || "/";
			if (this.headers["Host"]) this.headers["Host"] = newEndpoint.host;
		}
	});
	/**
	* The low level HTTP response object, encapsulating all HTTP header
	* and body data returned from the request.
	*
	* @!attribute statusCode
	*   @return [Integer] the HTTP status code of the response (e.g., 200, 404)
	* @!attribute headers
	*   @return [map<String,String>]
	*      a map of response header keys and their respective values
	* @!attribute body
	*   @return [String] the response body payload
	* @!attribute [r] streaming
	*   @return [Boolean] whether this response is being streamed at a low-level.
	*     Defaults to `false` (buffered reads). Do not modify this manually, use
	*     {createUnbufferedStream} to convert the stream to unbuffered mode
	*     instead.
	*/
	AWS$28.HttpResponse = inherit$10({
		constructor: function HttpResponse() {
			this.statusCode = void 0;
			this.headers = {};
			this.body = void 0;
			this.streaming = false;
			this.stream = null;
		},
		createUnbufferedStream: function createUnbufferedStream() {
			this.streaming = true;
			return this.stream;
		}
	});
	AWS$28.HttpClient = inherit$10({});
	/**
	* @api private
	*/
	AWS$28.HttpClient.getInstance = function getInstance() {
		if (this.singleton === void 0) this.singleton = new this();
		return this.singleton;
	};
}));

//#endregion
//#region node_modules/aws-sdk/lib/discover_endpoint.js
var require_discover_endpoint = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var AWS$27 = require_core();
	var util$5 = require_util();
	var endpointDiscoveryEnabledEnvs = ["AWS_ENABLE_ENDPOINT_DISCOVERY", "AWS_ENDPOINT_DISCOVERY_ENABLED"];
	/**
	* Generate key (except resources and operation part) to index the endpoints in the cache
	* If input shape has endpointdiscoveryid trait then use
	*   accessKey + operation + resources + region + service as cache key
	* If input shape doesn't have endpointdiscoveryid trait then use
	*   accessKey + region + service as cache key
	* @return [map<String,String>] object with keys to index endpoints.
	* @api private
	*/
	function getCacheKey(request) {
		var service = request.service;
		var api = service.api || {};
		api.operations;
		var identifiers = {};
		if (service.config.region) identifiers.region = service.config.region;
		if (api.serviceId) identifiers.serviceId = api.serviceId;
		if (service.config.credentials.accessKeyId) identifiers.accessKeyId = service.config.credentials.accessKeyId;
		return identifiers;
	}
	/**
	* Recursive helper for marshallCustomIdentifiers().
	* Looks for required string input members that have 'endpointdiscoveryid' trait.
	* @api private
	*/
	function marshallCustomIdentifiersHelper(result, params, shape) {
		if (!shape || params === void 0 || params === null) return;
		if (shape.type === "structure" && shape.required && shape.required.length > 0) util$5.arrayEach(shape.required, function(name) {
			var memberShape = shape.members[name];
			if (memberShape.endpointDiscoveryId === true) {
				var locationName = memberShape.isLocationName ? memberShape.name : name;
				result[locationName] = String(params[name]);
			} else marshallCustomIdentifiersHelper(result, params[name], memberShape);
		});
	}
	/**
	* Get custom identifiers for cache key.
	* Identifies custom identifiers by checking each shape's `endpointDiscoveryId` trait.
	* @param [object] request object
	* @param [object] input shape of the given operation's api
	* @api private
	*/
	function marshallCustomIdentifiers(request, shape) {
		var identifiers = {};
		marshallCustomIdentifiersHelper(identifiers, request.params, shape);
		return identifiers;
	}
	/**
	* Call endpoint discovery operation when it's optional.
	* When endpoint is available in cache then use the cached endpoints. If endpoints
	* are unavailable then use regional endpoints and call endpoint discovery operation
	* asynchronously. This is turned off by default.
	* @param [object] request object
	* @api private
	*/
	function optionalDiscoverEndpoint(request) {
		var service = request.service;
		var api = service.api;
		var operationModel = api.operations ? api.operations[request.operation] : void 0;
		var identifiers = marshallCustomIdentifiers(request, operationModel ? operationModel.input : void 0);
		var cacheKey = getCacheKey(request);
		if (Object.keys(identifiers).length > 0) {
			cacheKey = util$5.update(cacheKey, identifiers);
			if (operationModel) cacheKey.operation = operationModel.name;
		}
		var endpoints = AWS$27.endpointCache.get(cacheKey);
		if (endpoints && endpoints.length === 1 && endpoints[0].Address === "") return;
		else if (endpoints && endpoints.length > 0) request.httpRequest.updateEndpoint(endpoints[0].Address);
		else {
			var endpointRequest = service.makeRequest(api.endpointOperation, {
				Operation: operationModel.name,
				Identifiers: identifiers
			});
			addApiVersionHeader(endpointRequest);
			endpointRequest.removeListener("validate", AWS$27.EventListeners.Core.VALIDATE_PARAMETERS);
			endpointRequest.removeListener("retry", AWS$27.EventListeners.Core.RETRY_CHECK);
			AWS$27.endpointCache.put(cacheKey, [{
				Address: "",
				CachePeriodInMinutes: 1
			}]);
			endpointRequest.send(function(err, data) {
				if (data && data.Endpoints) AWS$27.endpointCache.put(cacheKey, data.Endpoints);
				else if (err) AWS$27.endpointCache.put(cacheKey, [{
					Address: "",
					CachePeriodInMinutes: 1
				}]);
			});
		}
	}
	var requestQueue = {};
	/**
	* Call endpoint discovery operation when it's required.
	* When endpoint is available in cache then use cached ones. If endpoints are
	* unavailable then SDK should call endpoint operation then use returned new
	* endpoint for the api call. SDK will automatically attempt to do endpoint
	* discovery. This is turned off by default
	* @param [object] request object
	* @api private
	*/
	function requiredDiscoverEndpoint(request, done) {
		var service = request.service;
		var api = service.api;
		var operationModel = api.operations ? api.operations[request.operation] : void 0;
		var identifiers = marshallCustomIdentifiers(request, operationModel ? operationModel.input : void 0);
		var cacheKey = getCacheKey(request);
		if (Object.keys(identifiers).length > 0) {
			cacheKey = util$5.update(cacheKey, identifiers);
			if (operationModel) cacheKey.operation = operationModel.name;
		}
		var cacheKeyStr = AWS$27.EndpointCache.getKeyString(cacheKey);
		var endpoints = AWS$27.endpointCache.get(cacheKeyStr);
		if (endpoints && endpoints.length === 1 && endpoints[0].Address === "") {
			if (!requestQueue[cacheKeyStr]) requestQueue[cacheKeyStr] = [];
			requestQueue[cacheKeyStr].push({
				request,
				callback: done
			});
			return;
		} else if (endpoints && endpoints.length > 0) {
			request.httpRequest.updateEndpoint(endpoints[0].Address);
			done();
		} else {
			var endpointRequest = service.makeRequest(api.endpointOperation, {
				Operation: operationModel.name,
				Identifiers: identifiers
			});
			endpointRequest.removeListener("validate", AWS$27.EventListeners.Core.VALIDATE_PARAMETERS);
			addApiVersionHeader(endpointRequest);
			AWS$27.endpointCache.put(cacheKeyStr, [{
				Address: "",
				CachePeriodInMinutes: 60
			}]);
			endpointRequest.send(function(err, data) {
				if (err) {
					request.response.error = util$5.error(err, { retryable: false });
					AWS$27.endpointCache.remove(cacheKey);
					if (requestQueue[cacheKeyStr]) {
						var pendingRequests = requestQueue[cacheKeyStr];
						util$5.arrayEach(pendingRequests, function(requestContext) {
							requestContext.request.response.error = util$5.error(err, { retryable: false });
							requestContext.callback();
						});
						delete requestQueue[cacheKeyStr];
					}
				} else if (data) {
					AWS$27.endpointCache.put(cacheKeyStr, data.Endpoints);
					request.httpRequest.updateEndpoint(data.Endpoints[0].Address);
					if (requestQueue[cacheKeyStr]) {
						var pendingRequests = requestQueue[cacheKeyStr];
						util$5.arrayEach(pendingRequests, function(requestContext) {
							requestContext.request.httpRequest.updateEndpoint(data.Endpoints[0].Address);
							requestContext.callback();
						});
						delete requestQueue[cacheKeyStr];
					}
				}
				done();
			});
		}
	}
	/**
	* add api version header to endpoint operation
	* @api private
	*/
	function addApiVersionHeader(endpointRequest) {
		var apiVersion = endpointRequest.service.api.apiVersion;
		if (apiVersion && !endpointRequest.httpRequest.headers["x-amz-api-version"]) endpointRequest.httpRequest.headers["x-amz-api-version"] = apiVersion;
	}
	/**
	* If api call gets invalid endpoint exception, SDK should attempt to remove the invalid
	* endpoint from cache.
	* @api private
	*/
	function invalidateCachedEndpoints(response) {
		var error = response.error;
		var httpResponse = response.httpResponse;
		if (error && (error.code === "InvalidEndpointException" || httpResponse.statusCode === 421)) {
			var request = response.request;
			var operations = request.service.api.operations || {};
			var identifiers = marshallCustomIdentifiers(request, operations[request.operation] ? operations[request.operation].input : void 0);
			var cacheKey = getCacheKey(request);
			if (Object.keys(identifiers).length > 0) {
				cacheKey = util$5.update(cacheKey, identifiers);
				if (operations[request.operation]) cacheKey.operation = operations[request.operation].name;
			}
			AWS$27.endpointCache.remove(cacheKey);
		}
	}
	/**
	* If endpoint is explicitly configured, SDK should not do endpoint discovery in anytime.
	* @param [object] client Service client object.
	* @api private
	*/
	function hasCustomEndpoint(client$1) {
		if (client$1._originalConfig && client$1._originalConfig.endpoint && client$1._originalConfig.endpointDiscoveryEnabled === true) throw util$5.error(/* @__PURE__ */ new Error(), {
			code: "ConfigurationException",
			message: "Custom endpoint is supplied; endpointDiscoveryEnabled must not be true."
		});
		var svcConfig = AWS$27.config[client$1.serviceIdentifier] || {};
		return Boolean(AWS$27.config.endpoint || svcConfig.endpoint || client$1._originalConfig && client$1._originalConfig.endpoint);
	}
	/**
	* @api private
	*/
	function isFalsy(value) {
		return ["false", "0"].indexOf(value) >= 0;
	}
	/**
	* If endpoint discovery should perform for this request when no operation requires endpoint
	* discovery for the given service.
	* SDK performs config resolution in order like below:
	* 1. If set in client configuration.
	* 2. If set in env AWS_ENABLE_ENDPOINT_DISCOVERY.
	* 3. If set in shared ini config file with key 'endpoint_discovery_enabled'.
	* @param [object] request request object.
	* @returns [boolean|undefined] if endpoint discovery config is not set in any source, this
	*  function returns undefined
	* @api private
	*/
	function resolveEndpointDiscoveryConfig(request) {
		var service = request.service || {};
		if (service.config.endpointDiscoveryEnabled !== void 0) return service.config.endpointDiscoveryEnabled;
		if (util$5.isBrowser()) return void 0;
		for (var i$2 = 0; i$2 < endpointDiscoveryEnabledEnvs.length; i$2++) {
			var env = endpointDiscoveryEnabledEnvs[i$2];
			if (Object.prototype.hasOwnProperty.call(process.env, env)) {
				if (process.env[env] === "" || process.env[env] === void 0) throw util$5.error(/* @__PURE__ */ new Error(), {
					code: "ConfigurationException",
					message: "environmental variable " + env + " cannot be set to nothing"
				});
				return !isFalsy(process.env[env]);
			}
		}
		var configFile = {};
		try {
			configFile = AWS$27.util.iniLoader ? AWS$27.util.iniLoader.loadFrom({
				isConfig: true,
				filename: process.env[AWS$27.util.sharedConfigFileEnv]
			}) : {};
		} catch (e) {}
		var sharedFileConfig = configFile[process.env.AWS_PROFILE || AWS$27.util.defaultProfile] || {};
		if (Object.prototype.hasOwnProperty.call(sharedFileConfig, "endpoint_discovery_enabled")) {
			if (sharedFileConfig.endpoint_discovery_enabled === void 0) throw util$5.error(/* @__PURE__ */ new Error(), {
				code: "ConfigurationException",
				message: "config file entry 'endpoint_discovery_enabled' cannot be set to nothing"
			});
			return !isFalsy(sharedFileConfig.endpoint_discovery_enabled);
		}
	}
	/**
	* attach endpoint discovery logic to request object
	* @param [object] request
	* @api private
	*/
	function discoverEndpoint(request, done) {
		var service = request.service || {};
		if (hasCustomEndpoint(service) || request.isPresigned()) return done();
		var operationModel = (service.api.operations || {})[request.operation];
		var isEndpointDiscoveryRequired = operationModel ? operationModel.endpointDiscoveryRequired : "NULL";
		var isEnabled = resolveEndpointDiscoveryConfig(request);
		var hasRequiredEndpointDiscovery = service.api.hasRequiredEndpointDiscovery;
		if (isEnabled || hasRequiredEndpointDiscovery) request.httpRequest.appendToUserAgent("endpoint-discovery");
		switch (isEndpointDiscoveryRequired) {
			case "OPTIONAL":
				if (isEnabled || hasRequiredEndpointDiscovery) {
					optionalDiscoverEndpoint(request);
					request.addNamedListener("INVALIDATE_CACHED_ENDPOINTS", "extractError", invalidateCachedEndpoints);
				}
				done();
				break;
			case "REQUIRED":
				if (isEnabled === false) {
					request.response.error = util$5.error(/* @__PURE__ */ new Error(), {
						code: "ConfigurationException",
						message: "Endpoint Discovery is disabled but " + service.api.className + "." + request.operation + "() requires it. Please check your configurations."
					});
					done();
					break;
				}
				request.addNamedListener("INVALIDATE_CACHED_ENDPOINTS", "extractError", invalidateCachedEndpoints);
				requiredDiscoverEndpoint(request, done);
				break;
			case "NULL":
			default:
				done();
				break;
		}
	}
	module.exports = {
		discoverEndpoint,
		requiredDiscoverEndpoint,
		optionalDiscoverEndpoint,
		marshallCustomIdentifiers,
		getCacheKey,
		invalidateCachedEndpoint: invalidateCachedEndpoints
	};
}));

//#endregion
//#region node_modules/has-symbols/shams.js
var require_shams$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/** @type {import('./shams')} */
	module.exports = function hasSymbols$2() {
		if (typeof Symbol !== "function" || typeof Object.getOwnPropertySymbols !== "function") return false;
		if (typeof Symbol.iterator === "symbol") return true;
		/** @type {{ [k in symbol]?: unknown }} */
		var obj = {};
		var sym = Symbol("test");
		var symObj = Object(sym);
		if (typeof sym === "string") return false;
		if (Object.prototype.toString.call(sym) !== "[object Symbol]") return false;
		if (Object.prototype.toString.call(symObj) !== "[object Symbol]") return false;
		var symVal = 42;
		obj[sym] = symVal;
		for (var _ in obj) return false;
		if (typeof Object.keys === "function" && Object.keys(obj).length !== 0) return false;
		if (typeof Object.getOwnPropertyNames === "function" && Object.getOwnPropertyNames(obj).length !== 0) return false;
		var syms = Object.getOwnPropertySymbols(obj);
		if (syms.length !== 1 || syms[0] !== sym) return false;
		if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) return false;
		if (typeof Object.getOwnPropertyDescriptor === "function") {
			var descriptor = Object.getOwnPropertyDescriptor(obj, sym);
			if (descriptor.value !== symVal || descriptor.enumerable !== true) return false;
		}
		return true;
	};
}));

//#endregion
//#region node_modules/has-tostringtag/shams.js
var require_shams = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var hasSymbols$1 = require_shams$1();
	/** @type {import('.')} */
	module.exports = function hasToStringTagShams() {
		return hasSymbols$1() && !!Symbol.toStringTag;
	};
}));

//#endregion
//#region node_modules/es-object-atoms/index.js
var require_es_object_atoms = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/** @type {import('.')} */
	module.exports = Object;
}));

//#endregion
//#region node_modules/es-errors/index.js
var require_es_errors = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/** @type {import('.')} */
	module.exports = Error;
}));

//#endregion
//#region node_modules/es-errors/eval.js
var require_eval = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/** @type {import('./eval')} */
	module.exports = EvalError;
}));

//#endregion
//#region node_modules/es-errors/range.js
var require_range = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/** @type {import('./range')} */
	module.exports = RangeError;
}));

//#endregion
//#region node_modules/es-errors/ref.js
var require_ref = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/** @type {import('./ref')} */
	module.exports = ReferenceError;
}));

//#endregion
//#region node_modules/es-errors/syntax.js
var require_syntax = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/** @type {import('./syntax')} */
	module.exports = SyntaxError;
}));

//#endregion
//#region node_modules/es-errors/type.js
var require_type = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/** @type {import('./type')} */
	module.exports = TypeError;
}));

//#endregion
//#region node_modules/es-errors/uri.js
var require_uri = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/** @type {import('./uri')} */
	module.exports = URIError;
}));

//#endregion
//#region node_modules/math-intrinsics/abs.js
var require_abs = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/** @type {import('./abs')} */
	module.exports = Math.abs;
}));

//#endregion
//#region node_modules/math-intrinsics/floor.js
var require_floor = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/** @type {import('./floor')} */
	module.exports = Math.floor;
}));

//#endregion
//#region node_modules/math-intrinsics/max.js
var require_max = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/** @type {import('./max')} */
	module.exports = Math.max;
}));

//#endregion
//#region node_modules/math-intrinsics/min.js
var require_min = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/** @type {import('./min')} */
	module.exports = Math.min;
}));

//#endregion
//#region node_modules/math-intrinsics/pow.js
var require_pow = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/** @type {import('./pow')} */
	module.exports = Math.pow;
}));

//#endregion
//#region node_modules/math-intrinsics/round.js
var require_round = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/** @type {import('./round')} */
	module.exports = Math.round;
}));

//#endregion
//#region node_modules/math-intrinsics/isNaN.js
var require_isNaN = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/** @type {import('./isNaN')} */
	module.exports = Number.isNaN || function isNaN$1(a) {
		return a !== a;
	};
}));

//#endregion
//#region node_modules/math-intrinsics/sign.js
var require_sign = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var $isNaN = require_isNaN();
	/** @type {import('./sign')} */
	module.exports = function sign$1(number) {
		if ($isNaN(number) || number === 0) return number;
		return number < 0 ? -1 : 1;
	};
}));

//#endregion
//#region node_modules/gopd/gOPD.js
var require_gOPD = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/** @type {import('./gOPD')} */
	module.exports = Object.getOwnPropertyDescriptor;
}));

//#endregion
//#region node_modules/gopd/index.js
var require_gopd = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/** @type {import('.')} */
	var $gOPD$1 = require_gOPD();
	if ($gOPD$1) try {
		$gOPD$1([], "length");
	} catch (e) {
		$gOPD$1 = null;
	}
	module.exports = $gOPD$1;
}));

//#endregion
//#region node_modules/es-define-property/index.js
var require_es_define_property = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/** @type {import('.')} */
	var $defineProperty$4 = Object.defineProperty || false;
	if ($defineProperty$4) try {
		$defineProperty$4({}, "a", { value: 1 });
	} catch (e) {
		$defineProperty$4 = false;
	}
	module.exports = $defineProperty$4;
}));

//#endregion
//#region node_modules/has-symbols/index.js
var require_has_symbols = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var origSymbol = typeof Symbol !== "undefined" && Symbol;
	var hasSymbolSham = require_shams$1();
	/** @type {import('.')} */
	module.exports = function hasNativeSymbols() {
		if (typeof origSymbol !== "function") return false;
		if (typeof Symbol !== "function") return false;
		if (typeof origSymbol("foo") !== "symbol") return false;
		if (typeof Symbol("bar") !== "symbol") return false;
		return hasSymbolSham();
	};
}));

//#endregion
//#region node_modules/get-proto/Reflect.getPrototypeOf.js
var require_Reflect_getPrototypeOf = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/** @type {import('./Reflect.getPrototypeOf')} */
	module.exports = typeof Reflect !== "undefined" && Reflect.getPrototypeOf || null;
}));

//#endregion
//#region node_modules/get-proto/Object.getPrototypeOf.js
var require_Object_getPrototypeOf = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var $Object$2 = require_es_object_atoms();
	/** @type {import('./Object.getPrototypeOf')} */
	module.exports = $Object$2.getPrototypeOf || null;
}));

//#endregion
//#region node_modules/function-bind/implementation.js
var require_implementation = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var ERROR_MESSAGE = "Function.prototype.bind called on incompatible ";
	var toStr$3 = Object.prototype.toString;
	var max$1 = Math.max;
	var funcType = "[object Function]";
	var concatty = function concatty$1(a, b) {
		var arr = [];
		for (var i$2 = 0; i$2 < a.length; i$2 += 1) arr[i$2] = a[i$2];
		for (var j = 0; j < b.length; j += 1) arr[j + a.length] = b[j];
		return arr;
	};
	var slicy = function slicy$1(arrLike, offset) {
		var arr = [];
		for (var i$2 = offset || 0, j = 0; i$2 < arrLike.length; i$2 += 1, j += 1) arr[j] = arrLike[i$2];
		return arr;
	};
	var joiny = function(arr, joiner) {
		var str = "";
		for (var i$2 = 0; i$2 < arr.length; i$2 += 1) {
			str += arr[i$2];
			if (i$2 + 1 < arr.length) str += joiner;
		}
		return str;
	};
	module.exports = function bind$5(that) {
		var target = this;
		if (typeof target !== "function" || toStr$3.apply(target) !== funcType) throw new TypeError(ERROR_MESSAGE + target);
		var args = slicy(arguments, 1);
		var bound;
		var binder = function() {
			if (this instanceof bound) {
				var result = target.apply(this, concatty(args, arguments));
				if (Object(result) === result) return result;
				return this;
			}
			return target.apply(that, concatty(args, arguments));
		};
		var boundLength = max$1(0, target.length - args.length);
		var boundArgs = [];
		for (var i$2 = 0; i$2 < boundLength; i$2++) boundArgs[i$2] = "$" + i$2;
		bound = Function("binder", "return function (" + joiny(boundArgs, ",") + "){ return binder.apply(this,arguments); }")(binder);
		if (target.prototype) {
			var Empty = function Empty$1() {};
			Empty.prototype = target.prototype;
			bound.prototype = new Empty();
			Empty.prototype = null;
		}
		return bound;
	};
}));

//#endregion
//#region node_modules/function-bind/index.js
var require_function_bind = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var implementation = require_implementation();
	module.exports = Function.prototype.bind || implementation;
}));

//#endregion
//#region node_modules/call-bind-apply-helpers/functionCall.js
var require_functionCall = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/** @type {import('./functionCall')} */
	module.exports = Function.prototype.call;
}));

//#endregion
//#region node_modules/call-bind-apply-helpers/functionApply.js
var require_functionApply = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/** @type {import('./functionApply')} */
	module.exports = Function.prototype.apply;
}));

//#endregion
//#region node_modules/call-bind-apply-helpers/reflectApply.js
var require_reflectApply = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/** @type {import('./reflectApply')} */
	module.exports = typeof Reflect !== "undefined" && Reflect && Reflect.apply;
}));

//#endregion
//#region node_modules/call-bind-apply-helpers/actualApply.js
var require_actualApply = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var bind$4 = require_function_bind();
	var $apply$2 = require_functionApply();
	var $call$2 = require_functionCall();
	var $reflectApply = require_reflectApply();
	/** @type {import('./actualApply')} */
	module.exports = $reflectApply || bind$4.call($call$2, $apply$2);
}));

//#endregion
//#region node_modules/call-bind-apply-helpers/index.js
var require_call_bind_apply_helpers = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var bind$3 = require_function_bind();
	var $TypeError$4 = require_type();
	var $call$1 = require_functionCall();
	var $actualApply = require_actualApply();
	/** @type {(args: [Function, thisArg?: unknown, ...args: unknown[]]) => Function} TODO FIXME, find a way to use import('.') */
	module.exports = function callBindBasic$2(args) {
		if (args.length < 1 || typeof args[0] !== "function") throw new $TypeError$4("a function is required");
		return $actualApply(bind$3, $call$1, args);
	};
}));

//#endregion
//#region node_modules/dunder-proto/get.js
var require_get = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var callBind$1 = require_call_bind_apply_helpers();
	var gOPD$3 = require_gopd();
	var hasProtoAccessor;
	try {
		hasProtoAccessor = [].__proto__ === Array.prototype;
	} catch (e) {
		if (!e || typeof e !== "object" || !("code" in e) || e.code !== "ERR_PROTO_ACCESS") throw e;
	}
	var desc = !!hasProtoAccessor && gOPD$3 && gOPD$3(Object.prototype, "__proto__");
	var $Object$1 = Object;
	var $getPrototypeOf = $Object$1.getPrototypeOf;
	/** @type {import('./get')} */
	module.exports = desc && typeof desc.get === "function" ? callBind$1([desc.get]) : typeof $getPrototypeOf === "function" ? function getDunder(value) {
		return $getPrototypeOf(value == null ? value : $Object$1(value));
	} : false;
}));

//#endregion
//#region node_modules/get-proto/index.js
var require_get_proto = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var reflectGetProto = require_Reflect_getPrototypeOf();
	var originalGetProto = require_Object_getPrototypeOf();
	var getDunderProto = require_get();
	/** @type {import('.')} */
	module.exports = reflectGetProto ? function getProto$3(O) {
		return reflectGetProto(O);
	} : originalGetProto ? function getProto$3(O) {
		if (!O || typeof O !== "object" && typeof O !== "function") throw new TypeError("getProto: not an object");
		return originalGetProto(O);
	} : getDunderProto ? function getProto$3(O) {
		return getDunderProto(O);
	} : null;
}));

//#endregion
//#region node_modules/hasown/index.js
var require_hasown = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var call = Function.prototype.call;
	var $hasOwn = Object.prototype.hasOwnProperty;
	var bind$2 = require_function_bind();
	/** @type {import('.')} */
	module.exports = bind$2.call(call, $hasOwn);
}));

//#endregion
//#region node_modules/get-intrinsic/index.js
var require_get_intrinsic = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var undefined$1;
	var $Object = require_es_object_atoms();
	var $Error = require_es_errors();
	var $EvalError = require_eval();
	var $RangeError = require_range();
	var $ReferenceError = require_ref();
	var $SyntaxError$1 = require_syntax();
	var $TypeError$3 = require_type();
	var $URIError = require_uri();
	var abs = require_abs();
	var floor = require_floor();
	var max = require_max();
	var min = require_min();
	var pow = require_pow();
	var round = require_round();
	var sign = require_sign();
	var $Function = Function;
	var getEvalledConstructor = function(expressionSyntax) {
		try {
			return $Function("\"use strict\"; return (" + expressionSyntax + ").constructor;")();
		} catch (e) {}
	};
	var $gOPD = require_gopd();
	var $defineProperty$3 = require_es_define_property();
	var throwTypeError = function() {
		throw new $TypeError$3();
	};
	var ThrowTypeError = $gOPD ? function() {
		try {
			arguments.callee;
			return throwTypeError;
		} catch (calleeThrows) {
			try {
				return $gOPD(arguments, "callee").get;
			} catch (gOPDthrows) {
				return throwTypeError;
			}
		}
	}() : throwTypeError;
	var hasSymbols = require_has_symbols()();
	var getProto$2 = require_get_proto();
	var $ObjectGPO = require_Object_getPrototypeOf();
	var $ReflectGPO = require_Reflect_getPrototypeOf();
	var $apply$1 = require_functionApply();
	var $call = require_functionCall();
	var needsEval = {};
	var TypedArray = typeof Uint8Array === "undefined" || !getProto$2 ? undefined$1 : getProto$2(Uint8Array);
	var INTRINSICS = {
		__proto__: null,
		"%AggregateError%": typeof AggregateError === "undefined" ? undefined$1 : AggregateError,
		"%Array%": Array,
		"%ArrayBuffer%": typeof ArrayBuffer === "undefined" ? undefined$1 : ArrayBuffer,
		"%ArrayIteratorPrototype%": hasSymbols && getProto$2 ? getProto$2([][Symbol.iterator]()) : undefined$1,
		"%AsyncFromSyncIteratorPrototype%": undefined$1,
		"%AsyncFunction%": needsEval,
		"%AsyncGenerator%": needsEval,
		"%AsyncGeneratorFunction%": needsEval,
		"%AsyncIteratorPrototype%": needsEval,
		"%Atomics%": typeof Atomics === "undefined" ? undefined$1 : Atomics,
		"%BigInt%": typeof BigInt === "undefined" ? undefined$1 : BigInt,
		"%BigInt64Array%": typeof BigInt64Array === "undefined" ? undefined$1 : BigInt64Array,
		"%BigUint64Array%": typeof BigUint64Array === "undefined" ? undefined$1 : BigUint64Array,
		"%Boolean%": Boolean,
		"%DataView%": typeof DataView === "undefined" ? undefined$1 : DataView,
		"%Date%": Date,
		"%decodeURI%": decodeURI,
		"%decodeURIComponent%": decodeURIComponent,
		"%encodeURI%": encodeURI,
		"%encodeURIComponent%": encodeURIComponent,
		"%Error%": $Error,
		"%eval%": eval,
		"%EvalError%": $EvalError,
		"%Float16Array%": typeof Float16Array === "undefined" ? undefined$1 : Float16Array,
		"%Float32Array%": typeof Float32Array === "undefined" ? undefined$1 : Float32Array,
		"%Float64Array%": typeof Float64Array === "undefined" ? undefined$1 : Float64Array,
		"%FinalizationRegistry%": typeof FinalizationRegistry === "undefined" ? undefined$1 : FinalizationRegistry,
		"%Function%": $Function,
		"%GeneratorFunction%": needsEval,
		"%Int8Array%": typeof Int8Array === "undefined" ? undefined$1 : Int8Array,
		"%Int16Array%": typeof Int16Array === "undefined" ? undefined$1 : Int16Array,
		"%Int32Array%": typeof Int32Array === "undefined" ? undefined$1 : Int32Array,
		"%isFinite%": isFinite,
		"%isNaN%": isNaN,
		"%IteratorPrototype%": hasSymbols && getProto$2 ? getProto$2(getProto$2([][Symbol.iterator]())) : undefined$1,
		"%JSON%": typeof JSON === "object" ? JSON : undefined$1,
		"%Map%": typeof Map === "undefined" ? undefined$1 : Map,
		"%MapIteratorPrototype%": typeof Map === "undefined" || !hasSymbols || !getProto$2 ? undefined$1 : getProto$2((/* @__PURE__ */ new Map())[Symbol.iterator]()),
		"%Math%": Math,
		"%Number%": Number,
		"%Object%": $Object,
		"%Object.getOwnPropertyDescriptor%": $gOPD,
		"%parseFloat%": parseFloat,
		"%parseInt%": parseInt,
		"%Promise%": typeof Promise === "undefined" ? undefined$1 : Promise,
		"%Proxy%": typeof Proxy === "undefined" ? undefined$1 : Proxy,
		"%RangeError%": $RangeError,
		"%ReferenceError%": $ReferenceError,
		"%Reflect%": typeof Reflect === "undefined" ? undefined$1 : Reflect,
		"%RegExp%": RegExp,
		"%Set%": typeof Set === "undefined" ? undefined$1 : Set,
		"%SetIteratorPrototype%": typeof Set === "undefined" || !hasSymbols || !getProto$2 ? undefined$1 : getProto$2((/* @__PURE__ */ new Set())[Symbol.iterator]()),
		"%SharedArrayBuffer%": typeof SharedArrayBuffer === "undefined" ? undefined$1 : SharedArrayBuffer,
		"%String%": String,
		"%StringIteratorPrototype%": hasSymbols && getProto$2 ? getProto$2(""[Symbol.iterator]()) : undefined$1,
		"%Symbol%": hasSymbols ? Symbol : undefined$1,
		"%SyntaxError%": $SyntaxError$1,
		"%ThrowTypeError%": ThrowTypeError,
		"%TypedArray%": TypedArray,
		"%TypeError%": $TypeError$3,
		"%Uint8Array%": typeof Uint8Array === "undefined" ? undefined$1 : Uint8Array,
		"%Uint8ClampedArray%": typeof Uint8ClampedArray === "undefined" ? undefined$1 : Uint8ClampedArray,
		"%Uint16Array%": typeof Uint16Array === "undefined" ? undefined$1 : Uint16Array,
		"%Uint32Array%": typeof Uint32Array === "undefined" ? undefined$1 : Uint32Array,
		"%URIError%": $URIError,
		"%WeakMap%": typeof WeakMap === "undefined" ? undefined$1 : WeakMap,
		"%WeakRef%": typeof WeakRef === "undefined" ? undefined$1 : WeakRef,
		"%WeakSet%": typeof WeakSet === "undefined" ? undefined$1 : WeakSet,
		"%Function.prototype.call%": $call,
		"%Function.prototype.apply%": $apply$1,
		"%Object.defineProperty%": $defineProperty$3,
		"%Object.getPrototypeOf%": $ObjectGPO,
		"%Math.abs%": abs,
		"%Math.floor%": floor,
		"%Math.max%": max,
		"%Math.min%": min,
		"%Math.pow%": pow,
		"%Math.round%": round,
		"%Math.sign%": sign,
		"%Reflect.getPrototypeOf%": $ReflectGPO
	};
	if (getProto$2) try {
		null.error;
	} catch (e) {
		INTRINSICS["%Error.prototype%"] = getProto$2(getProto$2(e));
	}
	var doEval = function doEval$1(name) {
		var value;
		if (name === "%AsyncFunction%") value = getEvalledConstructor("async function () {}");
		else if (name === "%GeneratorFunction%") value = getEvalledConstructor("function* () {}");
		else if (name === "%AsyncGeneratorFunction%") value = getEvalledConstructor("async function* () {}");
		else if (name === "%AsyncGenerator%") {
			var fn$1 = doEval$1("%AsyncGeneratorFunction%");
			if (fn$1) value = fn$1.prototype;
		} else if (name === "%AsyncIteratorPrototype%") {
			var gen = doEval$1("%AsyncGenerator%");
			if (gen && getProto$2) value = getProto$2(gen.prototype);
		}
		INTRINSICS[name] = value;
		return value;
	};
	var LEGACY_ALIASES = {
		__proto__: null,
		"%ArrayBufferPrototype%": ["ArrayBuffer", "prototype"],
		"%ArrayPrototype%": ["Array", "prototype"],
		"%ArrayProto_entries%": [
			"Array",
			"prototype",
			"entries"
		],
		"%ArrayProto_forEach%": [
			"Array",
			"prototype",
			"forEach"
		],
		"%ArrayProto_keys%": [
			"Array",
			"prototype",
			"keys"
		],
		"%ArrayProto_values%": [
			"Array",
			"prototype",
			"values"
		],
		"%AsyncFunctionPrototype%": ["AsyncFunction", "prototype"],
		"%AsyncGenerator%": ["AsyncGeneratorFunction", "prototype"],
		"%AsyncGeneratorPrototype%": [
			"AsyncGeneratorFunction",
			"prototype",
			"prototype"
		],
		"%BooleanPrototype%": ["Boolean", "prototype"],
		"%DataViewPrototype%": ["DataView", "prototype"],
		"%DatePrototype%": ["Date", "prototype"],
		"%ErrorPrototype%": ["Error", "prototype"],
		"%EvalErrorPrototype%": ["EvalError", "prototype"],
		"%Float32ArrayPrototype%": ["Float32Array", "prototype"],
		"%Float64ArrayPrototype%": ["Float64Array", "prototype"],
		"%FunctionPrototype%": ["Function", "prototype"],
		"%Generator%": ["GeneratorFunction", "prototype"],
		"%GeneratorPrototype%": [
			"GeneratorFunction",
			"prototype",
			"prototype"
		],
		"%Int8ArrayPrototype%": ["Int8Array", "prototype"],
		"%Int16ArrayPrototype%": ["Int16Array", "prototype"],
		"%Int32ArrayPrototype%": ["Int32Array", "prototype"],
		"%JSONParse%": ["JSON", "parse"],
		"%JSONStringify%": ["JSON", "stringify"],
		"%MapPrototype%": ["Map", "prototype"],
		"%NumberPrototype%": ["Number", "prototype"],
		"%ObjectPrototype%": ["Object", "prototype"],
		"%ObjProto_toString%": [
			"Object",
			"prototype",
			"toString"
		],
		"%ObjProto_valueOf%": [
			"Object",
			"prototype",
			"valueOf"
		],
		"%PromisePrototype%": ["Promise", "prototype"],
		"%PromiseProto_then%": [
			"Promise",
			"prototype",
			"then"
		],
		"%Promise_all%": ["Promise", "all"],
		"%Promise_reject%": ["Promise", "reject"],
		"%Promise_resolve%": ["Promise", "resolve"],
		"%RangeErrorPrototype%": ["RangeError", "prototype"],
		"%ReferenceErrorPrototype%": ["ReferenceError", "prototype"],
		"%RegExpPrototype%": ["RegExp", "prototype"],
		"%SetPrototype%": ["Set", "prototype"],
		"%SharedArrayBufferPrototype%": ["SharedArrayBuffer", "prototype"],
		"%StringPrototype%": ["String", "prototype"],
		"%SymbolPrototype%": ["Symbol", "prototype"],
		"%SyntaxErrorPrototype%": ["SyntaxError", "prototype"],
		"%TypedArrayPrototype%": ["TypedArray", "prototype"],
		"%TypeErrorPrototype%": ["TypeError", "prototype"],
		"%Uint8ArrayPrototype%": ["Uint8Array", "prototype"],
		"%Uint8ClampedArrayPrototype%": ["Uint8ClampedArray", "prototype"],
		"%Uint16ArrayPrototype%": ["Uint16Array", "prototype"],
		"%Uint32ArrayPrototype%": ["Uint32Array", "prototype"],
		"%URIErrorPrototype%": ["URIError", "prototype"],
		"%WeakMapPrototype%": ["WeakMap", "prototype"],
		"%WeakSetPrototype%": ["WeakSet", "prototype"]
	};
	var bind$1 = require_function_bind();
	var hasOwn$1 = require_hasown();
	var $concat = bind$1.call($call, Array.prototype.concat);
	var $spliceApply = bind$1.call($apply$1, Array.prototype.splice);
	var $replace = bind$1.call($call, String.prototype.replace);
	var $strSlice = bind$1.call($call, String.prototype.slice);
	var $exec$2 = bind$1.call($call, RegExp.prototype.exec);
	var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
	var reEscapeChar = /\\(\\)?/g;
	var stringToPath = function stringToPath$1(string) {
		var first = $strSlice(string, 0, 1);
		var last = $strSlice(string, -1);
		if (first === "%" && last !== "%") throw new $SyntaxError$1("invalid intrinsic syntax, expected closing `%`");
		else if (last === "%" && first !== "%") throw new $SyntaxError$1("invalid intrinsic syntax, expected opening `%`");
		var result = [];
		$replace(string, rePropName, function(match, number, quote, subString) {
			result[result.length] = quote ? $replace(subString, reEscapeChar, "$1") : number || match;
		});
		return result;
	};
	var getBaseIntrinsic = function getBaseIntrinsic$1(name, allowMissing) {
		var intrinsicName = name;
		var alias;
		if (hasOwn$1(LEGACY_ALIASES, intrinsicName)) {
			alias = LEGACY_ALIASES[intrinsicName];
			intrinsicName = "%" + alias[0] + "%";
		}
		if (hasOwn$1(INTRINSICS, intrinsicName)) {
			var value = INTRINSICS[intrinsicName];
			if (value === needsEval) value = doEval(intrinsicName);
			if (typeof value === "undefined" && !allowMissing) throw new $TypeError$3("intrinsic " + name + " exists, but is not available. Please file an issue!");
			return {
				alias,
				name: intrinsicName,
				value
			};
		}
		throw new $SyntaxError$1("intrinsic " + name + " does not exist!");
	};
	module.exports = function GetIntrinsic$2(name, allowMissing) {
		if (typeof name !== "string" || name.length === 0) throw new $TypeError$3("intrinsic name must be a non-empty string");
		if (arguments.length > 1 && typeof allowMissing !== "boolean") throw new $TypeError$3("\"allowMissing\" argument must be a boolean");
		if ($exec$2(/^%?[^%]*%?$/, name) === null) throw new $SyntaxError$1("`%` may not be present anywhere but at the beginning and end of the intrinsic name");
		var parts = stringToPath(name);
		var intrinsicBaseName = parts.length > 0 ? parts[0] : "";
		var intrinsic = getBaseIntrinsic("%" + intrinsicBaseName + "%", allowMissing);
		var intrinsicRealName = intrinsic.name;
		var value = intrinsic.value;
		var skipFurtherCaching = false;
		var alias = intrinsic.alias;
		if (alias) {
			intrinsicBaseName = alias[0];
			$spliceApply(parts, $concat([0, 1], alias));
		}
		for (var i$2 = 1, isOwn = true; i$2 < parts.length; i$2 += 1) {
			var part = parts[i$2];
			var first = $strSlice(part, 0, 1);
			var last = $strSlice(part, -1);
			if ((first === "\"" || first === "'" || first === "`" || last === "\"" || last === "'" || last === "`") && first !== last) throw new $SyntaxError$1("property names with quotes must have matching quotes");
			if (part === "constructor" || !isOwn) skipFurtherCaching = true;
			intrinsicBaseName += "." + part;
			intrinsicRealName = "%" + intrinsicBaseName + "%";
			if (hasOwn$1(INTRINSICS, intrinsicRealName)) value = INTRINSICS[intrinsicRealName];
			else if (value != null) {
				if (!(part in value)) {
					if (!allowMissing) throw new $TypeError$3("base intrinsic for " + name + " exists, but the property is not available.");
					return;
				}
				if ($gOPD && i$2 + 1 >= parts.length) {
					var desc$1 = $gOPD(value, part);
					isOwn = !!desc$1;
					if (isOwn && "get" in desc$1 && !("originalValue" in desc$1.get)) value = desc$1.get;
					else value = value[part];
				} else {
					isOwn = hasOwn$1(value, part);
					value = value[part];
				}
				if (isOwn && !skipFurtherCaching) INTRINSICS[intrinsicRealName] = value;
			}
		}
		return value;
	};
}));

//#endregion
//#region node_modules/call-bound/index.js
var require_call_bound = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var GetIntrinsic$1 = require_get_intrinsic();
	var callBindBasic$1 = require_call_bind_apply_helpers();
	/** @type {(thisArg: string, searchString: string, position?: number) => number} */
	var $indexOf$1 = callBindBasic$1([GetIntrinsic$1("%String.prototype.indexOf%")]);
	/** @type {import('.')} */
	module.exports = function callBoundIntrinsic(name, allowMissing) {
		var intrinsic = GetIntrinsic$1(name, !!allowMissing);
		if (typeof intrinsic === "function" && $indexOf$1(name, ".prototype.") > -1) return callBindBasic$1([intrinsic]);
		return intrinsic;
	};
}));

//#endregion
//#region node_modules/is-arguments/index.js
var require_is_arguments = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var hasToStringTag$4 = require_shams()();
	var $toString$2 = require_call_bound()("Object.prototype.toString");
	/** @type {import('.')} */
	var isStandardArguments = function isArguments(value) {
		if (hasToStringTag$4 && value && typeof value === "object" && Symbol.toStringTag in value) return false;
		return $toString$2(value) === "[object Arguments]";
	};
	/** @type {import('.')} */
	var isLegacyArguments = function isArguments(value) {
		if (isStandardArguments(value)) return true;
		return value !== null && typeof value === "object" && "length" in value && typeof value.length === "number" && value.length >= 0 && $toString$2(value) !== "[object Array]" && "callee" in value && $toString$2(value.callee) === "[object Function]";
	};
	var supportsStandardArguments = function() {
		return isStandardArguments(arguments);
	}();
	isStandardArguments.isLegacyArguments = isLegacyArguments;
	/** @type {import('.')} */
	module.exports = supportsStandardArguments ? isStandardArguments : isLegacyArguments;
}));

//#endregion
//#region node_modules/is-regex/index.js
var require_is_regex = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var callBound$3 = require_call_bound();
	var hasToStringTag$3 = require_shams()();
	var hasOwn = require_hasown();
	var gOPD$2 = require_gopd();
	/** @type {import('.')} */
	var fn;
	if (hasToStringTag$3) {
		/** @type {(receiver: ThisParameterType<typeof RegExp.prototype.exec>, ...args: Parameters<typeof RegExp.prototype.exec>) => ReturnType<typeof RegExp.prototype.exec>} */
		var $exec$1 = callBound$3("RegExp.prototype.exec");
		/** @type {object} */
		var isRegexMarker = {};
		var throwRegexMarker = function() {
			throw isRegexMarker;
		};
		/** @type {{ toString(): never, valueOf(): never, [Symbol.toPrimitive]?(): never }} */
		var badStringifier = {
			toString: throwRegexMarker,
			valueOf: throwRegexMarker
		};
		if (typeof Symbol.toPrimitive === "symbol") badStringifier[Symbol.toPrimitive] = throwRegexMarker;
		/** @type {import('.')} */
		fn = function isRegex$1(value) {
			if (!value || typeof value !== "object") return false;
			var descriptor = gOPD$2(value, "lastIndex");
			if (!(descriptor && hasOwn(descriptor, "value"))) return false;
			try {
				$exec$1(value, badStringifier);
			} catch (e) {
				return e === isRegexMarker;
			}
		};
	} else {
		/** @type {(receiver: ThisParameterType<typeof Object.prototype.toString>, ...args: Parameters<typeof Object.prototype.toString>) => ReturnType<typeof Object.prototype.toString>} */
		var $toString$1 = callBound$3("Object.prototype.toString");
		/** @const @type {'[object RegExp]'} */
		var regexClass = "[object RegExp]";
		/** @type {import('.')} */
		fn = function isRegex$1(value) {
			if (!value || typeof value !== "object" && typeof value !== "function") return false;
			return $toString$1(value) === regexClass;
		};
	}
	module.exports = fn;
}));

//#endregion
//#region node_modules/safe-regex-test/index.js
var require_safe_regex_test = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var callBound$2 = require_call_bound();
	var isRegex = require_is_regex();
	var $exec = callBound$2("RegExp.prototype.exec");
	var $TypeError$2 = require_type();
	/** @type {import('.')} */
	module.exports = function regexTester(regex) {
		if (!isRegex(regex)) throw new $TypeError$2("`regex` must be a RegExp");
		return function test(s) {
			return $exec(regex, s) !== null;
		};
	};
}));

//#endregion
//#region node_modules/generator-function/index.js
var require_generator_function = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const cached = function* () {}.constructor;
	/** @type {import('.')} */
	module.exports = () => cached;
}));

//#endregion
//#region node_modules/is-generator-function/index.js
var require_is_generator_function = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var callBound$1 = require_call_bound();
	var isFnRegex = require_safe_regex_test()(/^\s*(?:function)?\*/);
	var hasToStringTag$2 = require_shams()();
	var getProto$1 = require_get_proto();
	var toStr$2 = callBound$1("Object.prototype.toString");
	var fnToStr$1 = callBound$1("Function.prototype.toString");
	var getGeneratorFunction = require_generator_function();
	/** @type {import('.')} */
	module.exports = function isGeneratorFunction$1(fn$1) {
		if (typeof fn$1 !== "function") return false;
		if (isFnRegex(fnToStr$1(fn$1))) return true;
		if (!hasToStringTag$2) return toStr$2(fn$1) === "[object GeneratorFunction]";
		if (!getProto$1) return false;
		var GeneratorFunction = getGeneratorFunction();
		return GeneratorFunction && getProto$1(fn$1) === GeneratorFunction.prototype;
	};
}));

//#endregion
//#region node_modules/is-callable/index.js
var require_is_callable = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var fnToStr = Function.prototype.toString;
	var reflectApply = typeof Reflect === "object" && Reflect !== null && Reflect.apply;
	var badArrayLike;
	var isCallableMarker;
	if (typeof reflectApply === "function" && typeof Object.defineProperty === "function") try {
		badArrayLike = Object.defineProperty({}, "length", { get: function() {
			throw isCallableMarker;
		} });
		isCallableMarker = {};
		reflectApply(function() {
			throw 42;
		}, null, badArrayLike);
	} catch (_) {
		if (_ !== isCallableMarker) reflectApply = null;
	}
	else reflectApply = null;
	var constructorRegex = /^\s*class\b/;
	var isES6ClassFn = function isES6ClassFunction(value) {
		try {
			var fnStr = fnToStr.call(value);
			return constructorRegex.test(fnStr);
		} catch (e) {
			return false;
		}
	};
	var tryFunctionObject = function tryFunctionToStr(value) {
		try {
			if (isES6ClassFn(value)) return false;
			fnToStr.call(value);
			return true;
		} catch (e) {
			return false;
		}
	};
	var toStr$1 = Object.prototype.toString;
	var objectClass = "[object Object]";
	var fnClass = "[object Function]";
	var genClass = "[object GeneratorFunction]";
	var ddaClass = "[object HTMLAllCollection]";
	var ddaClass2 = "[object HTML document.all class]";
	var ddaClass3 = "[object HTMLCollection]";
	var hasToStringTag$1 = typeof Symbol === "function" && !!Symbol.toStringTag;
	var isIE68 = !(0 in [,]);
	var isDDA = function isDocumentDotAll() {
		return false;
	};
	if (typeof document === "object") {
		var all = document.all;
		if (toStr$1.call(all) === toStr$1.call(document.all)) isDDA = function isDocumentDotAll(value) {
			if ((isIE68 || !value) && (typeof value === "undefined" || typeof value === "object")) try {
				var str = toStr$1.call(value);
				return (str === ddaClass || str === ddaClass2 || str === ddaClass3 || str === objectClass) && value("") == null;
			} catch (e) {}
			return false;
		};
	}
	module.exports = reflectApply ? function isCallable$1(value) {
		if (isDDA(value)) return true;
		if (!value) return false;
		if (typeof value !== "function" && typeof value !== "object") return false;
		try {
			reflectApply(value, null, badArrayLike);
		} catch (e) {
			if (e !== isCallableMarker) return false;
		}
		return !isES6ClassFn(value) && tryFunctionObject(value);
	} : function isCallable$1(value) {
		if (isDDA(value)) return true;
		if (!value) return false;
		if (typeof value !== "function" && typeof value !== "object") return false;
		if (hasToStringTag$1) return tryFunctionObject(value);
		if (isES6ClassFn(value)) return false;
		var strClass = toStr$1.call(value);
		if (strClass !== fnClass && strClass !== genClass && !/^\[object HTML/.test(strClass)) return false;
		return tryFunctionObject(value);
	};
}));

//#endregion
//#region node_modules/for-each/index.js
var require_for_each = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var isCallable = require_is_callable();
	var toStr = Object.prototype.toString;
	var hasOwnProperty$3 = Object.prototype.hasOwnProperty;
	/** @type {<This, A extends readonly unknown[]>(arr: A, iterator: (this: This | void, value: A[number], index: number, arr: A) => void, receiver: This | undefined) => void} */
	var forEachArray = function forEachArray$1(array, iterator, receiver) {
		for (var i$2 = 0, len$1 = array.length; i$2 < len$1; i$2++) if (hasOwnProperty$3.call(array, i$2)) if (receiver == null) iterator(array[i$2], i$2, array);
		else iterator.call(receiver, array[i$2], i$2, array);
	};
	/** @type {<This, S extends string>(string: S, iterator: (this: This | void, value: S[number], index: number, string: S) => void, receiver: This | undefined) => void} */
	var forEachString = function forEachString$1(string, iterator, receiver) {
		for (var i$2 = 0, len$1 = string.length; i$2 < len$1; i$2++) if (receiver == null) iterator(string.charAt(i$2), i$2, string);
		else iterator.call(receiver, string.charAt(i$2), i$2, string);
	};
	/** @type {<This, O>(obj: O, iterator: (this: This | void, value: O[keyof O], index: keyof O, obj: O) => void, receiver: This | undefined) => void} */
	var forEachObject = function forEachObject$1(object, iterator, receiver) {
		for (var k in object) if (hasOwnProperty$3.call(object, k)) if (receiver == null) iterator(object[k], k, object);
		else iterator.call(receiver, object[k], k, object);
	};
	/** @type {(x: unknown) => x is readonly unknown[]} */
	function isArray$2(x) {
		return toStr.call(x) === "[object Array]";
	}
	/** @type {import('.')._internal} */
	module.exports = function forEach$1(list, iterator, thisArg) {
		if (!isCallable(iterator)) throw new TypeError("iterator must be a function");
		var receiver;
		if (arguments.length >= 3) receiver = thisArg;
		if (isArray$2(list)) forEachArray(list, iterator, receiver);
		else if (typeof list === "string") forEachString(list, iterator, receiver);
		else forEachObject(list, iterator, receiver);
	};
}));

//#endregion
//#region node_modules/possible-typed-array-names/index.js
var require_possible_typed_array_names = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/** @type {import('.')} */
	module.exports = [
		"Float16Array",
		"Float32Array",
		"Float64Array",
		"Int8Array",
		"Int16Array",
		"Int32Array",
		"Uint8Array",
		"Uint8ClampedArray",
		"Uint16Array",
		"Uint32Array",
		"BigInt64Array",
		"BigUint64Array"
	];
}));

//#endregion
//#region node_modules/available-typed-arrays/index.js
var require_available_typed_arrays = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var possibleNames = require_possible_typed_array_names();
	var g$1 = typeof globalThis === "undefined" ? global : globalThis;
	/** @type {import('.')} */
	module.exports = function availableTypedArrays$1() {
		var out = [];
		for (var i$2 = 0; i$2 < possibleNames.length; i$2++) if (typeof g$1[possibleNames[i$2]] === "function") out[out.length] = possibleNames[i$2];
		return out;
	};
}));

//#endregion
//#region node_modules/define-data-property/index.js
var require_define_data_property = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var $defineProperty$2 = require_es_define_property();
	var $SyntaxError = require_syntax();
	var $TypeError$1 = require_type();
	var gopd = require_gopd();
	/** @type {import('.')} */
	module.exports = function defineDataProperty(obj, property$5, value) {
		if (!obj || typeof obj !== "object" && typeof obj !== "function") throw new $TypeError$1("`obj` must be an object or a function`");
		if (typeof property$5 !== "string" && typeof property$5 !== "symbol") throw new $TypeError$1("`property` must be a string or a symbol`");
		if (arguments.length > 3 && typeof arguments[3] !== "boolean" && arguments[3] !== null) throw new $TypeError$1("`nonEnumerable`, if provided, must be a boolean or null");
		if (arguments.length > 4 && typeof arguments[4] !== "boolean" && arguments[4] !== null) throw new $TypeError$1("`nonWritable`, if provided, must be a boolean or null");
		if (arguments.length > 5 && typeof arguments[5] !== "boolean" && arguments[5] !== null) throw new $TypeError$1("`nonConfigurable`, if provided, must be a boolean or null");
		if (arguments.length > 6 && typeof arguments[6] !== "boolean") throw new $TypeError$1("`loose`, if provided, must be a boolean");
		var nonEnumerable = arguments.length > 3 ? arguments[3] : null;
		var nonWritable = arguments.length > 4 ? arguments[4] : null;
		var nonConfigurable = arguments.length > 5 ? arguments[5] : null;
		var loose = arguments.length > 6 ? arguments[6] : false;
		var desc$1 = !!gopd && gopd(obj, property$5);
		if ($defineProperty$2) $defineProperty$2(obj, property$5, {
			configurable: nonConfigurable === null && desc$1 ? desc$1.configurable : !nonConfigurable,
			enumerable: nonEnumerable === null && desc$1 ? desc$1.enumerable : !nonEnumerable,
			value,
			writable: nonWritable === null && desc$1 ? desc$1.writable : !nonWritable
		});
		else if (loose || !nonEnumerable && !nonWritable && !nonConfigurable) obj[property$5] = value;
		else throw new $SyntaxError("This environment does not support defining a property as non-configurable, non-writable, or non-enumerable.");
	};
}));

//#endregion
//#region node_modules/has-property-descriptors/index.js
var require_has_property_descriptors = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var $defineProperty$1 = require_es_define_property();
	var hasPropertyDescriptors = function hasPropertyDescriptors$1() {
		return !!$defineProperty$1;
	};
	hasPropertyDescriptors.hasArrayLengthDefineBug = function hasArrayLengthDefineBug() {
		if (!$defineProperty$1) return null;
		try {
			return $defineProperty$1([], "length", { value: 1 }).length !== 1;
		} catch (e) {
			return true;
		}
	};
	module.exports = hasPropertyDescriptors;
}));

//#endregion
//#region node_modules/set-function-length/index.js
var require_set_function_length = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var GetIntrinsic = require_get_intrinsic();
	var define$1 = require_define_data_property();
	var hasDescriptors = require_has_property_descriptors()();
	var gOPD$1 = require_gopd();
	var $TypeError = require_type();
	var $floor = GetIntrinsic("%Math.floor%");
	/** @type {import('.')} */
	module.exports = function setFunctionLength$1(fn$1, length) {
		if (typeof fn$1 !== "function") throw new $TypeError("`fn` is not a function");
		if (typeof length !== "number" || length < 0 || length > 4294967295 || $floor(length) !== length) throw new $TypeError("`length` must be a positive 32-bit integer");
		var loose = arguments.length > 2 && !!arguments[2];
		var functionLengthIsConfigurable = true;
		var functionLengthIsWritable = true;
		if ("length" in fn$1 && gOPD$1) {
			var desc$1 = gOPD$1(fn$1, "length");
			if (desc$1 && !desc$1.configurable) functionLengthIsConfigurable = false;
			if (desc$1 && !desc$1.writable) functionLengthIsWritable = false;
		}
		if (functionLengthIsConfigurable || functionLengthIsWritable || !loose) if (hasDescriptors) define$1(fn$1, "length", length, true, true);
		else define$1(fn$1, "length", length);
		return fn$1;
	};
}));

//#endregion
//#region node_modules/call-bind-apply-helpers/applyBind.js
var require_applyBind = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var bind = require_function_bind();
	var $apply = require_functionApply();
	var actualApply = require_actualApply();
	/** @type {import('./applyBind')} */
	module.exports = function applyBind$1() {
		return actualApply(bind, $apply, arguments);
	};
}));

//#endregion
//#region node_modules/call-bind/index.js
var require_call_bind = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var setFunctionLength = require_set_function_length();
	var $defineProperty = require_es_define_property();
	var callBindBasic = require_call_bind_apply_helpers();
	var applyBind = require_applyBind();
	module.exports = function callBind$2(originalFunction) {
		var func = callBindBasic(arguments);
		var adjustedLength = originalFunction.length - (arguments.length - 1);
		return setFunctionLength(func, 1 + (adjustedLength > 0 ? adjustedLength : 0), true);
	};
	if ($defineProperty) $defineProperty(module.exports, "apply", { value: applyBind });
	else module.exports.apply = applyBind;
}));

//#endregion
//#region node_modules/which-typed-array/index.js
var require_which_typed_array = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var forEach = require_for_each();
	var availableTypedArrays = require_available_typed_arrays();
	var callBind = require_call_bind();
	var callBound = require_call_bound();
	var gOPD = require_gopd();
	var getProto = require_get_proto();
	var $toString = callBound("Object.prototype.toString");
	var hasToStringTag = require_shams()();
	var g = typeof globalThis === "undefined" ? global : globalThis;
	var typedArrays = availableTypedArrays();
	var $slice = callBound("String.prototype.slice");
	/** @type {<T = unknown>(array: readonly T[], value: unknown) => number} */
	var $indexOf = callBound("Array.prototype.indexOf", true) || function indexOf(array, value) {
		for (var i$2 = 0; i$2 < array.length; i$2 += 1) if (array[i$2] === value) return i$2;
		return -1;
	};
	/** @typedef {import('./types').Getter} Getter */
	/** @type {import('./types').Cache} */
	var cache = { __proto__: null };
	if (hasToStringTag && gOPD && getProto) forEach(typedArrays, function(typedArray) {
		var arr = new g[typedArray]();
		if (Symbol.toStringTag in arr && getProto) {
			var proto = getProto(arr);
			var descriptor = gOPD(proto, Symbol.toStringTag);
			if (!descriptor && proto) descriptor = gOPD(getProto(proto), Symbol.toStringTag);
			cache["$" + typedArray] = callBind(descriptor.get);
		}
	});
	else forEach(typedArrays, function(typedArray) {
		var arr = new g[typedArray]();
		var fn$1 = arr.slice || arr.set;
		if (fn$1) cache["$" + typedArray] = callBind(fn$1);
	});
	/** @type {(value: object) => false | import('.').TypedArrayName} */
	var tryTypedArrays = function tryAllTypedArrays(value) {
		/** @type {ReturnType<typeof tryAllTypedArrays>} */ var found = false;
		forEach(
			cache,
			/** @type {(getter: Getter, name: `\$${import('.').TypedArrayName}`) => void} */
			function(getter, typedArray) {
				if (!found) try {
					if ("$" + getter(value) === typedArray) found = $slice(typedArray, 1);
				} catch (e) {}
			}
		);
		return found;
	};
	/** @type {(value: object) => false | import('.').TypedArrayName} */
	var trySlices = function tryAllSlices(value) {
		/** @type {ReturnType<typeof tryAllSlices>} */ var found = false;
		forEach(
			cache,
			/** @type {(getter: Getter, name: `\$${import('.').TypedArrayName}`) => void} */
			function(getter, name) {
				if (!found) try {
					getter(value);
					found = $slice(name, 1);
				} catch (e) {}
			}
		);
		return found;
	};
	/** @type {import('.')} */
	module.exports = function whichTypedArray$2(value) {
		if (!value || typeof value !== "object") return false;
		if (!hasToStringTag) {
			/** @type {string} */
			var tag = $slice($toString(value), 8, -1);
			if ($indexOf(typedArrays, tag) > -1) return tag;
			if (tag !== "Object") return false;
			return trySlices(value);
		}
		if (!gOPD) return null;
		return tryTypedArrays(value);
	};
}));

//#endregion
//#region node_modules/is-typed-array/index.js
var require_is_typed_array = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var whichTypedArray$1 = require_which_typed_array();
	/** @type {import('.')} */
	module.exports = function isTypedArray$1(value) {
		return !!whichTypedArray$1(value);
	};
}));

//#endregion
//#region node_modules/util/support/types.js
var require_types = /* @__PURE__ */ __commonJSMin(((exports) => {
	var isArgumentsObject = require_is_arguments();
	var isGeneratorFunction = require_is_generator_function();
	var whichTypedArray = require_which_typed_array();
	var isTypedArray = require_is_typed_array();
	function uncurryThis(f$1) {
		return f$1.call.bind(f$1);
	}
	var BigIntSupported = typeof BigInt !== "undefined";
	var SymbolSupported = typeof Symbol !== "undefined";
	var ObjectToString = uncurryThis(Object.prototype.toString);
	var numberValue = uncurryThis(Number.prototype.valueOf);
	var stringValue = uncurryThis(String.prototype.valueOf);
	var booleanValue = uncurryThis(Boolean.prototype.valueOf);
	if (BigIntSupported) var bigIntValue = uncurryThis(BigInt.prototype.valueOf);
	if (SymbolSupported) var symbolValue = uncurryThis(Symbol.prototype.valueOf);
	function checkBoxedPrimitive(value, prototypeValueOf) {
		if (typeof value !== "object") return false;
		try {
			prototypeValueOf(value);
			return true;
		} catch (e) {
			return false;
		}
	}
	exports.isArgumentsObject = isArgumentsObject;
	exports.isGeneratorFunction = isGeneratorFunction;
	exports.isTypedArray = isTypedArray;
	function isPromise(input) {
		return typeof Promise !== "undefined" && input instanceof Promise || input !== null && typeof input === "object" && typeof input.then === "function" && typeof input.catch === "function";
	}
	exports.isPromise = isPromise;
	function isArrayBufferView(value) {
		if (typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView) return ArrayBuffer.isView(value);
		return isTypedArray(value) || isDataView(value);
	}
	exports.isArrayBufferView = isArrayBufferView;
	function isUint8Array(value) {
		return whichTypedArray(value) === "Uint8Array";
	}
	exports.isUint8Array = isUint8Array;
	function isUint8ClampedArray(value) {
		return whichTypedArray(value) === "Uint8ClampedArray";
	}
	exports.isUint8ClampedArray = isUint8ClampedArray;
	function isUint16Array(value) {
		return whichTypedArray(value) === "Uint16Array";
	}
	exports.isUint16Array = isUint16Array;
	function isUint32Array(value) {
		return whichTypedArray(value) === "Uint32Array";
	}
	exports.isUint32Array = isUint32Array;
	function isInt8Array(value) {
		return whichTypedArray(value) === "Int8Array";
	}
	exports.isInt8Array = isInt8Array;
	function isInt16Array(value) {
		return whichTypedArray(value) === "Int16Array";
	}
	exports.isInt16Array = isInt16Array;
	function isInt32Array(value) {
		return whichTypedArray(value) === "Int32Array";
	}
	exports.isInt32Array = isInt32Array;
	function isFloat32Array(value) {
		return whichTypedArray(value) === "Float32Array";
	}
	exports.isFloat32Array = isFloat32Array;
	function isFloat64Array(value) {
		return whichTypedArray(value) === "Float64Array";
	}
	exports.isFloat64Array = isFloat64Array;
	function isBigInt64Array(value) {
		return whichTypedArray(value) === "BigInt64Array";
	}
	exports.isBigInt64Array = isBigInt64Array;
	function isBigUint64Array(value) {
		return whichTypedArray(value) === "BigUint64Array";
	}
	exports.isBigUint64Array = isBigUint64Array;
	function isMapToString(value) {
		return ObjectToString(value) === "[object Map]";
	}
	isMapToString.working = typeof Map !== "undefined" && isMapToString(/* @__PURE__ */ new Map());
	function isMap(value) {
		if (typeof Map === "undefined") return false;
		return isMapToString.working ? isMapToString(value) : value instanceof Map;
	}
	exports.isMap = isMap;
	function isSetToString(value) {
		return ObjectToString(value) === "[object Set]";
	}
	isSetToString.working = typeof Set !== "undefined" && isSetToString(/* @__PURE__ */ new Set());
	function isSet(value) {
		if (typeof Set === "undefined") return false;
		return isSetToString.working ? isSetToString(value) : value instanceof Set;
	}
	exports.isSet = isSet;
	function isWeakMapToString(value) {
		return ObjectToString(value) === "[object WeakMap]";
	}
	isWeakMapToString.working = typeof WeakMap !== "undefined" && isWeakMapToString(/* @__PURE__ */ new WeakMap());
	function isWeakMap(value) {
		if (typeof WeakMap === "undefined") return false;
		return isWeakMapToString.working ? isWeakMapToString(value) : value instanceof WeakMap;
	}
	exports.isWeakMap = isWeakMap;
	function isWeakSetToString(value) {
		return ObjectToString(value) === "[object WeakSet]";
	}
	isWeakSetToString.working = typeof WeakSet !== "undefined" && isWeakSetToString(/* @__PURE__ */ new WeakSet());
	function isWeakSet(value) {
		return isWeakSetToString(value);
	}
	exports.isWeakSet = isWeakSet;
	function isArrayBufferToString(value) {
		return ObjectToString(value) === "[object ArrayBuffer]";
	}
	isArrayBufferToString.working = typeof ArrayBuffer !== "undefined" && isArrayBufferToString(/* @__PURE__ */ new ArrayBuffer());
	function isArrayBuffer(value) {
		if (typeof ArrayBuffer === "undefined") return false;
		return isArrayBufferToString.working ? isArrayBufferToString(value) : value instanceof ArrayBuffer;
	}
	exports.isArrayBuffer = isArrayBuffer;
	function isDataViewToString(value) {
		return ObjectToString(value) === "[object DataView]";
	}
	isDataViewToString.working = typeof ArrayBuffer !== "undefined" && typeof DataView !== "undefined" && isDataViewToString(new DataView(/* @__PURE__ */ new ArrayBuffer(1), 0, 1));
	function isDataView(value) {
		if (typeof DataView === "undefined") return false;
		return isDataViewToString.working ? isDataViewToString(value) : value instanceof DataView;
	}
	exports.isDataView = isDataView;
	var SharedArrayBufferCopy = typeof SharedArrayBuffer !== "undefined" ? SharedArrayBuffer : void 0;
	function isSharedArrayBufferToString(value) {
		return ObjectToString(value) === "[object SharedArrayBuffer]";
	}
	function isSharedArrayBuffer(value) {
		if (typeof SharedArrayBufferCopy === "undefined") return false;
		if (typeof isSharedArrayBufferToString.working === "undefined") isSharedArrayBufferToString.working = isSharedArrayBufferToString(new SharedArrayBufferCopy());
		return isSharedArrayBufferToString.working ? isSharedArrayBufferToString(value) : value instanceof SharedArrayBufferCopy;
	}
	exports.isSharedArrayBuffer = isSharedArrayBuffer;
	function isAsyncFunction(value) {
		return ObjectToString(value) === "[object AsyncFunction]";
	}
	exports.isAsyncFunction = isAsyncFunction;
	function isMapIterator(value) {
		return ObjectToString(value) === "[object Map Iterator]";
	}
	exports.isMapIterator = isMapIterator;
	function isSetIterator(value) {
		return ObjectToString(value) === "[object Set Iterator]";
	}
	exports.isSetIterator = isSetIterator;
	function isGeneratorObject(value) {
		return ObjectToString(value) === "[object Generator]";
	}
	exports.isGeneratorObject = isGeneratorObject;
	function isWebAssemblyCompiledModule(value) {
		return ObjectToString(value) === "[object WebAssembly.Module]";
	}
	exports.isWebAssemblyCompiledModule = isWebAssemblyCompiledModule;
	function isNumberObject(value) {
		return checkBoxedPrimitive(value, numberValue);
	}
	exports.isNumberObject = isNumberObject;
	function isStringObject(value) {
		return checkBoxedPrimitive(value, stringValue);
	}
	exports.isStringObject = isStringObject;
	function isBooleanObject(value) {
		return checkBoxedPrimitive(value, booleanValue);
	}
	exports.isBooleanObject = isBooleanObject;
	function isBigIntObject(value) {
		return BigIntSupported && checkBoxedPrimitive(value, bigIntValue);
	}
	exports.isBigIntObject = isBigIntObject;
	function isSymbolObject(value) {
		return SymbolSupported && checkBoxedPrimitive(value, symbolValue);
	}
	exports.isSymbolObject = isSymbolObject;
	function isBoxedPrimitive(value) {
		return isNumberObject(value) || isStringObject(value) || isBooleanObject(value) || isBigIntObject(value) || isSymbolObject(value);
	}
	exports.isBoxedPrimitive = isBoxedPrimitive;
	function isAnyArrayBuffer(value) {
		return typeof Uint8Array !== "undefined" && (isArrayBuffer(value) || isSharedArrayBuffer(value));
	}
	exports.isAnyArrayBuffer = isAnyArrayBuffer;
	[
		"isProxy",
		"isExternal",
		"isModuleNamespaceObject"
	].forEach(function(method) {
		Object.defineProperty(exports, method, {
			enumerable: false,
			value: function() {
				throw new Error(method + " is not supported in userland");
			}
		});
	});
}));

//#endregion
//#region node_modules/util/support/isBufferBrowser.js
var require_isBufferBrowser = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = function isBuffer(arg) {
		return arg && typeof arg === "object" && typeof arg.copy === "function" && typeof arg.fill === "function" && typeof arg.readUInt8 === "function";
	};
}));

//#endregion
//#region node_modules/inherits/inherits_browser.js
var require_inherits_browser = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	if (typeof Object.create === "function") module.exports = function inherits(ctor, superCtor) {
		if (superCtor) {
			ctor.super_ = superCtor;
			ctor.prototype = Object.create(superCtor.prototype, { constructor: {
				value: ctor,
				enumerable: false,
				writable: true,
				configurable: true
			} });
		}
	};
	else module.exports = function inherits(ctor, superCtor) {
		if (superCtor) {
			ctor.super_ = superCtor;
			var TempCtor = function() {};
			TempCtor.prototype = superCtor.prototype;
			ctor.prototype = new TempCtor();
			ctor.prototype.constructor = ctor;
		}
	};
}));

//#endregion
//#region node_modules/util/util.js
var require_util$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var getOwnPropertyDescriptors = Object.getOwnPropertyDescriptors || function getOwnPropertyDescriptors$1(obj) {
		var keys = Object.keys(obj);
		var descriptors = {};
		for (var i$2 = 0; i$2 < keys.length; i$2++) descriptors[keys[i$2]] = Object.getOwnPropertyDescriptor(obj, keys[i$2]);
		return descriptors;
	};
	var formatRegExp = /%[sdj%]/g;
	exports.format = function(f$1) {
		if (!isString$1(f$1)) {
			var objects = [];
			for (var i$2 = 0; i$2 < arguments.length; i$2++) objects.push(inspect(arguments[i$2]));
			return objects.join(" ");
		}
		var i$2 = 1;
		var args = arguments;
		var len$1 = args.length;
		var str = String(f$1).replace(formatRegExp, function(x$1) {
			if (x$1 === "%%") return "%";
			if (i$2 >= len$1) return x$1;
			switch (x$1) {
				case "%s": return String(args[i$2++]);
				case "%d": return Number(args[i$2++]);
				case "%j": try {
					return JSON.stringify(args[i$2++]);
				} catch (_) {
					return "[Circular]";
				}
				default: return x$1;
			}
		});
		for (var x = args[i$2]; i$2 < len$1; x = args[++i$2]) if (isNull$1(x) || !isObject$2(x)) str += " " + x;
		else str += " " + inspect(x);
		return str;
	};
	exports.deprecate = function(fn$1, msg) {
		if (typeof process !== "undefined" && process.noDeprecation === true) return fn$1;
		if (typeof process === "undefined") return function() {
			return exports.deprecate(fn$1, msg).apply(this, arguments);
		};
		var warned = false;
		function deprecated() {
			if (!warned) {
				if (process.throwDeprecation) throw new Error(msg);
				else if (process.traceDeprecation) console.trace(msg);
				else console.error(msg);
				warned = true;
			}
			return fn$1.apply(this, arguments);
		}
		return deprecated;
	};
	var debugs = {};
	var debugEnvRegex = /^$/;
	if (process.env.NODE_DEBUG) {
		var debugEnv = process.env.NODE_DEBUG;
		debugEnv = debugEnv.replace(/[|\\{}()[\]^$+?.]/g, "\\$&").replace(/\*/g, ".*").replace(/,/g, "$|^").toUpperCase();
		debugEnvRegex = new RegExp("^" + debugEnv + "$", "i");
	}
	exports.debuglog = function(set) {
		set = set.toUpperCase();
		if (!debugs[set]) if (debugEnvRegex.test(set)) {
			var pid = process.pid;
			debugs[set] = function() {
				var msg = exports.format.apply(exports, arguments);
				console.error("%s %d: %s", set, pid, msg);
			};
		} else debugs[set] = function() {};
		return debugs[set];
	};
	/**
	* Echos the value of a value. Trys to print the value out
	* in the best way possible given the different types.
	*
	* @param {Object} obj The object to print out.
	* @param {Object} opts Optional options object that alters the output.
	*/
	function inspect(obj, opts) {
		var ctx = {
			seen: [],
			stylize: stylizeNoColor
		};
		if (arguments.length >= 3) ctx.depth = arguments[2];
		if (arguments.length >= 4) ctx.colors = arguments[3];
		if (isBoolean(opts)) ctx.showHidden = opts;
		else if (opts) exports._extend(ctx, opts);
		if (isUndefined$1(ctx.showHidden)) ctx.showHidden = false;
		if (isUndefined$1(ctx.depth)) ctx.depth = 2;
		if (isUndefined$1(ctx.colors)) ctx.colors = false;
		if (isUndefined$1(ctx.customInspect)) ctx.customInspect = true;
		if (ctx.colors) ctx.stylize = stylizeWithColor;
		return formatValue(ctx, obj, ctx.depth);
	}
	exports.inspect = inspect;
	inspect.colors = {
		"bold": [1, 22],
		"italic": [3, 23],
		"underline": [4, 24],
		"inverse": [7, 27],
		"white": [37, 39],
		"grey": [90, 39],
		"black": [30, 39],
		"blue": [34, 39],
		"cyan": [36, 39],
		"green": [32, 39],
		"magenta": [35, 39],
		"red": [31, 39],
		"yellow": [33, 39]
	};
	inspect.styles = {
		"special": "cyan",
		"number": "yellow",
		"boolean": "yellow",
		"undefined": "grey",
		"null": "bold",
		"string": "green",
		"date": "magenta",
		"regexp": "red"
	};
	function stylizeWithColor(str, styleType) {
		var style = inspect.styles[styleType];
		if (style) return "\x1B[" + inspect.colors[style][0] + "m" + str + "\x1B[" + inspect.colors[style][1] + "m";
		else return str;
	}
	function stylizeNoColor(str, styleType) {
		return str;
	}
	function arrayToHash(array) {
		var hash = {};
		array.forEach(function(val, idx) {
			hash[val] = true;
		});
		return hash;
	}
	function formatValue(ctx, value, recurseTimes) {
		if (ctx.customInspect && value && isFunction$1(value.inspect) && value.inspect !== exports.inspect && !(value.constructor && value.constructor.prototype === value)) {
			var ret = value.inspect(recurseTimes, ctx);
			if (!isString$1(ret)) ret = formatValue(ctx, ret, recurseTimes);
			return ret;
		}
		var primitive = formatPrimitive(ctx, value);
		if (primitive) return primitive;
		var keys = Object.keys(value);
		var visibleKeys = arrayToHash(keys);
		if (ctx.showHidden) keys = Object.getOwnPropertyNames(value);
		if (isError(value) && (keys.indexOf("message") >= 0 || keys.indexOf("description") >= 0)) return formatError(value);
		if (keys.length === 0) {
			if (isFunction$1(value)) {
				var name = value.name ? ": " + value.name : "";
				return ctx.stylize("[Function" + name + "]", "special");
			}
			if (isRegExp(value)) return ctx.stylize(RegExp.prototype.toString.call(value), "regexp");
			if (isDate(value)) return ctx.stylize(Date.prototype.toString.call(value), "date");
			if (isError(value)) return formatError(value);
		}
		var base = "", array = false, braces = ["{", "}"];
		if (isArray$1(value)) {
			array = true;
			braces = ["[", "]"];
		}
		if (isFunction$1(value)) base = " [Function" + (value.name ? ": " + value.name : "") + "]";
		if (isRegExp(value)) base = " " + RegExp.prototype.toString.call(value);
		if (isDate(value)) base = " " + Date.prototype.toUTCString.call(value);
		if (isError(value)) base = " " + formatError(value);
		if (keys.length === 0 && (!array || value.length == 0)) return braces[0] + base + braces[1];
		if (recurseTimes < 0) if (isRegExp(value)) return ctx.stylize(RegExp.prototype.toString.call(value), "regexp");
		else return ctx.stylize("[Object]", "special");
		ctx.seen.push(value);
		var output;
		if (array) output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
		else output = keys.map(function(key) {
			return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
		});
		ctx.seen.pop();
		return reduceToSingleString(output, base, braces);
	}
	function formatPrimitive(ctx, value) {
		if (isUndefined$1(value)) return ctx.stylize("undefined", "undefined");
		if (isString$1(value)) {
			var simple = "'" + JSON.stringify(value).replace(/^"|"$/g, "").replace(/'/g, "\\'").replace(/\\"/g, "\"") + "'";
			return ctx.stylize(simple, "string");
		}
		if (isNumber$1(value)) return ctx.stylize("" + value, "number");
		if (isBoolean(value)) return ctx.stylize("" + value, "boolean");
		if (isNull$1(value)) return ctx.stylize("null", "null");
	}
	function formatError(value) {
		return "[" + Error.prototype.toString.call(value) + "]";
	}
	function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
		var output = [];
		for (var i$2 = 0, l = value.length; i$2 < l; ++i$2) if (hasOwnProperty$2(value, String(i$2))) output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, String(i$2), true));
		else output.push("");
		keys.forEach(function(key) {
			if (!key.match(/^\d+$/)) output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, key, true));
		});
		return output;
	}
	function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
		var name, str, desc$1 = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
		if (desc$1.get) if (desc$1.set) str = ctx.stylize("[Getter/Setter]", "special");
		else str = ctx.stylize("[Getter]", "special");
		else if (desc$1.set) str = ctx.stylize("[Setter]", "special");
		if (!hasOwnProperty$2(visibleKeys, key)) name = "[" + key + "]";
		if (!str) if (ctx.seen.indexOf(desc$1.value) < 0) {
			if (isNull$1(recurseTimes)) str = formatValue(ctx, desc$1.value, null);
			else str = formatValue(ctx, desc$1.value, recurseTimes - 1);
			if (str.indexOf("\n") > -1) if (array) str = str.split("\n").map(function(line) {
				return "  " + line;
			}).join("\n").slice(2);
			else str = "\n" + str.split("\n").map(function(line) {
				return "   " + line;
			}).join("\n");
		} else str = ctx.stylize("[Circular]", "special");
		if (isUndefined$1(name)) {
			if (array && key.match(/^\d+$/)) return str;
			name = JSON.stringify("" + key);
			if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
				name = name.slice(1, -1);
				name = ctx.stylize(name, "name");
			} else {
				name = name.replace(/'/g, "\\'").replace(/\\"/g, "\"").replace(/(^"|"$)/g, "'");
				name = ctx.stylize(name, "string");
			}
		}
		return name + ": " + str;
	}
	function reduceToSingleString(output, base, braces) {
		var numLinesEst = 0;
		if (output.reduce(function(prev, cur) {
			numLinesEst++;
			if (cur.indexOf("\n") >= 0) numLinesEst++;
			return prev + cur.replace(/\u001b\[\d\d?m/g, "").length + 1;
		}, 0) > 60) return braces[0] + (base === "" ? "" : base + "\n ") + " " + output.join(",\n  ") + " " + braces[1];
		return braces[0] + base + " " + output.join(", ") + " " + braces[1];
	}
	exports.types = require_types();
	function isArray$1(ar) {
		return Array.isArray(ar);
	}
	exports.isArray = isArray$1;
	function isBoolean(arg) {
		return typeof arg === "boolean";
	}
	exports.isBoolean = isBoolean;
	function isNull$1(arg) {
		return arg === null;
	}
	exports.isNull = isNull$1;
	function isNullOrUndefined$1(arg) {
		return arg == null;
	}
	exports.isNullOrUndefined = isNullOrUndefined$1;
	function isNumber$1(arg) {
		return typeof arg === "number";
	}
	exports.isNumber = isNumber$1;
	function isString$1(arg) {
		return typeof arg === "string";
	}
	exports.isString = isString$1;
	function isSymbol(arg) {
		return typeof arg === "symbol";
	}
	exports.isSymbol = isSymbol;
	function isUndefined$1(arg) {
		return arg === void 0;
	}
	exports.isUndefined = isUndefined$1;
	function isRegExp(re) {
		return isObject$2(re) && objectToString(re) === "[object RegExp]";
	}
	exports.isRegExp = isRegExp;
	exports.types.isRegExp = isRegExp;
	function isObject$2(arg) {
		return typeof arg === "object" && arg !== null;
	}
	exports.isObject = isObject$2;
	function isDate(d) {
		return isObject$2(d) && objectToString(d) === "[object Date]";
	}
	exports.isDate = isDate;
	exports.types.isDate = isDate;
	function isError(e) {
		return isObject$2(e) && (objectToString(e) === "[object Error]" || e instanceof Error);
	}
	exports.isError = isError;
	exports.types.isNativeError = isError;
	function isFunction$1(arg) {
		return typeof arg === "function";
	}
	exports.isFunction = isFunction$1;
	function isPrimitive(arg) {
		return arg === null || typeof arg === "boolean" || typeof arg === "number" || typeof arg === "string" || typeof arg === "symbol" || typeof arg === "undefined";
	}
	exports.isPrimitive = isPrimitive;
	exports.isBuffer = require_isBufferBrowser();
	function objectToString(o) {
		return Object.prototype.toString.call(o);
	}
	function pad(n) {
		return n < 10 ? "0" + n.toString(10) : n.toString(10);
	}
	var months = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec"
	];
	function timestamp() {
		var d = /* @__PURE__ */ new Date();
		var time = [
			pad(d.getHours()),
			pad(d.getMinutes()),
			pad(d.getSeconds())
		].join(":");
		return [
			d.getDate(),
			months[d.getMonth()],
			time
		].join(" ");
	}
	exports.log = function() {
		console.log("%s - %s", timestamp(), exports.format.apply(exports, arguments));
	};
	/**
	* Inherit the prototype methods from one constructor into another.
	*
	* The Function.prototype.inherits from lang.js rewritten as a standalone
	* function (not on Function.prototype). NOTE: If this file is to be loaded
	* during bootstrapping this function needs to be rewritten using some native
	* functions as prototype setup using normal JavaScript does not work as
	* expected during bootstrapping (see mirror.js in r114903).
	*
	* @param {function} ctor Constructor function which needs to inherit the
	*     prototype.
	* @param {function} superCtor Constructor function to inherit prototype from.
	*/
	exports.inherits = require_inherits_browser();
	exports._extend = function(origin, add) {
		if (!add || !isObject$2(add)) return origin;
		var keys = Object.keys(add);
		var i$2 = keys.length;
		while (i$2--) origin[keys[i$2]] = add[keys[i$2]];
		return origin;
	};
	function hasOwnProperty$2(obj, prop) {
		return Object.prototype.hasOwnProperty.call(obj, prop);
	}
	var kCustomPromisifiedSymbol = typeof Symbol !== "undefined" ? Symbol("util.promisify.custom") : void 0;
	exports.promisify = function promisify(original) {
		if (typeof original !== "function") throw new TypeError("The \"original\" argument must be of type Function");
		if (kCustomPromisifiedSymbol && original[kCustomPromisifiedSymbol]) {
			var fn$1 = original[kCustomPromisifiedSymbol];
			if (typeof fn$1 !== "function") throw new TypeError("The \"util.promisify.custom\" argument must be of type Function");
			Object.defineProperty(fn$1, kCustomPromisifiedSymbol, {
				value: fn$1,
				enumerable: false,
				writable: false,
				configurable: true
			});
			return fn$1;
		}
		function fn$1() {
			var promiseResolve, promiseReject;
			var promise = new Promise(function(resolve, reject) {
				promiseResolve = resolve;
				promiseReject = reject;
			});
			var args = [];
			for (var i$2 = 0; i$2 < arguments.length; i$2++) args.push(arguments[i$2]);
			args.push(function(err, value) {
				if (err) promiseReject(err);
				else promiseResolve(value);
			});
			try {
				original.apply(this, args);
			} catch (err) {
				promiseReject(err);
			}
			return promise;
		}
		Object.setPrototypeOf(fn$1, Object.getPrototypeOf(original));
		if (kCustomPromisifiedSymbol) Object.defineProperty(fn$1, kCustomPromisifiedSymbol, {
			value: fn$1,
			enumerable: false,
			writable: false,
			configurable: true
		});
		return Object.defineProperties(fn$1, getOwnPropertyDescriptors(original));
	};
	exports.promisify.custom = kCustomPromisifiedSymbol;
	function callbackifyOnRejected(reason, cb) {
		if (!reason) {
			var newReason = /* @__PURE__ */ new Error("Promise was rejected with a falsy value");
			newReason.reason = reason;
			reason = newReason;
		}
		return cb(reason);
	}
	function callbackify(original) {
		if (typeof original !== "function") throw new TypeError("The \"original\" argument must be of type Function");
		function callbackified() {
			var args = [];
			for (var i$2 = 0; i$2 < arguments.length; i$2++) args.push(arguments[i$2]);
			var maybeCb = args.pop();
			if (typeof maybeCb !== "function") throw new TypeError("The last argument must be of type Function");
			var self = this;
			var cb = function() {
				return maybeCb.apply(self, arguments);
			};
			original.apply(this, args).then(function(ret) {
				process.nextTick(cb.bind(null, null, ret));
			}, function(rej) {
				process.nextTick(callbackifyOnRejected.bind(null, rej, cb));
			});
		}
		Object.setPrototypeOf(callbackified, Object.getPrototypeOf(original));
		Object.defineProperties(callbackified, getOwnPropertyDescriptors(original));
		return callbackified;
	}
	exports.callbackify = callbackify;
}));

//#endregion
//#region node_modules/aws-sdk/lib/event_listeners.js
var require_event_listeners = /* @__PURE__ */ __commonJSMin((() => {
	var AWS$26 = require_core();
	var SequentialExecutor = require_sequential_executor();
	var DISCOVER_ENDPOINT = require_discover_endpoint().discoverEndpoint;
	/**
	* The namespace used to register global event listeners for request building
	* and sending.
	*/
	AWS$26.EventListeners = { Core: {} };
	/**
	* @api private
	*/
	function getOperationAuthtype(req) {
		if (!req.service.api.operations) return "";
		var operation = req.service.api.operations[req.operation];
		return operation ? operation.authtype : "";
	}
	/**
	* @api private
	*/
	function getIdentityType(req) {
		var service = req.service;
		if (service.config.signatureVersion) return service.config.signatureVersion;
		if (service.api.signatureVersion) return service.api.signatureVersion;
		return getOperationAuthtype(req);
	}
	AWS$26.EventListeners = {
		Core: new SequentialExecutor().addNamedListeners(function(add, addAsync) {
			addAsync("VALIDATE_CREDENTIALS", "validate", function VALIDATE_CREDENTIALS(req, done) {
				if (!req.service.api.signatureVersion && !req.service.config.signatureVersion) return done();
				if (getIdentityType(req) === "bearer") {
					req.service.config.getToken(function(err) {
						if (err) req.response.error = AWS$26.util.error(err, { code: "TokenError" });
						done();
					});
					return;
				}
				req.service.config.getCredentials(function(err) {
					if (err) req.response.error = AWS$26.util.error(err, {
						code: "CredentialsError",
						message: "Missing credentials in config, if using AWS_CONFIG_FILE, set AWS_SDK_LOAD_CONFIG=1"
					});
					done();
				});
			});
			add("VALIDATE_REGION", "validate", function VALIDATE_REGION(req) {
				if (!req.service.isGlobalEndpoint) {
					var dnsHostRegex = /* @__PURE__ */ new RegExp(/^([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])$/);
					if (!req.service.config.region) req.response.error = AWS$26.util.error(/* @__PURE__ */ new Error(), {
						code: "ConfigError",
						message: "Missing region in config"
					});
					else if (!dnsHostRegex.test(req.service.config.region)) req.response.error = AWS$26.util.error(/* @__PURE__ */ new Error(), {
						code: "ConfigError",
						message: "Invalid region in config"
					});
				}
			});
			add("BUILD_IDEMPOTENCY_TOKENS", "validate", function BUILD_IDEMPOTENCY_TOKENS(req) {
				if (!req.service.api.operations) return;
				var operation = req.service.api.operations[req.operation];
				if (!operation) return;
				var idempotentMembers = operation.idempotentMembers;
				if (!idempotentMembers.length) return;
				var params = AWS$26.util.copy(req.params);
				for (var i$2 = 0, iLen = idempotentMembers.length; i$2 < iLen; i$2++) if (!params[idempotentMembers[i$2]]) params[idempotentMembers[i$2]] = AWS$26.util.uuid.v4();
				req.params = params;
			});
			add("VALIDATE_PARAMETERS", "validate", function VALIDATE_PARAMETERS(req) {
				if (!req.service.api.operations) return;
				var rules = req.service.api.operations[req.operation].input;
				var validation = req.service.config.paramValidation;
				new AWS$26.ParamValidator(validation).validate(rules, req.params);
			});
			add("COMPUTE_CHECKSUM", "afterBuild", function COMPUTE_CHECKSUM(req) {
				if (!req.service.api.operations) return;
				var operation = req.service.api.operations[req.operation];
				if (!operation) return;
				var body = req.httpRequest.body;
				var isNonStreamingPayload = body && (AWS$26.util.Buffer.isBuffer(body) || typeof body === "string");
				var headers = req.httpRequest.headers;
				if (operation.httpChecksumRequired && req.service.config.computeChecksums && isNonStreamingPayload && !headers["Content-MD5"]) headers["Content-MD5"] = AWS$26.util.crypto.md5(body, "base64");
			});
			addAsync("COMPUTE_SHA256", "afterBuild", function COMPUTE_SHA256(req, done) {
				req.haltHandlersOnError();
				if (!req.service.api.operations) return;
				var operation = req.service.api.operations[req.operation];
				var authtype = operation ? operation.authtype : "";
				if (!req.service.api.signatureVersion && !authtype && !req.service.config.signatureVersion) return done();
				if (req.service.getSignerClass(req) === AWS$26.Signers.V4) {
					var body = req.httpRequest.body || "";
					if (authtype.indexOf("unsigned-body") >= 0) {
						req.httpRequest.headers["X-Amz-Content-Sha256"] = "UNSIGNED-PAYLOAD";
						return done();
					}
					AWS$26.util.computeSha256(body, function(err, sha) {
						if (err) done(err);
						else {
							req.httpRequest.headers["X-Amz-Content-Sha256"] = sha;
							done();
						}
					});
				} else done();
			});
			add("SET_CONTENT_LENGTH", "afterBuild", function SET_CONTENT_LENGTH(req) {
				var authtype = getOperationAuthtype(req);
				var payloadMember = AWS$26.util.getRequestPayloadShape(req);
				if (req.httpRequest.headers["Content-Length"] === void 0) try {
					var length = AWS$26.util.string.byteLength(req.httpRequest.body);
					req.httpRequest.headers["Content-Length"] = length;
				} catch (err) {
					if (payloadMember && payloadMember.isStreaming) if (payloadMember.requiresLength) throw err;
					else if (authtype.indexOf("unsigned-body") >= 0) {
						req.httpRequest.headers["Transfer-Encoding"] = "chunked";
						return;
					} else throw err;
					throw err;
				}
			});
			add("SET_HTTP_HOST", "afterBuild", function SET_HTTP_HOST(req) {
				req.httpRequest.headers["Host"] = req.httpRequest.endpoint.host;
			});
			add("SET_TRACE_ID", "afterBuild", function SET_TRACE_ID(req) {
				var traceIdHeaderName = "X-Amzn-Trace-Id";
				if (AWS$26.util.isNode() && !Object.hasOwnProperty.call(req.httpRequest.headers, traceIdHeaderName)) {
					var ENV_LAMBDA_FUNCTION_NAME = "AWS_LAMBDA_FUNCTION_NAME";
					var ENV_TRACE_ID = "_X_AMZN_TRACE_ID";
					var functionName = process.env[ENV_LAMBDA_FUNCTION_NAME];
					var traceId = process.env[ENV_TRACE_ID];
					if (typeof functionName === "string" && functionName.length > 0 && typeof traceId === "string" && traceId.length > 0) req.httpRequest.headers[traceIdHeaderName] = traceId;
				}
			});
			add("RESTART", "restart", function RESTART() {
				var err = this.response.error;
				if (!err || !err.retryable) return;
				this.httpRequest = new AWS$26.HttpRequest(this.service.endpoint, this.service.region);
				if (this.response.retryCount < this.service.config.maxRetries) this.response.retryCount++;
				else this.response.error = null;
			});
			addAsync("DISCOVER_ENDPOINT", "sign", DISCOVER_ENDPOINT, true);
			addAsync("SIGN", "sign", function SIGN(req, done) {
				var service = req.service;
				var identityType = getIdentityType(req);
				if (!identityType || identityType.length === 0) return done();
				if (identityType === "bearer") service.config.getToken(function(err, token) {
					if (err) {
						req.response.error = err;
						return done();
					}
					try {
						new (service.getSignerClass(req))(req.httpRequest).addAuthorization(token);
					} catch (e) {
						req.response.error = e;
					}
					done();
				});
				else service.config.getCredentials(function(err, credentials) {
					if (err) {
						req.response.error = err;
						return done();
					}
					try {
						var date = service.getSkewCorrectedDate();
						var SignerClass = service.getSignerClass(req);
						var operation = (req.service.api.operations || {})[req.operation];
						var signer = new SignerClass(req.httpRequest, service.getSigningName(req), {
							signatureCache: service.config.signatureCache,
							operation,
							signatureVersion: service.api.signatureVersion
						});
						signer.setServiceClientId(service._clientId);
						delete req.httpRequest.headers["Authorization"];
						delete req.httpRequest.headers["Date"];
						delete req.httpRequest.headers["X-Amz-Date"];
						signer.addAuthorization(credentials, date);
						req.signedAt = date;
					} catch (e) {
						req.response.error = e;
					}
					done();
				});
			});
			add("VALIDATE_RESPONSE", "validateResponse", function VALIDATE_RESPONSE(resp) {
				if (this.service.successfulResponse(resp, this)) {
					resp.data = {};
					resp.error = null;
				} else {
					resp.data = null;
					resp.error = AWS$26.util.error(/* @__PURE__ */ new Error(), {
						code: "UnknownError",
						message: "An unknown error occurred."
					});
				}
			});
			add("ERROR", "error", function ERROR(err, resp) {
				if (resp.request.service.api.awsQueryCompatible) {
					var headers = resp.httpResponse.headers;
					var queryErrorCode = headers ? headers["x-amzn-query-error"] : void 0;
					if (queryErrorCode && queryErrorCode.includes(";")) resp.error.code = queryErrorCode.split(";")[0];
				}
			}, true);
			addAsync("SEND", "send", function SEND(resp, done) {
				resp.httpResponse._abortCallback = done;
				resp.error = null;
				resp.data = null;
				function callback(httpResp) {
					resp.httpResponse.stream = httpResp;
					var stream = resp.request.httpRequest.stream;
					var service = resp.request.service;
					var api = service.api;
					var operationName = resp.request.operation;
					var operation = api.operations[operationName] || {};
					httpResp.on("headers", function onHeaders(statusCode, headers, statusMessage) {
						resp.request.emit("httpHeaders", [
							statusCode,
							headers,
							resp,
							statusMessage
						]);
						if (!resp.httpResponse.streaming) if (AWS$26.HttpClient.streamsApiVersion === 2) {
							if (operation.hasEventOutput && service.successfulResponse(resp)) {
								resp.request.emit("httpDone");
								done();
								return;
							}
							httpResp.on("readable", function onReadable() {
								var data = httpResp.read();
								if (data !== null) resp.request.emit("httpData", [data, resp]);
							});
						} else httpResp.on("data", function onData(data) {
							resp.request.emit("httpData", [data, resp]);
						});
					});
					httpResp.on("end", function onEnd() {
						if (!stream || !stream.didCallback) {
							if (AWS$26.HttpClient.streamsApiVersion === 2 && operation.hasEventOutput && service.successfulResponse(resp)) return;
							resp.request.emit("httpDone");
							done();
						}
					});
				}
				function progress(httpResp) {
					httpResp.on("sendProgress", function onSendProgress(value) {
						resp.request.emit("httpUploadProgress", [value, resp]);
					});
					httpResp.on("receiveProgress", function onReceiveProgress(value) {
						resp.request.emit("httpDownloadProgress", [value, resp]);
					});
				}
				function error(err) {
					if (err.code !== "RequestAbortedError") {
						var errCode = err.code === "TimeoutError" ? err.code : "NetworkingError";
						err = AWS$26.util.error(err, {
							code: errCode,
							region: resp.request.httpRequest.region,
							hostname: resp.request.httpRequest.endpoint.hostname,
							retryable: true
						});
					}
					resp.error = err;
					resp.request.emit("httpError", [resp.error, resp], function() {
						done();
					});
				}
				function executeSend() {
					var http = AWS$26.HttpClient.getInstance();
					var httpOptions = resp.request.service.config.httpOptions || {};
					try {
						progress(http.handleRequest(resp.request.httpRequest, httpOptions, callback, error));
					} catch (err) {
						error(err);
					}
				}
				if ((resp.request.service.getSkewCorrectedDate() - this.signedAt) / 1e3 >= 600) this.emit("sign", [this], function(err) {
					if (err) done(err);
					else executeSend();
				});
				else executeSend();
			});
			add("HTTP_HEADERS", "httpHeaders", function HTTP_HEADERS(statusCode, headers, resp, statusMessage) {
				resp.httpResponse.statusCode = statusCode;
				resp.httpResponse.statusMessage = statusMessage;
				resp.httpResponse.headers = headers;
				resp.httpResponse.body = AWS$26.util.buffer.toBuffer("");
				resp.httpResponse.buffers = [];
				resp.httpResponse.numBytes = 0;
				var dateHeader = headers.date || headers.Date;
				var service = resp.request.service;
				if (dateHeader) {
					var serverTime = Date.parse(dateHeader);
					if (service.config.correctClockSkew && service.isClockSkewed(serverTime)) service.applyClockOffset(serverTime);
				}
			});
			add("HTTP_DATA", "httpData", function HTTP_DATA(chunk, resp) {
				if (chunk) {
					if (AWS$26.util.isNode()) {
						resp.httpResponse.numBytes += chunk.length;
						var total = resp.httpResponse.headers["content-length"];
						var progress = {
							loaded: resp.httpResponse.numBytes,
							total
						};
						resp.request.emit("httpDownloadProgress", [progress, resp]);
					}
					resp.httpResponse.buffers.push(AWS$26.util.buffer.toBuffer(chunk));
				}
			});
			add("HTTP_DONE", "httpDone", function HTTP_DONE(resp) {
				if (resp.httpResponse.buffers && resp.httpResponse.buffers.length > 0) {
					var body = AWS$26.util.buffer.concat(resp.httpResponse.buffers);
					resp.httpResponse.body = body;
				}
				delete resp.httpResponse.numBytes;
				delete resp.httpResponse.buffers;
			});
			add("FINALIZE_ERROR", "retry", function FINALIZE_ERROR(resp) {
				if (resp.httpResponse.statusCode) {
					resp.error.statusCode = resp.httpResponse.statusCode;
					if (resp.error.retryable === void 0) resp.error.retryable = this.service.retryableError(resp.error, this);
				}
			});
			add("INVALIDATE_CREDENTIALS", "retry", function INVALIDATE_CREDENTIALS(resp) {
				if (!resp.error) return;
				switch (resp.error.code) {
					case "RequestExpired":
					case "ExpiredTokenException":
					case "ExpiredToken":
						resp.error.retryable = true;
						resp.request.service.config.credentials.expired = true;
				}
			});
			add("EXPIRED_SIGNATURE", "retry", function EXPIRED_SIGNATURE(resp) {
				var err = resp.error;
				if (!err) return;
				if (typeof err.code === "string" && typeof err.message === "string") {
					if (err.code.match(/Signature/) && err.message.match(/expired/)) resp.error.retryable = true;
				}
			});
			add("CLOCK_SKEWED", "retry", function CLOCK_SKEWED(resp) {
				if (!resp.error) return;
				if (this.service.clockSkewError(resp.error) && this.service.config.correctClockSkew) resp.error.retryable = true;
			});
			add("REDIRECT", "retry", function REDIRECT(resp) {
				if (resp.error && resp.error.statusCode >= 300 && resp.error.statusCode < 400 && resp.httpResponse.headers["location"]) {
					this.httpRequest.endpoint = new AWS$26.Endpoint(resp.httpResponse.headers["location"]);
					this.httpRequest.headers["Host"] = this.httpRequest.endpoint.host;
					this.httpRequest.path = this.httpRequest.endpoint.path;
					resp.error.redirect = true;
					resp.error.retryable = true;
				}
			});
			add("RETRY_CHECK", "retry", function RETRY_CHECK(resp) {
				if (resp.error) {
					if (resp.error.redirect && resp.redirectCount < resp.maxRedirects) resp.error.retryDelay = 0;
					else if (resp.retryCount < resp.maxRetries) resp.error.retryDelay = this.service.retryDelays(resp.retryCount, resp.error) || 0;
				}
			});
			addAsync("RESET_RETRY_STATE", "afterRetry", function RESET_RETRY_STATE(resp, done) {
				var delay, willRetry = false;
				if (resp.error) {
					delay = resp.error.retryDelay || 0;
					if (resp.error.retryable && resp.retryCount < resp.maxRetries) {
						resp.retryCount++;
						willRetry = true;
					} else if (resp.error.redirect && resp.redirectCount < resp.maxRedirects) {
						resp.redirectCount++;
						willRetry = true;
					}
				}
				if (willRetry && delay >= 0) {
					resp.error = null;
					setTimeout(done, delay);
				} else done();
			});
		}),
		CorePost: new SequentialExecutor().addNamedListeners(function(add) {
			add("EXTRACT_REQUEST_ID", "extractData", AWS$26.util.extractRequestId);
			add("EXTRACT_REQUEST_ID", "extractError", AWS$26.util.extractRequestId);
			add("ENOTFOUND_ERROR", "httpError", function ENOTFOUND_ERROR(err) {
				function isDNSError(err$1) {
					return err$1.errno === "ENOTFOUND" || typeof err$1.errno === "number" && typeof AWS$26.util.getSystemErrorName === "function" && ["EAI_NONAME", "EAI_NODATA"].indexOf(AWS$26.util.getSystemErrorName(err$1.errno) >= 0);
				}
				if (err.code === "NetworkingError" && isDNSError(err)) {
					var message = "Inaccessible host: `" + err.hostname + "' at port `" + err.port + "'. This service may not be available in the `" + err.region + "' region.";
					this.response.error = AWS$26.util.error(new Error(message), {
						code: "UnknownEndpoint",
						region: err.region,
						hostname: err.hostname,
						retryable: true,
						originalError: err
					});
				}
			});
		}),
		Logger: new SequentialExecutor().addNamedListeners(function(add) {
			add("LOG_REQUEST", "complete", function LOG_REQUEST(resp) {
				var req = resp.request;
				var logger = req.service.config.logger;
				if (!logger) return;
				function filterSensitiveLog(inputShape, shape) {
					if (!shape) return shape;
					if (inputShape.isSensitive) return "***SensitiveInformation***";
					switch (inputShape.type) {
						case "structure":
							var struct = {};
							AWS$26.util.each(shape, function(subShapeName, subShape) {
								if (Object.prototype.hasOwnProperty.call(inputShape.members, subShapeName)) struct[subShapeName] = filterSensitiveLog(inputShape.members[subShapeName], subShape);
								else struct[subShapeName] = subShape;
							});
							return struct;
						case "list":
							var list = [];
							AWS$26.util.arrayEach(shape, function(subShape, index) {
								list.push(filterSensitiveLog(inputShape.member, subShape));
							});
							return list;
						case "map":
							var map = {};
							AWS$26.util.each(shape, function(key, value) {
								map[key] = filterSensitiveLog(inputShape.value, value);
							});
							return map;
						default: return shape;
					}
				}
				function buildMessage() {
					var delta = (resp.request.service.getSkewCorrectedDate().getTime() - req.startTime.getTime()) / 1e3;
					var ansi = logger.isTTY ? true : false;
					var status = resp.httpResponse.statusCode;
					var censoredParams = req.params;
					if (req.service.api.operations && req.service.api.operations[req.operation] && req.service.api.operations[req.operation].input) {
						var inputShape = req.service.api.operations[req.operation].input;
						censoredParams = filterSensitiveLog(inputShape, req.params);
					}
					var params = require_util$1().inspect(censoredParams, true, null);
					var message = "";
					if (ansi) message += "\x1B[33m";
					message += "[AWS " + req.service.serviceIdentifier + " " + status;
					message += " " + delta.toString() + "s " + resp.retryCount + " retries]";
					if (ansi) message += "\x1B[0;1m";
					message += " " + AWS$26.util.string.lowerFirst(req.operation);
					message += "(" + params + ")";
					if (ansi) message += "\x1B[0m";
					return message;
				}
				var line = buildMessage();
				if (typeof logger.log === "function") logger.log(line);
				else if (typeof logger.write === "function") logger.write(line + "\n");
			});
		}),
		Json: new SequentialExecutor().addNamedListeners(function(add) {
			var svc = require_json();
			add("BUILD", "build", svc.buildRequest);
			add("EXTRACT_DATA", "extractData", svc.extractData);
			add("EXTRACT_ERROR", "extractError", svc.extractError);
		}),
		Rest: new SequentialExecutor().addNamedListeners(function(add) {
			var svc = require_rest();
			add("BUILD", "build", svc.buildRequest);
			add("EXTRACT_DATA", "extractData", svc.extractData);
			add("EXTRACT_ERROR", "extractError", svc.extractError);
		}),
		RestJson: new SequentialExecutor().addNamedListeners(function(add) {
			var svc = require_rest_json();
			add("BUILD", "build", svc.buildRequest);
			add("EXTRACT_DATA", "extractData", svc.extractData);
			add("EXTRACT_ERROR", "extractError", svc.extractError);
			add("UNSET_CONTENT_LENGTH", "afterBuild", svc.unsetContentLength);
		}),
		RestXml: new SequentialExecutor().addNamedListeners(function(add) {
			var svc = require_rest_xml();
			add("BUILD", "build", svc.buildRequest);
			add("EXTRACT_DATA", "extractData", svc.extractData);
			add("EXTRACT_ERROR", "extractError", svc.extractError);
		}),
		Query: new SequentialExecutor().addNamedListeners(function(add) {
			var svc = require_query();
			add("BUILD", "build", svc.buildRequest);
			add("EXTRACT_DATA", "extractData", svc.extractData);
			add("EXTRACT_ERROR", "extractError", svc.extractError);
		})
	};
}));

//#endregion
//#region node_modules/aws-sdk/lib/state_machine.js
var require_state_machine = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	function AcceptorStateMachine$1(states, state) {
		this.currentState = state || null;
		this.states = states || {};
	}
	AcceptorStateMachine$1.prototype.runTo = function runTo(finalState, done, bindObject, inputError) {
		if (typeof finalState === "function") {
			inputError = bindObject;
			bindObject = done;
			done = finalState;
			finalState = null;
		}
		var self = this;
		var state = self.states[self.currentState];
		state.fn.call(bindObject || self, inputError, function(err) {
			if (err) if (state.fail) self.currentState = state.fail;
			else return done ? done.call(bindObject, err) : null;
			else if (state.accept) self.currentState = state.accept;
			else return done ? done.call(bindObject) : null;
			if (self.currentState === finalState) return done ? done.call(bindObject, err) : null;
			self.runTo(finalState, done, bindObject, err);
		});
	};
	AcceptorStateMachine$1.prototype.addState = function addState(name, acceptState, failState, fn$1) {
		if (typeof acceptState === "function") {
			fn$1 = acceptState;
			acceptState = null;
			failState = null;
		} else if (typeof failState === "function") {
			fn$1 = failState;
			failState = null;
		}
		if (!this.currentState) this.currentState = name;
		this.states[name] = {
			accept: acceptState,
			fail: failState,
			fn: fn$1
		};
		return this;
	};
	/**
	* @api private
	*/
	module.exports = AcceptorStateMachine$1;
}));

//#endregion
//#region node_modules/jmespath/jmespath.js
var require_jmespath = /* @__PURE__ */ __commonJSMin(((exports) => {
	(function(exports$1) {
		"use strict";
		function isArray$3(obj) {
			if (obj !== null) return Object.prototype.toString.call(obj) === "[object Array]";
			else return false;
		}
		function isObject$3(obj) {
			if (obj !== null) return Object.prototype.toString.call(obj) === "[object Object]";
			else return false;
		}
		function strictDeepEqual(first, second) {
			if (first === second) return true;
			if (Object.prototype.toString.call(first) !== Object.prototype.toString.call(second)) return false;
			if (isArray$3(first) === true) {
				if (first.length !== second.length) return false;
				for (var i$2 = 0; i$2 < first.length; i$2++) if (strictDeepEqual(first[i$2], second[i$2]) === false) return false;
				return true;
			}
			if (isObject$3(first) === true) {
				var keysSeen = {};
				for (var key in first) if (hasOwnProperty.call(first, key)) {
					if (strictDeepEqual(first[key], second[key]) === false) return false;
					keysSeen[key] = true;
				}
				for (var key2 in second) if (hasOwnProperty.call(second, key2)) {
					if (keysSeen[key2] !== true) return false;
				}
				return true;
			}
			return false;
		}
		function isFalse(obj) {
			if (obj === "" || obj === false || obj === null) return true;
			else if (isArray$3(obj) && obj.length === 0) return true;
			else if (isObject$3(obj)) {
				for (var key in obj) if (obj.hasOwnProperty(key)) return false;
				return true;
			} else return false;
		}
		function objValues(obj) {
			var keys = Object.keys(obj);
			var values = [];
			for (var i$2 = 0; i$2 < keys.length; i$2++) values.push(obj[keys[i$2]]);
			return values;
		}
		var trimLeft;
		if (typeof String.prototype.trimLeft === "function") trimLeft = function(str) {
			return str.trimLeft();
		};
		else trimLeft = function(str) {
			return str.match(/^\s*(.*)/)[1];
		};
		var TYPE_NUMBER = 0;
		var TYPE_ANY = 1;
		var TYPE_STRING = 2;
		var TYPE_ARRAY = 3;
		var TYPE_OBJECT = 4;
		var TYPE_BOOLEAN = 5;
		var TYPE_EXPREF = 6;
		var TYPE_NULL = 7;
		var TYPE_ARRAY_NUMBER = 8;
		var TYPE_ARRAY_STRING = 9;
		var TYPE_NAME_TABLE = {
			0: "number",
			1: "any",
			2: "string",
			3: "array",
			4: "object",
			5: "boolean",
			6: "expression",
			7: "null",
			8: "Array<number>",
			9: "Array<string>"
		};
		var TOK_EOF = "EOF";
		var TOK_UNQUOTEDIDENTIFIER = "UnquotedIdentifier";
		var TOK_QUOTEDIDENTIFIER = "QuotedIdentifier";
		var TOK_RBRACKET = "Rbracket";
		var TOK_RPAREN = "Rparen";
		var TOK_COMMA = "Comma";
		var TOK_COLON = "Colon";
		var TOK_RBRACE = "Rbrace";
		var TOK_NUMBER = "Number";
		var TOK_CURRENT = "Current";
		var TOK_EXPREF = "Expref";
		var TOK_PIPE = "Pipe";
		var TOK_OR = "Or";
		var TOK_AND = "And";
		var TOK_EQ = "EQ";
		var TOK_GT = "GT";
		var TOK_LT = "LT";
		var TOK_GTE = "GTE";
		var TOK_LTE = "LTE";
		var TOK_NE = "NE";
		var TOK_FLATTEN = "Flatten";
		var TOK_STAR = "Star";
		var TOK_FILTER = "Filter";
		var TOK_DOT = "Dot";
		var TOK_NOT = "Not";
		var TOK_LBRACE = "Lbrace";
		var TOK_LBRACKET = "Lbracket";
		var TOK_LPAREN = "Lparen";
		var TOK_LITERAL = "Literal";
		var basicTokens = {
			".": TOK_DOT,
			"*": TOK_STAR,
			",": TOK_COMMA,
			":": TOK_COLON,
			"{": TOK_LBRACE,
			"}": TOK_RBRACE,
			"]": TOK_RBRACKET,
			"(": TOK_LPAREN,
			")": TOK_RPAREN,
			"@": TOK_CURRENT
		};
		var operatorStartToken = {
			"<": true,
			">": true,
			"=": true,
			"!": true
		};
		var skipChars = {
			" ": true,
			"	": true,
			"\n": true
		};
		function isAlpha(ch) {
			return ch >= "a" && ch <= "z" || ch >= "A" && ch <= "Z" || ch === "_";
		}
		function isNum(ch) {
			return ch >= "0" && ch <= "9" || ch === "-";
		}
		function isAlphaNum(ch) {
			return ch >= "a" && ch <= "z" || ch >= "A" && ch <= "Z" || ch >= "0" && ch <= "9" || ch === "_";
		}
		function Lexer() {}
		Lexer.prototype = {
			tokenize: function(stream) {
				var tokens = [];
				this._current = 0;
				var start;
				var identifier;
				var token;
				while (this._current < stream.length) if (isAlpha(stream[this._current])) {
					start = this._current;
					identifier = this._consumeUnquotedIdentifier(stream);
					tokens.push({
						type: TOK_UNQUOTEDIDENTIFIER,
						value: identifier,
						start
					});
				} else if (basicTokens[stream[this._current]] !== void 0) {
					tokens.push({
						type: basicTokens[stream[this._current]],
						value: stream[this._current],
						start: this._current
					});
					this._current++;
				} else if (isNum(stream[this._current])) {
					token = this._consumeNumber(stream);
					tokens.push(token);
				} else if (stream[this._current] === "[") {
					token = this._consumeLBracket(stream);
					tokens.push(token);
				} else if (stream[this._current] === "\"") {
					start = this._current;
					identifier = this._consumeQuotedIdentifier(stream);
					tokens.push({
						type: TOK_QUOTEDIDENTIFIER,
						value: identifier,
						start
					});
				} else if (stream[this._current] === "'") {
					start = this._current;
					identifier = this._consumeRawStringLiteral(stream);
					tokens.push({
						type: TOK_LITERAL,
						value: identifier,
						start
					});
				} else if (stream[this._current] === "`") {
					start = this._current;
					var literal = this._consumeLiteral(stream);
					tokens.push({
						type: TOK_LITERAL,
						value: literal,
						start
					});
				} else if (operatorStartToken[stream[this._current]] !== void 0) tokens.push(this._consumeOperator(stream));
				else if (skipChars[stream[this._current]] !== void 0) this._current++;
				else if (stream[this._current] === "&") {
					start = this._current;
					this._current++;
					if (stream[this._current] === "&") {
						this._current++;
						tokens.push({
							type: TOK_AND,
							value: "&&",
							start
						});
					} else tokens.push({
						type: TOK_EXPREF,
						value: "&",
						start
					});
				} else if (stream[this._current] === "|") {
					start = this._current;
					this._current++;
					if (stream[this._current] === "|") {
						this._current++;
						tokens.push({
							type: TOK_OR,
							value: "||",
							start
						});
					} else tokens.push({
						type: TOK_PIPE,
						value: "|",
						start
					});
				} else {
					var error = /* @__PURE__ */ new Error("Unknown character:" + stream[this._current]);
					error.name = "LexerError";
					throw error;
				}
				return tokens;
			},
			_consumeUnquotedIdentifier: function(stream) {
				var start = this._current;
				this._current++;
				while (this._current < stream.length && isAlphaNum(stream[this._current])) this._current++;
				return stream.slice(start, this._current);
			},
			_consumeQuotedIdentifier: function(stream) {
				var start = this._current;
				this._current++;
				var maxLength = stream.length;
				while (stream[this._current] !== "\"" && this._current < maxLength) {
					var current = this._current;
					if (stream[current] === "\\" && (stream[current + 1] === "\\" || stream[current + 1] === "\"")) current += 2;
					else current++;
					this._current = current;
				}
				this._current++;
				return JSON.parse(stream.slice(start, this._current));
			},
			_consumeRawStringLiteral: function(stream) {
				var start = this._current;
				this._current++;
				var maxLength = stream.length;
				while (stream[this._current] !== "'" && this._current < maxLength) {
					var current = this._current;
					if (stream[current] === "\\" && (stream[current + 1] === "\\" || stream[current + 1] === "'")) current += 2;
					else current++;
					this._current = current;
				}
				this._current++;
				return stream.slice(start + 1, this._current - 1).replace("\\'", "'");
			},
			_consumeNumber: function(stream) {
				var start = this._current;
				this._current++;
				var maxLength = stream.length;
				while (isNum(stream[this._current]) && this._current < maxLength) this._current++;
				return {
					type: TOK_NUMBER,
					value: parseInt(stream.slice(start, this._current)),
					start
				};
			},
			_consumeLBracket: function(stream) {
				var start = this._current;
				this._current++;
				if (stream[this._current] === "?") {
					this._current++;
					return {
						type: TOK_FILTER,
						value: "[?",
						start
					};
				} else if (stream[this._current] === "]") {
					this._current++;
					return {
						type: TOK_FLATTEN,
						value: "[]",
						start
					};
				} else return {
					type: TOK_LBRACKET,
					value: "[",
					start
				};
			},
			_consumeOperator: function(stream) {
				var start = this._current;
				var startingChar = stream[start];
				this._current++;
				if (startingChar === "!") if (stream[this._current] === "=") {
					this._current++;
					return {
						type: TOK_NE,
						value: "!=",
						start
					};
				} else return {
					type: TOK_NOT,
					value: "!",
					start
				};
				else if (startingChar === "<") if (stream[this._current] === "=") {
					this._current++;
					return {
						type: TOK_LTE,
						value: "<=",
						start
					};
				} else return {
					type: TOK_LT,
					value: "<",
					start
				};
				else if (startingChar === ">") if (stream[this._current] === "=") {
					this._current++;
					return {
						type: TOK_GTE,
						value: ">=",
						start
					};
				} else return {
					type: TOK_GT,
					value: ">",
					start
				};
				else if (startingChar === "=") {
					if (stream[this._current] === "=") {
						this._current++;
						return {
							type: TOK_EQ,
							value: "==",
							start
						};
					}
				}
			},
			_consumeLiteral: function(stream) {
				this._current++;
				var start = this._current;
				var maxLength = stream.length;
				var literal;
				while (stream[this._current] !== "`" && this._current < maxLength) {
					var current = this._current;
					if (stream[current] === "\\" && (stream[current + 1] === "\\" || stream[current + 1] === "`")) current += 2;
					else current++;
					this._current = current;
				}
				var literalString = trimLeft(stream.slice(start, this._current));
				literalString = literalString.replace("\\`", "`");
				if (this._looksLikeJSON(literalString)) literal = JSON.parse(literalString);
				else literal = JSON.parse("\"" + literalString + "\"");
				this._current++;
				return literal;
			},
			_looksLikeJSON: function(literalString) {
				var startingChars = "[{\"";
				var jsonLiterals = [
					"true",
					"false",
					"null"
				];
				var numberLooking = "-0123456789";
				if (literalString === "") return false;
				else if (startingChars.indexOf(literalString[0]) >= 0) return true;
				else if (jsonLiterals.indexOf(literalString) >= 0) return true;
				else if (numberLooking.indexOf(literalString[0]) >= 0) try {
					JSON.parse(literalString);
					return true;
				} catch (ex) {
					return false;
				}
				else return false;
			}
		};
		var bindingPower = {};
		bindingPower[TOK_EOF] = 0;
		bindingPower[TOK_UNQUOTEDIDENTIFIER] = 0;
		bindingPower[TOK_QUOTEDIDENTIFIER] = 0;
		bindingPower[TOK_RBRACKET] = 0;
		bindingPower[TOK_RPAREN] = 0;
		bindingPower[TOK_COMMA] = 0;
		bindingPower[TOK_RBRACE] = 0;
		bindingPower[TOK_NUMBER] = 0;
		bindingPower[TOK_CURRENT] = 0;
		bindingPower[TOK_EXPREF] = 0;
		bindingPower[TOK_PIPE] = 1;
		bindingPower[TOK_OR] = 2;
		bindingPower[TOK_AND] = 3;
		bindingPower[TOK_EQ] = 5;
		bindingPower[TOK_GT] = 5;
		bindingPower[TOK_LT] = 5;
		bindingPower[TOK_GTE] = 5;
		bindingPower[TOK_LTE] = 5;
		bindingPower[TOK_NE] = 5;
		bindingPower[TOK_FLATTEN] = 9;
		bindingPower[TOK_STAR] = 20;
		bindingPower[TOK_FILTER] = 21;
		bindingPower[TOK_DOT] = 40;
		bindingPower[TOK_NOT] = 45;
		bindingPower[TOK_LBRACE] = 50;
		bindingPower[TOK_LBRACKET] = 55;
		bindingPower[TOK_LPAREN] = 60;
		function Parser() {}
		Parser.prototype = {
			parse: function(expression) {
				this._loadTokens(expression);
				this.index = 0;
				var ast = this.expression(0);
				if (this._lookahead(0) !== TOK_EOF) {
					var t = this._lookaheadToken(0);
					var error = /* @__PURE__ */ new Error("Unexpected token type: " + t.type + ", value: " + t.value);
					error.name = "ParserError";
					throw error;
				}
				return ast;
			},
			_loadTokens: function(expression) {
				var tokens = new Lexer().tokenize(expression);
				tokens.push({
					type: TOK_EOF,
					value: "",
					start: expression.length
				});
				this.tokens = tokens;
			},
			expression: function(rbp) {
				var leftToken = this._lookaheadToken(0);
				this._advance();
				var left = this.nud(leftToken);
				var currentToken = this._lookahead(0);
				while (rbp < bindingPower[currentToken]) {
					this._advance();
					left = this.led(currentToken, left);
					currentToken = this._lookahead(0);
				}
				return left;
			},
			_lookahead: function(number) {
				return this.tokens[this.index + number].type;
			},
			_lookaheadToken: function(number) {
				return this.tokens[this.index + number];
			},
			_advance: function() {
				this.index++;
			},
			nud: function(token) {
				var left;
				var right;
				var expression;
				switch (token.type) {
					case TOK_LITERAL: return {
						type: "Literal",
						value: token.value
					};
					case TOK_UNQUOTEDIDENTIFIER: return {
						type: "Field",
						name: token.value
					};
					case TOK_QUOTEDIDENTIFIER:
						var node = {
							type: "Field",
							name: token.value
						};
						if (this._lookahead(0) === TOK_LPAREN) throw new Error("Quoted identifier not allowed for function names.");
						return node;
					case TOK_NOT:
						right = this.expression(bindingPower.Not);
						return {
							type: "NotExpression",
							children: [right]
						};
					case TOK_STAR:
						left = { type: "Identity" };
						right = null;
						if (this._lookahead(0) === TOK_RBRACKET) right = { type: "Identity" };
						else right = this._parseProjectionRHS(bindingPower.Star);
						return {
							type: "ValueProjection",
							children: [left, right]
						};
					case TOK_FILTER: return this.led(token.type, { type: "Identity" });
					case TOK_LBRACE: return this._parseMultiselectHash();
					case TOK_FLATTEN:
						left = {
							type: TOK_FLATTEN,
							children: [{ type: "Identity" }]
						};
						right = this._parseProjectionRHS(bindingPower.Flatten);
						return {
							type: "Projection",
							children: [left, right]
						};
					case TOK_LBRACKET:
						if (this._lookahead(0) === TOK_NUMBER || this._lookahead(0) === TOK_COLON) {
							right = this._parseIndexExpression();
							return this._projectIfSlice({ type: "Identity" }, right);
						} else if (this._lookahead(0) === TOK_STAR && this._lookahead(1) === TOK_RBRACKET) {
							this._advance();
							this._advance();
							right = this._parseProjectionRHS(bindingPower.Star);
							return {
								type: "Projection",
								children: [{ type: "Identity" }, right]
							};
						}
						return this._parseMultiselectList();
					case TOK_CURRENT: return { type: TOK_CURRENT };
					case TOK_EXPREF:
						expression = this.expression(bindingPower.Expref);
						return {
							type: "ExpressionReference",
							children: [expression]
						};
					case TOK_LPAREN:
						var args = [];
						while (this._lookahead(0) !== TOK_RPAREN) {
							if (this._lookahead(0) === TOK_CURRENT) {
								expression = { type: TOK_CURRENT };
								this._advance();
							} else expression = this.expression(0);
							args.push(expression);
						}
						this._match(TOK_RPAREN);
						return args[0];
					default: this._errorToken(token);
				}
			},
			led: function(tokenName, left) {
				var right;
				switch (tokenName) {
					case TOK_DOT:
						var rbp = bindingPower.Dot;
						if (this._lookahead(0) !== TOK_STAR) {
							right = this._parseDotRHS(rbp);
							return {
								type: "Subexpression",
								children: [left, right]
							};
						}
						this._advance();
						right = this._parseProjectionRHS(rbp);
						return {
							type: "ValueProjection",
							children: [left, right]
						};
					case TOK_PIPE:
						right = this.expression(bindingPower.Pipe);
						return {
							type: TOK_PIPE,
							children: [left, right]
						};
					case TOK_OR:
						right = this.expression(bindingPower.Or);
						return {
							type: "OrExpression",
							children: [left, right]
						};
					case TOK_AND:
						right = this.expression(bindingPower.And);
						return {
							type: "AndExpression",
							children: [left, right]
						};
					case TOK_LPAREN:
						var name = left.name;
						var args = [];
						var expression, node;
						while (this._lookahead(0) !== TOK_RPAREN) {
							if (this._lookahead(0) === TOK_CURRENT) {
								expression = { type: TOK_CURRENT };
								this._advance();
							} else expression = this.expression(0);
							if (this._lookahead(0) === TOK_COMMA) this._match(TOK_COMMA);
							args.push(expression);
						}
						this._match(TOK_RPAREN);
						node = {
							type: "Function",
							name,
							children: args
						};
						return node;
					case TOK_FILTER:
						var condition = this.expression(0);
						this._match(TOK_RBRACKET);
						if (this._lookahead(0) === TOK_FLATTEN) right = { type: "Identity" };
						else right = this._parseProjectionRHS(bindingPower.Filter);
						return {
							type: "FilterProjection",
							children: [
								left,
								right,
								condition
							]
						};
					case TOK_FLATTEN: return {
						type: "Projection",
						children: [{
							type: TOK_FLATTEN,
							children: [left]
						}, this._parseProjectionRHS(bindingPower.Flatten)]
					};
					case TOK_EQ:
					case TOK_NE:
					case TOK_GT:
					case TOK_GTE:
					case TOK_LT:
					case TOK_LTE: return this._parseComparator(left, tokenName);
					case TOK_LBRACKET:
						var token = this._lookaheadToken(0);
						if (token.type === TOK_NUMBER || token.type === TOK_COLON) {
							right = this._parseIndexExpression();
							return this._projectIfSlice(left, right);
						}
						this._match(TOK_STAR);
						this._match(TOK_RBRACKET);
						right = this._parseProjectionRHS(bindingPower.Star);
						return {
							type: "Projection",
							children: [left, right]
						};
					default: this._errorToken(this._lookaheadToken(0));
				}
			},
			_match: function(tokenType) {
				if (this._lookahead(0) === tokenType) this._advance();
				else {
					var t = this._lookaheadToken(0);
					var error = /* @__PURE__ */ new Error("Expected " + tokenType + ", got: " + t.type);
					error.name = "ParserError";
					throw error;
				}
			},
			_errorToken: function(token) {
				var error = /* @__PURE__ */ new Error("Invalid token (" + token.type + "): \"" + token.value + "\"");
				error.name = "ParserError";
				throw error;
			},
			_parseIndexExpression: function() {
				if (this._lookahead(0) === TOK_COLON || this._lookahead(1) === TOK_COLON) return this._parseSliceExpression();
				else {
					var node = {
						type: "Index",
						value: this._lookaheadToken(0).value
					};
					this._advance();
					this._match(TOK_RBRACKET);
					return node;
				}
			},
			_projectIfSlice: function(left, right) {
				var indexExpr = {
					type: "IndexExpression",
					children: [left, right]
				};
				if (right.type === "Slice") return {
					type: "Projection",
					children: [indexExpr, this._parseProjectionRHS(bindingPower.Star)]
				};
				else return indexExpr;
			},
			_parseSliceExpression: function() {
				var parts = [
					null,
					null,
					null
				];
				var index = 0;
				var currentToken = this._lookahead(0);
				while (currentToken !== TOK_RBRACKET && index < 3) {
					if (currentToken === TOK_COLON) {
						index++;
						this._advance();
					} else if (currentToken === TOK_NUMBER) {
						parts[index] = this._lookaheadToken(0).value;
						this._advance();
					} else {
						var t = this._lookahead(0);
						var error = /* @__PURE__ */ new Error("Syntax error, unexpected token: " + t.value + "(" + t.type + ")");
						error.name = "Parsererror";
						throw error;
					}
					currentToken = this._lookahead(0);
				}
				this._match(TOK_RBRACKET);
				return {
					type: "Slice",
					children: parts
				};
			},
			_parseComparator: function(left, comparator) {
				return {
					type: "Comparator",
					name: comparator,
					children: [left, this.expression(bindingPower[comparator])]
				};
			},
			_parseDotRHS: function(rbp) {
				var lookahead = this._lookahead(0);
				if ([
					TOK_UNQUOTEDIDENTIFIER,
					TOK_QUOTEDIDENTIFIER,
					TOK_STAR
				].indexOf(lookahead) >= 0) return this.expression(rbp);
				else if (lookahead === TOK_LBRACKET) {
					this._match(TOK_LBRACKET);
					return this._parseMultiselectList();
				} else if (lookahead === TOK_LBRACE) {
					this._match(TOK_LBRACE);
					return this._parseMultiselectHash();
				}
			},
			_parseProjectionRHS: function(rbp) {
				var right;
				if (bindingPower[this._lookahead(0)] < 10) right = { type: "Identity" };
				else if (this._lookahead(0) === TOK_LBRACKET) right = this.expression(rbp);
				else if (this._lookahead(0) === TOK_FILTER) right = this.expression(rbp);
				else if (this._lookahead(0) === TOK_DOT) {
					this._match(TOK_DOT);
					right = this._parseDotRHS(rbp);
				} else {
					var t = this._lookaheadToken(0);
					var error = /* @__PURE__ */ new Error("Sytanx error, unexpected token: " + t.value + "(" + t.type + ")");
					error.name = "ParserError";
					throw error;
				}
				return right;
			},
			_parseMultiselectList: function() {
				var expressions = [];
				while (this._lookahead(0) !== TOK_RBRACKET) {
					var expression = this.expression(0);
					expressions.push(expression);
					if (this._lookahead(0) === TOK_COMMA) {
						this._match(TOK_COMMA);
						if (this._lookahead(0) === TOK_RBRACKET) throw new Error("Unexpected token Rbracket");
					}
				}
				this._match(TOK_RBRACKET);
				return {
					type: "MultiSelectList",
					children: expressions
				};
			},
			_parseMultiselectHash: function() {
				var pairs = [];
				var identifierTypes = [TOK_UNQUOTEDIDENTIFIER, TOK_QUOTEDIDENTIFIER];
				var keyToken, keyName, value, node;
				for (;;) {
					keyToken = this._lookaheadToken(0);
					if (identifierTypes.indexOf(keyToken.type) < 0) throw new Error("Expecting an identifier token, got: " + keyToken.type);
					keyName = keyToken.value;
					this._advance();
					this._match(TOK_COLON);
					value = this.expression(0);
					node = {
						type: "KeyValuePair",
						name: keyName,
						value
					};
					pairs.push(node);
					if (this._lookahead(0) === TOK_COMMA) this._match(TOK_COMMA);
					else if (this._lookahead(0) === TOK_RBRACE) {
						this._match(TOK_RBRACE);
						break;
					}
				}
				return {
					type: "MultiSelectHash",
					children: pairs
				};
			}
		};
		function TreeInterpreter(runtime) {
			this.runtime = runtime;
		}
		TreeInterpreter.prototype = {
			search: function(node, value) {
				return this.visit(node, value);
			},
			visit: function(node, value) {
				var matched, current, result, first, second, field, left, right, collected, i$2;
				switch (node.type) {
					case "Field":
						if (value !== null && isObject$3(value)) {
							field = value[node.name];
							if (field === void 0) return null;
							else return field;
						}
						return null;
					case "Subexpression":
						result = this.visit(node.children[0], value);
						for (i$2 = 1; i$2 < node.children.length; i$2++) {
							result = this.visit(node.children[1], result);
							if (result === null) return null;
						}
						return result;
					case "IndexExpression":
						left = this.visit(node.children[0], value);
						right = this.visit(node.children[1], left);
						return right;
					case "Index":
						if (!isArray$3(value)) return null;
						var index = node.value;
						if (index < 0) index = value.length + index;
						result = value[index];
						if (result === void 0) result = null;
						return result;
					case "Slice":
						if (!isArray$3(value)) return null;
						var sliceParams = node.children.slice(0);
						var computed = this.computeSliceParams(value.length, sliceParams);
						var start = computed[0];
						var stop = computed[1];
						var step = computed[2];
						result = [];
						if (step > 0) for (i$2 = start; i$2 < stop; i$2 += step) result.push(value[i$2]);
						else for (i$2 = start; i$2 > stop; i$2 += step) result.push(value[i$2]);
						return result;
					case "Projection":
						var base = this.visit(node.children[0], value);
						if (!isArray$3(base)) return null;
						collected = [];
						for (i$2 = 0; i$2 < base.length; i$2++) {
							current = this.visit(node.children[1], base[i$2]);
							if (current !== null) collected.push(current);
						}
						return collected;
					case "ValueProjection":
						base = this.visit(node.children[0], value);
						if (!isObject$3(base)) return null;
						collected = [];
						var values = objValues(base);
						for (i$2 = 0; i$2 < values.length; i$2++) {
							current = this.visit(node.children[1], values[i$2]);
							if (current !== null) collected.push(current);
						}
						return collected;
					case "FilterProjection":
						base = this.visit(node.children[0], value);
						if (!isArray$3(base)) return null;
						var filtered = [];
						var finalResults = [];
						for (i$2 = 0; i$2 < base.length; i$2++) {
							matched = this.visit(node.children[2], base[i$2]);
							if (!isFalse(matched)) filtered.push(base[i$2]);
						}
						for (var j = 0; j < filtered.length; j++) {
							current = this.visit(node.children[1], filtered[j]);
							if (current !== null) finalResults.push(current);
						}
						return finalResults;
					case "Comparator":
						first = this.visit(node.children[0], value);
						second = this.visit(node.children[1], value);
						switch (node.name) {
							case TOK_EQ:
								result = strictDeepEqual(first, second);
								break;
							case TOK_NE:
								result = !strictDeepEqual(first, second);
								break;
							case TOK_GT:
								result = first > second;
								break;
							case TOK_GTE:
								result = first >= second;
								break;
							case TOK_LT:
								result = first < second;
								break;
							case TOK_LTE:
								result = first <= second;
								break;
							default: throw new Error("Unknown comparator: " + node.name);
						}
						return result;
					case TOK_FLATTEN:
						var original = this.visit(node.children[0], value);
						if (!isArray$3(original)) return null;
						var merged = [];
						for (i$2 = 0; i$2 < original.length; i$2++) {
							current = original[i$2];
							if (isArray$3(current)) merged.push.apply(merged, current);
							else merged.push(current);
						}
						return merged;
					case "Identity": return value;
					case "MultiSelectList":
						if (value === null) return null;
						collected = [];
						for (i$2 = 0; i$2 < node.children.length; i$2++) collected.push(this.visit(node.children[i$2], value));
						return collected;
					case "MultiSelectHash":
						if (value === null) return null;
						collected = {};
						var child;
						for (i$2 = 0; i$2 < node.children.length; i$2++) {
							child = node.children[i$2];
							collected[child.name] = this.visit(child.value, value);
						}
						return collected;
					case "OrExpression":
						matched = this.visit(node.children[0], value);
						if (isFalse(matched)) matched = this.visit(node.children[1], value);
						return matched;
					case "AndExpression":
						first = this.visit(node.children[0], value);
						if (isFalse(first) === true) return first;
						return this.visit(node.children[1], value);
					case "NotExpression":
						first = this.visit(node.children[0], value);
						return isFalse(first);
					case "Literal": return node.value;
					case TOK_PIPE:
						left = this.visit(node.children[0], value);
						return this.visit(node.children[1], left);
					case TOK_CURRENT: return value;
					case "Function":
						var resolvedArgs = [];
						for (i$2 = 0; i$2 < node.children.length; i$2++) resolvedArgs.push(this.visit(node.children[i$2], value));
						return this.runtime.callFunction(node.name, resolvedArgs);
					case "ExpressionReference":
						var refNode = node.children[0];
						refNode.jmespathType = TOK_EXPREF;
						return refNode;
					default: throw new Error("Unknown node type: " + node.type);
				}
			},
			computeSliceParams: function(arrayLength, sliceParams) {
				var start = sliceParams[0];
				var stop = sliceParams[1];
				var step = sliceParams[2];
				var computed = [
					null,
					null,
					null
				];
				if (step === null) step = 1;
				else if (step === 0) {
					var error = /* @__PURE__ */ new Error("Invalid slice, step cannot be 0");
					error.name = "RuntimeError";
					throw error;
				}
				var stepValueNegative = step < 0 ? true : false;
				if (start === null) start = stepValueNegative ? arrayLength - 1 : 0;
				else start = this.capSliceRange(arrayLength, start, step);
				if (stop === null) stop = stepValueNegative ? -1 : arrayLength;
				else stop = this.capSliceRange(arrayLength, stop, step);
				computed[0] = start;
				computed[1] = stop;
				computed[2] = step;
				return computed;
			},
			capSliceRange: function(arrayLength, actualValue, step) {
				if (actualValue < 0) {
					actualValue += arrayLength;
					if (actualValue < 0) actualValue = step < 0 ? -1 : 0;
				} else if (actualValue >= arrayLength) actualValue = step < 0 ? arrayLength - 1 : arrayLength;
				return actualValue;
			}
		};
		function Runtime(interpreter) {
			this._interpreter = interpreter;
			this.functionTable = {
				abs: {
					_func: this._functionAbs,
					_signature: [{ types: [TYPE_NUMBER] }]
				},
				avg: {
					_func: this._functionAvg,
					_signature: [{ types: [TYPE_ARRAY_NUMBER] }]
				},
				ceil: {
					_func: this._functionCeil,
					_signature: [{ types: [TYPE_NUMBER] }]
				},
				contains: {
					_func: this._functionContains,
					_signature: [{ types: [TYPE_STRING, TYPE_ARRAY] }, { types: [TYPE_ANY] }]
				},
				"ends_with": {
					_func: this._functionEndsWith,
					_signature: [{ types: [TYPE_STRING] }, { types: [TYPE_STRING] }]
				},
				floor: {
					_func: this._functionFloor,
					_signature: [{ types: [TYPE_NUMBER] }]
				},
				length: {
					_func: this._functionLength,
					_signature: [{ types: [
						TYPE_STRING,
						TYPE_ARRAY,
						TYPE_OBJECT
					] }]
				},
				map: {
					_func: this._functionMap,
					_signature: [{ types: [TYPE_EXPREF] }, { types: [TYPE_ARRAY] }]
				},
				max: {
					_func: this._functionMax,
					_signature: [{ types: [TYPE_ARRAY_NUMBER, TYPE_ARRAY_STRING] }]
				},
				"merge": {
					_func: this._functionMerge,
					_signature: [{
						types: [TYPE_OBJECT],
						variadic: true
					}]
				},
				"max_by": {
					_func: this._functionMaxBy,
					_signature: [{ types: [TYPE_ARRAY] }, { types: [TYPE_EXPREF] }]
				},
				sum: {
					_func: this._functionSum,
					_signature: [{ types: [TYPE_ARRAY_NUMBER] }]
				},
				"starts_with": {
					_func: this._functionStartsWith,
					_signature: [{ types: [TYPE_STRING] }, { types: [TYPE_STRING] }]
				},
				min: {
					_func: this._functionMin,
					_signature: [{ types: [TYPE_ARRAY_NUMBER, TYPE_ARRAY_STRING] }]
				},
				"min_by": {
					_func: this._functionMinBy,
					_signature: [{ types: [TYPE_ARRAY] }, { types: [TYPE_EXPREF] }]
				},
				type: {
					_func: this._functionType,
					_signature: [{ types: [TYPE_ANY] }]
				},
				keys: {
					_func: this._functionKeys,
					_signature: [{ types: [TYPE_OBJECT] }]
				},
				values: {
					_func: this._functionValues,
					_signature: [{ types: [TYPE_OBJECT] }]
				},
				sort: {
					_func: this._functionSort,
					_signature: [{ types: [TYPE_ARRAY_STRING, TYPE_ARRAY_NUMBER] }]
				},
				"sort_by": {
					_func: this._functionSortBy,
					_signature: [{ types: [TYPE_ARRAY] }, { types: [TYPE_EXPREF] }]
				},
				join: {
					_func: this._functionJoin,
					_signature: [{ types: [TYPE_STRING] }, { types: [TYPE_ARRAY_STRING] }]
				},
				reverse: {
					_func: this._functionReverse,
					_signature: [{ types: [TYPE_STRING, TYPE_ARRAY] }]
				},
				"to_array": {
					_func: this._functionToArray,
					_signature: [{ types: [TYPE_ANY] }]
				},
				"to_string": {
					_func: this._functionToString,
					_signature: [{ types: [TYPE_ANY] }]
				},
				"to_number": {
					_func: this._functionToNumber,
					_signature: [{ types: [TYPE_ANY] }]
				},
				"not_null": {
					_func: this._functionNotNull,
					_signature: [{
						types: [TYPE_ANY],
						variadic: true
					}]
				}
			};
		}
		Runtime.prototype = {
			callFunction: function(name, resolvedArgs) {
				var functionEntry = this.functionTable[name];
				if (functionEntry === void 0) throw new Error("Unknown function: " + name + "()");
				this._validateArgs(name, resolvedArgs, functionEntry._signature);
				return functionEntry._func.call(this, resolvedArgs);
			},
			_validateArgs: function(name, args, signature) {
				var pluralized;
				if (signature[signature.length - 1].variadic) {
					if (args.length < signature.length) {
						pluralized = signature.length === 1 ? " argument" : " arguments";
						throw new Error("ArgumentError: " + name + "() takes at least" + signature.length + pluralized + " but received " + args.length);
					}
				} else if (args.length !== signature.length) {
					pluralized = signature.length === 1 ? " argument" : " arguments";
					throw new Error("ArgumentError: " + name + "() takes " + signature.length + pluralized + " but received " + args.length);
				}
				var currentSpec;
				var actualType;
				var typeMatched;
				for (var i$2 = 0; i$2 < signature.length; i$2++) {
					typeMatched = false;
					currentSpec = signature[i$2].types;
					actualType = this._getTypeName(args[i$2]);
					for (var j = 0; j < currentSpec.length; j++) if (this._typeMatches(actualType, currentSpec[j], args[i$2])) {
						typeMatched = true;
						break;
					}
					if (!typeMatched) {
						var expected = currentSpec.map(function(typeIdentifier) {
							return TYPE_NAME_TABLE[typeIdentifier];
						}).join(",");
						throw new Error("TypeError: " + name + "() expected argument " + (i$2 + 1) + " to be type " + expected + " but received type " + TYPE_NAME_TABLE[actualType] + " instead.");
					}
				}
			},
			_typeMatches: function(actual, expected, argValue) {
				if (expected === TYPE_ANY) return true;
				if (expected === TYPE_ARRAY_STRING || expected === TYPE_ARRAY_NUMBER || expected === TYPE_ARRAY) {
					if (expected === TYPE_ARRAY) return actual === TYPE_ARRAY;
					else if (actual === TYPE_ARRAY) {
						var subtype;
						if (expected === TYPE_ARRAY_NUMBER) subtype = TYPE_NUMBER;
						else if (expected === TYPE_ARRAY_STRING) subtype = TYPE_STRING;
						for (var i$2 = 0; i$2 < argValue.length; i$2++) if (!this._typeMatches(this._getTypeName(argValue[i$2]), subtype, argValue[i$2])) return false;
						return true;
					}
				} else return actual === expected;
			},
			_getTypeName: function(obj) {
				switch (Object.prototype.toString.call(obj)) {
					case "[object String]": return TYPE_STRING;
					case "[object Number]": return TYPE_NUMBER;
					case "[object Array]": return TYPE_ARRAY;
					case "[object Boolean]": return TYPE_BOOLEAN;
					case "[object Null]": return TYPE_NULL;
					case "[object Object]": if (obj.jmespathType === TOK_EXPREF) return TYPE_EXPREF;
					else return TYPE_OBJECT;
				}
			},
			_functionStartsWith: function(resolvedArgs) {
				return resolvedArgs[0].lastIndexOf(resolvedArgs[1]) === 0;
			},
			_functionEndsWith: function(resolvedArgs) {
				var searchStr = resolvedArgs[0];
				var suffix = resolvedArgs[1];
				return searchStr.indexOf(suffix, searchStr.length - suffix.length) !== -1;
			},
			_functionReverse: function(resolvedArgs) {
				if (this._getTypeName(resolvedArgs[0]) === TYPE_STRING) {
					var originalStr = resolvedArgs[0];
					var reversedStr = "";
					for (var i$2 = originalStr.length - 1; i$2 >= 0; i$2--) reversedStr += originalStr[i$2];
					return reversedStr;
				} else {
					var reversedArray = resolvedArgs[0].slice(0);
					reversedArray.reverse();
					return reversedArray;
				}
			},
			_functionAbs: function(resolvedArgs) {
				return Math.abs(resolvedArgs[0]);
			},
			_functionCeil: function(resolvedArgs) {
				return Math.ceil(resolvedArgs[0]);
			},
			_functionAvg: function(resolvedArgs) {
				var sum = 0;
				var inputArray = resolvedArgs[0];
				for (var i$2 = 0; i$2 < inputArray.length; i$2++) sum += inputArray[i$2];
				return sum / inputArray.length;
			},
			_functionContains: function(resolvedArgs) {
				return resolvedArgs[0].indexOf(resolvedArgs[1]) >= 0;
			},
			_functionFloor: function(resolvedArgs) {
				return Math.floor(resolvedArgs[0]);
			},
			_functionLength: function(resolvedArgs) {
				if (!isObject$3(resolvedArgs[0])) return resolvedArgs[0].length;
				else return Object.keys(resolvedArgs[0]).length;
			},
			_functionMap: function(resolvedArgs) {
				var mapped = [];
				var interpreter = this._interpreter;
				var exprefNode = resolvedArgs[0];
				var elements = resolvedArgs[1];
				for (var i$2 = 0; i$2 < elements.length; i$2++) mapped.push(interpreter.visit(exprefNode, elements[i$2]));
				return mapped;
			},
			_functionMerge: function(resolvedArgs) {
				var merged = {};
				for (var i$2 = 0; i$2 < resolvedArgs.length; i$2++) {
					var current = resolvedArgs[i$2];
					for (var key in current) merged[key] = current[key];
				}
				return merged;
			},
			_functionMax: function(resolvedArgs) {
				if (resolvedArgs[0].length > 0) if (this._getTypeName(resolvedArgs[0][0]) === TYPE_NUMBER) return Math.max.apply(Math, resolvedArgs[0]);
				else {
					var elements = resolvedArgs[0];
					var maxElement = elements[0];
					for (var i$2 = 1; i$2 < elements.length; i$2++) if (maxElement.localeCompare(elements[i$2]) < 0) maxElement = elements[i$2];
					return maxElement;
				}
				else return null;
			},
			_functionMin: function(resolvedArgs) {
				if (resolvedArgs[0].length > 0) if (this._getTypeName(resolvedArgs[0][0]) === TYPE_NUMBER) return Math.min.apply(Math, resolvedArgs[0]);
				else {
					var elements = resolvedArgs[0];
					var minElement = elements[0];
					for (var i$2 = 1; i$2 < elements.length; i$2++) if (elements[i$2].localeCompare(minElement) < 0) minElement = elements[i$2];
					return minElement;
				}
				else return null;
			},
			_functionSum: function(resolvedArgs) {
				var sum = 0;
				var listToSum = resolvedArgs[0];
				for (var i$2 = 0; i$2 < listToSum.length; i$2++) sum += listToSum[i$2];
				return sum;
			},
			_functionType: function(resolvedArgs) {
				switch (this._getTypeName(resolvedArgs[0])) {
					case TYPE_NUMBER: return "number";
					case TYPE_STRING: return "string";
					case TYPE_ARRAY: return "array";
					case TYPE_OBJECT: return "object";
					case TYPE_BOOLEAN: return "boolean";
					case TYPE_EXPREF: return "expref";
					case TYPE_NULL: return "null";
				}
			},
			_functionKeys: function(resolvedArgs) {
				return Object.keys(resolvedArgs[0]);
			},
			_functionValues: function(resolvedArgs) {
				var obj = resolvedArgs[0];
				var keys = Object.keys(obj);
				var values = [];
				for (var i$2 = 0; i$2 < keys.length; i$2++) values.push(obj[keys[i$2]]);
				return values;
			},
			_functionJoin: function(resolvedArgs) {
				var joinChar = resolvedArgs[0];
				return resolvedArgs[1].join(joinChar);
			},
			_functionToArray: function(resolvedArgs) {
				if (this._getTypeName(resolvedArgs[0]) === TYPE_ARRAY) return resolvedArgs[0];
				else return [resolvedArgs[0]];
			},
			_functionToString: function(resolvedArgs) {
				if (this._getTypeName(resolvedArgs[0]) === TYPE_STRING) return resolvedArgs[0];
				else return JSON.stringify(resolvedArgs[0]);
			},
			_functionToNumber: function(resolvedArgs) {
				var typeName = this._getTypeName(resolvedArgs[0]);
				var convertedValue;
				if (typeName === TYPE_NUMBER) return resolvedArgs[0];
				else if (typeName === TYPE_STRING) {
					convertedValue = +resolvedArgs[0];
					if (!isNaN(convertedValue)) return convertedValue;
				}
				return null;
			},
			_functionNotNull: function(resolvedArgs) {
				for (var i$2 = 0; i$2 < resolvedArgs.length; i$2++) if (this._getTypeName(resolvedArgs[i$2]) !== TYPE_NULL) return resolvedArgs[i$2];
				return null;
			},
			_functionSort: function(resolvedArgs) {
				var sortedArray = resolvedArgs[0].slice(0);
				sortedArray.sort();
				return sortedArray;
			},
			_functionSortBy: function(resolvedArgs) {
				var sortedArray = resolvedArgs[0].slice(0);
				if (sortedArray.length === 0) return sortedArray;
				var interpreter = this._interpreter;
				var exprefNode = resolvedArgs[1];
				var requiredType = this._getTypeName(interpreter.visit(exprefNode, sortedArray[0]));
				if ([TYPE_NUMBER, TYPE_STRING].indexOf(requiredType) < 0) throw new Error("TypeError");
				var that = this;
				var decorated = [];
				for (var i$2 = 0; i$2 < sortedArray.length; i$2++) decorated.push([i$2, sortedArray[i$2]]);
				decorated.sort(function(a, b) {
					var exprA = interpreter.visit(exprefNode, a[1]);
					var exprB = interpreter.visit(exprefNode, b[1]);
					if (that._getTypeName(exprA) !== requiredType) throw new Error("TypeError: expected " + requiredType + ", received " + that._getTypeName(exprA));
					else if (that._getTypeName(exprB) !== requiredType) throw new Error("TypeError: expected " + requiredType + ", received " + that._getTypeName(exprB));
					if (exprA > exprB) return 1;
					else if (exprA < exprB) return -1;
					else return a[0] - b[0];
				});
				for (var j = 0; j < decorated.length; j++) sortedArray[j] = decorated[j][1];
				return sortedArray;
			},
			_functionMaxBy: function(resolvedArgs) {
				var exprefNode = resolvedArgs[1];
				var resolvedArray = resolvedArgs[0];
				var keyFunction = this.createKeyFunction(exprefNode, [TYPE_NUMBER, TYPE_STRING]);
				var maxNumber = -Infinity;
				var maxRecord;
				var current;
				for (var i$2 = 0; i$2 < resolvedArray.length; i$2++) {
					current = keyFunction(resolvedArray[i$2]);
					if (current > maxNumber) {
						maxNumber = current;
						maxRecord = resolvedArray[i$2];
					}
				}
				return maxRecord;
			},
			_functionMinBy: function(resolvedArgs) {
				var exprefNode = resolvedArgs[1];
				var resolvedArray = resolvedArgs[0];
				var keyFunction = this.createKeyFunction(exprefNode, [TYPE_NUMBER, TYPE_STRING]);
				var minNumber = Infinity;
				var minRecord;
				var current;
				for (var i$2 = 0; i$2 < resolvedArray.length; i$2++) {
					current = keyFunction(resolvedArray[i$2]);
					if (current < minNumber) {
						minNumber = current;
						minRecord = resolvedArray[i$2];
					}
				}
				return minRecord;
			},
			createKeyFunction: function(exprefNode, allowedTypes) {
				var that = this;
				var interpreter = this._interpreter;
				var keyFunc = function(x) {
					var current = interpreter.visit(exprefNode, x);
					if (allowedTypes.indexOf(that._getTypeName(current)) < 0) {
						var msg = "TypeError: expected one of " + allowedTypes + ", received " + that._getTypeName(current);
						throw new Error(msg);
					}
					return current;
				};
				return keyFunc;
			}
		};
		function compile(stream) {
			return new Parser().parse(stream);
		}
		function tokenize(stream) {
			return new Lexer().tokenize(stream);
		}
		function search(data, expression) {
			var parser = new Parser();
			var runtime = new Runtime();
			var interpreter = new TreeInterpreter(runtime);
			runtime._interpreter = interpreter;
			var node = parser.parse(expression);
			return interpreter.search(node, data);
		}
		exports$1.tokenize = tokenize;
		exports$1.compile = compile;
		exports$1.search = search;
		exports$1.strictDeepEqual = strictDeepEqual;
	})(typeof exports === "undefined" ? exports.jmespath = {} : exports);
}));

//#endregion
//#region node_modules/aws-sdk/lib/request.js
var require_request = /* @__PURE__ */ __commonJSMin((() => {
	var AWS$25 = require_core();
	var AcceptorStateMachine = require_state_machine();
	var inherit$9 = AWS$25.util.inherit;
	var domain = AWS$25.util.domain;
	var jmespath$2 = require_jmespath();
	/**
	* @api private
	*/
	var hardErrorStates = {
		success: 1,
		error: 1,
		complete: 1
	};
	function isTerminalState(machine) {
		return Object.prototype.hasOwnProperty.call(hardErrorStates, machine._asm.currentState);
	}
	var fsm = new AcceptorStateMachine();
	fsm.setupStates = function() {
		var transition = function(_, done) {
			var self = this;
			self._haltHandlersOnError = false;
			self.emit(self._asm.currentState, function(err) {
				if (err) if (isTerminalState(self)) if (domain && self.domain instanceof domain.Domain) {
					err.domainEmitter = self;
					err.domain = self.domain;
					err.domainThrown = false;
					self.domain.emit("error", err);
				} else throw err;
				else {
					self.response.error = err;
					done(err);
				}
				else done(self.response.error);
			});
		};
		this.addState("validate", "build", "error", transition);
		this.addState("build", "afterBuild", "restart", transition);
		this.addState("afterBuild", "sign", "restart", transition);
		this.addState("sign", "send", "retry", transition);
		this.addState("retry", "afterRetry", "afterRetry", transition);
		this.addState("afterRetry", "sign", "error", transition);
		this.addState("send", "validateResponse", "retry", transition);
		this.addState("validateResponse", "extractData", "extractError", transition);
		this.addState("extractError", "extractData", "retry", transition);
		this.addState("extractData", "success", "retry", transition);
		this.addState("restart", "build", "error", transition);
		this.addState("success", "complete", "complete", transition);
		this.addState("error", "complete", "complete", transition);
		this.addState("complete", null, null, transition);
	};
	fsm.setupStates();
	/**
	* ## Asynchronous Requests
	*
	* All requests made through the SDK are asynchronous and use a
	* callback interface. Each service method that kicks off a request
	* returns an `AWS.Request` object that you can use to register
	* callbacks.
	*
	* For example, the following service method returns the request
	* object as "request", which can be used to register callbacks:
	*
	* ```javascript
	* // request is an AWS.Request object
	* var request = ec2.describeInstances();
	*
	* // register callbacks on request to retrieve response data
	* request.on('success', function(response) {
	*   console.log(response.data);
	* });
	* ```
	*
	* When a request is ready to be sent, the {send} method should
	* be called:
	*
	* ```javascript
	* request.send();
	* ```
	*
	* Since registered callbacks may or may not be idempotent, requests should only
	* be sent once. To perform the same operation multiple times, you will need to
	* create multiple request objects, each with its own registered callbacks.
	*
	* ## Removing Default Listeners for Events
	*
	* Request objects are built with default listeners for the various events,
	* depending on the service type. In some cases, you may want to remove
	* some built-in listeners to customize behaviour. Doing this requires
	* access to the built-in listener functions, which are exposed through
	* the {AWS.EventListeners.Core} namespace. For instance, you may
	* want to customize the HTTP handler used when sending a request. In this
	* case, you can remove the built-in listener associated with the 'send'
	* event, the {AWS.EventListeners.Core.SEND} listener and add your own.
	*
	* ## Multiple Callbacks and Chaining
	*
	* You can register multiple callbacks on any request object. The
	* callbacks can be registered for different events, or all for the
	* same event. In addition, you can chain callback registration, for
	* example:
	*
	* ```javascript
	* request.
	*   on('success', function(response) {
	*     console.log("Success!");
	*   }).
	*   on('error', function(error, response) {
	*     console.log("Error!");
	*   }).
	*   on('complete', function(response) {
	*     console.log("Always!");
	*   }).
	*   send();
	* ```
	*
	* The above example will print either "Success! Always!", or "Error! Always!",
	* depending on whether the request succeeded or not.
	*
	* @!attribute httpRequest
	*   @readonly
	*   @!group HTTP Properties
	*   @return [AWS.HttpRequest] the raw HTTP request object
	*     containing request headers and body information
	*     sent by the service.
	*
	* @!attribute startTime
	*   @readonly
	*   @!group Operation Properties
	*   @return [Date] the time that the request started
	*
	* @!group Request Building Events
	*
	* @!event validate(request)
	*   Triggered when a request is being validated. Listeners
	*   should throw an error if the request should not be sent.
	*   @param request [Request] the request object being sent
	*   @see AWS.EventListeners.Core.VALIDATE_CREDENTIALS
	*   @see AWS.EventListeners.Core.VALIDATE_REGION
	*   @example Ensuring that a certain parameter is set before sending a request
	*     var req = s3.putObject(params);
	*     req.on('validate', function() {
	*       if (!req.params.Body.match(/^Hello\s/)) {
	*         throw new Error('Body must start with "Hello "');
	*       }
	*     });
	*     req.send(function(err, data) { ... });
	*
	* @!event build(request)
	*   Triggered when the request payload is being built. Listeners
	*   should fill the necessary information to send the request
	*   over HTTP.
	*   @param (see AWS.Request~validate)
	*   @example Add a custom HTTP header to a request
	*     var req = s3.putObject(params);
	*     req.on('build', function() {
	*       req.httpRequest.headers['Custom-Header'] = 'value';
	*     });
	*     req.send(function(err, data) { ... });
	*
	* @!event sign(request)
	*   Triggered when the request is being signed. Listeners should
	*   add the correct authentication headers and/or adjust the body,
	*   depending on the authentication mechanism being used.
	*   @param (see AWS.Request~validate)
	*
	* @!group Request Sending Events
	*
	* @!event send(response)
	*   Triggered when the request is ready to be sent. Listeners
	*   should call the underlying transport layer to initiate
	*   the sending of the request.
	*   @param response [Response] the response object
	*   @context [Request] the request object that was sent
	*   @see AWS.EventListeners.Core.SEND
	*
	* @!event retry(response)
	*   Triggered when a request failed and might need to be retried or redirected.
	*   If the response is retryable, the listener should set the
	*   `response.error.retryable` property to `true`, and optionally set
	*   `response.error.retryDelay` to the millisecond delay for the next attempt.
	*   In the case of a redirect, `response.error.redirect` should be set to
	*   `true` with `retryDelay` set to an optional delay on the next request.
	*
	*   If a listener decides that a request should not be retried,
	*   it should set both `retryable` and `redirect` to false.
	*
	*   Note that a retryable error will be retried at most
	*   {AWS.Config.maxRetries} times (based on the service object's config).
	*   Similarly, a request that is redirected will only redirect at most
	*   {AWS.Config.maxRedirects} times.
	*
	*   @param (see AWS.Request~send)
	*   @context (see AWS.Request~send)
	*   @example Adding a custom retry for a 404 response
	*     request.on('retry', function(response) {
	*       // this resource is not yet available, wait 10 seconds to get it again
	*       if (response.httpResponse.statusCode === 404 && response.error) {
	*         response.error.retryable = true;   // retry this error
	*         response.error.retryDelay = 10000; // wait 10 seconds
	*       }
	*     });
	*
	* @!group Data Parsing Events
	*
	* @!event extractError(response)
	*   Triggered on all non-2xx requests so that listeners can extract
	*   error details from the response body. Listeners to this event
	*   should set the `response.error` property.
	*   @param (see AWS.Request~send)
	*   @context (see AWS.Request~send)
	*
	* @!event extractData(response)
	*   Triggered in successful requests to allow listeners to
	*   de-serialize the response body into `response.data`.
	*   @param (see AWS.Request~send)
	*   @context (see AWS.Request~send)
	*
	* @!group Completion Events
	*
	* @!event success(response)
	*   Triggered when the request completed successfully.
	*   `response.data` will contain the response data and
	*   `response.error` will be null.
	*   @param (see AWS.Request~send)
	*   @context (see AWS.Request~send)
	*
	* @!event error(error, response)
	*   Triggered when an error occurs at any point during the
	*   request. `response.error` will contain details about the error
	*   that occurred. `response.data` will be null.
	*   @param error [Error] the error object containing details about
	*     the error that occurred.
	*   @param (see AWS.Request~send)
	*   @context (see AWS.Request~send)
	*
	* @!event complete(response)
	*   Triggered whenever a request cycle completes. `response.error`
	*   should be checked, since the request may have failed.
	*   @param (see AWS.Request~send)
	*   @context (see AWS.Request~send)
	*
	* @!group HTTP Events
	*
	* @!event httpHeaders(statusCode, headers, response, statusMessage)
	*   Triggered when headers are sent by the remote server
	*   @param statusCode [Integer] the HTTP response code
	*   @param headers [map<String,String>] the response headers
	*   @param (see AWS.Request~send)
	*   @param statusMessage [String] A status message corresponding to the HTTP
	*                                 response code
	*   @context (see AWS.Request~send)
	*
	* @!event httpData(chunk, response)
	*   Triggered when data is sent by the remote server
	*   @param chunk [Buffer] the buffer data containing the next data chunk
	*     from the server
	*   @param (see AWS.Request~send)
	*   @context (see AWS.Request~send)
	*   @see AWS.EventListeners.Core.HTTP_DATA
	*
	* @!event httpUploadProgress(progress, response)
	*   Triggered when the HTTP request has uploaded more data
	*   @param progress [map] An object containing the `loaded` and `total` bytes
	*     of the request.
	*   @param (see AWS.Request~send)
	*   @context (see AWS.Request~send)
	*   @note This event will not be emitted in Node.js 0.8.x.
	*
	* @!event httpDownloadProgress(progress, response)
	*   Triggered when the HTTP request has downloaded more data
	*   @param progress [map] An object containing the `loaded` and `total` bytes
	*     of the request.
	*   @param (see AWS.Request~send)
	*   @context (see AWS.Request~send)
	*   @note This event will not be emitted in Node.js 0.8.x.
	*
	* @!event httpError(error, response)
	*   Triggered when the HTTP request failed
	*   @param error [Error] the error object that was thrown
	*   @param (see AWS.Request~send)
	*   @context (see AWS.Request~send)
	*
	* @!event httpDone(response)
	*   Triggered when the server is finished sending data
	*   @param (see AWS.Request~send)
	*   @context (see AWS.Request~send)
	*
	* @see AWS.Response
	*/
	AWS$25.Request = inherit$9({
		constructor: function Request(service, operation, params) {
			var endpoint = service.endpoint;
			var region = service.config.region;
			var customUserAgent = service.config.customUserAgent;
			if (service.signingRegion) region = service.signingRegion;
			else if (service.isGlobalEndpoint) region = "us-east-1";
			this.domain = domain && domain.active;
			this.service = service;
			this.operation = operation;
			this.params = params || {};
			this.httpRequest = new AWS$25.HttpRequest(endpoint, region);
			this.httpRequest.appendToUserAgent(customUserAgent);
			this.startTime = service.getSkewCorrectedDate();
			this.response = new AWS$25.Response(this);
			this._asm = new AcceptorStateMachine(fsm.states, "validate");
			this._haltHandlersOnError = false;
			AWS$25.SequentialExecutor.call(this);
			this.emit = this.emitEvent;
		},
		send: function send(callback) {
			if (callback) {
				this.httpRequest.appendToUserAgent("callback");
				this.on("complete", function(resp) {
					callback.call(resp, resp.error, resp.data);
				});
			}
			this.runTo();
			return this.response;
		},
		build: function build(callback) {
			return this.runTo("send", callback);
		},
		runTo: function runTo(state, done) {
			this._asm.runTo(state, done, this);
			return this;
		},
		abort: function abort() {
			this.removeAllListeners("validateResponse");
			this.removeAllListeners("extractError");
			this.on("validateResponse", function addAbortedError(resp) {
				resp.error = AWS$25.util.error(/* @__PURE__ */ new Error("Request aborted by user"), {
					code: "RequestAbortedError",
					retryable: false
				});
			});
			if (this.httpRequest.stream && !this.httpRequest.stream.didCallback) {
				this.httpRequest.stream.abort();
				if (this.httpRequest._abortCallback) this.httpRequest._abortCallback();
				else this.removeAllListeners("send");
			}
			return this;
		},
		eachPage: function eachPage(callback) {
			callback = AWS$25.util.fn.makeAsync(callback, 3);
			function wrappedCallback(response) {
				callback.call(response, response.error, response.data, function(result) {
					if (result === false) return;
					if (response.hasNextPage()) response.nextPage().on("complete", wrappedCallback).send();
					else callback.call(response, null, null, AWS$25.util.fn.noop);
				});
			}
			this.on("complete", wrappedCallback).send();
		},
		eachItem: function eachItem(callback) {
			var self = this;
			function wrappedCallback(err, data) {
				if (err) return callback(err, null);
				if (data === null) return callback(null, null);
				var resultKey = self.service.paginationConfig(self.operation).resultKey;
				if (Array.isArray(resultKey)) resultKey = resultKey[0];
				var items = jmespath$2.search(data, resultKey);
				var continueIteration = true;
				AWS$25.util.arrayEach(items, function(item) {
					continueIteration = callback(null, item);
					if (continueIteration === false) return AWS$25.util.abort;
				});
				return continueIteration;
			}
			this.eachPage(wrappedCallback);
		},
		isPageable: function isPageable() {
			return this.service.paginationConfig(this.operation) ? true : false;
		},
		createReadStream: function createReadStream() {
			var streams = AWS$25.util.stream;
			var req = this;
			var stream = null;
			if (AWS$25.HttpClient.streamsApiVersion === 2) {
				stream = new streams.PassThrough();
				process.nextTick(function() {
					req.send();
				});
			} else {
				stream = new streams.Stream();
				stream.readable = true;
				stream.sent = false;
				stream.on("newListener", function(event) {
					if (!stream.sent && event === "data") {
						stream.sent = true;
						process.nextTick(function() {
							req.send();
						});
					}
				});
			}
			this.on("error", function(err) {
				stream.emit("error", err);
			});
			this.on("httpHeaders", function streamHeaders(statusCode, headers, resp) {
				if (statusCode < 300) {
					req.removeListener("httpData", AWS$25.EventListeners.Core.HTTP_DATA);
					req.removeListener("httpError", AWS$25.EventListeners.Core.HTTP_ERROR);
					req.on("httpError", function streamHttpError(error) {
						resp.error = error;
						resp.error.retryable = false;
					});
					var shouldCheckContentLength = false;
					var expectedLen;
					if (req.httpRequest.method !== "HEAD") expectedLen = parseInt(headers["content-length"], 10);
					if (expectedLen !== void 0 && !isNaN(expectedLen) && expectedLen >= 0) {
						shouldCheckContentLength = true;
						var receivedLen = 0;
					}
					var checkContentLengthAndEmit = function checkContentLengthAndEmit$1() {
						if (shouldCheckContentLength && receivedLen !== expectedLen) stream.emit("error", AWS$25.util.error(/* @__PURE__ */ new Error("Stream content length mismatch. Received " + receivedLen + " of " + expectedLen + " bytes."), { code: "StreamContentLengthMismatch" }));
						else if (AWS$25.HttpClient.streamsApiVersion === 2) stream.end();
						else stream.emit("end");
					};
					var httpStream = resp.httpResponse.createUnbufferedStream();
					if (AWS$25.HttpClient.streamsApiVersion === 2) if (shouldCheckContentLength) {
						var lengthAccumulator = new streams.PassThrough();
						lengthAccumulator._write = function(chunk) {
							if (chunk && chunk.length) receivedLen += chunk.length;
							return streams.PassThrough.prototype._write.apply(this, arguments);
						};
						lengthAccumulator.on("end", checkContentLengthAndEmit);
						stream.on("error", function(err) {
							shouldCheckContentLength = false;
							httpStream.unpipe(lengthAccumulator);
							lengthAccumulator.emit("end");
							lengthAccumulator.end();
						});
						httpStream.pipe(lengthAccumulator).pipe(stream, { end: false });
					} else httpStream.pipe(stream);
					else {
						if (shouldCheckContentLength) httpStream.on("data", function(arg) {
							if (arg && arg.length) receivedLen += arg.length;
						});
						httpStream.on("data", function(arg) {
							stream.emit("data", arg);
						});
						httpStream.on("end", checkContentLengthAndEmit);
					}
					httpStream.on("error", function(err) {
						shouldCheckContentLength = false;
						stream.emit("error", err);
					});
				}
			});
			return stream;
		},
		emitEvent: function emit(eventName, args, done) {
			if (typeof args === "function") {
				done = args;
				args = null;
			}
			if (!done) done = function() {};
			if (!args) args = this.eventParameters(eventName, this.response);
			AWS$25.SequentialExecutor.prototype.emit.call(this, eventName, args, function(err) {
				if (err) this.response.error = err;
				done.call(this, err);
			});
		},
		eventParameters: function eventParameters(eventName) {
			switch (eventName) {
				case "restart":
				case "validate":
				case "sign":
				case "build":
				case "afterValidate":
				case "afterBuild": return [this];
				case "error": return [this.response.error, this.response];
				default: return [this.response];
			}
		},
		presign: function presign(expires, callback) {
			if (!callback && typeof expires === "function") {
				callback = expires;
				expires = null;
			}
			return new AWS$25.Signers.Presign().sign(this.toGet(), expires, callback);
		},
		isPresigned: function isPresigned() {
			return Object.prototype.hasOwnProperty.call(this.httpRequest.headers, "presigned-expires");
		},
		toUnauthenticated: function toUnauthenticated() {
			this._unAuthenticated = true;
			this.removeListener("validate", AWS$25.EventListeners.Core.VALIDATE_CREDENTIALS);
			this.removeListener("sign", AWS$25.EventListeners.Core.SIGN);
			return this;
		},
		toGet: function toGet() {
			if (this.service.api.protocol === "query" || this.service.api.protocol === "ec2") {
				this.removeListener("build", this.buildAsGet);
				this.addListener("build", this.buildAsGet);
			}
			return this;
		},
		buildAsGet: function buildAsGet(request) {
			request.httpRequest.method = "GET";
			request.httpRequest.path = request.service.endpoint.path + "?" + request.httpRequest.body;
			request.httpRequest.body = "";
			delete request.httpRequest.headers["Content-Length"];
			delete request.httpRequest.headers["Content-Type"];
		},
		haltHandlersOnError: function haltHandlersOnError() {
			this._haltHandlersOnError = true;
		}
	});
	/**
	* @api private
	*/
	AWS$25.Request.addPromisesToClass = function addPromisesToClass(PromiseDependency) {
		this.prototype.promise = function promise() {
			var self = this;
			this.httpRequest.appendToUserAgent("promise");
			return new PromiseDependency(function(resolve, reject) {
				self.on("complete", function(resp) {
					if (resp.error) reject(resp.error);
					else resolve(Object.defineProperty(resp.data || {}, "$response", { value: resp }));
				});
				self.runTo();
			});
		};
	};
	/**
	* @api private
	*/
	AWS$25.Request.deletePromisesFromClass = function deletePromisesFromClass() {
		delete this.prototype.promise;
	};
	AWS$25.util.addPromises(AWS$25.Request);
	AWS$25.util.mixin(AWS$25.Request, AWS$25.SequentialExecutor);
}));

//#endregion
//#region node_modules/aws-sdk/lib/response.js
var require_response = /* @__PURE__ */ __commonJSMin((() => {
	var AWS$24 = require_core();
	var inherit$8 = AWS$24.util.inherit;
	var jmespath$1 = require_jmespath();
	/**
	* This class encapsulates the response information
	* from a service request operation sent through {AWS.Request}.
	* The response object has two main properties for getting information
	* back from a request:
	*
	* ## The `data` property
	*
	* The `response.data` property contains the serialized object data
	* retrieved from the service request. For instance, for an
	* Amazon DynamoDB `listTables` method call, the response data might
	* look like:
	*
	* ```
	* > resp.data
	* { TableNames:
	*    [ 'table1', 'table2', ... ] }
	* ```
	*
	* The `data` property can be null if an error occurs (see below).
	*
	* ## The `error` property
	*
	* In the event of a service error (or transfer error), the
	* `response.error` property will be filled with the given
	* error data in the form:
	*
	* ```
	* { code: 'SHORT_UNIQUE_ERROR_CODE',
	*   message: 'Some human readable error message' }
	* ```
	*
	* In the case of an error, the `data` property will be `null`.
	* Note that if you handle events that can be in a failure state,
	* you should always check whether `response.error` is set
	* before attempting to access the `response.data` property.
	*
	* @!attribute data
	*   @readonly
	*   @!group Data Properties
	*   @note Inside of a {AWS.Request~httpData} event, this
	*     property contains a single raw packet instead of the
	*     full de-serialized service response.
	*   @return [Object] the de-serialized response data
	*     from the service.
	*
	* @!attribute error
	*   An structure containing information about a service
	*   or networking error.
	*   @readonly
	*   @!group Data Properties
	*   @note This attribute is only filled if a service or
	*     networking error occurs.
	*   @return [Error]
	*     * code [String] a unique short code representing the
	*       error that was emitted.
	*     * message [String] a longer human readable error message
	*     * retryable [Boolean] whether the error message is
	*       retryable.
	*     * statusCode [Numeric] in the case of a request that reached the service,
	*       this value contains the response status code.
	*     * time [Date] the date time object when the error occurred.
	*     * hostname [String] set when a networking error occurs to easily
	*       identify the endpoint of the request.
	*     * region [String] set when a networking error occurs to easily
	*       identify the region of the request.
	*
	* @!attribute requestId
	*   @readonly
	*   @!group Data Properties
	*   @return [String] the unique request ID associated with the response.
	*     Log this value when debugging requests for AWS support.
	*
	* @!attribute retryCount
	*   @readonly
	*   @!group Operation Properties
	*   @return [Integer] the number of retries that were
	*     attempted before the request was completed.
	*
	* @!attribute redirectCount
	*   @readonly
	*   @!group Operation Properties
	*   @return [Integer] the number of redirects that were
	*     followed before the request was completed.
	*
	* @!attribute httpResponse
	*   @readonly
	*   @!group HTTP Properties
	*   @return [AWS.HttpResponse] the raw HTTP response object
	*     containing the response headers and body information
	*     from the server.
	*
	* @see AWS.Request
	*/
	AWS$24.Response = inherit$8({
		constructor: function Response(request) {
			this.request = request;
			this.data = null;
			this.error = null;
			this.retryCount = 0;
			this.redirectCount = 0;
			this.httpResponse = new AWS$24.HttpResponse();
			if (request) {
				this.maxRetries = request.service.numRetries();
				this.maxRedirects = request.service.config.maxRedirects;
			}
		},
		nextPage: function nextPage(callback) {
			var config;
			var service = this.request.service;
			var operation = this.request.operation;
			try {
				config = service.paginationConfig(operation, true);
			} catch (e) {
				this.error = e;
			}
			if (!this.hasNextPage()) {
				if (callback) callback(this.error, null);
				else if (this.error) throw this.error;
				return null;
			}
			var params = AWS$24.util.copy(this.request.params);
			if (!this.nextPageTokens) return callback ? callback(null, null) : null;
			else {
				var inputTokens = config.inputToken;
				if (typeof inputTokens === "string") inputTokens = [inputTokens];
				for (var i$2 = 0; i$2 < inputTokens.length; i$2++) params[inputTokens[i$2]] = this.nextPageTokens[i$2];
				return service.makeRequest(this.request.operation, params, callback);
			}
		},
		hasNextPage: function hasNextPage() {
			this.cacheNextPageTokens();
			if (this.nextPageTokens) return true;
			if (this.nextPageTokens === void 0) return void 0;
			else return false;
		},
		cacheNextPageTokens: function cacheNextPageTokens() {
			if (Object.prototype.hasOwnProperty.call(this, "nextPageTokens")) return this.nextPageTokens;
			this.nextPageTokens = void 0;
			var config = this.request.service.paginationConfig(this.request.operation);
			if (!config) return this.nextPageTokens;
			this.nextPageTokens = null;
			if (config.moreResults) {
				if (!jmespath$1.search(this.data, config.moreResults)) return this.nextPageTokens;
			}
			var exprs = config.outputToken;
			if (typeof exprs === "string") exprs = [exprs];
			AWS$24.util.arrayEach.call(this, exprs, function(expr) {
				var output = jmespath$1.search(this.data, expr);
				if (output) {
					this.nextPageTokens = this.nextPageTokens || [];
					this.nextPageTokens.push(output);
				}
			});
			return this.nextPageTokens;
		}
	});
}));

//#endregion
//#region node_modules/aws-sdk/lib/resource_waiter.js
var require_resource_waiter = /* @__PURE__ */ __commonJSMin((() => {
	/**
	* Copyright 2012-2013 Amazon.com, Inc. or its affiliates. All Rights Reserved.
	*
	* Licensed under the Apache License, Version 2.0 (the "License"). You
	* may not use this file except in compliance with the License. A copy of
	* the License is located at
	*
	*     http://aws.amazon.com/apache2.0/
	*
	* or in the "license" file accompanying this file. This file is
	* distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF
	* ANY KIND, either express or implied. See the License for the specific
	* language governing permissions and limitations under the License.
	*/
	var AWS$23 = require_core();
	var inherit$7 = AWS$23.util.inherit;
	var jmespath = require_jmespath();
	/**
	* @api private
	*/
	function CHECK_ACCEPTORS(resp) {
		var waiter = resp.request._waiter;
		var acceptors = waiter.config.acceptors;
		var acceptorMatched = false;
		var state = "retry";
		acceptors.forEach(function(acceptor) {
			if (!acceptorMatched) {
				var matcher = waiter.matchers[acceptor.matcher];
				if (matcher && matcher(resp, acceptor.expected, acceptor.argument)) {
					acceptorMatched = true;
					state = acceptor.state;
				}
			}
		});
		if (!acceptorMatched && resp.error) state = "failure";
		if (state === "success") waiter.setSuccess(resp);
		else waiter.setError(resp, state === "retry");
	}
	/**
	* @api private
	*/
	AWS$23.ResourceWaiter = inherit$7({
		constructor: function constructor(service, state) {
			this.service = service;
			this.state = state;
			this.loadWaiterConfig(this.state);
		},
		service: null,
		state: null,
		config: null,
		matchers: {
			path: function(resp, expected, argument) {
				try {
					var result = jmespath.search(resp.data, argument);
				} catch (err) {
					return false;
				}
				return jmespath.strictDeepEqual(result, expected);
			},
			pathAll: function(resp, expected, argument) {
				try {
					var results = jmespath.search(resp.data, argument);
				} catch (err) {
					return false;
				}
				if (!Array.isArray(results)) results = [results];
				var numResults = results.length;
				if (!numResults) return false;
				for (var ind = 0; ind < numResults; ind++) if (!jmespath.strictDeepEqual(results[ind], expected)) return false;
				return true;
			},
			pathAny: function(resp, expected, argument) {
				try {
					var results = jmespath.search(resp.data, argument);
				} catch (err) {
					return false;
				}
				if (!Array.isArray(results)) results = [results];
				var numResults = results.length;
				for (var ind = 0; ind < numResults; ind++) if (jmespath.strictDeepEqual(results[ind], expected)) return true;
				return false;
			},
			status: function(resp, expected) {
				var statusCode = resp.httpResponse.statusCode;
				return typeof statusCode === "number" && statusCode === expected;
			},
			error: function(resp, expected) {
				if (typeof expected === "string" && resp.error) return expected === resp.error.code;
				return expected === !!resp.error;
			}
		},
		listeners: new AWS$23.SequentialExecutor().addNamedListeners(function(add) {
			add("RETRY_CHECK", "retry", function(resp) {
				var waiter = resp.request._waiter;
				if (resp.error && resp.error.code === "ResourceNotReady") resp.error.retryDelay = (waiter.config.delay || 0) * 1e3;
			});
			add("CHECK_OUTPUT", "extractData", CHECK_ACCEPTORS);
			add("CHECK_ERROR", "extractError", CHECK_ACCEPTORS);
		}),
		wait: function wait(params, callback) {
			if (typeof params === "function") {
				callback = params;
				params = void 0;
			}
			if (params && params.$waiter) {
				params = AWS$23.util.copy(params);
				if (typeof params.$waiter.delay === "number") this.config.delay = params.$waiter.delay;
				if (typeof params.$waiter.maxAttempts === "number") this.config.maxAttempts = params.$waiter.maxAttempts;
				delete params.$waiter;
			}
			var request = this.service.makeRequest(this.config.operation, params);
			request._waiter = this;
			request.response.maxRetries = this.config.maxAttempts;
			request.addListeners(this.listeners);
			if (callback) request.send(callback);
			return request;
		},
		setSuccess: function setSuccess(resp) {
			resp.error = null;
			resp.data = resp.data || {};
			resp.request.removeAllListeners("extractData");
		},
		setError: function setError(resp, retryable) {
			resp.data = null;
			resp.error = AWS$23.util.error(resp.error || /* @__PURE__ */ new Error(), {
				code: "ResourceNotReady",
				message: "Resource is not in the state " + this.state,
				retryable
			});
		},
		loadWaiterConfig: function loadWaiterConfig(state) {
			if (!this.service.api.waiters[state]) throw new AWS$23.util.error(/* @__PURE__ */ new Error(), {
				code: "StateNotFoundError",
				message: "State " + state + " not found."
			});
			this.config = AWS$23.util.copy(this.service.api.waiters[state]);
		}
	});
}));

//#endregion
//#region node_modules/aws-sdk/lib/signers/v2.js
var require_v2 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var AWS$22 = require_core();
	var inherit$6 = AWS$22.util.inherit;
	/**
	* @api private
	*/
	AWS$22.Signers.V2 = inherit$6(AWS$22.Signers.RequestSigner, {
		addAuthorization: function addAuthorization(credentials, date) {
			if (!date) date = AWS$22.util.date.getDate();
			var r = this.request;
			r.params.Timestamp = AWS$22.util.date.iso8601(date);
			r.params.SignatureVersion = "2";
			r.params.SignatureMethod = "HmacSHA256";
			r.params.AWSAccessKeyId = credentials.accessKeyId;
			if (credentials.sessionToken) r.params.SecurityToken = credentials.sessionToken;
			delete r.params.Signature;
			r.params.Signature = this.signature(credentials);
			r.body = AWS$22.util.queryParamsToString(r.params);
			r.headers["Content-Length"] = r.body.length;
		},
		signature: function signature(credentials) {
			return AWS$22.util.crypto.hmac(credentials.secretAccessKey, this.stringToSign(), "base64");
		},
		stringToSign: function stringToSign() {
			var parts = [];
			parts.push(this.request.method);
			parts.push(this.request.endpoint.host.toLowerCase());
			parts.push(this.request.pathname());
			parts.push(AWS$22.util.queryParamsToString(this.request.params));
			return parts.join("\n");
		}
	});
	/**
	* @api private
	*/
	module.exports = AWS$22.Signers.V2;
}));

//#endregion
//#region node_modules/aws-sdk/lib/signers/v3.js
var require_v3$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var AWS$21 = require_core();
	var inherit$5 = AWS$21.util.inherit;
	/**
	* @api private
	*/
	AWS$21.Signers.V3 = inherit$5(AWS$21.Signers.RequestSigner, {
		addAuthorization: function addAuthorization(credentials, date) {
			var datetime = AWS$21.util.date.rfc822(date);
			this.request.headers["X-Amz-Date"] = datetime;
			if (credentials.sessionToken) this.request.headers["x-amz-security-token"] = credentials.sessionToken;
			this.request.headers["X-Amzn-Authorization"] = this.authorization(credentials, datetime);
		},
		authorization: function authorization(credentials) {
			return "AWS3 AWSAccessKeyId=" + credentials.accessKeyId + ",Algorithm=HmacSHA256,SignedHeaders=" + this.signedHeaders() + ",Signature=" + this.signature(credentials);
		},
		signedHeaders: function signedHeaders() {
			var headers = [];
			AWS$21.util.arrayEach(this.headersToSign(), function iterator(h) {
				headers.push(h.toLowerCase());
			});
			return headers.sort().join(";");
		},
		canonicalHeaders: function canonicalHeaders() {
			var headers = this.request.headers;
			var parts = [];
			AWS$21.util.arrayEach(this.headersToSign(), function iterator(h) {
				parts.push(h.toLowerCase().trim() + ":" + String(headers[h]).trim());
			});
			return parts.sort().join("\n") + "\n";
		},
		headersToSign: function headersToSign() {
			var headers = [];
			AWS$21.util.each(this.request.headers, function iterator(k) {
				if (k === "Host" || k === "Content-Encoding" || k.match(/^X-Amz/i)) headers.push(k);
			});
			return headers;
		},
		signature: function signature(credentials) {
			return AWS$21.util.crypto.hmac(credentials.secretAccessKey, this.stringToSign(), "base64");
		},
		stringToSign: function stringToSign() {
			var parts = [];
			parts.push(this.request.method);
			parts.push("/");
			parts.push("");
			parts.push(this.canonicalHeaders());
			parts.push(this.request.body);
			return AWS$21.util.crypto.sha256(parts.join("\n"));
		}
	});
	/**
	* @api private
	*/
	module.exports = AWS$21.Signers.V3;
}));

//#endregion
//#region node_modules/aws-sdk/lib/signers/v3https.js
var require_v3https = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var AWS$20 = require_core();
	var inherit$4 = AWS$20.util.inherit;
	require_v3$1();
	/**
	* @api private
	*/
	AWS$20.Signers.V3Https = inherit$4(AWS$20.Signers.V3, {
		authorization: function authorization(credentials) {
			return "AWS3-HTTPS AWSAccessKeyId=" + credentials.accessKeyId + ",Algorithm=HmacSHA256,Signature=" + this.signature(credentials);
		},
		stringToSign: function stringToSign() {
			return this.request.headers["X-Amz-Date"];
		}
	});
	/**
	* @api private
	*/
	module.exports = AWS$20.Signers.V3Https;
}));

//#endregion
//#region node_modules/aws-sdk/lib/signers/v4_credentials.js
var require_v4_credentials = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var AWS$19 = require_core();
	/**
	* @api private
	*/
	var cachedSecret = {};
	/**
	* @api private
	*/
	var cacheQueue = [];
	/**
	* @api private
	*/
	var maxCacheEntries = 50;
	/**
	* @api private
	*/
	var v4Identifier = "aws4_request";
	/**
	* @api private
	*/
	module.exports = {
		createScope: function createScope(date, region, serviceName) {
			return [
				date.substr(0, 8),
				region,
				serviceName,
				v4Identifier
			].join("/");
		},
		getSigningKey: function getSigningKey(credentials, date, region, service, shouldCache) {
			var cacheKey = [
				AWS$19.util.crypto.hmac(credentials.secretAccessKey, credentials.accessKeyId, "base64"),
				date,
				region,
				service
			].join("_");
			shouldCache = shouldCache !== false;
			if (shouldCache && cacheKey in cachedSecret) return cachedSecret[cacheKey];
			var kDate = AWS$19.util.crypto.hmac("AWS4" + credentials.secretAccessKey, date, "buffer");
			var kRegion = AWS$19.util.crypto.hmac(kDate, region, "buffer");
			var kService = AWS$19.util.crypto.hmac(kRegion, service, "buffer");
			var signingKey = AWS$19.util.crypto.hmac(kService, v4Identifier, "buffer");
			if (shouldCache) {
				cachedSecret[cacheKey] = signingKey;
				cacheQueue.push(cacheKey);
				if (cacheQueue.length > maxCacheEntries) delete cachedSecret[cacheQueue.shift()];
			}
			return signingKey;
		},
		emptyCache: function emptyCache() {
			cachedSecret = {};
			cacheQueue = [];
		}
	};
}));

//#endregion
//#region node_modules/aws-sdk/lib/signers/v4.js
var require_v4$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var AWS$18 = require_core();
	var v4Credentials = require_v4_credentials();
	var inherit$3 = AWS$18.util.inherit;
	/**
	* @api private
	*/
	var expiresHeader$1 = "presigned-expires";
	/**
	* @api private
	*/
	AWS$18.Signers.V4 = inherit$3(AWS$18.Signers.RequestSigner, {
		constructor: function V4(request, serviceName, options) {
			AWS$18.Signers.RequestSigner.call(this, request);
			this.serviceName = serviceName;
			options = options || {};
			this.signatureCache = typeof options.signatureCache === "boolean" ? options.signatureCache : true;
			this.operation = options.operation;
			this.signatureVersion = options.signatureVersion;
		},
		algorithm: "AWS4-HMAC-SHA256",
		addAuthorization: function addAuthorization(credentials, date) {
			var datetime = AWS$18.util.date.iso8601(date).replace(/[:\-]|\.\d{3}/g, "");
			if (this.isPresigned()) this.updateForPresigned(credentials, datetime);
			else this.addHeaders(credentials, datetime);
			this.request.headers["Authorization"] = this.authorization(credentials, datetime);
		},
		addHeaders: function addHeaders(credentials, datetime) {
			this.request.headers["X-Amz-Date"] = datetime;
			if (credentials.sessionToken) this.request.headers["x-amz-security-token"] = credentials.sessionToken;
		},
		updateForPresigned: function updateForPresigned(credentials, datetime) {
			var credString = this.credentialString(datetime);
			var qs = {
				"X-Amz-Date": datetime,
				"X-Amz-Algorithm": this.algorithm,
				"X-Amz-Credential": credentials.accessKeyId + "/" + credString,
				"X-Amz-Expires": this.request.headers[expiresHeader$1],
				"X-Amz-SignedHeaders": this.signedHeaders()
			};
			if (credentials.sessionToken) qs["X-Amz-Security-Token"] = credentials.sessionToken;
			if (this.request.headers["Content-Type"]) qs["Content-Type"] = this.request.headers["Content-Type"];
			if (this.request.headers["Content-MD5"]) qs["Content-MD5"] = this.request.headers["Content-MD5"];
			if (this.request.headers["Cache-Control"]) qs["Cache-Control"] = this.request.headers["Cache-Control"];
			AWS$18.util.each.call(this, this.request.headers, function(key, value) {
				if (key === expiresHeader$1) return;
				if (this.isSignableHeader(key)) {
					var lowerKey = key.toLowerCase();
					if (lowerKey.indexOf("x-amz-meta-") === 0) qs[lowerKey] = value;
					else if (lowerKey.indexOf("x-amz-") === 0) qs[key] = value;
				}
			});
			var sep = this.request.path.indexOf("?") >= 0 ? "&" : "?";
			this.request.path += sep + AWS$18.util.queryParamsToString(qs);
		},
		authorization: function authorization(credentials, datetime) {
			var parts = [];
			var credString = this.credentialString(datetime);
			parts.push(this.algorithm + " Credential=" + credentials.accessKeyId + "/" + credString);
			parts.push("SignedHeaders=" + this.signedHeaders());
			parts.push("Signature=" + this.signature(credentials, datetime));
			return parts.join(", ");
		},
		signature: function signature(credentials, datetime) {
			var signingKey = v4Credentials.getSigningKey(credentials, datetime.substr(0, 8), this.request.region, this.serviceName, this.signatureCache);
			return AWS$18.util.crypto.hmac(signingKey, this.stringToSign(datetime), "hex");
		},
		stringToSign: function stringToSign(datetime) {
			var parts = [];
			parts.push("AWS4-HMAC-SHA256");
			parts.push(datetime);
			parts.push(this.credentialString(datetime));
			parts.push(this.hexEncodedHash(this.canonicalString()));
			return parts.join("\n");
		},
		canonicalString: function canonicalString() {
			var parts = [], pathname = this.request.pathname();
			if (this.serviceName !== "s3" && this.signatureVersion !== "s3v4") pathname = AWS$18.util.uriEscapePath(pathname);
			parts.push(this.request.method);
			parts.push(pathname);
			parts.push(this.request.search());
			parts.push(this.canonicalHeaders() + "\n");
			parts.push(this.signedHeaders());
			parts.push(this.hexEncodedBodyHash());
			return parts.join("\n");
		},
		canonicalHeaders: function canonicalHeaders() {
			var headers = [];
			AWS$18.util.each.call(this, this.request.headers, function(key, item) {
				headers.push([key, item]);
			});
			headers.sort(function(a, b) {
				return a[0].toLowerCase() < b[0].toLowerCase() ? -1 : 1;
			});
			var parts = [];
			AWS$18.util.arrayEach.call(this, headers, function(item) {
				var key = item[0].toLowerCase();
				if (this.isSignableHeader(key)) {
					var value = item[1];
					if (typeof value === "undefined" || value === null || typeof value.toString !== "function") throw AWS$18.util.error(/* @__PURE__ */ new Error("Header " + key + " contains invalid value"), { code: "InvalidHeader" });
					parts.push(key + ":" + this.canonicalHeaderValues(value.toString()));
				}
			});
			return parts.join("\n");
		},
		canonicalHeaderValues: function canonicalHeaderValues(values) {
			return values.replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "");
		},
		signedHeaders: function signedHeaders() {
			var keys = [];
			AWS$18.util.each.call(this, this.request.headers, function(key) {
				key = key.toLowerCase();
				if (this.isSignableHeader(key)) keys.push(key);
			});
			return keys.sort().join(";");
		},
		credentialString: function credentialString(datetime) {
			return v4Credentials.createScope(datetime.substr(0, 8), this.request.region, this.serviceName);
		},
		hexEncodedHash: function hash(string) {
			return AWS$18.util.crypto.sha256(string, "hex");
		},
		hexEncodedBodyHash: function hexEncodedBodyHash() {
			var request = this.request;
			if (this.isPresigned() && ["s3", "s3-object-lambda"].indexOf(this.serviceName) > -1 && !request.body) return "UNSIGNED-PAYLOAD";
			else if (request.headers["X-Amz-Content-Sha256"]) return request.headers["X-Amz-Content-Sha256"];
			else return this.hexEncodedHash(this.request.body || "");
		},
		unsignableHeaders: [
			"authorization",
			"content-type",
			"content-length",
			"user-agent",
			expiresHeader$1,
			"expect",
			"x-amzn-trace-id"
		],
		isSignableHeader: function isSignableHeader(key) {
			if (key.toLowerCase().indexOf("x-amz-") === 0) return true;
			return this.unsignableHeaders.indexOf(key) < 0;
		},
		isPresigned: function isPresigned() {
			return this.request.headers[expiresHeader$1] ? true : false;
		}
	});
	/**
	* @api private
	*/
	module.exports = AWS$18.Signers.V4;
}));

//#endregion
//#region node_modules/aws-sdk/lib/signers/s3.js
var require_s3 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var AWS$17 = require_core();
	var inherit$2 = AWS$17.util.inherit;
	/**
	* @api private
	*/
	AWS$17.Signers.S3 = inherit$2(AWS$17.Signers.RequestSigner, {
		subResources: {
			"acl": 1,
			"accelerate": 1,
			"analytics": 1,
			"cors": 1,
			"lifecycle": 1,
			"delete": 1,
			"inventory": 1,
			"location": 1,
			"logging": 1,
			"metrics": 1,
			"notification": 1,
			"partNumber": 1,
			"policy": 1,
			"requestPayment": 1,
			"replication": 1,
			"restore": 1,
			"tagging": 1,
			"torrent": 1,
			"uploadId": 1,
			"uploads": 1,
			"versionId": 1,
			"versioning": 1,
			"versions": 1,
			"website": 1
		},
		responseHeaders: {
			"response-content-type": 1,
			"response-content-language": 1,
			"response-expires": 1,
			"response-cache-control": 1,
			"response-content-disposition": 1,
			"response-content-encoding": 1
		},
		addAuthorization: function addAuthorization(credentials, date) {
			if (!this.request.headers["presigned-expires"]) this.request.headers["X-Amz-Date"] = AWS$17.util.date.rfc822(date);
			if (credentials.sessionToken) this.request.headers["x-amz-security-token"] = credentials.sessionToken;
			var signature = this.sign(credentials.secretAccessKey, this.stringToSign());
			var auth = "AWS " + credentials.accessKeyId + ":" + signature;
			this.request.headers["Authorization"] = auth;
		},
		stringToSign: function stringToSign() {
			var r = this.request;
			var parts = [];
			parts.push(r.method);
			parts.push(r.headers["Content-MD5"] || "");
			parts.push(r.headers["Content-Type"] || "");
			parts.push(r.headers["presigned-expires"] || "");
			var headers = this.canonicalizedAmzHeaders();
			if (headers) parts.push(headers);
			parts.push(this.canonicalizedResource());
			return parts.join("\n");
		},
		canonicalizedAmzHeaders: function canonicalizedAmzHeaders() {
			var amzHeaders = [];
			AWS$17.util.each(this.request.headers, function(name) {
				if (name.match(/^x-amz-/i)) amzHeaders.push(name);
			});
			amzHeaders.sort(function(a, b) {
				return a.toLowerCase() < b.toLowerCase() ? -1 : 1;
			});
			var parts = [];
			AWS$17.util.arrayEach.call(this, amzHeaders, function(name) {
				parts.push(name.toLowerCase() + ":" + String(this.request.headers[name]));
			});
			return parts.join("\n");
		},
		canonicalizedResource: function canonicalizedResource() {
			var r = this.request;
			var parts = r.path.split("?");
			var path = parts[0];
			var querystring$1 = parts[1];
			var resource = "";
			if (r.virtualHostedBucket) resource += "/" + r.virtualHostedBucket;
			resource += path;
			if (querystring$1) {
				var resources = [];
				AWS$17.util.arrayEach.call(this, querystring$1.split("&"), function(param) {
					var name = param.split("=")[0];
					var value = param.split("=")[1];
					if (this.subResources[name] || this.responseHeaders[name]) {
						var subresource = { name };
						if (value !== void 0) if (this.subResources[name]) subresource.value = value;
						else subresource.value = decodeURIComponent(value);
						resources.push(subresource);
					}
				});
				resources.sort(function(a, b) {
					return a.name < b.name ? -1 : 1;
				});
				if (resources.length) {
					querystring$1 = [];
					AWS$17.util.arrayEach(resources, function(res) {
						if (res.value === void 0) querystring$1.push(res.name);
						else querystring$1.push(res.name + "=" + res.value);
					});
					resource += "?" + querystring$1.join("&");
				}
			}
			return resource;
		},
		sign: function sign$1(secret, string) {
			return AWS$17.util.crypto.hmac(secret, string, "base64", "sha1");
		}
	});
	/**
	* @api private
	*/
	module.exports = AWS$17.Signers.S3;
}));

//#endregion
//#region node_modules/aws-sdk/lib/signers/presign.js
var require_presign = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var AWS$16 = require_core();
	var inherit$1 = AWS$16.util.inherit;
	/**
	* @api private
	*/
	var expiresHeader = "presigned-expires";
	/**
	* @api private
	*/
	function signedUrlBuilder(request) {
		var expires = request.httpRequest.headers[expiresHeader];
		var signerClass = request.service.getSignerClass(request);
		delete request.httpRequest.headers["User-Agent"];
		delete request.httpRequest.headers["X-Amz-User-Agent"];
		if (signerClass === AWS$16.Signers.V4) {
			if (expires > 604800) throw AWS$16.util.error(/* @__PURE__ */ new Error(), {
				code: "InvalidExpiryTime",
				message: "Presigning does not support expiry time greater than a week with SigV4 signing.",
				retryable: false
			});
			request.httpRequest.headers[expiresHeader] = expires;
		} else if (signerClass === AWS$16.Signers.S3) {
			var now = request.service ? request.service.getSkewCorrectedDate() : AWS$16.util.date.getDate();
			request.httpRequest.headers[expiresHeader] = parseInt(AWS$16.util.date.unixTimestamp(now) + expires, 10).toString();
		} else throw AWS$16.util.error(/* @__PURE__ */ new Error(), {
			message: "Presigning only supports S3 or SigV4 signing.",
			code: "UnsupportedSigner",
			retryable: false
		});
	}
	/**
	* @api private
	*/
	function signedUrlSigner(request) {
		var endpoint = request.httpRequest.endpoint;
		var parsedUrl = AWS$16.util.urlParse(request.httpRequest.path);
		var queryParams = {};
		if (parsedUrl.search) queryParams = AWS$16.util.queryStringParse(parsedUrl.search.substr(1));
		var auth = request.httpRequest.headers["Authorization"].split(" ");
		if (auth[0] === "AWS") {
			auth = auth[1].split(":");
			queryParams["Signature"] = auth.pop();
			queryParams["AWSAccessKeyId"] = auth.join(":");
			AWS$16.util.each(request.httpRequest.headers, function(key, value) {
				if (key === expiresHeader) key = "Expires";
				if (key.indexOf("x-amz-meta-") === 0) {
					delete queryParams[key];
					key = key.toLowerCase();
				}
				queryParams[key] = value;
			});
			delete request.httpRequest.headers[expiresHeader];
			delete queryParams["Authorization"];
			delete queryParams["Host"];
		} else if (auth[0] === "AWS4-HMAC-SHA256") {
			auth.shift();
			var signature = auth.join(" ").match(/Signature=(.*?)(?:,|\s|\r?\n|$)/)[1];
			queryParams["X-Amz-Signature"] = signature;
			delete queryParams["Expires"];
		}
		endpoint.pathname = parsedUrl.pathname;
		endpoint.search = AWS$16.util.queryParamsToString(queryParams);
	}
	/**
	* @api private
	*/
	AWS$16.Signers.Presign = inherit$1({ sign: function sign$1(request, expireTime, callback) {
		request.httpRequest.headers[expiresHeader] = expireTime || 3600;
		request.on("build", signedUrlBuilder);
		request.on("sign", signedUrlSigner);
		request.removeListener("afterBuild", AWS$16.EventListeners.Core.SET_CONTENT_LENGTH);
		request.removeListener("afterBuild", AWS$16.EventListeners.Core.COMPUTE_SHA256);
		request.emit("beforePresign", [request]);
		if (callback) request.build(function() {
			if (this.response.error) callback(this.response.error);
			else callback(null, AWS$16.util.urlFormat(request.httpRequest.endpoint));
		});
		else {
			request.build();
			if (request.response.error) throw request.response.error;
			return AWS$16.util.urlFormat(request.httpRequest.endpoint);
		}
	} });
	/**
	* @api private
	*/
	module.exports = AWS$16.Signers.Presign;
}));

//#endregion
//#region node_modules/aws-sdk/lib/signers/bearer.js
var require_bearer = /* @__PURE__ */ __commonJSMin((() => {
	var AWS$15 = require_core();
	/**
	* @api private
	*/
	AWS$15.Signers.Bearer = AWS$15.util.inherit(AWS$15.Signers.RequestSigner, {
		constructor: function Bearer(request) {
			AWS$15.Signers.RequestSigner.call(this, request);
		},
		addAuthorization: function addAuthorization(token) {
			this.request.headers["Authorization"] = "Bearer " + token.token;
		}
	});
}));

//#endregion
//#region node_modules/aws-sdk/lib/signers/request_signer.js
var require_request_signer = /* @__PURE__ */ __commonJSMin((() => {
	var AWS$14 = require_core();
	var inherit = AWS$14.util.inherit;
	/**
	* @api private
	*/
	AWS$14.Signers.RequestSigner = inherit({
		constructor: function RequestSigner(request) {
			this.request = request;
		},
		setServiceClientId: function setServiceClientId(id) {
			this.serviceClientId = id;
		},
		getServiceClientId: function getServiceClientId() {
			return this.serviceClientId;
		}
	});
	AWS$14.Signers.RequestSigner.getVersion = function getVersion(version) {
		switch (version) {
			case "v2": return AWS$14.Signers.V2;
			case "v3": return AWS$14.Signers.V3;
			case "s3v4": return AWS$14.Signers.V4;
			case "v4": return AWS$14.Signers.V4;
			case "s3": return AWS$14.Signers.S3;
			case "v3https": return AWS$14.Signers.V3Https;
			case "bearer": return AWS$14.Signers.Bearer;
		}
		throw new Error("Unknown signing version " + version);
	};
	require_v2();
	require_v3$1();
	require_v3https();
	require_v4$1();
	require_s3();
	require_presign();
	require_bearer();
}));

//#endregion
//#region node_modules/aws-sdk/lib/param_validator.js
var require_param_validator = /* @__PURE__ */ __commonJSMin((() => {
	var AWS$13 = require_core();
	/**
	* @api private
	*/
	AWS$13.ParamValidator = AWS$13.util.inherit({
		constructor: function ParamValidator(validation) {
			if (validation === true || validation === void 0) validation = { "min": true };
			this.validation = validation;
		},
		validate: function validate(shape, params, context) {
			this.errors = [];
			this.validateMember(shape, params || {}, context || "params");
			if (this.errors.length > 1) {
				var msg = this.errors.join("\n* ");
				msg = "There were " + this.errors.length + " validation errors:\n* " + msg;
				throw AWS$13.util.error(new Error(msg), {
					code: "MultipleValidationErrors",
					errors: this.errors
				});
			} else if (this.errors.length === 1) throw this.errors[0];
			else return true;
		},
		fail: function fail(code$1, message) {
			this.errors.push(AWS$13.util.error(new Error(message), { code: code$1 }));
		},
		validateStructure: function validateStructure(shape, params, context) {
			if (shape.isDocument) return true;
			this.validateType(params, context, ["object"], "structure");
			var paramName;
			for (var i$2 = 0; shape.required && i$2 < shape.required.length; i$2++) {
				paramName = shape.required[i$2];
				var value = params[paramName];
				if (value === void 0 || value === null) this.fail("MissingRequiredParameter", "Missing required key '" + paramName + "' in " + context);
			}
			for (paramName in params) {
				if (!Object.prototype.hasOwnProperty.call(params, paramName)) continue;
				var paramValue = params[paramName], memberShape = shape.members[paramName];
				if (memberShape !== void 0) {
					var memberContext = [context, paramName].join(".");
					this.validateMember(memberShape, paramValue, memberContext);
				} else if (paramValue !== void 0 && paramValue !== null) this.fail("UnexpectedParameter", "Unexpected key '" + paramName + "' found in " + context);
			}
			return true;
		},
		validateMember: function validateMember(shape, param, context) {
			switch (shape.type) {
				case "structure": return this.validateStructure(shape, param, context);
				case "list": return this.validateList(shape, param, context);
				case "map": return this.validateMap(shape, param, context);
				default: return this.validateScalar(shape, param, context);
			}
		},
		validateList: function validateList(shape, params, context) {
			if (this.validateType(params, context, [Array])) {
				this.validateRange(shape, params.length, context, "list member count");
				for (var i$2 = 0; i$2 < params.length; i$2++) this.validateMember(shape.member, params[i$2], context + "[" + i$2 + "]");
			}
		},
		validateMap: function validateMap(shape, params, context) {
			if (this.validateType(params, context, ["object"], "map")) {
				var mapCount = 0;
				for (var param in params) {
					if (!Object.prototype.hasOwnProperty.call(params, param)) continue;
					this.validateMember(shape.key, param, context + "[key='" + param + "']");
					this.validateMember(shape.value, params[param], context + "['" + param + "']");
					mapCount++;
				}
				this.validateRange(shape, mapCount, context, "map member count");
			}
		},
		validateScalar: function validateScalar(shape, value, context) {
			switch (shape.type) {
				case null:
				case void 0:
				case "string": return this.validateString(shape, value, context);
				case "base64":
				case "binary": return this.validatePayload(value, context);
				case "integer":
				case "float": return this.validateNumber(shape, value, context);
				case "boolean": return this.validateType(value, context, ["boolean"]);
				case "timestamp": return this.validateType(value, context, [
					Date,
					/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/,
					"number"
				], "Date object, ISO-8601 string, or a UNIX timestamp");
				default: return this.fail("UnkownType", "Unhandled type " + shape.type + " for " + context);
			}
		},
		validateString: function validateString(shape, value, context) {
			var validTypes = ["string"];
			if (shape.isJsonValue) validTypes = validTypes.concat([
				"number",
				"object",
				"boolean"
			]);
			if (value !== null && this.validateType(value, context, validTypes)) {
				this.validateEnum(shape, value, context);
				this.validateRange(shape, value.length, context, "string length");
				this.validatePattern(shape, value, context);
				this.validateUri(shape, value, context);
			}
		},
		validateUri: function validateUri(shape, value, context) {
			if (shape["location"] === "uri") {
				if (value.length === 0) this.fail("UriParameterError", "Expected uri parameter to have length >= 1, but found \"" + value + "\" for " + context);
			}
		},
		validatePattern: function validatePattern(shape, value, context) {
			if (this.validation["pattern"] && shape["pattern"] !== void 0) {
				if (!new RegExp(shape["pattern"]).test(value)) this.fail("PatternMatchError", "Provided value \"" + value + "\" does not match regex pattern /" + shape["pattern"] + "/ for " + context);
			}
		},
		validateRange: function validateRange(shape, value, context, descriptor) {
			if (this.validation["min"]) {
				if (shape["min"] !== void 0 && value < shape["min"]) this.fail("MinRangeError", "Expected " + descriptor + " >= " + shape["min"] + ", but found " + value + " for " + context);
			}
			if (this.validation["max"]) {
				if (shape["max"] !== void 0 && value > shape["max"]) this.fail("MaxRangeError", "Expected " + descriptor + " <= " + shape["max"] + ", but found " + value + " for " + context);
			}
		},
		validateEnum: function validateRange(shape, value, context) {
			if (this.validation["enum"] && shape["enum"] !== void 0) {
				if (shape["enum"].indexOf(value) === -1) this.fail("EnumError", "Found string value of " + value + ", but expected " + shape["enum"].join("|") + " for " + context);
			}
		},
		validateType: function validateType(value, context, acceptedTypes, type) {
			if (value === null || value === void 0) return false;
			var foundInvalidType = false;
			for (var i$2 = 0; i$2 < acceptedTypes.length; i$2++) {
				if (typeof acceptedTypes[i$2] === "string") {
					if (typeof value === acceptedTypes[i$2]) return true;
				} else if (acceptedTypes[i$2] instanceof RegExp) {
					if ((value || "").toString().match(acceptedTypes[i$2])) return true;
				} else {
					if (value instanceof acceptedTypes[i$2]) return true;
					if (AWS$13.util.isType(value, acceptedTypes[i$2])) return true;
					if (!type && !foundInvalidType) acceptedTypes = acceptedTypes.slice();
					acceptedTypes[i$2] = AWS$13.util.typeName(acceptedTypes[i$2]);
				}
				foundInvalidType = true;
			}
			var acceptedType = type;
			if (!acceptedType) acceptedType = acceptedTypes.join(", ").replace(/,([^,]+)$/, ", or$1");
			var vowel = acceptedType.match(/^[aeiou]/i) ? "n" : "";
			this.fail("InvalidParameterType", "Expected " + context + " to be a" + vowel + " " + acceptedType);
			return false;
		},
		validateNumber: function validateNumber(shape, value, context) {
			if (value === null || value === void 0) return;
			if (typeof value === "string") {
				var castedValue = parseFloat(value);
				if (castedValue.toString() === value) value = castedValue;
			}
			if (this.validateType(value, context, ["number"])) this.validateRange(shape, value, context, "numeric value");
		},
		validatePayload: function validatePayload(value, context) {
			if (value === null || value === void 0) return;
			if (typeof value === "string") return;
			if (value && typeof value.byteLength === "number") return;
			if (AWS$13.util.isNode()) {
				var Stream = AWS$13.util.stream.Stream;
				if (AWS$13.util.Buffer.isBuffer(value) || value instanceof Stream) return;
			} else if (value instanceof Blob) return;
			var types = [
				"Buffer",
				"Stream",
				"File",
				"Blob",
				"ArrayBuffer",
				"DataView"
			];
			if (value) for (var i$2 = 0; i$2 < types.length; i$2++) {
				if (AWS$13.util.isType(value, types[i$2])) return;
				if (AWS$13.util.typeName(value.constructor) === types[i$2]) return;
			}
			this.fail("InvalidParameterType", "Expected " + context + " to be a string, Buffer, Stream, Blob, or typed array object");
		}
	});
}));

//#endregion
//#region node_modules/aws-sdk/lib/maintenance_mode_message.js
var require_maintenance_mode_message = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var warning = [
		"The AWS SDK for JavaScript (v2) is in maintenance mode.",
		" SDK releases are limited to address critical bug fixes and security issues only.\n",
		"Please migrate your code to use AWS SDK for JavaScript (v3).",
		"For more information, check the blog post at https://a.co/cUPnyil"
	].join("\n");
	module.exports = { suppress: false };
	/**
	* To suppress this message:
	* @example
	* require('aws-sdk/lib/maintenance_mode_message').suppress = true;
	*/
	function emitWarning() {
		if (typeof process === "undefined") return;
		if (typeof process.env === "object" && typeof process.env.AWS_EXECUTION_ENV !== "undefined" && process.env.AWS_EXECUTION_ENV.indexOf("AWS_Lambda_") === 0) return;
		if (typeof process.env === "object" && typeof process.env.AWS_SDK_JS_SUPPRESS_MAINTENANCE_MODE_MESSAGE !== "undefined") return;
		if (typeof process.emitWarning === "function") process.emitWarning(warning, { type: "NOTE" });
	}
	setTimeout(function() {
		if (!module.exports.suppress) emitWarning();
	}, 0);
}));

//#endregion
//#region node_modules/aws-sdk/lib/core.js
var require_core = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* The main AWS namespace
	*/
	var AWS$12 = { util: require_util() };
	({}).toString();
	/**
	* @api private
	*/
	module.exports = AWS$12;
	AWS$12.util.update(AWS$12, {
		VERSION: "2.1692.0",
		Signers: {},
		Protocol: {
			Json: require_json(),
			Query: require_query(),
			Rest: require_rest(),
			RestJson: require_rest_json(),
			RestXml: require_rest_xml()
		},
		XML: {
			Builder: require_builder(),
			Parser: null
		},
		JSON: {
			Builder: require_builder$1(),
			Parser: require_parser()
		},
		Model: {
			Api: require_api(),
			Operation: require_operation(),
			Shape: require_shape(),
			Paginator: require_paginator(),
			ResourceWaiter: require_resource_waiter$1()
		},
		apiLoader: require_api_loader(),
		EndpointCache: require_endpoint_cache().EndpointCache
	});
	require_sequential_executor();
	require_service();
	require_config();
	require_http();
	require_event_listeners();
	require_request();
	require_response();
	require_resource_waiter();
	require_request_signer();
	require_param_validator();
	require_maintenance_mode_message();
	/**
	* @readonly
	* @return [AWS.SequentialExecutor] a collection of global event listeners that
	*   are attached to every sent request.
	* @see AWS.Request AWS.Request for a list of events to listen for
	* @example Logging the time taken to send a request
	*   AWS.events.on('send', function startSend(resp) {
	*     resp.startTime = new Date().getTime();
	*   }).on('complete', function calculateTime(resp) {
	*     var time = (new Date().getTime() - resp.startTime) / 1000;
	*     console.log('Request took ' + time + ' seconds');
	*   });
	*
	*   new AWS.S3().listBuckets(); // prints 'Request took 0.285 seconds'
	*/
	AWS$12.events = new AWS$12.SequentialExecutor();
	AWS$12.util.memoizedProperty(AWS$12, "endpointCache", function() {
		return new AWS$12.EndpointCache(AWS$12.config.endpointCacheSize);
	}, true);
}));

//#endregion
//#region (ignored) node_modules/aws-sdk/lib
var require_lib = /* @__PURE__ */ __commonJSMin((() => {}));

//#endregion
//#region node_modules/uuid/dist/rng-browser.js
var require_rng_browser = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = rng;
	var getRandomValues = typeof crypto != "undefined" && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || typeof msCrypto != "undefined" && typeof msCrypto.getRandomValues == "function" && msCrypto.getRandomValues.bind(msCrypto);
	var rnds8 = new Uint8Array(16);
	function rng() {
		if (!getRandomValues) throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
		return getRandomValues(rnds8);
	}
}));

//#endregion
//#region node_modules/uuid/dist/bytesToUuid.js
var require_bytesToUuid = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = void 0;
	/**
	* Convert array of 16 byte values to UUID string format of the form:
	* XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
	*/
	var byteToHex = [];
	for (var i$1 = 0; i$1 < 256; ++i$1) byteToHex[i$1] = (i$1 + 256).toString(16).substr(1);
	function bytesToUuid(buf, offset) {
		var i$2 = offset || 0;
		var bth = byteToHex;
		return [
			bth[buf[i$2++]],
			bth[buf[i$2++]],
			bth[buf[i$2++]],
			bth[buf[i$2++]],
			"-",
			bth[buf[i$2++]],
			bth[buf[i$2++]],
			"-",
			bth[buf[i$2++]],
			bth[buf[i$2++]],
			"-",
			bth[buf[i$2++]],
			bth[buf[i$2++]],
			"-",
			bth[buf[i$2++]],
			bth[buf[i$2++]],
			bth[buf[i$2++]],
			bth[buf[i$2++]],
			bth[buf[i$2++]],
			bth[buf[i$2++]]
		].join("");
	}
	var _default$7 = bytesToUuid;
	exports.default = _default$7;
}));

//#endregion
//#region node_modules/uuid/dist/v1.js
var require_v1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = void 0;
	var _rng$1 = _interopRequireDefault$5(require_rng_browser());
	var _bytesToUuid$2 = _interopRequireDefault$5(require_bytesToUuid());
	function _interopRequireDefault$5(obj) {
		return obj && obj.__esModule ? obj : { default: obj };
	}
	var _nodeId;
	var _clockseq;
	var _lastMSecs = 0;
	var _lastNSecs = 0;
	function v1(options, buf, offset) {
		var i$2 = buf && offset || 0;
		var b = buf || [];
		options = options || {};
		var node = options.node || _nodeId;
		var clockseq = options.clockseq !== void 0 ? options.clockseq : _clockseq;
		if (node == null || clockseq == null) {
			var seedBytes = options.random || (options.rng || _rng$1.default)();
			if (node == null) node = _nodeId = [
				seedBytes[0] | 1,
				seedBytes[1],
				seedBytes[2],
				seedBytes[3],
				seedBytes[4],
				seedBytes[5]
			];
			if (clockseq == null) clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 16383;
		}
		var msecs = options.msecs !== void 0 ? options.msecs : (/* @__PURE__ */ new Date()).getTime();
		var nsecs = options.nsecs !== void 0 ? options.nsecs : _lastNSecs + 1;
		var dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 1e4;
		if (dt < 0 && options.clockseq === void 0) clockseq = clockseq + 1 & 16383;
		if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === void 0) nsecs = 0;
		if (nsecs >= 1e4) throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
		_lastMSecs = msecs;
		_lastNSecs = nsecs;
		_clockseq = clockseq;
		msecs += 0xb1d069b5400;
		var tl = ((msecs & 268435455) * 1e4 + nsecs) % 4294967296;
		b[i$2++] = tl >>> 24 & 255;
		b[i$2++] = tl >>> 16 & 255;
		b[i$2++] = tl >>> 8 & 255;
		b[i$2++] = tl & 255;
		var tmh = msecs / 4294967296 * 1e4 & 268435455;
		b[i$2++] = tmh >>> 8 & 255;
		b[i$2++] = tmh & 255;
		b[i$2++] = tmh >>> 24 & 15 | 16;
		b[i$2++] = tmh >>> 16 & 255;
		b[i$2++] = clockseq >>> 8 | 128;
		b[i$2++] = clockseq & 255;
		for (var n = 0; n < 6; ++n) b[i$2 + n] = node[n];
		return buf ? buf : (0, _bytesToUuid$2.default)(b);
	}
	var _default$6 = v1;
	exports.default = _default$6;
}));

//#endregion
//#region node_modules/uuid/dist/v35.js
var require_v35 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = _default$5;
	exports.URL = exports.DNS = void 0;
	var _bytesToUuid$1 = _interopRequireDefault$4(require_bytesToUuid());
	function _interopRequireDefault$4(obj) {
		return obj && obj.__esModule ? obj : { default: obj };
	}
	function uuidToBytes(uuid) {
		var bytes = [];
		uuid.replace(/[a-fA-F0-9]{2}/g, function(hex) {
			bytes.push(parseInt(hex, 16));
		});
		return bytes;
	}
	function stringToBytes(str) {
		str = unescape(encodeURIComponent(str));
		var bytes = new Array(str.length);
		for (var i$2 = 0; i$2 < str.length; i$2++) bytes[i$2] = str.charCodeAt(i$2);
		return bytes;
	}
	const DNS = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
	exports.DNS = DNS;
	const URL = "6ba7b811-9dad-11d1-80b4-00c04fd430c8";
	exports.URL = URL;
	function _default$5(name, version, hashfunc) {
		var generateUUID = function(value, namespace, buf, offset) {
			var off = buf && offset || 0;
			if (typeof value == "string") value = stringToBytes(value);
			if (typeof namespace == "string") namespace = uuidToBytes(namespace);
			if (!Array.isArray(value)) throw TypeError("value must be an array of bytes");
			if (!Array.isArray(namespace) || namespace.length !== 16) throw TypeError("namespace must be uuid string or an Array of 16 byte values");
			var bytes = hashfunc(namespace.concat(value));
			bytes[6] = bytes[6] & 15 | version;
			bytes[8] = bytes[8] & 63 | 128;
			if (buf) for (var idx = 0; idx < 16; ++idx) buf[off + idx] = bytes[idx];
			return buf || (0, _bytesToUuid$1.default)(bytes);
		};
		try {
			generateUUID.name = name;
		} catch (err) {}
		generateUUID.DNS = DNS;
		generateUUID.URL = URL;
		return generateUUID;
	}
}));

//#endregion
//#region node_modules/uuid/dist/md5-browser.js
var require_md5_browser = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = void 0;
	function md5(bytes) {
		if (typeof bytes == "string") {
			var msg = unescape(encodeURIComponent(bytes));
			bytes = new Array(msg.length);
			for (var i$2 = 0; i$2 < msg.length; i$2++) bytes[i$2] = msg.charCodeAt(i$2);
		}
		return md5ToHexEncodedArray(wordsToMd5(bytesToWords(bytes), bytes.length * 8));
	}
	function md5ToHexEncodedArray(input) {
		var i$2;
		var x;
		var output = [];
		var length32 = input.length * 32;
		var hexTab = "0123456789abcdef";
		var hex;
		for (i$2 = 0; i$2 < length32; i$2 += 8) {
			x = input[i$2 >> 5] >>> i$2 % 32 & 255;
			hex = parseInt(hexTab.charAt(x >>> 4 & 15) + hexTab.charAt(x & 15), 16);
			output.push(hex);
		}
		return output;
	}
	function wordsToMd5(x, len$1) {
		x[len$1 >> 5] |= 128 << len$1 % 32;
		x[(len$1 + 64 >>> 9 << 4) + 14] = len$1;
		var i$2;
		var olda;
		var oldb;
		var oldc;
		var oldd;
		var a = 1732584193;
		var b = -271733879;
		var c = -1732584194;
		var d = 271733878;
		for (i$2 = 0; i$2 < x.length; i$2 += 16) {
			olda = a;
			oldb = b;
			oldc = c;
			oldd = d;
			a = md5ff(a, b, c, d, x[i$2], 7, -680876936);
			d = md5ff(d, a, b, c, x[i$2 + 1], 12, -389564586);
			c = md5ff(c, d, a, b, x[i$2 + 2], 17, 606105819);
			b = md5ff(b, c, d, a, x[i$2 + 3], 22, -1044525330);
			a = md5ff(a, b, c, d, x[i$2 + 4], 7, -176418897);
			d = md5ff(d, a, b, c, x[i$2 + 5], 12, 1200080426);
			c = md5ff(c, d, a, b, x[i$2 + 6], 17, -1473231341);
			b = md5ff(b, c, d, a, x[i$2 + 7], 22, -45705983);
			a = md5ff(a, b, c, d, x[i$2 + 8], 7, 1770035416);
			d = md5ff(d, a, b, c, x[i$2 + 9], 12, -1958414417);
			c = md5ff(c, d, a, b, x[i$2 + 10], 17, -42063);
			b = md5ff(b, c, d, a, x[i$2 + 11], 22, -1990404162);
			a = md5ff(a, b, c, d, x[i$2 + 12], 7, 1804603682);
			d = md5ff(d, a, b, c, x[i$2 + 13], 12, -40341101);
			c = md5ff(c, d, a, b, x[i$2 + 14], 17, -1502002290);
			b = md5ff(b, c, d, a, x[i$2 + 15], 22, 1236535329);
			a = md5gg(a, b, c, d, x[i$2 + 1], 5, -165796510);
			d = md5gg(d, a, b, c, x[i$2 + 6], 9, -1069501632);
			c = md5gg(c, d, a, b, x[i$2 + 11], 14, 643717713);
			b = md5gg(b, c, d, a, x[i$2], 20, -373897302);
			a = md5gg(a, b, c, d, x[i$2 + 5], 5, -701558691);
			d = md5gg(d, a, b, c, x[i$2 + 10], 9, 38016083);
			c = md5gg(c, d, a, b, x[i$2 + 15], 14, -660478335);
			b = md5gg(b, c, d, a, x[i$2 + 4], 20, -405537848);
			a = md5gg(a, b, c, d, x[i$2 + 9], 5, 568446438);
			d = md5gg(d, a, b, c, x[i$2 + 14], 9, -1019803690);
			c = md5gg(c, d, a, b, x[i$2 + 3], 14, -187363961);
			b = md5gg(b, c, d, a, x[i$2 + 8], 20, 1163531501);
			a = md5gg(a, b, c, d, x[i$2 + 13], 5, -1444681467);
			d = md5gg(d, a, b, c, x[i$2 + 2], 9, -51403784);
			c = md5gg(c, d, a, b, x[i$2 + 7], 14, 1735328473);
			b = md5gg(b, c, d, a, x[i$2 + 12], 20, -1926607734);
			a = md5hh(a, b, c, d, x[i$2 + 5], 4, -378558);
			d = md5hh(d, a, b, c, x[i$2 + 8], 11, -2022574463);
			c = md5hh(c, d, a, b, x[i$2 + 11], 16, 1839030562);
			b = md5hh(b, c, d, a, x[i$2 + 14], 23, -35309556);
			a = md5hh(a, b, c, d, x[i$2 + 1], 4, -1530992060);
			d = md5hh(d, a, b, c, x[i$2 + 4], 11, 1272893353);
			c = md5hh(c, d, a, b, x[i$2 + 7], 16, -155497632);
			b = md5hh(b, c, d, a, x[i$2 + 10], 23, -1094730640);
			a = md5hh(a, b, c, d, x[i$2 + 13], 4, 681279174);
			d = md5hh(d, a, b, c, x[i$2], 11, -358537222);
			c = md5hh(c, d, a, b, x[i$2 + 3], 16, -722521979);
			b = md5hh(b, c, d, a, x[i$2 + 6], 23, 76029189);
			a = md5hh(a, b, c, d, x[i$2 + 9], 4, -640364487);
			d = md5hh(d, a, b, c, x[i$2 + 12], 11, -421815835);
			c = md5hh(c, d, a, b, x[i$2 + 15], 16, 530742520);
			b = md5hh(b, c, d, a, x[i$2 + 2], 23, -995338651);
			a = md5ii(a, b, c, d, x[i$2], 6, -198630844);
			d = md5ii(d, a, b, c, x[i$2 + 7], 10, 1126891415);
			c = md5ii(c, d, a, b, x[i$2 + 14], 15, -1416354905);
			b = md5ii(b, c, d, a, x[i$2 + 5], 21, -57434055);
			a = md5ii(a, b, c, d, x[i$2 + 12], 6, 1700485571);
			d = md5ii(d, a, b, c, x[i$2 + 3], 10, -1894986606);
			c = md5ii(c, d, a, b, x[i$2 + 10], 15, -1051523);
			b = md5ii(b, c, d, a, x[i$2 + 1], 21, -2054922799);
			a = md5ii(a, b, c, d, x[i$2 + 8], 6, 1873313359);
			d = md5ii(d, a, b, c, x[i$2 + 15], 10, -30611744);
			c = md5ii(c, d, a, b, x[i$2 + 6], 15, -1560198380);
			b = md5ii(b, c, d, a, x[i$2 + 13], 21, 1309151649);
			a = md5ii(a, b, c, d, x[i$2 + 4], 6, -145523070);
			d = md5ii(d, a, b, c, x[i$2 + 11], 10, -1120210379);
			c = md5ii(c, d, a, b, x[i$2 + 2], 15, 718787259);
			b = md5ii(b, c, d, a, x[i$2 + 9], 21, -343485551);
			a = safeAdd(a, olda);
			b = safeAdd(b, oldb);
			c = safeAdd(c, oldc);
			d = safeAdd(d, oldd);
		}
		return [
			a,
			b,
			c,
			d
		];
	}
	function bytesToWords(input) {
		var i$2;
		var output = [];
		output[(input.length >> 2) - 1] = void 0;
		for (i$2 = 0; i$2 < output.length; i$2 += 1) output[i$2] = 0;
		var length8 = input.length * 8;
		for (i$2 = 0; i$2 < length8; i$2 += 8) output[i$2 >> 5] |= (input[i$2 / 8] & 255) << i$2 % 32;
		return output;
	}
	function safeAdd(x, y) {
		var lsw = (x & 65535) + (y & 65535);
		return (x >> 16) + (y >> 16) + (lsw >> 16) << 16 | lsw & 65535;
	}
	function bitRotateLeft(num, cnt) {
		return num << cnt | num >>> 32 - cnt;
	}
	function md5cmn(q, a, b, x, s, t) {
		return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
	}
	function md5ff(a, b, c, d, x, s, t) {
		return md5cmn(b & c | ~b & d, a, b, x, s, t);
	}
	function md5gg(a, b, c, d, x, s, t) {
		return md5cmn(b & d | c & ~d, a, b, x, s, t);
	}
	function md5hh(a, b, c, d, x, s, t) {
		return md5cmn(b ^ c ^ d, a, b, x, s, t);
	}
	function md5ii(a, b, c, d, x, s, t) {
		return md5cmn(c ^ (b | ~d), a, b, x, s, t);
	}
	var _default$4 = md5;
	exports.default = _default$4;
}));

//#endregion
//#region node_modules/uuid/dist/v3.js
var require_v3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = void 0;
	var _v$2 = _interopRequireDefault$3(require_v35());
	var _md = _interopRequireDefault$3(require_md5_browser());
	function _interopRequireDefault$3(obj) {
		return obj && obj.__esModule ? obj : { default: obj };
	}
	var _default$3 = (0, _v$2.default)("v3", 48, _md.default);
	exports.default = _default$3;
}));

//#endregion
//#region node_modules/uuid/dist/v4.js
var require_v4 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = void 0;
	var _rng = _interopRequireDefault$2(require_rng_browser());
	var _bytesToUuid = _interopRequireDefault$2(require_bytesToUuid());
	function _interopRequireDefault$2(obj) {
		return obj && obj.__esModule ? obj : { default: obj };
	}
	function v4(options, buf, offset) {
		var i$2 = buf && offset || 0;
		if (typeof options == "string") {
			buf = options === "binary" ? new Array(16) : null;
			options = null;
		}
		options = options || {};
		var rnds = options.random || (options.rng || _rng.default)();
		rnds[6] = rnds[6] & 15 | 64;
		rnds[8] = rnds[8] & 63 | 128;
		if (buf) for (var ii$1 = 0; ii$1 < 16; ++ii$1) buf[i$2 + ii$1] = rnds[ii$1];
		return buf || (0, _bytesToUuid.default)(rnds);
	}
	var _default$2 = v4;
	exports.default = _default$2;
}));

//#endregion
//#region node_modules/uuid/dist/sha1-browser.js
var require_sha1_browser = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = void 0;
	function f(s, x, y, z) {
		switch (s) {
			case 0: return x & y ^ ~x & z;
			case 1: return x ^ y ^ z;
			case 2: return x & y ^ x & z ^ y & z;
			case 3: return x ^ y ^ z;
		}
	}
	function ROTL(x, n) {
		return x << n | x >>> 32 - n;
	}
	function sha1(bytes) {
		var K = [
			1518500249,
			1859775393,
			2400959708,
			3395469782
		];
		var H = [
			1732584193,
			4023233417,
			2562383102,
			271733878,
			3285377520
		];
		if (typeof bytes == "string") {
			var msg = unescape(encodeURIComponent(bytes));
			bytes = new Array(msg.length);
			for (var i$2 = 0; i$2 < msg.length; i$2++) bytes[i$2] = msg.charCodeAt(i$2);
		}
		bytes.push(128);
		var l = bytes.length / 4 + 2;
		var N = Math.ceil(l / 16);
		var M = new Array(N);
		for (var i$2 = 0; i$2 < N; i$2++) {
			M[i$2] = new Array(16);
			for (var j = 0; j < 16; j++) M[i$2][j] = bytes[i$2 * 64 + j * 4] << 24 | bytes[i$2 * 64 + j * 4 + 1] << 16 | bytes[i$2 * 64 + j * 4 + 2] << 8 | bytes[i$2 * 64 + j * 4 + 3];
		}
		M[N - 1][14] = (bytes.length - 1) * 8 / Math.pow(2, 32);
		M[N - 1][14] = Math.floor(M[N - 1][14]);
		M[N - 1][15] = (bytes.length - 1) * 8 & 4294967295;
		for (var i$2 = 0; i$2 < N; i$2++) {
			var W = new Array(80);
			for (var t = 0; t < 16; t++) W[t] = M[i$2][t];
			for (var t = 16; t < 80; t++) W[t] = ROTL(W[t - 3] ^ W[t - 8] ^ W[t - 14] ^ W[t - 16], 1);
			var a = H[0];
			var b = H[1];
			var c = H[2];
			var d = H[3];
			var e = H[4];
			for (var t = 0; t < 80; t++) {
				var s = Math.floor(t / 20);
				var T = ROTL(a, 5) + f(s, b, c, d) + e + K[s] + W[t] >>> 0;
				e = d;
				d = c;
				c = ROTL(b, 30) >>> 0;
				b = a;
				a = T;
			}
			H[0] = H[0] + a >>> 0;
			H[1] = H[1] + b >>> 0;
			H[2] = H[2] + c >>> 0;
			H[3] = H[3] + d >>> 0;
			H[4] = H[4] + e >>> 0;
		}
		return [
			H[0] >> 24 & 255,
			H[0] >> 16 & 255,
			H[0] >> 8 & 255,
			H[0] & 255,
			H[1] >> 24 & 255,
			H[1] >> 16 & 255,
			H[1] >> 8 & 255,
			H[1] & 255,
			H[2] >> 24 & 255,
			H[2] >> 16 & 255,
			H[2] >> 8 & 255,
			H[2] & 255,
			H[3] >> 24 & 255,
			H[3] >> 16 & 255,
			H[3] >> 8 & 255,
			H[3] & 255,
			H[4] >> 24 & 255,
			H[4] >> 16 & 255,
			H[4] >> 8 & 255,
			H[4] & 255
		];
	}
	var _default$1 = sha1;
	exports.default = _default$1;
}));

//#endregion
//#region node_modules/uuid/dist/v5.js
var require_v5 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = void 0;
	var _v$1 = _interopRequireDefault$1(require_v35());
	var _sha = _interopRequireDefault$1(require_sha1_browser());
	function _interopRequireDefault$1(obj) {
		return obj && obj.__esModule ? obj : { default: obj };
	}
	var _default = (0, _v$1.default)("v5", 80, _sha.default);
	exports.default = _default;
}));

//#endregion
//#region node_modules/uuid/dist/index.js
var require_dist = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	Object.defineProperty(exports, "v1", {
		enumerable: true,
		get: function() {
			return _v.default;
		}
	});
	Object.defineProperty(exports, "v3", {
		enumerable: true,
		get: function() {
			return _v2.default;
		}
	});
	Object.defineProperty(exports, "v4", {
		enumerable: true,
		get: function() {
			return _v3.default;
		}
	});
	Object.defineProperty(exports, "v5", {
		enumerable: true,
		get: function() {
			return _v4.default;
		}
	});
	var _v = _interopRequireDefault(require_v1());
	var _v2 = _interopRequireDefault(require_v3());
	var _v3 = _interopRequireDefault(require_v4());
	var _v4 = _interopRequireDefault(require_v5());
	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : { default: obj };
	}
}));

//#endregion
//#region node_modules/aws-sdk/lib/util.js
var require_util = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var AWS$11;
	/**
	* A set of utility methods for use with the AWS SDK.
	*
	* @!attribute abort
	*   Return this value from an iterator function {each} or {arrayEach}
	*   to break out of the iteration.
	*   @example Breaking out of an iterator function
	*     AWS.util.each({a: 1, b: 2, c: 3}, function(key, value) {
	*       if (key == 'b') return AWS.util.abort;
	*     });
	*   @see each
	*   @see arrayEach
	* @api private
	*/
	var util$4 = {
		environment: "nodejs",
		engine: function engine() {
			if (util$4.isBrowser() && typeof navigator !== "undefined") return navigator.userAgent;
			else {
				var engine$1 = process.platform + "/" + process.version;
				if (process.env.AWS_EXECUTION_ENV) engine$1 += " exec-env/" + process.env.AWS_EXECUTION_ENV;
				return engine$1;
			}
		},
		userAgent: function userAgent() {
			var name = util$4.environment;
			var agent = "aws-sdk-" + name + "/" + require_core().VERSION;
			if (name === "nodejs") agent += " " + util$4.engine();
			return agent;
		},
		uriEscape: function uriEscape(string) {
			var output = encodeURIComponent(string);
			output = output.replace(/[^A-Za-z0-9_.~\-%]+/g, escape);
			output = output.replace(/[*]/g, function(ch) {
				return "%" + ch.charCodeAt(0).toString(16).toUpperCase();
			});
			return output;
		},
		uriEscapePath: function uriEscapePath(string) {
			var parts = [];
			util$4.arrayEach(string.split("/"), function(part) {
				parts.push(util$4.uriEscape(part));
			});
			return parts.join("/");
		},
		urlParse: function urlParse$1(url) {
			return util$4.url.parse(url);
		},
		urlFormat: function urlFormat$1(url) {
			return util$4.url.format(url);
		},
		queryStringParse: function queryStringParse(qs) {
			return util$4.querystring.parse(qs);
		},
		queryParamsToString: function queryParamsToString(params) {
			var items = [];
			var escape$1 = util$4.uriEscape;
			var sortedKeys = Object.keys(params).sort();
			util$4.arrayEach(sortedKeys, function(name) {
				var value = params[name];
				var ename = escape$1(name);
				var result = ename + "=";
				if (Array.isArray(value)) {
					var vals = [];
					util$4.arrayEach(value, function(item) {
						vals.push(escape$1(item));
					});
					result = ename + "=" + vals.sort().join("&" + ename + "=");
				} else if (value !== void 0 && value !== null) result = ename + "=" + escape$1(value);
				items.push(result);
			});
			return items.join("&");
		},
		readFileSync: function readFileSync(path) {
			if (util$4.isBrowser()) return null;
			return require_lib().readFileSync(path, "utf-8");
		},
		base64: {
			encode: function encode64(string) {
				if (typeof string === "number") throw util$4.error(/* @__PURE__ */ new Error("Cannot base64 encode number " + string));
				if (string === null || typeof string === "undefined") return string;
				return util$4.buffer.toBuffer(string).toString("base64");
			},
			decode: function decode64(string) {
				if (typeof string === "number") throw util$4.error(/* @__PURE__ */ new Error("Cannot base64 decode number " + string));
				if (string === null || typeof string === "undefined") return string;
				return util$4.buffer.toBuffer(string, "base64");
			}
		},
		buffer: {
			toBuffer: function(data, encoding) {
				return typeof util$4.Buffer.from === "function" && util$4.Buffer.from !== Uint8Array.from ? util$4.Buffer.from(data, encoding) : new util$4.Buffer(data, encoding);
			},
			alloc: function(size, fill, encoding) {
				if (typeof size !== "number") throw new Error("size passed to alloc must be a number.");
				if (typeof util$4.Buffer.alloc === "function") return util$4.Buffer.alloc(size, fill, encoding);
				else {
					var buf = new util$4.Buffer(size);
					if (fill !== void 0 && typeof buf.fill === "function") buf.fill(fill, void 0, void 0, encoding);
					return buf;
				}
			},
			toStream: function toStream(buffer) {
				if (!util$4.Buffer.isBuffer(buffer)) buffer = util$4.buffer.toBuffer(buffer);
				var readable = new util$4.stream.Readable();
				var pos = 0;
				readable._read = function(size) {
					if (pos >= buffer.length) return readable.push(null);
					var end = pos + size;
					if (end > buffer.length) end = buffer.length;
					readable.push(buffer.slice(pos, end));
					pos = end;
				};
				return readable;
			},
			concat: function(buffers) {
				var length = 0, offset = 0, buffer = null, i$2;
				for (i$2 = 0; i$2 < buffers.length; i$2++) length += buffers[i$2].length;
				buffer = util$4.buffer.alloc(length);
				for (i$2 = 0; i$2 < buffers.length; i$2++) {
					buffers[i$2].copy(buffer, offset);
					offset += buffers[i$2].length;
				}
				return buffer;
			}
		},
		string: {
			byteLength: function byteLength$2(string) {
				if (string === null || string === void 0) return 0;
				if (typeof string === "string") string = util$4.buffer.toBuffer(string);
				if (typeof string.byteLength === "number") return string.byteLength;
				else if (typeof string.length === "number") return string.length;
				else if (typeof string.size === "number") return string.size;
				else if (typeof string.path === "string") return require_lib().lstatSync(string.path).size;
				else throw util$4.error(/* @__PURE__ */ new Error("Cannot determine length of " + string), { object: string });
			},
			upperFirst: function upperFirst(string) {
				return string[0].toUpperCase() + string.substr(1);
			},
			lowerFirst: function lowerFirst(string) {
				return string[0].toLowerCase() + string.substr(1);
			}
		},
		ini: { parse: function string(ini) {
			var currentSection, map = {};
			util$4.arrayEach(ini.split(/\r?\n/), function(line) {
				line = line.split(/(^|\s)[;#]/)[0].trim();
				if (line[0] === "[" && line[line.length - 1] === "]") {
					currentSection = line.substring(1, line.length - 1);
					if (currentSection === "__proto__" || currentSection.split(/\s/)[1] === "__proto__") throw util$4.error(/* @__PURE__ */ new Error("Cannot load profile name '" + currentSection + "' from shared ini file."));
				} else if (currentSection) {
					var indexOfEqualsSign = line.indexOf("=");
					var start = 0;
					var end = line.length - 1;
					if (indexOfEqualsSign !== -1 && indexOfEqualsSign !== start && indexOfEqualsSign !== end) {
						var name = line.substring(0, indexOfEqualsSign).trim();
						var value = line.substring(indexOfEqualsSign + 1).trim();
						map[currentSection] = map[currentSection] || {};
						map[currentSection][name] = value;
					}
				}
			});
			return map;
		} },
		fn: {
			noop: function() {},
			callback: function(err) {
				if (err) throw err;
			},
			makeAsync: function makeAsync(fn$1, expectedArgs) {
				if (expectedArgs && expectedArgs <= fn$1.length) return fn$1;
				return function() {
					var args = Array.prototype.slice.call(arguments, 0);
					args.pop()(fn$1.apply(null, args));
				};
			}
		},
		date: {
			getDate: function getDate() {
				if (!AWS$11) AWS$11 = require_core();
				if (AWS$11.config.systemClockOffset) return new Date((/* @__PURE__ */ new Date()).getTime() + AWS$11.config.systemClockOffset);
				else return /* @__PURE__ */ new Date();
			},
			iso8601: function iso8601(date) {
				if (date === void 0) date = util$4.date.getDate();
				return date.toISOString().replace(/\.\d{3}Z$/, "Z");
			},
			rfc822: function rfc822(date) {
				if (date === void 0) date = util$4.date.getDate();
				return date.toUTCString();
			},
			unixTimestamp: function unixTimestamp(date) {
				if (date === void 0) date = util$4.date.getDate();
				return date.getTime() / 1e3;
			},
			from: function format(date) {
				if (typeof date === "number") return /* @__PURE__ */ new Date(date * 1e3);
				else return new Date(date);
			},
			format: function format(date, formatter) {
				if (!formatter) formatter = "iso8601";
				return util$4.date[formatter](util$4.date.from(date));
			},
			parseTimestamp: function parseTimestamp(value) {
				if (typeof value === "number") return /* @__PURE__ */ new Date(value * 1e3);
				else if (value.match(/^\d+$/)) return /* @__PURE__ */ new Date(value * 1e3);
				else if (value.match(/^\d{4}/)) return new Date(value);
				else if (value.match(/^\w{3},/)) return new Date(value);
				else throw util$4.error(/* @__PURE__ */ new Error("unhandled timestamp format: " + value), { code: "TimestampParserError" });
			}
		},
		crypto: {
			crc32Table: [
				0,
				1996959894,
				3993919788,
				2567524794,
				124634137,
				1886057615,
				3915621685,
				2657392035,
				249268274,
				2044508324,
				3772115230,
				2547177864,
				162941995,
				2125561021,
				3887607047,
				2428444049,
				498536548,
				1789927666,
				4089016648,
				2227061214,
				450548861,
				1843258603,
				4107580753,
				2211677639,
				325883990,
				1684777152,
				4251122042,
				2321926636,
				335633487,
				1661365465,
				4195302755,
				2366115317,
				997073096,
				1281953886,
				3579855332,
				2724688242,
				1006888145,
				1258607687,
				3524101629,
				2768942443,
				901097722,
				1119000684,
				3686517206,
				2898065728,
				853044451,
				1172266101,
				3705015759,
				2882616665,
				651767980,
				1373503546,
				3369554304,
				3218104598,
				565507253,
				1454621731,
				3485111705,
				3099436303,
				671266974,
				1594198024,
				3322730930,
				2970347812,
				795835527,
				1483230225,
				3244367275,
				3060149565,
				1994146192,
				31158534,
				2563907772,
				4023717930,
				1907459465,
				112637215,
				2680153253,
				3904427059,
				2013776290,
				251722036,
				2517215374,
				3775830040,
				2137656763,
				141376813,
				2439277719,
				3865271297,
				1802195444,
				476864866,
				2238001368,
				4066508878,
				1812370925,
				453092731,
				2181625025,
				4111451223,
				1706088902,
				314042704,
				2344532202,
				4240017532,
				1658658271,
				366619977,
				2362670323,
				4224994405,
				1303535960,
				984961486,
				2747007092,
				3569037538,
				1256170817,
				1037604311,
				2765210733,
				3554079995,
				1131014506,
				879679996,
				2909243462,
				3663771856,
				1141124467,
				855842277,
				2852801631,
				3708648649,
				1342533948,
				654459306,
				3188396048,
				3373015174,
				1466479909,
				544179635,
				3110523913,
				3462522015,
				1591671054,
				702138776,
				2966460450,
				3352799412,
				1504918807,
				783551873,
				3082640443,
				3233442989,
				3988292384,
				2596254646,
				62317068,
				1957810842,
				3939845945,
				2647816111,
				81470997,
				1943803523,
				3814918930,
				2489596804,
				225274430,
				2053790376,
				3826175755,
				2466906013,
				167816743,
				2097651377,
				4027552580,
				2265490386,
				503444072,
				1762050814,
				4150417245,
				2154129355,
				426522225,
				1852507879,
				4275313526,
				2312317920,
				282753626,
				1742555852,
				4189708143,
				2394877945,
				397917763,
				1622183637,
				3604390888,
				2714866558,
				953729732,
				1340076626,
				3518719985,
				2797360999,
				1068828381,
				1219638859,
				3624741850,
				2936675148,
				906185462,
				1090812512,
				3747672003,
				2825379669,
				829329135,
				1181335161,
				3412177804,
				3160834842,
				628085408,
				1382605366,
				3423369109,
				3138078467,
				570562233,
				1426400815,
				3317316542,
				2998733608,
				733239954,
				1555261956,
				3268935591,
				3050360625,
				752459403,
				1541320221,
				2607071920,
				3965973030,
				1969922972,
				40735498,
				2617837225,
				3943577151,
				1913087877,
				83908371,
				2512341634,
				3803740692,
				2075208622,
				213261112,
				2463272603,
				3855990285,
				2094854071,
				198958881,
				2262029012,
				4057260610,
				1759359992,
				534414190,
				2176718541,
				4139329115,
				1873836001,
				414664567,
				2282248934,
				4279200368,
				1711684554,
				285281116,
				2405801727,
				4167216745,
				1634467795,
				376229701,
				2685067896,
				3608007406,
				1308918612,
				956543938,
				2808555105,
				3495958263,
				1231636301,
				1047427035,
				2932959818,
				3654703836,
				1088359270,
				936918e3,
				2847714899,
				3736837829,
				1202900863,
				817233897,
				3183342108,
				3401237130,
				1404277552,
				615818150,
				3134207493,
				3453421203,
				1423857449,
				601450431,
				3009837614,
				3294710456,
				1567103746,
				711928724,
				3020668471,
				3272380065,
				1510334235,
				755167117
			],
			crc32: function crc32(data) {
				var tbl = util$4.crypto.crc32Table;
				var crc = -1;
				if (typeof data === "string") data = util$4.buffer.toBuffer(data);
				for (var i$2 = 0; i$2 < data.length; i$2++) {
					var code$1 = data.readUInt8(i$2);
					crc = crc >>> 8 ^ tbl[(crc ^ code$1) & 255];
				}
				return (crc ^ -1) >>> 0;
			},
			hmac: function hmac(key, string, digest, fn$1) {
				if (!digest) digest = "binary";
				if (digest === "buffer") digest = void 0;
				if (!fn$1) fn$1 = "sha256";
				if (typeof string === "string") string = util$4.buffer.toBuffer(string);
				return util$4.crypto.lib.createHmac(fn$1, key).update(string).digest(digest);
			},
			md5: function md5$1(data, digest, callback) {
				return util$4.crypto.hash("md5", data, digest, callback);
			},
			sha256: function sha256(data, digest, callback) {
				return util$4.crypto.hash("sha256", data, digest, callback);
			},
			hash: function(algorithm, data, digest, callback) {
				var hash = util$4.crypto.createHash(algorithm);
				if (!digest) digest = "binary";
				if (digest === "buffer") digest = void 0;
				if (typeof data === "string") data = util$4.buffer.toBuffer(data);
				var sliceFn = util$4.arraySliceFn(data);
				var isBuffer = util$4.Buffer.isBuffer(data);
				if (util$4.isBrowser() && typeof ArrayBuffer !== "undefined" && data && data.buffer instanceof ArrayBuffer) isBuffer = true;
				if (callback && typeof data === "object" && typeof data.on === "function" && !isBuffer) {
					data.on("data", function(chunk) {
						hash.update(chunk);
					});
					data.on("error", function(err) {
						callback(err);
					});
					data.on("end", function() {
						callback(null, hash.digest(digest));
					});
				} else if (callback && sliceFn && !isBuffer && typeof FileReader !== "undefined") {
					var index = 0, size = 1024 * 512;
					var reader = new FileReader();
					reader.onerror = function() {
						callback(/* @__PURE__ */ new Error("Failed to read data."));
					};
					reader.onload = function() {
						var buf = new util$4.Buffer(new Uint8Array(reader.result));
						hash.update(buf);
						index += buf.length;
						reader._continueReading();
					};
					reader._continueReading = function() {
						if (index >= data.size) {
							callback(null, hash.digest(digest));
							return;
						}
						var back = index + size;
						if (back > data.size) back = data.size;
						reader.readAsArrayBuffer(sliceFn.call(data, index, back));
					};
					reader._continueReading();
				} else {
					if (util$4.isBrowser() && typeof data === "object" && !isBuffer) data = new util$4.Buffer(new Uint8Array(data));
					var out = hash.update(data).digest(digest);
					if (callback) callback(null, out);
					return out;
				}
			},
			toHex: function toHex$1(data) {
				var out = [];
				for (var i$2 = 0; i$2 < data.length; i$2++) out.push(("0" + data.charCodeAt(i$2).toString(16)).substr(-2, 2));
				return out.join("");
			},
			createHash: function createHash(algorithm) {
				return util$4.crypto.lib.createHash(algorithm);
			}
		},
		abort: {},
		each: function each(object, iterFunction) {
			for (var key in object) if (Object.prototype.hasOwnProperty.call(object, key)) {
				if (iterFunction.call(this, key, object[key]) === util$4.abort) break;
			}
		},
		arrayEach: function arrayEach(array, iterFunction) {
			for (var idx in array) if (Object.prototype.hasOwnProperty.call(array, idx)) {
				if (iterFunction.call(this, array[idx], parseInt(idx, 10)) === util$4.abort) break;
			}
		},
		update: function update(obj1, obj2) {
			util$4.each(obj2, function iterator(key, item) {
				obj1[key] = item;
			});
			return obj1;
		},
		merge: function merge(obj1, obj2) {
			return util$4.update(util$4.copy(obj1), obj2);
		},
		copy: function copy(object) {
			if (object === null || object === void 0) return object;
			var dupe = {};
			for (var key in object) dupe[key] = object[key];
			return dupe;
		},
		isEmpty: function isEmpty(obj) {
			for (var prop in obj) if (Object.prototype.hasOwnProperty.call(obj, prop)) return false;
			return true;
		},
		arraySliceFn: function arraySliceFn(obj) {
			var fn$1 = obj.slice || obj.webkitSlice || obj.mozSlice;
			return typeof fn$1 === "function" ? fn$1 : null;
		},
		isType: function isType(obj, type) {
			if (typeof type === "function") type = util$4.typeName(type);
			return Object.prototype.toString.call(obj) === "[object " + type + "]";
		},
		typeName: function typeName(type) {
			if (Object.prototype.hasOwnProperty.call(type, "name")) return type.name;
			var str = type.toString();
			var match = str.match(/^\s*function (.+)\(/);
			return match ? match[1] : str;
		},
		error: function error(err, options) {
			var originalError = null;
			if (typeof err.message === "string" && err.message !== "") {
				if (typeof options === "string" || options && options.message) {
					originalError = util$4.copy(err);
					originalError.message = err.message;
				}
			}
			err.message = err.message || null;
			if (typeof options === "string") err.message = options;
			else if (typeof options === "object" && options !== null) {
				util$4.update(err, options);
				if (options.message) err.message = options.message;
				if (options.code || options.name) err.code = options.code || options.name;
				if (options.stack) err.stack = options.stack;
			}
			if (typeof Object.defineProperty === "function") {
				Object.defineProperty(err, "name", {
					writable: true,
					enumerable: false
				});
				Object.defineProperty(err, "message", { enumerable: true });
			}
			err.name = String(options && options.name || err.name || err.code || "Error");
			err.time = /* @__PURE__ */ new Date();
			if (originalError) err.originalError = originalError;
			for (var key in options || {}) if (key[0] === "[" && key[key.length - 1] === "]") {
				key = key.slice(1, -1);
				if (key === "code" || key === "message") continue;
				err["[" + key + "]"] = "See error." + key + " for details.";
				Object.defineProperty(err, key, {
					value: err[key] || options && options[key] || originalError && originalError[key],
					enumerable: false,
					writable: true
				});
			}
			return err;
		},
		inherit: function inherit$12(klass, features) {
			var newObject = null;
			if (features === void 0) {
				features = klass;
				klass = Object;
				newObject = {};
			} else {
				var ctor = function ConstructorWrapper() {};
				ctor.prototype = klass.prototype;
				newObject = new ctor();
			}
			if (features.constructor === Object) features.constructor = function() {
				if (klass !== Object) return klass.apply(this, arguments);
			};
			features.constructor.prototype = newObject;
			util$4.update(features.constructor.prototype, features);
			features.constructor.__super__ = klass;
			return features.constructor;
		},
		mixin: function mixin() {
			var klass = arguments[0];
			for (var i$2 = 1; i$2 < arguments.length; i$2++) for (var prop in arguments[i$2].prototype) {
				var fn$1 = arguments[i$2].prototype[prop];
				if (prop !== "constructor") klass.prototype[prop] = fn$1;
			}
			return klass;
		},
		hideProperties: function hideProperties(obj, props) {
			if (typeof Object.defineProperty !== "function") return;
			util$4.arrayEach(props, function(key) {
				Object.defineProperty(obj, key, {
					enumerable: false,
					writable: true,
					configurable: true
				});
			});
		},
		property: function property$5(obj, name, value, enumerable, isValue) {
			var opts = {
				configurable: true,
				enumerable: enumerable !== void 0 ? enumerable : true
			};
			if (typeof value === "function" && !isValue) opts.get = value;
			else {
				opts.value = value;
				opts.writable = true;
			}
			Object.defineProperty(obj, name, opts);
		},
		memoizedProperty: function memoizedProperty$4(obj, name, get, enumerable) {
			var cachedValue = null;
			util$4.property(obj, name, function() {
				if (cachedValue === null) cachedValue = get();
				return cachedValue;
			}, enumerable);
		},
		hoistPayloadMember: function hoistPayloadMember(resp) {
			var req = resp.request;
			var operationName = req.operation;
			var operation = req.service.api.operations[operationName];
			var output = operation.output;
			if (output.payload && !operation.hasEventOutput) {
				var payloadMember = output.members[output.payload];
				var responsePayload = resp.data[output.payload];
				if (payloadMember.type === "structure") util$4.each(responsePayload, function(key, value) {
					util$4.property(resp.data, key, value, false);
				});
			}
		},
		computeSha256: function computeSha256(body, done) {
			if (util$4.isNode()) {
				var Stream = util$4.stream.Stream;
				var fs = require_lib();
				if (typeof Stream === "function" && body instanceof Stream) if (typeof body.path === "string") {
					var settings = {};
					if (typeof body.start === "number") settings.start = body.start;
					if (typeof body.end === "number") settings.end = body.end;
					body = fs.createReadStream(body.path, settings);
				} else return done(/* @__PURE__ */ new Error("Non-file stream objects are not supported with SigV4"));
			}
			util$4.crypto.sha256(body, "hex", function(err, sha) {
				if (err) done(err);
				else done(null, sha);
			});
		},
		isClockSkewed: function isClockSkewed(serverTime) {
			if (serverTime) {
				util$4.property(AWS$11.config, "isClockSkewed", Math.abs((/* @__PURE__ */ new Date()).getTime() - serverTime) >= 3e5, false);
				return AWS$11.config.isClockSkewed;
			}
		},
		applyClockOffset: function applyClockOffset(serverTime) {
			if (serverTime) AWS$11.config.systemClockOffset = serverTime - (/* @__PURE__ */ new Date()).getTime();
		},
		extractRequestId: function extractRequestId(resp) {
			var requestId = resp.httpResponse.headers["x-amz-request-id"] || resp.httpResponse.headers["x-amzn-requestid"];
			if (!requestId && resp.data && resp.data.ResponseMetadata) requestId = resp.data.ResponseMetadata.RequestId;
			if (requestId) resp.requestId = requestId;
			if (resp.error) resp.error.requestId = requestId;
		},
		addPromises: function addPromises(constructors, PromiseDependency) {
			var deletePromises = false;
			if (PromiseDependency === void 0 && AWS$11 && AWS$11.config) PromiseDependency = AWS$11.config.getPromisesDependency();
			if (PromiseDependency === void 0 && typeof Promise !== "undefined") PromiseDependency = Promise;
			if (typeof PromiseDependency !== "function") deletePromises = true;
			if (!Array.isArray(constructors)) constructors = [constructors];
			for (var ind = 0; ind < constructors.length; ind++) {
				var constructor = constructors[ind];
				if (deletePromises) {
					if (constructor.deletePromisesFromClass) constructor.deletePromisesFromClass();
				} else if (constructor.addPromisesToClass) constructor.addPromisesToClass(PromiseDependency);
			}
		},
		promisifyMethod: function promisifyMethod(methodName, PromiseDependency) {
			return function promise() {
				var self = this;
				var args = Array.prototype.slice.call(arguments);
				return new PromiseDependency(function(resolve, reject) {
					args.push(function(err, data) {
						if (err) reject(err);
						else resolve(data);
					});
					self[methodName].apply(self, args);
				});
			};
		},
		isDualstackAvailable: function isDualstackAvailable(service) {
			if (!service) return false;
			var metadata$1 = require_metadata();
			if (typeof service !== "string") service = service.serviceIdentifier;
			if (typeof service !== "string" || !metadata$1.hasOwnProperty(service)) return false;
			return !!metadata$1[service].dualstackAvailable;
		},
		calculateRetryDelay: function calculateRetryDelay(retryCount, retryDelayOptions, err) {
			if (!retryDelayOptions) retryDelayOptions = {};
			var customBackoff = retryDelayOptions.customBackoff || null;
			if (typeof customBackoff === "function") return customBackoff(retryCount, err);
			var base = typeof retryDelayOptions.base === "number" ? retryDelayOptions.base : 100;
			return Math.random() * (Math.pow(2, retryCount) * base);
		},
		handleRequestWithRetries: function handleRequestWithRetries(httpRequest, options, cb) {
			if (!options) options = {};
			var http = AWS$11.HttpClient.getInstance();
			var httpOptions = options.httpOptions || {};
			var retryCount = 0;
			var errCallback = function(err) {
				var maxRetries = options.maxRetries || 0;
				if (err && err.code === "TimeoutError") err.retryable = true;
				if (err && err.retryable && retryCount < maxRetries) {
					var delay = util$4.calculateRetryDelay(retryCount, options.retryDelayOptions, err);
					if (delay >= 0) {
						retryCount++;
						setTimeout(sendRequest, delay + (err.retryAfter || 0));
						return;
					}
				}
				cb(err);
			};
			var sendRequest = function() {
				var data = "";
				http.handleRequest(httpRequest, httpOptions, function(httpResponse) {
					httpResponse.on("data", function(chunk) {
						data += chunk.toString();
					});
					httpResponse.on("end", function() {
						var statusCode = httpResponse.statusCode;
						if (statusCode < 300) cb(null, data);
						else {
							var retryAfter = parseInt(httpResponse.headers["retry-after"], 10) * 1e3 || 0;
							var err = util$4.error(/* @__PURE__ */ new Error(), {
								statusCode,
								retryable: statusCode >= 500 || statusCode === 429
							});
							if (retryAfter && err.retryable) err.retryAfter = retryAfter;
							errCallback(err);
						}
					});
				}, errCallback);
			};
			AWS$11.util.defer(sendRequest);
		},
		uuid: { v4: function uuidV4() {
			return require_dist().v4();
		} },
		convertPayloadToString: function convertPayloadToString(resp) {
			var req = resp.request;
			var operation = req.operation;
			var rules = req.service.api.operations[operation].output || {};
			if (rules.payload && resp.data[rules.payload]) resp.data[rules.payload] = resp.data[rules.payload].toString();
		},
		defer: function defer(callback) {
			if (typeof process === "object" && typeof process.nextTick === "function") process.nextTick(callback);
			else if (typeof setImmediate === "function") setImmediate(callback);
			else setTimeout(callback, 0);
		},
		getRequestPayloadShape: function getRequestPayloadShape(req) {
			var operations = req.service.api.operations;
			if (!operations) return void 0;
			var operation = (operations || {})[req.operation];
			if (!operation || !operation.input || !operation.input.payload) return void 0;
			return operation.input.members[operation.input.payload];
		},
		getProfilesFromSharedConfig: function getProfilesFromSharedConfig(iniLoader, filename) {
			var profiles = {};
			var profilesFromConfig = {};
			if (process.env[util$4.configOptInEnv]) var profilesFromConfig = iniLoader.loadFrom({
				isConfig: true,
				filename: process.env[util$4.sharedConfigFileEnv]
			});
			var profilesFromCreds = {};
			try {
				var profilesFromCreds = iniLoader.loadFrom({ filename: filename || process.env[util$4.configOptInEnv] && process.env[util$4.sharedCredentialsFileEnv] });
			} catch (error) {
				if (!process.env[util$4.configOptInEnv]) throw error;
			}
			for (var i$2 = 0, profileNames = Object.keys(profilesFromConfig); i$2 < profileNames.length; i$2++) profiles[profileNames[i$2]] = objectAssign(profiles[profileNames[i$2]] || {}, profilesFromConfig[profileNames[i$2]]);
			for (var i$2 = 0, profileNames = Object.keys(profilesFromCreds); i$2 < profileNames.length; i$2++) profiles[profileNames[i$2]] = objectAssign(profiles[profileNames[i$2]] || {}, profilesFromCreds[profileNames[i$2]]);
			return profiles;
			/**
			* Roughly the semantics of `Object.assign(target, source)`
			*/
			function objectAssign(target, source) {
				for (var i$3 = 0, keys = Object.keys(source); i$3 < keys.length; i$3++) target[keys[i$3]] = source[keys[i$3]];
				return target;
			}
		},
		ARN: {
			validate: function validateARN(str) {
				return str && str.indexOf("arn:") === 0 && str.split(":").length >= 6;
			},
			parse: function parseARN(arn) {
				var matched = arn.split(":");
				return {
					partition: matched[1],
					service: matched[2],
					region: matched[3],
					accountId: matched[4],
					resource: matched.slice(5).join(":")
				};
			},
			build: function buildARN(arnObject) {
				if (arnObject.service === void 0 || arnObject.region === void 0 || arnObject.accountId === void 0 || arnObject.resource === void 0) throw util$4.error(/* @__PURE__ */ new Error("Input ARN object is invalid"));
				return "arn:" + (arnObject.partition || "aws") + ":" + arnObject.service + ":" + arnObject.region + ":" + arnObject.accountId + ":" + arnObject.resource;
			}
		},
		defaultProfile: "default",
		configOptInEnv: "AWS_SDK_LOAD_CONFIG",
		sharedCredentialsFileEnv: "AWS_SHARED_CREDENTIALS_FILE",
		sharedConfigFileEnv: "AWS_CONFIG_FILE",
		imdsDisabledEnv: "AWS_EC2_METADATA_DISABLED"
	};
	/**
	* @api private
	*/
	module.exports = util$4;
}));

//#endregion
//#region node_modules/base64-js/index.js
var require_base64_js = /* @__PURE__ */ __commonJSMin(((exports) => {
	exports.byteLength = byteLength$1;
	exports.toByteArray = toByteArray;
	exports.fromByteArray = fromByteArray;
	var lookup = [];
	var revLookup = [];
	var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
	var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	for (var i = 0, len = code.length; i < len; ++i) {
		lookup[i] = code[i];
		revLookup[code.charCodeAt(i)] = i;
	}
	revLookup["-".charCodeAt(0)] = 62;
	revLookup["_".charCodeAt(0)] = 63;
	function getLens(b64) {
		var len$1 = b64.length;
		if (len$1 % 4 > 0) throw new Error("Invalid string. Length must be a multiple of 4");
		var validLen = b64.indexOf("=");
		if (validLen === -1) validLen = len$1;
		var placeHoldersLen = validLen === len$1 ? 0 : 4 - validLen % 4;
		return [validLen, placeHoldersLen];
	}
	function byteLength$1(b64) {
		var lens = getLens(b64);
		var validLen = lens[0];
		var placeHoldersLen = lens[1];
		return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
	}
	function _byteLength(b64, validLen, placeHoldersLen) {
		return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
	}
	function toByteArray(b64) {
		var tmp;
		var lens = getLens(b64);
		var validLen = lens[0];
		var placeHoldersLen = lens[1];
		var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
		var curByte = 0;
		var len$1 = placeHoldersLen > 0 ? validLen - 4 : validLen;
		var i$2;
		for (i$2 = 0; i$2 < len$1; i$2 += 4) {
			tmp = revLookup[b64.charCodeAt(i$2)] << 18 | revLookup[b64.charCodeAt(i$2 + 1)] << 12 | revLookup[b64.charCodeAt(i$2 + 2)] << 6 | revLookup[b64.charCodeAt(i$2 + 3)];
			arr[curByte++] = tmp >> 16 & 255;
			arr[curByte++] = tmp >> 8 & 255;
			arr[curByte++] = tmp & 255;
		}
		if (placeHoldersLen === 2) {
			tmp = revLookup[b64.charCodeAt(i$2)] << 2 | revLookup[b64.charCodeAt(i$2 + 1)] >> 4;
			arr[curByte++] = tmp & 255;
		}
		if (placeHoldersLen === 1) {
			tmp = revLookup[b64.charCodeAt(i$2)] << 10 | revLookup[b64.charCodeAt(i$2 + 1)] << 4 | revLookup[b64.charCodeAt(i$2 + 2)] >> 2;
			arr[curByte++] = tmp >> 8 & 255;
			arr[curByte++] = tmp & 255;
		}
		return arr;
	}
	function tripletToBase64(num) {
		return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
	}
	function encodeChunk(uint8, start, end) {
		var tmp;
		var output = [];
		for (var i$2 = start; i$2 < end; i$2 += 3) {
			tmp = (uint8[i$2] << 16 & 16711680) + (uint8[i$2 + 1] << 8 & 65280) + (uint8[i$2 + 2] & 255);
			output.push(tripletToBase64(tmp));
		}
		return output.join("");
	}
	function fromByteArray(uint8) {
		var tmp;
		var len$1 = uint8.length;
		var extraBytes = len$1 % 3;
		var parts = [];
		var maxChunkLength = 16383;
		for (var i$2 = 0, len2 = len$1 - extraBytes; i$2 < len2; i$2 += maxChunkLength) parts.push(encodeChunk(uint8, i$2, i$2 + maxChunkLength > len2 ? len2 : i$2 + maxChunkLength));
		if (extraBytes === 1) {
			tmp = uint8[len$1 - 1];
			parts.push(lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "==");
		} else if (extraBytes === 2) {
			tmp = (uint8[len$1 - 2] << 8) + uint8[len$1 - 1];
			parts.push(lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "=");
		}
		return parts.join("");
	}
}));

//#endregion
//#region node_modules/ieee754/index.js
var require_ieee754 = /* @__PURE__ */ __commonJSMin(((exports) => {
	exports.read = function(buffer, offset, isLE, mLen, nBytes) {
		var e, m;
		var eLen = nBytes * 8 - mLen - 1;
		var eMax = (1 << eLen) - 1;
		var eBias = eMax >> 1;
		var nBits = -7;
		var i$2 = isLE ? nBytes - 1 : 0;
		var d = isLE ? -1 : 1;
		var s = buffer[offset + i$2];
		i$2 += d;
		e = s & (1 << -nBits) - 1;
		s >>= -nBits;
		nBits += eLen;
		for (; nBits > 0; e = e * 256 + buffer[offset + i$2], i$2 += d, nBits -= 8);
		m = e & (1 << -nBits) - 1;
		e >>= -nBits;
		nBits += mLen;
		for (; nBits > 0; m = m * 256 + buffer[offset + i$2], i$2 += d, nBits -= 8);
		if (e === 0) e = 1 - eBias;
		else if (e === eMax) return m ? NaN : (s ? -1 : 1) * Infinity;
		else {
			m = m + Math.pow(2, mLen);
			e = e - eBias;
		}
		return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
	};
	exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
		var e, m, c;
		var eLen = nBytes * 8 - mLen - 1;
		var eMax = (1 << eLen) - 1;
		var eBias = eMax >> 1;
		var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
		var i$2 = isLE ? 0 : nBytes - 1;
		var d = isLE ? 1 : -1;
		var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
		value = Math.abs(value);
		if (isNaN(value) || value === Infinity) {
			m = isNaN(value) ? 1 : 0;
			e = eMax;
		} else {
			e = Math.floor(Math.log(value) / Math.LN2);
			if (value * (c = Math.pow(2, -e)) < 1) {
				e--;
				c *= 2;
			}
			if (e + eBias >= 1) value += rt / c;
			else value += rt * Math.pow(2, 1 - eBias);
			if (value * c >= 2) {
				e++;
				c /= 2;
			}
			if (e + eBias >= eMax) {
				m = 0;
				e = eMax;
			} else if (e + eBias >= 1) {
				m = (value * c - 1) * Math.pow(2, mLen);
				e = e + eBias;
			} else {
				m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
				e = 0;
			}
		}
		for (; mLen >= 8; buffer[offset + i$2] = m & 255, i$2 += d, m /= 256, mLen -= 8);
		e = e << mLen | m;
		eLen += mLen;
		for (; eLen > 0; buffer[offset + i$2] = e & 255, i$2 += d, e /= 256, eLen -= 8);
		buffer[offset + i$2 - d] |= s * 128;
	};
}));

//#endregion
//#region node_modules/isarray/index.js
var require_isarray = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var toString = {}.toString;
	module.exports = Array.isArray || function(arr) {
		return toString.call(arr) == "[object Array]";
	};
}));

//#endregion
//#region node_modules/buffer/index.js
/*!
* The buffer module from node.js, for the browser.
*
* @author   Feross Aboukhadijeh <http://feross.org>
* @license  MIT
*/
var require_buffer = /* @__PURE__ */ __commonJSMin(((exports) => {
	var base64 = require_base64_js();
	var ieee754 = require_ieee754();
	var isArray = require_isarray();
	exports.Buffer = Buffer$5;
	exports.SlowBuffer = SlowBuffer;
	exports.INSPECT_MAX_BYTES = 50;
	/**
	* If `Buffer.TYPED_ARRAY_SUPPORT`:
	*   === true    Use Uint8Array implementation (fastest)
	*   === false   Use Object implementation (most compatible, even IE6)
	*
	* Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
	* Opera 11.6+, iOS 4.2+.
	*
	* Due to various browser bugs, sometimes the Object implementation will be used even
	* when the browser supports typed arrays.
	*
	* Note:
	*
	*   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
	*     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
	*
	*   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
	*
	*   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
	*     incorrect length in some situations.
	
	* We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
	* get the Object implementation, which is slower but behaves correctly.
	*/
	Buffer$5.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== void 0 ? global.TYPED_ARRAY_SUPPORT : typedArraySupport();
	exports.kMaxLength = kMaxLength();
	function typedArraySupport() {
		try {
			var arr = new Uint8Array(1);
			arr.__proto__ = {
				__proto__: Uint8Array.prototype,
				foo: function() {
					return 42;
				}
			};
			return arr.foo() === 42 && typeof arr.subarray === "function" && arr.subarray(1, 1).byteLength === 0;
		} catch (e) {
			return false;
		}
	}
	function kMaxLength() {
		return Buffer$5.TYPED_ARRAY_SUPPORT ? 2147483647 : 1073741823;
	}
	function createBuffer(that, length) {
		if (kMaxLength() < length) throw new RangeError("Invalid typed array length");
		if (Buffer$5.TYPED_ARRAY_SUPPORT) {
			that = new Uint8Array(length);
			that.__proto__ = Buffer$5.prototype;
		} else {
			if (that === null) that = new Buffer$5(length);
			that.length = length;
		}
		return that;
	}
	/**
	* The Buffer constructor returns instances of `Uint8Array` that have their
	* prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
	* `Uint8Array`, so the returned instances will have all the node `Buffer` methods
	* and the `Uint8Array` methods. Square bracket notation works as expected -- it
	* returns a single octet.
	*
	* The `Uint8Array` prototype remains unmodified.
	*/
	function Buffer$5(arg, encodingOrOffset, length) {
		if (!Buffer$5.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer$5)) return new Buffer$5(arg, encodingOrOffset, length);
		if (typeof arg === "number") {
			if (typeof encodingOrOffset === "string") throw new Error("If encoding is specified then the first argument must be a string");
			return allocUnsafe(this, arg);
		}
		return from(this, arg, encodingOrOffset, length);
	}
	Buffer$5.poolSize = 8192;
	Buffer$5._augment = function(arr) {
		arr.__proto__ = Buffer$5.prototype;
		return arr;
	};
	function from(that, value, encodingOrOffset, length) {
		if (typeof value === "number") throw new TypeError("\"value\" argument must not be a number");
		if (typeof ArrayBuffer !== "undefined" && value instanceof ArrayBuffer) return fromArrayBuffer(that, value, encodingOrOffset, length);
		if (typeof value === "string") return fromString(that, value, encodingOrOffset);
		return fromObject(that, value);
	}
	/**
	* Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
	* if value is a number.
	* Buffer.from(str[, encoding])
	* Buffer.from(array)
	* Buffer.from(buffer)
	* Buffer.from(arrayBuffer[, byteOffset[, length]])
	**/
	Buffer$5.from = function(value, encodingOrOffset, length) {
		return from(null, value, encodingOrOffset, length);
	};
	if (Buffer$5.TYPED_ARRAY_SUPPORT) {
		Buffer$5.prototype.__proto__ = Uint8Array.prototype;
		Buffer$5.__proto__ = Uint8Array;
		if (typeof Symbol !== "undefined" && Symbol.species && Buffer$5[Symbol.species] === Buffer$5) Object.defineProperty(Buffer$5, Symbol.species, {
			value: null,
			configurable: true
		});
	}
	function assertSize(size) {
		if (typeof size !== "number") throw new TypeError("\"size\" argument must be a number");
		else if (size < 0) throw new RangeError("\"size\" argument must not be negative");
	}
	function alloc(that, size, fill, encoding) {
		assertSize(size);
		if (size <= 0) return createBuffer(that, size);
		if (fill !== void 0) return typeof encoding === "string" ? createBuffer(that, size).fill(fill, encoding) : createBuffer(that, size).fill(fill);
		return createBuffer(that, size);
	}
	/**
	* Creates a new filled Buffer instance.
	* alloc(size[, fill[, encoding]])
	**/
	Buffer$5.alloc = function(size, fill, encoding) {
		return alloc(null, size, fill, encoding);
	};
	function allocUnsafe(that, size) {
		assertSize(size);
		that = createBuffer(that, size < 0 ? 0 : checked(size) | 0);
		if (!Buffer$5.TYPED_ARRAY_SUPPORT) for (var i$2 = 0; i$2 < size; ++i$2) that[i$2] = 0;
		return that;
	}
	/**
	* Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
	* */
	Buffer$5.allocUnsafe = function(size) {
		return allocUnsafe(null, size);
	};
	/**
	* Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
	*/
	Buffer$5.allocUnsafeSlow = function(size) {
		return allocUnsafe(null, size);
	};
	function fromString(that, string, encoding) {
		if (typeof encoding !== "string" || encoding === "") encoding = "utf8";
		if (!Buffer$5.isEncoding(encoding)) throw new TypeError("\"encoding\" must be a valid string encoding");
		var length = byteLength(string, encoding) | 0;
		that = createBuffer(that, length);
		var actual = that.write(string, encoding);
		if (actual !== length) that = that.slice(0, actual);
		return that;
	}
	function fromArrayLike(that, array) {
		var length = array.length < 0 ? 0 : checked(array.length) | 0;
		that = createBuffer(that, length);
		for (var i$2 = 0; i$2 < length; i$2 += 1) that[i$2] = array[i$2] & 255;
		return that;
	}
	function fromArrayBuffer(that, array, byteOffset, length) {
		array.byteLength;
		if (byteOffset < 0 || array.byteLength < byteOffset) throw new RangeError("'offset' is out of bounds");
		if (array.byteLength < byteOffset + (length || 0)) throw new RangeError("'length' is out of bounds");
		if (byteOffset === void 0 && length === void 0) array = new Uint8Array(array);
		else if (length === void 0) array = new Uint8Array(array, byteOffset);
		else array = new Uint8Array(array, byteOffset, length);
		if (Buffer$5.TYPED_ARRAY_SUPPORT) {
			that = array;
			that.__proto__ = Buffer$5.prototype;
		} else that = fromArrayLike(that, array);
		return that;
	}
	function fromObject(that, obj) {
		if (Buffer$5.isBuffer(obj)) {
			var len$1 = checked(obj.length) | 0;
			that = createBuffer(that, len$1);
			if (that.length === 0) return that;
			obj.copy(that, 0, 0, len$1);
			return that;
		}
		if (obj) {
			if (typeof ArrayBuffer !== "undefined" && obj.buffer instanceof ArrayBuffer || "length" in obj) {
				if (typeof obj.length !== "number" || isnan(obj.length)) return createBuffer(that, 0);
				return fromArrayLike(that, obj);
			}
			if (obj.type === "Buffer" && isArray(obj.data)) return fromArrayLike(that, obj.data);
		}
		throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.");
	}
	function checked(length) {
		if (length >= kMaxLength()) throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + kMaxLength().toString(16) + " bytes");
		return length | 0;
	}
	function SlowBuffer(length) {
		if (+length != length) length = 0;
		return Buffer$5.alloc(+length);
	}
	Buffer$5.isBuffer = function isBuffer(b) {
		return !!(b != null && b._isBuffer);
	};
	Buffer$5.compare = function compare(a, b) {
		if (!Buffer$5.isBuffer(a) || !Buffer$5.isBuffer(b)) throw new TypeError("Arguments must be Buffers");
		if (a === b) return 0;
		var x = a.length;
		var y = b.length;
		for (var i$2 = 0, len$1 = Math.min(x, y); i$2 < len$1; ++i$2) if (a[i$2] !== b[i$2]) {
			x = a[i$2];
			y = b[i$2];
			break;
		}
		if (x < y) return -1;
		if (y < x) return 1;
		return 0;
	};
	Buffer$5.isEncoding = function isEncoding(encoding) {
		switch (String(encoding).toLowerCase()) {
			case "hex":
			case "utf8":
			case "utf-8":
			case "ascii":
			case "latin1":
			case "binary":
			case "base64":
			case "ucs2":
			case "ucs-2":
			case "utf16le":
			case "utf-16le": return true;
			default: return false;
		}
	};
	Buffer$5.concat = function concat(list, length) {
		if (!isArray(list)) throw new TypeError("\"list\" argument must be an Array of Buffers");
		if (list.length === 0) return Buffer$5.alloc(0);
		var i$2;
		if (length === void 0) {
			length = 0;
			for (i$2 = 0; i$2 < list.length; ++i$2) length += list[i$2].length;
		}
		var buffer = Buffer$5.allocUnsafe(length);
		var pos = 0;
		for (i$2 = 0; i$2 < list.length; ++i$2) {
			var buf = list[i$2];
			if (!Buffer$5.isBuffer(buf)) throw new TypeError("\"list\" argument must be an Array of Buffers");
			buf.copy(buffer, pos);
			pos += buf.length;
		}
		return buffer;
	};
	function byteLength(string, encoding) {
		if (Buffer$5.isBuffer(string)) return string.length;
		if (typeof ArrayBuffer !== "undefined" && typeof ArrayBuffer.isView === "function" && (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) return string.byteLength;
		if (typeof string !== "string") string = "" + string;
		var len$1 = string.length;
		if (len$1 === 0) return 0;
		var loweredCase = false;
		for (;;) switch (encoding) {
			case "ascii":
			case "latin1":
			case "binary": return len$1;
			case "utf8":
			case "utf-8":
			case void 0: return utf8ToBytes(string).length;
			case "ucs2":
			case "ucs-2":
			case "utf16le":
			case "utf-16le": return len$1 * 2;
			case "hex": return len$1 >>> 1;
			case "base64": return base64ToBytes(string).length;
			default:
				if (loweredCase) return utf8ToBytes(string).length;
				encoding = ("" + encoding).toLowerCase();
				loweredCase = true;
		}
	}
	Buffer$5.byteLength = byteLength;
	function slowToString(encoding, start, end) {
		var loweredCase = false;
		if (start === void 0 || start < 0) start = 0;
		if (start > this.length) return "";
		if (end === void 0 || end > this.length) end = this.length;
		if (end <= 0) return "";
		end >>>= 0;
		start >>>= 0;
		if (end <= start) return "";
		if (!encoding) encoding = "utf8";
		while (true) switch (encoding) {
			case "hex": return hexSlice(this, start, end);
			case "utf8":
			case "utf-8": return utf8Slice(this, start, end);
			case "ascii": return asciiSlice(this, start, end);
			case "latin1":
			case "binary": return latin1Slice(this, start, end);
			case "base64": return base64Slice(this, start, end);
			case "ucs2":
			case "ucs-2":
			case "utf16le":
			case "utf-16le": return utf16leSlice(this, start, end);
			default:
				if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
				encoding = (encoding + "").toLowerCase();
				loweredCase = true;
		}
	}
	Buffer$5.prototype._isBuffer = true;
	function swap(b, n, m) {
		var i$2 = b[n];
		b[n] = b[m];
		b[m] = i$2;
	}
	Buffer$5.prototype.swap16 = function swap16() {
		var len$1 = this.length;
		if (len$1 % 2 !== 0) throw new RangeError("Buffer size must be a multiple of 16-bits");
		for (var i$2 = 0; i$2 < len$1; i$2 += 2) swap(this, i$2, i$2 + 1);
		return this;
	};
	Buffer$5.prototype.swap32 = function swap32() {
		var len$1 = this.length;
		if (len$1 % 4 !== 0) throw new RangeError("Buffer size must be a multiple of 32-bits");
		for (var i$2 = 0; i$2 < len$1; i$2 += 4) {
			swap(this, i$2, i$2 + 3);
			swap(this, i$2 + 1, i$2 + 2);
		}
		return this;
	};
	Buffer$5.prototype.swap64 = function swap64() {
		var len$1 = this.length;
		if (len$1 % 8 !== 0) throw new RangeError("Buffer size must be a multiple of 64-bits");
		for (var i$2 = 0; i$2 < len$1; i$2 += 8) {
			swap(this, i$2, i$2 + 7);
			swap(this, i$2 + 1, i$2 + 6);
			swap(this, i$2 + 2, i$2 + 5);
			swap(this, i$2 + 3, i$2 + 4);
		}
		return this;
	};
	Buffer$5.prototype.toString = function toString$1() {
		var length = this.length | 0;
		if (length === 0) return "";
		if (arguments.length === 0) return utf8Slice(this, 0, length);
		return slowToString.apply(this, arguments);
	};
	Buffer$5.prototype.equals = function equals(b) {
		if (!Buffer$5.isBuffer(b)) throw new TypeError("Argument must be a Buffer");
		if (this === b) return true;
		return Buffer$5.compare(this, b) === 0;
	};
	Buffer$5.prototype.inspect = function inspect$1() {
		var str = "";
		var max$2 = exports.INSPECT_MAX_BYTES;
		if (this.length > 0) {
			str = this.toString("hex", 0, max$2).match(/.{2}/g).join(" ");
			if (this.length > max$2) str += " ... ";
		}
		return "<Buffer " + str + ">";
	};
	Buffer$5.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
		if (!Buffer$5.isBuffer(target)) throw new TypeError("Argument must be a Buffer");
		if (start === void 0) start = 0;
		if (end === void 0) end = target ? target.length : 0;
		if (thisStart === void 0) thisStart = 0;
		if (thisEnd === void 0) thisEnd = this.length;
		if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) throw new RangeError("out of range index");
		if (thisStart >= thisEnd && start >= end) return 0;
		if (thisStart >= thisEnd) return -1;
		if (start >= end) return 1;
		start >>>= 0;
		end >>>= 0;
		thisStart >>>= 0;
		thisEnd >>>= 0;
		if (this === target) return 0;
		var x = thisEnd - thisStart;
		var y = end - start;
		var len$1 = Math.min(x, y);
		var thisCopy = this.slice(thisStart, thisEnd);
		var targetCopy = target.slice(start, end);
		for (var i$2 = 0; i$2 < len$1; ++i$2) if (thisCopy[i$2] !== targetCopy[i$2]) {
			x = thisCopy[i$2];
			y = targetCopy[i$2];
			break;
		}
		if (x < y) return -1;
		if (y < x) return 1;
		return 0;
	};
	function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
		if (buffer.length === 0) return -1;
		if (typeof byteOffset === "string") {
			encoding = byteOffset;
			byteOffset = 0;
		} else if (byteOffset > 2147483647) byteOffset = 2147483647;
		else if (byteOffset < -2147483648) byteOffset = -2147483648;
		byteOffset = +byteOffset;
		if (isNaN(byteOffset)) byteOffset = dir ? 0 : buffer.length - 1;
		if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
		if (byteOffset >= buffer.length) if (dir) return -1;
		else byteOffset = buffer.length - 1;
		else if (byteOffset < 0) if (dir) byteOffset = 0;
		else return -1;
		if (typeof val === "string") val = Buffer$5.from(val, encoding);
		if (Buffer$5.isBuffer(val)) {
			if (val.length === 0) return -1;
			return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
		} else if (typeof val === "number") {
			val = val & 255;
			if (Buffer$5.TYPED_ARRAY_SUPPORT && typeof Uint8Array.prototype.indexOf === "function") if (dir) return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
			else return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
			return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
		}
		throw new TypeError("val must be string, number or Buffer");
	}
	function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
		var indexSize = 1;
		var arrLength = arr.length;
		var valLength = val.length;
		if (encoding !== void 0) {
			encoding = String(encoding).toLowerCase();
			if (encoding === "ucs2" || encoding === "ucs-2" || encoding === "utf16le" || encoding === "utf-16le") {
				if (arr.length < 2 || val.length < 2) return -1;
				indexSize = 2;
				arrLength /= 2;
				valLength /= 2;
				byteOffset /= 2;
			}
		}
		function read(buf, i$3) {
			if (indexSize === 1) return buf[i$3];
			else return buf.readUInt16BE(i$3 * indexSize);
		}
		var i$2;
		if (dir) {
			var foundIndex = -1;
			for (i$2 = byteOffset; i$2 < arrLength; i$2++) if (read(arr, i$2) === read(val, foundIndex === -1 ? 0 : i$2 - foundIndex)) {
				if (foundIndex === -1) foundIndex = i$2;
				if (i$2 - foundIndex + 1 === valLength) return foundIndex * indexSize;
			} else {
				if (foundIndex !== -1) i$2 -= i$2 - foundIndex;
				foundIndex = -1;
			}
		} else {
			if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
			for (i$2 = byteOffset; i$2 >= 0; i$2--) {
				var found = true;
				for (var j = 0; j < valLength; j++) if (read(arr, i$2 + j) !== read(val, j)) {
					found = false;
					break;
				}
				if (found) return i$2;
			}
		}
		return -1;
	}
	Buffer$5.prototype.includes = function includes(val, byteOffset, encoding) {
		return this.indexOf(val, byteOffset, encoding) !== -1;
	};
	Buffer$5.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
		return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
	};
	Buffer$5.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
		return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
	};
	function hexWrite(buf, string, offset, length) {
		offset = Number(offset) || 0;
		var remaining = buf.length - offset;
		if (!length) length = remaining;
		else {
			length = Number(length);
			if (length > remaining) length = remaining;
		}
		var strLen = string.length;
		if (strLen % 2 !== 0) throw new TypeError("Invalid hex string");
		if (length > strLen / 2) length = strLen / 2;
		for (var i$2 = 0; i$2 < length; ++i$2) {
			var parsed = parseInt(string.substr(i$2 * 2, 2), 16);
			if (isNaN(parsed)) return i$2;
			buf[offset + i$2] = parsed;
		}
		return i$2;
	}
	function utf8Write(buf, string, offset, length) {
		return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
	}
	function asciiWrite(buf, string, offset, length) {
		return blitBuffer(asciiToBytes(string), buf, offset, length);
	}
	function latin1Write(buf, string, offset, length) {
		return asciiWrite(buf, string, offset, length);
	}
	function base64Write(buf, string, offset, length) {
		return blitBuffer(base64ToBytes(string), buf, offset, length);
	}
	function ucs2Write(buf, string, offset, length) {
		return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
	}
	Buffer$5.prototype.write = function write(string, offset, length, encoding) {
		if (offset === void 0) {
			encoding = "utf8";
			length = this.length;
			offset = 0;
		} else if (length === void 0 && typeof offset === "string") {
			encoding = offset;
			length = this.length;
			offset = 0;
		} else if (isFinite(offset)) {
			offset = offset | 0;
			if (isFinite(length)) {
				length = length | 0;
				if (encoding === void 0) encoding = "utf8";
			} else {
				encoding = length;
				length = void 0;
			}
		} else throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
		var remaining = this.length - offset;
		if (length === void 0 || length > remaining) length = remaining;
		if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) throw new RangeError("Attempt to write outside buffer bounds");
		if (!encoding) encoding = "utf8";
		var loweredCase = false;
		for (;;) switch (encoding) {
			case "hex": return hexWrite(this, string, offset, length);
			case "utf8":
			case "utf-8": return utf8Write(this, string, offset, length);
			case "ascii": return asciiWrite(this, string, offset, length);
			case "latin1":
			case "binary": return latin1Write(this, string, offset, length);
			case "base64": return base64Write(this, string, offset, length);
			case "ucs2":
			case "ucs-2":
			case "utf16le":
			case "utf-16le": return ucs2Write(this, string, offset, length);
			default:
				if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
				encoding = ("" + encoding).toLowerCase();
				loweredCase = true;
		}
	};
	Buffer$5.prototype.toJSON = function toJSON() {
		return {
			type: "Buffer",
			data: Array.prototype.slice.call(this._arr || this, 0)
		};
	};
	function base64Slice(buf, start, end) {
		if (start === 0 && end === buf.length) return base64.fromByteArray(buf);
		else return base64.fromByteArray(buf.slice(start, end));
	}
	function utf8Slice(buf, start, end) {
		end = Math.min(buf.length, end);
		var res = [];
		var i$2 = start;
		while (i$2 < end) {
			var firstByte = buf[i$2];
			var codePoint = null;
			var bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
			if (i$2 + bytesPerSequence <= end) {
				var secondByte, thirdByte, fourthByte, tempCodePoint;
				switch (bytesPerSequence) {
					case 1:
						if (firstByte < 128) codePoint = firstByte;
						break;
					case 2:
						secondByte = buf[i$2 + 1];
						if ((secondByte & 192) === 128) {
							tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
							if (tempCodePoint > 127) codePoint = tempCodePoint;
						}
						break;
					case 3:
						secondByte = buf[i$2 + 1];
						thirdByte = buf[i$2 + 2];
						if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
							tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
							if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) codePoint = tempCodePoint;
						}
						break;
					case 4:
						secondByte = buf[i$2 + 1];
						thirdByte = buf[i$2 + 2];
						fourthByte = buf[i$2 + 3];
						if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
							tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
							if (tempCodePoint > 65535 && tempCodePoint < 1114112) codePoint = tempCodePoint;
						}
				}
			}
			if (codePoint === null) {
				codePoint = 65533;
				bytesPerSequence = 1;
			} else if (codePoint > 65535) {
				codePoint -= 65536;
				res.push(codePoint >>> 10 & 1023 | 55296);
				codePoint = 56320 | codePoint & 1023;
			}
			res.push(codePoint);
			i$2 += bytesPerSequence;
		}
		return decodeCodePointsArray(res);
	}
	var MAX_ARGUMENTS_LENGTH = 4096;
	function decodeCodePointsArray(codePoints) {
		var len$1 = codePoints.length;
		if (len$1 <= MAX_ARGUMENTS_LENGTH) return String.fromCharCode.apply(String, codePoints);
		var res = "";
		var i$2 = 0;
		while (i$2 < len$1) res += String.fromCharCode.apply(String, codePoints.slice(i$2, i$2 += MAX_ARGUMENTS_LENGTH));
		return res;
	}
	function asciiSlice(buf, start, end) {
		var ret = "";
		end = Math.min(buf.length, end);
		for (var i$2 = start; i$2 < end; ++i$2) ret += String.fromCharCode(buf[i$2] & 127);
		return ret;
	}
	function latin1Slice(buf, start, end) {
		var ret = "";
		end = Math.min(buf.length, end);
		for (var i$2 = start; i$2 < end; ++i$2) ret += String.fromCharCode(buf[i$2]);
		return ret;
	}
	function hexSlice(buf, start, end) {
		var len$1 = buf.length;
		if (!start || start < 0) start = 0;
		if (!end || end < 0 || end > len$1) end = len$1;
		var out = "";
		for (var i$2 = start; i$2 < end; ++i$2) out += toHex(buf[i$2]);
		return out;
	}
	function utf16leSlice(buf, start, end) {
		var bytes = buf.slice(start, end);
		var res = "";
		for (var i$2 = 0; i$2 < bytes.length; i$2 += 2) res += String.fromCharCode(bytes[i$2] + bytes[i$2 + 1] * 256);
		return res;
	}
	Buffer$5.prototype.slice = function slice(start, end) {
		var len$1 = this.length;
		start = ~~start;
		end = end === void 0 ? len$1 : ~~end;
		if (start < 0) {
			start += len$1;
			if (start < 0) start = 0;
		} else if (start > len$1) start = len$1;
		if (end < 0) {
			end += len$1;
			if (end < 0) end = 0;
		} else if (end > len$1) end = len$1;
		if (end < start) end = start;
		var newBuf;
		if (Buffer$5.TYPED_ARRAY_SUPPORT) {
			newBuf = this.subarray(start, end);
			newBuf.__proto__ = Buffer$5.prototype;
		} else {
			var sliceLen = end - start;
			newBuf = new Buffer$5(sliceLen, void 0);
			for (var i$2 = 0; i$2 < sliceLen; ++i$2) newBuf[i$2] = this[i$2 + start];
		}
		return newBuf;
	};
	function checkOffset(offset, ext, length) {
		if (offset % 1 !== 0 || offset < 0) throw new RangeError("offset is not uint");
		if (offset + ext > length) throw new RangeError("Trying to access beyond buffer length");
	}
	Buffer$5.prototype.readUIntLE = function readUIntLE(offset, byteLength$2, noAssert) {
		offset = offset | 0;
		byteLength$2 = byteLength$2 | 0;
		if (!noAssert) checkOffset(offset, byteLength$2, this.length);
		var val = this[offset];
		var mul = 1;
		var i$2 = 0;
		while (++i$2 < byteLength$2 && (mul *= 256)) val += this[offset + i$2] * mul;
		return val;
	};
	Buffer$5.prototype.readUIntBE = function readUIntBE(offset, byteLength$2, noAssert) {
		offset = offset | 0;
		byteLength$2 = byteLength$2 | 0;
		if (!noAssert) checkOffset(offset, byteLength$2, this.length);
		var val = this[offset + --byteLength$2];
		var mul = 1;
		while (byteLength$2 > 0 && (mul *= 256)) val += this[offset + --byteLength$2] * mul;
		return val;
	};
	Buffer$5.prototype.readUInt8 = function readUInt8(offset, noAssert) {
		if (!noAssert) checkOffset(offset, 1, this.length);
		return this[offset];
	};
	Buffer$5.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
		if (!noAssert) checkOffset(offset, 2, this.length);
		return this[offset] | this[offset + 1] << 8;
	};
	Buffer$5.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
		if (!noAssert) checkOffset(offset, 2, this.length);
		return this[offset] << 8 | this[offset + 1];
	};
	Buffer$5.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
		if (!noAssert) checkOffset(offset, 4, this.length);
		return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 16777216;
	};
	Buffer$5.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
		if (!noAssert) checkOffset(offset, 4, this.length);
		return this[offset] * 16777216 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
	};
	Buffer$5.prototype.readIntLE = function readIntLE(offset, byteLength$2, noAssert) {
		offset = offset | 0;
		byteLength$2 = byteLength$2 | 0;
		if (!noAssert) checkOffset(offset, byteLength$2, this.length);
		var val = this[offset];
		var mul = 1;
		var i$2 = 0;
		while (++i$2 < byteLength$2 && (mul *= 256)) val += this[offset + i$2] * mul;
		mul *= 128;
		if (val >= mul) val -= Math.pow(2, 8 * byteLength$2);
		return val;
	};
	Buffer$5.prototype.readIntBE = function readIntBE(offset, byteLength$2, noAssert) {
		offset = offset | 0;
		byteLength$2 = byteLength$2 | 0;
		if (!noAssert) checkOffset(offset, byteLength$2, this.length);
		var i$2 = byteLength$2;
		var mul = 1;
		var val = this[offset + --i$2];
		while (i$2 > 0 && (mul *= 256)) val += this[offset + --i$2] * mul;
		mul *= 128;
		if (val >= mul) val -= Math.pow(2, 8 * byteLength$2);
		return val;
	};
	Buffer$5.prototype.readInt8 = function readInt8(offset, noAssert) {
		if (!noAssert) checkOffset(offset, 1, this.length);
		if (!(this[offset] & 128)) return this[offset];
		return (255 - this[offset] + 1) * -1;
	};
	Buffer$5.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
		if (!noAssert) checkOffset(offset, 2, this.length);
		var val = this[offset] | this[offset + 1] << 8;
		return val & 32768 ? val | 4294901760 : val;
	};
	Buffer$5.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
		if (!noAssert) checkOffset(offset, 2, this.length);
		var val = this[offset + 1] | this[offset] << 8;
		return val & 32768 ? val | 4294901760 : val;
	};
	Buffer$5.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
		if (!noAssert) checkOffset(offset, 4, this.length);
		return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
	};
	Buffer$5.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
		if (!noAssert) checkOffset(offset, 4, this.length);
		return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
	};
	Buffer$5.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
		if (!noAssert) checkOffset(offset, 4, this.length);
		return ieee754.read(this, offset, true, 23, 4);
	};
	Buffer$5.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
		if (!noAssert) checkOffset(offset, 4, this.length);
		return ieee754.read(this, offset, false, 23, 4);
	};
	Buffer$5.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
		if (!noAssert) checkOffset(offset, 8, this.length);
		return ieee754.read(this, offset, true, 52, 8);
	};
	Buffer$5.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
		if (!noAssert) checkOffset(offset, 8, this.length);
		return ieee754.read(this, offset, false, 52, 8);
	};
	function checkInt(buf, value, offset, ext, max$2, min$1) {
		if (!Buffer$5.isBuffer(buf)) throw new TypeError("\"buffer\" argument must be a Buffer instance");
		if (value > max$2 || value < min$1) throw new RangeError("\"value\" argument is out of bounds");
		if (offset + ext > buf.length) throw new RangeError("Index out of range");
	}
	Buffer$5.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength$2, noAssert) {
		value = +value;
		offset = offset | 0;
		byteLength$2 = byteLength$2 | 0;
		if (!noAssert) {
			var maxBytes = Math.pow(2, 8 * byteLength$2) - 1;
			checkInt(this, value, offset, byteLength$2, maxBytes, 0);
		}
		var mul = 1;
		var i$2 = 0;
		this[offset] = value & 255;
		while (++i$2 < byteLength$2 && (mul *= 256)) this[offset + i$2] = value / mul & 255;
		return offset + byteLength$2;
	};
	Buffer$5.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength$2, noAssert) {
		value = +value;
		offset = offset | 0;
		byteLength$2 = byteLength$2 | 0;
		if (!noAssert) {
			var maxBytes = Math.pow(2, 8 * byteLength$2) - 1;
			checkInt(this, value, offset, byteLength$2, maxBytes, 0);
		}
		var i$2 = byteLength$2 - 1;
		var mul = 1;
		this[offset + i$2] = value & 255;
		while (--i$2 >= 0 && (mul *= 256)) this[offset + i$2] = value / mul & 255;
		return offset + byteLength$2;
	};
	Buffer$5.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
		value = +value;
		offset = offset | 0;
		if (!noAssert) checkInt(this, value, offset, 1, 255, 0);
		if (!Buffer$5.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
		this[offset] = value & 255;
		return offset + 1;
	};
	function objectWriteUInt16(buf, value, offset, littleEndian) {
		if (value < 0) value = 65535 + value + 1;
		for (var i$2 = 0, j = Math.min(buf.length - offset, 2); i$2 < j; ++i$2) buf[offset + i$2] = (value & 255 << 8 * (littleEndian ? i$2 : 1 - i$2)) >>> (littleEndian ? i$2 : 1 - i$2) * 8;
	}
	Buffer$5.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
		value = +value;
		offset = offset | 0;
		if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
		if (Buffer$5.TYPED_ARRAY_SUPPORT) {
			this[offset] = value & 255;
			this[offset + 1] = value >>> 8;
		} else objectWriteUInt16(this, value, offset, true);
		return offset + 2;
	};
	Buffer$5.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
		value = +value;
		offset = offset | 0;
		if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
		if (Buffer$5.TYPED_ARRAY_SUPPORT) {
			this[offset] = value >>> 8;
			this[offset + 1] = value & 255;
		} else objectWriteUInt16(this, value, offset, false);
		return offset + 2;
	};
	function objectWriteUInt32(buf, value, offset, littleEndian) {
		if (value < 0) value = 4294967295 + value + 1;
		for (var i$2 = 0, j = Math.min(buf.length - offset, 4); i$2 < j; ++i$2) buf[offset + i$2] = value >>> (littleEndian ? i$2 : 3 - i$2) * 8 & 255;
	}
	Buffer$5.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
		value = +value;
		offset = offset | 0;
		if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
		if (Buffer$5.TYPED_ARRAY_SUPPORT) {
			this[offset + 3] = value >>> 24;
			this[offset + 2] = value >>> 16;
			this[offset + 1] = value >>> 8;
			this[offset] = value & 255;
		} else objectWriteUInt32(this, value, offset, true);
		return offset + 4;
	};
	Buffer$5.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
		value = +value;
		offset = offset | 0;
		if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
		if (Buffer$5.TYPED_ARRAY_SUPPORT) {
			this[offset] = value >>> 24;
			this[offset + 1] = value >>> 16;
			this[offset + 2] = value >>> 8;
			this[offset + 3] = value & 255;
		} else objectWriteUInt32(this, value, offset, false);
		return offset + 4;
	};
	Buffer$5.prototype.writeIntLE = function writeIntLE(value, offset, byteLength$2, noAssert) {
		value = +value;
		offset = offset | 0;
		if (!noAssert) {
			var limit = Math.pow(2, 8 * byteLength$2 - 1);
			checkInt(this, value, offset, byteLength$2, limit - 1, -limit);
		}
		var i$2 = 0;
		var mul = 1;
		var sub = 0;
		this[offset] = value & 255;
		while (++i$2 < byteLength$2 && (mul *= 256)) {
			if (value < 0 && sub === 0 && this[offset + i$2 - 1] !== 0) sub = 1;
			this[offset + i$2] = (value / mul >> 0) - sub & 255;
		}
		return offset + byteLength$2;
	};
	Buffer$5.prototype.writeIntBE = function writeIntBE(value, offset, byteLength$2, noAssert) {
		value = +value;
		offset = offset | 0;
		if (!noAssert) {
			var limit = Math.pow(2, 8 * byteLength$2 - 1);
			checkInt(this, value, offset, byteLength$2, limit - 1, -limit);
		}
		var i$2 = byteLength$2 - 1;
		var mul = 1;
		var sub = 0;
		this[offset + i$2] = value & 255;
		while (--i$2 >= 0 && (mul *= 256)) {
			if (value < 0 && sub === 0 && this[offset + i$2 + 1] !== 0) sub = 1;
			this[offset + i$2] = (value / mul >> 0) - sub & 255;
		}
		return offset + byteLength$2;
	};
	Buffer$5.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
		value = +value;
		offset = offset | 0;
		if (!noAssert) checkInt(this, value, offset, 1, 127, -128);
		if (!Buffer$5.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
		if (value < 0) value = 255 + value + 1;
		this[offset] = value & 255;
		return offset + 1;
	};
	Buffer$5.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
		value = +value;
		offset = offset | 0;
		if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
		if (Buffer$5.TYPED_ARRAY_SUPPORT) {
			this[offset] = value & 255;
			this[offset + 1] = value >>> 8;
		} else objectWriteUInt16(this, value, offset, true);
		return offset + 2;
	};
	Buffer$5.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
		value = +value;
		offset = offset | 0;
		if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
		if (Buffer$5.TYPED_ARRAY_SUPPORT) {
			this[offset] = value >>> 8;
			this[offset + 1] = value & 255;
		} else objectWriteUInt16(this, value, offset, false);
		return offset + 2;
	};
	Buffer$5.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
		value = +value;
		offset = offset | 0;
		if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
		if (Buffer$5.TYPED_ARRAY_SUPPORT) {
			this[offset] = value & 255;
			this[offset + 1] = value >>> 8;
			this[offset + 2] = value >>> 16;
			this[offset + 3] = value >>> 24;
		} else objectWriteUInt32(this, value, offset, true);
		return offset + 4;
	};
	Buffer$5.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
		value = +value;
		offset = offset | 0;
		if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
		if (value < 0) value = 4294967295 + value + 1;
		if (Buffer$5.TYPED_ARRAY_SUPPORT) {
			this[offset] = value >>> 24;
			this[offset + 1] = value >>> 16;
			this[offset + 2] = value >>> 8;
			this[offset + 3] = value & 255;
		} else objectWriteUInt32(this, value, offset, false);
		return offset + 4;
	};
	function checkIEEE754(buf, value, offset, ext, max$2, min$1) {
		if (offset + ext > buf.length) throw new RangeError("Index out of range");
		if (offset < 0) throw new RangeError("Index out of range");
	}
	function writeFloat(buf, value, offset, littleEndian, noAssert) {
		if (!noAssert) checkIEEE754(buf, value, offset, 4, 34028234663852886e22, -34028234663852886e22);
		ieee754.write(buf, value, offset, littleEndian, 23, 4);
		return offset + 4;
	}
	Buffer$5.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
		return writeFloat(this, value, offset, true, noAssert);
	};
	Buffer$5.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
		return writeFloat(this, value, offset, false, noAssert);
	};
	function writeDouble(buf, value, offset, littleEndian, noAssert) {
		if (!noAssert) checkIEEE754(buf, value, offset, 8, 17976931348623157e292, -17976931348623157e292);
		ieee754.write(buf, value, offset, littleEndian, 52, 8);
		return offset + 8;
	}
	Buffer$5.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
		return writeDouble(this, value, offset, true, noAssert);
	};
	Buffer$5.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
		return writeDouble(this, value, offset, false, noAssert);
	};
	Buffer$5.prototype.copy = function copy(target, targetStart, start, end) {
		if (!start) start = 0;
		if (!end && end !== 0) end = this.length;
		if (targetStart >= target.length) targetStart = target.length;
		if (!targetStart) targetStart = 0;
		if (end > 0 && end < start) end = start;
		if (end === start) return 0;
		if (target.length === 0 || this.length === 0) return 0;
		if (targetStart < 0) throw new RangeError("targetStart out of bounds");
		if (start < 0 || start >= this.length) throw new RangeError("sourceStart out of bounds");
		if (end < 0) throw new RangeError("sourceEnd out of bounds");
		if (end > this.length) end = this.length;
		if (target.length - targetStart < end - start) end = target.length - targetStart + start;
		var len$1 = end - start;
		var i$2;
		if (this === target && start < targetStart && targetStart < end) for (i$2 = len$1 - 1; i$2 >= 0; --i$2) target[i$2 + targetStart] = this[i$2 + start];
		else if (len$1 < 1e3 || !Buffer$5.TYPED_ARRAY_SUPPORT) for (i$2 = 0; i$2 < len$1; ++i$2) target[i$2 + targetStart] = this[i$2 + start];
		else Uint8Array.prototype.set.call(target, this.subarray(start, start + len$1), targetStart);
		return len$1;
	};
	Buffer$5.prototype.fill = function fill(val, start, end, encoding) {
		if (typeof val === "string") {
			if (typeof start === "string") {
				encoding = start;
				start = 0;
				end = this.length;
			} else if (typeof end === "string") {
				encoding = end;
				end = this.length;
			}
			if (val.length === 1) {
				var code$1 = val.charCodeAt(0);
				if (code$1 < 256) val = code$1;
			}
			if (encoding !== void 0 && typeof encoding !== "string") throw new TypeError("encoding must be a string");
			if (typeof encoding === "string" && !Buffer$5.isEncoding(encoding)) throw new TypeError("Unknown encoding: " + encoding);
		} else if (typeof val === "number") val = val & 255;
		if (start < 0 || this.length < start || this.length < end) throw new RangeError("Out of range index");
		if (end <= start) return this;
		start = start >>> 0;
		end = end === void 0 ? this.length : end >>> 0;
		if (!val) val = 0;
		var i$2;
		if (typeof val === "number") for (i$2 = start; i$2 < end; ++i$2) this[i$2] = val;
		else {
			var bytes = Buffer$5.isBuffer(val) ? val : utf8ToBytes(new Buffer$5(val, encoding).toString());
			var len$1 = bytes.length;
			for (i$2 = 0; i$2 < end - start; ++i$2) this[i$2 + start] = bytes[i$2 % len$1];
		}
		return this;
	};
	var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;
	function base64clean(str) {
		str = stringtrim(str).replace(INVALID_BASE64_RE, "");
		if (str.length < 2) return "";
		while (str.length % 4 !== 0) str = str + "=";
		return str;
	}
	function stringtrim(str) {
		if (str.trim) return str.trim();
		return str.replace(/^\s+|\s+$/g, "");
	}
	function toHex(n) {
		if (n < 16) return "0" + n.toString(16);
		return n.toString(16);
	}
	function utf8ToBytes(string, units) {
		units = units || Infinity;
		var codePoint;
		var length = string.length;
		var leadSurrogate = null;
		var bytes = [];
		for (var i$2 = 0; i$2 < length; ++i$2) {
			codePoint = string.charCodeAt(i$2);
			if (codePoint > 55295 && codePoint < 57344) {
				if (!leadSurrogate) {
					if (codePoint > 56319) {
						if ((units -= 3) > -1) bytes.push(239, 191, 189);
						continue;
					} else if (i$2 + 1 === length) {
						if ((units -= 3) > -1) bytes.push(239, 191, 189);
						continue;
					}
					leadSurrogate = codePoint;
					continue;
				}
				if (codePoint < 56320) {
					if ((units -= 3) > -1) bytes.push(239, 191, 189);
					leadSurrogate = codePoint;
					continue;
				}
				codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
			} else if (leadSurrogate) {
				if ((units -= 3) > -1) bytes.push(239, 191, 189);
			}
			leadSurrogate = null;
			if (codePoint < 128) {
				if ((units -= 1) < 0) break;
				bytes.push(codePoint);
			} else if (codePoint < 2048) {
				if ((units -= 2) < 0) break;
				bytes.push(codePoint >> 6 | 192, codePoint & 63 | 128);
			} else if (codePoint < 65536) {
				if ((units -= 3) < 0) break;
				bytes.push(codePoint >> 12 | 224, codePoint >> 6 & 63 | 128, codePoint & 63 | 128);
			} else if (codePoint < 1114112) {
				if ((units -= 4) < 0) break;
				bytes.push(codePoint >> 18 | 240, codePoint >> 12 & 63 | 128, codePoint >> 6 & 63 | 128, codePoint & 63 | 128);
			} else throw new Error("Invalid code point");
		}
		return bytes;
	}
	function asciiToBytes(str) {
		var byteArray = [];
		for (var i$2 = 0; i$2 < str.length; ++i$2) byteArray.push(str.charCodeAt(i$2) & 255);
		return byteArray;
	}
	function utf16leToBytes(str, units) {
		var c, hi, lo;
		var byteArray = [];
		for (var i$2 = 0; i$2 < str.length; ++i$2) {
			if ((units -= 2) < 0) break;
			c = str.charCodeAt(i$2);
			hi = c >> 8;
			lo = c % 256;
			byteArray.push(lo);
			byteArray.push(hi);
		}
		return byteArray;
	}
	function base64ToBytes(str) {
		return base64.toByteArray(base64clean(str));
	}
	function blitBuffer(src, dst, offset, length) {
		for (var i$2 = 0; i$2 < length; ++i$2) {
			if (i$2 + offset >= dst.length || i$2 >= src.length) break;
			dst[i$2 + offset] = src[i$2];
		}
		return i$2;
	}
	function isnan(val) {
		return val !== val;
	}
}));

//#endregion
//#region node_modules/aws-sdk/lib/browserHashUtils.js
var require_browserHashUtils = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var Buffer$4 = require_buffer().Buffer;
	/**
	* This is a polyfill for the static method `isView` of `ArrayBuffer`, which is
	* e.g. missing in IE 10.
	*
	* @api private
	*/
	if (typeof ArrayBuffer !== "undefined" && typeof ArrayBuffer.isView === "undefined") ArrayBuffer.isView = function(arg) {
		return viewStrings.indexOf(Object.prototype.toString.call(arg)) > -1;
	};
	/**
	* @api private
	*/
	var viewStrings = [
		"[object Int8Array]",
		"[object Uint8Array]",
		"[object Uint8ClampedArray]",
		"[object Int16Array]",
		"[object Uint16Array]",
		"[object Int32Array]",
		"[object Uint32Array]",
		"[object Float32Array]",
		"[object Float64Array]",
		"[object DataView]"
	];
	/**
	* @api private
	*/
	function isEmptyData(data) {
		if (typeof data === "string") return data.length === 0;
		return data.byteLength === 0;
	}
	/**
	* @api private
	*/
	function convertToBuffer(data) {
		if (typeof data === "string") data = new Buffer$4(data, "utf8");
		if (ArrayBuffer.isView(data)) return new Uint8Array(data.buffer, data.byteOffset, data.byteLength / Uint8Array.BYTES_PER_ELEMENT);
		return new Uint8Array(data);
	}
	/**
	* @api private
	*/
	module.exports = exports = {
		isEmptyData,
		convertToBuffer
	};
}));

//#endregion
//#region node_modules/aws-sdk/lib/browserHmac.js
var require_browserHmac = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var hashUtils$3 = require_browserHashUtils();
	/**
	* @api private
	*/
	function Hmac$1(hashCtor, secret) {
		this.hash = new hashCtor();
		this.outer = new hashCtor();
		var inner = bufferFromSecret(hashCtor, secret);
		var outer = new Uint8Array(hashCtor.BLOCK_SIZE);
		outer.set(inner);
		for (var i$2 = 0; i$2 < hashCtor.BLOCK_SIZE; i$2++) {
			inner[i$2] ^= 54;
			outer[i$2] ^= 92;
		}
		this.hash.update(inner);
		this.outer.update(outer);
		for (var i$2 = 0; i$2 < inner.byteLength; i$2++) inner[i$2] = 0;
	}
	/**
	* @api private
	*/
	module.exports = exports = Hmac$1;
	Hmac$1.prototype.update = function(toHash) {
		if (hashUtils$3.isEmptyData(toHash) || this.error) return this;
		try {
			this.hash.update(hashUtils$3.convertToBuffer(toHash));
		} catch (e) {
			this.error = e;
		}
		return this;
	};
	Hmac$1.prototype.digest = function(encoding) {
		if (!this.outer.finished) this.outer.update(this.hash.digest());
		return this.outer.digest(encoding);
	};
	function bufferFromSecret(hashCtor, secret) {
		var input = hashUtils$3.convertToBuffer(secret);
		if (input.byteLength > hashCtor.BLOCK_SIZE) {
			var bufferHash = new hashCtor();
			bufferHash.update(input);
			input = bufferHash.digest();
		}
		var buffer = new Uint8Array(hashCtor.BLOCK_SIZE);
		buffer.set(input);
		return buffer;
	}
}));

//#endregion
//#region node_modules/aws-sdk/lib/browserMd5.js
var require_browserMd5 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var hashUtils$2 = require_browserHashUtils();
	var Buffer$3 = require_buffer().Buffer;
	var BLOCK_SIZE$2 = 64;
	var DIGEST_LENGTH$2 = 16;
	/**
	* @api private
	*/
	function Md5$1() {
		this.state = [
			1732584193,
			4023233417,
			2562383102,
			271733878
		];
		this.buffer = new DataView(new ArrayBuffer(BLOCK_SIZE$2));
		this.bufferLength = 0;
		this.bytesHashed = 0;
		this.finished = false;
	}
	/**
	* @api private
	*/
	module.exports = exports = Md5$1;
	Md5$1.BLOCK_SIZE = BLOCK_SIZE$2;
	Md5$1.prototype.update = function(sourceData) {
		if (hashUtils$2.isEmptyData(sourceData)) return this;
		else if (this.finished) throw new Error("Attempted to update an already finished hash.");
		var data = hashUtils$2.convertToBuffer(sourceData);
		var position = 0;
		var byteLength$2 = data.byteLength;
		this.bytesHashed += byteLength$2;
		while (byteLength$2 > 0) {
			this.buffer.setUint8(this.bufferLength++, data[position++]);
			byteLength$2--;
			if (this.bufferLength === BLOCK_SIZE$2) {
				this.hashBuffer();
				this.bufferLength = 0;
			}
		}
		return this;
	};
	Md5$1.prototype.digest = function(encoding) {
		if (!this.finished) {
			var _a = this, buffer = _a.buffer, undecoratedLength = _a.bufferLength;
			var bitsHashed = _a.bytesHashed * 8;
			buffer.setUint8(this.bufferLength++, 128);
			if (undecoratedLength % BLOCK_SIZE$2 >= BLOCK_SIZE$2 - 8) {
				for (var i$2 = this.bufferLength; i$2 < BLOCK_SIZE$2; i$2++) buffer.setUint8(i$2, 0);
				this.hashBuffer();
				this.bufferLength = 0;
			}
			for (var i$2 = this.bufferLength; i$2 < BLOCK_SIZE$2 - 8; i$2++) buffer.setUint8(i$2, 0);
			buffer.setUint32(BLOCK_SIZE$2 - 8, bitsHashed >>> 0, true);
			buffer.setUint32(BLOCK_SIZE$2 - 4, Math.floor(bitsHashed / 4294967296), true);
			this.hashBuffer();
			this.finished = true;
		}
		var out = new DataView(new ArrayBuffer(DIGEST_LENGTH$2));
		for (var i$2 = 0; i$2 < 4; i$2++) out.setUint32(i$2 * 4, this.state[i$2], true);
		var buff = new Buffer$3(out.buffer, out.byteOffset, out.byteLength);
		return encoding ? buff.toString(encoding) : buff;
	};
	Md5$1.prototype.hashBuffer = function() {
		var _a = this, buffer = _a.buffer, state = _a.state;
		var a = state[0], b = state[1], c = state[2], d = state[3];
		a = ff(a, b, c, d, buffer.getUint32(0, true), 7, 3614090360);
		d = ff(d, a, b, c, buffer.getUint32(4, true), 12, 3905402710);
		c = ff(c, d, a, b, buffer.getUint32(8, true), 17, 606105819);
		b = ff(b, c, d, a, buffer.getUint32(12, true), 22, 3250441966);
		a = ff(a, b, c, d, buffer.getUint32(16, true), 7, 4118548399);
		d = ff(d, a, b, c, buffer.getUint32(20, true), 12, 1200080426);
		c = ff(c, d, a, b, buffer.getUint32(24, true), 17, 2821735955);
		b = ff(b, c, d, a, buffer.getUint32(28, true), 22, 4249261313);
		a = ff(a, b, c, d, buffer.getUint32(32, true), 7, 1770035416);
		d = ff(d, a, b, c, buffer.getUint32(36, true), 12, 2336552879);
		c = ff(c, d, a, b, buffer.getUint32(40, true), 17, 4294925233);
		b = ff(b, c, d, a, buffer.getUint32(44, true), 22, 2304563134);
		a = ff(a, b, c, d, buffer.getUint32(48, true), 7, 1804603682);
		d = ff(d, a, b, c, buffer.getUint32(52, true), 12, 4254626195);
		c = ff(c, d, a, b, buffer.getUint32(56, true), 17, 2792965006);
		b = ff(b, c, d, a, buffer.getUint32(60, true), 22, 1236535329);
		a = gg(a, b, c, d, buffer.getUint32(4, true), 5, 4129170786);
		d = gg(d, a, b, c, buffer.getUint32(24, true), 9, 3225465664);
		c = gg(c, d, a, b, buffer.getUint32(44, true), 14, 643717713);
		b = gg(b, c, d, a, buffer.getUint32(0, true), 20, 3921069994);
		a = gg(a, b, c, d, buffer.getUint32(20, true), 5, 3593408605);
		d = gg(d, a, b, c, buffer.getUint32(40, true), 9, 38016083);
		c = gg(c, d, a, b, buffer.getUint32(60, true), 14, 3634488961);
		b = gg(b, c, d, a, buffer.getUint32(16, true), 20, 3889429448);
		a = gg(a, b, c, d, buffer.getUint32(36, true), 5, 568446438);
		d = gg(d, a, b, c, buffer.getUint32(56, true), 9, 3275163606);
		c = gg(c, d, a, b, buffer.getUint32(12, true), 14, 4107603335);
		b = gg(b, c, d, a, buffer.getUint32(32, true), 20, 1163531501);
		a = gg(a, b, c, d, buffer.getUint32(52, true), 5, 2850285829);
		d = gg(d, a, b, c, buffer.getUint32(8, true), 9, 4243563512);
		c = gg(c, d, a, b, buffer.getUint32(28, true), 14, 1735328473);
		b = gg(b, c, d, a, buffer.getUint32(48, true), 20, 2368359562);
		a = hh(a, b, c, d, buffer.getUint32(20, true), 4, 4294588738);
		d = hh(d, a, b, c, buffer.getUint32(32, true), 11, 2272392833);
		c = hh(c, d, a, b, buffer.getUint32(44, true), 16, 1839030562);
		b = hh(b, c, d, a, buffer.getUint32(56, true), 23, 4259657740);
		a = hh(a, b, c, d, buffer.getUint32(4, true), 4, 2763975236);
		d = hh(d, a, b, c, buffer.getUint32(16, true), 11, 1272893353);
		c = hh(c, d, a, b, buffer.getUint32(28, true), 16, 4139469664);
		b = hh(b, c, d, a, buffer.getUint32(40, true), 23, 3200236656);
		a = hh(a, b, c, d, buffer.getUint32(52, true), 4, 681279174);
		d = hh(d, a, b, c, buffer.getUint32(0, true), 11, 3936430074);
		c = hh(c, d, a, b, buffer.getUint32(12, true), 16, 3572445317);
		b = hh(b, c, d, a, buffer.getUint32(24, true), 23, 76029189);
		a = hh(a, b, c, d, buffer.getUint32(36, true), 4, 3654602809);
		d = hh(d, a, b, c, buffer.getUint32(48, true), 11, 3873151461);
		c = hh(c, d, a, b, buffer.getUint32(60, true), 16, 530742520);
		b = hh(b, c, d, a, buffer.getUint32(8, true), 23, 3299628645);
		a = ii(a, b, c, d, buffer.getUint32(0, true), 6, 4096336452);
		d = ii(d, a, b, c, buffer.getUint32(28, true), 10, 1126891415);
		c = ii(c, d, a, b, buffer.getUint32(56, true), 15, 2878612391);
		b = ii(b, c, d, a, buffer.getUint32(20, true), 21, 4237533241);
		a = ii(a, b, c, d, buffer.getUint32(48, true), 6, 1700485571);
		d = ii(d, a, b, c, buffer.getUint32(12, true), 10, 2399980690);
		c = ii(c, d, a, b, buffer.getUint32(40, true), 15, 4293915773);
		b = ii(b, c, d, a, buffer.getUint32(4, true), 21, 2240044497);
		a = ii(a, b, c, d, buffer.getUint32(32, true), 6, 1873313359);
		d = ii(d, a, b, c, buffer.getUint32(60, true), 10, 4264355552);
		c = ii(c, d, a, b, buffer.getUint32(24, true), 15, 2734768916);
		b = ii(b, c, d, a, buffer.getUint32(52, true), 21, 1309151649);
		a = ii(a, b, c, d, buffer.getUint32(16, true), 6, 4149444226);
		d = ii(d, a, b, c, buffer.getUint32(44, true), 10, 3174756917);
		c = ii(c, d, a, b, buffer.getUint32(8, true), 15, 718787259);
		b = ii(b, c, d, a, buffer.getUint32(36, true), 21, 3951481745);
		state[0] = a + state[0] & 4294967295;
		state[1] = b + state[1] & 4294967295;
		state[2] = c + state[2] & 4294967295;
		state[3] = d + state[3] & 4294967295;
	};
	function cmn(q, a, b, x, s, t) {
		a = (a + q & 4294967295) + (x + t & 4294967295) & 4294967295;
		return (a << s | a >>> 32 - s) + b & 4294967295;
	}
	function ff(a, b, c, d, x, s, t) {
		return cmn(b & c | ~b & d, a, b, x, s, t);
	}
	function gg(a, b, c, d, x, s, t) {
		return cmn(b & d | c & ~d, a, b, x, s, t);
	}
	function hh(a, b, c, d, x, s, t) {
		return cmn(b ^ c ^ d, a, b, x, s, t);
	}
	function ii(a, b, c, d, x, s, t) {
		return cmn(c ^ (b | ~d), a, b, x, s, t);
	}
}));

//#endregion
//#region node_modules/aws-sdk/lib/browserSha1.js
var require_browserSha1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var Buffer$2 = require_buffer().Buffer;
	var hashUtils$1 = require_browserHashUtils();
	var BLOCK_SIZE$1 = 64;
	var DIGEST_LENGTH$1 = 20;
	new Uint32Array([
		1518500249,
		1859775393,
		-1894007588,
		-899497514
	]);
	Math.pow(2, 53) - 1;
	/**
	* @api private
	*/
	function Sha1$1() {
		this.h0 = 1732584193;
		this.h1 = 4023233417;
		this.h2 = 2562383102;
		this.h3 = 271733878;
		this.h4 = 3285377520;
		this.block = new Uint32Array(80);
		this.offset = 0;
		this.shift = 24;
		this.totalLength = 0;
	}
	/**
	* @api private
	*/
	module.exports = exports = Sha1$1;
	Sha1$1.BLOCK_SIZE = BLOCK_SIZE$1;
	Sha1$1.prototype.update = function(data) {
		if (this.finished) throw new Error("Attempted to update an already finished hash.");
		if (hashUtils$1.isEmptyData(data)) return this;
		data = hashUtils$1.convertToBuffer(data);
		var length = data.length;
		this.totalLength += length * 8;
		for (var i$2 = 0; i$2 < length; i$2++) this.write(data[i$2]);
		return this;
	};
	Sha1$1.prototype.write = function write(byte) {
		this.block[this.offset] |= (byte & 255) << this.shift;
		if (this.shift) this.shift -= 8;
		else {
			this.offset++;
			this.shift = 24;
		}
		if (this.offset === 16) this.processBlock();
	};
	Sha1$1.prototype.digest = function(encoding) {
		this.write(128);
		if (this.offset > 14 || this.offset === 14 && this.shift < 24) this.processBlock();
		this.offset = 14;
		this.shift = 24;
		this.write(0);
		this.write(0);
		this.write(this.totalLength > 0xffffffffff ? this.totalLength / 1099511627776 : 0);
		this.write(this.totalLength > 4294967295 ? this.totalLength / 4294967296 : 0);
		for (var s = 24; s >= 0; s -= 8) this.write(this.totalLength >> s);
		var out = new Buffer$2(DIGEST_LENGTH$1);
		var outView = new DataView(out.buffer);
		outView.setUint32(0, this.h0, false);
		outView.setUint32(4, this.h1, false);
		outView.setUint32(8, this.h2, false);
		outView.setUint32(12, this.h3, false);
		outView.setUint32(16, this.h4, false);
		return encoding ? out.toString(encoding) : out;
	};
	Sha1$1.prototype.processBlock = function processBlock() {
		for (var i$2 = 16; i$2 < 80; i$2++) {
			var w = this.block[i$2 - 3] ^ this.block[i$2 - 8] ^ this.block[i$2 - 14] ^ this.block[i$2 - 16];
			this.block[i$2] = w << 1 | w >>> 31;
		}
		var a = this.h0;
		var b = this.h1;
		var c = this.h2;
		var d = this.h3;
		var e = this.h4;
		var f$1, k;
		for (i$2 = 0; i$2 < 80; i$2++) {
			if (i$2 < 20) {
				f$1 = d ^ b & (c ^ d);
				k = 1518500249;
			} else if (i$2 < 40) {
				f$1 = b ^ c ^ d;
				k = 1859775393;
			} else if (i$2 < 60) {
				f$1 = b & c | d & (b | c);
				k = 2400959708;
			} else {
				f$1 = b ^ c ^ d;
				k = 3395469782;
			}
			var temp = (a << 5 | a >>> 27) + f$1 + e + k + (this.block[i$2] | 0);
			e = d;
			d = c;
			c = b << 30 | b >>> 2;
			b = a;
			a = temp;
		}
		this.h0 = this.h0 + a | 0;
		this.h1 = this.h1 + b | 0;
		this.h2 = this.h2 + c | 0;
		this.h3 = this.h3 + d | 0;
		this.h4 = this.h4 + e | 0;
		this.offset = 0;
		for (i$2 = 0; i$2 < 16; i$2++) this.block[i$2] = 0;
	};
}));

//#endregion
//#region node_modules/aws-sdk/lib/browserSha256.js
var require_browserSha256 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var Buffer$1 = require_buffer().Buffer;
	var hashUtils = require_browserHashUtils();
	var BLOCK_SIZE = 64;
	var DIGEST_LENGTH = 32;
	var KEY = new Uint32Array([
		1116352408,
		1899447441,
		3049323471,
		3921009573,
		961987163,
		1508970993,
		2453635748,
		2870763221,
		3624381080,
		310598401,
		607225278,
		1426881987,
		1925078388,
		2162078206,
		2614888103,
		3248222580,
		3835390401,
		4022224774,
		264347078,
		604807628,
		770255983,
		1249150122,
		1555081692,
		1996064986,
		2554220882,
		2821834349,
		2952996808,
		3210313671,
		3336571891,
		3584528711,
		113926993,
		338241895,
		666307205,
		773529912,
		1294757372,
		1396182291,
		1695183700,
		1986661051,
		2177026350,
		2456956037,
		2730485921,
		2820302411,
		3259730800,
		3345764771,
		3516065817,
		3600352804,
		4094571909,
		275423344,
		430227734,
		506948616,
		659060556,
		883997877,
		958139571,
		1322822218,
		1537002063,
		1747873779,
		1955562222,
		2024104815,
		2227730452,
		2361852424,
		2428436474,
		2756734187,
		3204031479,
		3329325298
	]);
	var MAX_HASHABLE_LENGTH = Math.pow(2, 53) - 1;
	/**
	* @private
	*/
	function Sha256$1() {
		this.state = [
			1779033703,
			3144134277,
			1013904242,
			2773480762,
			1359893119,
			2600822924,
			528734635,
			1541459225
		];
		this.temp = new Int32Array(64);
		this.buffer = new Uint8Array(64);
		this.bufferLength = 0;
		this.bytesHashed = 0;
		/**
		* @private
		*/
		this.finished = false;
	}
	/**
	* @api private
	*/
	module.exports = exports = Sha256$1;
	Sha256$1.BLOCK_SIZE = BLOCK_SIZE;
	Sha256$1.prototype.update = function(data) {
		if (this.finished) throw new Error("Attempted to update an already finished hash.");
		if (hashUtils.isEmptyData(data)) return this;
		data = hashUtils.convertToBuffer(data);
		var position = 0;
		var byteLength$2 = data.byteLength;
		this.bytesHashed += byteLength$2;
		if (this.bytesHashed * 8 > MAX_HASHABLE_LENGTH) throw new Error("Cannot hash more than 2^53 - 1 bits");
		while (byteLength$2 > 0) {
			this.buffer[this.bufferLength++] = data[position++];
			byteLength$2--;
			if (this.bufferLength === BLOCK_SIZE) {
				this.hashBuffer();
				this.bufferLength = 0;
			}
		}
		return this;
	};
	Sha256$1.prototype.digest = function(encoding) {
		if (!this.finished) {
			var bitsHashed = this.bytesHashed * 8;
			var bufferView = new DataView(this.buffer.buffer, this.buffer.byteOffset, this.buffer.byteLength);
			var undecoratedLength = this.bufferLength;
			bufferView.setUint8(this.bufferLength++, 128);
			if (undecoratedLength % BLOCK_SIZE >= BLOCK_SIZE - 8) {
				for (var i$2 = this.bufferLength; i$2 < BLOCK_SIZE; i$2++) bufferView.setUint8(i$2, 0);
				this.hashBuffer();
				this.bufferLength = 0;
			}
			for (var i$2 = this.bufferLength; i$2 < BLOCK_SIZE - 8; i$2++) bufferView.setUint8(i$2, 0);
			bufferView.setUint32(BLOCK_SIZE - 8, Math.floor(bitsHashed / 4294967296), true);
			bufferView.setUint32(BLOCK_SIZE - 4, bitsHashed);
			this.hashBuffer();
			this.finished = true;
		}
		var out = new Buffer$1(DIGEST_LENGTH);
		for (var i$2 = 0; i$2 < 8; i$2++) {
			out[i$2 * 4] = this.state[i$2] >>> 24 & 255;
			out[i$2 * 4 + 1] = this.state[i$2] >>> 16 & 255;
			out[i$2 * 4 + 2] = this.state[i$2] >>> 8 & 255;
			out[i$2 * 4 + 3] = this.state[i$2] >>> 0 & 255;
		}
		return encoding ? out.toString(encoding) : out;
	};
	Sha256$1.prototype.hashBuffer = function() {
		var _a = this, buffer = _a.buffer, state = _a.state;
		var state0 = state[0], state1 = state[1], state2 = state[2], state3 = state[3], state4 = state[4], state5 = state[5], state6 = state[6], state7 = state[7];
		for (var i$2 = 0; i$2 < BLOCK_SIZE; i$2++) {
			if (i$2 < 16) this.temp[i$2] = (buffer[i$2 * 4] & 255) << 24 | (buffer[i$2 * 4 + 1] & 255) << 16 | (buffer[i$2 * 4 + 2] & 255) << 8 | buffer[i$2 * 4 + 3] & 255;
			else {
				var u = this.temp[i$2 - 2];
				var t1_1 = (u >>> 17 | u << 15) ^ (u >>> 19 | u << 13) ^ u >>> 10;
				u = this.temp[i$2 - 15];
				var t2_1 = (u >>> 7 | u << 25) ^ (u >>> 18 | u << 14) ^ u >>> 3;
				this.temp[i$2] = (t1_1 + this.temp[i$2 - 7] | 0) + (t2_1 + this.temp[i$2 - 16] | 0);
			}
			var t1 = (((state4 >>> 6 | state4 << 26) ^ (state4 >>> 11 | state4 << 21) ^ (state4 >>> 25 | state4 << 7)) + (state4 & state5 ^ ~state4 & state6) | 0) + (state7 + (KEY[i$2] + this.temp[i$2] | 0) | 0) | 0;
			var t2 = ((state0 >>> 2 | state0 << 30) ^ (state0 >>> 13 | state0 << 19) ^ (state0 >>> 22 | state0 << 10)) + (state0 & state1 ^ state0 & state2 ^ state1 & state2) | 0;
			state7 = state6;
			state6 = state5;
			state5 = state4;
			state4 = state3 + t1 | 0;
			state3 = state2;
			state2 = state1;
			state1 = state0;
			state0 = t1 + t2 | 0;
		}
		state[0] += state0;
		state[1] += state1;
		state[2] += state2;
		state[3] += state3;
		state[4] += state4;
		state[5] += state5;
		state[6] += state6;
		state[7] += state7;
	};
}));

//#endregion
//#region node_modules/aws-sdk/lib/browserCryptoLib.js
var require_browserCryptoLib = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var Hmac = require_browserHmac();
	var Md5 = require_browserMd5();
	var Sha1 = require_browserSha1();
	var Sha256 = require_browserSha256();
	/**
	* @api private
	*/
	module.exports = exports = {
		createHash: function createHash(alg) {
			alg = alg.toLowerCase();
			if (alg === "md5") return new Md5();
			else if (alg === "sha256") return new Sha256();
			else if (alg === "sha1") return new Sha1();
			throw new Error("Hash algorithm " + alg + " is not supported in the browser SDK");
		},
		createHmac: function createHmac(alg, key) {
			alg = alg.toLowerCase();
			if (alg === "md5") return new Hmac(Md5, key);
			else if (alg === "sha256") return new Hmac(Sha256, key);
			else if (alg === "sha1") return new Hmac(Sha1, key);
			throw new Error("HMAC algorithm " + alg + " is not supported in the browser SDK");
		},
		createSign: function() {
			throw new Error("createSign is not implemented in the browser");
		}
	};
}));

//#endregion
//#region node_modules/punycode/punycode.js
var require_punycode = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	(function(root) {
		/** Detect free variables */
		var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
		var freeModule = typeof module == "object" && module && !module.nodeType && module;
		var freeGlobal = typeof global == "object" && global;
		if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal || freeGlobal.self === freeGlobal) root = freeGlobal;
		/**
		* The `punycode` object.
		* @name punycode
		* @type Object
		*/
		var punycode$1, maxInt = 2147483647, base = 36, tMin = 1, tMax = 26, skew = 38, damp = 700, initialBias = 72, initialN = 128, delimiter = "-", regexPunycode = /^xn--/, regexNonASCII = /[^\x20-\x7E]/, regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, errors = {
			"overflow": "Overflow: input needs wider integers to process",
			"not-basic": "Illegal input >= 0x80 (not a basic code point)",
			"invalid-input": "Invalid input"
		}, baseMinusTMin = base - tMin, floor$1 = Math.floor, stringFromCharCode = String.fromCharCode, key;
		/**
		* A generic error utility function.
		* @private
		* @param {String} type The error type.
		* @returns {Error} Throws a `RangeError` with the applicable error message.
		*/
		function error(type) {
			throw RangeError(errors[type]);
		}
		/**
		* A generic `Array#map` utility function.
		* @private
		* @param {Array} array The array to iterate over.
		* @param {Function} callback The function that gets called for every array
		* item.
		* @returns {Array} A new array of values returned by the callback function.
		*/
		function map(array, fn$1) {
			var length = array.length;
			var result = [];
			while (length--) result[length] = fn$1(array[length]);
			return result;
		}
		/**
		* A simple `Array#map`-like wrapper to work with domain name strings or email
		* addresses.
		* @private
		* @param {String} domain The domain name or email address.
		* @param {Function} callback The function that gets called for every
		* character.
		* @returns {Array} A new string of characters returned by the callback
		* function.
		*/
		function mapDomain(string, fn$1) {
			var parts = string.split("@");
			var result = "";
			if (parts.length > 1) {
				result = parts[0] + "@";
				string = parts[1];
			}
			string = string.replace(regexSeparators, ".");
			var encoded = map(string.split("."), fn$1).join(".");
			return result + encoded;
		}
		/**
		* Creates an array containing the numeric code points of each Unicode
		* character in the string. While JavaScript uses UCS-2 internally,
		* this function will convert a pair of surrogate halves (each of which
		* UCS-2 exposes as separate characters) into a single code point,
		* matching UTF-16.
		* @see `punycode.ucs2.encode`
		* @see <https://mathiasbynens.be/notes/javascript-encoding>
		* @memberOf punycode.ucs2
		* @name decode
		* @param {String} string The Unicode input string (UCS-2).
		* @returns {Array} The new array of code points.
		*/
		function ucs2decode(string) {
			var output = [], counter = 0, length = string.length, value, extra;
			while (counter < length) {
				value = string.charCodeAt(counter++);
				if (value >= 55296 && value <= 56319 && counter < length) {
					extra = string.charCodeAt(counter++);
					if ((extra & 64512) == 56320) output.push(((value & 1023) << 10) + (extra & 1023) + 65536);
					else {
						output.push(value);
						counter--;
					}
				} else output.push(value);
			}
			return output;
		}
		/**
		* Creates a string based on an array of numeric code points.
		* @see `punycode.ucs2.decode`
		* @memberOf punycode.ucs2
		* @name encode
		* @param {Array} codePoints The array of numeric code points.
		* @returns {String} The new Unicode string (UCS-2).
		*/
		function ucs2encode(array) {
			return map(array, function(value) {
				var output = "";
				if (value > 65535) {
					value -= 65536;
					output += stringFromCharCode(value >>> 10 & 1023 | 55296);
					value = 56320 | value & 1023;
				}
				output += stringFromCharCode(value);
				return output;
			}).join("");
		}
		/**
		* Converts a basic code point into a digit/integer.
		* @see `digitToBasic()`
		* @private
		* @param {Number} codePoint The basic numeric code point value.
		* @returns {Number} The numeric value of a basic code point (for use in
		* representing integers) in the range `0` to `base - 1`, or `base` if
		* the code point does not represent a value.
		*/
		function basicToDigit(codePoint) {
			if (codePoint - 48 < 10) return codePoint - 22;
			if (codePoint - 65 < 26) return codePoint - 65;
			if (codePoint - 97 < 26) return codePoint - 97;
			return base;
		}
		/**
		* Converts a digit/integer into a basic code point.
		* @see `basicToDigit()`
		* @private
		* @param {Number} digit The numeric value of a basic code point.
		* @returns {Number} The basic code point whose value (when used for
		* representing integers) is `digit`, which needs to be in the range
		* `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
		* used; else, the lowercase form is used. The behavior is undefined
		* if `flag` is non-zero and `digit` has no uppercase form.
		*/
		function digitToBasic(digit, flag) {
			return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
		}
		/**
		* Bias adaptation function as per section 3.4 of RFC 3492.
		* http://tools.ietf.org/html/rfc3492#section-3.4
		* @private
		*/
		function adapt(delta, numPoints, firstTime) {
			var k = 0;
			delta = firstTime ? floor$1(delta / damp) : delta >> 1;
			delta += floor$1(delta / numPoints);
			for (; delta > baseMinusTMin * tMax >> 1; k += base) delta = floor$1(delta / baseMinusTMin);
			return floor$1(k + (baseMinusTMin + 1) * delta / (delta + skew));
		}
		/**
		* Converts a Punycode string of ASCII-only symbols to a string of Unicode
		* symbols.
		* @memberOf punycode
		* @param {String} input The Punycode string of ASCII-only symbols.
		* @returns {String} The resulting string of Unicode symbols.
		*/
		function decode(input) {
			var output = [], inputLength = input.length, out, i$2 = 0, n = initialN, bias = initialBias, basic = input.lastIndexOf(delimiter), j, index, oldi, w, k, digit, t, baseMinusT;
			if (basic < 0) basic = 0;
			for (j = 0; j < basic; ++j) {
				if (input.charCodeAt(j) >= 128) error("not-basic");
				output.push(input.charCodeAt(j));
			}
			for (index = basic > 0 ? basic + 1 : 0; index < inputLength;) {
				for (oldi = i$2, w = 1, k = base;; k += base) {
					if (index >= inputLength) error("invalid-input");
					digit = basicToDigit(input.charCodeAt(index++));
					if (digit >= base || digit > floor$1((maxInt - i$2) / w)) error("overflow");
					i$2 += digit * w;
					t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
					if (digit < t) break;
					baseMinusT = base - t;
					if (w > floor$1(maxInt / baseMinusT)) error("overflow");
					w *= baseMinusT;
				}
				out = output.length + 1;
				bias = adapt(i$2 - oldi, out, oldi == 0);
				if (floor$1(i$2 / out) > maxInt - n) error("overflow");
				n += floor$1(i$2 / out);
				i$2 %= out;
				output.splice(i$2++, 0, n);
			}
			return ucs2encode(output);
		}
		/**
		* Converts a string of Unicode symbols (e.g. a domain name label) to a
		* Punycode string of ASCII-only symbols.
		* @memberOf punycode
		* @param {String} input The string of Unicode symbols.
		* @returns {String} The resulting Punycode string of ASCII-only symbols.
		*/
		function encode(input) {
			var n, delta, handledCPCount, basicLength, bias, j, m, q, k, t, currentValue, output = [], inputLength, handledCPCountPlusOne, baseMinusT, qMinusT;
			input = ucs2decode(input);
			inputLength = input.length;
			n = initialN;
			delta = 0;
			bias = initialBias;
			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue < 128) output.push(stringFromCharCode(currentValue));
			}
			handledCPCount = basicLength = output.length;
			if (basicLength) output.push(delimiter);
			while (handledCPCount < inputLength) {
				for (m = maxInt, j = 0; j < inputLength; ++j) {
					currentValue = input[j];
					if (currentValue >= n && currentValue < m) m = currentValue;
				}
				handledCPCountPlusOne = handledCPCount + 1;
				if (m - n > floor$1((maxInt - delta) / handledCPCountPlusOne)) error("overflow");
				delta += (m - n) * handledCPCountPlusOne;
				n = m;
				for (j = 0; j < inputLength; ++j) {
					currentValue = input[j];
					if (currentValue < n && ++delta > maxInt) error("overflow");
					if (currentValue == n) {
						for (q = delta, k = base;; k += base) {
							t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
							if (q < t) break;
							qMinusT = q - t;
							baseMinusT = base - t;
							output.push(stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0)));
							q = floor$1(qMinusT / baseMinusT);
						}
						output.push(stringFromCharCode(digitToBasic(q, 0)));
						bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
						delta = 0;
						++handledCPCount;
					}
				}
				++delta;
				++n;
			}
			return output.join("");
		}
		/**
		* Converts a Punycode string representing a domain name or an email address
		* to Unicode. Only the Punycoded parts of the input will be converted, i.e.
		* it doesn't matter if you call it on a string that has already been
		* converted to Unicode.
		* @memberOf punycode
		* @param {String} input The Punycoded domain name or email address to
		* convert to Unicode.
		* @returns {String} The Unicode representation of the given Punycode
		* string.
		*/
		function toUnicode(input) {
			return mapDomain(input, function(string) {
				return regexPunycode.test(string) ? decode(string.slice(4).toLowerCase()) : string;
			});
		}
		/**
		* Converts a Unicode string representing a domain name or an email address to
		* Punycode. Only the non-ASCII parts of the domain name will be converted,
		* i.e. it doesn't matter if you call it with a domain that's already in
		* ASCII.
		* @memberOf punycode
		* @param {String} input The domain name or email address to convert, as a
		* Unicode string.
		* @returns {String} The Punycode representation of the given domain name or
		* email address.
		*/
		function toASCII(input) {
			return mapDomain(input, function(string) {
				return regexNonASCII.test(string) ? "xn--" + encode(string) : string;
			});
		}
		/** Define the public API */
		punycode$1 = {
			"version": "1.3.2",
			"ucs2": {
				"decode": ucs2decode,
				"encode": ucs2encode
			},
			"decode": decode,
			"encode": encode,
			"toASCII": toASCII,
			"toUnicode": toUnicode
		};
		/** Expose `punycode` */
		if (typeof define == "function" && typeof define.amd == "object" && define.amd) define("punycode", function() {
			return punycode$1;
		});
		else if (freeExports && freeModule) if (module.exports == freeExports) freeModule.exports = punycode$1;
		else for (key in punycode$1) punycode$1.hasOwnProperty(key) && (freeExports[key] = punycode$1[key]);
		else root.punycode = punycode$1;
	})(exports);
}));

//#endregion
//#region node_modules/querystring/decode.js
var require_decode = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	function hasOwnProperty$1(obj, prop) {
		return Object.prototype.hasOwnProperty.call(obj, prop);
	}
	module.exports = function(qs, sep, eq, options) {
		sep = sep || "&";
		eq = eq || "=";
		var obj = {};
		if (typeof qs !== "string" || qs.length === 0) return obj;
		var regexp = /\+/g;
		qs = qs.split(sep);
		var maxKeys = 1e3;
		if (options && typeof options.maxKeys === "number") maxKeys = options.maxKeys;
		var len$1 = qs.length;
		if (maxKeys > 0 && len$1 > maxKeys) len$1 = maxKeys;
		for (var i$2 = 0; i$2 < len$1; ++i$2) {
			var x = qs[i$2].replace(regexp, "%20"), idx = x.indexOf(eq), kstr, vstr, k, v;
			if (idx >= 0) {
				kstr = x.substr(0, idx);
				vstr = x.substr(idx + 1);
			} else {
				kstr = x;
				vstr = "";
			}
			k = decodeURIComponent(kstr);
			v = decodeURIComponent(vstr);
			if (!hasOwnProperty$1(obj, k)) obj[k] = v;
			else if (Array.isArray(obj[k])) obj[k].push(v);
			else obj[k] = [obj[k], v];
		}
		return obj;
	};
}));

//#endregion
//#region node_modules/querystring/encode.js
var require_encode = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var stringifyPrimitive = function(v) {
		switch (typeof v) {
			case "string": return v;
			case "boolean": return v ? "true" : "false";
			case "number": return isFinite(v) ? v : "";
			default: return "";
		}
	};
	module.exports = function(obj, sep, eq, name) {
		sep = sep || "&";
		eq = eq || "=";
		if (obj === null) obj = void 0;
		if (typeof obj === "object") return Object.keys(obj).map(function(k) {
			var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
			if (Array.isArray(obj[k])) return obj[k].map(function(v) {
				return ks + encodeURIComponent(stringifyPrimitive(v));
			}).join(sep);
			else return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
		}).join(sep);
		if (!name) return "";
		return encodeURIComponent(stringifyPrimitive(name)) + eq + encodeURIComponent(stringifyPrimitive(obj));
	};
}));

//#endregion
//#region node_modules/querystring/index.js
var require_querystring = /* @__PURE__ */ __commonJSMin(((exports) => {
	exports.decode = exports.parse = require_decode();
	exports.encode = exports.stringify = require_encode();
}));

//#endregion
//#region node_modules/url/url.js
var require_url = /* @__PURE__ */ __commonJSMin(((exports) => {
	var punycode = require_punycode();
	exports.parse = urlParse;
	exports.resolve = urlResolve;
	exports.resolveObject = urlResolveObject;
	exports.format = urlFormat;
	exports.Url = Url;
	function Url() {
		this.protocol = null;
		this.slashes = null;
		this.auth = null;
		this.host = null;
		this.port = null;
		this.hostname = null;
		this.hash = null;
		this.search = null;
		this.query = null;
		this.pathname = null;
		this.path = null;
		this.href = null;
	}
	var protocolPattern = /^([a-z0-9.+-]+:)/i, portPattern = /:[0-9]*$/, unwise = [
		"{",
		"}",
		"|",
		"\\",
		"^",
		"`"
	].concat([
		"<",
		">",
		"\"",
		"`",
		" ",
		"\r",
		"\n",
		"	"
	]), autoEscape = ["'"].concat(unwise), nonHostChars = [
		"%",
		"/",
		"?",
		";",
		"#"
	].concat(autoEscape), hostEndingChars = [
		"/",
		"?",
		"#"
	], hostnameMaxLen = 255, hostnamePartPattern = /^[a-z0-9A-Z_-]{0,63}$/, hostnamePartStart = /^([a-z0-9A-Z_-]{0,63})(.*)$/, unsafeProtocol = {
		"javascript": true,
		"javascript:": true
	}, hostlessProtocol = {
		"javascript": true,
		"javascript:": true
	}, slashedProtocol = {
		"http": true,
		"https": true,
		"ftp": true,
		"gopher": true,
		"file": true,
		"http:": true,
		"https:": true,
		"ftp:": true,
		"gopher:": true,
		"file:": true
	}, querystring = require_querystring();
	function urlParse(url, parseQueryString, slashesDenoteHost) {
		if (url && isObject$1(url) && url instanceof Url) return url;
		var u = new Url();
		u.parse(url, parseQueryString, slashesDenoteHost);
		return u;
	}
	Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
		if (!isString(url)) throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
		var rest = url;
		rest = rest.trim();
		var proto = protocolPattern.exec(rest);
		if (proto) {
			proto = proto[0];
			var lowerProto = proto.toLowerCase();
			this.protocol = lowerProto;
			rest = rest.substr(proto.length);
		}
		if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
			var slashes = rest.substr(0, 2) === "//";
			if (slashes && !(proto && hostlessProtocol[proto])) {
				rest = rest.substr(2);
				this.slashes = true;
			}
		}
		if (!hostlessProtocol[proto] && (slashes || proto && !slashedProtocol[proto])) {
			var hostEnd = -1;
			for (var i$2 = 0; i$2 < hostEndingChars.length; i$2++) {
				var hec = rest.indexOf(hostEndingChars[i$2]);
				if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) hostEnd = hec;
			}
			var auth, atSign;
			if (hostEnd === -1) atSign = rest.lastIndexOf("@");
			else atSign = rest.lastIndexOf("@", hostEnd);
			if (atSign !== -1) {
				auth = rest.slice(0, atSign);
				rest = rest.slice(atSign + 1);
				this.auth = decodeURIComponent(auth);
			}
			hostEnd = -1;
			for (var i$2 = 0; i$2 < nonHostChars.length; i$2++) {
				var hec = rest.indexOf(nonHostChars[i$2]);
				if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) hostEnd = hec;
			}
			if (hostEnd === -1) hostEnd = rest.length;
			this.host = rest.slice(0, hostEnd);
			rest = rest.slice(hostEnd);
			this.parseHost();
			this.hostname = this.hostname || "";
			var ipv6Hostname = this.hostname[0] === "[" && this.hostname[this.hostname.length - 1] === "]";
			if (!ipv6Hostname) {
				var hostparts = this.hostname.split(/\./);
				for (var i$2 = 0, l = hostparts.length; i$2 < l; i$2++) {
					var part = hostparts[i$2];
					if (!part) continue;
					if (!part.match(hostnamePartPattern)) {
						var newpart = "";
						for (var j = 0, k = part.length; j < k; j++) if (part.charCodeAt(j) > 127) newpart += "x";
						else newpart += part[j];
						if (!newpart.match(hostnamePartPattern)) {
							var validParts = hostparts.slice(0, i$2);
							var notHost = hostparts.slice(i$2 + 1);
							var bit = part.match(hostnamePartStart);
							if (bit) {
								validParts.push(bit[1]);
								notHost.unshift(bit[2]);
							}
							if (notHost.length) rest = "/" + notHost.join(".") + rest;
							this.hostname = validParts.join(".");
							break;
						}
					}
				}
			}
			if (this.hostname.length > hostnameMaxLen) this.hostname = "";
			else this.hostname = this.hostname.toLowerCase();
			if (!ipv6Hostname) {
				var domainArray = this.hostname.split(".");
				var newOut = [];
				for (var i$2 = 0; i$2 < domainArray.length; ++i$2) {
					var s = domainArray[i$2];
					newOut.push(s.match(/[^A-Za-z0-9_-]/) ? "xn--" + punycode.encode(s) : s);
				}
				this.hostname = newOut.join(".");
			}
			var p = this.port ? ":" + this.port : "";
			this.host = (this.hostname || "") + p;
			this.href += this.host;
			if (ipv6Hostname) {
				this.hostname = this.hostname.substr(1, this.hostname.length - 2);
				if (rest[0] !== "/") rest = "/" + rest;
			}
		}
		if (!unsafeProtocol[lowerProto]) for (var i$2 = 0, l = autoEscape.length; i$2 < l; i$2++) {
			var ae = autoEscape[i$2];
			var esc = encodeURIComponent(ae);
			if (esc === ae) esc = escape(ae);
			rest = rest.split(ae).join(esc);
		}
		var hash = rest.indexOf("#");
		if (hash !== -1) {
			this.hash = rest.substr(hash);
			rest = rest.slice(0, hash);
		}
		var qm = rest.indexOf("?");
		if (qm !== -1) {
			this.search = rest.substr(qm);
			this.query = rest.substr(qm + 1);
			if (parseQueryString) this.query = querystring.parse(this.query);
			rest = rest.slice(0, qm);
		} else if (parseQueryString) {
			this.search = "";
			this.query = {};
		}
		if (rest) this.pathname = rest;
		if (slashedProtocol[lowerProto] && this.hostname && !this.pathname) this.pathname = "/";
		if (this.pathname || this.search) {
			var p = this.pathname || "";
			var s = this.search || "";
			this.path = p + s;
		}
		this.href = this.format();
		return this;
	};
	function urlFormat(obj) {
		if (isString(obj)) obj = urlParse(obj);
		if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
		return obj.format();
	}
	Url.prototype.format = function() {
		var auth = this.auth || "";
		if (auth) {
			auth = encodeURIComponent(auth);
			auth = auth.replace(/%3A/i, ":");
			auth += "@";
		}
		var protocol = this.protocol || "", pathname = this.pathname || "", hash = this.hash || "", host = false, query = "";
		if (this.host) host = auth + this.host;
		else if (this.hostname) {
			host = auth + (this.hostname.indexOf(":") === -1 ? this.hostname : "[" + this.hostname + "]");
			if (this.port) host += ":" + this.port;
		}
		if (this.query && isObject$1(this.query) && Object.keys(this.query).length) query = querystring.stringify(this.query);
		var search = this.search || query && "?" + query || "";
		if (protocol && protocol.substr(-1) !== ":") protocol += ":";
		if (this.slashes || (!protocol || slashedProtocol[protocol]) && host !== false) {
			host = "//" + (host || "");
			if (pathname && pathname.charAt(0) !== "/") pathname = "/" + pathname;
		} else if (!host) host = "";
		if (hash && hash.charAt(0) !== "#") hash = "#" + hash;
		if (search && search.charAt(0) !== "?") search = "?" + search;
		pathname = pathname.replace(/[?#]/g, function(match) {
			return encodeURIComponent(match);
		});
		search = search.replace("#", "%23");
		return protocol + host + pathname + search + hash;
	};
	function urlResolve(source, relative) {
		return urlParse(source, false, true).resolve(relative);
	}
	Url.prototype.resolve = function(relative) {
		return this.resolveObject(urlParse(relative, false, true)).format();
	};
	function urlResolveObject(source, relative) {
		if (!source) return relative;
		return urlParse(source, false, true).resolveObject(relative);
	}
	Url.prototype.resolveObject = function(relative) {
		if (isString(relative)) {
			var rel = new Url();
			rel.parse(relative, false, true);
			relative = rel;
		}
		var result = new Url();
		Object.keys(this).forEach(function(k) {
			result[k] = this[k];
		}, this);
		result.hash = relative.hash;
		if (relative.href === "") {
			result.href = result.format();
			return result;
		}
		if (relative.slashes && !relative.protocol) {
			Object.keys(relative).forEach(function(k) {
				if (k !== "protocol") result[k] = relative[k];
			});
			if (slashedProtocol[result.protocol] && result.hostname && !result.pathname) result.path = result.pathname = "/";
			result.href = result.format();
			return result;
		}
		if (relative.protocol && relative.protocol !== result.protocol) {
			if (!slashedProtocol[relative.protocol]) {
				Object.keys(relative).forEach(function(k) {
					result[k] = relative[k];
				});
				result.href = result.format();
				return result;
			}
			result.protocol = relative.protocol;
			if (!relative.host && !hostlessProtocol[relative.protocol]) {
				var relPath = (relative.pathname || "").split("/");
				while (relPath.length && !(relative.host = relPath.shift()));
				if (!relative.host) relative.host = "";
				if (!relative.hostname) relative.hostname = "";
				if (relPath[0] !== "") relPath.unshift("");
				if (relPath.length < 2) relPath.unshift("");
				result.pathname = relPath.join("/");
			} else result.pathname = relative.pathname;
			result.search = relative.search;
			result.query = relative.query;
			result.host = relative.host || "";
			result.auth = relative.auth;
			result.hostname = relative.hostname || relative.host;
			result.port = relative.port;
			if (result.pathname || result.search) result.path = (result.pathname || "") + (result.search || "");
			result.slashes = result.slashes || relative.slashes;
			result.href = result.format();
			return result;
		}
		var isSourceAbs = result.pathname && result.pathname.charAt(0) === "/", isRelAbs = relative.host || relative.pathname && relative.pathname.charAt(0) === "/", mustEndAbs = isRelAbs || isSourceAbs || result.host && relative.pathname, removeAllDots = mustEndAbs, srcPath = result.pathname && result.pathname.split("/") || [], relPath = relative.pathname && relative.pathname.split("/") || [], psychotic = result.protocol && !slashedProtocol[result.protocol];
		if (psychotic) {
			result.hostname = "";
			result.port = null;
			if (result.host) if (srcPath[0] === "") srcPath[0] = result.host;
			else srcPath.unshift(result.host);
			result.host = "";
			if (relative.protocol) {
				relative.hostname = null;
				relative.port = null;
				if (relative.host) if (relPath[0] === "") relPath[0] = relative.host;
				else relPath.unshift(relative.host);
				relative.host = null;
			}
			mustEndAbs = mustEndAbs && (relPath[0] === "" || srcPath[0] === "");
		}
		if (isRelAbs) {
			result.host = relative.host || relative.host === "" ? relative.host : result.host;
			result.hostname = relative.hostname || relative.hostname === "" ? relative.hostname : result.hostname;
			result.search = relative.search;
			result.query = relative.query;
			srcPath = relPath;
		} else if (relPath.length) {
			if (!srcPath) srcPath = [];
			srcPath.pop();
			srcPath = srcPath.concat(relPath);
			result.search = relative.search;
			result.query = relative.query;
		} else if (!isNullOrUndefined(relative.search)) {
			if (psychotic) {
				result.hostname = result.host = srcPath.shift();
				var authInHost = result.host && result.host.indexOf("@") > 0 ? result.host.split("@") : false;
				if (authInHost) {
					result.auth = authInHost.shift();
					result.host = result.hostname = authInHost.shift();
				}
			}
			result.search = relative.search;
			result.query = relative.query;
			if (!isNull(result.pathname) || !isNull(result.search)) result.path = (result.pathname ? result.pathname : "") + (result.search ? result.search : "");
			result.href = result.format();
			return result;
		}
		if (!srcPath.length) {
			result.pathname = null;
			if (result.search) result.path = "/" + result.search;
			else result.path = null;
			result.href = result.format();
			return result;
		}
		var last = srcPath.slice(-1)[0];
		var hasTrailingSlash = (result.host || relative.host) && (last === "." || last === "..") || last === "";
		var up = 0;
		for (var i$2 = srcPath.length; i$2 >= 0; i$2--) {
			last = srcPath[i$2];
			if (last == ".") srcPath.splice(i$2, 1);
			else if (last === "..") {
				srcPath.splice(i$2, 1);
				up++;
			} else if (up) {
				srcPath.splice(i$2, 1);
				up--;
			}
		}
		if (!mustEndAbs && !removeAllDots) for (; up--;) srcPath.unshift("..");
		if (mustEndAbs && srcPath[0] !== "" && (!srcPath[0] || srcPath[0].charAt(0) !== "/")) srcPath.unshift("");
		if (hasTrailingSlash && srcPath.join("/").substr(-1) !== "/") srcPath.push("");
		var isAbsolute = srcPath[0] === "" || srcPath[0] && srcPath[0].charAt(0) === "/";
		if (psychotic) {
			result.hostname = result.host = isAbsolute ? "" : srcPath.length ? srcPath.shift() : "";
			var authInHost = result.host && result.host.indexOf("@") > 0 ? result.host.split("@") : false;
			if (authInHost) {
				result.auth = authInHost.shift();
				result.host = result.hostname = authInHost.shift();
			}
		}
		mustEndAbs = mustEndAbs || result.host && srcPath.length;
		if (mustEndAbs && !isAbsolute) srcPath.unshift("");
		if (!srcPath.length) {
			result.pathname = null;
			result.path = null;
		} else result.pathname = srcPath.join("/");
		if (!isNull(result.pathname) || !isNull(result.search)) result.path = (result.pathname ? result.pathname : "") + (result.search ? result.search : "");
		result.auth = relative.auth || result.auth;
		result.slashes = result.slashes || relative.slashes;
		result.href = result.format();
		return result;
	};
	Url.prototype.parseHost = function() {
		var host = this.host;
		var port = portPattern.exec(host);
		if (port) {
			port = port[0];
			if (port !== ":") this.port = port.substr(1);
			host = host.substr(0, host.length - port.length);
		}
		if (host) this.hostname = host;
	};
	function isString(arg) {
		return typeof arg === "string";
	}
	function isObject$1(arg) {
		return typeof arg === "object" && arg !== null;
	}
	function isNull(arg) {
		return arg === null;
	}
	function isNullOrUndefined(arg) {
		return arg == null;
	}
}));

//#endregion
//#region node_modules/aws-sdk/lib/realclock/browserClock.js
var require_browserClock = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = { now: function now() {
		if (typeof performance !== "undefined" && typeof performance.now === "function") return performance.now();
		return Date.now();
	} };
}));

//#endregion
//#region node_modules/aws-sdk/lib/event-stream/event-message-chunker.js
var require_event_message_chunker = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Takes in a buffer of event messages and splits them into individual messages.
	* @param {Buffer} buffer
	* @api private
	*/
	function eventMessageChunker$1(buffer) {
		/** @type Buffer[] */
		var messages = [];
		var offset = 0;
		while (offset < buffer.length) {
			var totalLength = buffer.readInt32BE(offset);
			var message = buffer.slice(offset, totalLength + offset);
			offset += totalLength;
			messages.push(message);
		}
		return messages;
	}
	/**
	* @api private
	*/
	module.exports = { eventMessageChunker: eventMessageChunker$1 };
}));

//#endregion
//#region node_modules/aws-sdk/lib/event-stream/int64.js
var require_int64 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var util$3 = require_core().util;
	var toBuffer$1 = util$3.buffer.toBuffer;
	/**
	* A lossless representation of a signed, 64-bit integer. Instances of this
	* class may be used in arithmetic expressions as if they were numeric
	* primitives, but the binary representation will be preserved unchanged as the
	* `bytes` property of the object. The bytes should be encoded as big-endian,
	* two's complement integers.
	* @param {Buffer} bytes
	*
	* @api private
	*/
	function Int64$1(bytes) {
		if (bytes.length !== 8) throw new Error("Int64 buffers must be exactly 8 bytes");
		if (!util$3.Buffer.isBuffer(bytes)) bytes = toBuffer$1(bytes);
		this.bytes = bytes;
	}
	/**
	* @param {number} number
	* @returns {Int64}
	*
	* @api private
	*/
	Int64$1.fromNumber = function(number) {
		if (number > 0x8000000000000000 || number < -0x8000000000000000) throw new Error(number + " is too large (or, if negative, too small) to represent as an Int64");
		var bytes = new Uint8Array(8);
		for (var i$2 = 7, remaining = Math.abs(Math.round(number)); i$2 > -1 && remaining > 0; i$2--, remaining /= 256) bytes[i$2] = remaining;
		if (number < 0) negate(bytes);
		return new Int64$1(bytes);
	};
	/**
	* @returns {number}
	*
	* @api private
	*/
	Int64$1.prototype.valueOf = function() {
		var bytes = this.bytes.slice(0);
		var negative = bytes[0] & 128;
		if (negative) negate(bytes);
		return parseInt(bytes.toString("hex"), 16) * (negative ? -1 : 1);
	};
	Int64$1.prototype.toString = function() {
		return String(this.valueOf());
	};
	/**
	* @param {Buffer} bytes
	*
	* @api private
	*/
	function negate(bytes) {
		for (var i$2 = 0; i$2 < 8; i$2++) bytes[i$2] ^= 255;
		for (var i$2 = 7; i$2 > -1; i$2--) {
			bytes[i$2]++;
			if (bytes[i$2] !== 0) break;
		}
	}
	/**
	* @api private
	*/
	module.exports = { Int64: Int64$1 };
}));

//#endregion
//#region node_modules/aws-sdk/lib/event-stream/split-message.js
var require_split_message = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var util$2 = require_core().util;
	var toBuffer = util$2.buffer.toBuffer;
	var PRELUDE_MEMBER_LENGTH = 4;
	var PRELUDE_LENGTH = PRELUDE_MEMBER_LENGTH * 2;
	var CHECKSUM_LENGTH = 4;
	var MINIMUM_MESSAGE_LENGTH = PRELUDE_LENGTH + CHECKSUM_LENGTH * 2;
	/**
	* @api private
	*
	* @param {Buffer} message
	*/
	function splitMessage$1(message) {
		if (!util$2.Buffer.isBuffer(message)) message = toBuffer(message);
		if (message.length < MINIMUM_MESSAGE_LENGTH) throw new Error("Provided message too short to accommodate event stream message overhead");
		if (message.length !== message.readUInt32BE(0)) throw new Error("Reported message length does not match received message length");
		var expectedPreludeChecksum = message.readUInt32BE(PRELUDE_LENGTH);
		if (expectedPreludeChecksum !== util$2.crypto.crc32(message.slice(0, PRELUDE_LENGTH))) throw new Error("The prelude checksum specified in the message (" + expectedPreludeChecksum + ") does not match the calculated CRC32 checksum.");
		var expectedMessageChecksum = message.readUInt32BE(message.length - CHECKSUM_LENGTH);
		if (expectedMessageChecksum !== util$2.crypto.crc32(message.slice(0, message.length - CHECKSUM_LENGTH))) throw new Error("The message checksum did not match the expected value of " + expectedMessageChecksum);
		var headersStart = PRELUDE_LENGTH + CHECKSUM_LENGTH;
		var headersEnd = headersStart + message.readUInt32BE(PRELUDE_MEMBER_LENGTH);
		return {
			headers: message.slice(headersStart, headersEnd),
			body: message.slice(headersEnd, message.length - CHECKSUM_LENGTH)
		};
	}
	/**
	* @api private
	*/
	module.exports = { splitMessage: splitMessage$1 };
}));

//#endregion
//#region node_modules/aws-sdk/lib/event-stream/parse-message.js
var require_parse_message = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var Int64 = require_int64().Int64;
	var splitMessage = require_split_message().splitMessage;
	var BOOLEAN_TAG = "boolean";
	var BYTE_TAG = "byte";
	var SHORT_TAG = "short";
	var INT_TAG = "integer";
	var LONG_TAG = "long";
	var BINARY_TAG = "binary";
	var STRING_TAG = "string";
	var TIMESTAMP_TAG = "timestamp";
	var UUID_TAG = "uuid";
	/**
	* @api private
	*
	* @param {Buffer} headers
	*/
	function parseHeaders(headers) {
		var out = {};
		var position = 0;
		while (position < headers.length) {
			var nameLength = headers.readUInt8(position++);
			var name = headers.slice(position, position + nameLength).toString();
			position += nameLength;
			switch (headers.readUInt8(position++)) {
				case 0:
					out[name] = {
						type: BOOLEAN_TAG,
						value: true
					};
					break;
				case 1:
					out[name] = {
						type: BOOLEAN_TAG,
						value: false
					};
					break;
				case 2:
					out[name] = {
						type: BYTE_TAG,
						value: headers.readInt8(position++)
					};
					break;
				case 3:
					out[name] = {
						type: SHORT_TAG,
						value: headers.readInt16BE(position)
					};
					position += 2;
					break;
				case 4:
					out[name] = {
						type: INT_TAG,
						value: headers.readInt32BE(position)
					};
					position += 4;
					break;
				case 5:
					out[name] = {
						type: LONG_TAG,
						value: new Int64(headers.slice(position, position + 8))
					};
					position += 8;
					break;
				case 6:
					var binaryLength = headers.readUInt16BE(position);
					position += 2;
					out[name] = {
						type: BINARY_TAG,
						value: headers.slice(position, position + binaryLength)
					};
					position += binaryLength;
					break;
				case 7:
					var stringLength = headers.readUInt16BE(position);
					position += 2;
					out[name] = {
						type: STRING_TAG,
						value: headers.slice(position, position + stringLength).toString()
					};
					position += stringLength;
					break;
				case 8:
					out[name] = {
						type: TIMESTAMP_TAG,
						value: new Date(new Int64(headers.slice(position, position + 8)).valueOf())
					};
					position += 8;
					break;
				case 9:
					var uuidChars = headers.slice(position, position + 16).toString("hex");
					position += 16;
					out[name] = {
						type: UUID_TAG,
						value: uuidChars.substr(0, 8) + "-" + uuidChars.substr(8, 4) + "-" + uuidChars.substr(12, 4) + "-" + uuidChars.substr(16, 4) + "-" + uuidChars.substr(20)
					};
					break;
				default: throw new Error("Unrecognized header type tag");
			}
		}
		return out;
	}
	function parseMessage$1(message) {
		var parsed = splitMessage(message);
		return {
			headers: parseHeaders(parsed.headers),
			body: parsed.body
		};
	}
	/**
	* @api private
	*/
	module.exports = { parseMessage: parseMessage$1 };
}));

//#endregion
//#region node_modules/aws-sdk/lib/event-stream/parse-event.js
var require_parse_event = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var parseMessage = require_parse_message().parseMessage;
	/**
	*
	* @param {*} parser
	* @param {Buffer} message
	* @param {*} shape
	* @api private
	*/
	function parseEvent$1(parser, message, shape) {
		var parsedMessage = parseMessage(message);
		var messageType = parsedMessage.headers[":message-type"];
		if (messageType) {
			if (messageType.value === "error") throw parseError(parsedMessage);
			else if (messageType.value !== "event") return;
		}
		var eventType = parsedMessage.headers[":event-type"];
		var eventModel = shape.members[eventType.value];
		if (!eventModel) return;
		var result = {};
		var eventPayloadMemberName = eventModel.eventPayloadMemberName;
		if (eventPayloadMemberName) {
			var payloadShape = eventModel.members[eventPayloadMemberName];
			if (payloadShape.type === "binary") result[eventPayloadMemberName] = parsedMessage.body;
			else result[eventPayloadMemberName] = parser.parse(parsedMessage.body.toString(), payloadShape);
		}
		var eventHeaderNames = eventModel.eventHeaderMemberNames;
		for (var i$2 = 0; i$2 < eventHeaderNames.length; i$2++) {
			var name = eventHeaderNames[i$2];
			if (parsedMessage.headers[name]) result[name] = eventModel.members[name].toType(parsedMessage.headers[name].value);
		}
		var output = {};
		output[eventType.value] = result;
		return output;
	}
	function parseError(message) {
		var errorCode = message.headers[":error-code"];
		var errorMessage = message.headers[":error-message"];
		var error = new Error(errorMessage.value || errorMessage);
		error.code = error.name = errorCode.value || errorCode;
		return error;
	}
	/**
	* @api private
	*/
	module.exports = { parseEvent: parseEvent$1 };
}));

//#endregion
//#region node_modules/aws-sdk/lib/event-stream/buffered-create-event-stream.js
var require_buffered_create_event_stream = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var eventMessageChunker = require_event_message_chunker().eventMessageChunker;
	var parseEvent = require_parse_event().parseEvent;
	function createEventStream(body, parser, model) {
		var eventMessages = eventMessageChunker(body);
		var events = [];
		for (var i$2 = 0; i$2 < eventMessages.length; i$2++) events.push(parseEvent(parser, eventMessages[i$2], model));
		return events;
	}
	/**
	* @api private
	*/
	module.exports = { createEventStream };
}));

//#endregion
//#region node_modules/aws-sdk/lib/credentials/temporary_credentials.js
var require_temporary_credentials = /* @__PURE__ */ __commonJSMin((() => {
	var AWS$10 = require_core();
	var STS$5 = require_sts();
	/**
	* Represents temporary credentials retrieved from {AWS.STS}. Without any
	* extra parameters, credentials will be fetched from the
	* {AWS.STS.getSessionToken} operation. If an IAM role is provided, the
	* {AWS.STS.assumeRole} operation will be used to fetch credentials for the
	* role instead.
	*
	* @note AWS.TemporaryCredentials is deprecated, but remains available for
	*   backwards compatibility. {AWS.ChainableTemporaryCredentials} is the
	*   preferred class for temporary credentials.
	*
	* To setup temporary credentials, configure a set of master credentials
	* using the standard credentials providers (environment, EC2 instance metadata,
	* or from the filesystem), then set the global credentials to a new
	* temporary credentials object:
	*
	* ```javascript
	* // Note that environment credentials are loaded by default,
	* // the following line is shown for clarity:
	* AWS.config.credentials = new AWS.EnvironmentCredentials('AWS');
	*
	* // Now set temporary credentials seeded from the master credentials
	* AWS.config.credentials = new AWS.TemporaryCredentials();
	*
	* // subsequent requests will now use temporary credentials from AWS STS.
	* new AWS.S3().listBucket(function(err, data) { ... });
	* ```
	*
	* @!attribute masterCredentials
	*   @return [AWS.Credentials] the master (non-temporary) credentials used to
	*     get and refresh temporary credentials from AWS STS.
	* @note (see constructor)
	*/
	AWS$10.TemporaryCredentials = AWS$10.util.inherit(AWS$10.Credentials, {
		constructor: function TemporaryCredentials(params, masterCredentials) {
			AWS$10.Credentials.call(this);
			this.loadMasterCredentials(masterCredentials);
			this.expired = true;
			this.params = params || {};
			if (this.params.RoleArn) this.params.RoleSessionName = this.params.RoleSessionName || "temporary-credentials";
		},
		refresh: function refresh(callback) {
			this.coalesceRefresh(callback || AWS$10.util.fn.callback);
		},
		load: function load(callback) {
			var self = this;
			self.createClients();
			self.masterCredentials.get(function() {
				self.service.config.credentials = self.masterCredentials;
				(self.params.RoleArn ? self.service.assumeRole : self.service.getSessionToken).call(self.service, function(err, data) {
					if (!err) self.service.credentialsFrom(data, self);
					callback(err);
				});
			});
		},
		loadMasterCredentials: function loadMasterCredentials(masterCredentials) {
			this.masterCredentials = masterCredentials || AWS$10.config.credentials;
			while (this.masterCredentials.masterCredentials) this.masterCredentials = this.masterCredentials.masterCredentials;
			if (typeof this.masterCredentials.get !== "function") this.masterCredentials = new AWS$10.Credentials(this.masterCredentials);
		},
		createClients: function() {
			this.service = this.service || new STS$5({ params: this.params });
		}
	});
}));

//#endregion
//#region node_modules/aws-sdk/lib/credentials/chainable_temporary_credentials.js
var require_chainable_temporary_credentials = /* @__PURE__ */ __commonJSMin((() => {
	var AWS$9 = require_core();
	var STS$4 = require_sts();
	/**
	* Represents temporary credentials retrieved from {AWS.STS}. Without any
	* extra parameters, credentials will be fetched from the
	* {AWS.STS.getSessionToken} operation. If an IAM role is provided, the
	* {AWS.STS.assumeRole} operation will be used to fetch credentials for the
	* role instead.
	*
	* AWS.ChainableTemporaryCredentials differs from AWS.TemporaryCredentials in
	* the way masterCredentials and refreshes are handled.
	* AWS.ChainableTemporaryCredentials refreshes expired credentials using the
	* masterCredentials passed by the user to support chaining of STS credentials.
	* However, AWS.TemporaryCredentials recursively collapses the masterCredentials
	* during instantiation, precluding the ability to refresh credentials which
	* require intermediate, temporary credentials.
	*
	* For example, if the application should use RoleA, which must be assumed from
	* RoleB, and the environment provides credentials which can assume RoleB, then
	* AWS.ChainableTemporaryCredentials must be used to support refreshing the
	* temporary credentials for RoleA:
	*
	* ```javascript
	* var roleACreds = new AWS.ChainableTemporaryCredentials({
	*   params: {RoleArn: 'RoleA'},
	*   masterCredentials: new AWS.ChainableTemporaryCredentials({
	*     params: {RoleArn: 'RoleB'},
	*     masterCredentials: new AWS.EnvironmentCredentials('AWS')
	*   })
	* });
	* ```
	*
	* If AWS.TemporaryCredentials had been used in the previous example,
	* `roleACreds` would fail to refresh because `roleACreds` would
	* use the environment credentials for the AssumeRole request.
	*
	* Another difference is that AWS.ChainableTemporaryCredentials creates the STS
	* service instance during instantiation while AWS.TemporaryCredentials creates
	* the STS service instance during the first refresh. Creating the service
	* instance during instantiation effectively captures the master credentials
	* from the global config, so that subsequent changes to the global config do
	* not affect the master credentials used to refresh the temporary credentials.
	*
	* This allows an instance of AWS.ChainableTemporaryCredentials to be assigned
	* to AWS.config.credentials:
	*
	* ```javascript
	* var envCreds = new AWS.EnvironmentCredentials('AWS');
	* AWS.config.credentials = envCreds;
	* // masterCredentials will be envCreds
	* AWS.config.credentials = new AWS.ChainableTemporaryCredentials({
	*   params: {RoleArn: '...'}
	* });
	* ```
	*
	* Similarly, to use the CredentialProviderChain's default providers as the
	* master credentials, simply create a new instance of
	* AWS.ChainableTemporaryCredentials:
	*
	* ```javascript
	* AWS.config.credentials = new ChainableTemporaryCredentials({
	*   params: {RoleArn: '...'}
	* });
	* ```
	*
	* @!attribute service
	*   @return [AWS.STS] the STS service instance used to
	*     get and refresh temporary credentials from AWS STS.
	* @note (see constructor)
	*/
	AWS$9.ChainableTemporaryCredentials = AWS$9.util.inherit(AWS$9.Credentials, {
		constructor: function ChainableTemporaryCredentials(options) {
			AWS$9.Credentials.call(this);
			options = options || {};
			this.errorCode = "ChainableTemporaryCredentialsProviderFailure";
			this.expired = true;
			this.tokenCodeFn = null;
			var params = AWS$9.util.copy(options.params) || {};
			if (params.RoleArn) params.RoleSessionName = params.RoleSessionName || "temporary-credentials";
			if (params.SerialNumber) if (!options.tokenCodeFn || typeof options.tokenCodeFn !== "function") throw new AWS$9.util.error(/* @__PURE__ */ new Error("tokenCodeFn must be a function when params.SerialNumber is given"), { code: this.errorCode });
			else this.tokenCodeFn = options.tokenCodeFn;
			this.service = new STS$4(AWS$9.util.merge({
				params,
				credentials: options.masterCredentials || AWS$9.config.credentials
			}, options.stsConfig || {}));
		},
		refresh: function refresh(callback) {
			this.coalesceRefresh(callback || AWS$9.util.fn.callback);
		},
		load: function load(callback) {
			var self = this;
			var operation = self.service.config.params.RoleArn ? "assumeRole" : "getSessionToken";
			this.getTokenCode(function(err, tokenCode) {
				var params = {};
				if (err) {
					callback(err);
					return;
				}
				if (tokenCode) params.TokenCode = tokenCode;
				self.service[operation](params, function(err$1, data) {
					if (!err$1) self.service.credentialsFrom(data, self);
					callback(err$1);
				});
			});
		},
		getTokenCode: function getTokenCode(callback) {
			var self = this;
			if (this.tokenCodeFn) this.tokenCodeFn(this.service.config.params.SerialNumber, function(err, token) {
				if (err) {
					var message = err;
					if (err instanceof Error) message = err.message;
					callback(AWS$9.util.error(/* @__PURE__ */ new Error("Error fetching MFA token: " + message), { code: self.errorCode }));
					return;
				}
				callback(null, token);
			});
			else callback(null);
		}
	});
}));

//#endregion
//#region node_modules/aws-sdk/lib/credentials/web_identity_credentials.js
var require_web_identity_credentials = /* @__PURE__ */ __commonJSMin((() => {
	var AWS$8 = require_core();
	var STS$3 = require_sts();
	/**
	* Represents credentials retrieved from STS Web Identity Federation support.
	*
	* By default this provider gets credentials using the
	* {AWS.STS.assumeRoleWithWebIdentity} service operation. This operation
	* requires a `RoleArn` containing the ARN of the IAM trust policy for the
	* application for which credentials will be given. In addition, the
	* `WebIdentityToken` must be set to the token provided by the identity
	* provider. See {constructor} for an example on creating a credentials
	* object with proper `RoleArn` and `WebIdentityToken` values.
	*
	* ## Refreshing Credentials from Identity Service
	*
	* In addition to AWS credentials expiring after a given amount of time, the
	* login token from the identity provider will also expire. Once this token
	* expires, it will not be usable to refresh AWS credentials, and another
	* token will be needed. The SDK does not manage refreshing of the token value,
	* but this can be done through a "refresh token" supported by most identity
	* providers. Consult the documentation for the identity provider for refreshing
	* tokens. Once the refreshed token is acquired, you should make sure to update
	* this new token in the credentials object's {params} property. The following
	* code will update the WebIdentityToken, assuming you have retrieved an updated
	* token from the identity provider:
	*
	* ```javascript
	* AWS.config.credentials.params.WebIdentityToken = updatedToken;
	* ```
	*
	* Future calls to `credentials.refresh()` will now use the new token.
	*
	* @!attribute params
	*   @return [map] the map of params passed to
	*     {AWS.STS.assumeRoleWithWebIdentity}. To update the token, set the
	*     `params.WebIdentityToken` property.
	* @!attribute data
	*   @return [map] the raw data response from the call to
	*     {AWS.STS.assumeRoleWithWebIdentity}. Use this if you want to get
	*     access to other properties from the response.
	*/
	AWS$8.WebIdentityCredentials = AWS$8.util.inherit(AWS$8.Credentials, {
		constructor: function WebIdentityCredentials(params, clientConfig) {
			AWS$8.Credentials.call(this);
			this.expired = true;
			this.params = params;
			this.params.RoleSessionName = this.params.RoleSessionName || "web-identity";
			this.data = null;
			this._clientConfig = AWS$8.util.copy(clientConfig || {});
		},
		refresh: function refresh(callback) {
			this.coalesceRefresh(callback || AWS$8.util.fn.callback);
		},
		load: function load(callback) {
			var self = this;
			self.createClients();
			self.service.assumeRoleWithWebIdentity(function(err, data) {
				self.data = null;
				if (!err) {
					self.data = data;
					self.service.credentialsFrom(data, self);
				}
				callback(err);
			});
		},
		createClients: function() {
			if (!this.service) {
				var stsConfig = AWS$8.util.merge({}, this._clientConfig);
				stsConfig.params = this.params;
				this.service = new STS$3(stsConfig);
			}
		}
	});
}));

//#endregion
//#region node_modules/aws-sdk/apis/cognito-identity-2014-06-30.min.json
var require_cognito_identity_2014_06_30_min = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = {
		"version": "2.0",
		"metadata": {
			"apiVersion": "2014-06-30",
			"endpointPrefix": "cognito-identity",
			"jsonVersion": "1.1",
			"protocol": "json",
			"protocols": ["json"],
			"serviceFullName": "Amazon Cognito Identity",
			"serviceId": "Cognito Identity",
			"signatureVersion": "v4",
			"targetPrefix": "AWSCognitoIdentityService",
			"uid": "cognito-identity-2014-06-30",
			"auth": ["aws.auth#sigv4"]
		},
		"operations": {
			"CreateIdentityPool": {
				"input": {
					"type": "structure",
					"required": ["IdentityPoolName", "AllowUnauthenticatedIdentities"],
					"members": {
						"IdentityPoolName": {},
						"AllowUnauthenticatedIdentities": { "type": "boolean" },
						"AllowClassicFlow": { "type": "boolean" },
						"SupportedLoginProviders": { "shape": "S5" },
						"DeveloperProviderName": {},
						"OpenIdConnectProviderARNs": { "shape": "S9" },
						"CognitoIdentityProviders": { "shape": "Sb" },
						"SamlProviderARNs": { "shape": "Sg" },
						"IdentityPoolTags": { "shape": "Sh" }
					}
				},
				"output": { "shape": "Sk" }
			},
			"DeleteIdentities": {
				"input": {
					"type": "structure",
					"required": ["IdentityIdsToDelete"],
					"members": { "IdentityIdsToDelete": {
						"type": "list",
						"member": {}
					} }
				},
				"output": {
					"type": "structure",
					"members": { "UnprocessedIdentityIds": {
						"type": "list",
						"member": {
							"type": "structure",
							"members": {
								"IdentityId": {},
								"ErrorCode": {}
							}
						}
					} }
				}
			},
			"DeleteIdentityPool": { "input": {
				"type": "structure",
				"required": ["IdentityPoolId"],
				"members": { "IdentityPoolId": {} }
			} },
			"DescribeIdentity": {
				"input": {
					"type": "structure",
					"required": ["IdentityId"],
					"members": { "IdentityId": {} }
				},
				"output": { "shape": "Sv" }
			},
			"DescribeIdentityPool": {
				"input": {
					"type": "structure",
					"required": ["IdentityPoolId"],
					"members": { "IdentityPoolId": {} }
				},
				"output": { "shape": "Sk" }
			},
			"GetCredentialsForIdentity": {
				"input": {
					"type": "structure",
					"required": ["IdentityId"],
					"members": {
						"IdentityId": {},
						"Logins": { "shape": "S10" },
						"CustomRoleArn": {}
					}
				},
				"output": {
					"type": "structure",
					"members": {
						"IdentityId": {},
						"Credentials": {
							"type": "structure",
							"members": {
								"AccessKeyId": {},
								"SecretKey": {},
								"SessionToken": {},
								"Expiration": { "type": "timestamp" }
							}
						}
					}
				},
				"authtype": "none",
				"auth": ["smithy.api#noAuth"]
			},
			"GetId": {
				"input": {
					"type": "structure",
					"required": ["IdentityPoolId"],
					"members": {
						"AccountId": {},
						"IdentityPoolId": {},
						"Logins": { "shape": "S10" }
					}
				},
				"output": {
					"type": "structure",
					"members": { "IdentityId": {} }
				},
				"authtype": "none",
				"auth": ["smithy.api#noAuth"]
			},
			"GetIdentityPoolRoles": {
				"input": {
					"type": "structure",
					"required": ["IdentityPoolId"],
					"members": { "IdentityPoolId": {} }
				},
				"output": {
					"type": "structure",
					"members": {
						"IdentityPoolId": {},
						"Roles": { "shape": "S1c" },
						"RoleMappings": { "shape": "S1e" }
					}
				}
			},
			"GetOpenIdToken": {
				"input": {
					"type": "structure",
					"required": ["IdentityId"],
					"members": {
						"IdentityId": {},
						"Logins": { "shape": "S10" }
					}
				},
				"output": {
					"type": "structure",
					"members": {
						"IdentityId": {},
						"Token": {}
					}
				},
				"authtype": "none",
				"auth": ["smithy.api#noAuth"]
			},
			"GetOpenIdTokenForDeveloperIdentity": {
				"input": {
					"type": "structure",
					"required": ["IdentityPoolId", "Logins"],
					"members": {
						"IdentityPoolId": {},
						"IdentityId": {},
						"Logins": { "shape": "S10" },
						"PrincipalTags": { "shape": "S1s" },
						"TokenDuration": { "type": "long" }
					}
				},
				"output": {
					"type": "structure",
					"members": {
						"IdentityId": {},
						"Token": {}
					}
				}
			},
			"GetPrincipalTagAttributeMap": {
				"input": {
					"type": "structure",
					"required": ["IdentityPoolId", "IdentityProviderName"],
					"members": {
						"IdentityPoolId": {},
						"IdentityProviderName": {}
					}
				},
				"output": {
					"type": "structure",
					"members": {
						"IdentityPoolId": {},
						"IdentityProviderName": {},
						"UseDefaults": { "type": "boolean" },
						"PrincipalTags": { "shape": "S1s" }
					}
				}
			},
			"ListIdentities": {
				"input": {
					"type": "structure",
					"required": ["IdentityPoolId", "MaxResults"],
					"members": {
						"IdentityPoolId": {},
						"MaxResults": { "type": "integer" },
						"NextToken": {},
						"HideDisabled": { "type": "boolean" }
					}
				},
				"output": {
					"type": "structure",
					"members": {
						"IdentityPoolId": {},
						"Identities": {
							"type": "list",
							"member": { "shape": "Sv" }
						},
						"NextToken": {}
					}
				}
			},
			"ListIdentityPools": {
				"input": {
					"type": "structure",
					"required": ["MaxResults"],
					"members": {
						"MaxResults": { "type": "integer" },
						"NextToken": {}
					}
				},
				"output": {
					"type": "structure",
					"members": {
						"IdentityPools": {
							"type": "list",
							"member": {
								"type": "structure",
								"members": {
									"IdentityPoolId": {},
									"IdentityPoolName": {}
								}
							}
						},
						"NextToken": {}
					}
				}
			},
			"ListTagsForResource": {
				"input": {
					"type": "structure",
					"required": ["ResourceArn"],
					"members": { "ResourceArn": {} }
				},
				"output": {
					"type": "structure",
					"members": { "Tags": { "shape": "Sh" } }
				}
			},
			"LookupDeveloperIdentity": {
				"input": {
					"type": "structure",
					"required": ["IdentityPoolId"],
					"members": {
						"IdentityPoolId": {},
						"IdentityId": {},
						"DeveloperUserIdentifier": {},
						"MaxResults": { "type": "integer" },
						"NextToken": {}
					}
				},
				"output": {
					"type": "structure",
					"members": {
						"IdentityId": {},
						"DeveloperUserIdentifierList": {
							"type": "list",
							"member": {}
						},
						"NextToken": {}
					}
				}
			},
			"MergeDeveloperIdentities": {
				"input": {
					"type": "structure",
					"required": [
						"SourceUserIdentifier",
						"DestinationUserIdentifier",
						"DeveloperProviderName",
						"IdentityPoolId"
					],
					"members": {
						"SourceUserIdentifier": {},
						"DestinationUserIdentifier": {},
						"DeveloperProviderName": {},
						"IdentityPoolId": {}
					}
				},
				"output": {
					"type": "structure",
					"members": { "IdentityId": {} }
				}
			},
			"SetIdentityPoolRoles": { "input": {
				"type": "structure",
				"required": ["IdentityPoolId", "Roles"],
				"members": {
					"IdentityPoolId": {},
					"Roles": { "shape": "S1c" },
					"RoleMappings": { "shape": "S1e" }
				}
			} },
			"SetPrincipalTagAttributeMap": {
				"input": {
					"type": "structure",
					"required": ["IdentityPoolId", "IdentityProviderName"],
					"members": {
						"IdentityPoolId": {},
						"IdentityProviderName": {},
						"UseDefaults": { "type": "boolean" },
						"PrincipalTags": { "shape": "S1s" }
					}
				},
				"output": {
					"type": "structure",
					"members": {
						"IdentityPoolId": {},
						"IdentityProviderName": {},
						"UseDefaults": { "type": "boolean" },
						"PrincipalTags": { "shape": "S1s" }
					}
				}
			},
			"TagResource": {
				"input": {
					"type": "structure",
					"required": ["ResourceArn", "Tags"],
					"members": {
						"ResourceArn": {},
						"Tags": { "shape": "Sh" }
					}
				},
				"output": {
					"type": "structure",
					"members": {}
				}
			},
			"UnlinkDeveloperIdentity": { "input": {
				"type": "structure",
				"required": [
					"IdentityId",
					"IdentityPoolId",
					"DeveloperProviderName",
					"DeveloperUserIdentifier"
				],
				"members": {
					"IdentityId": {},
					"IdentityPoolId": {},
					"DeveloperProviderName": {},
					"DeveloperUserIdentifier": {}
				}
			} },
			"UnlinkIdentity": {
				"input": {
					"type": "structure",
					"required": [
						"IdentityId",
						"Logins",
						"LoginsToRemove"
					],
					"members": {
						"IdentityId": {},
						"Logins": { "shape": "S10" },
						"LoginsToRemove": { "shape": "Sw" }
					}
				},
				"authtype": "none",
				"auth": ["smithy.api#noAuth"]
			},
			"UntagResource": {
				"input": {
					"type": "structure",
					"required": ["ResourceArn", "TagKeys"],
					"members": {
						"ResourceArn": {},
						"TagKeys": {
							"type": "list",
							"member": {}
						}
					}
				},
				"output": {
					"type": "structure",
					"members": {}
				}
			},
			"UpdateIdentityPool": {
				"input": { "shape": "Sk" },
				"output": { "shape": "Sk" }
			}
		},
		"shapes": {
			"S5": {
				"type": "map",
				"key": {},
				"value": {}
			},
			"S9": {
				"type": "list",
				"member": {}
			},
			"Sb": {
				"type": "list",
				"member": {
					"type": "structure",
					"members": {
						"ProviderName": {},
						"ClientId": {},
						"ServerSideTokenCheck": { "type": "boolean" }
					}
				}
			},
			"Sg": {
				"type": "list",
				"member": {}
			},
			"Sh": {
				"type": "map",
				"key": {},
				"value": {}
			},
			"Sk": {
				"type": "structure",
				"required": [
					"IdentityPoolId",
					"IdentityPoolName",
					"AllowUnauthenticatedIdentities"
				],
				"members": {
					"IdentityPoolId": {},
					"IdentityPoolName": {},
					"AllowUnauthenticatedIdentities": { "type": "boolean" },
					"AllowClassicFlow": { "type": "boolean" },
					"SupportedLoginProviders": { "shape": "S5" },
					"DeveloperProviderName": {},
					"OpenIdConnectProviderARNs": { "shape": "S9" },
					"CognitoIdentityProviders": { "shape": "Sb" },
					"SamlProviderARNs": { "shape": "Sg" },
					"IdentityPoolTags": { "shape": "Sh" }
				}
			},
			"Sv": {
				"type": "structure",
				"members": {
					"IdentityId": {},
					"Logins": { "shape": "Sw" },
					"CreationDate": { "type": "timestamp" },
					"LastModifiedDate": { "type": "timestamp" }
				}
			},
			"Sw": {
				"type": "list",
				"member": {}
			},
			"S10": {
				"type": "map",
				"key": {},
				"value": {}
			},
			"S1c": {
				"type": "map",
				"key": {},
				"value": {}
			},
			"S1e": {
				"type": "map",
				"key": {},
				"value": {
					"type": "structure",
					"required": ["Type"],
					"members": {
						"Type": {},
						"AmbiguousRoleResolution": {},
						"RulesConfiguration": {
							"type": "structure",
							"required": ["Rules"],
							"members": { "Rules": {
								"type": "list",
								"member": {
									"type": "structure",
									"required": [
										"Claim",
										"MatchType",
										"Value",
										"RoleARN"
									],
									"members": {
										"Claim": {},
										"MatchType": {},
										"Value": {},
										"RoleARN": {}
									}
								}
							} }
						}
					}
				}
			},
			"S1s": {
				"type": "map",
				"key": {},
				"value": {}
			}
		}
	};
}));

//#endregion
//#region node_modules/aws-sdk/apis/cognito-identity-2014-06-30.paginators.json
var require_cognito_identity_2014_06_30_paginators = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = { "pagination": { "ListIdentityPools": {
		"input_token": "NextToken",
		"limit_key": "MaxResults",
		"output_token": "NextToken",
		"result_key": "IdentityPools"
	} } };
}));

//#endregion
//#region node_modules/aws-sdk/clients/cognitoidentity.js
var require_cognitoidentity = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	require_browser_loader();
	var AWS$7 = require_core();
	var Service$1 = AWS$7.Service;
	var apiLoader$1 = AWS$7.apiLoader;
	apiLoader$1.services["cognitoidentity"] = {};
	AWS$7.CognitoIdentity = Service$1.defineService("cognitoidentity", ["2014-06-30"]);
	Object.defineProperty(apiLoader$1.services["cognitoidentity"], "2014-06-30", {
		get: function get() {
			var model = require_cognito_identity_2014_06_30_min();
			model.paginators = require_cognito_identity_2014_06_30_paginators().pagination;
			return model;
		},
		enumerable: true,
		configurable: true
	});
	module.exports = AWS$7.CognitoIdentity;
}));

//#endregion
//#region node_modules/aws-sdk/lib/credentials/cognito_identity_credentials.js
var require_cognito_identity_credentials = /* @__PURE__ */ __commonJSMin((() => {
	var AWS$6 = require_core();
	var CognitoIdentity = require_cognitoidentity();
	var STS$2 = require_sts();
	/**
	* Represents credentials retrieved from STS Web Identity Federation using
	* the Amazon Cognito Identity service.
	*
	* By default this provider gets credentials using the
	* {AWS.CognitoIdentity.getCredentialsForIdentity} service operation, which
	* requires either an `IdentityId` or an `IdentityPoolId` (Amazon Cognito
	* Identity Pool ID), which is used to call {AWS.CognitoIdentity.getId} to
	* obtain an `IdentityId`. If the identity or identity pool is not configured in
	* the Amazon Cognito Console to use IAM roles with the appropriate permissions,
	* then additionally a `RoleArn` is required containing the ARN of the IAM trust
	* policy for the Amazon Cognito role that the user will log into. If a `RoleArn`
	* is provided, then this provider gets credentials using the
	* {AWS.STS.assumeRoleWithWebIdentity} service operation, after first getting an
	* Open ID token from {AWS.CognitoIdentity.getOpenIdToken}.
	*
	* In addition, if this credential provider is used to provide authenticated
	* login, the `Logins` map may be set to the tokens provided by the respective
	* identity providers. See {constructor} for an example on creating a credentials
	* object with proper property values.
	*
	* DISCLAIMER: This convenience method leverages the Enhanced (simplified) Authflow. The underlying
	* implementation calls Cognito's `getId()` and `GetCredentialsForIdentity()`.
	* In this flow there is no way to explicitly set a session policy, resulting in
	* STS attaching the default policy and limiting the permissions of the federated role.
	* To be able to explicitly set a session policy, do not use this convenience method.
	* Instead, you can use the Cognito client to call `getId()`, `GetOpenIdToken()` and then use
	* that token with your desired session policy to call STS's `AssumeRoleWithWebIdentity()`
	* For further reading refer to: https://docs.aws.amazon.com/cognito/latest/developerguide/authentication-flow.html
	*
	* ## Refreshing Credentials from Identity Service
	*
	* In addition to AWS credentials expiring after a given amount of time, the
	* login token from the identity provider will also expire. Once this token
	* expires, it will not be usable to refresh AWS credentials, and another
	* token will be needed. The SDK does not manage refreshing of the token value,
	* but this can be done through a "refresh token" supported by most identity
	* providers. Consult the documentation for the identity provider for refreshing
	* tokens. Once the refreshed token is acquired, you should make sure to update
	* this new token in the credentials object's {params} property. The following
	* code will update the WebIdentityToken, assuming you have retrieved an updated
	* token from the identity provider:
	*
	* ```javascript
	* AWS.config.credentials.params.Logins['graph.facebook.com'] = updatedToken;
	* ```
	*
	* Future calls to `credentials.refresh()` will now use the new token.
	*
	* @!attribute params
	*   @return [map] the map of params passed to
	*     {AWS.CognitoIdentity.getId},
	*     {AWS.CognitoIdentity.getOpenIdToken}, and
	*     {AWS.STS.assumeRoleWithWebIdentity}. To update the token, set the
	*     `params.WebIdentityToken` property.
	* @!attribute data
	*   @return [map] the raw data response from the call to
	*     {AWS.CognitoIdentity.getCredentialsForIdentity}, or
	*     {AWS.STS.assumeRoleWithWebIdentity}. Use this if you want to get
	*     access to other properties from the response.
	* @!attribute identityId
	*   @return [String] the Cognito ID returned by the last call to
	*     {AWS.CognitoIdentity.getOpenIdToken}. This ID represents the actual
	*     final resolved identity ID from Amazon Cognito.
	*/
	AWS$6.CognitoIdentityCredentials = AWS$6.util.inherit(AWS$6.Credentials, {
		localStorageKey: {
			id: "aws.cognito.identity-id.",
			providers: "aws.cognito.identity-providers."
		},
		constructor: function CognitoIdentityCredentials(params, clientConfig) {
			AWS$6.Credentials.call(this);
			this.expired = true;
			this.params = params;
			this.data = null;
			this._identityId = null;
			this._clientConfig = AWS$6.util.copy(clientConfig || {});
			this.loadCachedId();
			var self = this;
			Object.defineProperty(this, "identityId", {
				get: function() {
					self.loadCachedId();
					return self._identityId || self.params.IdentityId;
				},
				set: function(identityId) {
					self._identityId = identityId;
				}
			});
		},
		refresh: function refresh(callback) {
			this.coalesceRefresh(callback || AWS$6.util.fn.callback);
		},
		load: function load(callback) {
			var self = this;
			self.createClients();
			self.data = null;
			self._identityId = null;
			self.getId(function(err) {
				if (!err) if (!self.params.RoleArn) self.getCredentialsForIdentity(callback);
				else self.getCredentialsFromSTS(callback);
				else {
					self.clearIdOnNotAuthorized(err);
					callback(err);
				}
			});
		},
		clearCachedId: function clearCache() {
			this._identityId = null;
			delete this.params.IdentityId;
			var poolId = this.params.IdentityPoolId;
			var loginId = this.params.LoginId || "";
			delete this.storage[this.localStorageKey.id + poolId + loginId];
			delete this.storage[this.localStorageKey.providers + poolId + loginId];
		},
		clearIdOnNotAuthorized: function clearIdOnNotAuthorized(err) {
			var self = this;
			if (err.code == "NotAuthorizedException") self.clearCachedId();
		},
		getId: function getId(callback) {
			var self = this;
			if (typeof self.params.IdentityId === "string") return callback(null, self.params.IdentityId);
			self.cognito.getId(function(err, data) {
				if (!err && data.IdentityId) {
					self.params.IdentityId = data.IdentityId;
					callback(null, data.IdentityId);
				} else callback(err);
			});
		},
		loadCredentials: function loadCredentials(data, credentials) {
			if (!data || !credentials) return;
			credentials.expired = false;
			credentials.accessKeyId = data.Credentials.AccessKeyId;
			credentials.secretAccessKey = data.Credentials.SecretKey;
			credentials.sessionToken = data.Credentials.SessionToken;
			credentials.expireTime = data.Credentials.Expiration;
		},
		getCredentialsForIdentity: function getCredentialsForIdentity(callback) {
			var self = this;
			self.cognito.getCredentialsForIdentity(function(err, data) {
				if (!err) {
					self.cacheId(data);
					self.data = data;
					self.loadCredentials(self.data, self);
				} else self.clearIdOnNotAuthorized(err);
				callback(err);
			});
		},
		getCredentialsFromSTS: function getCredentialsFromSTS(callback) {
			var self = this;
			self.cognito.getOpenIdToken(function(err, data) {
				if (!err) {
					self.cacheId(data);
					self.params.WebIdentityToken = data.Token;
					self.webIdentityCredentials.refresh(function(webErr) {
						if (!webErr) {
							self.data = self.webIdentityCredentials.data;
							self.sts.credentialsFrom(self.data, self);
						}
						callback(webErr);
					});
				} else {
					self.clearIdOnNotAuthorized(err);
					callback(err);
				}
			});
		},
		loadCachedId: function loadCachedId() {
			var self = this;
			if (AWS$6.util.isBrowser() && !self.params.IdentityId) {
				var id = self.getStorage("id");
				if (id && self.params.Logins) {
					var actualProviders = Object.keys(self.params.Logins);
					if ((self.getStorage("providers") || "").split(",").filter(function(n) {
						return actualProviders.indexOf(n) !== -1;
					}).length !== 0) self.params.IdentityId = id;
				} else if (id) self.params.IdentityId = id;
			}
		},
		createClients: function() {
			var clientConfig = this._clientConfig;
			this.webIdentityCredentials = this.webIdentityCredentials || new AWS$6.WebIdentityCredentials(this.params, clientConfig);
			if (!this.cognito) {
				var cognitoConfig = AWS$6.util.merge({}, clientConfig);
				cognitoConfig.params = this.params;
				this.cognito = new CognitoIdentity(cognitoConfig);
			}
			this.sts = this.sts || new STS$2(clientConfig);
		},
		cacheId: function cacheId(data) {
			this._identityId = data.IdentityId;
			this.params.IdentityId = this._identityId;
			if (AWS$6.util.isBrowser()) {
				this.setStorage("id", data.IdentityId);
				if (this.params.Logins) this.setStorage("providers", Object.keys(this.params.Logins).join(","));
			}
		},
		getStorage: function getStorage(key) {
			return this.storage[this.localStorageKey[key] + this.params.IdentityPoolId + (this.params.LoginId || "")];
		},
		setStorage: function setStorage(key, val) {
			try {
				this.storage[this.localStorageKey[key] + this.params.IdentityPoolId + (this.params.LoginId || "")] = val;
			} catch (_) {}
		},
		storage: (function() {
			try {
				var storage = AWS$6.util.isBrowser() && window.localStorage !== null && typeof window.localStorage === "object" ? window.localStorage : {};
				storage["aws.test-storage"] = "foobar";
				delete storage["aws.test-storage"];
				return storage;
			} catch (_) {
				return {};
			}
		})()
	});
}));

//#endregion
//#region node_modules/aws-sdk/lib/credentials/saml_credentials.js
var require_saml_credentials = /* @__PURE__ */ __commonJSMin((() => {
	var AWS$5 = require_core();
	var STS$1 = require_sts();
	/**
	* Represents credentials retrieved from STS SAML support.
	*
	* By default this provider gets credentials using the
	* {AWS.STS.assumeRoleWithSAML} service operation. This operation
	* requires a `RoleArn` containing the ARN of the IAM trust policy for the
	* application for which credentials will be given, as well as a `PrincipalArn`
	* representing the ARN for the SAML identity provider. In addition, the
	* `SAMLAssertion` must be set to the token provided by the identity
	* provider. See {constructor} for an example on creating a credentials
	* object with proper `RoleArn`, `PrincipalArn`, and `SAMLAssertion` values.
	*
	* ## Refreshing Credentials from Identity Service
	*
	* In addition to AWS credentials expiring after a given amount of time, the
	* login token from the identity provider will also expire. Once this token
	* expires, it will not be usable to refresh AWS credentials, and another
	* token will be needed. The SDK does not manage refreshing of the token value,
	* but this can be done through a "refresh token" supported by most identity
	* providers. Consult the documentation for the identity provider for refreshing
	* tokens. Once the refreshed token is acquired, you should make sure to update
	* this new token in the credentials object's {params} property. The following
	* code will update the SAMLAssertion, assuming you have retrieved an updated
	* token from the identity provider:
	*
	* ```javascript
	* AWS.config.credentials.params.SAMLAssertion = updatedToken;
	* ```
	*
	* Future calls to `credentials.refresh()` will now use the new token.
	*
	* @!attribute params
	*   @return [map] the map of params passed to
	*     {AWS.STS.assumeRoleWithSAML}. To update the token, set the
	*     `params.SAMLAssertion` property.
	*/
	AWS$5.SAMLCredentials = AWS$5.util.inherit(AWS$5.Credentials, {
		constructor: function SAMLCredentials(params) {
			AWS$5.Credentials.call(this);
			this.expired = true;
			this.params = params;
		},
		refresh: function refresh(callback) {
			this.coalesceRefresh(callback || AWS$5.util.fn.callback);
		},
		load: function load(callback) {
			var self = this;
			self.createClients();
			self.service.assumeRoleWithSAML(function(err, data) {
				if (!err) self.service.credentialsFrom(data, self);
				callback(err);
			});
		},
		createClients: function() {
			this.service = this.service || new STS$1({ params: this.params });
		}
	});
}));

//#endregion
//#region node_modules/aws-sdk/lib/xml/browser_parser.js
var require_browser_parser = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var util$1 = require_util();
	var Shape = require_shape();
	function DomXmlParser() {}
	DomXmlParser.prototype.parse = function(xml, shape) {
		if (xml.replace(/^\s+/, "") === "") return {};
		var result, error;
		try {
			if (window.DOMParser) {
				try {
					result = new DOMParser().parseFromString(xml, "text/xml");
				} catch (syntaxError) {
					throw util$1.error(/* @__PURE__ */ new Error("Parse error in document"), {
						originalError: syntaxError,
						code: "XMLParserError",
						retryable: true
					});
				}
				if (result.documentElement === null) throw util$1.error(/* @__PURE__ */ new Error("Cannot parse empty document."), {
					code: "XMLParserError",
					retryable: true
				});
				var isError$1 = result.getElementsByTagName("parsererror")[0];
				if (isError$1 && (isError$1.parentNode === result || isError$1.parentNode.nodeName === "body" || isError$1.parentNode.parentNode === result || isError$1.parentNode.parentNode.nodeName === "body")) {
					var errorElement = isError$1.getElementsByTagName("div")[0] || isError$1;
					throw util$1.error(new Error(errorElement.textContent || "Parser error in document"), {
						code: "XMLParserError",
						retryable: true
					});
				}
			} else if (window.ActiveXObject) {
				result = new window.ActiveXObject("Microsoft.XMLDOM");
				result.async = false;
				if (!result.loadXML(xml)) throw util$1.error(/* @__PURE__ */ new Error("Parse error in document"), {
					code: "XMLParserError",
					retryable: true
				});
			} else throw new Error("Cannot load XML parser");
		} catch (e) {
			error = e;
		}
		if (result && result.documentElement && !error) {
			var data = parseXml(result.documentElement, shape);
			var metadata$1 = getElementByTagName(result.documentElement, "ResponseMetadata");
			if (metadata$1) data.ResponseMetadata = parseXml(metadata$1, {});
			return data;
		} else if (error) throw util$1.error(error || /* @__PURE__ */ new Error(), {
			code: "XMLParserError",
			retryable: true
		});
		else return {};
	};
	function getElementByTagName(xml, tag) {
		var elements = xml.getElementsByTagName(tag);
		for (var i$2 = 0, iLen = elements.length; i$2 < iLen; i$2++) if (elements[i$2].parentNode === xml) return elements[i$2];
	}
	function parseXml(xml, shape) {
		if (!shape) shape = {};
		switch (shape.type) {
			case "structure": return parseStructure(xml, shape);
			case "map": return parseMap(xml, shape);
			case "list": return parseList(xml, shape);
			case void 0:
			case null: return parseUnknown(xml);
			default: return parseScalar(xml, shape);
		}
	}
	function parseStructure(xml, shape) {
		var data = {};
		if (xml === null) return data;
		util$1.each(shape.members, function(memberName, memberShape) {
			if (memberShape.isXmlAttribute) {
				if (Object.prototype.hasOwnProperty.call(xml.attributes, memberShape.name)) {
					var value = xml.attributes[memberShape.name].value;
					data[memberName] = parseXml({ textContent: value }, memberShape);
				}
			} else {
				var xmlChild = memberShape.flattened ? xml : getElementByTagName(xml, memberShape.name);
				if (xmlChild) data[memberName] = parseXml(xmlChild, memberShape);
				else if (!memberShape.flattened && memberShape.type === "list" && !shape.api.xmlNoDefaultLists) data[memberName] = memberShape.defaultValue;
			}
		});
		return data;
	}
	function parseMap(xml, shape) {
		var data = {};
		var xmlKey = shape.key.name || "key";
		var xmlValue = shape.value.name || "value";
		var tagName = shape.flattened ? shape.name : "entry";
		var child = xml.firstElementChild;
		while (child) {
			if (child.nodeName === tagName) {
				var key = getElementByTagName(child, xmlKey).textContent;
				data[key] = parseXml(getElementByTagName(child, xmlValue), shape.value);
			}
			child = child.nextElementSibling;
		}
		return data;
	}
	function parseList(xml, shape) {
		var data = [];
		var tagName = shape.flattened ? shape.name : shape.member.name || "member";
		var child = xml.firstElementChild;
		while (child) {
			if (child.nodeName === tagName) data.push(parseXml(child, shape.member));
			child = child.nextElementSibling;
		}
		return data;
	}
	function parseScalar(xml, shape) {
		if (xml.getAttribute) {
			var encoding = xml.getAttribute("encoding");
			if (encoding === "base64") shape = new Shape.create({ type: encoding });
		}
		var text = xml.textContent;
		if (text === "") text = null;
		if (typeof shape.toType === "function") return shape.toType(text);
		else return text;
	}
	function parseUnknown(xml) {
		if (xml === void 0 || xml === null) return "";
		if (!xml.firstElementChild) {
			if (xml.parentNode.parentNode === null) return {};
			if (xml.childNodes.length === 0) return "";
			else return xml.textContent;
		}
		var shape = {
			type: "structure",
			members: {}
		};
		var child = xml.firstElementChild;
		while (child) {
			var tag = child.nodeName;
			if (Object.prototype.hasOwnProperty.call(shape.members, tag)) shape.members[tag].type = "list";
			else shape.members[tag] = { name: tag };
			child = child.nextElementSibling;
		}
		return parseStructure(xml, shape);
	}
	/**
	* @api private
	*/
	module.exports = DomXmlParser;
}));

//#endregion
//#region node_modules/events/events.js
var require_events = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	function EventEmitter$1() {
		this._events = this._events || {};
		this._maxListeners = this._maxListeners || void 0;
	}
	module.exports = EventEmitter$1;
	EventEmitter$1.EventEmitter = EventEmitter$1;
	EventEmitter$1.prototype._events = void 0;
	EventEmitter$1.prototype._maxListeners = void 0;
	EventEmitter$1.defaultMaxListeners = 10;
	EventEmitter$1.prototype.setMaxListeners = function(n) {
		if (!isNumber(n) || n < 0 || isNaN(n)) throw TypeError("n must be a positive number");
		this._maxListeners = n;
		return this;
	};
	EventEmitter$1.prototype.emit = function(type) {
		var er, handler$1, len$1, args, i$2, listeners;
		if (!this._events) this._events = {};
		if (type === "error") {
			if (!this._events.error || isObject(this._events.error) && !this._events.error.length) {
				er = arguments[1];
				if (er instanceof Error) throw er;
				else {
					var err = /* @__PURE__ */ new Error("Uncaught, unspecified \"error\" event. (" + er + ")");
					err.context = er;
					throw err;
				}
			}
		}
		handler$1 = this._events[type];
		if (isUndefined(handler$1)) return false;
		if (isFunction(handler$1)) switch (arguments.length) {
			case 1:
				handler$1.call(this);
				break;
			case 2:
				handler$1.call(this, arguments[1]);
				break;
			case 3:
				handler$1.call(this, arguments[1], arguments[2]);
				break;
			default:
				args = Array.prototype.slice.call(arguments, 1);
				handler$1.apply(this, args);
		}
		else if (isObject(handler$1)) {
			args = Array.prototype.slice.call(arguments, 1);
			listeners = handler$1.slice();
			len$1 = listeners.length;
			for (i$2 = 0; i$2 < len$1; i$2++) listeners[i$2].apply(this, args);
		}
		return true;
	};
	EventEmitter$1.prototype.addListener = function(type, listener) {
		var m;
		if (!isFunction(listener)) throw TypeError("listener must be a function");
		if (!this._events) this._events = {};
		if (this._events.newListener) this.emit("newListener", type, isFunction(listener.listener) ? listener.listener : listener);
		if (!this._events[type]) this._events[type] = listener;
		else if (isObject(this._events[type])) this._events[type].push(listener);
		else this._events[type] = [this._events[type], listener];
		if (isObject(this._events[type]) && !this._events[type].warned) {
			if (!isUndefined(this._maxListeners)) m = this._maxListeners;
			else m = EventEmitter$1.defaultMaxListeners;
			if (m && m > 0 && this._events[type].length > m) {
				this._events[type].warned = true;
				console.error("(node) warning: possible EventEmitter memory leak detected. %d listeners added. Use emitter.setMaxListeners() to increase limit.", this._events[type].length);
				if (typeof console.trace === "function") console.trace();
			}
		}
		return this;
	};
	EventEmitter$1.prototype.on = EventEmitter$1.prototype.addListener;
	EventEmitter$1.prototype.once = function(type, listener) {
		if (!isFunction(listener)) throw TypeError("listener must be a function");
		var fired = false;
		function g$2() {
			this.removeListener(type, g$2);
			if (!fired) {
				fired = true;
				listener.apply(this, arguments);
			}
		}
		g$2.listener = listener;
		this.on(type, g$2);
		return this;
	};
	EventEmitter$1.prototype.removeListener = function(type, listener) {
		var list, position, length, i$2;
		if (!isFunction(listener)) throw TypeError("listener must be a function");
		if (!this._events || !this._events[type]) return this;
		list = this._events[type];
		length = list.length;
		position = -1;
		if (list === listener || isFunction(list.listener) && list.listener === listener) {
			delete this._events[type];
			if (this._events.removeListener) this.emit("removeListener", type, listener);
		} else if (isObject(list)) {
			for (i$2 = length; i$2-- > 0;) if (list[i$2] === listener || list[i$2].listener && list[i$2].listener === listener) {
				position = i$2;
				break;
			}
			if (position < 0) return this;
			if (list.length === 1) {
				list.length = 0;
				delete this._events[type];
			} else list.splice(position, 1);
			if (this._events.removeListener) this.emit("removeListener", type, listener);
		}
		return this;
	};
	EventEmitter$1.prototype.removeAllListeners = function(type) {
		var key, listeners;
		if (!this._events) return this;
		if (!this._events.removeListener) {
			if (arguments.length === 0) this._events = {};
			else if (this._events[type]) delete this._events[type];
			return this;
		}
		if (arguments.length === 0) {
			for (key in this._events) {
				if (key === "removeListener") continue;
				this.removeAllListeners(key);
			}
			this.removeAllListeners("removeListener");
			this._events = {};
			return this;
		}
		listeners = this._events[type];
		if (isFunction(listeners)) this.removeListener(type, listeners);
		else if (listeners) while (listeners.length) this.removeListener(type, listeners[listeners.length - 1]);
		delete this._events[type];
		return this;
	};
	EventEmitter$1.prototype.listeners = function(type) {
		var ret;
		if (!this._events || !this._events[type]) ret = [];
		else if (isFunction(this._events[type])) ret = [this._events[type]];
		else ret = this._events[type].slice();
		return ret;
	};
	EventEmitter$1.prototype.listenerCount = function(type) {
		if (this._events) {
			var evlistener = this._events[type];
			if (isFunction(evlistener)) return 1;
			else if (evlistener) return evlistener.length;
		}
		return 0;
	};
	EventEmitter$1.listenerCount = function(emitter, type) {
		return emitter.listenerCount(type);
	};
	function isFunction(arg) {
		return typeof arg === "function";
	}
	function isNumber(arg) {
		return typeof arg === "number";
	}
	function isObject(arg) {
		return typeof arg === "object" && arg !== null;
	}
	function isUndefined(arg) {
		return arg === void 0;
	}
}));

//#endregion
//#region node_modules/aws-sdk/lib/http/xhr.js
var require_xhr = /* @__PURE__ */ __commonJSMin((() => {
	var AWS$4 = require_core();
	var EventEmitter = require_events().EventEmitter;
	require_http();
	/**
	* @api private
	*/
	AWS$4.XHRClient = AWS$4.util.inherit({
		handleRequest: function handleRequest(httpRequest, httpOptions, callback, errCallback) {
			var self = this;
			var endpoint = httpRequest.endpoint;
			var emitter = new EventEmitter();
			var href = endpoint.protocol + "//" + endpoint.hostname;
			if (endpoint.port !== 80 && endpoint.port !== 443) href += ":" + endpoint.port;
			href += httpRequest.path;
			var xhr = new XMLHttpRequest(), headersEmitted = false;
			httpRequest.stream = xhr;
			xhr.addEventListener("readystatechange", function() {
				try {
					if (xhr.status === 0) return;
				} catch (e) {
					return;
				}
				if (this.readyState >= this.HEADERS_RECEIVED && !headersEmitted) {
					emitter.statusCode = xhr.status;
					emitter.headers = self.parseHeaders(xhr.getAllResponseHeaders());
					emitter.emit("headers", emitter.statusCode, emitter.headers, xhr.statusText);
					headersEmitted = true;
				}
				if (this.readyState === this.DONE) self.finishRequest(xhr, emitter);
			}, false);
			xhr.upload.addEventListener("progress", function(evt) {
				emitter.emit("sendProgress", evt);
			});
			xhr.addEventListener("progress", function(evt) {
				emitter.emit("receiveProgress", evt);
			}, false);
			xhr.addEventListener("timeout", function() {
				errCallback(AWS$4.util.error(/* @__PURE__ */ new Error("Timeout"), { code: "TimeoutError" }));
			}, false);
			xhr.addEventListener("error", function() {
				errCallback(AWS$4.util.error(/* @__PURE__ */ new Error("Network Failure"), { code: "NetworkingError" }));
			}, false);
			xhr.addEventListener("abort", function() {
				errCallback(AWS$4.util.error(/* @__PURE__ */ new Error("Request aborted"), { code: "RequestAbortedError" }));
			}, false);
			callback(emitter);
			xhr.open(httpRequest.method, href, httpOptions.xhrAsync !== false);
			AWS$4.util.each(httpRequest.headers, function(key, value) {
				if (key !== "Content-Length" && key !== "User-Agent" && key !== "Host") xhr.setRequestHeader(key, value);
			});
			if (httpOptions.timeout && httpOptions.xhrAsync !== false) xhr.timeout = httpOptions.timeout;
			if (httpOptions.xhrWithCredentials) xhr.withCredentials = true;
			try {
				xhr.responseType = "arraybuffer";
			} catch (e) {}
			try {
				if (httpRequest.body) xhr.send(httpRequest.body);
				else xhr.send();
			} catch (err) {
				if (httpRequest.body && typeof httpRequest.body.buffer === "object") xhr.send(httpRequest.body.buffer);
				else throw err;
			}
			return emitter;
		},
		parseHeaders: function parseHeaders$1(rawHeaders) {
			var headers = {};
			AWS$4.util.arrayEach(rawHeaders.split(/\r?\n/), function(line) {
				var key = line.split(":", 1)[0];
				var value = line.substring(key.length + 2);
				if (key.length > 0) headers[key.toLowerCase()] = value;
			});
			return headers;
		},
		finishRequest: function finishRequest(xhr, emitter) {
			var buffer;
			if (xhr.responseType === "arraybuffer" && xhr.response) {
				var ab = xhr.response;
				buffer = new AWS$4.util.Buffer(ab.byteLength);
				var view = new Uint8Array(ab);
				for (var i$2 = 0; i$2 < buffer.length; ++i$2) buffer[i$2] = view[i$2];
			}
			try {
				if (!buffer && typeof xhr.responseText === "string") buffer = new AWS$4.util.Buffer(xhr.responseText);
			} catch (e) {}
			if (buffer) emitter.emit("data", buffer);
			emitter.emit("end");
		}
	});
	/**
	* @api private
	*/
	AWS$4.HttpClient.prototype = AWS$4.XHRClient.prototype;
	/**
	* @api private
	*/
	AWS$4.HttpClient.streamsApiVersion = 1;
}));

//#endregion
//#region node_modules/aws-sdk/lib/browser_loader.js
var require_browser_loader = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var util = require_util();
	util.crypto.lib = require_browserCryptoLib();
	util.Buffer = require_buffer().Buffer;
	util.url = require_url();
	util.querystring = require_querystring();
	util.realClock = require_browserClock();
	util.environment = "js";
	util.createEventStream = require_buffered_create_event_stream().createEventStream;
	util.isBrowser = function() {
		return true;
	};
	util.isNode = function() {
		return false;
	};
	var AWS$3 = require_core();
	/**
	* @api private
	*/
	module.exports = AWS$3;
	require_credentials();
	require_credential_provider_chain();
	require_temporary_credentials();
	require_chainable_temporary_credentials();
	require_web_identity_credentials();
	require_cognito_identity_credentials();
	require_saml_credentials();
	AWS$3.XML.Parser = require_browser_parser();
	require_xhr();
}));

//#endregion
//#region node_modules/aws-sdk/lib/config_regional_endpoint.js
var require_config_regional_endpoint = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var AWS$2 = require_core();
	/**
	* @api private
	*/
	function validateRegionalEndpointsFlagValue(configValue, errorOptions) {
		if (typeof configValue !== "string") return void 0;
		else if (["legacy", "regional"].indexOf(configValue.toLowerCase()) >= 0) return configValue.toLowerCase();
		else throw AWS$2.util.error(/* @__PURE__ */ new Error(), errorOptions);
	}
	/**
	* Resolve the configuration value for regional endpoint from difference sources: client
	* config, environmental variable, shared config file. Value can be case-insensitive
	* 'legacy' or 'reginal'.
	* @param originalConfig user-supplied config object to resolve
	* @param options a map of config property names from individual configuration source
	*  - env: name of environmental variable that refers to the config
	*  - sharedConfig: name of shared configuration file property that refers to the config
	*  - clientConfig: name of client configuration property that refers to the config
	*
	* @api private
	*/
	function resolveRegionalEndpointsFlag$1(originalConfig, options) {
		originalConfig = originalConfig || {};
		var resolved;
		if (originalConfig[options.clientConfig]) {
			resolved = validateRegionalEndpointsFlagValue(originalConfig[options.clientConfig], {
				code: "InvalidConfiguration",
				message: "invalid \"" + options.clientConfig + "\" configuration. Expect \"legacy\"  or \"regional\". Got \"" + originalConfig[options.clientConfig] + "\"."
			});
			if (resolved) return resolved;
		}
		if (!AWS$2.util.isNode()) return resolved;
		if (Object.prototype.hasOwnProperty.call(process.env, options.env)) {
			var envFlag = process.env[options.env];
			resolved = validateRegionalEndpointsFlagValue(envFlag, {
				code: "InvalidEnvironmentalVariable",
				message: "invalid " + options.env + " environmental variable. Expect \"legacy\"  or \"regional\". Got \"" + process.env[options.env] + "\"."
			});
			if (resolved) return resolved;
		}
		var profile = {};
		try {
			profile = AWS$2.util.getProfilesFromSharedConfig(AWS$2.util.iniLoader)[process.env.AWS_PROFILE || AWS$2.util.defaultProfile];
		} catch (e) {}
		if (profile && Object.prototype.hasOwnProperty.call(profile, options.sharedConfig)) {
			var fileFlag = profile[options.sharedConfig];
			resolved = validateRegionalEndpointsFlagValue(fileFlag, {
				code: "InvalidConfiguration",
				message: "invalid " + options.sharedConfig + " profile config. Expect \"legacy\"  or \"regional\". Got \"" + profile[options.sharedConfig] + "\"."
			});
			if (resolved) return resolved;
		}
		return resolved;
	}
	module.exports = resolveRegionalEndpointsFlag$1;
}));

//#endregion
//#region node_modules/aws-sdk/lib/services/sts.js
var require_sts$1 = /* @__PURE__ */ __commonJSMin((() => {
	var AWS$1 = require_core();
	var resolveRegionalEndpointsFlag = require_config_regional_endpoint();
	var ENV_REGIONAL_ENDPOINT_ENABLED = "AWS_STS_REGIONAL_ENDPOINTS";
	var CONFIG_REGIONAL_ENDPOINT_ENABLED = "sts_regional_endpoints";
	AWS$1.util.update(AWS$1.STS.prototype, {
		credentialsFrom: function credentialsFrom(data, credentials) {
			if (!data) return null;
			if (!credentials) credentials = new AWS$1.TemporaryCredentials();
			credentials.expired = false;
			credentials.accessKeyId = data.Credentials.AccessKeyId;
			credentials.secretAccessKey = data.Credentials.SecretAccessKey;
			credentials.sessionToken = data.Credentials.SessionToken;
			credentials.expireTime = data.Credentials.Expiration;
			return credentials;
		},
		assumeRoleWithWebIdentity: function assumeRoleWithWebIdentity(params, callback) {
			return this.makeUnauthenticatedRequest("assumeRoleWithWebIdentity", params, callback);
		},
		assumeRoleWithSAML: function assumeRoleWithSAML(params, callback) {
			return this.makeUnauthenticatedRequest("assumeRoleWithSAML", params, callback);
		},
		setupRequestListeners: function setupRequestListeners(request) {
			request.addListener("validate", this.optInRegionalEndpoint, true);
		},
		optInRegionalEndpoint: function optInRegionalEndpoint(req) {
			var service = req.service;
			var config = service.config;
			config.stsRegionalEndpoints = resolveRegionalEndpointsFlag(service._originalConfig, {
				env: ENV_REGIONAL_ENDPOINT_ENABLED,
				sharedConfig: CONFIG_REGIONAL_ENDPOINT_ENABLED,
				clientConfig: "stsRegionalEndpoints"
			});
			if (config.stsRegionalEndpoints === "regional" && service.isGlobalEndpoint) {
				if (!config.region) throw AWS$1.util.error(/* @__PURE__ */ new Error(), {
					code: "ConfigError",
					message: "Missing region in config"
				});
				var insertPoint = config.endpoint.indexOf(".amazonaws.com");
				var regionalEndpoint = config.endpoint.substring(0, insertPoint) + "." + config.region + config.endpoint.substring(insertPoint);
				req.httpRequest.updateEndpoint(regionalEndpoint);
				req.httpRequest.region = config.region;
			}
		}
	});
}));

//#endregion
//#region node_modules/aws-sdk/apis/sts-2011-06-15.min.json
var require_sts_2011_06_15_min = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = {
		"version": "2.0",
		"metadata": {
			"apiVersion": "2011-06-15",
			"endpointPrefix": "sts",
			"globalEndpoint": "sts.amazonaws.com",
			"protocol": "query",
			"serviceAbbreviation": "AWS STS",
			"serviceFullName": "AWS Security Token Service",
			"serviceId": "STS",
			"signatureVersion": "v4",
			"uid": "sts-2011-06-15",
			"xmlNamespace": "https://sts.amazonaws.com/doc/2011-06-15/"
		},
		"operations": {
			"AssumeRole": {
				"input": {
					"type": "structure",
					"required": ["RoleArn", "RoleSessionName"],
					"members": {
						"RoleArn": {},
						"RoleSessionName": {},
						"PolicyArns": { "shape": "S4" },
						"Policy": {},
						"DurationSeconds": { "type": "integer" },
						"Tags": { "shape": "S8" },
						"TransitiveTagKeys": {
							"type": "list",
							"member": {}
						},
						"ExternalId": {},
						"SerialNumber": {},
						"TokenCode": {},
						"SourceIdentity": {},
						"ProvidedContexts": {
							"type": "list",
							"member": {
								"type": "structure",
								"members": {
									"ProviderArn": {},
									"ContextAssertion": {}
								}
							}
						}
					}
				},
				"output": {
					"resultWrapper": "AssumeRoleResult",
					"type": "structure",
					"members": {
						"Credentials": { "shape": "Sl" },
						"AssumedRoleUser": { "shape": "Sq" },
						"PackedPolicySize": { "type": "integer" },
						"SourceIdentity": {}
					}
				}
			},
			"AssumeRoleWithSAML": {
				"input": {
					"type": "structure",
					"required": [
						"RoleArn",
						"PrincipalArn",
						"SAMLAssertion"
					],
					"members": {
						"RoleArn": {},
						"PrincipalArn": {},
						"SAMLAssertion": {
							"type": "string",
							"sensitive": true
						},
						"PolicyArns": { "shape": "S4" },
						"Policy": {},
						"DurationSeconds": { "type": "integer" }
					}
				},
				"output": {
					"resultWrapper": "AssumeRoleWithSAMLResult",
					"type": "structure",
					"members": {
						"Credentials": { "shape": "Sl" },
						"AssumedRoleUser": { "shape": "Sq" },
						"PackedPolicySize": { "type": "integer" },
						"Subject": {},
						"SubjectType": {},
						"Issuer": {},
						"Audience": {},
						"NameQualifier": {},
						"SourceIdentity": {}
					}
				}
			},
			"AssumeRoleWithWebIdentity": {
				"input": {
					"type": "structure",
					"required": [
						"RoleArn",
						"RoleSessionName",
						"WebIdentityToken"
					],
					"members": {
						"RoleArn": {},
						"RoleSessionName": {},
						"WebIdentityToken": {
							"type": "string",
							"sensitive": true
						},
						"ProviderId": {},
						"PolicyArns": { "shape": "S4" },
						"Policy": {},
						"DurationSeconds": { "type": "integer" }
					}
				},
				"output": {
					"resultWrapper": "AssumeRoleWithWebIdentityResult",
					"type": "structure",
					"members": {
						"Credentials": { "shape": "Sl" },
						"SubjectFromWebIdentityToken": {},
						"AssumedRoleUser": { "shape": "Sq" },
						"PackedPolicySize": { "type": "integer" },
						"Provider": {},
						"Audience": {},
						"SourceIdentity": {}
					}
				}
			},
			"DecodeAuthorizationMessage": {
				"input": {
					"type": "structure",
					"required": ["EncodedMessage"],
					"members": { "EncodedMessage": {} }
				},
				"output": {
					"resultWrapper": "DecodeAuthorizationMessageResult",
					"type": "structure",
					"members": { "DecodedMessage": {} }
				}
			},
			"GetAccessKeyInfo": {
				"input": {
					"type": "structure",
					"required": ["AccessKeyId"],
					"members": { "AccessKeyId": {} }
				},
				"output": {
					"resultWrapper": "GetAccessKeyInfoResult",
					"type": "structure",
					"members": { "Account": {} }
				}
			},
			"GetCallerIdentity": {
				"input": {
					"type": "structure",
					"members": {}
				},
				"output": {
					"resultWrapper": "GetCallerIdentityResult",
					"type": "structure",
					"members": {
						"UserId": {},
						"Account": {},
						"Arn": {}
					}
				}
			},
			"GetFederationToken": {
				"input": {
					"type": "structure",
					"required": ["Name"],
					"members": {
						"Name": {},
						"Policy": {},
						"PolicyArns": { "shape": "S4" },
						"DurationSeconds": { "type": "integer" },
						"Tags": { "shape": "S8" }
					}
				},
				"output": {
					"resultWrapper": "GetFederationTokenResult",
					"type": "structure",
					"members": {
						"Credentials": { "shape": "Sl" },
						"FederatedUser": {
							"type": "structure",
							"required": ["FederatedUserId", "Arn"],
							"members": {
								"FederatedUserId": {},
								"Arn": {}
							}
						},
						"PackedPolicySize": { "type": "integer" }
					}
				}
			},
			"GetSessionToken": {
				"input": {
					"type": "structure",
					"members": {
						"DurationSeconds": { "type": "integer" },
						"SerialNumber": {},
						"TokenCode": {}
					}
				},
				"output": {
					"resultWrapper": "GetSessionTokenResult",
					"type": "structure",
					"members": { "Credentials": { "shape": "Sl" } }
				}
			}
		},
		"shapes": {
			"S4": {
				"type": "list",
				"member": {
					"type": "structure",
					"members": { "arn": {} }
				}
			},
			"S8": {
				"type": "list",
				"member": {
					"type": "structure",
					"required": ["Key", "Value"],
					"members": {
						"Key": {},
						"Value": {}
					}
				}
			},
			"Sl": {
				"type": "structure",
				"required": [
					"AccessKeyId",
					"SecretAccessKey",
					"SessionToken",
					"Expiration"
				],
				"members": {
					"AccessKeyId": {},
					"SecretAccessKey": {
						"type": "string",
						"sensitive": true
					},
					"SessionToken": {},
					"Expiration": { "type": "timestamp" }
				}
			},
			"Sq": {
				"type": "structure",
				"required": ["AssumedRoleId", "Arn"],
				"members": {
					"AssumedRoleId": {},
					"Arn": {}
				}
			}
		}
	};
}));

//#endregion
//#region node_modules/aws-sdk/apis/sts-2011-06-15.paginators.json
var require_sts_2011_06_15_paginators = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = { "pagination": {} };
}));

//#endregion
//#region node_modules/aws-sdk/clients/sts.js
var require_sts = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	require_browser_loader();
	var AWS = require_core();
	var Service = AWS.Service;
	var apiLoader = AWS.apiLoader;
	apiLoader.services["sts"] = {};
	AWS.STS = Service.defineService("sts", ["2011-06-15"]);
	require_sts$1();
	Object.defineProperty(apiLoader.services["sts"], "2011-06-15", {
		get: function get() {
			var model = require_sts_2011_06_15_min();
			model.paginators = require_sts_2011_06_15_paginators().pagination;
			return model;
		},
		enumerable: true,
		configurable: true
	});
	module.exports = AWS.STS;
}));

//#endregion
//#region src/utils/__fixtures__/v2/index.mjs
var import_sts = /* @__PURE__ */ __toESM(require_sts(), 1);
const client = new import_sts.default();
const handler = async () => client.getCallerIdentity().promise();

//#endregion
export { handler };