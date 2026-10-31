import { StrictMode, useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import Sidebar from '../sidebar/Sidebar';
import styles from '../styles/index.css?inline';

const HOST_ID = 'dealshield-ai-root';

/**
 * Mounts the sidebar inside a Shadow DOM so Gmail's CSS and ours never collide.
 * Returns an unmount function.
 */
export function mountSidebar(observer) {
  document.getElementById(HOST_ID)?.remove();

  const host = document.createElement('div');
  host.id = HOST_ID;
  const shadow = host.attachShadow({ mode: 'open' });

  // Constructed stylesheets avoid inline <style> tags, which Gmail's CSP may block.
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(styles);
  shadow.adoptedStyleSheets = [sheet];

  const container = document.createElement('div');
  shadow.appendChild(container);
  document.body.appendChild(host);

  const root = createRoot(container);
  root.render(
    <StrictMode>
      <SidebarRoot observer={observer} />
    </StrictMode>,
  );

  return () => {
    root.unmount();
    host.remove();
  };
}

function SidebarRoot({ observer }) {
  const thread = useSyncExternalStore(observer.subscribe, observer.getThread);
  return <Sidebar thread={thread} />;
}
