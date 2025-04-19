export class Exception extends Error {
    private readonly _code: number;

    constructor(code: number, message: string) {
        super(message);
        this._code = code;
    }

    get code(): number {
        return this._code;
    }

    toString(): string {
        return `[${this._code}]: ${this.message}`;
    }
}

export class Exceptions {
    public static SystemError = new Exception(-1, "SystemError");
    public static NetworkError = new Exception(-2, "NetworkError");
    public static NotLogin = new Exception(100000, "NotLogin");
}