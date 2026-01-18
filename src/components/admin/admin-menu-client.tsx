'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ShoppingBag,
  Check,
  X,
} from 'lucide-react';
import { Button, Input, Textarea, Select, Card, Modal, Badge } from '@/components/ui';
import { menuItemFormSchema } from '@/utils/validation';
import { formatCurrency } from '@/utils/helpers';
import { MenuItem } from '@/types';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { z } from 'zod';

interface AdminMenuClientProps {
  menuItems: MenuItem[];
}

type MenuItemFormData = z.infer<typeof menuItemFormSchema>;

const categoryOptions = [
  { value: 'appetizers', label: 'Appetizers' },
  { value: 'main_courses', label: 'Main Courses' },
  { value: 'salads', label: 'Salads' },
  { value: 'soups', label: 'Soups' },
  { value: 'sides', label: 'Sides' },
  { value: 'desserts', label: 'Desserts' },
  { value: 'beverages', label: 'Beverages' },
  { value: 'specials', label: 'Specials' },
];

export function AdminMenuClient({ menuItems: initialItems }: AdminMenuClientProps) {
  const t = useTranslations('admin.menu');
  const supabase = createClient();

  const [items, setItems] = useState(initialItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemFormSchema),
    defaultValues: {
      is_available: true,
      is_vegetarian: false,
      is_vegan: false,
      is_gluten_free: false,
      spice_level: 0,
      preparation_time: 15,
      allergens: [],
    },
  });

  const filteredItems = items.filter((item) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(search) ||
      item.name_de.toLowerCase().includes(search) ||
      item.category.toLowerCase().includes(search)
    );
  });

  const openAddModal = () => {
    setEditingItem(null);
    reset({
      is_available: true,
      is_vegetarian: false,
      is_vegan: false,
      is_gluten_free: false,
      spice_level: 0,
      preparation_time: 15,
      allergens: [],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    reset({
      name: item.name,
      name_de: item.name_de,
      description: item.description,
      description_de: item.description_de,
      price: item.price,
      category: item.category,
      image_url: item.image_url || '',
      is_available: item.is_available,
      is_vegetarian: item.is_vegetarian,
      is_vegan: item.is_vegan,
      is_gluten_free: item.is_gluten_free,
      spice_level: item.spice_level,
      preparation_time: item.preparation_time,
      calories: item.calories || undefined,
      allergens: item.allergens,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: MenuItemFormData) => {
    setIsSubmitting(true);

    try {
      const itemData = {
        ...data,
        image_url: data.image_url || null,
        calories: data.calories || null,
      };

      if (editingItem) {
        const { error } = await supabase
          .from('menu_items')
          .update(itemData)
          .eq('id', editingItem.id);

        if (error) throw error;

        setItems((prev) =>
          prev.map((item) =>
            item.id === editingItem.id
              ? { ...item, ...itemData, spice_level: itemData.spice_level as 0 | 1 | 2 | 3 }
              : item
          )
        );
        toast.success('Menu item updated!');
      } else {
        const { data: newItem, error } = await supabase
          .from('menu_items')
          .insert(itemData)
          .select()
          .single();

        if (error) throw error;

        setItems((prev) => [...prev, newItem as MenuItem]);
        toast.success('Menu item added!');
      }

      setIsModalOpen(false);
      reset();
    } catch (error) {
      console.error('Error saving menu item:', error);
      toast.error('Failed to save menu item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase.from('menu_items').delete().eq('id', id);

      if (error) throw error;

      setItems((prev) => prev.filter((item) => item.id !== id));
      toast.success('Menu item deleted!');
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast.error('Failed to delete menu item');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const toggleAvailability = async (item: MenuItem) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ is_available: !item.is_available })
        .eq('id', item.id);

      if (error) throw error;

      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, is_available: !i.is_available } : i
        )
      );
      toast.success(
        item.is_available ? 'Item marked unavailable' : 'Item marked available'
      );
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error('Failed to update availability');
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
            Manage your menu items
          </p>
        </div>
        <Button onClick={openAddModal} leftIcon={<Plus className="h-4 w-4" />}>
          {t('addItem')}
        </Button>
      </div>

      {/* Search */}
      <Input
        type="search"
        placeholder="Search menu items..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        leftIcon={<Search className="h-5 w-5" />}
      />

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <Card key={item.id} padding="none" className="overflow-hidden">
            <div className="relative aspect-video bg-gray-100 dark:bg-gray-700">
              {item.image_url ? (
                <Image
                  src={item.image_url}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <ShoppingBag className="h-12 w-12" />
                </div>
              )}
              <div className="absolute top-2 right-2">
                <Badge variant={item.is_available ? 'success' : 'error'}>
                  {item.is_available ? 'Available' : 'Unavailable'}
                </Badge>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {item.name_de}
                  </p>
                </div>
                <span className="text-lg font-bold text-orange-500">
                  {formatCurrency(item.price)}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                {item.description}
              </p>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="default" size="sm">
                  {item.category.replace(/_/g, ' ')}
                </Badge>
                {item.is_vegetarian && (
                  <Badge variant="success" size="sm">V</Badge>
                )}
                {item.is_vegan && (
                  <Badge variant="success" size="sm">VG</Badge>
                )}
                {item.is_gluten_free && (
                  <Badge variant="info" size="sm">GF</Badge>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => openEditModal(item)}
                  leftIcon={<Edit className="h-4 w-4" />}
                >
                  Edit
                </Button>
                <Button
                  variant={item.is_available ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => toggleAvailability(item)}
                >
                  {item.is_available ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setDeleteConfirm(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <ShoppingBag className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No menu items found</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? t('editItem') : t('addItem')}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('form.name')}
              error={errors.name?.message}
              {...register('name')}
              required
            />
            <Input
              label={t('form.nameDE')}
              error={errors.name_de?.message}
              {...register('name_de')}
              required
            />
          </div>

          <Textarea
            label={t('form.description')}
            error={errors.description?.message}
            {...register('description')}
            required
          />

          <Textarea
            label={t('form.descriptionDE')}
            error={errors.description_de?.message}
            {...register('description_de')}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label={t('form.price')}
              type="number"
              step="0.01"
              error={errors.price?.message}
              {...register('price', { valueAsNumber: true })}
              required
            />
            <Select
              label={t('form.category')}
              options={categoryOptions}
              error={errors.category?.message}
              {...register('category')}
              required
            />
            <Input
              label={t('form.prepTime')}
              type="number"
              error={errors.preparation_time?.message}
              {...register('preparation_time', { valueAsNumber: true })}
              required
            />
          </div>

          <Input
            label={t('form.image')}
            type="url"
            placeholder="https://..."
            error={errors.image_url?.message}
            {...register('image_url')}
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                {...register('is_available')}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t('form.available')}
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                {...register('is_vegetarian')}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t('form.vegetarian')}
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                {...register('is_vegan')}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t('form.vegan')}
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                {...register('is_gluten_free')}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t('form.glutenFree')}
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label={t('form.spiceLevel')}
              options={[
                { value: '0', label: 'Mild (0)' },
                { value: '1', label: 'Low (1)' },
                { value: '2', label: 'Medium (2)' },
                { value: '3', label: 'Hot (3)' },
              ]}
              {...register('spice_level', { valueAsNumber: true })}
            />
            <Input
              label={t('form.calories')}
              type="number"
              {...register('calories', { valueAsNumber: true })}
            />
          </div>

          <Input
            label={t('form.allergens')}
            placeholder="gluten, dairy, eggs..."
            {...register('allergens', {
              setValueAs: (v) =>
                typeof v === 'string'
                  ? v.split(',').map((s) => s.trim()).filter(Boolean)
                  : v,
            })}
          />

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingItem ? 'Update' : 'Add'} Item
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title={t('deleteItem')}
      >
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {t('deleteConfirm')}
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => deleteItem(deleteConfirm!)}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
