import React, { useState } from 'react';

interface CustomCheckboxProps {
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({ checked, onChange }) => {
  const [isChecked, setIsChecked] = useState(checked);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(!isChecked);
    onChange(event);
  };

  return (
    <label className="relative flex items-center justify-center w-5 h-5 border border-gray-300 cursor-pointer">
      {isChecked && '✓'}
      <input
        type="checkbox"
        className="opacity-0 absolute pointer-events-none"
        checked={isChecked}
        onChange={handleCheckboxChange}
      />
    </label>
  );
};

export default CustomCheckbox;