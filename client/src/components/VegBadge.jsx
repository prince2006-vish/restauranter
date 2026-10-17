import React from 'react';

const VegBadge = ({ isVeg, size = 'sm' }) => {
  const dimensionClass = size === 'lg' ? 'w-5 h-5 p-0.5' : 'w-4 h-4 p-0.5';
  const dotClass = size === 'lg' ? 'w-2.5 h-2.5' : 'w-2 h-2';

  if (isVeg) {
    return (
      <span
        title="Pure Vegetarian"
        className={`inline-flex items-center justify-center border-2 border-emerald-600 rounded-sm bg-emerald-50 ${dimensionClass}`}
      >
        <span className={`rounded-full bg-emerald-600 ${dotClass}`} />
      </span>
    );
  }

  return (
    <span
      title="Non-Vegetarian"
      className={`inline-flex items-center justify-center border-2 border-rose-600 rounded-sm bg-rose-50 ${dimensionClass}`}
    >
      <span className={`rounded-full bg-rose-600 ${dotClass}`} />
    </span>
  );
};

export default VegBadge;
