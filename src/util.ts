import { BasicManipulatorBuilder, FromEvent } from "karabiner.ts";
import { execSync, exec } from "child_process";

/**
 * Execute a shell command synchronously and return the output as a string.
 * Throws an error if the command fails.
 */
export function execShellCommand(command: string): string {
  return execSync(command, { encoding: "utf-8" }).trim();
}

/**
 * Execute a shell command asynchronously and return a promise with the output.
 * Rejects if the command fails.
 */
export function execShellCommandAsync(
  command: string,
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    exec(command, { encoding: "utf-8" }, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
      }
    });
  });
}
