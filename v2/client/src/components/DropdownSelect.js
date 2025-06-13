import React from 'react';
import styles from './DropdownSelect.module.css'; // Import its CSS module

// DropdownSelect component - a reusable dropdown for selecting options.
// Props:
// - label: Text label for the dropdown.
// - options: An array of strings for the dropdown options.
// - selectedValue: The currently selected value.
// - onValueChange: Callback function when the selected value changes.
const DropdownSelect = ({ label, options, selectedValue, onValueChange }) => {
  return (
    <div className={styles.selectContainer}>
      <label htmlFor="dropdown-select" className={styles.label}>
        {label}
      </label>
      <select
        id="dropdown-select"
        value={selectedValue}
        onChange={(e) => onValueChange(e.target.value)}
        className={styles.selectField}
      >
        <option value="">-- Select --</option>
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DropdownSelect;