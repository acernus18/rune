import {Exception, Exceptions} from "@/exceptions";
import {RequestProtocol, ResponseProtocol, SessionHandler} from "@/interfaces";
import {RequestContext, ResponseContext} from "@/protocols";
import {AsyncResult, Service} from "@/types";

export namespace Rune {
    export class ServicesRouter<SESSION> {
        private readonly sessionHandler: SessionHandler<SESSION>;
        private readonly serviceProvider: Map<string, Map<string, Service<SESSION, any>>>;

        public constructor(sessionHandler: SessionHandler<SESSION>) {
            this.sessionHandler = sessionHandler;
            this.serviceProvider = new Map<string, Map<string, Service<SESSION, any>>>();
        }

        public addService(id: string, cmd: string, service: Service<SESSION, any>): void {
            let appServices = this.serviceProvider.get(id);
            if (!appServices) {
                appServices = new Map<string, Service<SESSION, any>>();
            }
            appServices.set(cmd, service);
            this.serviceProvider.set(id, appServices);
        }

        public async reply(req: RequestProtocol): Promise<ResponseProtocol> {
            const [session, err] = await this.sessionHandler.get(req.sid);
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
            const [serviceResult, serviceErr] = await service(session, req);
            if (serviceErr !== null) {
                return ResponseContext.exception(req.sn, serviceErr);
            }
            return ResponseContext.success(req.sn, serviceResult);
        }
    }

    export async function request<Req, Res>(url: string, aid: string, cmd: string, data: Req): AsyncResult<Res> {
        const sn = "id" + "-" + (new Date().getTime()).toString(36) + "-" + Math.random().toString(36).substring(2);
        const sid = sessionStorage.getItem("_rune_session_id");
        if (sid === null) {
            return [null, Exceptions.NotLogin];
        }
        const context = new RequestContext(sn, sid, aid, cmd, data);
        try {
            const response = await fetch(url, {method: "POST", body: JSON.stringify(context)});
            if (!response.ok) {
                return [null, Exceptions.NetworkError];
            }
            const result = (await response.json()) as ResponseProtocol;
            if (result.sn !== sn) {
                return [null, Exceptions.SystemError];
            }
            if (result.code !== 0) {
                return [null, new Exception(result.code, result.message)];
            }
            return [result.data as Res, null];
        } catch (e) {
            return [null, Exceptions.SystemError];
        }
    }
}
