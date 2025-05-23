var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export var Rune;
(function (Rune) {
    class Exception extends Error {
        static createByResponse(response) {
            return new Exception(response.sn, response.code, response.message);
        }
        constructor(sn, code, message) {
            super(message);
            this.sn = sn;
            this.code = code;
        }
        toString() {
            return `[${this.code}]: ${this.sn} -> ${this.message}`;
        }
        toResponse() {
            return {
                sn: this.sn,
                code: this.code,
                message: this.message,
                data: null,
            };
        }
    }
    Rune.Exception = Exception;
    class ServiceProvider {
        constructor(sessionProvider) {
            this.services = new Map();
            this.sessionProvider = sessionProvider;
        }
        proceed(req) {
            return __awaiter(this, void 0, void 0, function* () {
                const [session, err] = yield this.sessionProvider(req.sid);
                if (err !== null) {
                    return err.toResponse();
                }
                if (session === null) {
                    return new Exception(req.sn, -1, "SystemError").toResponse();
                }
                const service = this.services.get(`${req.aid}/${req.cmd}`);
                if (!service) {
                    return new Exception(req.sn, -1, "SystemError").toResponse();
                }
                const [serviceResult, serviceErr] = yield service({
                    sn: req.sn, request: req, session: session
                });
                if (serviceErr !== null) {
                    return serviceErr.toResponse();
                }
                return {
                    sn: req.sn,
                    code: 0,
                    message: "SUC",
                    data: serviceResult,
                };
            });
        }
    }
    Rune.ServiceProvider = ServiceProvider;
    function getSerialNumber(uid) {
        return `${uid}-${(new Date().getTime()).toString(36)}-${Math.random().toString(36).substring(2)}`;
    }
    Rune.getSerialNumber = getSerialNumber;
})(Rune || (Rune = {}));
