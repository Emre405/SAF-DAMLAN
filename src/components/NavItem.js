import React from 'react';

const NavItem = ({ icon, text, active, onClick, textClassName = '' }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${active ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
  >
    <span className="w-6 h-6">{icon}</span>
    <span className={`font-semibold text-base ${textClassName}`}>
      {text}
    </span>
  </button>
);

export default NavItem;
