import { Command } from "https://deno.land/x/cliffy@v0.25.5/command/mod.ts";
import type { ApiClient } from "../api/client.ts";

export default function (cmd: Command, client: ApiClient) {
    cmd.command("reboot", "Restart the router.")
        .arguments("<password:string>")
        .action(async () => {
            try {
                await client.sendReboot();
                console.log("Rebooting!");
            } catch (e) {
                console.log(e.message);
            }
        });
}
