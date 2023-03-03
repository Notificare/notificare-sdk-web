export abstract class Component {
  protected constructor(readonly name: string) {}

  abstract configure(): void;

  abstract launch(): Promise<void>;

  abstract unlaunch(): Promise<void>;
}
