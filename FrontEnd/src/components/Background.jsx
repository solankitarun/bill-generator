import { motion } from 'framer-motion';

const Background = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Aurora effects */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-indigo-500/20 blur-[120px]"
      />
      
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          rotate: [90, 0, 90],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-blue-500/10 blur-[100px]"
      />

      <motion.div
        animate={{
          x: [-20, 20, -20],
          y: [-20, 20, -20],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-[30%] left-[20%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[80px]"
      />

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.03] bg-grid-pattern transition-opacity duration-300" />
      
      {/* Vignette - disabled in light mode to keep it bright */}
      <div className="absolute inset-0 bg-radial-vignette pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-300" />
    </div>
  );
};

export default Background;
