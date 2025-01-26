import React from "react";

const FilterInput = ({ onFilter }) => {
  return (
    <div className="flex items-center gap-4">
      <label className="text-sm font-medium text-gray-700">
        Filter by Date:
      </label>
      <input
        type="date"
        className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all"
        onChange={(e) => onFilter(e.target.value)}
      />
    </div>
  );
};

export default FilterInput;
