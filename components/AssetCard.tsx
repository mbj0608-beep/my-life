
import React from 'react';
import { Asset } from '../types';

interface AssetCardProps {
  asset: Asset;
}

const AssetCard: React.FC<AssetCardProps> = ({ asset }) => {
  const getIcon = () => {
    switch (asset.type) {
      case 'HOUSE': return '🏠';
      case 'CAR': return '🚗';
      default: return '📦';
    }
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-xl">
          {getIcon()}
        </div>
        <div>
          <p className="font-bold text-sm text-gray-800">{asset.name}</p>
          <p className="text-[10px] text-gray-400">估值 ¥{asset.value.toLocaleString()}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-[10px] text-rose-400 font-bold">维护 -¥{asset.upkeep}</p>
      </div>
    </div>
  );
};

export default AssetCard;
