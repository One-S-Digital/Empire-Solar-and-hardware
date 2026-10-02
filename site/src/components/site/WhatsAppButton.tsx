import { store } from "@/lib/store";
import styles from "./WhatsAppButton.module.css";

/** Floating chat button, bottom right on every page. Hidden until a WhatsApp number is set. */
export function WhatsAppButton() {
  if (!store.whatsapp) return null;
  const href = `https://wa.me/${store.whatsapp}?text=${encodeURIComponent("Hi Empire Solar & Hardware, ")}`;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={styles.fab} aria-label="Chat with us on WhatsApp">
      <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true" fill="currentColor">
        <path d="M16.04 3C9.4 3 4 8.4 4 15.03c0 2.12.55 4.19 1.6 6.01L4 28l7.1-1.86a12 12 0 0 0 4.94 1.06h.01C22.68 27.2 28 21.8 28 15.17 28 8.5 22.68 3 16.04 3zm0 22.1a10 10 0 0 1-5.1-1.4l-.37-.22-4.21 1.1 1.12-4.1-.24-.38a9.93 9.93 0 0 1-1.52-5.3c0-5.5 4.5-10 10.03-10 5.52 0 10.02 4.5 10.02 10.03 0 5.52-4.5 10.27-9.73 10.27zm5.5-7.5c-.3-.15-1.78-.88-2.06-.98-.27-.1-.47-.15-.67.15-.2.3-.77.98-.94 1.18-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.67-2.08-.17-.3-.02-.46.13-.6.14-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.47 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.23 1.36.2 1.88.12.57-.09 1.78-.73 2.03-1.43.25-.7.25-1.3.17-1.43-.07-.12-.27-.2-.57-.35z" />
      </svg>
    </a>
  );
}
