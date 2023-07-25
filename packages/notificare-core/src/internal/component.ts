export abstract class Component {
  protected constructor(readonly name: string) {}

  abstract configure(): void;

  abstract launch(): Promise<void>;

  abstract unlaunch(): Promise<void>;

  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
  processBroadcast(event: string, data?: unknown): void {}
}
