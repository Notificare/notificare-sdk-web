export abstract class Component {
  protected constructor(readonly name: string) {}

  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
  migrate(): void {}

  abstract configure(): void;

  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-empty-function
  async clearStorage(): Promise<void> {}

  abstract launch(): Promise<void>;

  abstract unlaunch(): Promise<void>;

  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-empty-function
  async postLaunch(): Promise<void> {}

  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
  processBroadcast(event: string, data?: unknown): void {}

  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
  async executeCommand(command: string, data?: unknown): Promise<unknown> {
    throw new Error(`The '${this.name}' component does not support commands.`);
  }
}
