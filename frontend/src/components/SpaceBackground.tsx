export function SpaceBackground() {
  return (
    <>
      <style>{`
        .space-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          background: radial-gradient(ellipse at 50% 50%, #0a1628 0%, #050810 60%, #000 100%);
          overflow: hidden;
          pointer-events: none;
        }

        /* Estrellas */
        .stars-1, .stars-2, .stars-3 {
          position: absolute;
          inset: 0;
          background-repeat: repeat;
        }

        .stars-1 {
          background-image: radial-gradient(1px 1px at 10% 15%, #00e5ff88 0%, transparent 100%),
            radial-gradient(1px 1px at 25% 40%, #ffffff66 0%, transparent 100%),
            radial-gradient(1px 1px at 40% 10%, #00e5ffaa 0%, transparent 100%),
            radial-gradient(1px 1px at 55% 70%, #ffffff44 0%, transparent 100%),
            radial-gradient(1px 1px at 70% 30%, #00e5ff66 0%, transparent 100%),
            radial-gradient(1px 1px at 85% 55%, #ffffff88 0%, transparent 100%),
            radial-gradient(1px 1px at 15% 80%, #00e5ff44 0%, transparent 100%),
            radial-gradient(1px 1px at 90% 85%, #ffffff66 0%, transparent 100%),
            radial-gradient(1px 1px at 35% 55%, #00e5ffaa 0%, transparent 100%),
            radial-gradient(1px 1px at 60% 90%, #ffffff44 0%, transparent 100%),
            radial-gradient(1px 1px at 75% 5%, #00e5ff88 0%, transparent 100%),
            radial-gradient(1px 1px at 5% 50%, #ffffff66 0%, transparent 100%),
            radial-gradient(1px 1px at 48% 35%, #00e5ff55 0%, transparent 100%),
            radial-gradient(1px 1px at 92% 20%, #ffffff44 0%, transparent 100%),
            radial-gradient(1px 1px at 20% 65%, #00e5ffaa 0%, transparent 100%);
          background-size: 400px 400px;
          animation: drift1 80s linear infinite;
          opacity: 0.8;
        }

        .stars-2 {
          background-image: radial-gradient(1.5px 1.5px at 8% 22%, #00e5ffcc 0%, transparent 100%),
            radial-gradient(1px 1px at 30% 60%, #ffffff55 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 50% 45%, #00e5ff88 0%, transparent 100%),
            radial-gradient(1px 1px at 65% 15%, #ffffff66 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 80% 75%, #00e5ffaa 0%, transparent 100%),
            radial-gradient(1px 1px at 95% 40%, #ffffff44 0%, transparent 100%),
            radial-gradient(1px 1px at 18% 90%, #00e5ff66 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 42% 72%, #ffffff88 0%, transparent 100%),
            radial-gradient(1px 1px at 72% 50%, #00e5ff55 0%, transparent 100%),
            radial-gradient(1px 1px at 88% 10%, #ffffff44 0%, transparent 100%);
          background-size: 600px 600px;
          animation: drift2 120s linear infinite;
          opacity: 0.6;
        }

        .stars-3 {
          background-image: radial-gradient(2px 2px at 15% 35%, #00e5ffee 0%, transparent 100%),
            radial-gradient(2px 2px at 45% 80%, #00e5ffcc 0%, transparent 100%),
            radial-gradient(2px 2px at 78% 25%, #00e5ffee 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 32% 15%, #ffffffaa 0%, transparent 100%),
            radial-gradient(2px 2px at 62% 60%, #00e5ffcc 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 90% 70%, #ffffffbb 0%, transparent 100%);
          background-size: 800px 800px;
          animation: drift3 160s linear infinite;
          opacity: 0.9;
          filter: blur(0.3px);
        }

        @keyframes drift1 {
          from { transform: translateY(0) translateX(0); }
          to   { transform: translateY(-400px) translateX(20px); }
        }
        @keyframes drift2 {
          from { transform: translateY(0) translateX(0); }
          to   { transform: translateY(-600px) translateX(-30px); }
        }
        @keyframes drift3 {
          from { transform: translateY(0) translateX(0); }
          to   { transform: translateY(-800px) translateX(15px); }
        }

        /* Líneas de conexión estilo Kaspersky */
        .network-lines {
          position: absolute;
          inset: 0;
          opacity: 0.15;
        }

        /* Puntos de red pulsantes */
        .network-dots {
          position: absolute;
          inset: 0;
        }

        .dot {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #00e5ff;
          box-shadow: 0 0 6px #00e5ff;
          animation: pulse-dot 3s ease-in-out infinite;
        }

        .dot::after {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 1px solid #00e5ff44;
          animation: ring-expand 3s ease-out infinite;
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.3); }
        }

        @keyframes ring-expand {
          0%   { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(4); opacity: 0; }
        }

        /* Brillo central */
        .glow-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 600px;
          height: 600px;
          background: radial-gradient(ellipse, rgba(0,229,255,0.04) 0%, transparent 70%);
          pointer-events: none;
        }

        /* Logo marca de agua */
        .watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          opacity: 0.03;
          width: 400px;
          height: 400px;
          object-fit: contain;
          pointer-events: none;
          filter: blur(1px);
        }
      `}</style>

      <div className="space-bg">
        <div className="stars-1" />
        <div className="stars-2" />
        <div className="stars-3" />

        {/* SVG con líneas de red estilo Kaspersky */}
        <svg className="network-lines" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="line1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00e5ff" stopOpacity="0" />
              <stop offset="50%" stopColor="#00e5ff" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="line2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0070f3" stopOpacity="0" />
              <stop offset="50%" stopColor="#0070f3" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#0070f3" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Líneas curvas de conexión */}
          <path d="M 100 200 Q 400 100 720 450 Q 1000 750 1350 300" stroke="url(#line1)" strokeWidth="1" fill="none">
            <animate attributeName="stroke-dashoffset" from="1000" to="0" dur="8s" repeatCount="indefinite" />
            <animate attributeName="stroke-dasharray" values="0,1000;200,800;0,1000" dur="8s" repeatCount="indefinite" />
          </path>
          <path d="M 0 600 Q 300 400 600 500 Q 900 600 1440 200" stroke="url(#line2)" strokeWidth="1" fill="none">
            <animate attributeName="stroke-dashoffset" from="1000" to="0" dur="12s" repeatCount="indefinite" />
            <animate attributeName="stroke-dasharray" values="0,1000;300,700;0,1000" dur="12s" repeatCount="indefinite" />
          </path>
          <path d="M 200 900 Q 500 600 800 400 Q 1100 200 1440 500" stroke="url(#line1)" strokeWidth="0.8" fill="none">
            <animate attributeName="stroke-dashoffset" from="1000" to="0" dur="15s" repeatCount="indefinite" />
            <animate attributeName="stroke-dasharray" values="0,1000;150,850;0,1000" dur="15s" repeatCount="indefinite" />
          </path>
          <path d="M 700 0 Q 600 300 900 500 Q 1200 700 1100 900" stroke="url(#line2)" strokeWidth="0.8" fill="none">
            <animate attributeName="stroke-dashoffset" from="1000" to="0" dur="10s" repeatCount="indefinite" />
            <animate attributeName="stroke-dasharray" values="0,1000;250,750;0,1000" dur="10s" repeatCount="indefinite" />
          </path>
          <path d="M 0 300 Q 200 450 500 350 Q 800 250 1440 600" stroke="url(#line1)" strokeWidth="0.6" fill="none">
            <animate attributeName="stroke-dashoffset" from="1000" to="0" dur="18s" repeatCount="indefinite" />
            <animate attributeName="stroke-dasharray" values="0,1000;180,820;0,1000" dur="18s" repeatCount="indefinite" />
          </path>
        </svg>

        {/* Puntos de red pulsantes */}
        <div className="network-dots">
          {[
            { top: "15%", left: "10%" }, { top: "30%", left: "25%" },
            { top: "60%", left: "15%" }, { top: "20%", left: "60%" },
            { top: "45%", left: "50%" }, { top: "70%", left: "70%" },
            { top: "10%", left: "80%" }, { top: "80%", left: "40%" },
            { top: "55%", left: "85%" }, { top: "35%", left: "75%" },
          ].map((pos, i) => (
            <div
              key={i}
              className="dot"
              style={{
                top: pos.top,
                left: pos.left,
                animationDelay: `${i * 0.4}s`,
              }}
            />
          ))}
        </div>

        {/* Logo marca de agua central */}
        <img src="/logo.png" className="watermark" alt="" />

        <div className="glow-center" />
      </div>
    </>
  );
}