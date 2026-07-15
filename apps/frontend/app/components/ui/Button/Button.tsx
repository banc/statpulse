import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '../../../lib/class-name';
import styles from './Button.module.css';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
};

export function Button({ children, className, variant = 'secondary', ...props }: ButtonProps) {
  return (
    <button className={cx(styles.button, styles[variant], className)} {...props}>
      {children}
    </button>
  );
}
