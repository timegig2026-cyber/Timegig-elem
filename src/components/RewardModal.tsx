import React, { useState } from 'react';
import { X, Upload, CheckCircle, Share2, Users, Copy, MessageSquare, Facebook, Twitter, Send, Landmark, ArrowRight } from 'lucide-react';

interface RewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  reward: number;
  referralCount: number;
  onAddReferral: () => void;
}

export default function RewardModal({ isOpen, onClose, reward, referralCount, onAddReferral }: RewardModalProps) {
  const [step, setStep] = useState<'initial' | 'bankDetails' | 'uploading' | 'submitted' | 'referral'>('initial');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const referralLink = `https://app.bubble-rewards.co.za/ref/user-${reward}`;

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const submitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    setStep('submitted');
    setTimeout(() => setStep('referral'), 2000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    alert("Referral link copied to clipboard!");
  };

  // Pre-configured South African social media share redirects
  const socialShares = [
    {
      name: 'WhatsApp',
      url: `https://api.whatsapp.com/send?text=Join%20me%20and%20claim%20your%20R${reward}%20Reward!%20Register%20here%3A%20${encodeURIComponent(referralLink)}`,
      color: 'bg-green-600 hover:bg-green-700',
      icon: <MessageSquare size={14} />
    },
    {
      name: 'Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`,
      color: 'bg-blue-600 hover:bg-blue-700',
      icon: <Facebook size={14} />
    },
    {
      name: 'Twitter / X',
      url: `https://twitter.com/intent/tweet?text=Claim%20your%20free%20R${reward}%20Reward%20now!%20Join%20using%20my%20link%3A&url=${encodeURIComponent(referralLink)}`,
      color: 'bg-stone-900 hover:bg-stone-800',
      icon: <Twitter size={14} />
    },
    {
      name: 'Telegram',
      url: `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=Claim%20your%20R${reward}%20Reward%20now!`,
      color: 'bg-sky-500 hover:bg-sky-600',
      icon: <Send size={14} />
    }
  ];

  return (
    <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative max-h-[95vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1.5 bg-stone-50 rounded-full transition-all cursor-pointer">
          <X size={18} />
        </button>
        
        {step === 'initial' && (
          <>
            <h2 className="text-xl font-black text-stone-800 mb-2 tracking-tight">Unlock R{reward} Reward</h2>
            <p className="text-stone-500 mb-6 text-xs font-semibold leading-relaxed">To claim your R{reward} reward, complete these 2 steps:</p>
            <ul className="space-y-4 mb-6 text-xs font-semibold">
              <li className="flex items-start gap-3 text-stone-700">
                <span className="bg-blue-50 text-blue-700 border border-blue-100 font-bold px-2.5 py-1 rounded-lg">1</span>
                <div>
                  <span className="font-extrabold block text-stone-800">Topup R10</span>
                  <span className="text-stone-500 block font-medium">Make a direct bank transfer of R10 to activate.</span>
                </div>
              </li>
              <li className="flex items-start gap-3 text-stone-700">
                <span className="bg-blue-50 text-blue-700 border border-blue-100 font-bold px-2.5 py-1 rounded-lg">2</span>
                <div>
                  <span className="font-extrabold block text-stone-800">Refer 20 Users</span>
                  <span className="text-stone-500 block font-medium">Share your link and track referrals live on your dashboard.</span>
                </div>
              </li>
            </ul>
            <button 
              onClick={() => setStep('bankDetails')}
              className="w-full py-3.5 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 shadow-md active:scale-95 transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Get Bank Details <ArrowRight size={14} />
            </button>
          </>
        )}

        {step === 'bankDetails' && (
          <>
            <h2 className="text-lg font-black text-stone-800 mb-2 flex items-center gap-1.5 uppercase tracking-wide">
              <Landmark className="text-blue-600 w-5 h-5" /> Bank Transfer EFT
            </h2>
            <p className="text-xs text-stone-500 font-semibold mb-4 leading-relaxed">
              Transfer exactly <span className="text-blue-600 font-extrabold">R10.00</span> to our account and upload proof in the next step:
            </p>

            <div className="space-y-2 text-xs bg-stone-50 p-4 rounded-2xl border border-stone-100 font-medium mb-6">
              <div className="flex justify-between items-center border-b border-stone-150 pb-1.5">
                <span className="text-stone-500 font-semibold">Bank Name:</span>
                <span className="font-extrabold text-stone-800">FNB (First National Bank)</span>
              </div>
              <div className="flex justify-between items-center border-b border-stone-150 pb-1.5">
                <span className="text-stone-500 font-semibold">Account No:</span>
                <span className="font-extrabold text-stone-800">629 2142 423</span>
              </div>
              <div className="flex justify-between items-center border-b border-stone-150 pb-1.5">
                <span className="text-stone-500 font-semibold">Account Type:</span>
                <span className="font-bold text-stone-700">Business Account</span>
              </div>
              <div className="flex justify-between items-center border-b border-stone-150 pb-1.5">
                <span className="text-stone-500 font-semibold">Branch Code:</span>
                <span className="font-bold text-stone-700">250655</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500 font-semibold">Reference:</span>
                <span className="font-extrabold text-blue-700">REF-R{reward}-USER</span>
              </div>
            </div>

            <button 
              onClick={() => setStep('uploading')}
              className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-white font-black rounded-xl text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Proceed to Upload Proof
            </button>
          </>
        )}

        {step === 'uploading' && (
          <form onSubmit={submitPayment} className="text-center">
            <h2 className="text-lg font-black text-stone-800 mb-2">Upload Proof of Payment</h2>
            <p className="text-xs text-stone-500 font-semibold mb-4">Please attach the PDF slip or screenshot from your device.</p>
            
            <div className="mb-4">
              <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-stone-200 hover:border-blue-500 hover:bg-stone-50/50 rounded-2xl cursor-pointer transition-all">
                <Upload className="w-8 h-8 text-stone-400 mb-2 animate-pulse" />
                <span className="text-xs font-bold text-stone-600">
                  {selectedFile ? selectedFile.name : 'Choose proof document'}
                </span>
                <span className="text-[10px] text-stone-400 mt-1 font-semibold">PDF, JPG, PNG from device</span>
                <input type="file" className="hidden" required onChange={handleFileUpload} />
              </label>
            </div>

            <button 
              type="submit"
              disabled={!selectedFile}
              className={`w-full py-3.5 font-black rounded-xl text-xs transition-all shadow-md cursor-pointer ${
                selectedFile ? 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95' : 'bg-stone-100 text-stone-400 cursor-not-allowed shadow-none'
              }`}
            >
              Submit Proof & Start Referring
            </button>
          </form>
        )}

        {step === 'submitted' && (
          <div className="text-center py-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4 animate-bounce" />
            <h2 className="text-xl font-black text-stone-800">Proof Submitted!</h2>
            <p className="text-stone-500 text-xs font-semibold mt-2 leading-relaxed">
              Congratulations! Your payment of R10 is active. Referral tracking link is now unlocked below!
            </p>
          </div>
        )}

        {step === 'referral' && (
          <div className="text-center">
            <h2 className="text-lg font-black text-stone-800 mb-2">Your Referral Link</h2>
            <p className="text-xs text-stone-500 font-semibold mb-4 leading-relaxed">
              Share your link with friends. Direct them using any social media platform below:
            </p>
            
            <div className="flex items-center gap-2 bg-stone-50 p-3 rounded-xl border border-stone-150 mb-4 font-mono text-xs">
              <span className="truncate text-stone-600 flex-grow text-left">{referralLink}</span>
              <button type="button" onClick={copyToClipboard} className="text-stone-400 hover:text-stone-700 bg-white p-1.5 rounded-lg border border-stone-150 cursor-pointer">
                <Copy size={14} />
              </button>
            </div>

            {/* Social Sharing Direct Links */}
            <div className="grid grid-cols-2 gap-2 mb-5">
              {socialShares.map((social) => (
                <a 
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center gap-2 text-white p-2.5 rounded-xl text-[10px] font-bold shadow-sm transition-all active:scale-95 ${social.color}`}
                >
                  {social.icon}
                  <span>Share {social.name}</span>
                </a>
              ))}
            </div>

            <div className="p-4 bg-stone-50 border border-stone-100 rounded-2xl flex flex-col items-center gap-2">
              <div className="flex items-center gap-1.5 text-stone-700">
                <Users size={16} className="text-blue-600" />
                <span className="text-xs font-black">{referralCount} / 20 Active Referrals</span>
              </div>
              <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-600 h-full transition-all duration-500"
                  style={{ width: `${Math.min((referralCount / 20) * 100, 100)}%` }}
                ></div>
              </div>
              <button 
                type="button"
                onClick={onAddReferral} 
                className="text-[10px] font-bold text-blue-600 underline hover:text-blue-800 cursor-pointer pt-1 bg-transparent border-none"
              >
                + Simulate Successful Referral (+1)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
