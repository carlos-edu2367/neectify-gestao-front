import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export const Button = ({ children, variant = 'primary', className = "", loading, disabled, ...props }) => {
    const baseClasses = "relative px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group";
    
    const variants = {
        primary: "bg-primary text-white hover:bg-primary-hover shadow-neon hover:shadow-neon-strong",
        ghost: "bg-transparent text-gray-400 hover:text-white hover:bg-white/5",
        danger: "bg-status-error/10 text-status-error hover:bg-status-error/20 border border-status-error/20"
    };

    return (
        <motion.button 
            whileTap={{ scale: 0.98 }}
            className={`${baseClasses} ${variants[variant]} ${className}`}
            disabled={loading || disabled}
            {...props}
        >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {children}
            {variant === 'primary' && !loading && !disabled && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            )}
        </motion.button>
    );
};