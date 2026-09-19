const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={`flex items-center justify-center py-12 ${className}`}>
      <div className={`${sizes[size]} border-2 border-slate-700 border-t-emerald-400 rounded-full animate-spin`} />
    </div>
  );
};

export default Spinner;