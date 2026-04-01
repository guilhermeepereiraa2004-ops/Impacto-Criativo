import React, { useState } from 'react';
import logo from '../assets/Logo.png';
import headerBg from '../assets/foto-nova-correta.png';
import { 
  Menu, 
  X, 
  PenTool, 
  Shirt, 
  Video, 
  Layout, 
  Hexagon, 
  Palette,
  ChevronRight,
  Instagram,
  Facebook,
  Mail,
  Phone,
  Sparkles,
  CheckCircle,
  Clock,
  Award,
  Lightbulb,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    pedido: 'Camisas Esportivas',
    tamanho: '',
    detalhes: ''
  });
  const [submitStatus, setSubmitStatus] = useState(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus('loading');
    
    // 1. Prepare data
    const leadData = {
      ...formData,
      status: 'Novo',
      data: new Date().toLocaleDateString('pt-BR')
    };

    // 2. Try to save to Supabase
    let supabaseError = null;
    try {
      const { error } = await supabase
        .from('leads')
        .insert([leadData]);
      if (error) {
        console.error('Erro ao salvar no Supabase:', error);
        supabaseError = error;
      }
    } catch (err) {
      console.error('Conexão Supabase não configurada ou erro de rede.');
    }

    // 3. Always save to localStorage (fallback/offline sync)
    const existingLeadsStr = localStorage.getItem('impacto_leads');
    const savedLeads = existingLeadsStr ? JSON.parse(existingLeadsStr) : [];
    localStorage.setItem('impacto_leads', JSON.stringify([{...leadData, id: Date.now()}, ...savedLeads]));

    // 4. Update UI
    setTimeout(() => {
      setSubmitStatus('success');
      setFormData({ nome: '', email: '', telefone: '', pedido: 'Camisas Esportivas', tamanho: '', detalhes: '' });
      setTimeout(() => setSubmitStatus(null), 3000);
    }, 1000);
  };
  
  const handleServiceClick = (serviceTitle) => {
    setFormData(prev => ({ ...prev, pedido: serviceTitle }));
    const element = document.getElementById('contato');
    if (element) {
      const yOffset = -80; 
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const services = [
    {
      title: "Camisas Esportivas",
      description: "Designs de alta performance para times e atletas, unindo estilo e funcionalidade no campo.",
      icon: <Shirt size={28} />
    },
    {
      title: "Camisas Personalizadas",
      description: "Transformamos sua ideia em vestuário único para eventos, empresas ou uso pessoal.",
      icon: <Shirt size={28} />
    },
    {
      title: "Criações de Logotipo",
      description: "Identidades visuais memoráveis que capturam a essência da sua marca e conectam com seu público.",
      icon: <Hexagon size={28} />
    },
    {
      title: "Design Geral",
      description: "Soluções visuais para qualquer necessidade, do digital ao impresso, com criatividade e técnica.",
      icon: <Palette size={28} />
    },
    {
      title: "Cards & Social Media",
      description: "Conteúdo visual estratégico para engajar sua audiência e fortalecer sua presença online.",
      icon: <Layout size={28} />
    },
    {
      title: "Arte de Camisa",
      description: "Ilustrações e artes exclusivas prontas para estamparia com alto nível de detalhe.",
      icon: <PenTool size={28} />
    },
    {
      title: "Edição de Vídeo",
      description: "Edições profissionais e dinâmicas para Reels, vídeos institucionais ou conteúdo pessoal.",
      icon: <Video size={28} />
    },
    {
      title: "Currículo Personalizado",
      description: "Destaque-se no mercado de trabalho com um currículo profissional, moderno e estrategicamente desenhado.",
      icon: <FileText size={28} />
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-[#0E1012] selection:bg-[#177BCA] selection:text-white textured textured-light">
      
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-5 cursor-pointer group py-2">
              <img src={logo} alt="Impacto Criativo" className="w-20 h-20 object-contain transform group-hover:scale-105 transition-transform duration-300" />
              <span className="text-[#0E1012] text-2xl font-bold tracking-tight">
                Impacto<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#177BCA] to-blue-400">Criativo</span>
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-gray-600 hover:text-[#177BCA] font-medium transition-colors">Início</a>
              <a href="#sobre" className="text-gray-600 hover:text-[#177BCA] font-medium transition-colors">Sobre</a>
              <a href="#servicos" className="text-gray-600 hover:text-[#177BCA] font-medium transition-colors">Serviços</a>
              <Link to="/admin" className="text-gray-600 hover:text-[#177BCA] font-medium transition-colors">Admin</Link>
              <a href="#contato" className="bg-gradient-to-r from-[#177BCA] to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2.5 rounded-full font-medium transition-all transform hover:scale-105 shadow-md shadow-blue-500/20">
                Faça um Orçamento
              </a>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={toggleMenu}
                className="text-gray-600 hover:text-[#0E1012] focus:outline-none p-2 rounded-lg bg-gray-50"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-gray-100 absolute w-full shadow-2xl">
            <div className="px-4 pt-2 pb-6 space-y-2">
              <a href="#home" onClick={toggleMenu} className="block px-4 py-3 text-base font-medium text-gray-600 hover:text-[#177BCA] hover:bg-gray-50 rounded-xl transition-colors">Início</a>
              <a href="#sobre" onClick={toggleMenu} className="block px-4 py-3 text-base font-medium text-gray-600 hover:text-[#177BCA] hover:bg-gray-50 rounded-xl transition-colors">Sobre</a>
              <a href="#servicos" onClick={toggleMenu} className="block px-4 py-3 text-base font-medium text-gray-600 hover:text-[#177BCA] hover:bg-gray-50 rounded-xl transition-colors">Serviços</a>
              <Link to="/admin" onClick={toggleMenu} className="block px-4 py-3 text-base font-medium text-gray-600 hover:text-[#177BCA] hover:bg-gray-50 rounded-xl transition-colors">Admin</Link>
              <a href="#contato" onClick={toggleMenu} className="block px-4 py-3 mt-4 text-center text-base font-bold bg-gradient-to-r from-[#177BCA] to-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20">
                Faça um Orçamento
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative pt-32 pb-20 lg:pt-52 lg:pb-40 bg-[#0E1012] overflow-hidden textured textured-dark">
        {/* Fullscreen Background Image with Overlay */}
        <div 
          className="absolute inset-0 z-0 opacity-50 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${headerBg})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#0E1012] via-transparent to-[#0E1012]"></div>
        </div>

        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#177BCA]/20 rounded-full blur-[150px]"></div>
          <div className="absolute top-[20%] right-[20%] w-[20%] h-[20%] bg-purple-500/10 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-3 py-2 px-6 rounded-full bg-white/5 border border-white/20 text-[#177BCA] text-xs font-bold tracking-[0.2em] mb-10 backdrop-blur-sm shadow-xl shadow-blue-500/5 group hover:bg-[#177BCA]/10 transition-all duration-300">
            <Sparkles className="w-3.5 h-3.5 fill-current animate-pulse group-hover:scale-125 transition-transform" />
            <span className="uppercase">Design & Comunicação Visual</span>
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tight mb-8 leading-[1.1]">
            A energia da <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#177BCA] via-blue-400 to-[#177BCA] animate-gradient-x">
              sua ideia.
            </span>
          </h1>
          <p className="mt-6 text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12 font-light leading-relaxed">
            Transformamos conceitos em visuais poderosos.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-5">
            <a href="#servicos" className="bg-gradient-to-r from-[#177BCA] to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-1">
              Conheça nossos serviços
              <ChevronRight className="w-5 h-5" />
            </a>
            <a href="#contato" className="bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-white/20 text-white px-8 py-4 rounded-full font-bold text-lg transition-all flex items-center justify-center hover:-translate-y-1">
              Falar com um especialista
            </a>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce">
          <span className="text-gray-500 text-sm font-medium mb-2">Rolar para baixo</span>
          <div className="w-1 h-8 bg-gradient-to-b from-gray-500 to-transparent rounded-full"></div>
        </div>
      </section>

      <section id="servicos" className="py-32 relative overflow-hidden bg-[#FAFAFA] textured textured-light grid-pattern">
        {/* Decorative background glows */}
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-blue-100/30 rounded-full blur-[100px] -translate-x-1/2"></div>
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-[#177BCA]/5 rounded-full blur-[100px] translate-x-1/2"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10 border-b border-gray-100 pb-10">
            <div className="inline-flex items-center gap-3 text-[#177BCA] text-xs font-black tracking-[0.4em] uppercase mb-8">
              <div className="w-6 h-[1.5px] bg-[#177BCA]"></div>
              Especialidades
              <div className="w-6 h-[1.5px] bg-[#177BCA]"></div>
            </div>
            <h3 className="text-4xl md:text-7xl font-black text-[#0E1012] leading-none tracking-tight mb-8">
              Design que gera <br/>
              <span className="text-[#177BCA]">resultados.</span>
            </h3>
            <p className="text-gray-500 text-xl font-light leading-relaxed max-w-2xl mx-auto">
              Transformamos conceitos em visuais poderosos que conectam sua marca ao público ideal.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <div 
                key={index} 
                className="group relative bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-blue-500/5 hover:-translate-y-2 transition-all duration-500 flex flex-col items-start"
              >
                <div className="mb-8 relative overflow-hidden inline-block transition-transform duration-500 group-hover:-translate-y-2">
                  <div className="w-16 h-16 bg-[#177BCA] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20 group-hover:rotate-6 transition-transform duration-500">
                    {service.icon}
                  </div>
                </div>
                <h4 className="text-xl font-bold text-[#0E1012] mb-4 group-hover:text-[#177BCA] transition-colors tracking-tight">{service.title}</h4>
                <p className="text-gray-500 text-sm font-light leading-relaxed mb-8 flex-grow">
                  {service.description}
                </p>
                <button 
                  onClick={() => handleServiceClick(service.title)}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#177BCA]/10 hover:bg-[#177BCA] text-[#177BCA] hover:text-white px-5 py-3 rounded-xl text-sm font-black transition-all duration-300 group-hover:translate-y-0"
                >
                  Contrate agora
                  <ChevronRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section / About snippet */}
      <section id="sobre" className="py-32 bg-[#177BCA] relative overflow-hidden textured textured-blue">
        {/* Abstract background shapes */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 translate-x-1/4 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-blue-400/20 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            
            <div className="lg:w-3/5 text-center lg:text-left">
              <div className="flex items-center gap-3 text-blue-200 text-xs font-black tracking-[0.4em] uppercase mb-8 justify-center lg:justify-start">
                <div className="w-10 h-[1px] bg-blue-300"></div>
                O Próximo Passo
              </div>

              <h2 className="text-5xl md:text-7xl font-black text-white mb-10 leading-tight tracking-tight">
                Pronto para causar <br className="hidden md:block"/>
                um <span className="underline decoration-blue-400 underline-offset-8">Impacto?</span>
              </h2>
              
              <p className="text-blue-50 text-xl mb-12 leading-relaxed font-light max-w-2xl mx-auto lg:mx-0">
                Nossa missão é materializar a energia da sua ideia através de design de excelência. Seja criando uma marca do zero, editando um vídeo institucional ou produzindo o vestuário da sua equipe.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 text-left">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl group hover:bg-white hover:scale-105 transition-all duration-300">
                  <Award className="w-10 h-10 text-white group-hover:text-[#177BCA] mb-4 transition-colors" />
                  <h4 className="text-white group-hover:text-[#177BCA] font-bold mb-2 transition-colors">Qualidade Premium</h4>
                  <p className="text-blue-100 group-hover:text-gray-600 text-sm transition-colorsLeading-tight">Foco absoluto em cada detalhe.</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl group hover:bg-white hover:scale-105 transition-all duration-300">
                  <Clock className="w-10 h-10 text-white group-hover:text-[#177BCA] mb-4 transition-colors" />
                  <h4 className="text-white group-hover:text-[#177BCA] font-bold mb-2 transition-colors">Entrega Rápida</h4>
                  <p className="text-blue-100 group-hover:text-gray-600 text-sm transition-colorsLeading-tight">Prazos respeitados à risca.</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl group hover:bg-white hover:scale-105 transition-all duration-300">
                  <CheckCircle className="w-10 h-10 text-white group-hover:text-[#177BCA] mb-4 transition-colors" />
                  <h4 className="text-white group-hover:text-[#177BCA] font-bold mb-2 transition-colors">Atendimento</h4>
                  <p className="text-blue-100 group-hover:text-gray-600 text-sm transition-colorsLeading-tight">Acompanhamento próximo e dedicado.</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a href="#contato" className="bg-white text-[#177BCA] hover:bg-blue-50 px-10 py-5 rounded-2xl font-black text-lg transition-all shadow-2xl shadow-blue-900/30 flex items-center justify-center gap-3 active:scale-95 group">
                  Solicitar orçamento agora
                  <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>

            <div className="lg:w-2/5 flex justify-center w-full">
               <div className="relative group">
                  {/* Background Aura */}
                  <div className="absolute inset-0 bg-blue-400 blur-[150px] opacity-20 group-hover:opacity-40 transition-opacity duration-1000"></div>
                  
                  {/* Elegant Energy Wheel System */}
                  <div className="relative scale-90 sm:scale-100 lg:scale-125 transition-transform duration-700">
                     
                     {/* Outer Complex Ring */}
                     <div className="absolute inset-0 w-80 h-80 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 border border-white/5 rounded-full animate-[spin_50s_linear_infinite]"></div>
                     
                     {/* Middle Ring with Orbiting Nodes */}
                     <div className="w-72 h-72 border-2 border-white/10 rounded-full flex items-center justify-center animate-[spin_40s_linear_infinite] relative">
                        {/* Orbiting Glass Cards */}
                        <div className="absolute top-0 -translate-y-1/2 bg-white/10 backdrop-blur-xl p-3.5 rounded-2xl border border-white/20 shadow-2xl animate-[spin_40s_linear_infinite_reverse]">
                           <Palette className="w-6 h-6 text-white" />
                        </div>
                        <div className="absolute bottom-0 translate-y-1/2 bg-white/10 backdrop-blur-xl p-3.5 rounded-2xl border border-white/20 shadow-2xl animate-[spin_40s_linear_infinite_reverse]">
                           <Shirt className="w-6 h-6 text-white" />
                        </div>
                        <div className="absolute right-0 translate-x-1/2 bg-white/10 backdrop-blur-xl p-3.5 rounded-2xl border border-white/20 shadow-2xl animate-[spin_40s_linear_infinite_reverse]">
                           <Video className="w-6 h-6 text-white" />
                        </div>
                        <div className="absolute left-0 -translate-x-1/2 bg-white/10 backdrop-blur-xl p-3.5 rounded-2xl border border-white/20 shadow-2xl animate-[spin_40s_linear_infinite_reverse]">
                           <Hexagon className="w-6 h-6 text-white" />
                        </div>
                     </div>

                     {/* Inner Pulsing Ring */}
                     <div className="absolute inset-0 w-52 h-52 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 border border-white/20 border-dashed rounded-full animate-[spin_30s_linear_infinite_reverse]"></div>
                     
                     {/* Refined Center Core */}
                     <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative">
                           {/* Core Glow */}
                           <div className="absolute inset-0 bg-[#177BCA] blur-3xl opacity-30 rounded-full"></div>
                           
                           {/* Core Container */}
                           <div className="relative w-40 h-40 bg-white/95 backdrop-blur-2xl rounded-full flex flex-col items-center justify-center shadow-[0_0_80px_rgba(255,255,255,0.4)] border border-white/50">
                              <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-white rounded-3xl flex items-center justify-center mb-1.5 shadow-inner border border-blue-100">
                                 <Lightbulb className="w-10 h-10 text-[#177BCA] animate-pulse drop-shadow-lg fill-blue-500/5" />
                              </div>
                              <div className="flex flex-col items-center">
                                 <span className="text-[12px] font-black text-[#177BCA] tracking-[0.3em] mb-0.5">ENERGIA</span>
                                 <span className="text-[10px] font-bold text-gray-400 tracking-[0.1em]">CRIATIVA</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

          </div>
        </div>
      </section>

      {/* Lead Generator / Orçamento Section */}
      <section id="contato" className="py-32 bg-gray-50 relative overflow-hidden textured textured-light grid-pattern">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-[#177BCA]/5 rounded-l-full blur-3xl pointer-events-none -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-blue-400/10 rounded-r-full blur-3xl pointer-events-none translate-y-1/4"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-white rounded-[3rem] shadow-2xl shadow-blue-900/5 overflow-hidden flex flex-col lg:flex-row border border-gray-100 textured textured-light grid-pattern">
            {/* Left side: Info */}
            <div className="w-full lg:w-5/12 bg-gradient-to-br from-[#0E1012] to-gray-900 p-12 lg:p-16 text-white flex flex-col justify-center relative">
              <div className="absolute top-0 right-0 w-full h-full bg-[#177BCA]/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
              
              <div className="relative z-10">
                <h3 className="text-4xl font-black mb-6 leading-tight tracking-tight">
                  Faça seu <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-[#177BCA]">Pedido</span> agora
                </h3>
                <p className="text-gray-400 font-light text-lg mb-10 leading-relaxed">
                  Preencha o formulário e nossa equipe entrará em contato para dar andamento no seu projeto.
                </p>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/20 Backdrop-blur-sm">
                      <Clock className="w-5 h-5 text-blue-300" />
                    </div>
                    <div>
                      <p className="font-bold">Resposta Rápida</p>
                      <p className="text-gray-400 text-sm">Em até 30 minutos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/20 Backdrop-blur-sm">
                      <Palette className="w-5 h-5 text-blue-300" />
                    </div>
                    <div>
                      <p className="font-bold">Atendimento Personalizado</p>
                      <p className="text-gray-400 text-sm">Para alinhar sua visão visualmente</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: Form */}
            <div className="w-full lg:w-7/12 p-12 lg:p-16 relative z-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Seu Nome Completo</label>
                    <input 
                      type="text" required
                      value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#177BCA]/20 focus:border-[#177BCA] transition-all"
                      placeholder="Como gostaria de ser chamado?"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Seu E-mail</label>
                      <input 
                        type="email" required
                        value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#177BCA]/20 focus:border-[#177BCA] transition-all"
                        placeholder="contato@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Telefone / WhatsApp</label>
                      <input 
                        type="tel" required
                        value={formData.telefone} onChange={(e) => setFormData({...formData, telefone: formatPhone(e.target.value)})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#177BCA]/20 focus:border-[#177BCA] transition-all"
                        placeholder="(00) 00000-0000"
                        maxLength="15"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">O que você precisa?</label>
                    <div className="relative">
                      <select 
                        required
                        value={formData.pedido} onChange={(e) => setFormData({...formData, pedido: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 appearance-none focus:outline-none focus:ring-2 focus:ring-[#177BCA]/20 focus:border-[#177BCA] transition-all text-gray-900 cursor-pointer"
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
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-6 text-gray-500">
                        <ChevronRight className="w-5 h-5 rotate-90" />
                      </div>
                    </div>
                  </div>

                  {formData.pedido.startsWith('Camisas') && (
                    <div className="animate-[fadeIn_0.3s_ease-out]">
                      <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Tamanho da Camisa</label>
                      <input 
                        type="text" required
                        value={formData.tamanho} onChange={(e) => setFormData({...formData, tamanho: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#177BCA]/20 focus:border-[#177BCA] transition-all"
                        placeholder="Ex: P, M, G ou GG"
                      />
                    </div>
                  )}

                  {!formData.pedido.startsWith('Camisas') && (
                    <div className="animate-[fadeIn_0.3s_ease-out]">
                      <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Informações Adicionais (Opcional)</label>
                      <input 
                        type="text"
                        value={formData.detalhes} onChange={(e) => setFormData({...formData, detalhes: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#177BCA]/20 focus:border-[#177BCA] transition-all"
                        placeholder="Ex: Detalhes, referências ou dúvidas..."
                      />
                    </div>
                  )}
                </div>

                <div className="pt-6">
                  <button 
                    type="submit" disabled={submitStatus === 'loading' || submitStatus === 'success'}
                    className="w-full bg-[#177BCA] hover:bg-blue-600 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {submitStatus === 'loading' ? (
                       <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : submitStatus === 'success' ? (
                       <span className="flex items-center gap-2"><CheckCircle className="w-5 h-5" /> Pedido Registrado!</span>
                    ) : (
                       <span className="flex items-center gap-2">Enviar Pedido <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
                    )}
                  </button>
                  <p className="text-center text-xs text-gray-400 mt-4">Ao enviar, nossa equipe entrará em contato o mais breve possível.</p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Blue Footer */}
      <footer className="bg-[#177BCA] pt-16 pb-12 relative overflow-hidden textured textured-blue">
        {/* Decorative shapes — same style as the 'sobre' section */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-blue-400/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12 mb-12">
            {/* Logo */}
            <div className="flex items-center gap-5">
              <img src={logo} alt="Impacto Criativo" className="w-20 h-20 object-contain brightness-0 invert" />
              <span className="text-white text-2xl font-bold tracking-tight">
                Impacto<span className="text-blue-100">Criativo</span>
              </span>
            </div>

            {/* Contact Info */}
            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
              <div className="flex items-center gap-3 group cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white transition-all border border-white/20">
                  <Phone className="w-5 h-5 text-white group-hover:text-[#177BCA] transition-colors" />
                </div>
                <span className="text-blue-100 font-medium group-hover:text-white transition-colors">(00) 00000-0000</span>
              </div>
              <div className="flex items-center gap-3 group cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white transition-all border border-white/20">
                  <Mail className="w-5 h-5 text-white group-hover:text-[#177BCA] transition-colors" />
                </div>
                <span className="text-blue-100 font-medium group-hover:text-white transition-colors">contato@impactocriativo.com.br</span>
              </div>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-[#177BCA] transition-all">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-[#177BCA] transition-all">
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
            <p className="text-blue-100/70 text-sm font-light">
              &copy; {new Date().getFullYear()} Impacto Criativo. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <p className="text-white/80 text-xs font-black tracking-[0.2em] italic uppercase">
                A energia da sua ideia
              </p>
            </div>
          </div>
        </div>
      </footer>



    </div>
  );
}
