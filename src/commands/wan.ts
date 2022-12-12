import { Command } from "https://deno.land/x/cliffy@v0.25.5/command/mod.ts";
import type { ApiClient } from "../api/client.ts";

export default function (cmd: Command, client: ApiClient) {
    const base = new Command()
        .description("Connect/Disconnect WAN.")
        .action(() => {
            base.showHelp();
        })
        .command("connect", "Connect to WAN.")
        .action(async () => {
            try {
                await client.network.connectWan();
                console.log("Connecting...");
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
        });

    cmd.command("wan", base);
}
