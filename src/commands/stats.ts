import { Command } from "https://deno.land/x/cliffy@v0.25.5/command/mod.ts";
import type { ApiClient } from "../api/client.ts";

export default function (cmd: Command, client: ApiClient) {
    cmd.command("stats", "Disaply WAN netork statistics.")
        .action(async () => {
            const stats = await client.network.networkStats();
            const ports = await client.network.ethernetPorts();
            console.log(stats, ports);
        });
}
