import type { ApiClient } from "./client.ts";
import * as Constants from "./constants.ts";

export interface NetworkStats {
    ip: string;
    mask: string;
    gateway: string;
    status: NetworkStatus;
    code: NetworkCode;
    upTime: number;
    inPkts: number;
    outPkts: number;
    inRates: number;
    outRates: number;
}

export enum NetworkCode {
    WanDisconnected = 4,
}

export enum NetworkStatus {
    Disconnected = 0,
    Connceted = 1,
}

export interface EthernetPortStats {
    connected: boolean;
    name: string;
    // mode: string
}

export enum WanConnectStatus {
    Connecting = 0,
    WanDisconnected = 53,
}

export class Network {
    constructor(public client: ApiClient) {}

    public async networkStats(): Promise<NetworkStats> {
        const raw = await this.client.fetchData(Constants.LINK_STATUS_DATA_ID);
        const data: Record<string, string | number> = {};
        raw.forEach((r) => data[r.split(" ")[0]] = r.split(" ")[1].match(/^[0-9]+$/g) ? parseInt(r.split(" ")[1]) : r.split(" ")[1]);

        Object.keys(data).forEach((d) => d == "dns" || d.includes("internet") || d.includes("Oct") || d.startsWith("dual") ? delete data[d] : null);

        return data as unknown as NetworkStats;
    }

    public async ethernetPorts() {
        this.client.sendCommand("main eth");
        const data = await this.client.fetchData(Constants.ETHERNET_INFO_DATA_ID);
        const ethPorts: EthernetPortStats[] = [];
        for (const datum of data) {
            const [key, index, state] = datum.split(" ");
            const parsed: EthernetPortStats = ethPorts[parseInt(index)] ?? {
                connected: false,
                name: "",
            };

            switch (key) {
                case "alive":
                    parsed.connected = state === "1";
                    break;
                case "nameId":
                    if (parseInt(state) <= 3) {
                        parsed.name = `LAN ${parseInt(state) + 1}`;
                    } else {
                        parsed.name = `WAN`;
                    }
                    break;
                    // case "mode":
                    // parsed.mode = parseInt(state);
                    // break;
            }

            ethPorts[parseInt(index)] = parsed;
        }
        return ethPorts;
    }

    public async disconnectWan() {
        await this.client.sendCommand("wan -linkDown");
    }

    public async connectWan(): Promise<WanConnectStatus> {
        return parseInt(await this.client.sendCommand("wan -linkUp"));
    }
}
