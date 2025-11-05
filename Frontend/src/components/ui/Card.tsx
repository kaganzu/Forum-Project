import { HTMLAttributes } from 'react';

type Props = HTMLAttributes<HTMLDivElement>;

export default function Card({ className = '', ...props }: Props) {
  return <div className={`card ${className}`} {...props} />;
}


