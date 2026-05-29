export function ProductionFrame({ children, title, size }: { children: React.ReactNode, title: string, size: string }) {
  return (
    <div style={{ 
      width: '3508px', height: '4961px', // Ukuran A3 Landscape
      border: '40px solid #000', 
      padding: '100px', 
      display: 'flex', 
      flexDirection: 'column',
      background: 'white',
      fontFamily: 'sans-serif'
    }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px' }}>
        <div>
          <h1 style={{ fontSize: '150px', margin: 0 }}>SPORTS JERSEY</h1>
          <p style={{ fontSize: '60px' }}>[ Sublimation Print — Editable Pattern Design ]</p>
        </div>
        <div style={{ fontSize: '100px', fontWeight: 'bold', border: '10px solid #000', padding: '20px' }}>NEW</div>
      </div>

      {/* CONTENT AREA */}
      <div style={{ flex: 1, border: '20px solid #000', borderRadius: '50px', padding: '50px' }}>
        {children}
      </div>

      {/* FOOTER DETAIL */}
      <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '10px solid #000', paddingTop: '50px' }}>
        <div style={{ display: 'flex', gap: '100px', fontSize: '60px' }}>
          <span>1. Collar</span> <span>2. Front Body</span> <span>3. Back Body</span>
        </div>
        <div style={{ width: '300px', height: '300px', border: '10px solid #000' }}>{/* Logo Apparel */}</div>
      </div>
    </div>
  );
}