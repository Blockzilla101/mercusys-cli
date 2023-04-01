const commandFiles = Deno.readDirSync("./src/commands/");

const importerTemplate = `
import type { Command } from "https://deno.land/x/cliffy@v0.25.5/command/mod.ts";
import type { ApiClient } from "../api/client.ts";

export default async function (cmd: Command, client: ApiClient) {
%commands%
}
`;

const commands: string[] = [];

for (const command of commandFiles) {
    if (!command.isFile || command.name === "mod.ts") continue;
    commands.push(`    (await import("./${command.name}")).default(cmd, client);`);
}

Deno.writeTextFileSync("./src/commands/mod.ts", importerTemplate.replace("%commands%", commands.join("\n")));
const compiler = Deno.run({
    cmd: ["deno", "compile", "-A", "--output", "mercusys-cli", "src/index.ts"],
    stdout: "piped",
    stderr: "piped",
});

const [status, stdout, stderr] = await Promise.all([
    compiler.status(),
    compiler.output(),
    compiler.stderrOutput(),
]);
compiler.close();

console.log("deno compile exited with", status);
console.log("stdout", new TextDecoder().decode(stdout));
console.log("stderr", new TextDecoder().decode(stderr));
