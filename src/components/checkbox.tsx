import React, { useState } from 'react';

interface CustomCheckboxProps {
  checked: boolean;
  onChange: () => void;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({ checked, onChange }) => {
  const [isChecked, setIsChecked] = useState(checked);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
    onChange();
  };

  return (
    <div className="relative flex items-center justify-center w-5 h-5 border border-gray-300">
      {isChecked && '✓'}
      <input 
        type="checkbox" 
        className="opacity-0 absolute" 
        checked={isChecked} 
        onChange={handleCheckboxChange} 
      />
    </div>
  );
};

export default CustomCheckbox;