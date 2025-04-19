import {AsyncResult} from "@/types/index.js";

export interface RequestProtocol {
    sn: string;
    aid: string;
    cmd: string;
    sid: string;
    data: any;
}

export interface ResponseProtocol {
    sn: string;
    code: number;
    message: string;
    data: any;
}

export interface SessionHandler<S> {
    get(sid: string): AsyncResult<S>;

    set(sid: string, value: S, expire: number): AsyncResult<void>;

    del(sid: string): AsyncResult<void>;
}