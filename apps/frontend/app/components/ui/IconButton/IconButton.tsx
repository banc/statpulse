import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '../../../lib/class-name';
import styles from './IconButton.module.css';

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function IconButton({ children, className, ...props }: IconButtonProps) {
  return (
    <button className={cx(styles.button, className)} {...props}>
      {children}
    </button>
  );
}
