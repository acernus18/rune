"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var Rune;
(function (Rune) {
    class Exception extends Error {
        constructor(code, name, message) {
            super(message);
            this._code = code;
            this._name = name;
        }
        get code() {
            return this._code;
        }
        get name() {
            return this._name;
        }
        toString() {
            return `[${this._name}-${this._code}]: ${this.message}`;
        }
    }
    Rune.Exception = Exception;
    class RequestContext {
        constructor(sn, sid, aid, cmd, data) {
            this.aid = aid;
            this.cmd = cmd;
            this.data = data;
            this.sid = sid;
            this.sn = sn;
        }
    }
    Rune.RequestContext = RequestContext;
    class ResponseContext {
        constructor(sn, code, message, data) {
            this.code = code;
            this.data = data;
            this.message = message;
            this.sn = sn;
        }
        static success(sn, data) {
            return new Rune.ResponseContext(sn, 0, "SUC", data !== null && data !== void 0 ? data : null);
        }
        static exception(sn, err) {
            return new Rune.ResponseContext(sn, err.code, err.toString(), null);
        }
        static systemError(sn) {
            return new Rune.ResponseContext(sn, -1, "[SystemErr-(-1)]: system error.", null);
        }
    }
    Rune.ResponseContext = ResponseContext;
    class ServicesRouter {
        constructor(sessionProvider) {
            this.sessionProvider = sessionProvider;
            this.serviceProvider = new Map();
        }
        addService(id, cmd, service) {
            let appServices = this.serviceProvider.get(id);
            if (!appServices) {
                appServices = new Map();
            }
            appServices.set(cmd, service);
            this.serviceProvider.set(id, appServices);
        }
        reply(req) {
            return __awaiter(this, void 0, void 0, function* () {
                const [session, err] = yield this.sessionProvider(req.sid);
                if (err !== null) {
                    return ResponseContext.exception(req.sn, err);
                }
                if (session === null) {
                    return ResponseContext.systemError(req.sn);
                }
                const appServices = this.serviceProvider.get(req.aid);
                if (!appServices) {
                    return ResponseContext.systemError(req.sn);
                }
                const service = appServices.get(req.cmd);
                if (!service) {
                    return ResponseContext.systemError(req.sn);
                }
                const [serviceResult, serviceErr] = yield service(session, req);
                if (serviceErr !== null) {
                    return ResponseContext.exception(req.sn, serviceErr);
                }
                return ResponseContext.success(req.sn, serviceResult);
            });
        }
    }
    Rune.ServicesRouter = ServicesRouter;
})(Rune || (Rune = {}));
const handler = new Rune.ServicesRouter(() => new Promise(resolve => resolve([1, null])));
handler.addService("1", "1", (number, any) => {
    return new Promise(resolve => resolve([1, null]));
});
// function Handler(aid: string, cmd: string) {
//     return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
//         console.log(`[${propertyKey}] ${descriptor}`);
//     };
// }
//
// @Handler("2", "2")
// function service(session: number, req: any) {
//     return new Promise(resolve => resolve([1, null]));
// }
(() => __awaiter(void 0, void 0, void 0, function* () {
    const r = yield handler.reply({
        sn: "1", cmd: "1", aid: "1", data: null, sid: "1"
    });
    console.log(r);
}))();
