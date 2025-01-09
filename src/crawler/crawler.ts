import core from "@actions/core";
import { env } from "@/util/env.ts";
// @ts-types="npm:@types/fs-extra"
import { outputFileSync } from "fs-extra";
import { join, resolve } from "node:path";

export abstract class Crawler {
  public abstract name(): string;

  public isEnabled(): boolean {
    if (env.WHITELIST.length > 0) {
      return env.WHITELIST.includes(this.name());
    }
    if (env.BLACKLIST.length > 0) {
      return !env.BLACKLIST.includes(this.name());
    }
    return true;
  }

  public abstract getFileContent(): Promise<string | undefined>;

  public getFilename(): string {
    return `${this.name()}.yaml`;
  }

  public getOutputFilePath(): string {
    return resolve(this.getRelativeFilePathInRepo());
  }

  public getRelativeFilePathInRepo(): string {
    return join(env.DESTDIR, this.getFilename());
  }

  public async crawl(): Promise<string | undefined> {
    const content = await this.getFileContent().catch(console.error);
    if (content !== undefined) {
      try {
        outputFileSync(this.getOutputFilePath(), content);
        return this.getRelativeFilePathInRepo();
      } catch (error) {
        core.error("Error writing file: " + error);
      }
    }
  }
}
