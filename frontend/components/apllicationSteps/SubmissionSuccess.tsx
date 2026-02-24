export default function SubmissionSuccess() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="w-full border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="text-blue-600">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3l7 5-7 12L5 8l7-5z" />
                </svg>
              </div>
              <span className="font-semibold text-gray-900">RAISE Global</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-xs rounded-lg bg-white text-gray-600 border border-gray-200">
                Notifications
              </button>
              <div className="h-8 w-8 rounded-full bg-gray-200" />
            </div>
          </div>
        </div>
      </header>
      <main>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="h-16 w-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center shadow-sm">
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" className="stroke-green-600" strokeWidth="2" />
                <path d="M9 12l2 2 4-4" className="stroke-green-600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">Application Submitted Successfully</h1>
            <p className="text-gray-500">
              Thank you for your submission,{" "}
              <a className="text-blue-600 hover:underline" href="#">
                Act One Ventures
              </a>
              . Our Selection Committee will review your application for the{" "}
              <strong>2025 RAISE Global Summit</strong>.
            </p>
          </div>
          <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 text-gray-900 font-semibold">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <path d="M8 7h8M8 11h8M8 15h8" className="stroke-current" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
              <span>What happens next?</span>
            </div>
            <div className="mt-4 space-y-5">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <path d="M8 5h8v14H8z" className="stroke-current" strokeWidth="2" />
                    <path d="M10 9h4" className="stroke-current" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </span>
                <div>
                  <div className="font-medium text-sm">Review Period</div>
                  <div className="text-gray-500 text-sm">Our committee will vet all applications over the next 4 weeks.</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <path d="M3 7l9 6 9-6" className="stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M3 7v10h18V7" className="stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <div>
                  <div className="font-medium text-sm">Email Notification</div>
                  <div className="text-gray-500 text-sm">You will receive a decision via email by <strong>November 15th</strong>.</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <path d="M15 3h6v6" className="stroke-current" strokeWidth="2" strokeLinecap="round" />
                    <path d="M21 3l-9 9" className="stroke-current" strokeWidth="2" strokeLinecap="round" />
                    <path d="M13 21H5a2 2 0 0 1-2-2V11" className="stroke-current" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </span>
                <div>
                  <div className="font-medium text-sm">Portal Access</div>
                  <div className="text-gray-500 text-sm">You can log back in at any time to update your public database profile.</div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm">
              Go to Dashboard
            </button>
            <button className="w-full sm:w-auto px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg">
              Download Submission PDF
            </button>
          </div>
          <div className="mt-10 text-gray-400 text-sm text-center">
            Questions? Visit our{" "}
            <a className="text-blue-600 hover:underline underline-offset-4" href="#">
              Help Center
            </a>{" "}
            or contact support at{" "}
            <a className="text-blue-600 hover:underline underline-offset-4" href="mailto:support@raiseglobal.com">
              support@raiseglobal.com
            </a>
          </div>
        </div>
      </main>
      <footer className="w-full py-8 text-center border-t border-gray-200 bg-white">
        <p className="text-sm text-gray-500">© 2025 RAISE Global Summit. All rights reserved.</p>
      </footer>
    </div>
  );
}
