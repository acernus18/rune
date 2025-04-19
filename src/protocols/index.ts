import {RequestProtocol, ResponseProtocol} from "@/interfaces";
import {Exception} from "@/exceptions";

export class RequestContext implements RequestProtocol {
    public aid: string;
    public cmd: string;
    public data: any;
    public sid: string;
    public sn: string;

    constructor(sn: string, sid: string, aid: string, cmd: string, data: any) {
        this.aid = aid;
        this.cmd = cmd;
        this.data = data;
        this.sid = sid;
        this.sn = sn;
    }
}

export class ResponseContext implements ResponseProtocol {
    public code: number;
    public data: any;
    public message: string;
    public sn: string;

    constructor(sn: string, code: number, message: string, data: any) {
        this.code = code;
        this.data = data;
        this.message = message;
        this.sn = sn;
    }

    public static success(sn: string, data?: any): ResponseProtocol {
        return new ResponseContext(sn, 0, "SUC", data ?? null);
    }

    public static exception(sn: string, err: Exception): ResponseProtocol {
        return new ResponseContext(sn, err.code, err.toString(), null);
    }

    public static systemError(sn: string): ResponseProtocol {
        return new ResponseContext(sn, -1, "[SystemErr-(-1)]: system error.", null);
    }
}