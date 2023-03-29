import type { ApiClient } from "./client.ts";
import * as Constants from "./constants.ts";

interface NetworkStats {
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

interface EthernetPortStats {
    connected: boolean;
    name: string;
    // mode: string
}

export class Network {
    constructor(public client: ApiClient) {}

    public async networkStats(): Promise<NetworkStats> {
        const raw = await this.client.fetchData(Constants.LINK_STATUS_DATA_ID);
        const data: Record<string, string | number> = {};
        raw.forEach((r) => data[r.split(" ")[0]] = r.split(" ")[1].match(/^[0-9]+$/g) ? parseInt(r.split(" ")[1]) : r.split(" ")[1]);
        data["inRate"] = `${data.inRates as number / 1000} KB/s`;
        data["outRate"] = `${data.outRates as number / 1000} KB/s`;
        Object.keys(data).forEach((d) => d.startsWith("dual") ? delete data[d] : null);

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

    public async connectWan() {
        const resp = await this.client.sendCommand("wan -linkUp");
        // fixme: throw an error based on response code
    }
}
