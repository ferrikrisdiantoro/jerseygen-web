"use client";

interface TintedImageProps {
  src: string;
  color: string;
  isTinted: boolean;
  className?: string;
}

export function TintedImage({ src, color, isTinted, className }: TintedImageProps) {
  // Jika mode Tinted dimatikan, kembalikan gambar asli
  if (!isTinted) {
    return (
      <img 
        src={src} 
        alt="Sponsor" 
        className={className} 
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'contain',
          display: 'block' // Memastikan tidak ada ruang kosong di bawah
        }} 
      />
    );
  }

  // Jika mode Tinted dinyalakan
  return (
    <div
      className={className}
      style={{
        backgroundColor: color,
        maskImage: `url(${src})`,
        WebkitMaskImage: `url(${src})`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
        width: "100%",
        height: "100%",
      }}
    />
  );
}