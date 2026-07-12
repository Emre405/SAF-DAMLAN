import React from 'react';

const SummaryCard = ({ title, value, icon, children, iconColorClass = 'text-gray-600' }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between min-h-[120px] transition-transform hover:scale-105">
    <div>
      <div className="flex items-center">
        <div className={`p-3 rounded-full bg-gray-100 mr-4 text-2xl ${iconColorClass}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-600 font-semibold">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
      </div>
    </div>
    {children && (
      <div className="mt-4 border-t pt-2 text-sm text-gray-500 space-y-1">
        {children}
      </div>
    )}
  </div>
);

export default SummaryCard;
