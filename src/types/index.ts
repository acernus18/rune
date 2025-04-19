import {Exception} from "@/exceptions";
import {RequestProtocol} from "@/interfaces/index.js";

export type Result<T> = [T | null, Exception | null];
export type AsyncResult<T> = Promise<Result<T>>;
export type Service<SESSION, RESULT> = (session: SESSION, request: RequestProtocol) => AsyncResult<RESULT>;