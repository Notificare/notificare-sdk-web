import { useNotificare } from "@/notificare/notificare-context";

export function useNotificareLaunchFlow() {
  const { state, launch, unlaunch } = useNotificare();
  return { state, launch, unlaunch };
}
