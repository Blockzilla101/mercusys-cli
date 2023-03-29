import { Command } from "https://deno.land/x/cliffy@v0.25.5/command/mod.ts";
import type { ApiClient } from "../api/client.ts";
import { WanConnectStatus } from "../api/network.ts";

export default function (cmd: Command, client: ApiClient) {
    const base = new Command()
        .description("Connect/Disconnect WAN.")
        .action(() => {
            base.showHelp();
        })
        .command("connect", "Connect to WAN.")
        .action(async () => {
            try {
                const status = await client.network.connectWan();
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
                await client.network.disconnectWan();
                console.log("Disconnected.");
            } catch (e) {
                console.error(e.stack);
            }
        }).command("stats", "Disaply WAN netork statistics.")
        .action(async () => {
            const stats = await client.network.networkStats();
            const ports = await client.network.ethernetPorts();
            console.log(stats, ports);
        });

    cmd.command("wan", base);
}
