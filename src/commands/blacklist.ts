import { Command } from "https://deno.land/x/cliffy@v0.25.5/command/mod.ts";
import type { ApiClient } from "../api/client.ts";

export default function (cmd: Command, client: ApiClient) {
    const base = new Command()
        .description("Modify blacklist.")
        .action(() => {
            base.showHelp();
        })
        .command("enable", "Enable the blacklist")
        .action(() => {
            console.log("not implemented");
        })
        .command("disable", "Disable the blacklist")
        .action(() => {
            console.log("not implemented");
        });

    cmd.command("blacklist", base);
}
