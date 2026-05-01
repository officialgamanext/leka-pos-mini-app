/**
 * bluetooth.js — Web Bluetooth API for ESC/POS thermal printers
 * Works on: Android Chrome, Windows/Mac Chrome/Edge
 * Note: iOS Safari does not support Web Bluetooth regardless of approach.
 */

const PRINTER_SERVICES = [
  '000018f0-0000-1000-8000-00805f9b34fb',
  'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
  '49535343-fe7d-4ae5-8fa9-9fafd205e455',
  '0000ff00-0000-1000-8000-00805f9b34fb',
];

const WRITE_CHARS = [
  '00002af1-0000-1000-8000-00805f9b34fb',
  'bef8d6c9-9c21-4c9e-b632-bd58c1009f9f',
  '49535343-1e4d-4bd9-ba61-23c647249616',
  '0000ff02-0000-1000-8000-00805f9b34fb',
];

let _writeChar = null;
let _name      = null;

async function connectPrinter() {
  if (!navigator.bluetooth) {
    throw new Error(
      'Bluetooth is not supported in this browser.\n' +
      'Please use Chrome or Edge on Android/Windows/Mac.'
    );
  }

  let device;
  try {
    device = await navigator.bluetooth.requestDevice({
      filters: PRINTER_SERVICES.map(uuid => ({ services: [uuid] })),
      optionalServices: PRINTER_SERVICES,
    });
  } catch (_) {
    device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: PRINTER_SERVICES,
    });
  }

  const server = await device.gatt.connect();
  _name = device.name || 'Printer';

  for (const svcUuid of PRINTER_SERVICES) {
    try {
      const svc   = await server.getPrimaryService(svcUuid);
      const chars = await svc.getCharacteristics();
      const wr    = chars.find(c => c.properties.write || c.properties.writeWithoutResponse);
      if (wr) { _writeChar = wr; break; }

      for (const cUuid of WRITE_CHARS) {
        try {
          const c = await svc.getCharacteristic(cUuid);
          if (c.properties.write || c.properties.writeWithoutResponse) {
            _writeChar = c; break;
          }
        } catch (_) {}
      }
      if (_writeChar) break;
    } catch (_) {}
  }

  if (!_writeChar) {
    server.disconnect();
    throw new Error('Connected but no writable characteristic found.');
  }

  device.addEventListener('gattserverdisconnected', () => {
    _writeChar = null;
    _name = null;
  });

  return { name: _name };
}

async function disconnectPrinter() {
  if (_writeChar?.service?.device?.gatt?.connected) {
    _writeChar.service.device.gatt.disconnect();
  }
  _writeChar = null;
  _name      = null;
}

const isPrinterConnected = () => !!_writeChar;
const getPrinterName     = () => _name;

async function sendRaw(data) {
  if (!_writeChar) throw new Error('No printer connected');
  const chunkSize = 128;
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    if (_writeChar.properties.writeWithoutResponse) {
      await _writeChar.writeValueWithoutResponse(chunk);
    } else {
      await _writeChar.writeValue(chunk);
    }
    await new Promise(r => setTimeout(r, 20));
  }
}

async function printText(text) {
  const enc   = new TextEncoder();
  const ESC   = 0x1b;
  const GS    = 0x1d;
  const parts = [
    new Uint8Array([ESC, 0x40]),
    new Uint8Array([ESC, 0x61, 0x00]),
    enc.encode(text),
    new Uint8Array([ESC, 0x64, 0x01]),
    new Uint8Array([GS, 0x56, 0x41, 0x10]),
  ];
  let total = parts.reduce((s, p) => s + p.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const p of parts) { out.set(p, offset); offset += p.length; }
  await sendRaw(out);
}

async function printImage(imageUrl) {
  if (!imageUrl || !_writeChar) return;
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = async () => {
      try {
        const canvas = document.createElement("canvas");
        const maxWidth = 384;
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        width = Math.floor(width / 8) * 8;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        const imgData = ctx.getImageData(0, 0, width, height);
        const pixels = imgData.data;

        const xL = (width / 8) % 256;
        const xH = Math.floor((width / 8) / 256);
        const yL = height % 256;
        const yH = Math.floor(height / 256);

        const bytes = [0x1b, 0x40, 0x1b, 0x61, 0x01, 0x1D, 0x76, 0x30, 0x00, xL, xH, yL, yH];
        
        let byteVal = 0;
        let bitCount = 0;
        
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const r = pixels[idx];
            const g = pixels[idx+1];
            const b = pixels[idx+2];
            const a = pixels[idx+3];
            
            const luminance = (0.299*r + 0.587*g + 0.114*b);
            const isBlack = (a > 128 && luminance < 128) ? 1 : 0;
            
            byteVal = (byteVal << 1) | isBlack;
            bitCount++;
            
            if (bitCount === 8) {
              bytes.push(byteVal);
              byteVal = 0;
              bitCount = 0;
            }
          }
        }
        bytes.push(0x1b, 0x61, 0x00, 0x0A);
        const out = new Uint8Array(bytes);
        await sendRaw(out);
        resolve(true);
      } catch (err) {
        console.error("Print image error:", err);
        resolve(false);
      }
    };
    img.onerror = () => {
      console.error("Failed to load image");
      resolve(false);
    };
    img.src = imageUrl;
  });
}

export {
  connectPrinter,
  disconnectPrinter,
  isPrinterConnected,
  getPrinterName,
  sendRaw,
  printText,
  printImage
};
