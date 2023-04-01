
import type { Command } from "https://deno.land/x/cliffy@v0.25.5/command/mod.ts";
import type { ApiClient } from "../api/client.ts";

export default async function (cmd: Command, client: ApiClient) {
    (await import("./reboot.ts")).default(cmd, client);
    (await import("./blacklist.ts")).default(cmd, client);
    (await import("./wan.ts")).default(cmd, client);
    (await import("./login.ts")).default(cmd, client);
}
