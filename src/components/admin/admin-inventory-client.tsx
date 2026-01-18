'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Package, AlertTriangle, Plus, RefreshCw } from 'lucide-react';
import { Button, Input, Card, Badge, Modal, Select } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { cn } from '@/utils/helpers';

interface InventoryItem {
  id: string;
  menu_item_id: string;
  quantity: number;
  low_stock_threshold: number;
  last_restocked: string | null;
  menu_items?: { name: string };
}

interface MenuItemOption {
  id: string;
  name: string;
}

interface AdminInventoryClientProps {
  inventory: InventoryItem[];
  menuItems: MenuItemOption[];
}

export function AdminInventoryClient({
  inventory: initialInventory,
  menuItems,
}: AdminInventoryClientProps) {
  const t = useTranslations('admin.inventory');
  const supabase = createClient();

  const [inventory, setInventory] = useState(initialInventory);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [newQuantity, setNewQuantity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addMenuItemId, setAddMenuItemId] = useState('');

  const lowStockItems = inventory.filter(
    (item) => item.quantity <= item.low_stock_threshold
  );

  const existingMenuItemIds = inventory.map((i) => i.menu_item_id);
  const availableMenuItems = menuItems.filter(
    (m) => !existingMenuItemIds.includes(m.id)
  );

  const openUpdateModal = (item: any) => {
    setSelectedItem(item);
    setNewQuantity(item.quantity.toString());
    setIsModalOpen(true);
  };

  const updateStock = async () => {
    if (!selectedItem) return;

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('inventory')
        .update({
          quantity: parseInt(newQuantity),
          last_restocked: new Date().toISOString(),
        })
        .eq('id', selectedItem.id);

      if (error) throw error;

      setInventory((prev) =>
        prev.map((item) =>
          item.id === selectedItem.id
            ? {
                ...item,
                quantity: parseInt(newQuantity),
                last_restocked: new Date().toISOString(),
              }
            : item
        )
      );

      toast.success('Stock updated!');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error('Failed to update stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addInventoryItem = async () => {
    if (!addMenuItemId) return;

    setIsSubmitting(true);

    try {
      const { data: newItem, error } = await supabase
        .from('inventory')
        .insert({
          menu_item_id: addMenuItemId,
          quantity: 0,
          low_stock_threshold: 10,
        })
        .select(`
          *,
          menu_items (*)
        `)
        .single();

      if (error) throw error;

      setInventory((prev) => [...prev, newItem]);
      setAddMenuItemId('');
      toast.success('Inventory item added!');
    } catch (error) {
      console.error('Error adding inventory item:', error);
      toast.error('Failed to add inventory item');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Track and manage your inventory
          </p>
        </div>
      </div>

      {/* Low Stock Warning */}
      {lowStockItems.length > 0 && (
        <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
                {t('lowStock')} ({lowStockItems.length})
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                {lowStockItems
                  .map((item) => item.menu_items?.name)
                  .join(', ')}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Add New Item */}
      {availableMenuItems.length > 0 && (
        <Card>
          <h3 className="font-medium text-gray-900 dark:text-white mb-4">
            Add Menu Item to Inventory
          </h3>
          <div className="flex gap-4">
            <Select
              options={[
                { value: '', label: 'Select menu item...' },
                ...availableMenuItems.map((m) => ({
                  value: m.id,
                  label: m.name,
                })),
              ]}
              value={addMenuItemId}
              onChange={(e) => setAddMenuItemId(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={addInventoryItem}
              disabled={!addMenuItemId}
              isLoading={isSubmitting}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Add
            </Button>
          </div>
        </Card>
      )}

      {/* Inventory Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('quantity')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('threshold')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('lastRestocked')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {inventory.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    No inventory items yet
                  </td>
                </tr>
              ) : (
                inventory.map((item) => {
                  const isLowStock = item.quantity <= item.low_stock_threshold;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {item.menu_items?.name || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={cn(
                            'font-bold',
                            isLowStock
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-gray-900 dark:text-white'
                          )}
                        >
                          {item.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                        {item.low_stock_threshold}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant={isLowStock ? 'error' : 'success'}
                          size="sm"
                        >
                          {isLowStock ? 'Low Stock' : 'In Stock'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {item.last_restocked
                          ? new Date(item.last_restocked).toLocaleDateString()
                          : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openUpdateModal(item)}
                          leftIcon={<RefreshCw className="h-4 w-4" />}
                        >
                          {t('updateStock')}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Update Stock Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('updateStock')}
      >
        {selectedItem && (
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              Update stock for{' '}
              <span className="font-medium">
                {selectedItem.menu_items?.name}
              </span>
            </p>

            <Input
              label={t('quantity')}
              type="number"
              min="0"
              value={newQuantity}
              onChange={(e) => setNewQuantity(e.target.value)}
            />

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={updateStock} isLoading={isSubmitting}>
                Update
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
