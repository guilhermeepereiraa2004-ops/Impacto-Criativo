import React, { useState, useEffect } from 'react';
import {
  Lock,
  LogOut,
  LayoutDashboard,
  Users,
  Settings,
  MessageSquare,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Plus,
  Search,
  Filter,
  FileText,
  ArrowLeft,
  Pencil,
  X
} from 'lucide-react';
import logo from '../assets/Logo.png';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { gerarContrato } from '../lib/generateContract';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Gerador de Leads / Pedidos State
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [showClienteForm, setShowClienteForm] = useState(false);
  const [leads, setLeads] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [newLead, setNewLead] = useState({ nome: '', email: '', telefone: '', pedido: 'Camisas Esportivas', tamanho: '', detalhes: '', valor: '', cpf: '', rg: '' });
  const [generatingContractId, setGeneratingContractId] = useState(null);
  const [clienteEditando, setClienteEditando] = useState(null); // { id, nome, email, telefone, pedido, valor, cpf, rg, observacoes, ... }

  const STATUS_OPTIONS = ['Novo', 'Contatado', 'Análise', 'Perdido', 'Convertido'];
  const SERVICES_OPTIONS = [
    'Camisas Esportivas',
    'Camisas Personalizadas',
    'Criações de Logotipo',
    'Design Geral',
    'Cards & Social Media',
    'Arte de Camisa',
    'Edição de Vídeo',
    'Currículo Personalizado'
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Novo': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Contatado': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Análise': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Perdido': return 'bg-red-50 text-red-600 border-red-100';
      case 'Convertido': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const handleUpdateStatus = async (leadId, newStatus) => {
    // Update State and LocalStorage immediately (optimistic UI)
    const updatedLeads = leads.map(lead => 
      lead.id === leadId ? { ...lead, status: newStatus } : lead
    );
    setLeads(updatedLeads);
    localStorage.setItem('impacto_leads', JSON.stringify(updatedLeads));

    try {
      // Update Supabase
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', leadId);
      
      if (error) {
        console.error('Erro ao atualizar status no Supabase:', error.message);
        // We could fetch again to sync if there was an error
        fetchLeads();
      }
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
    }
  };

  const handleUpdateCliente = (camposExtras) => {
    const updatedLeads = leads.map(lead =>
      lead.id === clienteEditando.id ? { ...lead, ...camposExtras } : lead
    );
    setLeads(updatedLeads);
    localStorage.setItem('impacto_leads', JSON.stringify(updatedLeads));
    try {
      supabase
        .from('leads')
        .update(camposExtras)
        .eq('id', clienteEditando.id)
        .then(({ error }) => {
          if (error) console.error('Erro ao atualizar cliente no Supabase:', error.message);
        });
    } catch (err) {
      console.error('Erro ao salvar alterações:', err);
    }
    setClienteEditando(null);
  };

  const formatPhone = (value) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 3) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2)}`;
    }
    return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7, 11)}`;
  };

  const fetchLeads = async () => {
    setIsDataLoading(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('data', { ascending: false });
      
      if (data && data.length > 0) {
        setLeads(data);
      } else if (!error) {
        // Fallback to localStorage if Supabase is empty but connected
        const saved = localStorage.getItem('impacto_leads');
        if (saved) setLeads(JSON.parse(saved));
      }
    } catch (err) {
      // Fallback if not configured
      const saved = localStorage.getItem('impacto_leads');
      if (saved) setLeads(JSON.parse(saved));
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleAddLead = async (e) => {
    // 1. Prepare lead
    const lead = {
      ...newLead,
      status: 'Novo',
      data: new Date().toLocaleDateString('pt-BR')
    };

    let savedLead = { ...lead, id: Date.now() }; // Fallback temporary ID

    // 2. Save to Supabase and get Real ID
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert([lead])
        .select();
      
      if (data && data[0]) {
        savedLead = data[0];
      }
    } catch (err) {
      console.error('Erro ao salvar no Supabase, usando ID local temporário.');
    }

    // 3. Always update UI & LocalStorage with the best available data
    const updatedLeads = [savedLead, ...leads];
    setLeads(updatedLeads);
    localStorage.setItem('impacto_leads', JSON.stringify(updatedLeads));
    setNewLead({ nome: '', email: '', telefone: '', pedido: 'Camisas Esportivas', tamanho: '', detalhes: '', valor: '', cpf: '', rg: '' });
    setShowLeadForm(false);
  };

  // Use environment variables for authentication
  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
  const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASSWORD;

  useEffect(() => {
    const authStatus = localStorage.getItem('admin_session');
    if (authStatus === 'active') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate network delay for a more premium feel
    setTimeout(() => {
      if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
        setIsAuthenticated(true);
        localStorage.setItem('admin_session', 'active');
        localStorage.setItem('admin_email', email);
        setError('');
      } else {
        setError('E-mail ou senha incorretos. Por favor, tente novamente.');
      }
      setIsLoading(false);
    }, 800);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_session');
    localStorage.removeItem('admin_email');
    setEmail('');
    setPassword('');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
              <img src={logo} alt="Impacto Criativo" className="w-24 h-24 object-contain" />
            </div>
            <h1 className="text-3xl font-black text-[#0E1012] mb-2 tracking-tight">Painel Administrativo</h1>
            <p className="text-gray-500 font-light">Entre com suas credenciais para gerenciar a plataforma.</p>
          </div>

          <div className="bg-white rounded-[2rem] shadow-2xl shadow-blue-500/10 border border-gray-100 p-8 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#177BCA] to-blue-400"></div>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">E-mail</label>
                <div className="relative">
                  <input 
                    type="email" 
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#177BCA]/20 focus:border-[#177BCA] transition-all text-gray-900"
                    placeholder="exemplo@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Senha</label>
                <div className="relative">
                  <input 
                    type="password" 
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#177BCA]/20 focus:border-[#177BCA] transition-all text-gray-900"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 text-sm animate-shake">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-[#177BCA] hover:bg-blue-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 disabled:opacity-70 group"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Acessar Painel
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="text-center mt-8">
            <Link to="/" className="text-gray-400 hover:text-[#177BCA] text-sm transition-colors font-medium">
              &larr; Voltar para o site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-[#0E1012]">
      {/* Sidebar */}
      <aside className="w-72 bg-[#0E1012] text-white flex flex-col hidden lg:flex">
        <div className="p-8 pb-12">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="w-10 h-10 object-contain invert" />
            <span className="font-black text-xl tracking-tight">Admin<span className="text-[#177BCA]">Impacto</span></span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <SidebarLink icon={<LayoutDashboard />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarLink 
            icon={<Users />} 
            label="Clientes" 
            active={activeTab === 'clientes'} 
            onClick={() => setActiveTab('clientes')} 
            badge={leads.filter(l => l.status === 'Convertido').length || null} 
          />
          <SidebarLink icon={<MessageSquare />} label="Pedidos" active={activeTab === 'pedidos'} onClick={() => setActiveTab('pedidos')} />
          <SidebarLink icon={<Settings />} label="Configurações" active={activeTab === 'configuracoes'} onClick={() => setActiveTab('configuracoes')} />
        </nav>

        <div className="p-6 border-t border-white/10">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#177BCA] flex items-center justify-center font-bold">WR</div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">Wesley Rocha</p>
              <p className="text-xs text-gray-500 truncate">Administrador</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-bold">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="h-16 md:h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
            <h2 className="text-lg md:text-xl font-black truncate">
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'clientes' && 'Clientes'}
              {activeTab === 'pedidos' && 'Pedidos'}
              {activeTab === 'configuracoes' && 'Config.'}
            </h2>
            <div className="h-6 w-px bg-gray-200 hidden md:block"></div>
            <p className="text-gray-400 text-xs md:text-sm hidden md:block truncate">Bem-vindo, Wesley.</p>
          </div>
          <div className="flex items-center gap-3 md:gap-6">
            <Link to="/" className="flex items-center gap-2 text-[10px] md:text-sm font-bold text-gray-500 hover:text-[#177BCA] transition-colors group">
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">Ver Site</span>
            </Link>
            <div className="w-px h-6 md:h-8 bg-gray-100"></div>
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-2 md:px-3 py-1 rounded-full border border-green-100">
               <ShieldCheck className="w-4 h-4" />
               <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Seguro</span>
            </div>
          </div>
        </header>

        {/* Dynamic Content Area */}
        <div className="p-4 md:p-8 space-y-8 pb-32 lg:pb-8">
          {activeTab === 'dashboard' && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Total de Leads" value="0" change="0%" />
                <StatCard label="Visitas Totais" value="0" change="0%" />
                <StatCard label="Projetos Ativos" value="0" change="0%" />
                <StatCard label="Ticket Médio" value="R$ 0" change="0%" />
              </div>

              {/* Quick Actions / Content Management */}
              <div className="grid grid-cols-1 gap-8">
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                  <h3 className="text-xl font-bold mb-6">Últimos Pedidos</h3>
                  <div className="space-y-4">
                     <p className="text-gray-500 text-center py-4">Nenhum pedido recente.</p>
                  </div>
                  <button className="mt-8 text-gray-400 font-bold text-sm flex items-center gap-2 cursor-not-allowed">
                    Ver todos os pedidos <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'clientes' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-black">Base de Clientes</h3>
                  <p className="text-gray-500">Leads que foram convertidos em projetos reais.</p>
                </div>
                <button 
                  onClick={() => setShowClienteForm(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
                >
                  <Plus className="w-5 h-5" />
                  Novo Cliente Direto
                </button>
              </div>

              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                {leads.filter(l => l.status === 'Convertido').length > 0 ? (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden lg:block overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="text-gray-400 text-sm border-b border-gray-100">
                            <th className="pb-4 font-medium pl-4">Cliente</th>
                            <th className="pb-4 font-medium">Contato</th>
                            <th className="pb-4 font-medium">Serviço</th>
                            <th className="pb-4 font-medium">Valor</th>
                            <th className="pb-4 font-medium">Data</th>
                            <th className="pb-4 font-medium">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leads.filter(l => l.status === 'Convertido').map(cliente => (
                            <tr key={cliente.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                              <td className="py-4 pl-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center font-bold text-indigo-600 text-sm">
                                    {cliente.nome.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="font-bold text-gray-900 text-sm">{cliente.nome}</p>
                                    {cliente.cpf && <p className="text-[10px] text-gray-400">CPF: {cliente.cpf}</p>}
                                  </div>
                                </div>
                              </td>
                              <td className="py-4">
                                <p className="text-sm font-medium">{cliente.email}</p>
                                <p className="text-xs text-gray-400">{cliente.telefone}</p>
                              </td>
                              <td className="py-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wide">
                                  {cliente.pedido}
                                </span>
                              </td>
                              <td className="py-4">
                                {cliente.valor ? (
                                  <span className="font-black text-emerald-600 text-sm">
                                    R$ {parseFloat(cliente.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </span>
                                ) : (
                                  <span className="text-xs text-gray-400 italic">Não definido</span>
                                )}
                              </td>
                              <td className="py-4">
                                <p className="text-xs text-indigo-600 font-bold">Cliente Ativo</p>
                                <p className="text-[10px] text-gray-400">{cliente.data}</p>
                              </td>
                              <td className="py-4 pr-2">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => setClienteEditando({ ...cliente })}
                                    className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap"
                                    title="Editar informações"
                                  >
                                    <Pencil className="w-3 h-3" />
                                    Editar
                                  </button>
                                  <button
                                    onClick={async () => {
                                      setGeneratingContractId(cliente.id);
                                      try { await gerarContrato(cliente); } catch (err) { console.error('Erro contrato:', err); } finally { setGeneratingContractId(null); }
                                    }}
                                    disabled={generatingContractId === cliente.id}
                                    className="flex items-center gap-1.5 bg-[#177BCA]/10 hover:bg-[#177BCA] text-[#177BCA] hover:text-white px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap"
                                  >
                                    {generatingContractId === cliente.id ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <FileText className="w-3 h-3" />}
                                    Contrato
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="lg:hidden space-y-4">
                      {leads.filter(l => l.status === 'Convertido').map(cliente => (
                        <div key={cliente.id} className="bg-gray-50/50 rounded-3xl p-4 border border-gray-100">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center font-bold text-indigo-600 text-sm">
                                {cliente.nome.charAt(0)}
                              </div>
                              <div className="overflow-hidden">
                                <p className="font-bold text-gray-900 text-sm truncate max-w-[150px]">{cliente.nome}</p>
                                <p className="text-[10px] text-gray-400">{cliente.data}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              {cliente.valor ? (
                                <p className="font-black text-emerald-600 text-sm">R$ {parseFloat(cliente.valor).toLocaleString('pt-BR')}</p>
                              ) : (
                                <p className="text-[10px] text-gray-400 italic">Sem valor</p>
                              )}
                              <span className="text-[9px] uppercase font-black text-indigo-500 tracking-wider">Ativo</span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
                             <div className="bg-white p-2.5 rounded-xl border border-gray-100">
                               <p className="text-gray-400 text-[10px] uppercase font-bold mb-0.5">Serviço</p>
                               <p className="font-bold text-gray-700 truncate">{cliente.pedido}</p>
                             </div>
                             <div className="bg-white p-2.5 rounded-xl border border-gray-100">
                               <p className="text-gray-400 text-[10px] uppercase font-bold mb-0.5">Contato</p>
                               <p className="font-bold text-gray-700 truncate">{cliente.telefone}</p>
                             </div>
                          </div>

                          <div className="flex gap-2">
                             <button onClick={() => setClienteEditando({ ...cliente })} className="flex-1 bg-white border border-gray-200 text-gray-600 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
                               <Pencil size={14} /> Editar
                             </button>
                             <button 
                                onClick={async () => {
                                  setGeneratingContractId(cliente.id);
                                  try { await gerarContrato(cliente); } catch (err) { console.error('Erro contrato:', err); } finally { setGeneratingContractId(null); }
                                }}
                                disabled={generatingContractId === cliente.id}
                                className="flex-1 bg-[#177BCA] text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                             >
                               {generatingContractId === cliente.id ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FileText size={14} />}
                               Contrato
                             </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                      <Users className="w-10 h-10" />
                    </div>
                    <h4 className="text-lg font-bold mb-2">Nenhum cliente convertido</h4>
                    <p className="text-gray-400">Assim que você marcar um lead como "Convertido" na aba Pedidos, ele aparecerá aqui automaticamente.</p>
                  </div>
                )}
              </div>

              {/* Modal de cadastro direto de cliente */}
              {showClienteForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowClienteForm(false); }}>
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                  <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl p-8 animate-[fadeIn_0.2s_ease-out]">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-xl font-black text-[#0E1012]">Novo Cliente Direto</h3>
                        <p className="text-sm text-gray-400 mt-0.5">Adicione um cliente já convertido.</p>
                      </div>
                      <button onClick={() => setShowClienteForm(false)} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-500"><X size={20} /></button>
                    </div>

                    <form 
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const lead = { ...newLead, status: 'Convertido', data: new Date().toLocaleDateString('pt-BR') };
                        let savedLead = { ...lead, id: Date.now() };

                        try { 
                          const { data, error } = await supabase.from('leads').insert([lead]).select(); 
                          if (data && data[0]) savedLead = data[0];
                        } catch (err) { console.error('Erro Supabase'); }

                        const updated = [savedLead, ...leads];
                        setLeads(updated);
                        localStorage.setItem('impacto_leads', JSON.stringify(updated));
                        setNewLead({ nome: '', email: '', telefone: '', pedido: 'Camisas Esportivas', tamanho: '', detalhes: '', valor: '', cpf: '', rg: '' });
                        setShowClienteForm(false);
                      }}
                      className="space-y-5"
                    >
                      {/* Nome */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Nome Completo</label>
                        <input type="text" value={newLead.nome} onChange={(e) => setNewLead({...newLead, nome: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#177BCA]/20 focus:border-[#177BCA]" placeholder="Nome do cliente" />
                      </div>

                      {/* E-mail e WhatsApp */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">E-mail</label>
                          <input type="email" value={newLead.email} onChange={(e) => setNewLead({...newLead, email: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#177BCA]/20 focus:border-[#177BCA]" placeholder="email@exemplo.com" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">WhatsApp</label>
                          <input type="tel" value={newLead.telefone} onChange={(e) => setNewLead({...newLead, telefone: formatPhone(e.target.value)})} maxLength={15} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#177BCA]/20 focus:border-[#177BCA]" placeholder="(00) 00000-0000" />
                        </div>
                      </div>

                      {/* CPF e RG */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">CPF</label>
                          <input 
                            type="text" 
                            value={newLead.cpf} 
                            onChange={(e) => {
                              let v = e.target.value.replace(/\D/g, '');
                              if (v.length > 3) v = v.slice(0,3) + '.' + v.slice(3);
                              if (v.length > 7) v = v.slice(0,7) + '.' + v.slice(7);
                              if (v.length > 11) v = v.slice(0,11) + '-' + v.slice(11);
                              setNewLead({...newLead, cpf: v});
                            }} 
                            maxLength={14}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#177BCA]/20 focus:border-[#177BCA]" 
                            placeholder="000.000.000-00" 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">RG</label>
                          <input type="text" value={newLead.rg} onChange={(e) => setNewLead({...newLead, rg: e.target.value})} maxLength={12} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#177BCA]/20 focus:border-[#177BCA]" placeholder="00.000.000-0" />
                        </div>
                      </div>

                      {/* Serviço e Valor */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Serviço</label>
                          <select value={newLead.pedido} onChange={(e) => setNewLead({...newLead, pedido: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#177BCA]/20 focus:border-[#177BCA]">
                            {SERVICES_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Valor (R$)</label>
                          <input type="number" step="0.01" value={newLead.valor} onChange={(e) => setNewLead({...newLead, valor: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#177BCA]/20 focus:border-[#177BCA] font-bold text-emerald-600" placeholder="0,00" />
                        </div>
                      </div>

                      <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-500/20 transition-all">Cadastrar Cliente Ativo</button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Modal de edição de cliente */}
          {clienteEditando && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setClienteEditando(null); }}>
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
              <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl p-8 animate-[fadeIn_0.2s_ease-out]">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-black text-[#0E1012]">Editar Cliente</h3>
                    <p className="text-sm text-gray-400 mt-0.5">{clienteEditando.nome}</p>
                  </div>
                  <button
                    onClick={() => setClienteEditando(null)}
                    className="w-10 h-10 flex items-center justify-center rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-500 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdateCliente({
                      valor: clienteEditando.valor,
                      cpf: clienteEditando.cpf,
                      rg: clienteEditando.rg,
                      nome: clienteEditando.nome,
                      email: clienteEditando.email,
                      telefone: clienteEditando.telefone,
                      observacoes: clienteEditando.observacoes,
                    });
                  }}
                  className="space-y-5"
                >
                  {/* Valor */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Valor do Serviço (R$)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">R$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0,00"
                        value={clienteEditando.valor || ''}
                        onChange={(e) => setClienteEditando(prev => ({ ...prev, valor: e.target.value }))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-10 pr-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#177BCA]/20 focus:border-[#177BCA] transition-all font-bold text-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* CPF */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">CPF</label>
                      <input
                        type="text"
                        placeholder="000.000.000-00"
                        maxLength={14}
                        value={clienteEditando.cpf || ''}
                        onChange={(e) => {
                          let v = e.target.value.replace(/\D/g, '');
                          if (v.length > 3) v = v.slice(0,3) + '.' + v.slice(3);
                          if (v.length > 7) v = v.slice(0,7) + '.' + v.slice(7);
                          if (v.length > 11) v = v.slice(0,11) + '-' + v.slice(11);
                          setClienteEditando(prev => ({ ...prev, cpf: v }));
                        }}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#177BCA]/20 focus:border-[#177BCA] transition-all"
                      />
                    </div>
                    {/* RG */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">RG</label>
                      <input
                        type="text"
                        placeholder="00.000.000-0"
                        maxLength={12}
                        value={clienteEditando.rg || ''}
                        onChange={(e) => setClienteEditando(prev => ({ ...prev, rg: e.target.value }))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#177BCA]/20 focus:border-[#177BCA] transition-all"
                      />
                    </div>
                  </div>

                  {/* Nome */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Nome Completo</label>
                    <input
                      type="text"
                      required
                      value={clienteEditando.nome || ''}
                      onChange={(e) => setClienteEditando(prev => ({ ...prev, nome: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#177BCA]/20 focus:border-[#177BCA] transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Email */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">E-mail</label>
                      <input
                        type="email"
                        value={clienteEditando.email || ''}
                        onChange={(e) => setClienteEditando(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#177BCA]/20 focus:border-[#177BCA] transition-all"
                      />
                    </div>
                    {/* Telefone */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Telefone</label>
                      <input
                        type="tel"
                        value={clienteEditando.telefone || ''}
                        onChange={(e) => setClienteEditando(prev => ({ ...prev, telefone: formatPhone(e.target.value) }))}
                        maxLength={15}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#177BCA]/20 focus:border-[#177BCA] transition-all"
                      />
                    </div>
                  </div>

                  {/* Observações */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Observações</label>
                    <textarea
                      rows={3}
                      placeholder="Notas internas sobre o cliente..."
                      value={clienteEditando.observacoes || ''}
                      onChange={(e) => setClienteEditando(prev => ({ ...prev, observacoes: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#177BCA]/20 focus:border-[#177BCA] transition-all resize-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setClienteEditando(null)}
                      className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 px-6 py-3.5 rounded-2xl font-bold transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-[#177BCA] hover:bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/20"
                    >
                      Salvar Alterações
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'pedidos' && (
            <div className="space-y-6">
              {!showLeadForm ? (
                <>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-black">Gerenciador de Leads</h3>
                      <p className="text-gray-500">Acompanhe e cadastre novos pedidos.</p>
                    </div>
                    <button 
                      onClick={() => setShowLeadForm(true)}
                      className="bg-[#177BCA] hover:bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20"
                    >
                      <Plus className="w-5 h-5" />
                      Novo Pedido / Lead
                    </button>
                  </div>

                  <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex-1 relative">
                        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Buscar leads..." className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#177BCA]/20" />
                      </div>
                      <button className="p-3 border border-gray-100 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors">
                        <Filter className="w-5 h-5" />
                      </button>
                    </div>

                    {leads.length > 0 ? (
                      <>
                        {/* Desktop Table */}
                        <div className="hidden lg:block overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="text-gray-400 text-sm border-b border-gray-100">
                                <th className="pb-4 font-medium pl-4">Cliente</th>
                                <th className="pb-4 font-medium">Contato</th>
                                <th className="pb-4 font-medium">Pedido</th>
                                <th className="pb-4 font-medium">Status / Data</th>
                                <th className="pb-4 font-medium">WhatsApp</th>
                              </tr>
                            </thead>
                            <tbody>
                              {leads.map(lead => (
                                <tr key={lead.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                                  <td className="py-4 pl-4"><p className="font-bold text-gray-900">{lead.nome}</p></td>
                                  <td className="py-4"><p className="text-sm">{lead.email}</p><p className="text-xs text-gray-400">{lead.telefone}</p></td>
                                  <td className="py-4">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-50 text-purple-600 text-xs font-bold uppercase tracking-wide">{lead.pedido}</span>
                                  </td>
                                  <td className="py-4">
                                    <select
                                      value={lead.status || 'Novo'}
                                      onChange={(e) => handleUpdateStatus(lead.id, e.target.value)}
                                      className={`appearance-none inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border cursor-pointer ${getStatusColor(lead.status)}`}
                                    >
                                      {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                    <p className="text-[10px] text-gray-400 mt-1">{lead.data}</p>
                                  </td>
                                  <td className="py-4">
                                    <a 
                                      href={`https://wa.me/55${lead.telefone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${lead.nome}, sou Wesley Rocha da Impacto Criativo. Vi seu pedido de ${lead.pedido} e gostaria de falar sobre seu projeto!`)}`}
                                      target="_blank" rel="noopener noreferrer"
                                      className="flex items-center gap-1.5 bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-white px-3 py-2 rounded-xl text-xs font-bold transition-all"
                                    >
                                      <MessageSquare className="w-3.5 h-3.5" />
                                      Falar
                                    </a>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile Card List */}
                        <div className="lg:hidden space-y-4">
                          {leads.map(lead => (
                            <div key={lead.id} className="bg-gray-50/50 rounded-3xl p-4 border border-gray-100">
                               <div className="flex items-center justify-between mb-3">
                                  <p className="font-black text-gray-900 text-sm">{lead.nome}</p>
                                  <div className="flex gap-2">
                                    <a 
                                      href={`https://wa.me/55${lead.telefone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${lead.nome}, sou Wesley Rocha da Impacto Criativo. Vi seu pedido de ${lead.pedido} e gostaria de falar sobre seu projeto!`)}`}
                                      target="_blank" rel="noopener noreferrer"
                                      className="p-2 bg-[#25D366] text-white rounded-lg shadow-sm"
                                    >
                                      <MessageSquare size={14} />
                                    </a>
                                    <select
                                      value={lead.status || 'Novo'}
                                      onChange={(e) => handleUpdateStatus(lead.id, e.target.value)}
                                      className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border outline-none ${getStatusColor(lead.status)}`}
                                    >
                                      {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                  </div>
                               </div>
                               <div className="flex items-center gap-2 mb-3">
                                  <span className="bg-purple-100 text-purple-600 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wide">{lead.pedido}</span>
                                  <div className="w-1 h-1 bg-gray-300 rounded-full" />
                                  <p className="text-[10px] text-gray-400">{lead.data}</p>
                               </div>
                               <div className="text-xs text-gray-500 bg-white p-3 rounded-xl border border-gray-50">
                                  <p className="truncate font-medium">{lead.email}</p>
                                  <p className="font-bold text-gray-700">{lead.telefone}</p>
                               </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="py-12 text-center text-gray-400">Nenhum lead encontrado.</div>
                    )}
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 max-w-2xl mx-auto">
                  <button 
                    onClick={() => setShowLeadForm(false)}
                    className="flex items-center gap-2 text-gray-400 hover:text-gray-900 mb-6 transition-colors font-medium text-sm"
                  >
                    <ArrowLeft className="w-4 h-4" /> Voltar para lista
                  </button>

                  <h3 className="text-2xl font-black mb-2">Cadastrar Novo Pedido</h3>
                  <p className="text-gray-500 mb-8">Preencha as informações do cliente para gerar o lead.</p>

                  <form onSubmit={handleAddLead} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Nome do Cliente</label>
                        <input 
                          type="text" required
                          value={newLead.nome} onChange={(e) => setNewLead({...newLead, nome: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#177BCA]/20 focus:border-[#177BCA] transition-all"
                          placeholder="Ex: João Silva"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">E-mail</label>
                          <input 
                            type="email" required
                            value={newLead.email} onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#177BCA]/20 focus:border-[#177BCA] transition-all"
                            placeholder="joao@email.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Telefone / WhatsApp</label>
                          <input 
                            type="tel" required
                            value={newLead.telefone} onChange={(e) => setNewLead({...newLead, telefone: formatPhone(e.target.value)})}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#177BCA]/20 focus:border-[#177BCA] transition-all"
                            placeholder="(00) 00000-0000"
                            maxLength="15"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Tipo de Pedido</label>
                        <select 
                          value={newLead.pedido} onChange={(e) => setNewLead({...newLead, pedido: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#177BCA]/20 focus:border-[#177BCA] transition-all text-gray-900"
                        >
                          <option value="Camisas Esportivas">Camisas Esportivas</option>
                          <option value="Camisas Personalizadas">Camisas Personalizadas</option>
                          <option value="Criações de Logotipo">Criações de Logotipo</option>
                          <option value="Design Geral">Design Geral</option>
                          <option value="Cards & Social Media">Cards & Social Media</option>
                          <option value="Arte de Camisa">Arte de Camisa</option>
                          <option value="Edição de Vídeo">Edição de Vídeo</option>
                          <option value="Currículo Personalizado">Currículo Personalizado</option>
                        </select>
                      </div>

                      {newLead.pedido.startsWith('Camisas') && (
                        <div className="animate-[fadeIn_0.3s_ease-out]">
                          <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Tamanho da Camisa</label>
                          <input 
                            type="text" required
                            value={newLead.tamanho} onChange={(e) => setNewLead({...newLead, tamanho: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#177BCA]/20 focus:border-[#177BCA] transition-all"
                            placeholder="Ex: P, M, G ou GG"
                          />
                        </div>
                      )}

                      {!newLead.pedido.startsWith('Camisas') && (
                        <div className="animate-[fadeIn_0.3s_ease-out]">
                          <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Informações Adicionais (Opcional)</label>
                          <input 
                            type="text"
                            value={newLead.detalhes} onChange={(e) => setNewLead({...newLead, detalhes: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#177BCA]/20 focus:border-[#177BCA] transition-all"
                            placeholder="Ex: Referências ou notas extras..."
                          />
                        </div>
                      )}
                    </div>

                    <div className="pt-4 flex justify-end">
                      <button 
                        type="submit"
                        className="bg-[#177BCA] hover:bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/20 w-full"
                      >
                        Gerar Lead de Pedido
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {activeTab === 'configuracoes' && (
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold mb-6">Configurações Gerais</h3>
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                  <Settings className="w-10 h-10" />
                </div>
                <h4 className="text-lg font-bold mb-2">Ajustes do Sistema</h4>
                <p className="text-gray-400">Esta área permitirá alterar dados da empresa e configurações do site.</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Navigation Bar */}
      <nav className="fixed bottom-0 left-0 w-full bg-[#0E1012] border-t border-white/10 px-2 py-3 lg:hidden flex items-center justify-around z-50 backdrop-blur-xl">
        <MobileNavItem icon={<LayoutDashboard />} label="Início" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
        <MobileNavItem icon={<Users />} label="Clientes" active={activeTab === 'clientes'} onClick={() => setActiveTab('clientes')} />
        <MobileNavItem icon={<MessageSquare />} label="Pedidos" active={activeTab === 'pedidos'} onClick={() => setActiveTab('pedidos')} />
        <MobileNavItem icon={<Settings />} label="Ajustes" active={activeTab === 'configuracoes'} onClick={() => setActiveTab('configuracoes')} />
        <button onClick={handleLogout} className="flex flex-col items-center gap-1 text-red-400 p-2">
          <LogOut size={20} />
          <span className="text-[10px] font-bold">Sair</span>
        </button>
      </nav>
    </div>
  );
}

function MobileNavItem({ icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 p-2 transition-all ${active ? 'text-[#177BCA]' : 'text-gray-500'}`}
    >
      <div className={`p-2 rounded-xl transition-all ${active ? 'bg-[#177BCA]/10 scale-110' : ''}`}>
        {React.cloneElement(icon, { size: 22 })}
      </div>
      <span className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-[#177BCA]' : 'text-gray-500'}`}>{label}</span>
      {active && <div className="w-1 h-1 bg-[#177BCA] rounded-full mt-0.5 shadow-[0_0_8px_#177BCA]"></div>}
    </button>
  );
}


function SidebarLink({ icon, label, active = false, badge = null, onClick }) {
  return (
    <a onClick={onClick} className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group cursor-pointer ${
      active ? 'bg-[#177BCA] text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`}>
      <div className="flex items-center gap-4">
        <span className={`${active ? 'text-white' : 'text-gray-500 group-hover:text-[#177BCA]'} transition-colors`}>
          {React.cloneElement(icon, { size: 20 })}
        </span>
        <span className="font-bold text-sm tracking-wide">{label}</span>
      </div>
      {badge && (
        <span className="bg-[#177BCA] text-white text-[10px] font-black px-2 py-0.5 rounded-lg border border-white/20">
          {badge}
        </span>
      )}
    </a>
  );
}

function StatCard({ label, value, change }) {
  return (
    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all group">
      <p className="text-gray-400 text-sm font-medium mb-2">{label}</p>
      <div className="flex items-end justify-between">
        <h4 className="text-3xl font-black">{value}</h4>
        <span className="text-green-500 text-xs font-bold mb-1">{change}</span>
      </div>
    </div>
  );
}

function MessageItem({ name, email, status }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-50 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center font-bold text-[#177BCA]">
          {name.charAt(0)}
        </div>
        <div>
          <p className="font-bold text-sm">{name}</p>
          <p className="text-gray-400 text-xs">{email}</p>
        </div>
      </div>
      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
        status === 'Pendente' ? 'bg-orange-50 text-orange-600' : 
        status === 'Finalizado' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
      }`}>
        {status}
      </span>
    </div>
  );
}

function QuickButton({ label }) {
  return (
    <button className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all text-left flex items-center justify-between group">
      {label}
      <ChevronRight className="w-4 h-4 opacity-50 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
    </button>
  );
}
