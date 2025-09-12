import "./index.css"; 

const AnimatedLoader = () => {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div className="animate-pulse" style={{
        animation: 'zoomInOut 1.5s ease-in-out infinite'
      }}>
        <img 
          src="/icon_white.svg" 
          alt="Loading..." 
          className="w-20 h-20"
        />
      </div>
      
      <style>{`
        @keyframes zoomInOut {
          0%, 100% {
            transform: scale(2);
          }
          50% {
            transform: scale(2.2);
          }
        }
      `}</style>
    </div>
  );
};

export default AnimatedLoader;
