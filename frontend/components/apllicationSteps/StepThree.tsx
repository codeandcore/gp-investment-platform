'use client';

import { FileText, Info, PlusCircle, X, BarChart3, StickyNote, ArrowLeft, ArrowRight, Building2 } from 'lucide-react';

export default function StepThree({
  form,
  onChange,
  onNext,
}: {
  form: { firmType: 'existing' | 'new'; notes: string };
  onChange: (field: keyof typeof form, value: string) => void;
  onNext?: () => void;
}) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 md:px-10 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-blue-600 h-8 w-8">
              <svg viewBox="0 0 48 48" fill="currentColor">
                <path d="M24 .8 47.2 24 24 47.2.8 24 24 .8ZM21 35.8V12.2L9.2 24 21 35.8Z" />
              </svg>
            </div>
            <h1 className="text-xl font-black tracking-tight uppercase">Raise</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Application Progress</span>
              <div className="h-1.5 w-32 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 w-3/5"></div>
              </div>
            </div>
            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full border border-blue-100">PAGE 3 OF 5</span>
            <div
              className="h-9 w-9 rounded-full bg-gray-200 bg-cover bg-center border border-gray-300"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAMgqlQMb6NtmY0RI4IsFh0BYBp26r-ynKMC5NmfYeXqgalK1KXMYHn-WxGbEs0Nyt1hPwwJ2fuizVO9wFp99bgVYBJD5JJIXVmcDFDj-_6nbSZBgy_t6KQW8V68O8qRuJG9d_g8wL798b3nVN4ojcwGJkDAIzLOnalg067fE3DoU1p37jzZzIwY0XrupAwYNM-AkfqsuzYvJFpgYFaq9wrEITeE0pHoyBMnZ1P05_o_byrpv-yR4M1GPLtDMo4JK16IQwvjFwBFe0h')",
              }}
            ></div>
          </div>
        </div>
      </header>

      <main className="flex-grow py-10 px-4">
        <div className="max-w-4xl mx-auto space-y-8 pb-32">
          <div className="space-y-2">
            <h2 className="text-3xl font-black tracking-tight">Step 3: Deck &amp; Track Record</h2>
            <p className="text-gray-500 max-w-2xl">
              Provide your pitch deck and historical performance data for the Selection Committee. Professional and accurate data ensures a faster review process.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FileText className="text-blue-600" /> 1. Pitch Deck
            </h3>
            <div className="flex flex-col md:flex-row items-stretch gap-6 border border-gray-100 bg-gray-50 p-4 rounded-lg">
              <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                  <p className="text-gray-900 font-bold text-lg">Act_One_Fund_II_Deck.pdf</p>
                  <p className="text-gray-500 text-sm mt-1">Uploaded on Oct 12, 2023 • 14.2 MB</p>
                </div>
                <div className="flex gap-3 mt-6">
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors">
                    <FileText size={14} /> UPLOAD NEW DECK
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-50 transition-colors">
                    <X size={14} /> DELETE
                  </button>
                </div>
              </div>
              <div className="w-full md:w-56 h-32 md:h-auto rounded-lg bg-gray-200 overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                  <FileText className="h-10 w-10 text-gray-400" />
                </div>
              </div>
            </div>
            <p className="mt-4 text-xs text-gray-500 flex items-center gap-1.5">
              <Info className="text-blue-600" size={14} /> Your deck will be shared securely with the Selection Committee. Privacy is our priority.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Building2 className="text-blue-600" /> 2. Track Record Selection
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="relative flex cursor-pointer rounded-xl border border-blue-600 bg-blue-50 p-4">
                <input
                  name="firm_type"
                  type="radio"
                  value="existing"
                  className="mt-1 h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-600"
                  checked={form.firmType === 'existing'}
                  onChange={() => onChange('firmType', 'existing')}
                />
                <div className="ml-3 flex flex-col">
                  <span className="block text-sm font-bold uppercase tracking-tight">Existing Firm</span>
                  <span className="mt-1 block text-xs text-gray-500">We have at least one closed fund with historical data.</span>
                </div>
              </label>
              <label className="relative flex cursor-pointer rounded-xl border border-gray-200 p-4 hover:bg-gray-50 transition-colors">
                <input
                  name="firm_type"
                  type="radio"
                  value="new"
                  className="mt-1 h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-600"
                  checked={form.firmType === 'new'}
                  onChange={() => onChange('firmType', 'new')}
                />
                <div className="ml-3 flex flex-col">
                  <span className="block text-sm font-bold uppercase tracking-tight">New / First-time Firm</span>
                  <span className="mt-1 block text-xs text-gray-500">This is our first fund or we are an emerging manager.</span>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <BarChart3 className="text-blue-600" /> 3. Fund Performance
              </h3>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Values in USD ($M)</span>
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-gray-50 text-[10px] font-black uppercase text-gray-500 tracking-wider">
                    <th className="px-6 py-3 border-b border-gray-100">Fund Name</th>
                    <th className="px-4 py-3 border-b border-gray-100">Type</th>
                    <th className="px-4 py-3 border-b border-gray-100 text-center">Vintage</th>
                    <th className="px-4 py-3 border-b border-gray-100 text-right">Size ($M)</th>
                    <th className="px-4 py-3 border-b border-gray-100 text-right">Called %</th>
                    <th className="px-4 py-3 border-b border-gray-100 text-right">DPI</th>
                    <th className="px-4 py-3 border-b border-gray-100 text-right">RVPI</th>
                    <th className="px-4 py-3 border-b border-gray-100 text-right">Net IRR</th>
                    <th className="px-4 py-3 border-b border-gray-100 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <input type="text" defaultValue="Act One Fund I" className="w-full bg-transparent border-none p-0 text-sm font-medium focus:ring-0" />
                    </td>
                    <td className="px-4 py-4">
                      <select className="bg-transparent border-none p-0 text-sm focus:ring-0 cursor-pointer">
                        <option defaultChecked>Venture Capital</option>
                        <option>Private Equity</option>
                        <option>Real Estate</option>
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      <select className="bg-transparent border-none p-0 text-sm focus:ring-0 cursor-pointer text-center w-full" defaultValue="2019">
                        <option>2018</option>
                        <option>2019</option>
                        <option>2020</option>
                      </select>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <input type="text" defaultValue="50.0" className="w-full bg-transparent border-none p-0 text-sm text-right focus:ring-0" />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <input type="text" defaultValue="95" className="w-full bg-transparent border-none p-0 text-sm text-right focus:ring-0" />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <input type="text" defaultValue="0.85x" className="w-full bg-transparent border-none p-0 text-sm text-right focus:ring-0" />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <input type="text" defaultValue="2.10x" className="w-full bg-transparent border-none p-0 text-sm text-right focus:ring-0" />
                    </td>
                    <td className="px-4 py-4 text-right text-blue-600 font-bold">
                      <input type="text" defaultValue="32.5%" className="w-full bg-transparent border-none p-0 text-sm text-right focus:ring-0 text-blue-600 font-bold" />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button className="text-gray-300 hover:text-red-500 transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <input type="text" placeholder="Fund Name..." className="w-full bg-transparent border-none p-0 text-sm font-medium focus:ring-0" />
                    </td>
                    <td className="px-4 py-4">
                      <select className="bg-transparent border-none p-0 text-sm focus:ring-0 cursor-pointer text-gray-400">
                        <option disabled defaultChecked>
                          Select...
                        </option>
                        <option>VC</option>
                        <option>PE</option>
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      <select className="bg-transparent border-none p-0 text-sm focus:ring-0 cursor-pointer text-center w-full text-gray-400" defaultValue="">
                        <option disabled defaultChecked>
                          Year
                        </option>
                        <option>2023</option>
                        <option>2024</option>
                      </select>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <input type="text" placeholder="0.0" className="w-full bg-transparent border-none p-0 text-sm text-right focus:ring-0" />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <input type="text" placeholder="0" className="w-full bg-transparent border-none p-0 text-sm text-right focus:ring-0" />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <input type="text" placeholder="0.00x" className="w-full bg-transparent border-none p-0 text-sm text-right focus:ring-0" />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <input type="text" placeholder="0.00x" className="w-full bg-transparent border-none p-0 text-sm text-right focus:ring-0" />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <input type="text" placeholder="0.0%" className="w-full bg-transparent border-none p-0 text-sm text-right focus:ring-0" />
                    </td>
                    <td className="px-4 py-4 text-center"></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="p-6 bg-gray-50/50">
              <button className="flex items-center gap-2 px-5 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 text-sm font-bold hover:border-blue-600 hover:text-blue-600 transition-all w-full justify-center">
                <PlusCircle className="h-4 w-4" /> ADD ANOTHER FUND
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <StickyNote className="text-blue-600" /> 4. Supplemental Info
              </h3>
              <span className="text-xs text-gray-400 font-medium uppercase tracking-tighter">Optional</span>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Additional performance notes or context</label>
              <textarea
                className="w-full rounded-lg border-gray-200 bg-white text-gray-900 focus:border-blue-600 focus:ring-blue-600 text-sm p-4"
                rows={4}
                placeholder="e.g. Detailed explanation of write-offs, recent portfolio exits, or benchmarking methodology..."
                value={form.notes}
                onChange={(e) => onChange('notes', e.target.value)}
              ></textarea>
              <div className="flex justify-end">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">0 / 1000 Characters</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white border-t border-white/10 py-5 px-4 md:px-10 z-[60] shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button className="flex items-center gap-2 px-6 py-2.5 rounded-lg border border-white/30 hover:bg-white/10 text-sm font-bold transition-colors uppercase tracking-wide text-white">
            <ArrowLeft size={14} /> BACK
          </button>
          <div className="flex items-center gap-6">
            <p className="hidden md:block text-xs text-white/70 font-medium">Progress saved at 14:42 PM</p>
            <button
              className="flex items-center gap-2 px-8 py-2.5 bg-white rounded-lg text-blue-600 text-sm font-bold hover:bg-white/90 shadow-lg transition-all uppercase tracking-wide"
              type="button"
              onClick={onNext}
            >
              SAVE &amp; CONTINUE TO PAGE 4 <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </footer>
      <div className="fixed top-0 right-0 -z-10 w-1/3 h-1/2 bg-gradient-to-bl from-blue-600/5 to-transparent pointer-events-none"></div>
    </div>
  );
}
