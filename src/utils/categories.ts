import { CategoryType } from '../types';

export interface CategoryMeta {
  name: CategoryType;
  color: string; // hex
  bgColor: string; // tailwind
  textColor: string; // tailwind
  borderColor: string;
  iconName: string;
}

export const CATEGORIES_CONFIG: Record<CategoryType, CategoryMeta> = {
  'Restauration & Boissons': {
    name: 'Restauration & Boissons',
    color: '#f97316', // orange
    bgColor: 'bg-orange-500/10',
    textColor: 'text-orange-600 dark:text-orange-400',
    borderColor: 'border-orange-500/20',
    iconName: 'UtensilsCrossed',
  },
  'Lieu & Salle': {
    name: 'Lieu & Salle',
    color: '#6366f1', // indigo
    bgColor: 'bg-indigo-500/10',
    textColor: 'text-indigo-600 dark:text-indigo-400',
    borderColor: 'border-indigo-500/20',
    iconName: 'Building2',
  },
  'Transport & Logistique': {
    name: 'Transport & Logistique',
    color: '#06b6d4', // cyan
    bgColor: 'bg-cyan-500/10',
    textColor: 'text-cyan-600 dark:text-cyan-400',
    borderColor: 'border-cyan-500/20',
    iconName: 'Car',
  },
  'Hébergement': {
    name: 'Hébergement',
    color: '#8b5cf6', // purple
    bgColor: 'bg-purple-500/10',
    textColor: 'text-purple-600 dark:text-purple-400',
    borderColor: 'border-purple-500/20',
    iconName: 'BedDouble',
  },
  'Technique & Matériel': {
    name: 'Technique & Matériel',
    color: '#3b82f6', // blue
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-600 dark:text-blue-400',
    borderColor: 'border-blue-500/20',
    iconName: 'Speaker',
  },
  'Décoration & Fleurs': {
    name: 'Décoration & Fleurs',
    color: '#ec4899', // pink
    bgColor: 'bg-pink-500/10',
    textColor: 'text-pink-600 dark:text-pink-400',
    borderColor: 'border-pink-500/20',
    iconName: 'Sparkles',
  },
  'Activités & Divertissement': {
    name: 'Activités & Divertissement',
    color: '#10b981', // emerald
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    borderColor: 'border-emerald-500/20',
    iconName: 'PartyPopper',
  },
  'Communication & Print': {
    name: 'Communication & Print',
    color: '#eab308', // amber
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-600 dark:text-amber-400',
    borderColor: 'border-amber-500/20',
    iconName: 'Megaphone',
  },
  'Autre': {
    name: 'Autre',
    color: '#64748b', // slate
    bgColor: 'bg-slate-500/10',
    textColor: 'text-slate-600 dark:text-slate-400',
    borderColor: 'border-slate-500/20',
    iconName: 'Tag',
  },
};

export const ALL_CATEGORIES = Object.keys(CATEGORIES_CONFIG) as CategoryType[];
