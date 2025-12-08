import { motion } from 'framer-motion';

export const Card = ({ children, className = "", noPadding = false, ...props }) => (
    <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`glass-card rounded-xl overflow-hidden relative ${className}`}
        {...props}
    >
        {/* Glow no topo */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className={noPadding ? "" : "p-5"}>
            {children}
        </div>
    </motion.div>
);