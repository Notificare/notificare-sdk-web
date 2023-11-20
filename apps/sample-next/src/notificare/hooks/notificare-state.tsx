import { useNotificare } from "@/notificare/notificare-context";

export function useNotificareState() {
  const { state } = useNotificare();
  return state;
}
