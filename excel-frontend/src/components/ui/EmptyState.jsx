import { FiInbox } from 'react-icons/fi';

const EmptyState = ({ icon: Icon = FiInbox, title, desc, action }) => (
  <div className="card py-16 px-6 text-center">
    <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
      <Icon size={24} />
    </span>
    <h3 className="font-display text-lg font-semibold mt-5">{title}</h3>
    <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto">{desc}</p>
    {action && <div className="mt-6">{action}</div>}
  </div>
);

export default EmptyState;