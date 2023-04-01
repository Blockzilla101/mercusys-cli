import { Command } from "https://deno.land/x/cliffy@v0.25.5/command/mod.ts";
import type { ApiClient } from "../api/client.ts";
import { WanConnectStatus, WanStatus } from "../api/wan.ts";

export default function (cmd: Command, client: ApiClient) {
    const base = new Command()
        .description("Connect/Disconnect WAN.")
        .action(() => {
            base.showHelp();
        })
        .command("connect", "Connect to WAN.")
        .action(async () => {
            try {
                const status = await client.wan.connect();
                switch (status) {
                    case WanConnectStatus.Connecting:
                        return console.log("Conneting...");
                    case WanConnectStatus.WanDisconnected:
                        return console.log("WAN cable is not connected!");
                    default:
                        console.log("unknown status code", status);
                }
            } catch (e) {
                console.error(e.stack);
            }
        })
        .command("disconnect", "Disconnect from WAN.")
        .action(async () => {
            try {
                await client.wan.disconnect();
                console.log("Disconnected.");
            } catch (e) {
                console.error(e.stack);
            }
        }).command("stats", "Disaply WAN netork statistics.")
        .action(async () => {
            const stats = await client.wan.stats();
            const ports = await client.wan.ethernetPorts();
            console.log("=> Ports:");
            for (const port of ports) {
                console.log(`  - ${port.name}: ${port.connected}`);
            }
            console.log();
            console.log(`=> Wan: ${stats.status == WanStatus.Connceted ? "Connected" : "Disconnected"}`);
            if (stats.status === WanStatus.Connceted) {
                console.log(`  - IP/Gateway/Mask: ${stats.ip} / ${stats.gateway} / ${stats.mask}`);
                console.log(`  - Uptime: ${Math.trunc(stats.upTime / 1000)}s`);
            } else {
                console.log(`  - Code: ${stats.code}`);
            }
            console.log(`  - Packets In/Out: ${stats.inPkts} / ${stats.outPkts}`);
            console.log(`  - Rate In/Out: ${stats.inRates} / ${stats.outRates}`);
        });

    cmd.command("wan", base);
}
