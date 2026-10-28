import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, FolderOpen } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface StatisticsProps {
  totalProjects: number;
  activeProjects: number;
  totalRevenue: number;
  totalExpenses: number;
}

export const Statistics: React.FC<StatisticsProps> = ({
  totalProjects,
  activeProjects,
  totalRevenue,
  totalExpenses,
}) => {
  const netProfit = totalRevenue - totalExpenses;

  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {/* Total Projects */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-4 text-white shadow-lg shadow-primary-600/20">
        <div className="flex items-center gap-2 mb-1">
          <FolderOpen className="w-5 h-5 opacity-80" />
          <span className="text-xs font-bold opacity-90">Toplam Proje</span>
        </div>
        <p className="text-3xl font-extrabold">{totalProjects}</p>
        <p className="text-xs opacity-75 font-semibold mt-1">
          {activeProjects} aktif
        </p>
      </div>

      {/* Net Profit */}
      <div className="bg-gradient-to-br from-primary-700 to-primary-800 rounded-2xl p-4 text-white shadow-lg shadow-primary-700/20">
        <div className="flex items-center gap-2 mb-1">
          <DollarSign className="w-5 h-5 opacity-80" />
          <span className="text-xs font-bold opacity-90">Net Kar</span>
        </div>
        <p className="text-2xl font-extrabold">{formatCurrency(netProfit)}</p>
        <div className="flex items-center gap-1 mt-1">
          {netProfit >= 0 ? (
            <TrendingUp className="w-3 h-3 opacity-75" />
          ) : (
            <TrendingDown className="w-3 h-3 opacity-75" />
          )}
          <span className="text-xs opacity-75 font-semibold">
            Bu ay
          </span>
        </div>
      </div>
    </div>
  );
};
