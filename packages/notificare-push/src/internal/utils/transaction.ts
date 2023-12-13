export async function transaction<OriginalValue, ReturnValue>({
  originalValue,
  restoreValue,
  fn,
}: TransactionOptions<OriginalValue, ReturnValue>): Promise<ReturnValue> {
  try {
    return await fn();
  } catch (e) {
    restoreValue(originalValue);
    throw e;
  }
}

export interface TransactionOptions<OriginalValue, ReturnValue> {
  originalValue: OriginalValue;
  restoreValue: (originalValue: OriginalValue) => void;
  fn: () => Promise<ReturnValue>;
}
