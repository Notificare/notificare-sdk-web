export abstract class Component {
  protected constructor(readonly name: string) {}

  abstract launch(): Promise<void>;
}
