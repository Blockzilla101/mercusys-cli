import { ApiClient } from "./client.ts";
import * as Constants from "./constants.ts";

interface Session {
    key?: string;
    authInfo: string[];
    password?: string;
}

function encrypt(str: string, key = "RDpbLfCPsJZ7fiv", largeStr = "yLwVl0zKqws7LgKPRQ84Mdt708T1qQ3Ha7xv3H7NyU84p21BriUWBU43odz3iP4rBL3cD02KZciXTysVXiV8ngg6vL48rPJyAUw0HurW20xqxv9aYb4M9wK1Ae0wlro510qXeU07kV57fQMc8L6aLgMLwygtc0F10a0Dg70TOoouyFhdysuRMO51yY5ZlOZZLEal1h0t9YQW0Ko7oBwmCAHoic4HYbUyVeU3sfQ1xtXcPcf1aT303wAQhv66qzW") {
    let largerStr = key.length < str.length ? str.length : key.length;

    let encrypted = "";

    for (let i = 0; i < largerStr; i++) {
        let a = 187;
        let b = 187;

        if (i >= str.length) {
            b = key.charCodeAt(i);
        } else if (i >= key.length) {
            a = str.charCodeAt(i);
        } else {
            a = str.charCodeAt(i);
            b = key.charCodeAt(i);
        }

        // console.log(`a = ${a} | b = ${b} | xor = ${a ^ b} | res = ${(a ^ b) % largeStr.length}`)
        encrypted += largeStr.charAt((a ^ b) % largeStr.length);
    }

    return encrypted;
}

export class UserSession {
    private session: Session = {
        authInfo: [],
    };

    constructor(public client: ApiClient) {}

    private async updateAuthInfo() {
        try {
            await this.client.axios.post(`?code=${Constants.HTTP_AUTH}&asyn=0`);
        } catch (err) {
            const text = err.response.data.trim().split(/\r?\n/g);
            if (text.length === 0) throw new Error("server did not respond with keys");
            this.session.authInfo[0] = text[1];
            this.session.authInfo[1] = text[2];
            this.session.authInfo[2] = text[3];
            this.session.authInfo[3] = text[4];
        }
    }

    public async login(password: string, encrypted = false) {
        if (this.session.authInfo.length === 0) {
            await this.updateAuthInfo();
        }

        if (!encrypted) password = encrypt(password);

        const key = encrypt(this.session.authInfo[2], password, this.session.authInfo[3]);

        try {
            await this.client.axios.post(`?code=${Constants.HTTP_AUTH}&asyn=0&id=${encodeURIComponent(key)}`);
            this.session.key = key;
            this.session.password = password;
            this.saveSession();
        } catch (err) {
            const data = err.response.data.trim().split(/\r?\n/g);
            if (parseInt(data[0]) !== 0) {
                switch (parseInt(data[1])) {
                    case Constants.HTTP_CLIENT_FULL:
                        throw new Error("Client is full");
                    case Constants.HTTP_CLIENT_LOCK:
                        throw new Error("Locked after many invalid attempts");
                    case Constants.HTTP_CLIENT_TIMEOUT:
                        throw new Error("Timedout, login again");
                    case Constants.HTTP_CLIENT_PSWERR:
                    case Constants.HTTP_CLIENT_PSWIlegal:
                        throw new Error("Invalid Password");
                    case Constants.HTTP_CLIENT_INVALID:
                        throw new Error("Something else went wrong :/");
                    default:
                        throw new Error("Something went very wrong");
                }
            }
        }
    }

    public async reUseLastSession() {
        try {
            await Deno.stat("session.json");
            this.loadSession();
            await this.login(this.session.password!, true);
        } catch (e) {
            throw new Error("no session saved");
        }
    }

    public loadSession() {
        try {
            this.session = JSON.parse(Deno.readTextFileSync("session.json"));
        } catch (e) {
            console.debug("cant read last session file: ", e.stack);
        }
    }

    public saveSession() {
        Deno.writeTextFileSync("session.json", JSON.stringify(this.session, null, 2));
    }

    public get key(): string {
        if (this.session.key == null) throw new Error("Not logged in");
        return this.session.key;
    }
}
