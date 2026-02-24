'use client';

import { ChevronRight, Trash, Plus, ArrowLeft, ArrowRight } from 'lucide-react';

export default function StepFour({
  form,
  onChange,
  onNext,
}: {
  form: { company1Name: string; company1Website: string };
  onChange: (field: keyof typeof form, value: string) => void;
  onNext?: () => void;
}) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 lg:px-20 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-blue-600">
              <svg className="w-8 h-8" viewBox="0 0 48 48" fill="currentColor">
                <path d="M24 .8 47.2 24 24 47.2.8 24 24 .8ZM21 35.8V12.2L9.2 24 21 35.8Z" />
              </svg>
            </div>
            <h1 className="text-xl font-extrabold tracking-tight uppercase">Raise</h1>
          </div>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6">
              <span className="text-gray-400 text-sm font-medium">Step 1</span>
              <span className="text-gray-400 text-sm font-medium">Step 2</span>
              <span className="text-gray-400 text-sm font-medium">Step 3</span>
              <span className="text-blue-600 text-sm font-bold border-b-2 border-blue-600 pb-1 px-1">Step 4</span>
              <span className="text-gray-400 text-sm font-medium">Step 5</span>
            </nav>
            <div className="bg-blue-600 px-4 py-1.5 rounded-full text-white text-xs font-bold tracking-wider">PAGE 4 OF 5</div>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-5xl mx-auto w-full px-6 py-10 pb-40">
        <div className="mb-10">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-3xl font-black">Portfolio Highlights</h2>
            <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">80% Complete</span>
          </div>
          <p className="text-gray-500 max-w-2xl text-lg">
            Showcase up to three standout portfolio companies to highlight your investment strategy, performance, and the unique value proposition of your fund.
          </p>
          <div className="mt-6 w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '80%' }}></div>
          </div>
        </div>

        <div className="space-y-8">
          {[1, 2].map((idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative group">
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                  <Trash className="text-xl" size={18} />
                </button>
              </div>
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                    {String(idx).padStart(2, '0')}
                  </span>
                  <h3 className="text-xl font-bold">Standout Investment {idx}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Company Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Acme Corp"
                      className="w-full rounded-lg border-gray-300 bg-white placeholder:text-gray-400 py-3 px-4"
                      value={form.company1Name}
                      onChange={(e) => onChange('company1Name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Website URL</label>
                    <input
                      type="url"
                      placeholder="https://acme.com"
                      className="w-full rounded-lg border-gray-300 bg-white placeholder:text-gray-400 py-3 px-4"
                      value={form.company1Website}
                      onChange={(e) => onChange('company1Website', e.target.value)}
                    />
                  </div>
                  {idx === 1 ? (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Investment Year</label>
                        <select className="w-full rounded-lg border-gray-300 bg-white py-3 px-4" defaultValue="">
                          <option value="" disabled>
                            Select Year
                          </option>
                          <option>2024</option>
                          <option>2023</option>
                          <option>2022</option>
                          <option>2021</option>
                          <option>2020</option>
                          <option>Before 2020</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Entry Stage</label>
                        <select className="w-full rounded-lg border-gray-300 bg-white py-3 px-4" defaultValue="">
                          <option value="" disabled>
                            Select Stage
                          </option>
                          <option>Pre-seed</option>
                          <option>Seed</option>
                          <option>Series A</option>
                          <option>Series B</option>
                          <option>Growth</option>
                          <option>Later Stage</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Total Invested ($M)</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                          <input type="number" placeholder="0.00" className="w-full rounded-lg border-gray-300 bg-white pl-8 pr-12 py-3" />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Million</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Current Ownership (%)</label>
                        <div className="relative">
                          <input type="number" placeholder="0.0" className="w-full rounded-lg border-gray-300 bg-white pr-8 py-3 px-4" />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                        </div>
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Commentary &amp; Highlights</label>
                        <textarea className="w-full rounded-lg border-gray-300 bg-white placeholder:text-gray-400 py-3 px-4" rows={4} placeholder="Describe the 'why' behind the investment, key milestones achieved, and current performance indicators..."></textarea>
                        <p className="text-xs text-gray-400">Recommended length: 150-250 words.</p>
                      </div>
                    </>
                  ) : (
                    <div className="md:col-span-2 pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-400 italic">Fill in the company details to expand the remaining metrics.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          <button className="w-full py-6 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-600 hover:text-blue-600 transition-all flex flex-col items-center justify-center gap-2 group">
            <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
              <Plus />
            </div>
            <span className="font-bold tracking-tight">ADD ANOTHER COMPANY</span>
            <span className="text-xs">(Up to 3 total)</span>
          </button>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white py-5 px-6 lg:px-20 z-50 border-t border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button className="flex items-center gap-2 text-white/80 hover:text-white transition-colors font-semibold group">
            <ArrowLeft /> BACK
          </button>
          <div className="flex items-center gap-4">
            <button className="hidden md:block px-6 py-3 text-white/80 hover:text-white font-semibold transition-colors">SAVE DRAFT</button>
            <button
              className="bg-white hover:bg-gray-100 text-blue-600 px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg"
              type="button"
              onClick={onNext}
            >
              SAVE &amp; CONTINUE TO PAGE 5 <ArrowRight />
            </button>
          </div>
        </div>
      </footer>
      <div className="fixed top-0 right-0 -z-10 w-1/3 h-1/2 bg-gradient-to-bl from-blue-600/5 to-transparent pointer-events-none"></div>
    </div>
  );
}
