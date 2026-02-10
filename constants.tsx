
import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  FileText, 
  ShoppingBag, 
  Calculator, 
  Settings, 
  Box,
  QrCode
} from 'lucide-react';

export const COLORS = {
  cream: '#FDFBF7',
  beige: '#F5EFE6',
  tan: '#D2B48C',
  coffee: '#6F4E37',
  latte: '#A67B5B',
  status: {
    open: '#FEF3C7', // Bege claro
    approved: '#D1FAE5', // Verde pastel
    rejected: '#FEE2E2', // Rosa claro
    pending: '#DBEAFE', // Azul pastel
    paid: '#D1FAE5' // Verde pastel
  }
};

export const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'products', label: 'Produtos', icon: <Package size={20} /> },
  { id: 'stock', label: 'Estoque', icon: <Box size={20} /> },
  { id: 'clients', label: 'Clientes', icon: <Users size={20} /> },
  { id: 'budgets', label: 'Orçamentos', icon: <FileText size={20} /> },
  { id: 'sales', label: 'Vendas', icon: <ShoppingBag size={20} /> },
  { id: 'pricing', label: 'Precificação', icon: <Calculator size={20} /> },
  { id: 'pix', label: 'Pix', icon: <QrCode size={20} /> },
  { id: 'settings', label: 'Configurações', icon: <Settings size={20} /> },
];

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};
