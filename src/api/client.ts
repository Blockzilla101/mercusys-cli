import axios from "https://deno.land/x/axiod@0.26.2/mod.ts";
import { UserSession } from "./user-session.ts";
import { Wan } from "./wan.ts";
import * as Constants from "./constants.ts";
import { AccessControl } from "./access-control.ts";

interface ApiClientOptions {
    gatewayUrl: string;
    timeout: number;
}

export class ApiClient {
    public session: UserSession;
    public wan: Wan;
    public accessControl: AccessControl;
    public axios: typeof axios;

    constructor(opts: ApiClientOptions) {
        this.axios = axios.create({
            baseURL: opts.gatewayUrl,
            timeout: opts.timeout,
        });

        this.session = new UserSession(this);
        this.wan = new Wan(this);
        this.accessControl = new AccessControl(this);
    }

    public loggedIn(): boolean {
        try {
            this.session.key;
        } catch (_e) {
            return false;
        }
        return true;
    }

    // fixme: use enum for data id
    // fixme: map layer to ids
    public async fetchData(dataId: number, layer = [1, 0, 0]): Promise<string[]> {
        const response = await this.axios.post(`?code=${Constants.HTTP_READ}&asyn=1&id=${encodeURIComponent(this.session.key)}`, `${dataId}|${layer.join(",")}`);
        if (response.status !== 200) throw new Error(`Received code: ${response.status}`, { cause: response });
        return response.data.trim().split(/\r?\n/g).slice(2);
    }

    public async sendCommand(cmd: string): Promise<string> {
        const response = await this.axios.post(`?code=${Constants.HTTP_INSTRUCT}&asyn=0&id=${encodeURIComponent(this.session.key)}`, cmd);
        return response.data.trim().split(/\r?\n/g).join("\n");
    }

    public async sendReboot() {
        await this.fetchData(Constants.HTTP_REBOOT);
    }

    public async updateData(data: string): Promise<void> {
        await this.axios.post(`?code=${Constants.SYN}&asyn=0&id=${encodeURIComponent(this.session.key)}`, data);
    }
}
