import React from 'react';

interface ButtonProps {
  text: string;
  onClick: () => void;
  type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({ text, onClick, type = 'button' }) => {
  return <button type={type} onClick={onClick}>{text}</button>;
};

export default Button;
