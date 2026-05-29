import styles from './AppHeader.module.css';

type View = 'tablet' | 'admin';

type Props = {
  activeView: View;
  onViewChange: (view: View) => void;
};

export function AppHeader({ activeView, onViewChange }: Props) {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <img src="/emi3-logo.png" alt="EMI3" className={styles.logo} />
        <span className={styles.title}>Repair Event</span>
      </div>
      <nav className={styles.toggle}>
        <button
          className={`${styles.toggleBtn} ${activeView === 'tablet' ? styles.active : ''}`}
          onClick={() => onViewChange('tablet')}
        >
          Tablet
        </button>
        <button
          className={`${styles.toggleBtn} ${activeView === 'admin' ? styles.active : ''}`}
          onClick={() => onViewChange('admin')}
        >
          Admin
        </button>
      </nav>
    </header>
  );
}
