import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Landmark } from 'lucide-react';
import { Button } from '../components/common/Button';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFB] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-800 mb-4">
        <Landmark className="w-6 h-6 text-slate-600" />
      </div>

      <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 font-semibold mb-2">
        Error 404
      </span>
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
        Financial Resource Not Found
      </h1>
      <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
        The requested routing endpoint or banking record does not exist on this ledger.
      </p>

      <Link to="/">
        <Button variant="primary" size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
}

export default NotFoundPage;

