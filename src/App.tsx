import { useState } from 'react';
import { Award, Briefcase, Users, Wallet, Bell, User, Sparkles } from 'lucide-react';
import Counter from './components/Counter';
import QuoteGenerator from './components/QuoteGenerator';
import Stopwatch from './components/Stopwatch';
import NoteTaker from './components/NoteTaker';
import RewardModal from './components/RewardModal';
import Gigs from './components/Gigs';
import Seekers from './components/Seekers';
import Cwallet from './components/Cwallet';

interface Transaction {
  id: string;
  type: 'deposit' | 'earning' | 'withdrawal';
  amount: number;
  description: string;
  date: string;
  status: 'Approved' | 'Pending' | 'Completed';
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'rewards' | 'gigs' | 'seekers' | 'cwallet'>('rewards');
  const [modal, setModal] = useState({ isOpen: false, reward: 0 });
  const [referralCounts, setReferralCounts] = useState<Record<number, number>>({
    100: 0,
    200: 0,
    300: 0,
    400: 0,
  });

  // Wallet States
  const [walletBalance, setWalletBalance] = useState<number>(10); // R10 welcome reward
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'tx-0',
      type: 'earning',
      amount: 10,
      description: 'Cwallet Welcome Reward',
      date: '03 July 2026, 09:00 AM',
      status: 'Completed'
    }
  ]);

  const addTransaction = (type: 'deposit' | 'earning' | 'withdrawal', amount: number, desc: string) => {
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type,
      amount,
      description: desc,
      date: new Date().toLocaleDateString('en-ZA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) + ' AM',
      status: type === 'deposit' ? 'Pending' : 'Completed'
    };

    setTransactions(prev => [newTx, ...prev]);
    if (type === 'deposit') {
      // For demo, automatically approve deposits after 5 seconds to simulate staff verification!
      setTimeout(() => {
        setTransactions(currentTxs => 
          currentTxs.map(t => t.id === newTx.id ? { ...t, status: 'Approved' } : t)
        );
        setWalletBalance(prevBalance => prevBalance + amount);
      }, 5000);
    }
  };

  const handleWithdraw = (amount: number): boolean => {
    if (amount > walletBalance) return false;
    setWalletBalance(prev => prev - amount);
    return true;
  };

  const updateReferralCount = (reward: number) => {
    setReferralCounts(prev => {
      const current = prev[reward] || 0;
      if (current >= 20) return prev; // Already maxed out
      
      const newCount = current + 1;
      
      // If they reach exactly 20 referrals
      if (newCount === 20) {
        setWalletBalance(b => b + reward);
        addTransaction('earning', reward, `Completed R${reward} Reward Referral Challenge!`);
        
        // Beautiful browser native alert which acts as a fallback for the UI
        setTimeout(() => {
          alert(`🎉 CONGRATULATIONS!\n\nYou have successfully completed all 20 referrals for your R${reward} Reward!\n\nR${reward}.00 has been instantly credited to your Cwallet! 🚀`);
        }, 100);
      }
      
      return { ...prev, [reward]: newCount };
    });
  };

  return (
    <div className="h-screen w-screen bg-stone-100 flex items-center justify-center p-0 md:p-4 font-sans select-none overflow-hidden">
      {/* Container simulating a premium mobile web application frame */}
      <div className="w-full h-full md:max-w-md md:h-[840px] md:rounded-[40px] bg-stone-50 md:shadow-2xl border-0 md:border-[8px] border-stone-900 flex flex-col justify-between relative overflow-hidden">
        
        {/* Top Header Panel */}
        <header className="px-5 py-4 bg-white border-b border-stone-150 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-stone-900 to-indigo-950 flex items-center justify-center text-white shadow-md font-extrabold text-sm">
              CW
            </div>
            <div>
              <span className="text-xs text-stone-400 font-bold uppercase tracking-wider block leading-none mb-0.5">Welcome Back</span>
              <span className="text-sm font-black text-stone-800 tracking-tight flex items-center gap-1">
                Sipho Ndlovu <Sparkles size={12} className="text-amber-500 fill-amber-500" />
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Balance Badge */}
            <div className="bg-stone-900 hover:bg-stone-800 text-white font-extrabold text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm transition-all cursor-pointer" onClick={() => setActiveTab('cwallet')}>
              <Wallet size={12} className="text-blue-400" />
              <span>R{walletBalance.toFixed(0)}</span>
            </div>
            <div className="p-2 text-stone-500 hover:text-stone-800 bg-stone-50 border border-stone-150 rounded-full cursor-pointer">
              <Bell size={16} />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-grow overflow-hidden bg-stone-50 p-5">
          {activeTab === 'rewards' && (
            <div className="w-full flex flex-col h-[calc(100vh-140px)] overflow-y-auto">
              <div className="flex items-center gap-3 mb-6 shrink-0">
                <div className="p-2.5 bg-blue-100 text-blue-700 rounded-2xl">
                  <Award size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-stone-800 tracking-tight">Reward Challenges</h2>
                  <p className="text-xs text-stone-500 font-medium">Click on any bubble to activate, top up, & track referrals</p>
                </div>
              </div>

              {/* Bubbles Grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 py-4 justify-items-center flex-grow overflow-y-auto max-h-[500px] pr-1">
                <div onClick={() => setModal({ isOpen: true, reward: 100 })} className="cursor-pointer">
                  <Counter referralCount={referralCounts[100] || 0} />
                </div>
                <div onClick={() => setModal({ isOpen: true, reward: 200 })} className="cursor-pointer">
                  <QuoteGenerator referralCount={referralCounts[200] || 0} />
                </div>
                <div onClick={() => setModal({ isOpen: true, reward: 300 })} className="cursor-pointer">
                  <Stopwatch referralCount={referralCounts[300] || 0} />
                </div>
                <div onClick={() => setModal({ isOpen: true, reward: 400 })} className="cursor-pointer">
                  <NoteTaker referralCount={referralCounts[400] || 0} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'gigs' && (
            <Gigs 
              onAddEarnings={(amt) => setWalletBalance(b => b + amt)}
              onAddTransaction={addTransaction}
            />
          )}

          {activeTab === 'seekers' && (
            <Seekers />
          )}

          {activeTab === 'cwallet' && (
            <Cwallet 
              balance={walletBalance}
              transactions={transactions}
              onAddTransaction={addTransaction}
              onWithdraw={handleWithdraw}
            />
          )}
        </main>

        {/* Persistent Docked Bottom Navigation Bar */}
        <nav className="w-full shrink-0 bg-white border-t border-stone-150 py-3 flex justify-around items-center z-20 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
          <button 
            onClick={() => setActiveTab('rewards')}
            className={`flex flex-col items-center justify-center py-1 px-4 transition-all duration-200 gap-1.5 ${
              activeTab === 'rewards' 
                ? 'text-blue-600 font-extrabold scale-105' 
                : 'text-stone-400 hover:text-stone-600 font-semibold'
            }`}
          >
            <Award size={20} className={activeTab === 'rewards' ? 'stroke-[2.5px]' : 'stroke-2'} />
            <span className="text-[10px] leading-none uppercase tracking-wide">Rewards</span>
          </button>

          <button 
            onClick={() => setActiveTab('gigs')}
            className={`flex flex-col items-center justify-center py-1 px-4 transition-all duration-200 gap-1.5 ${
              activeTab === 'gigs' 
                ? 'text-blue-600 font-extrabold scale-105' 
                : 'text-stone-400 hover:text-stone-600 font-semibold'
            }`}
          >
            <Briefcase size={20} className={activeTab === 'gigs' ? 'stroke-[2.5px]' : 'stroke-2'} />
            <span className="text-[10px] leading-none uppercase tracking-wide">GiGs</span>
          </button>

          <button 
            onClick={() => setActiveTab('seekers')}
            className={`flex flex-col items-center justify-center py-1 px-4 transition-all duration-200 gap-1.5 ${
              activeTab === 'seekers' 
                ? 'text-blue-600 font-extrabold scale-105' 
                : 'text-stone-400 hover:text-stone-600 font-semibold'
            }`}
          >
            <Users size={20} className={activeTab === 'seekers' ? 'stroke-[2.5px]' : 'stroke-2'} />
            <span className="text-[10px] leading-none uppercase tracking-wide">Seekers</span>
          </button>

          <button 
            onClick={() => setActiveTab('cwallet')}
            className={`flex flex-col items-center justify-center py-1 px-4 transition-all duration-200 gap-1.5 ${
              activeTab === 'cwallet' 
                ? 'text-blue-600 font-extrabold scale-105' 
                : 'text-stone-400 hover:text-stone-600 font-semibold'
            }`}
          >
            <Wallet size={20} className={activeTab === 'cwallet' ? 'stroke-[2.5px]' : 'stroke-2'} />
            <span className="text-[10px] leading-none uppercase tracking-wide">Cwallet</span>
          </button>
        </nav>

        {/* Centralised Reward Flow Modal */}
        <RewardModal 
          isOpen={modal.isOpen} 
          reward={modal.reward}
          referralCount={referralCounts[modal.reward] || 0}
          onAddReferral={() => updateReferralCount(modal.reward)}
          onClose={() => setModal({ isOpen: false, reward: 0 })} 
        />
      </div>
    </div>
  );
}
