import { FormEvent, useState } from 'react';
import { Button } from '../ui';
import styles from './AuthCard.module.css';

type AuthCardProps = {
  isSubmitting: boolean;
  errorMessage?: string;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string) => Promise<void>;
};

export function AuthCard({ isSubmitting, errorMessage, onLogin, onRegister }: AuthCardProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('demo@statpulse.dev');
  const [password, setPassword] = useState('statpulse-demo-password');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (mode === 'login') {
      await onLogin(email, password);
    } else {
      await onRegister(email, password);
    }
  }

  return (
    <section className={styles.card}>
      <div>
        <p className={styles.eyebrow}>Backend connection</p>
        <h2 className={styles.title}>Use real account data</h2>
        <p className={styles.description}>
          Demo data stays available, but signing in enables monitor CRUD, metrics polling, incidents, and alert logs.
        </p>
      </div>

      <div className={styles.tabs} role="tablist" aria-label="Authentication mode">
        <button
          className={mode === 'login' ? styles.activeTab : styles.tab}
          type="button"
          onClick={() => setMode('login')}
        >
          Login
        </button>
        <button
          className={mode === 'register' ? styles.activeTab : styles.tab}
          type="button"
          onClick={() => setMode('register')}
        >
          Register
        </button>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.field}>
          Email
          <input
            className={styles.control}
            type="email"
            value={email}
            autoComplete="email"
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className={styles.field}>
          Password
          <input
            className={styles.control}
            type="password"
            value={password}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {errorMessage ? <p className={styles.error}>{errorMessage}</p> : null}
        <Button className={styles.submitButton} type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Connecting...' : mode === 'login' ? 'Login' : 'Create account'}
        </Button>
      </form>
    </section>
  );
}
