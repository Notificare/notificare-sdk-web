export function createBackdrop(onClick: OnBackdropClicked): HTMLElement {
  const backdrop = document.createElement('div');
  backdrop.classList.add('notificare__backdrop');

  backdrop.addEventListener('click', (e) => {
    // Check if a child or sibling consumed the event.
    // The event should not be processed when clicking an inner element.
    if (e.defaultPrevented) return;

    onClick();
  });

  return backdrop;
}

export type OnBackdropClicked = () => void;
