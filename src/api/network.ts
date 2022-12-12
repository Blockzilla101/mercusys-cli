import type { UserSession } from "./user-session.ts";
import type { ApiClient } from "./client.ts";
import * as Constants from "./constants.ts";

interface PPOEStats {
    ip: string;
    mask: string;
    gateway: string;
    dns: number;
    status: number;
    code: number;
    upTime: number;
    inPkts: number;
    inOctets: number;
    outPkts: number;
    outOctets: number;
    inRate: string;
    outRate: string;
    internetDnsDetect: number;
}

export class Network {
    constructor(public client: ApiClient) {}

    public async PPOEStats(): Promise<PPOEStats> {
        const raw = await this.client.fetchData(Constants.LINK_STATUS_DATA_ID);
        const data: Record<string, string | number> = {};
        raw.forEach((r) => data[r.split(" ")[0]] = r.split(" ")[1].match(/^[0-9]+$/g) ? parseInt(r.split(" ")[1]) : r.split(" ")[1]);
        data["inRate"] = `${data.inRates as number / 1000} KB/s`;
        data["outRate"] = `${data.outRates as number / 1000} KB/s`;
        Object.keys(data).forEach((d) => d.startsWith("dual") ? delete data[d] : null);

        return data as unknown as PPOEStats;
    }

    public async disconnectWan() {
        await this.client.sendCommand("wan -linkDown");
    }

    public async connectWan() {
        const resp = await this.client.sendCommand("wan -linkUp");
        // fixme: throw an error based on response code
    }
}
