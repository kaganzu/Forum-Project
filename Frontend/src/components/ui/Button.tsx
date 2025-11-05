import { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost';
};

export default function Button({ className = '', variant = 'ghost', ...props }: Props) {
  const base = 'btn';
  const variantClass = variant === 'primary' ? ' btn-primary' : '';
  return <button className={`${base}${variantClass} ${className}`} {...props} />;
}


