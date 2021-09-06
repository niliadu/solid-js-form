"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useField = exports.Form = void 0;
var react_1 = __importDefault(require("react"));
var solid_js_1 = require("solid-js");
var store_1 = require("solid-js/store");
var Yup = __importStar(require("yup"));
var FormContext = (0, solid_js_1.createContext)({});
function Form(props) {
    var _this = this;
    var touched = Object.keys(props.initialValues).reduce(function (t, f) {
        var _a;
        return (__assign(__assign({}, t), (_a = {}, _a[f] = false, _a)));
    }, {});
    var errors = Object.keys(props.initialValues).reduce(function (e, f) {
        var _a;
        return (__assign(__assign({}, e), (_a = {}, _a[f] = "", _a)));
    }, {});
    var setValue = function (field, value) {
        setForm("values", field, value);
    };
    var setValues = function (values) {
        setForm("values", values);
    };
    var validateForm = function (form) { return __awaiter(_this, void 0, void 0, function () {
        var schema;
        return __generator(this, function (_a) {
            if (!props.validation)
                return [2 /*return*/, {}];
            schema = Yup.object().shape(props.validation);
            return [2 /*return*/, schema
                    .validate(form.values, { abortEarly: false })
                    .then(function () {
                    setForm("isValid", true);
                    return {};
                })
                    .catch(function (errors) {
                    setForm("isValid", false);
                    return errors.inner
                        .filter(function (ve) { return !!ve.path; })
                        .reduce(function (e, ve) {
                        var _a;
                        return (__assign(__assign({}, e), (_a = {}, _a[ve.path] = ve.message, _a)));
                    }, {});
                })];
        });
    }); };
    var validateField = function (field, value) { return __awaiter(_this, void 0, void 0, function () {
        var schema;
        var _a;
        var _b;
        return __generator(this, function (_c) {
            if (!((_b = props.validation) === null || _b === void 0 ? void 0 : _b[field]))
                return [2 /*return*/, ""];
            schema = Yup.object().shape(props.validation);
            return [2 /*return*/, schema
                    .validateAt(field, (_a = {}, _a[field] = value, _a))
                    .then(function () {
                    return "";
                })
                    .catch(function (error) {
                    return error.message || "";
                })];
        });
    }); };
    var handleChange = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var target, field, value, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    target = e.target || e.currentTarget;
                    if (typeof target.name == "undefined") {
                        console.error("Event target does not have an name property", e);
                        return [2 /*return*/];
                    }
                    field = target.name;
                    value = target.value;
                    setForm("values", field, value);
                    setForm("touched", field, true);
                    _a = setForm;
                    _b = ["errors", field];
                    return [4 /*yield*/, validateField(field, value)];
                case 1:
                    _a.apply(void 0, _b.concat([_c.sent()]));
                    return [2 /*return*/];
            }
        });
    }); };
    var handleBlur = handleChange;
    var formHandler = function (element) {
        element.oninput = handleChange;
        element.onblur = handleBlur;
    };
    var _a = (0, store_1.createStore)({
        initialValues: props.initialValues,
        values: props.initialValues,
        touched: touched,
        errors: errors,
        isSubmitting: false,
        isValid: false,
        setValue: setValue,
        setValues: setValues,
        handleChange: handleChange,
        handleBlur: handleBlur,
        formHandler: formHandler,
    }), form = _a[0], setForm = _a[1];
    var onSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var newForm, _a;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    e.preventDefault();
                    newForm = __assign({}, form);
                    newForm.isSubmitting = true;
                    newForm.touched = Object.keys(props.initialValues).reduce(function (t, f) {
                        var _a;
                        return (__assign(__assign({}, t), (_a = {}, _a[f] = true, _a)));
                    }, {});
                    _a = newForm;
                    return [4 /*yield*/, validateForm(newForm)];
                case 1:
                    _a.errors = (_c.sent());
                    newForm.isValid = !Object.keys(newForm.errors).filter(function (field) { return !!newForm.errors[field]; }).length;
                    setForm(function (f) { return (__assign(__assign({}, f), newForm)); });
                    if (!form.isValid) return [3 /*break*/, 3];
                    return [4 /*yield*/, ((_b = props.onSubmit) === null || _b === void 0 ? void 0 : _b.call(props, newForm))];
                case 2:
                    _c.sent();
                    _c.label = 3;
                case 3:
                    setForm("isSubmitting", false);
                    return [2 /*return*/];
            }
        });
    }); };
    return (react_1.default.createElement("form", { onSubmit: onSubmit },
        react_1.default.createElement(FormContext.Provider, { value: form, children: typeof props.children == "function"
                ? props.children(form)
                : props.children })));
}
exports.Form = Form;
function useField(name) {
    var form = (0, solid_js_1.useContext)(FormContext);
    var value = (0, solid_js_1.createMemo)(function () { return form.values[name]; });
    var touched = (0, solid_js_1.createMemo)(function () { return form.touched[name]; });
    var error = (0, solid_js_1.createMemo)(function () {
        return touched() && form.errors[name] ? form.errors[name] : "";
    });
    return { field: { value: value, touched: touched, error: error }, form: form };
}
exports.useField = useField;
//# sourceMappingURL=Form.js.map