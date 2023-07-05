export function createRoot(id: string): HTMLElement {
  const element = document.createElement('div');
  element.id = id;
  element.classList.add('notificare');

  return element;
}
