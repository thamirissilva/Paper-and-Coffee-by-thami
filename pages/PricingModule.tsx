
import React, { useState, useMemo, useEffect } from 'react';
import { Material, UnitType, Product, MaterialCategory, PricingDetail } from '../types';
import { formatCurrency } from '../constants';
import { 
  Plus, 
  Trash2, 
  Calculator, 
  Info, 
  Save, 
  Clock, 
  Droplets, 
  Zap, 
  TrendingUp,
  Package,
  Layers,
  ChevronRight,
  Copy,
  HelpCircle,
  Home,
  Wifi,
  Wind,
  Coins,
  Search,
  Printer,
  Wrench,
  Fuel,
  MoreHorizontal
} from 'lucide-react';

interface PricingModuleProps {
  materials: Material[];
  setMaterials: React.Dispatch<React.SetStateAction<Material[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  pricings: PricingDetail[];
  setPricings: React.Dispatch<React.SetStateAction<PricingDetail[]>>;
}

const HelpButton: React.FC<{ title: string; text: string }> = ({ title, text }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block ml-1">
      <button 
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="text-theme-primary opacity-40 hover:opacity-100 transition-opacity"
      >
        <HelpCircle size={14} />
      </button>
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-4 bg-theme-primary text-white text-[10px] rounded-[1.5rem] shadow-xl animate-fadeIn leading-relaxed border border-white/10">
          <p className="font-bold mb-1 border-b border-white/20 pb-1">{title}</p>
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-theme-primary"></div>
        </div>
      )}
    </div>
  );
};

const PricingModule: React.FC<PricingModuleProps> = ({ materials, setMaterials, products, setProducts, pricings, setPricings }) => {
  const [newMaterial, setNewMaterial] = useState<Partial<Material>>({
    name: '',
    category: MaterialCategory.PAPER,
    unit: UnitType.UNIT,
    quantityPerPackage: 1,
    totalValue: 0
  });

  const [currentPricing, setCurrentPricing] = useState<Partial<PricingDetail>>({
    productId: '',
    materials: [],
    inkCostType: 'fixed',
    inkFixedCost: 0,
    inkSheetsUsed: 1, // Padrão 1 folha
    inkMlCost: 0,
    inkMlUsed: 0,
    laborHourlyRate: 0,
    laborMinutesUsed: 0,
    laborDesiredSalary: 0,
    laborMonthlyHours: 0,
    fixedRent: 0,
    fixedWater: 0,
    fixedElectricity: 0,
    fixedInternet: 0,
    fixedMaintenance: 0,
    fixedGasoline: 0,
    fixedOtherOverhead: 0,
    monthlyProductionCapacity: 100,
    extraCosts: [],
    profitType: 'percentage',
    profitMargin: 100
  });

  useEffect(() => {
    if (currentPricing.laborDesiredSalary && currentPricing.laborMonthlyHours && currentPricing.laborMonthlyHours > 0) {
      const hourlyRate = currentPricing.laborDesiredSalary / currentPricing.laborMonthlyHours;
      if (hourlyRate !== currentPricing.laborHourlyRate) {
        setCurrentPricing(prev => ({ ...prev, laborHourlyRate: hourlyRate }));
      }
    }
  }, [currentPricing.laborDesiredSalary, currentPricing.laborMonthlyHours]);

  const calculateMaterialCost = (matId: string, qty: number) => {
    const mat = materials.find(m => m.id === matId);
    return mat ? mat.costPerUnit * qty : 0;
  };

  const totals = useMemo(() => {
    const materialsCost = (currentPricing.materials || []).reduce((acc, item) => acc + (item.cost || 0), 0);
    
    let inkCost = 0;
    if (currentPricing.inkCostType === 'fixed') {
      // Multiplica o custo de cada folha pela quantidade de folhas usadas
      inkCost = (currentPricing.inkFixedCost || 0) * (currentPricing.inkSheetsUsed || 1);
    } else {
      inkCost = (currentPricing.inkMlCost || 0) * (currentPricing.inkMlUsed || 0);
    }

    const laborCost = ((currentPricing.laborHourlyRate || 0) / 60) * (currentPricing.laborMinutesUsed || 0);
    
    const totalFixedMonthly = (currentPricing.fixedRent || 0) + 
                               (currentPricing.fixedWater || 0) + 
                               (currentPricing.fixedElectricity || 0) + 
                               (currentPricing.fixedInternet || 0) +
                               (currentPricing.fixedMaintenance || 0) +
                               (currentPricing.fixedGasoline || 0) +
                               (currentPricing.fixedOtherOverhead || 0);
    const capacity = currentPricing.monthlyProductionCapacity || 1;
    const fixedCostPerUnit = totalFixedMonthly / capacity;

    const extraCost = (currentPricing.extraCosts || []).reduce((acc, item) => acc + (item.value || 0), 0);

    const totalCost = materialsCost + inkCost + laborCost + fixedCostPerUnit + extraCost;

    let suggestedPrice = 0;
    if (currentPricing.profitType === 'percentage') {
      suggestedPrice = totalCost * (1 + (currentPricing.profitMargin || 0) / 100);
    } else {
      suggestedPrice = totalCost + (currentPricing.profitMargin || 0);
    }

    return { totalCost, suggestedPrice, materialsCost, inkCost, laborCost, fixedCostPerUnit, extraCost };
  }, [currentPricing, materials]);

  const handleAddMaterial = () => {
    if (!newMaterial.name || !newMaterial.totalValue || !newMaterial.quantityPerPackage) return;
    const costPerUnit = newMaterial.totalValue / newMaterial.quantityPerPackage;
    const m: Material = {
      id: Math.random().toString(36).substr(2, 9),
      name: newMaterial.name,
      category: newMaterial.category as MaterialCategory,
      unit: UnitType.UNIT,
      quantityPerPackage: Number(newMaterial.quantityPerPackage),
      totalValue: Number(newMaterial.totalValue),
      costPerUnit
    };
    setMaterials([...materials, m]);
    setNewMaterial({ name: '', category: MaterialCategory.PAPER, unit: UnitType.UNIT, quantityPerPackage: 1, totalValue: 0 });
  };

  const handleAddUsedMaterial = () => {
    const defaultMat = materials[0]?.id || '';
    setCurrentPricing({
      ...currentPricing,
      materials: [...(currentPricing.materials || []), { materialId: defaultMat, quantityUsed: 1, cost: calculateMaterialCost(defaultMat, 1) }]
    });
  };

  const updateUsedMaterial = (index: number, matId: string, qty: number) => {
    const updated = [...(currentPricing.materials || [])];
    const cost = calculateMaterialCost(matId, qty);
    updated[index] = { materialId: matId, quantityUsed: qty, cost };
    setCurrentPricing({ ...currentPricing, materials: updated });
  };

  const handleAddExtraCost = () => {
    setCurrentPricing({
      ...currentPricing,
      extraCosts: [...(currentPricing.extraCosts || []), { description: '', value: 0 }]
    });
  };

  const handleSave = () => {
    if (!currentPricing.productId) return;
    const newPricingDetail: PricingDetail = {
      ...currentPricing as PricingDetail,
      id: currentPricing.id || Math.random().toString(36).substr(2, 9),
      totalCost: totals.totalCost,
      suggestedPrice: totals.suggestedPrice
    };
    if (currentPricing.id) {
      setPricings(pricings.map(p => p.id === currentPricing.id ? newPricingDetail : p));
    } else {
      setPricings([newPricingDetail, ...pricings]);
    }
    setProducts(products.map(p => p.id === currentPricing.productId ? {
      ...p,
      calculatedCost: totals.totalCost,
      suggestedPrice: totals.suggestedPrice
    } : p));
    alert('Precificação detalhada salva e aplicada!');
  };

  const handleLoadPricing = (productId: string) => {
    const existing = pricings.find(p => p.productId === productId);
    if (existing) {
      setCurrentPricing(existing);
    } else {
      setCurrentPricing({
        productId,
        materials: [],
        inkCostType: 'fixed',
        inkFixedCost: 0,
        inkSheetsUsed: 1,
        inkMlCost: 0,
        inkMlUsed: 0,
        laborHourlyRate: 0,
        laborMinutesUsed: 0,
        laborDesiredSalary: 0,
        laborMonthlyHours: 0,
        fixedRent: 0,
        fixedWater: 0,
        fixedElectricity: 0,
        fixedInternet: 0,
        fixedMaintenance: 0,
        fixedGasoline: 0,
        fixedOtherOverhead: 0,
        monthlyProductionCapacity: 100,
        extraCosts: [],
        profitType: 'percentage',
        profitMargin: 100
      });
    }
  };

  return (
    <div className="space-y-10 pb-20 animate-fadeIn">
      {/* 1. Gestão de Insumos */}
      <section className="bg-white p-8 rounded-[2rem] border border-theme-secondary shadow-sm">
        <header className="mb-8">
          <h3 className="text-xl font-title font-bold text-theme-primary flex items-center gap-2">
            <Package size={24} className="text-theme-secondary" /> 1. Cadastro de Insumos
            <HelpButton title="Insumos" text="Cadastre aqui tudo o que você compra pronto: papéis, fitas, caixas, etc. O sistema calcula o custo unitário automaticamente." />
          </h3>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-4 p-6 bg-theme-app/50 rounded-[2rem] border border-theme-sidebar">
            <div className="space-y-1">
              <label className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Nome do Insumo</label>
              <input type="text" placeholder="Ex: Papel 180g" className="w-full p-3 bg-white border border-theme-secondary rounded-2xl outline-none text-sm" value={newMaterial.name} onChange={(e) => setNewMaterial({...newMaterial, name: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Categoria</label>
                <select className="w-full p-3 bg-white border border-theme-secondary rounded-2xl outline-none text-sm" value={newMaterial.category} onChange={(e) => setNewMaterial({...newMaterial, category: e.target.value as MaterialCategory})}>
                  {Object.values(MaterialCategory).map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Medida</label>
                <select className="w-full p-3 bg-white border border-theme-secondary rounded-2xl outline-none text-sm" value={newMaterial.unit} onChange={(e) => setNewMaterial({...newMaterial, unit: e.target.value as UnitType})}>
                  {Object.values(UnitType).map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Qtd no Pacote</label>
                <input type="number" className="w-full p-3 bg-white border border-theme-secondary rounded-2xl outline-none text-sm" value={newMaterial.quantityPerPackage} onChange={(e) => setNewMaterial({...newMaterial, quantityPerPackage: Number(e.target.value)})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Preço Pago (R$)</label>
                <input type="number" className="w-full p-3 bg-white border border-theme-secondary rounded-2xl outline-none text-sm" value={newMaterial.totalValue} onChange={(e) => setNewMaterial({...newMaterial, totalValue: Number(e.target.value)})} />
              </div>
            </div>
            <button onClick={handleAddMaterial} className="w-full py-4 bg-theme-primary text-white font-bold rounded-2xl hover:opacity-90 flex items-center justify-center gap-2 transition-all shadow-md">
              <Plus size={18} /> Adicionar Insumo
            </button>
          </div>
          <div className="lg:col-span-2 space-y-3 max-h-[400px] overflow-y-auto pr-2 coffee-scroll">
            {materials.map(m => (
              <div key={m.id} className="flex items-center justify-between p-4 bg-white border border-theme-sidebar rounded-2xl shadow-sm hover:border-theme-secondary transition-all">
                <div>
                  <p className="text-sm font-bold text-theme-primary">{m.name}</p>
                  <p className="text-[10px] opacity-60">Custo por {m.unit}: <span className="font-bold">{formatCurrency(m.costPerUnit)}</span></p>
                </div>
                <button onClick={() => setMaterials(materials.filter(x => x.id !== m.id))} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Precificação Detalhada */}
      <section className="bg-white p-8 rounded-[2rem] border border-theme-secondary shadow-sm space-y-10">
        <header>
          <h3 className="text-xl font-title font-bold text-theme-primary flex items-center gap-2">
            <Calculator size={24} className="text-theme-secondary" /> 2. Precificação de Produto
            <HelpButton title="Precificação" text="Aqui você une materiais, seu tempo e suas contas para descobrir o preço real de cada peça." />
          </h3>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          <div className="xl:col-span-2 space-y-10">
            <div className="space-y-2">
              <label className="text-xs font-bold opacity-60 uppercase tracking-widest">Produto para Precificar</label>
              <select className="w-full p-4 bg-theme-app border border-theme-secondary rounded-[2rem] outline-none font-bold text-theme-primary" value={currentPricing.productId} onChange={(e) => handleLoadPricing(e.target.value)}>
                <option value="">Selecione um produto...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            {currentPricing.productId && (
              <div className="space-y-10 animate-fadeIn">
                {/* MATERIAIS */}
                <div className="space-y-4">
                  <h4 className="font-title font-bold text-theme-primary flex items-center gap-2 border-b border-theme-sidebar pb-2">
                    <Layers size={18} /> Materiais Utilizados
                    <HelpButton title="Materiais Usados" text="Selecione os insumos que compõem este produto. Ex: 2 folhas de papel, 1 metro de fita." />
                  </h4>
                  <div className="space-y-3">
                    {currentPricing.materials?.map((item, idx) => (
                      <div key={idx} className="flex flex-wrap md:flex-nowrap items-end gap-3 p-4 bg-theme-app/30 rounded-2xl border border-theme-sidebar">
                        <div className="flex-1 space-y-1">
                          <label className="text-[9px] font-bold opacity-40 uppercase">Material</label>
                          <select className="w-full p-2 bg-white border border-theme-secondary rounded-xl text-xs" value={item.materialId} onChange={(e) => updateUsedMaterial(idx, e.target.value, item.quantityUsed)}>
                            {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                          </select>
                        </div>
                        <div className="w-24 space-y-1">
                          <label className="text-[9px] font-bold opacity-40 uppercase">Qtd</label>
                          <input type="number" className="w-full p-2 bg-white border border-theme-secondary rounded-xl text-xs" value={item.quantityUsed} onChange={(e) => updateUsedMaterial(idx, item.materialId, Number(e.target.value))} />
                        </div>
                        <p className="w-24 p-2 text-xs font-bold text-theme-primary text-right">{formatCurrency(item.cost)}</p>
                        <button onClick={() => setCurrentPricing({...currentPricing, materials: currentPricing.materials?.filter((_, i) => i !== idx)})} className="p-2 text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                      </div>
                    ))}
                    <button onClick={handleAddUsedMaterial} className="text-xs text-theme-primary font-bold hover:underline flex items-center gap-1"><Plus size={14} /> Adicionar Material</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* MÃO DE OBRA SIMPLIFICADA */}
                  <div className="p-6 bg-theme-app/30 rounded-[2rem] border border-theme-sidebar space-y-6">
                    <h4 className="text-xs font-bold text-theme-primary flex items-center gap-2 uppercase tracking-widest">
                      <Clock size={16} /> Mão de Obra
                      <HelpButton title="Sua Mão de Obra" text="Nesta parte você define quanto quer ganhar no final do mês e quantas horas pretende trabalhar. O sistema calcula o valor da sua hora sozinho!" />
                    </h4>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold opacity-60 uppercase flex items-center gap-1">
                          Salário Desejado (R$)
                          <HelpButton title="Pró-labore" text="Quanto você quer que sobre para você no final do mês como seu pagamento fixo?" />
                        </label>
                        <input 
                          type="number" 
                          placeholder="Ex: 3000"
                          className="w-full p-3 bg-white border border-theme-secondary rounded-xl text-sm font-bold text-theme-primary" 
                          value={currentPricing.laborDesiredSalary} 
                          onChange={(e) => setCurrentPricing({...currentPricing, laborDesiredSalary: Number(e.target.value)})} 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold opacity-60 uppercase flex items-center gap-1">
                          Horas Trabalhadas no Mês
                          <HelpButton title="Horas Mensais" text="Quantas horas por mês você dedica à produção? (Ex: 160h para 8h diárias em 20 dias)" />
                        </label>
                        <input 
                          type="number" 
                          placeholder="Ex: 160"
                          className="w-full p-3 bg-white border border-theme-secondary rounded-xl text-sm" 
                          value={currentPricing.laborMonthlyHours} 
                          onChange={(e) => setCurrentPricing({...currentPricing, laborMonthlyHours: Number(e.target.value)})} 
                        />
                      </div>
                      
                      <div className="p-3 bg-theme-primary text-white rounded-xl shadow-inner flex justify-between items-center animate-pulse-slow">
                        <div className="flex items-center gap-2">
                           <Coins size={16} />
                           <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Valor da sua Hora</span>
                        </div>
                        <span className="text-sm font-bold">{formatCurrency(currentPricing.laborHourlyRate || 0)}</span>
                      </div>

                      <div className="space-y-1 pt-2 border-t border-theme-sidebar">
                        <label className="text-[10px] font-bold opacity-60 uppercase flex items-center gap-1">
                          Tempo Gasto Nesta Peça (Minutos)
                          <HelpButton title="Tempo de Produção" text="Quanto tempo você leva para finalizar UMA unidade deste produto? Use cronômetro se precisar." />
                        </label>
                        <input 
                          type="number" 
                          placeholder="Ex: 30"
                          className="w-full p-3 bg-white border border-theme-secondary rounded-xl text-sm font-bold" 
                          value={currentPricing.laborMinutesUsed} 
                          onChange={(e) => setCurrentPricing({...currentPricing, laborMinutesUsed: Number(e.target.value)})} 
                        />
                      </div>
                      
                      <div className="p-3 bg-white/50 rounded-xl border border-theme-sidebar flex justify-between items-center">
                        <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Custo de Mão de Obra</span>
                        <span className="text-sm font-bold text-theme-primary">{formatCurrency(totals.laborCost)}</span>
                      </div>
                    </div>
                  </div>

                  {/* CUSTOS FIXOS */}
                  <div className="p-6 bg-theme-app/30 rounded-[2rem] border border-theme-secondary space-y-6">
                    <h4 className="text-xs font-bold text-theme-primary flex items-center gap-2 uppercase tracking-widest">
                      <Home size={16} /> Contas do Atelier (Fixo)
                      <HelpButton title="Custos Operacionais" text="Aqui você coloca os gastos que acontecem todo mês, independente de quanto você vende. Eles serão divididos por cada produto feito." />
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold opacity-40 uppercase flex items-center gap-1"><Home size={10} /> Aluguel</label>
                        <input type="number" className="w-full p-2 bg-white border border-theme-secondary rounded-xl text-xs" value={currentPricing.fixedRent} onChange={(e) => setCurrentPricing({...currentPricing, fixedRent: Number(e.target.value)})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold opacity-40 uppercase flex items-center gap-1"><Zap size={10} /> Luz</label>
                        <input type="number" className="w-full p-2 bg-white border border-theme-secondary rounded-xl text-xs" value={currentPricing.fixedElectricity} onChange={(e) => setCurrentPricing({...currentPricing, fixedElectricity: Number(e.target.value)})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold opacity-40 uppercase flex items-center gap-1"><Wind size={10} /> Água</label>
                        <input type="number" className="w-full p-2 bg-white border border-theme-secondary rounded-xl text-xs" value={currentPricing.fixedWater} onChange={(e) => setCurrentPricing({...currentPricing, fixedWater: Number(e.target.value)})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold opacity-40 uppercase flex items-center gap-1"><Wifi size={10} /> Internet</label>
                        <input type="number" className="w-full p-2 bg-white border border-theme-secondary rounded-xl text-xs" value={currentPricing.fixedInternet} onChange={(e) => setCurrentPricing({...currentPricing, fixedInternet: Number(e.target.value)})} />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold opacity-40 uppercase flex items-center gap-1">
                           <Wrench size={10} /> Manutenção
                           <HelpButton title="Máquinas" text="Reserve um valor mensal para manutenção de impressoras, troca de lâminas da plotter e reparos em geral." />
                        </label>
                        <input type="number" className="w-full p-2 bg-white border border-theme-secondary rounded-xl text-xs" value={currentPricing.fixedMaintenance} onChange={(e) => setCurrentPricing({...currentPricing, fixedMaintenance: Number(e.target.value)})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold opacity-40 uppercase flex items-center gap-1">
                           <Fuel size={10} /> Gasolina
                           <HelpButton title="Logística" text="Gasto médio com combustível para buscar materiais ou levar encomendas nos correios/pontos de entrega." />
                        </label>
                        <input type="number" className="w-full p-2 bg-white border border-theme-secondary rounded-xl text-xs" value={currentPricing.fixedGasoline} onChange={(e) => setCurrentPricing({...currentPricing, fixedGasoline: Number(e.target.value)})} />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <label className="text-[9px] font-bold opacity-40 uppercase flex items-center gap-1">
                           <MoreHorizontal size={10} /> Outros Gastos Fixos
                           <HelpButton title="Diversos" text="Qualquer outro custo mensal regular que você tenha (Ex: taxas bancárias, licenças de software)." />
                        </label>
                        <input type="number" className="w-full p-2 bg-white border border-theme-secondary rounded-xl text-xs" value={currentPricing.fixedOtherOverhead} onChange={(e) => setCurrentPricing({...currentPricing, fixedOtherOverhead: Number(e.target.value)})} />
                      </div>
                    </div>
                    
                    <div className="space-y-1 border-t border-theme-sidebar pt-3">
                      <label className="text-[9px] font-bold opacity-40 uppercase flex items-center gap-1">
                        Sua Produção Mensal Média
                        <HelpButton title="Rateio" text="Quantos produtos você costuma fazer por mês? Esse número divide todas as suas contas acima entre as peças." />
                      </label>
                      <input type="number" className="w-full p-3 bg-white border border-theme-secondary rounded-xl text-sm" value={currentPricing.monthlyProductionCapacity} onChange={(e) => setCurrentPricing({...currentPricing, monthlyProductionCapacity: Number(e.target.value)})} />
                    </div>
                    <p className="text-[10px] opacity-60 text-center">Rateio de custos: <span className="font-bold text-theme-primary">{formatCurrency(totals.fixedCostPerUnit)} por peça</span></p>
                  </div>
                </div>

                {/* TINTA (ATUALIZADO PARA MULTIPLICAÇÃO) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-6 bg-theme-app/30 rounded-[2rem] border border-theme-secondary space-y-4">
                    <h4 className="text-xs font-bold text-theme-primary flex items-center gap-2 uppercase tracking-widest">
                      <Droplets size={16} /> Impressão/Tinta
                      <HelpButton 
                        title="Cálculo de Tinta" 
                        text="A forma mais fácil é o 'Preço Fixo por Folha'. Se você usa 2 folhas para um produto, coloque o custo de 1 folha e informe que usou 2." 
                      />
                    </h4>
                    
                    <div className="space-y-3">
                      <select className="w-full p-3 bg-white border border-theme-secondary rounded-xl text-xs font-bold" value={currentPricing.inkCostType} onChange={(e) => setCurrentPricing({...currentPricing, inkCostType: e.target.value as 'fixed' | 'perMl'})}>
                        <option value="fixed">Preço Fixo por Folha/Impressão</option>
                        <option value="perMl">Cálculo Preciso por ml</option>
                      </select>
                      
                      {currentPricing.inkCostType === 'fixed' ? (
                        <div className="space-y-4">
                           <div className="space-y-1">
                             <div className="flex items-center gap-1">
                               <label className="text-[10px] font-bold opacity-60 uppercase">Custo de 1 Folha (R$)</label>
                               <HelpButton title="Dica de Valor" text="Para impressoras tanque de tinta, um custo seguro é entre R$ 0,05 e R$ 0,15 por folha." />
                             </div>
                             <input type="number" step="0.01" placeholder="Ex: 0.10" className="w-full p-3 bg-white border border-theme-secondary rounded-xl text-sm font-bold" value={currentPricing.inkFixedCost} onChange={(e) => setCurrentPricing({...currentPricing, inkFixedCost: Number(e.target.value)})} />
                           </div>
                           
                           <div className="space-y-1">
                             <div className="flex items-center gap-1">
                               <label className="text-[10px] font-bold opacity-60 uppercase">Quantas folhas usadas?</label>
                               <HelpButton title="Quantidade" text="Quantas folhas A4 impressas você utiliza para produzir UMA unidade deste produto?" />
                             </div>
                             <input type="number" min="1" step="1" className="w-full p-3 bg-white border border-theme-secondary rounded-xl text-sm font-bold" value={currentPricing.inkSheetsUsed} onChange={(e) => setCurrentPricing({...currentPricing, inkSheetsUsed: Number(e.target.value)})} />
                           </div>

                           <div className="p-3 bg-theme-secondary/20 rounded-xl border border-theme-secondary/30 flex justify-between items-center">
                              <span className="text-[10px] font-bold opacity-60 uppercase">Total Tinta (Peça)</span>
                              <span className="text-sm font-bold text-theme-primary">{formatCurrency((currentPricing.inkFixedCost || 0) * (currentPricing.inkSheetsUsed || 1))}</span>
                           </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold opacity-40 uppercase">Custo por ml</label>
                            <input type="number" placeholder="Custo ml" className="w-full p-3 bg-white border border-theme-secondary rounded-xl text-xs" value={currentPricing.inkMlCost} onChange={(e) => setCurrentPricing({...currentPricing, inkMlCost: Number(e.target.value)})} />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold opacity-40 uppercase">ml Usados</label>
                            <input type="number" placeholder="ml usados" className="w-full p-3 bg-white border border-theme-secondary rounded-xl text-xs" value={currentPricing.inkMlUsed} onChange={(e) => setCurrentPricing({...currentPricing, inkMlUsed: Number(e.target.value)})} />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Dicas de Impressora */}
                    <div className="bg-white/60 p-4 rounded-2xl space-y-3 border border-theme-sidebar">
                       <h5 className="text-[10px] font-bold text-theme-primary flex items-center gap-1 uppercase tracking-widest border-b border-theme-sidebar pb-1">
                         <Printer size={12} /> Dados Técnicos Médios
                       </h5>
                       <div className="space-y-2 text-[10px] leading-relaxed opacity-80">
                         <p className="flex justify-between"><span>Rendimento Médio Kit:</span> <span className="font-bold">~6.000 a 7.500 páginas</span></p>
                         <p className="flex justify-between"><span>Consumo por A4 (Alta):</span> <span className="font-bold">~0,02 a 0,05 ml</span></p>
                         <p className="flex justify-between"><span>Velocidade de Impressão:</span> <span className="font-bold">~5 a 15 páginas/min</span></p>
                         <div className="pt-1 mt-1 border-t border-theme-sidebar">
                           <p className="italic text-theme-secondary flex items-start gap-1">
                             <Search size={10} className="mt-0.5 shrink-0" />
                             Onde achar? Procure no manual ou site da fabricante por 'Rendimento ISO'.
                           </p>
                         </div>
                       </div>
                    </div>
                  </div>

                  <div className="p-6 bg-theme-primary text-white rounded-[2rem] space-y-4 shadow-lg">
                    <h4 className="text-xs font-bold flex items-center gap-2 uppercase tracking-widest opacity-80">
                      <TrendingUp size={16} /> Margem de Lucro
                      <HelpButton title="Seu Lucro" text="Isso é o que REALMENTE SOBRA para reinvestir na empresa ou lucro líquido após pagar tudo." />
                    </h4>
                    <select className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white outline-none text-xs" value={currentPricing.profitType} onChange={(e) => setCurrentPricing({...currentPricing, profitType: e.target.value as 'percentage' | 'fixed'})}>
                      <option value="percentage" className="text-black">Porcentagem (%)</option>
                      <option value="fixed" className="text-black">Valor em Dinheiro (R$)</option>
                    </select>
                    <input type="number" className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white font-bold text-lg" value={currentPricing.profitMargin} onChange={(e) => setCurrentPricing({...currentPricing, profitMargin: Number(e.target.value)})} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Resumo Financeiro */}
          <div className="xl:col-span-1">
            <div className="sticky top-10 space-y-6">
              <div className="bg-white rounded-[2.5rem] border-4 border-theme-secondary p-8 shadow-xl space-y-6">
                <h4 className="font-title font-bold text-theme-primary text-center">Resumo de Custo</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between opacity-60"><span>Materiais Usados:</span><span className="font-bold">{formatCurrency(totals.materialsCost)}</span></div>
                  <div className="flex justify-between opacity-60"><span>Sua Mão de Obra:</span><span className="font-bold">{formatCurrency(totals.laborCost)}</span></div>
                  <div className="flex justify-between opacity-60"><span>Contas do Atelier:</span><span className="font-bold">{formatCurrency(totals.fixedCostPerUnit)}</span></div>
                  <div className="flex justify-between opacity-60"><span>Tinta/Impressão:</span><span className="font-bold">{formatCurrency(totals.inkCost)}</span></div>
                  <div className="flex justify-between text-lg font-bold text-theme-primary pt-2 border-t border-theme-sidebar">
                    <span>Custo Total:</span><span>{formatCurrency(totals.totalCost)}</span>
                  </div>
                </div>
                <div className="bg-theme-secondary/20 p-6 rounded-[2rem] text-center border border-theme-secondary/30">
                  <p className="text-[10px] font-bold text-theme-primary uppercase opacity-60 tracking-widest">Preço Sugerido</p>
                  <p className="text-4xl font-title font-black text-theme-primary">{formatCurrency(totals.suggestedPrice)}</p>
                </div>
                <button onClick={handleSave} disabled={!currentPricing.productId} className="w-full py-5 bg-theme-primary text-white font-bold rounded-[2rem] hover:opacity-90 shadow-lg disabled:opacity-30 flex items-center justify-center gap-2 transition-transform active:scale-95">
                  <Save size={20} /> Salvar Precificação
                </button>
              </div>
              <div className="p-6 bg-theme-app/50 rounded-[2rem] border border-theme-sidebar flex items-start gap-3">
                <Info size={20} className="text-theme-secondary shrink-0" />
                <p className="text-[10px] opacity-70 leading-relaxed font-medium italic">"Considerar gastos com manutenção e transporte é o que protege sua empresa de surpresas desagradáveis. Precificar bem é cuidar do seu futuro!"</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Histórico */}
      <section className="bg-white p-8 rounded-[2rem] border border-theme-secondary shadow-sm">
        <h3 className="text-lg font-title font-bold text-theme-primary mb-6 flex items-center gap-2">
          <Copy size={22} className="text-theme-secondary" /> Suas Precificações Salvas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pricings.map(p => (
            <div key={p.id} className="p-5 bg-theme-app/20 border border-theme-sidebar rounded-[2rem] hover:border-theme-secondary transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h5 className="font-bold text-theme-primary text-sm">{products.find(prod => prod.id === p.productId)?.name || 'Produto'}</h5>
                  <p className="text-[10px] opacity-40">Salvo em {new Date().toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleLoadPricing(p.productId)} className="p-2 bg-white rounded-xl text-theme-primary shadow-sm hover:bg-theme-secondary/20 transition-colors"><ChevronRight size={16} /></button>
                  <button onClick={() => setPricings(pricings.filter(x => x.id !== p.id))} className="p-2 bg-white rounded-xl text-red-400 shadow-sm hover:bg-red-50 transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
              <div className="flex justify-between items-center border-t border-theme-sidebar pt-3">
                <div className="text-[9px] font-bold opacity-40 uppercase">Preço: <span className="text-theme-primary font-black text-sm">{formatCurrency(p.suggestedPrice)}</span></div>
              </div>
            </div>
          ))}
          {pricings.length === 0 && <p className="col-span-full py-10 text-center opacity-30 italic text-sm">Nenhuma precificação salva ainda.</p>}
        </div>
      </section>
    </div>
  );
};

export default PricingModule;
