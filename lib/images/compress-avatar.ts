/** Comprime una imagen a JPEG para guardarla como data URL en localStorage (tamaño acotado). */
export function compressImageToDataUrl(file: File, maxEdge = 256, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('read'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('img'));
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        const r = Math.min(maxEdge / w, maxEdge / h, 1);
        w = Math.round(w * r);
        h = Math.round(h * r);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('canvas'));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
