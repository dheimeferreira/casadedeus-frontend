import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, UserPlus, Search, Calendar,
  Droplet, Heart, Menu, X, CheckCircle2, Phone, Loader2, Gift, Send
} from 'lucide-react';

// Endereço do seu Java Spring Boot que está conectado ao Neon
const API_URL = 'http://localhost:8080/api/membros';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [membros, setMembros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMembros();
  }, [activeTab]);

  const fetchMembros = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Falha na resposta do servidor.');
      const data = await response.json();
      setMembros(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Aviso: Não foi possível ligar à API (Spring Boot/Neon). Mostrando modo visualização.');
      // Dados de exemplo caso o Java esteja desligado enquanto testamos o visual
      setMembros([
        { id: 1, nome: 'João Silva (Exemplo)', dataNascimento: '1990-06-15', telefone: '69999999999', ministerio: 'Louvor', batizado: true, gc: true },
        { id: 2, nome: 'Maria Oliveira (Exemplo)', dataNascimento: '1985-11-02', telefone: '69888888888', ministerio: 'Recepção', batizado: false, gc: false }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMembro = async (novoMembro) => {
    try {
      setLoading(true);
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoMembro),
      });

      if (!response.ok) throw new Error('Erro ao guardar membro');

      alert("Membro registado com sucesso na Base de Dados!");
      setActiveTab('membros');
    } catch (err) {
      console.error(err);
      alert('Aviso: O Java está offline. O membro foi adicionado apenas na tela para teste.');
      setMembros([...membros, { ...novoMembro, id: Date.now() }]);
      setActiveTab('membros');
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans flex overflow-hidden">

        {/* SIDEBAR */}
        <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-neutral-900 border-r border-neutral-800 transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <div className="flex flex-col h-full">
            <div className="p-6 flex items-center justify-between border-b border-neutral-800">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 border-2 border-white flex items-center justify-center rounded-sm">
                    <span className="font-bold text-white tracking-tighter">I||D</span>
                  </div>
                  <h1 className="font-bold text-lg tracking-wide uppercase">Casa de Deus</h1>
                </div>
                <span className="text-xs text-amber-500/80 font-medium tracking-widest mt-1">SISTEMA DE GESTÃO</span>
              </div>
              <button className="md:hidden text-neutral-400" onClick={() => setIsMobileMenuOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
              <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => {setActiveTab('dashboard'); setIsMobileMenuOpen(false);}} />
              <NavItem icon={<Users size={20} />} label="Membros" active={activeTab === 'membros'} onClick={() => {setActiveTab('membros'); setIsMobileMenuOpen(false);}} />
              <NavItem icon={<UserPlus size={20} />} label="Novo Registo" active={activeTab === 'novo_membro'} onClick={() => {setActiveTab('novo_membro'); setIsMobileMenuOpen(false);}} />
            </nav>
          </div>
        </aside>

        {isMobileMenuOpen && <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />}

        {/* CONTEÚDO PRINCIPAL */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          <header className="md:hidden flex items-center justify-between p-4 bg-neutral-900 border-b border-neutral-800">
            <div className="w-6 h-6 border-2 border-white flex items-center justify-center rounded-sm">
              <span className="font-bold text-white text-[10px] tracking-tighter">I||D</span>
            </div>
            <button className="text-neutral-300" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-6 lg:p-10 relative">
            {loading && (
                <div className="absolute top-4 right-4 bg-amber-500 text-black px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" /> Sincronizando Banco...
                </div>
            )}
            {error && <div className="bg-red-500/10 text-red-500 p-4 rounded-lg mb-6 border border-red-500/20 text-sm font-medium">{error}</div>}

            {activeTab === 'dashboard' && <DashboardView membros={membros} />}
            {activeTab === 'membros' && <MembrosLista membros={membros} />}
            {activeTab === 'novo_membro' && <FormularioMembro onSave={handleAddMembro} />}
          </div>
        </main>
      </div>
  );
}

// ==========================================
// COMPONENTES INTERNOS DAS TELAS
// ==========================================

function DashboardView({ membros }) {
  const totalMembros = membros.length;
  const batizados = membros.filter(m => m.batizado).length;

  const dataHoje = new Date();
  const mesAtual = dataHoje.getMonth() + 1;
  const diaAtual = dataHoje.getDate();

  const listaAniversariantes = membros.filter(m => {
    if(!m.dataNascimento) return false;
    const partesData = m.dataNascimento.split('-');
    if(partesData.length >= 2) return parseInt(partesData[1]) === mesAtual;
    return false;
  }).sort((a, b) => parseInt(a.dataNascimento.split('-')[2]) - parseInt(b.dataNascimento.split('-')[2]));

  const enviarParabens = (telefone, nome) => {
    const mensagem = encodeURIComponent(`Olá ${nome}! Em nome do Pastor Welber e de toda a Comunidade Casa de Deus, queremos desejar-lhe um Feliz Aniversário! Que Deus o abençoe grandemente neste dia especial. 🎉🙏`);
    window.open(`https://wa.me/55${telefone?.replace(/\D/g, '')}?text=${mensagem}`, '_blank');
  };

  return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold text-white">Visão Geral</h2>
          <p className="text-neutral-400">Acompanhe os dados da Comunidade Casa de Deus.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total de Membros" value={totalMembros} icon={<Users size={24} className="text-amber-500" />} />
          <StatCard title="Aniversariantes do Mês" value={listaAniversariantes.length} icon={<Gift size={24} className="text-emerald-500" />} />
          <StatCard title="Batizados" value={`${totalMembros > 0 ? Math.round((batizados / totalMembros) * 100) : 0}%`} icon={<Droplet size={24} className="text-cyan-500" />} />
          <StatCard title="Em Grupo de Comunhão" value={membros.filter(m => m.gc).length} icon={<Heart size={24} className="text-rose-500" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LISTA DE ANIVERSARIANTES */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col h-96">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-neutral-800">
              <Gift className="text-emerald-500" size={20} />
              <h3 className="text-lg font-semibold text-white">Aniversariantes do Mês</h3>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-2">
              {listaAniversariantes.length > 0 ? (
                  listaAniversariantes.map((m) => {
                    const diaAniversario = parseInt(m.dataNascimento.split('-')[2]);
                    const ehHoje = diaAniversario === diaAtual;

                    return (
                        <div key={m.id} className={`flex items-center justify-between p-3 rounded-xl border ${ehHoje ? 'bg-emerald-950/30 border-emerald-900/50' : 'bg-neutral-950/50 border-neutral-800/50'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center ${ehHoje ? 'bg-emerald-500 text-black' : 'bg-neutral-800 text-neutral-300'}`}>
                              <span className="text-lg font-bold leading-none">{diaAniversario}</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white flex items-center gap-2">
                                {m.nome} {ehHoje && <span className="text-[10px] bg-emerald-500 text-black px-1.5 py-0.5 rounded font-bold">HOJE!</span>}
                              </p>
                              <p className="text-xs text-neutral-500">{m.telefone}</p>
                            </div>
                          </div>
                          {m.telefone && (
                              <button onClick={() => enviarParabens(m.telefone, m.nome)} className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors">
                                <Send size={18} />
                              </button>
                          )}
                        </div>
                    );
                  })
              ) : (
                  <div className="flex flex-col items-center justify-center h-full text-neutral-500">
                    <Gift size={32} className="mb-2 opacity-20" />
                    <p>Nenhum aniversariante neste mês.</p>
                  </div>
              )}
            </div>
          </div>

          {/* ÚLTIMOS CADASTRADOS */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 h-96 flex flex-col">
            <h3 className="text-lg font-semibold text-white mb-4 pb-4 border-b border-neutral-800">Últimos Registos</h3>
            <div className="space-y-3 flex-1 overflow-y-auto pr-2">
              {membros.slice(-5).reverse().map((m, i) => (
                  <div key={m.id || i} className="flex items-center justify-between p-3 rounded-lg bg-neutral-950/50 border border-neutral-800/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-amber-500 font-bold uppercase">
                        {m.nome ? m.nome.charAt(0) : '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{m.nome}</p>
                        <p className="text-xs text-neutral-500">{m.ministerio || 'Sem ministério'}</p>
                      </div>
                    </div>
                  </div>
              ))}
            </div>
          </div>
        </div>
      </div>
  );
}

function MembrosLista({ membros }) {
  const [busca, setBusca] = useState('');
  const membrosFiltrados = membros.filter(m => (m.nome && m.nome.toLowerCase().includes(busca.toLowerCase())) || (m.telefone && m.telefone.includes(busca)));

  return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white">Membros</h2>
            <p className="text-neutral-400">Gerencie a base de dados da igreja.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
            <input type="text" placeholder="Procurar por nome..." value={busca} onChange={(e) => setBusca(e.target.value)} className="w-full md:w-64 bg-neutral-900 border border-neutral-800 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-amber-500 transition-colors"/>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto max-h-[600px]">
            <table className="w-full text-left text-sm relative">
              <thead className="bg-neutral-950 text-neutral-400 uppercase text-xs font-semibold sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4">Nome / Data Nasc.</th>
                <th className="px-6 py-4 text-center">Status Espiritual</th>
                <th className="px-6 py-4">Ministério</th>
                <th className="px-6 py-4">WhatsApp</th>
              </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
              {membrosFiltrados.map((membro) => (
                  <tr key={membro.id} className="hover:bg-neutral-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{membro.nome}</div>
                      <div className="text-xs text-neutral-500">{membro.dataNascimento ? new Date(membro.dataNascimento).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        {membro.batizado && <span className="px-2 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-md text-[10px] font-bold uppercase">Batizado</span>}
                        {membro.gc && <span className="px-2 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-md text-[10px] font-bold uppercase">Em GC</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-neutral-300">{membro.ministerio || '-'}</td>
                    <td className="px-6 py-4">
                      <a href={`https://wa.me/55${membro.telefone?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-amber-500 hover:text-amber-400 text-sm font-medium transition-colors">
                        <Phone size={14} /> Chamar no Whats
                      </a>
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
}

function FormularioMembro({ onSave }) {
  const [formData, setFormData] = useState({
    nome: '', dataNascimento: '', estadoCivil: '', telefone: '', email: '', endereco: '',
    entregouVida: false, batizado: false, desejaBatizar: false, gc: false, ministerio: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    setFormData({nome: '', dataNascimento: '', estadoCivil: '', telefone: '', email: '', endereco: '', entregouVida: false, batizado: false, desejaBatizar: false, gc: false, ministerio: ''});
  };

  return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-white">Nova Ficha de Membresia</h2>
          <p className="text-neutral-400">Preencha os campos abaixo de acordo com a ficha física.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 md:p-8">
          <section>
            <h3 className="text-lg font-semibold text-amber-500 border-b border-neutral-800 pb-2 mb-4">DADOS PESSOAIS</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputGroup label="Nome Completo" name="nome" value={formData.nome} onChange={handleChange} required />
              <InputGroup label="Data de Nascimento" name="dataNascimento" type="date" value={formData.dataNascimento} onChange={handleChange} required />
              <InputGroup label="Telefone / WhatsApp" name="telefone" value={formData.telefone} onChange={handleChange} required />
              <InputGroup label="Estado Civil" name="estadoCivil" value={formData.estadoCivil} onChange={handleChange} />
              <InputGroup label="E-mail" name="email" type="email" value={formData.email} onChange={handleChange} className="md:col-span-2" />
              <InputGroup label="Endereço" name="endereco" value={formData.endereco} onChange={handleChange} className="md:col-span-2" />
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section>
              <h3 className="text-lg font-semibold text-amber-500 border-b border-neutral-800 pb-2 mb-4">DADOS ESPIRITUAIS</h3>
              <div className="space-y-3">
                <Checkbox name="entregouVida" checked={formData.entregouVida} onChange={handleChange} label="Entregou a vida a Jesus" />
                <Checkbox name="batizado" checked={formData.batizado} onChange={handleChange} label="Sou batizado(a) nas águas" />
                <Checkbox name="desejaBatizar" checked={formData.desejaBatizar} onChange={handleChange} label="Desejo batizar-se" />
                <Checkbox name="gc" checked={formData.gc} onChange={handleChange} label="Participo de Grupo de Comunhão (GC)" />
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-amber-500 border-b border-neutral-800 pb-2 mb-4">ÁREA DE INTERESSE PARA SERVIR</h3>
              <select name="ministerio" value={formData.ministerio} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-lg px-4 py-2 focus:border-amber-500 focus:outline-none">
                <option value="">Selecione uma área...</option>
                <option value="Recepção">Recepção</option>
                <option value="Louvor">Louvor</option>
                <option value="Kids">Kids</option>
                <option value="Mídia">Mídia</option>
                <option value="Intercessão">Intercessão</option>
                <option value="Ação Social">Ação Social</option>
              </select>
            </section>
          </div>

          <div className="flex justify-end pt-4 border-t border-neutral-800">
            <button type="submit" className="px-6 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium flex items-center gap-2 shadow-lg transition-colors mt-4">
              <CheckCircle2 size={18} /> Salvar Membro
            </button>
          </div>
        </form>
      </div>
  );
}

// Sub-componentes auxiliares de interface
function NavItem({ icon, label, active, onClick }) { return (<button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-amber-500/10 text-amber-500' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'}`}>{icon} <span className="font-medium">{label}</span></button>); }
function StatCard({ title, value, icon }) { return (<div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center">{icon}</div><div><p className="text-neutral-400 text-sm font-medium">{title}</p><div className="flex items-baseline gap-2"><h3 className="text-2xl font-bold text-white">{value}</h3></div></div></div>); }
function InputGroup({ label, name, type = "text", value, onChange, required, className = "" }) { return (<div className={`flex flex-col gap-1.5 ${className}`}><label className="text-sm font-medium text-neutral-300">{label} {required && <span className="text-amber-500">*</span>}</label><input type={type} name={name} value={value} onChange={onChange} required={required} className="bg-neutral-950 border border-neutral-800 text-white rounded-lg px-4 py-2 focus:border-amber-500 outline-none" /></div>); }
function Checkbox({ label, checked, onChange, name }) { return (<label className="flex items-center gap-3 cursor-pointer group"><div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${checked ? 'bg-amber-500 border-amber-500' : 'border-neutral-700 bg-neutral-950'}`}>{checked && <CheckCircle2 size={14} className="text-neutral-950" />}</div><input type="checkbox" name={name} checked={checked} onChange={onChange} className="hidden" /><span className="text-sm text-neutral-300 group-hover:text-white">{label}</span></label>); }