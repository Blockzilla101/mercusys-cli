import { APIError } from "./error.ts";

export class UserSessionError extends APIError {}
export class UserSessionNotLoggedIn extends UserSessionError {
    constructor() {
        super("Login first!");
    }
}

export class UserSessionInvalidPassword extends UserSessionError {
    constructor() {
        super("Invalid password");
    }
}

export class UserSessionLocked extends UserSessionError {
    constructor() {
        super("Locked after many invalid attempts");
    }
}
export class UserSessionServerFull extends UserSessionError {
    constructor() {
        super("Client is full");
    }
}
