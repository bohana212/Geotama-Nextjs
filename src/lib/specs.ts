export type Spec = { key: string; label: string; icon: string };

export const CATEGORIES = [
  'Laptop',
  'PC Fullset',
  'CPU Only',
  'Monitor',
  'Aksesoris PC/Laptop',
  'Printer',
  'Tinta',
  'Networking',
  'CCTV',
];

const s = (key: string, label: string, icon: string): Spec => ({ key, label, icon });

const SPECS: Record<string, Spec[]> = {
  laptop: [
    s('cpu', 'Processor', 'fa-solid fa-microchip'),
    s('ram', 'RAM', 'fa-solid fa-memory'),
    s('ssd', 'Storage', 'fa-solid fa-hard-drive'),
    s('display', 'Display', 'fa-solid fa-display'),
    s('os', 'OS', 'fa-brands fa-windows'),
    s('gpu', 'GPU', 'fa-solid fa-gamepad'),
  ],
  'pc fullset': [
    s('cpu', 'Processor', 'fa-solid fa-microchip'),
    s('ram', 'RAM', 'fa-solid fa-memory'),
    s('ssd', 'Storage', 'fa-solid fa-hard-drive'),
    s('vga', 'VGA', 'fa-solid fa-gamepad'),
    s('monitor', 'Monitor', 'fa-solid fa-display'),
    s('psu', 'PSU', 'fa-solid fa-bolt'),
  ],
  'cpu only': [
    s('socket', 'Socket', 'fa-solid fa-microchip'),
    s('cores', 'Core', 'fa-solid fa-layer-group'),
    s('threads', 'Thread', 'fa-solid fa-diagram-project'),
    s('base_clock', 'Base Clock', 'fa-solid fa-gauge-high'),
    s('boost_clock', 'Boost Clock', 'fa-solid fa-bolt'),
    s('tdp', 'TDP', 'fa-solid fa-temperature-half'),
  ],
  monitor: [
    s('size', 'Ukuran', 'fa-solid fa-expand'),
    s('panel', 'Panel', 'fa-solid fa-tv'),
    s('resolution', 'Resolusi', 'fa-solid fa-maximize'),
    s('refresh_rate', 'Refresh Rate', 'fa-solid fa-arrows-rotate'),
    s('response_time', 'Response Time', 'fa-solid fa-stopwatch'),
    s('ports', 'Port', 'fa-solid fa-plug'),
  ],
  printer: [
    s('brand', 'Merk', 'fa-solid fa-copyright'),
    s('printer_type', 'Tipe', 'fa-solid fa-print'),
    s('print_technology', 'Teknologi', 'fa-solid fa-gears'),
    s('resolution', 'Resolusi', 'fa-solid fa-maximize'),
    s('print_speed', 'Kecepatan', 'fa-solid fa-gauge-high'),
    s('connectivity', 'Koneksi', 'fa-solid fa-wifi'),
  ],
  tinta: [
    s('ink_type', 'Tipe', 'fa-solid fa-droplet'),
    s('color', 'Warna', 'fa-solid fa-palette'),
    s('capacity', 'Kapasitas', 'fa-solid fa-flask'),
    s('compatibility', 'Kompatibilitas', 'fa-solid fa-link'),
    s('type_code', 'Kode', 'fa-solid fa-barcode'),
    s('condition', 'Kondisi', 'fa-solid fa-circle-check'),
  ],
  networking: [
    s('network_type', 'Tipe', 'fa-solid fa-network-wired'),
    s('speed', 'Speed', 'fa-solid fa-gauge-high'),
    s('ports', 'Port', 'fa-solid fa-ethernet'),
    s('wifi', 'Wi-Fi', 'fa-solid fa-wifi'),
    s('antenna', 'Antenna', 'fa-solid fa-satellite-dish'),
    s('range', 'Coverage', 'fa-solid fa-tower-broadcast'),
  ],
  cctv: [
    s('resolution', 'Resolusi', 'fa-solid fa-camera'),
    s('lens', 'Lens', 'fa-solid fa-eye'),
    s('night_vision', 'Night Vision', 'fa-solid fa-moon'),
    s('storage', 'Storage', 'fa-solid fa-hard-drive'),
    s('connectivity', 'Koneksi', 'fa-solid fa-wifi'),
    s('weatherproof', 'Protection', 'fa-solid fa-cloud-rain'),
  ],
  'aksesoris pc/laptop': [
    s('accessory_type', 'Tipe', 'fa-solid fa-toolbox'),
    s('connectivity', 'Koneksi', 'fa-solid fa-plug'),
    s('compatibility', 'Kompatibilitas', 'fa-solid fa-laptop'),
    s('interface', 'Interface', 'fa-solid fa-usb'),
    s('material', 'Material', 'fa-solid fa-cubes'),
    s('warranty', 'Garansi', 'fa-solid fa-shield-halved'),
  ],
};

const DEFAULT_SPECS: Spec[] = [
  s('brand', 'Merk', 'fa-solid fa-copyright'),
  s('model', 'Model', 'fa-solid fa-tag'),
  s('condition', 'Kondisi', 'fa-solid fa-circle-check'),
  s('warranty', 'Garansi', 'fa-solid fa-shield-halved'),
  s('weight', 'Berat', 'fa-solid fa-weight-hanging'),
  s('connectivity', 'Koneksi', 'fa-solid fa-plug'),
];

export function getCategorySpecs(category?: string): Spec[] {
  const c = (category ?? '').trim().toLowerCase();
  if (c === 'aksesoris') return SPECS['aksesoris pc/laptop'];
  return SPECS[c] ?? DEFAULT_SPECS;
}

/** Field lama (data awal) yang tidak ada di konfigurasi kategori tetapi ingin tetap ditampilkan. */
export const LEGACY_SPECS: Spec[] = [
  s('brand', 'Merk', 'fa-solid fa-copyright'),
  s('model', 'Model', 'fa-solid fa-tag'),
  s('vga', 'VGA', 'fa-solid fa-gamepad'),
  s('condition', 'Kondisi', 'fa-solid fa-circle-check'),
  s('warranty', 'Garansi', 'fa-solid fa-shield-halved'),
  s('weight', 'Berat', 'fa-solid fa-weight-hanging'),
];
