import { Command } from "https://deno.land/x/cliffy@v0.25.5/command/mod.ts";
import { ApiClient } from "./api/client.ts";
import * as Errors from "./api/errors/mod.ts";
import commandLoader from "./commands/mod.ts";

export const client = new ApiClient({
    gatewayUrl: "http://192.168.1.1",
    timeout: 1000,
});

await client.session.reUseLastSession();

const cmd = new Command()
    .name("mercusys-cli")
    .version("0.0.1")
    .description("Command line interface for mercusys MW306R.")
    .action(() => {
        cmd.showHelp();
    });

await commandLoader(cmd, client);

try {
    await cmd.parse(Deno.args);
} catch (e) {
    if (e instanceof Errors.UserSessionError) {
        console.log(e.message);
    } else {
        throw e;
    }
}
