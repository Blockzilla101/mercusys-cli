import { Command } from "https://deno.land/x/cliffy@v0.25.5/command/mod.ts";
import type { ApiClient } from "../api/client.ts";

export default function (cmd: Command, client: ApiClient) {
    const base = new Command()
        .description("Connect/Disconnect WAN.")
        .action(() => {
            base.showHelp();
        })
        .command("connect", "Connect to WAN.")
        .action(() => {
            console.log("not implemented");
        })
        .command("disconnect", "Disconnect from WAN.")
        .action(() => {
            console.log("not implemented");
        });

    cmd.command("wan", base);
}
