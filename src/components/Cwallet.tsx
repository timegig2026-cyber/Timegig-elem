import React, { useState } from 'react';
import { 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Upload, 
  CheckCircle, 
  RefreshCw, 
  CreditCard, 
  Landmark, 
  Coins, 
  Sparkles, 
  Copy,
  ChevronRight,
  TrendingUp,
  History
} from 'lucide-react';

interface Transaction {
  id: string;
  type: 'deposit' | 'earning' | 'withdrawal';
  amount: number;
  description: string;
  date: string;
  status: 'Approved' | 'Pending' | 'Completed';
}

interface CwalletProps {
  balance: number;
  transactions: Transaction[];
  onAddTransaction: (type: 'deposit' | 'earning' | 'withdrawal', amount: number, desc: string) => void;
  onWithdraw: (amount: number) => boolean;
}

export default function Cwallet({ balance, transactions, onAddTransaction, onWithdraw }: CwalletProps) {
  // Tab selector for action sub-views: 'none' | 'topup' | 'cashout'
  const [activeAction, setActiveAction] = useState<'none' | 'topup' | 'cashout'>('none');
  
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankName, setBankName] = useState('Capitec Bank');
  const [accNumber, setAccNumber] = useState('');
  const [accHolder, setAccHolder] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const [topupAmount, setTopupAmount] = useState('100');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isTopupSubmitted, setIsTopupSubmitted] = useState(false);

  const COIN_CONVERSION_RATE = 10;
  const coinBalance = Math.floor(balance * COIN_CONVERSION_RATE);

  const bankDetails = {
    bank: 'FNB (First National Bank)',
    accNo: '629 2142 423',
    branch: '250655',
    accType: 'Smart Business Account',
    holder: 'Cwallet Africa (Pty) Ltd'
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) return;

    if (amount > balance) {
      alert('❌ Insufficient balance to process this withdrawal.');
      return;
    }

    if (amount < 50) {
      alert('❌ Minimum withdrawal limit is R50 (500 Coins).');
      return;
    }

    setIsWithdrawing(true);
    setTimeout(() => {
      const success = onWithdraw(amount);
      if (success) {
        onAddTransaction('withdrawal', amount, `Cashout to ${bankName}`);
        setWithdrawAmount('');
        setAccNumber('');
        setAccHolder('');
        setActiveAction('none');
        alert(`🎉 Cashout of R${amount} requested! Funds will reflect in your account within 2-4 hours.`);
      }
      setIsWithdrawing(false);
    }, 1500);
  };

  const handleTopupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(topupAmount);
    if (isNaN(amount) || amount <= 0) return;
    if (!proofFile) {
      alert('❌ Please attach your Proof of Payment.');
      return;
    }

    setIsTopupSubmitted(true);
    setTimeout(() => {
      onAddTransaction('deposit', amount, `Topup via EFT Bank Transfer (Pending)`);
      setIsTopupSubmitted(false);
      setProofFile(null);
      setActiveAction('none');
      alert(`🎉 Proof of Payment submitted successfully for R${amount}! Your Cwallet coins will credit shortly.`);
    }, 1500);
  };

  return (
    <div className="w-full flex flex-col h-[calc(100vh-140px)] overflow-y-auto px-1 py-1 text-stone-800">
      
      {/* 1. Main Clean Wallet Card */}
      <div className="bg-stone-900 p-6 rounded-2xl shadow-lg text-white mb-4 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl"></div>
        
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-1.5 text-stone-400 text-xs font-bold tracking-wider uppercase">
            <Wallet size={14} className="text-amber-400" />
            <span>Cwallet Vault</span>
          </div>
          <span className="text-[10px] font-black bg-amber-500/10 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/20">
            🪙 1 ZAR = 10 Coins
          </span>
        </div>

        <div className="mb-4">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-amber-400">
              🪙 {coinBalance.toLocaleString()}
            </span>
            <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest">Coins</span>
          </div>
          <div className="text-xs text-stone-300 mt-0.5">
            Equivalent to <span className="text-white font-extrabold">R {balance.toFixed(2)} ZAR</span>
          </div>
        </div>

        {/* Unified Quick Actions */}
        <div className="grid grid-cols-2 gap-2 mt-2 pt-4 border-t border-white/10">
          <button
            onClick={() => setActiveAction(activeAction === 'topup' ? 'none' : 'topup')}
            className={`py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
              activeAction === 'topup' 
                ? 'bg-amber-400 text-stone-950 font-black' 
                : 'bg-white/10 hover:bg-white/15 text-white'
            }`}
          >
            <Landmark size={13} />
            Top Up Coins
          </button>
          <button
            onClick={() => setActiveAction(activeAction === 'cashout' ? 'none' : 'cashout')}
            className={`py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
              activeAction === 'cashout' 
                ? 'bg-emerald-500 text-white font-black' 
                : 'bg-white/10 hover:bg-white/15 text-white'
            }`}
          >
            <CreditCard size={13} />
            Cash Out ZAR
          </button>
        </div>
      </div>

      {/* 2. Action Form Section (Only displays if an action is active, keeps the UI extremely simple and clean!) */}
      {activeAction === 'topup' && (
        <div className="bg-white p-4.5 rounded-2xl border border-stone-150 shadow-sm mb-4 animate-fadeIn">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-black text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
              <Landmark className="w-4 h-4 text-blue-600" />
              <span>Step 1: Deposit Bank Transfer (EFT)</span>
            </h3>
            <button 
              onClick={() => setActiveAction('none')} 
              className="text-[10px] font-bold text-stone-400 hover:text-stone-700 underline"
            >
              Close
            </button>
          </div>

          <div className="space-y-1.5 text-xs bg-stone-50 p-3 rounded-xl border border-stone-200 mb-3.5">
            <div className="flex justify-between items-center pb-1 border-b border-stone-200/50">
              <span className="text-stone-500">Bank:</span>
              <span className="font-extrabold text-stone-800 flex items-center gap-1">
                {bankDetails.bank}
                <button onClick={() => copyText(bankDetails.bank)} className="text-stone-400 hover:text-stone-700 p-0.5">
                  <Copy size={11} />
                </button>
              </span>
            </div>
            <div className="flex justify-between items-center pb-1 border-b border-stone-200/50">
              <span className="text-stone-500">Account Number:</span>
              <span className="font-extrabold text-stone-800 flex items-center gap-1">
                {bankDetails.accNo}
                <button onClick={() => copyText(bankDetails.accNo)} className="text-stone-400 hover:text-stone-700 p-0.5">
                  <Copy size={11} />
                </button>
              </span>
            </div>
            <div className="flex justify-between items-center pb-1 border-b border-stone-200/50">
              <span className="text-stone-500">Acc Type:</span>
              <span className="font-bold text-stone-700">{bankDetails.accType}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-500">Deposit Reference:</span>
              <span className="font-extrabold text-blue-600 flex items-center gap-1">
                REF-USER123
                <button onClick={() => copyText('REF-USER123')} className="text-stone-400 hover:text-stone-700 p-0.5">
                  <Copy size={11} />
                </button>
              </span>
            </div>
          </div>

          <form onSubmit={handleTopupSubmit} className="space-y-3">
            {/* Top-up interactive simple range slider */}
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <div className="flex justify-between items-center mb-1 text-xs">
                <span className="font-bold text-stone-500 text-[10px] uppercase">Slide Deposit Amount</span>
                <span className="font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                  🪙 {(Number(topupAmount) * COIN_CONVERSION_RATE).toLocaleString()} Coins
                </span>
              </div>
              <input 
                type="range"
                min="10"
                max="500"
                step="10"
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
                className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[8px] text-stone-400 font-bold mt-1">
                <span>R10</span>
                <span>R100</span>
                <span>R250</span>
                <span>R500</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase">Amount (ZAR)</label>
                <input 
                  type="number"
                  required
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase">Attach POP</label>
                <label className="flex items-center justify-center border border-dashed border-stone-300 hover:border-blue-500 rounded-lg p-2 cursor-pointer bg-stone-50 text-[10px] font-bold text-stone-600 gap-1 h-[34px]">
                  <Upload size={11} className="text-stone-400" />
                  <span className="truncate max-w-[90px]">{proofFile ? proofFile.name : 'Choose File'}</span>
                  <input 
                    type="file" 
                    accept="image/*,application/pdf" 
                    className="hidden" 
                    onChange={(e) => e.target.files && setProofFile(e.target.files[0])} 
                  />
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isTopupSubmitted || !proofFile}
              className={`w-full py-2 rounded-xl text-xs font-black transition-all ${
                proofFile && !isTopupSubmitted
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-stone-100 text-stone-400 cursor-not-allowed'
              }`}
            >
              {isTopupSubmitted ? 'Submitting POP...' : 'Submit Deposit Notification'}
            </button>
          </form>
        </div>
      )}

      {activeAction === 'cashout' && (
        <div className="bg-white p-4.5 rounded-2xl border border-stone-150 shadow-sm mb-4 animate-fadeIn">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-black text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>Instant Bank Cashout</span>
            </h3>
            <button 
              onClick={() => setActiveAction('none')} 
              className="text-[10px] font-bold text-stone-400 hover:text-stone-700 underline"
            >
              Close
            </button>
          </div>

          <form onSubmit={handleWithdrawSubmit} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase">Bank Name</label>
                <select 
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg font-bold"
                >
                  <option value="Capitec Bank">Capitec Bank</option>
                  <option value="FNB (First National Bank)">FNB</option>
                  <option value="Standard Bank">Standard Bank</option>
                  <option value="Nedbank">Nedbank</option>
                  <option value="Absa Bank">Absa Bank</option>
                  <option value="TymeBank">TymeBank</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase">Amount (ZAR)</label>
                <input 
                  type="number"
                  required
                  min="50"
                  placeholder="Min: R50"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase">Account Number</label>
                <input 
                  type="text" 
                  required
                  placeholder="1011234567"
                  value={accNumber}
                  onChange={(e) => setAccNumber(e.target.value)}
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg font-semibold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase">Account Holder</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. S Ndlovu"
                  value={accHolder}
                  onChange={(e) => setAccHolder(e.target.value)}
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg font-semibold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isWithdrawing || !withdrawAmount}
              className={`w-full py-2 rounded-xl text-xs font-black transition-all ${
                withdrawAmount && !isWithdrawing
                  ? 'bg-stone-900 text-white hover:bg-stone-800'
                  : 'bg-stone-100 text-stone-400 cursor-not-allowed'
              }`}
            >
              {isWithdrawing ? 'Processing Request...' : 'Request Cashout'}
            </button>
          </form>
        </div>
      )}

      {/* 3. Streamlined Clean Transactions List */}
      <div className="bg-white p-5 rounded-2xl border border-stone-150 shadow-sm flex-grow">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs font-black text-stone-500 uppercase tracking-widest flex items-center gap-1.5">
            <History size={12} className="text-stone-400" />
            <span>Transaction Logs</span>
          </h3>
          <span className="text-[9px] font-bold text-stone-400 flex items-center gap-1">
            <RefreshCw size={10} className="animate-spin-slow" /> Auto-sync
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-xs text-stone-400 font-bold">No transfers or transactions recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-0.5">
            {transactions.map((tx) => {
              const txCoins = Math.floor(tx.amount * COIN_CONVERSION_RATE);
              return (
                <div key={tx.id} className="flex justify-between items-center p-2.5 rounded-xl border border-stone-100 hover:bg-stone-50/70 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${
                      tx.type === 'earning' ? 'bg-amber-50 text-amber-600' :
                      tx.type === 'deposit' ? 'bg-blue-50 text-blue-600' :
                      'bg-red-50 text-red-600'
                    }`}>
                      {tx.type === 'earning' ? <Coins size={14} /> :
                       tx.type === 'deposit' ? <ArrowDownLeft size={14} /> :
                       <ArrowUpRight size={14} />}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-stone-800 block truncate max-w-[160px] leading-tight">
                        {tx.description}
                      </span>
                      <span className="text-[9px] text-stone-400 font-medium">{tx.date}</span>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end">
                    <span className={`text-xs font-extrabold ${
                      tx.type === 'earning' ? 'text-amber-600' :
                      tx.type === 'deposit' ? 'text-blue-600' :
                      'text-stone-800'
                    }`}>
                      {tx.type === 'withdrawal' ? '-' : '+'}🪙 {txCoins.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-stone-400 font-bold">
                      R{tx.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
