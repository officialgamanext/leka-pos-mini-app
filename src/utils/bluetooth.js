/**
 * bluetooth.js — Web Bluetooth API for ESC/POS thermal printers
 * Works on: Android Chrome, Windows/Mac Chrome/Edge
 * Note: iOS Safari does not support Web Bluetooth regardless of approach.
 *
 * Common BLE printer service UUIDs:
 *   000018f0-... (Generic Serial, most common)
 *   e7810a71-... (Xprinter, GOOJPRT, Epoch)
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

export async function connectPrinter() {
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
    // Fallback: let user pick from all BLE devices
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
    throw new Error('Connected but no writable characteristic found. Is this an ESC/POS printer?');
  }

  device.addEventListener('gattserverdisconnected', () => {
    _writeChar = null;
    _name = null;
  });

  return { name: _name };
}

export async function disconnectPrinter() {
  _writeChar = null;
  _name      = null;
}

export const isPrinterConnected = () => !!_writeChar;
export const getPrinterName     = () => _name;

export async function sendRaw(data) {
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

export async function printText(text) {
  const enc   = new TextEncoder();
  const ESC   = 0x1b;
  const GS    = 0x1d;
  const parts = [
    new Uint8Array([ESC, 0x40]),
    new Uint8Array([ESC, 0x61, 0x00]),
    enc.encode(text),
    new Uint8Array([ESC, 0x64, 0x04]),
    new Uint8Array([GS, 0x56, 0x41, 0x10]),
  ];
  let total = parts.reduce((s, p) => s + p.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const p of parts) { out.set(p, offset); offset += p.length; }
  await sendRaw(out);
}
