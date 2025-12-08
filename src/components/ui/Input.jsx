import React from 'react';

export const Input = ({ label, error, className = "", ...props }) => (
    <div className={`space-y-1.5 ${className}`}>
        {label && <label className="text-xs font-mono text-gray-400 uppercase tracking-wider">{label}</label>}
        <div className="relative group">
            <input 
                className={`
                    w-full bg-bg-paper border border-white/10 rounded-lg px-4 py-2.5 
                    text-sm text-white placeholder-gray-600 outline-none transition-all
                    focus:border-primary focus:shadow-neon group-hover:border-white/20
                    ${error ? "border-status-error focus:border-status-error" : ""}
                `}
                {...props}
            />
            <div className="absolute inset-0 rounded-lg bg-primary/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
        </div>
        {error && <span className="text-xs text-status-error">{error}</span>}
    </div>
);