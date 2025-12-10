/**
 * ReviewStep - Review and select scanned menu items
 */

import { Store, RefreshCw, CheckSquare, Square, Utensils } from 'lucide-react';
import type { MenuScanResult, MenuItem } from '../types';
import { MenuItemCard } from './MenuItemCard';
import { getConfidenceColor, getConfidenceBg, formatConfidence } from '../utils';

interface ReviewStepProps {
  imageData: string;
  result: MenuScanResult;
  selectedCount: number;
  onRetry: () => void;
  onToggleItem: (itemId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onUpdateItem: (itemId: string, updates: Partial<MenuItem>) => void;
}

export function ReviewStep({
  imageData,
  result,
  selectedCount,
  onRetry,
  onToggleItem,
  onSelectAll,
  onDeselectAll,
  onUpdateItem,
}: ReviewStepProps): React.ReactElement {
  const hasSelected = selectedCount > 0;
  const allSelected = selectedCount === result.menuItems.length;

  return (
    <div className="divide-y divide-white/[0.04]">
      {/* Image preview with retry */}
      <div className="p-4">
        <div className="flex gap-3">
          {/* Thumbnail */}
          <div className="w-20 h-20 rounded-xl overflow-hidden border border-white/[0.08] flex-shrink-0">
            <img
              src={imageData}
              alt="Scanned menu"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Restaurant info */}
          <div className="flex-1 min-w-0">
            {result.restaurant ? (
              <>
                <div className="flex items-center gap-2">
                  <Store size={14} className="text-teal-400" />
                  <span className="text-sm font-semibold text-text-primary truncate">
                    {result.restaurant.name}
                  </span>
                </div>
                {result.restaurant.cuisine && (
                  <span className="text-xs text-text-muted mt-0.5 block">
                    {result.restaurant.cuisine} cuisine
                  </span>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${getConfidenceBg(result.scanConfidence)} ${getConfidenceColor(result.scanConfidence)}`}
                  >
                    {formatConfidence(result.scanConfidence)} scan accuracy
                  </span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Utensils size={14} className="text-text-muted" />
                <span className="text-sm text-text-muted">Unknown restaurant</span>
              </div>
            )}
          </div>

          {/* Retry button */}
          <button
            onClick={onRetry}
            className="p-2 h-fit rounded-xl bg-white/[0.03] border border-white/[0.06] text-text-muted hover:text-text-primary hover:bg-white/[0.06] transition-all"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Selection controls */}
      <div className="px-4 py-3 flex items-center justify-between bg-white/[0.01]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-text-primary">
            {result.menuItems.length} items found
          </span>
          {hasSelected && (
            <span className="text-xs text-teal-400 font-medium">
              ({selectedCount} selected)
            </span>
          )}
        </div>

        <button
          onClick={allSelected ? onDeselectAll : onSelectAll}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs font-medium text-text-muted hover:text-text-primary hover:bg-white/[0.06] transition-all"
        >
          {allSelected ? (
            <>
              <Square size={12} />
              Deselect All
            </>
          ) : (
            <>
              <CheckSquare size={12} />
              Select All
            </>
          )}
        </button>
      </div>

      {/* Menu items list */}
      <div className="p-4 space-y-2 max-h-[40vh] overflow-y-auto">
        {result.menuItems.length > 0 ? (
          result.menuItems.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onToggle={() => onToggleItem(item.id)}
              onUpdateNutrition={(updates) => onUpdateItem(item.id, updates)}
            />
          ))
        ) : (
          <div className="py-8 text-center">
            <Utensils size={32} className="text-text-muted/40 mx-auto mb-2" />
            <p className="text-sm text-text-muted">No menu items detected</p>
            <button
              onClick={onRetry}
              className="mt-3 text-xs text-teal-400 font-medium hover:underline"
            >
              Try again with a clearer photo
            </button>
          </div>
        )}
      </div>

      {/* Selected items summary */}
      {hasSelected && (
        <div className="p-4 bg-teal-500/[0.05]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">
              Selected Items Total
            </span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Calories', value: result.menuItems.filter(i => i.isSelected).reduce((sum, i) => sum + (i.calories || 0), 0), color: 'text-amber-400' },
              { label: 'Protein', value: result.menuItems.filter(i => i.isSelected).reduce((sum, i) => sum + (i.protein || 0), 0), unit: 'g', color: 'text-rose-400' },
              { label: 'Carbs', value: result.menuItems.filter(i => i.isSelected).reduce((sum, i) => sum + (i.carbs || 0), 0), unit: 'g', color: 'text-amber-400' },
              { label: 'Fat', value: result.menuItems.filter(i => i.isSelected).reduce((sum, i) => sum + (i.fat || 0), 0), unit: 'g', color: 'text-blue-400' },
            ].map(({ label, value, unit, color }) => (
              <div key={label} className="text-center">
                <span className={`text-lg font-bold ${color}`}>
                  {Math.round(value)}{unit || ''}
                </span>
                <span className="text-[9px] text-text-muted block">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
