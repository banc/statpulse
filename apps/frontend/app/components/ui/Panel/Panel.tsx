import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../../lib/class-name';
import styles from './Panel.module.css';

type PanelProps = HTMLAttributes<HTMLElement> & {
  as?: 'aside' | 'div' | 'section';
  children: ReactNode;
};

export function Panel({ as: Component = 'section', children, className, ...props }: PanelProps) {
  return (
    <Component className={cx(styles.panel, className)} {...props}>
      {children}
    </Component>
  );
}
