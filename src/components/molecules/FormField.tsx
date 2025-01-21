import React from 'react';
import Input from '../atoms/Input';
import Label from '../atoms/Label';

interface FormFieldProps {
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FormField: React.FC<FormFieldProps> = ({ label, type, value, onChange }) => {
  return (
    <div>
      <label>{label}</label>
      <Input type={type} value={value} onChange={onChange} />
    </div>
  );
};

export default FormField;
