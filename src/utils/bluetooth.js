/**
 * bluetooth.js — Web Bluetooth API bridge for ESC/POS thermal printers
 * 
 * Supports most BLE thermal printers (common Chinese/generic models)
 * via the standard serial-over-BLE profile.
 * 
 * Common service/characteristic UUIDs for BLE thermal printers:
 *   - Generic: 000018f0-0000-1000-8000-00805f9b34fb
 *   - Epoch/Xprinter/GOOJPRT: e7810a71-73ae-499d-8c15-faa9aef0c3f2
 */

// Known BLE printer service UUIDs (most common thermal printers)
const PRINTER_SERVICES = [
  '000018f0-0000-1000-8000-00805f9b34fb',   // Generic Serial (most common)
  'e7810a71-73ae-499d-8c15-faa9aef0c3f2',   // Xprinter, GOOJPRT, Epoch
  '49535343-fe7d-4ae5-8fa9-9fafd205e455',   // Microchip RN-42
  '0000ff00-0000-1000-8000-00805f9b34fb',   // Alternative generic
];

// Writable characteristic UUIDs corresponding to above
const PRINTER_CHARACTERISTICS = [
  '00002af1-0000-1000-8000-00805f9b34fb',
  'bef8d6c9-9c21-4c9e-b632-bd58c1009f9f',
  '49535343-1e4d-4bd9-ba61-23c647249616',
  '0000ff02-0000-1000-8000-00805f9b34fb',
];

let _device     = null;
let _server     = null;
let _writeChar  = null;

/**
 * Scan and connect to a BLE printer.
 * Opens the browser's native device picker.
 * @returns {{ name: string, device: BluetoothDevice }}
 */
export async function connectPrinter() {
  if (!navigator.bluetooth) {
    throw new Error('Web Bluetooth is not supported in this browser. Use Chrome or Edge.');
  }

  const device = await navigator.bluetooth.requestDevice({
    // Accept any device that advertises one of the known printer services
    filters: PRINTER_SERVICES.map(uuid => ({ services: [uuid] })),
    optionalServices: PRINTER_SERVICES,
  }).catch(() => {
    // Fallback: accept ALL devices (user picks from full list)
    return navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: PRINTER_SERVICES,
    });
  });

  _device = device;
  _server = await device.gatt.connect();

  // Try each service until we find a writable characteristic
  for (let i = 0; i < PRINTER_SERVICES.length; i++) {
    try {
      const service = await _server.getPrimaryService(PRINTER_SERVICES[i]);
      const chars   = await service.getCharacteristics();

      // Look for a writable characteristic
      const writable = chars.find(c =>
        c.properties.write || c.properties.writeWithoutResponse
      );

      if (writable) {
        _writeChar = writable;
        break;
      }

      // Also try known characteristic UUIDs
      for (const cuuid of PRINTER_CHARACTERISTICS) {
        try {
          const char = await service.getCharacteristic(cuuid);
          if (char.properties.write || char.properties.writeWithoutResponse) {
            _writeChar = char;
            break;
          }
        } catch (_) { /* not found, try next */ }
      }

      if (_writeChar) break;
    } catch (_) { /* service not on this device, try next */ }
  }

  if (!_writeChar) {
    await _server.disconnect();
    throw new Error('Printer connected but no writable characteristic found. Is this an ESC/POS printer?');
  }

  // Listen for disconnect events
  device.addEventListener('gattserverdisconnected', () => {
    _device    = null;
    _server    = null;
    _writeChar = null;
  });

  return { name: device.name || 'Unknown Printer', device };
}

/**
 * Disconnect the current printer.
 */
export async function disconnectPrinter() {
  if (_server?.connected) _server.disconnect();
  _device    = null;
  _server    = null;
  _writeChar = null;
}

/**
 * Returns true if a printer is currently connected.
 */
export function isPrinterConnected() {
  return !!(  _device && _server?.connected && _writeChar);
}

/**
 * Get the name of the connected printer.
 */
export function getPrinterName() {
  return _device?.name || null;
}

/**
 * Send raw bytes to the printer in 128-byte chunks (prevents buffer overflow).
 * @param {Uint8Array} data
 */
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
    // Small delay between chunks to prevent buffer overflow
    await new Promise(r => setTimeout(r, 20));
  }
}

/**
 * Print a plain text receipt.
 * @param {string} text
 */
export async function printText(text) {
  const encoder = new TextEncoder();
  const ESC = 0x1b;
  const GS  = 0x1d;

  // Build bytes: init + text + feed + cut
  const init    = new Uint8Array([ESC, 0x40]);                     // ESC @ — init
  const align_c = new Uint8Array([ESC, 0x61, 0x01]);               // ESC a 1 — center
  const align_l = new Uint8Array([ESC, 0x61, 0x00]);               // ESC a 0 — left
  const bold_on = new Uint8Array([ESC, 0x45, 0x01]);               // ESC E 1 — bold on
  const bold_off= new Uint8Array([ESC, 0x45, 0x00]);               // ESC E 0 — bold off
  const feed    = new Uint8Array([ESC, 0x64, 0x04]);               // ESC d 4 — 4 lines
  const cut     = new Uint8Array([GS,  0x56, 0x41, 0x10]);         // GS V A — cut

  const body    = encoder.encode(text);

  // Combine all
  const total = init.length + align_l.length + body.length + feed.length + cut.length;
  const out   = new Uint8Array(total);
  let offset  = 0;
  for (const part of [init, align_l, body, feed, cut]) {
    out.set(part, offset);
    offset += part.length;
  }

  await sendRaw(out);
}
