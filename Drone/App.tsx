
import React, { useState } from 'react';
import { 
  Target, 
  Briefcase, 
  ShoppingCart, 
  Youtube, 
  ExternalLink,
  Menu,
  X,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Info,
  ChevronDown,
  HelpCircle,
  User,
  BookOpen,
  GraduationCap,
  CalendarCheck,
  Eye,
  Zap,
  Radio
} from 'lucide-react';
import { PRODUCTS, CHANNELS, SHOPS, OFFICIAL_LINKS, PART107_STEPS } from './constants';
import { Part107Step, Product } from './types';

const StepIcon = ({ name, className }: { name: Part107Step['iconName']; className?: string }) => {
  switch (name) {
    case 'User': return <User className={className} />;
    case 'BookOpen': return <BookOpen className={className} />;
    case 'GraduationCap': return <GraduationCap className={className} />;
    case 'CalendarCheck': return <CalendarCheck className={className} />;
    default: return <Info className={className} />;
  }
};

const CategoryIcon = ({ category, className }: { category: Product['category']; className?: string }) => {
  switch (category) {
    case 'goggles': return <Eye className={className} />;
    case 'radio': return <Radio className={className} />;
    case 'drone': return <Zap className={className} />;
    default: return <Zap className={className} />;
  }
};

const App: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'goggles' | 'radio' | 'drone'>('all');
  const [comparisonView, setComparisonView] = useState<'hobby' | 'pro'>('hobby');
  const [showCommercialNuances, setShowCommercialNuances] = useState(false);

  const filteredProducts = activeTab === 'all' 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === activeTab);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-white scroll-smooth">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center transform rotate-12 transition-transform hover:rotate-0">
                <Navigation className="text-white w-5 h-5 transform -rotate-12" />
              </div>
              <div className="flex flex-col -space-y-1">
                <span className="text-lg font-black tracking-tighter bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent uppercase">
                  SKYBOUND
                </span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest opacity-70">
                  A Resource by LaB Media
                </span>
              </div>
            </div>
            
            {/* Nav links removed for a cleaner single-page experience */}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 lg:pt-52 lg:pb-40 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl -z-10">
          <div className="absolute top-1/4 left-0 w-72 h-72 bg-cyan-500/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-6xl lg:text-8xl font-black tracking-tighter mb-8 bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent uppercase">
            Fly Free. <br />Fly Smart.
          </h1>
          <p className="text-xl lg:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
            The ultimate blueprint for hobbyist freedom and commercial dominance. From your first whoop to Part 107 certification.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <a href="#comparison" className="w-full sm:w-auto px-10 py-5 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-cyan-900/40 transition-all flex items-center justify-center gap-3">
              Explore Limits <ArrowRight size={20} />
            </a>
            <a href="#pro-path" className="w-full sm:w-auto px-10 py-5 bg-slate-800 hover:bg-slate-700 text-white font-black uppercase tracking-widest rounded-2xl border border-slate-700 transition-all">
              Go Commercial
            </a>
          </div>
        </div>
      </section>

      {/* Comparison Toggle Section */}
      <section id="comparison" className="py-24 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4 uppercase">Rules of the Sky</h2>
            <p className="text-slate-400">Understanding your legal boundaries as a pilot.</p>
          </div>

          <div className="flex justify-center mb-12">
            <div className="inline-flex p-1 bg-slate-800 rounded-2xl border border-slate-700">
              <button 
                onClick={() => setComparisonView('hobby')}
                className={`px-8 py-3 rounded-xl font-bold transition-all ${comparisonView === 'hobby' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}
              >
                Hobbyist
              </button>
              <button 
                onClick={() => setComparisonView('pro')}
                className={`px-8 py-3 rounded-xl font-bold transition-all ${comparisonView === 'pro' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
              >
                Commercial
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Hobbyist Info */}
            <div className={`p-8 rounded-3xl border transition-all duration-500 flex flex-col ${comparisonView === 'hobby' ? 'bg-cyan-950/20 border-cyan-500/50' : 'bg-slate-900 border-slate-800 opacity-50'}`}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                  <Target className="text-cyan-400" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight">Hobbyist Mission</h3>
              </div>
              <ul className="space-y-4 flex-grow">
                {[
                  'Fly for personal enjoyment only (No $ compensation).',
                  'Max Altitude: 400 feet above ground level.',
                  'Maintain Visual Line of Sight (VLOS) at all times.',
                  'Registration: Required if drone weighs > 250g.',
                  'TRUST: Must carry proof of passed knowledge test.',
                  'Remote ID: Required for all drones needing registration.'
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 text-slate-300 text-sm">
                    <CheckCircle2 className="text-cyan-500 shrink-0 mt-0.5" size={16} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 p-4 bg-amber-500/10 rounded-xl border border-amber-500/20 flex gap-3">
                <AlertTriangle className="text-amber-500 shrink-0" size={20} />
                <p className="text-xs text-amber-200/80 leading-relaxed">
                  NOTE: Even "indirect" compensation (like monetized YouTube videos or free product) is considered Commercial by the FAA.
                </p>
              </div>
            </div>

            {/* Commercial Info */}
            <div className={`p-8 rounded-3xl border transition-all duration-500 flex flex-col ${comparisonView === 'pro' ? 'bg-blue-950/20 border-blue-500/50' : 'bg-slate-900 border-slate-800 opacity-50'}`}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Briefcase className="text-blue-400" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight">Professional Path</h3>
              </div>
              <ul className="space-y-4 flex-grow">
                {[
                  'Earn money, promote a business, or do mapping/inspections.',
                  'Fly in controlled airspace with LAANC approval.',
                  'Monetize social media content legally.',
                  'Remote Pilot Certificate: Valid for 24 months.',
                  'Fly at night (with appropriate lighting).',
                  'Professional liability and hull insurance eligibility.'
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 text-slate-300 text-sm">
                    <CheckCircle2 className="text-blue-500 shrink-0 mt-0.5" size={16} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex gap-3">
                <Info className="text-emerald-500 shrink-0" size={20} />
                <p className="text-xs text-emerald-200/80">
                  Requires passing the FAA Part 107 Unmanned Aircraft General exam at a PSI testing center.
                </p>
              </div>
            </div>
          </div>

          {/* Nuances Button */}
          <div className="mt-8 max-w-3xl mx-auto">
            <button 
              onClick={() => setShowCommercialNuances(!showCommercialNuances)}
              className="w-full flex items-center justify-between p-4 bg-slate-900/50 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest"
            >
              <div className="flex items-center gap-3">
                <HelpCircle size={16} className="text-slate-500" />
                <span>The "Hobbyist" Trap: What counts as a business?</span>
              </div>
              <ChevronDown size={16} className={`transition-transform duration-300 ${showCommercialNuances ? 'rotate-180' : ''}`} />
            </button>
            
            <div className={`overflow-hidden transition-all duration-300 ${showCommercialNuances ? 'max-h-96 mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 space-y-4 text-xs text-slate-400 leading-relaxed">
                <p>
                  The FAA definition of "recreational" is incredibly narrow. It means purely for fun. 
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                    <h5 className="font-bold text-white mb-2 uppercase tracking-widest text-[10px]">Commercial Scenarios:</h5>
                    <ul className="space-y-1">
                      <li>• Helping a friend sell their house</li>
                      <li>• Volunteering at a church or non-profit</li>
                      <li>• Content for a brand's social media</li>
                      <li>• "Test flights" for your own side hustle</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                    <h5 className="font-bold text-white mb-2 uppercase tracking-widest text-[10px]">The Rule:</h5>
                    <p>
                      If the flight furthers ANY business interest (yours or someone else's), you are a Part 107 operator.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Part 107 Pathway */}
      <section id="pro-path" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-6 uppercase tracking-tighter italic">The 107 <span className="text-blue-500">Pathway</span></h2>
            <p className="text-slate-400 text-lg leading-relaxed max-w-xl">
              Get certified and turn your hobby into a profession.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {PART107_STEPS.map((step, idx) => (
              <div key={idx} className="relative group p-8 bg-slate-900 rounded-3xl border border-slate-800 hover:border-blue-500/50 transition-all flex flex-col h-full shadow-lg">
                <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-6 border border-slate-700">
                  <StepIcon name={step.iconName} className="text-blue-500 w-6 h-6" />
                </div>
                <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Step 0{idx + 1}</div>
                <h4 className="text-xl font-black mb-3 uppercase tracking-tight">{step.title}</h4>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed flex-grow">{step.description}</p>
                
                <div className="space-y-2 pt-4 border-t border-slate-800/50">
                  {step.links.map((link, lIdx) => (
                    <a 
                      key={lIdx} 
                      href={link.url} 
                      target="_blank" 
                      className="flex items-center justify-between group/link text-[10px] font-bold text-white hover:text-blue-400 transition-colors uppercase tracking-widest"
                    >
                      {link.label} <ExternalLink size={10} className="opacity-40 group-hover/link:opacity-100" />
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hardware List - Ultra Compact */}
      <section id="gear" className="py-24 bg-slate-950 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-6">
            <div>
              <h2 className="text-3xl font-black mb-2 uppercase italic tracking-tighter">Hardware Select</h2>
              <p className="text-slate-500 text-sm font-medium">Expert-vetted equipment for your FPV fleet.</p>
            </div>
            
            <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800 overflow-x-auto whitespace-nowrap scrollbar-hide">
              {(['all', 'goggles', 'radio', 'drone'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                    activeTab === tab ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/20' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-900 border-t border-b border-slate-900">
            {filteredProducts.map(product => (
              <div 
                key={product.id} 
                className="group flex items-center justify-between py-5 transition-colors"
              >
                <div className="flex-grow pr-6">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-black uppercase tracking-tight text-slate-200 group-hover:text-cyan-400 transition-colors">
                      {product.name}
                    </h3>
                    {product.badge && (
                      <span className="text-[7px] font-black text-cyan-500 uppercase tracking-widest px-1.5 py-0.5 bg-cyan-500/10 rounded border border-cyan-500/20">
                        {product.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-1 group-hover:text-slate-500 transition-colors">
                    {product.description}
                  </p>
                </div>
                
                <a 
                  href={product.link} 
                  target="_blank" 
                  className="px-4 py-2 bg-slate-900 hover:bg-cyan-600 text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-800 transition-all shrink-0 flex items-center gap-2 group/btn"
                >
                  View <ArrowRight size={12} className="group-hover/btn:translate-x-0.5 transition-transform" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Directory Section */}
      <section id="resources" className="py-24 border-t border-slate-900 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter italic">Resources</h2>
            <p className="text-slate-400">Essential links for safe and legal operations.</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Channels */}
            <div>
              <div className="flex items-center gap-3 mb-8 text-slate-400 uppercase tracking-[0.2em] text-[10px] font-black">
                <Youtube className="text-red-500" size={14} />
                <span>Follow & Watch</span>
              </div>
              <div className="space-y-6">
                {CHANNELS.map((channel, idx) => (
                  <a key={idx} href={channel.url} target="_blank" className="group block">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-300 group-hover:text-red-400 transition-colors uppercase text-xs tracking-tight">{channel.name}</span>
                      {channel.isLaBPick && <span className="text-[8px] bg-red-600 text-white px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">LaB Pick</span>}
                    </div>
                    <p className="text-[10px] text-slate-600 leading-tight group-hover:text-slate-500 transition-colors">{channel.description}</p>
                  </a>
                ))}
              </div>
            </div>

            {/* Retailers */}
            <div>
              <div className="flex items-center gap-3 mb-8 text-slate-400 uppercase tracking-[0.2em] text-[10px] font-black">
                <ShoppingCart className="text-cyan-400" size={14} />
                <span>Major Retailers</span>
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                {SHOPS.map((shop, idx) => (
                  <a 
                    key={idx} 
                    href={shop.url} 
                    target="_blank" 
                    className="p-4 bg-slate-900/30 rounded-xl border border-slate-800 hover:border-cyan-500/30 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-bold text-[11px] text-slate-300 group-hover:text-cyan-400 transition-colors uppercase">{shop.name}</div>
                      <div className="text-[9px] text-slate-600 tracking-tight">{shop.description}</div>
                    </div>
                    <ExternalLink size={10} className="text-slate-700 group-hover:text-cyan-500" />
                  </a>
                ))}
              </div>
            </div>

            {/* Compliance */}
            <div>
              <div className="flex items-center gap-3 mb-8 text-slate-400 uppercase tracking-[0.2em] text-[10px] font-black">
                <CheckCircle2 className="text-emerald-400" size={14} />
                <span>Official Compliance</span>
              </div>
              <div className="space-y-2.5">
                {OFFICIAL_LINKS.map((link, idx) => (
                  <a key={idx} href={link.url} target="_blank" className="flex items-start gap-3 p-4 bg-slate-900/30 rounded-xl border border-slate-800 hover:border-emerald-500/30 transition-all group">
                    <Info size={12} className="text-emerald-500/50 mt-1" />
                    <div>
                      <div className="font-bold text-[11px] text-slate-300 group-hover:text-emerald-400 uppercase">{link.name}</div>
                      <div className="text-[9px] text-slate-600 leading-tight group-hover:text-slate-500 transition-colors">{link.description}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subtle Footer Branding */}
      <footer className="bg-slate-950 pt-20 pb-10 overflow-hidden relative border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="mb-14">
            <h2 className="text-4xl font-black tracking-tighter mb-4 uppercase italic">Clear Skies Ahead</h2>
            <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.4em] mb-10">A Resource by LaB Media</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a href="https://faadronezone-access.faa.gov/" target="_blank" className="px-6 py-3 bg-slate-900 border border-slate-800 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-slate-800 transition-all">DroneZone</a>
              <a href="https://iacra.faa.gov" target="_blank" className="px-6 py-3 bg-slate-900 border border-slate-800 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-slate-800 transition-all">IACRA</a>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-900">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-cyan-600 rounded flex items-center justify-center">
                  <Navigation className="text-white w-3 h-3" />
                </div>
                <div className="flex flex-col items-start -space-y-1">
                  <span className="font-black tracking-tighter text-xs uppercase tracking-[0.1em]">SkyBound</span>
                  <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">by LaB Media</span>
                </div>
              </div>
              <div className="text-[9px] text-slate-700 font-bold uppercase tracking-[0.2em]">
                &copy; {new Date().getFullYear()} SkyBound. Flight Safety First.
              </div>
              <div className="flex gap-4 text-[9px] font-black uppercase tracking-widest text-slate-600">
                <a href="#" className="hover:text-cyan-400">Terms</a>
                <a href="#" className="hover:text-cyan-400">Privacy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
