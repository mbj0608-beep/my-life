
import React from 'react';

interface StatBarProps {
  label: string;
  value: number;
  color: string;
}

const StatBar: React.FC<StatBarProps> = ({ label, value, color }) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-bold text-gray-500 w-8">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ${color}`} 
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }} 
        />
      </div>
      <span className="text-[10px] font-mono text-gray-600 w-6 text-right">{Math.round(value)}</span>
    </div>
  );
};

export default StatBar;
