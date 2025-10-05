import React from "react";

const BackgroundEffects = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Moving gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-gray-500/10 to-gray-600/10 rounded-full blur-3xl" 
           style={{ 
             animation: 'float 8s ease-in-out infinite'
           }} />
      <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-gray-400/8 to-gray-500/8 rounded-full blur-3xl" 
           style={{ 
             animationDelay: '2s',
             animation: 'floatReverse 10s ease-in-out infinite'
           }} />
      
      {/* Moving geometric shapes */}
      <div className="absolute top-1/3 right-1/3 w-32 h-32 border border-gray-400/20 rotate-45" 
           style={{ 
             animation: 'moveAndRotate 15s linear infinite'
           }} />
      <div className="absolute bottom-1/3 left-1/3 w-24 h-24 border border-gray-300/15 rotate-12" 
           style={{ 
             animation: 'moveAndRotateReverse 12s linear infinite'
           }} />
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-3"
        style={{
          backgroundImage: `
            linear-gradient(rgba(128,128,128,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(128,128,128,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
      
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(0px) translateX(20px); }
          75% { transform: translateY(20px) translateX(10px); }
        }
        
        @keyframes floatReverse {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(15px) translateX(-15px); }
          50% { transform: translateY(0px) translateX(-30px); }
          75% { transform: translateY(-15px) translateX(-15px); }
        }
        
        @keyframes moveAndRotate {
          0% { transform: translateX(0px) translateY(0px) rotate(45deg); }
          25% { transform: translateX(50px) translateY(-30px) rotate(135deg); }
          50% { transform: translateX(0px) translateY(-60px) rotate(225deg); }
          75% { transform: translateX(-50px) translateY(-30px) rotate(315deg); }
          100% { transform: translateX(0px) translateY(0px) rotate(405deg); }
        }
        
        @keyframes moveAndRotateReverse {
          0% { transform: translateX(0px) translateY(0px) rotate(12deg); }
          33% { transform: translateX(-40px) translateY(40px) rotate(-108deg); }
          66% { transform: translateX(40px) translateY(20px) rotate(-228deg); }
          100% { transform: translateX(0px) translateY(0px) rotate(-348deg); }
        }
      `}</style>
    </div>
  );
};

export default BackgroundEffects;