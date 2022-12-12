import { Command } from "https://deno.land/x/cliffy@v0.25.5/command/mod.ts";
import type { ApiClient } from "../api/client.ts";

export default function (cmd: Command, client: ApiClient) {
    cmd.command("login", "Save password for logging in to the modem.")
        .arguments("<password:string>")
        .action(async (_, password) => {
            try {
                await client.session.login(password);
                console.log("Logged in!");
            } catch (e) {
                console.log(e.message);
            }
        });
}
