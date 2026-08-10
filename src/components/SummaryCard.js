import React from 'react';

const SummaryCard = ({ title, value, icon, children, iconColorClass = 'text-gray-600' }) => (
  <div className="bg-white p-3.5 sm:p-5 rounded-xl shadow-sm border flex flex-col justify-between transition-transform hover:scale-[1.02]">
    <div>
      <div className="flex items-center">
        <div className={`p-2 sm:p-3 rounded-full bg-gray-100 mr-2.5 sm:mr-3 shrink-0 ${iconColorClass}`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm text-gray-600 font-semibold truncate leading-tight">{title}</p>
          <p className="text-base sm:text-xl md:text-2xl font-bold text-gray-800 leading-snug mt-0.5">{value}</p>
        </div>
      </div>
    </div>
    {children && (
      <div className="mt-2 border-t pt-1.5 text-xs text-gray-500 space-y-0.5">
        {children}
      </div>
    )}
  </div>
);

export default SummaryCard;
