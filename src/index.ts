import { Command } from "https://deno.land/x/cliffy@v0.25.5/command/mod.ts";
import * as path from "https://deno.land/std@0.167.0/path/posix.ts";
import { ApiClient } from "./api/client.ts";
import * as Errors from './api/errors/mod.ts'
import { UserSession } from "./api/user-session.ts";

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

const srcRoot = path.dirname(new URL(import.meta.url).pathname);

const files = Deno.readDirSync(path.join(srcRoot, "commands"));
for (const file of files) {
    if (!file.isFile) continue;
    (await import(path.join(srcRoot, "commands", file.name))).default(cmd, client);
}

try {
    await cmd.parse(Deno.args);
} catch (e) {
    if (e instanceof Errors.UserSessionError) {
        console.log(e.message)
    } else {
        throw e
    }
}
