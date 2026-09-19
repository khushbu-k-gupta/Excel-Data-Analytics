import { Link } from 'react-router-dom';
import { FiAlertTriangle, FiArrowLeft } from 'react-icons/fi';

const NotFound = () => (
  <div className="grid-pattern min-h-screen flex flex-col items-center justify-center bg-[#0b0d12] px-6 text-center">
    <p className="font-display text-8xl font-bold text-emerald-400/20">404</p>
    <h1 className="font-display text-2xl font-bold -mt-6">Page not found</h1>
    <p className="text-slate-400 mt-2 text-sm">Ye route exist nahi karta — shayad purana link ho.</p>
    <Link to="/" className="btn-accent mt-8 flex items-center gap-2">
      <FiArrowLeft size={16} /> Back to Home
    </Link>
  </div>
);

export default NotFound;