import { Command } from "https://deno.land/x/cliffy@v0.25.5/command/mod.ts";
import type { ApiClient } from "../api/client.ts";

export default function (cmd: Command, client: ApiClient) {
    const base = new Command()
        .description("Modify access control settings.")
        .action(() => {
            base.showHelp();
        })
        .command("enable", "Enable access control.")
        .action(async () => {
            try {
                await client.accessControl.enable();
                console.log("Access control enabled.");
            } catch (e) {
                console.error(e.stack);
            }
        })
        .command("disable", "Disable access control.")
        .action(async () => {
            try {
                await client.accessControl.disable();
                console.log("Access control disabled.");
            } catch (e) {
                console.error(e.stack);
            }
        });

    cmd.command("blacklist", base);
}
