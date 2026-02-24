'use client';

import { Moon } from 'lucide-react';

export default function StepOne({
  form,
  onChange,
  onNext,
}: {
  form: {
    companyName: string;
    companyWebsite: string;
    headquarters: string;
    primaryContactEmail: string;
  };
  onChange: (field: keyof typeof form, value: string) => void;
  onNext?: () => void;
}) {
  return (
    <div className="text-slate-800 pb-32">
      <header className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center sticky top-0 z-40">
        <div className="text-blue-800 font-bold text-xl tracking-[0.2em]">RAISE</div>
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-gray-600 transition-colors">
          FAQ
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-4 py-12 flex">
        <div className="relative mr-8 pt-2 hidden md:block">
          <div className="absolute left-4 top-8 bottom-0 w-px bg-gray-300 -z-10"></div>
          <div className="flex flex-col gap-[240px]">
            <div className="w-8 h-8 rounded-full bg-blue-800 text-white flex items-center justify-center text-sm font-bold shrink-0">
              1
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-300 text-white flex items-center justify-center text-sm font-bold shrink-0">
              2
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-300 text-white flex items-center justify-center text-sm font-bold shrink-0">
              3
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-300 text-white flex items-center justify-center text-sm font-bold shrink-0">
              4
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="mb-10 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-blue-800 uppercase tracking-tight">Welcome Act One Ventures</h1>
              <p className="text-[11px] text-gray-500 mt-1 max-w-lg">
                Your profile for the 2025 RAISE Global Summit has been submitted. Use this form to edit and update your profile.
              </p>
            </div>
            <div className="text-right">
              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Progress</div>
              <div className="text-[11px] font-bold text-blue-800">PAGE 1 OF 5</div>
            </div>
          </div>

          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              onNext?.();
            }}
          >
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
              <h2 className="text-[14px] font-bold text-blue-800 uppercase tracking-wider mb-4">Referred By</h2>
              <p className="text-[10px] text-gray-500 italic mb-2">
                If you were referred to RAISE by another member of the RAISE community, please let the Selection Committee know who referred you by listing their name and email below.
              </p>
              <input type="text" placeholder="Enter name and email address" className="block w-full rounded border-gray-300 text-[13px] py-1.5 px-3 focus:border-blue-600 focus:ring-blue-600 shadow-sm placeholder:text-gray-300 mt-4" />
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
              <h2 className="text-[14px] font-bold text-blue-800 uppercase tracking-wider mb-4">Primary Contact</h2>
              <div className="bg-gray-50 border border-gray-100 rounded p-4 mb-6">
                <p className="text-[11px] leading-relaxed text-gray-600 italic">
                  Owing to space constraints, only one partner from each fund can attend the RAISE event. This partner will be listed as the attendee, included in the Emerging Manager Database (if you opt-in), and designated as the Presenter (if selected). Please provide the following details for the partner from your firm to be listed.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <label className="text-[11px] font-bold text-blue-900 uppercase tracking-tight mb-1 block">First Name</label>
                  <input type="text" defaultValue="Alejandro" className="block w-full rounded border-gray-300 text-[13px] py-1.5 px-3 focus:border-blue-600 focus:ring-blue-600 shadow-sm placeholder:text-gray-300" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-blue-900 uppercase tracking-tight mb-1 block">Last Name</label>
                  <input type="text" defaultValue="Guerrero" className="block w-full rounded border-gray-300 text-[13px] py-1.5 px-3 focus:border-blue-600 focus:ring-blue-600 shadow-sm placeholder:text-gray-300" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-blue-900 uppercase tracking-tight mb-1 block">Title</label>
                  <input type="text" defaultValue="General Partner" className="block w-full rounded border-gray-300 text-[13px] py-1.5 px-3 focus:border-blue-600 focus:ring-blue-600 shadow-sm placeholder:text-gray-300" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-blue-900 uppercase tracking-tight mb-1 block">Email Address</label>
                  <input
                    type="email"
                    className="block w-full rounded border-gray-300 text-[13px] py-1.5 px-3 focus:border-blue-600 focus:ring-blue-600 shadow-sm placeholder:text-gray-300"
                    value={form.primaryContactEmail}
                    onChange={(e) => onChange('primaryContactEmail', e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[11px] font-bold text-blue-900 uppercase tracking-tight mb-1 block">LinkedIn Page URL</label>
                  <input type="url" defaultValue="https://linkedin.com/in/alguerrero" className="block w-full rounded border-gray-300 text-[13px] py-1.5 px-3 focus:border-blue-600 focus:ring-blue-600 shadow-sm placeholder:text-gray-300" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
              <h2 className="text-[14px] font-bold text-blue-800 uppercase tracking-wider mb-4">Company Info</h2>
              <div className="space-y-3">
                <div className="grid grid-cols-[180px_1fr] items-center gap-4">
                  <label className="text-[11px] font-bold text-blue-900 uppercase tracking-tight mb-0">Company Name:</label>
                  <input
                    type="text"
                    className="block w-full rounded border-gray-300 text-[13px] py-1.5 px-3 focus:border-blue-600 focus:ring-blue-600 shadow-sm placeholder:text-gray-300"
                    value={form.companyName}
                    onChange={(e) => onChange('companyName', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-[180px_1fr] items-center gap-4">
                  <label className="text-[11px] font-bold text-blue-900 uppercase tracking-tight mb-0">Company Website:</label>
                  <input
                    type="text"
                    className="block w-full rounded border-gray-300 text-[13px] py-1.5 px-3 focus:border-blue-600 focus:ring-blue-600 shadow-sm placeholder:text-gray-300"
                    value={form.companyWebsite}
                    onChange={(e) => onChange('companyWebsite', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-[180px_1fr] items-center gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-blue-900 uppercase tracking-tight mb-0">Headquarters Location:</label>
                    <span className="text-[9px] text-gray-400 uppercase">(Type then select from list)</span>
                  </div>
                  <input
                    type="text"
                    className="block w-full rounded border-gray-300 text-[13px] py-1.5 px-3 focus:border-blue-600 focus:ring-blue-600 shadow-sm placeholder:text-gray-300"
                    value={form.headquarters}
                    onChange={(e) => onChange('headquarters', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
              <h2 className="text-[14px] font-bold text-blue-800 uppercase tracking-wider mb-4">Investing Partners</h2>
              <div className="mb-8">
                <label className="text-[11px] font-bold text-blue-900 uppercase tracking-tight mb-1 block">
                  How would you characterize the background of your investing partners?
                </label>
                <select className="block w-full rounded border-gray-300 text-[13px] py-1.5 px-3 focus:border-blue-600 focus:ring-blue-600 shadow-sm bg-no-repeat">
                  <option>Angel investors raising a blind pool</option>
                  <option>Institutional Fund Managers</option>
                  <option>Family Office</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-10">
                <div>
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase mb-4">Partner Composition</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[12px] text-gray-600">Number of partners who are men</span>
                      <select className="block rounded border-gray-300 text-[13px] py-1 px-2 focus:border-blue-600 focus:ring-blue-600 shadow-sm w-16">
                        <option>2</option>
                        <option>1</option>
                      </select>
                    </div>
                    <div className="flex justify-between items-center border-t border-gray-50 pt-3">
                      <span className="text-[12px] text-gray-600">Number of partners who are women</span>
                      <select className="block rounded border-gray-300 text-[13px] py-1 px-2 focus:border-blue-600 focus:ring-blue-600 shadow-sm w-16">
                        <option>0</option>
                        <option>1</option>
                      </select>
                    </div>
                    <div className="flex justify-between items-center border-t border-gray-50 pt-3">
                      <span className="text-[12px] text-gray-600">Number of partners who are another gender</span>
                      <select className="block rounded border-gray-300 text-[13px] py-1 px-2 focus:border-blue-600 focus:ring-blue-600 shadow-sm w-16">
                        <option>0</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase mb-2">Racial and ethnic identities</h3>
                  <p className="text-[9px] text-gray-400 mb-2 uppercase">(Check all that apply)</p>
                  <div className="bg-gray-50 rounded-md p-4 space-y-3 border border-gray-100">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="h-3.5 w-3.5 rounded border-gray-300 text-blue-800" />
                      <span className="text-[12px] font-medium text-gray-700">White</span>
                    </label>
                    <div className="pl-6 space-y-2">
                      <p className="text-[9px] font-bold text-gray-400 uppercase">BIPOC</p>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="h-3.5 w-3.5 rounded border-gray-300 text-blue-800" />
                        <span className="text-[11px] text-gray-600">Black or African American</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="h-3.5 w-3.5 rounded border-gray-300 text-blue-800" />
                        <span className="text-[11px] text-gray-600">American Indian or Native Alaskan</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="h-3.5 w-3.5 rounded border-gray-300 text-blue-800" />
                        <span className="text-[11px] text-gray-600">Middle Eastern or North African</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="h-3.5 w-3.5 rounded border-gray-300 text-blue-800" />
                        <span className="text-[11px] text-gray-600">Asian or Asian American</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="h-3.5 w-3.5 rounded border-gray-300 text-blue-800" />
                        <span className="text-[11px] text-gray-600">Hispanic, Latinx, or Spanish Origin</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-10 mt-8 border-t border-gray-100 pt-8">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase">Firm ownership by Gender identity:</h3>
                    <a href="#" className="text-[9px] text-blue-800 underline uppercase">(visibility info)</a>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center border border-gray-200 rounded px-2 py-1.5 bg-white w-20">
                        <input type="text" defaultValue="100" className="w-full text-[13px] border-none focus:ring-0 p-0 text-center" />
                        <span className="text-[11px] text-gray-400 ml-1">%</span>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">MEN</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center border border-gray-200 rounded px-2 py-1.5 bg-white w-20">
                        <input type="text" defaultValue="0" className="w-full text-[13px] border-none focus:ring-0 p-0 text-center" />
                        <span className="text-[11px] text-gray-400 ml-1">%</span>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">WOMEN</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase">Firm ownership by Racial/Ethnic identity:</h3>
                    <a href="#" className="text-[9px] text-blue-800 underline uppercase">(visibility info)</a>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center border border-gray-200 rounded px-2 py-1.5 bg-white w-20">
                        <input type="text" defaultValue="75" className="w-full text-[13px] border-none focus:ring-0 p-0 text-center" />
                        <span className="text-[11px] text-gray-400 ml-1">%</span>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">WHITE</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center border border-gray-200 rounded px-2 py-1.5 bg-white w-20">
                        <input type="text" defaultValue="25" className="w-full text-[13px] border-none focus:ring-0 p-0 text-center" />
                        <span className="text-[11px] text-gray-400 ml-1">%</span>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">BIPOC</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-gray-100 pt-6">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-[11px] font-bold text-gray-700 uppercase">My team also includes:</span>
                  <span className="text-[9px] text-gray-400 uppercase">(Check all that apply)</span>
                </div>
                <div className="flex space-x-8">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="h-3.5 w-3.5 rounded border-gray-300 text-blue-800" />
                    <span className="text-[11px] text-gray-600">Military Veterans</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="h-3.5 w-3.5 rounded border-gray-300 text-blue-800" />
                    <span className="text-[11px] text-gray-600">LGBTQ+</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-blue-800 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.15)] z-50">
              <div className="max-w-[1100px] mx-auto px-8 py-4 flex justify-between items-center">
                <div>
                  <h3 className="text-white text-base font-bold">Ready for the next step?</h3>
                  <p className="text-blue-100 text-[10px] opacity-90 uppercase tracking-wide">
                    You can always come back to edit this page before final submission.
                  </p>
                </div>
                <button
                  className="bg-white text-blue-800 font-bold text-[11px] uppercase tracking-widest px-10 py-3.5 rounded-md hover:bg-blue-50 transition-all shadow-md active:transform active:scale-95"
                  type="submit"
                >
                  Save &amp; Continue to Page 2
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>

      <div className="fixed right-6 bottom-32 z-40">
        <button className="bg-white p-2 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors">
          <Moon className="text-gray-400" size={18} />
        </button>
      </div>
    </div>
  );
}
