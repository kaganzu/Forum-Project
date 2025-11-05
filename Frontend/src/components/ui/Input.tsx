import { InputHTMLAttributes, forwardRef } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, Props>(function Input(props, ref) {
  return <input ref={ref} className={`input ${props.className ?? ''}`} {...props} />;
});

export default Input;


