import type { Metadata } from 'next';
import Link from 'next/link';
import CatalogSection, { type CatalogProduct } from '@/components/CatalogSection';
import { getProducts, getSettings } from '@/lib/data';
import { CATEGORIES } from '@/lib/specs';
import { catalogStatus, isFlash, productDescription, rupiah, waNumber } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: `${s.store_name} — Computer Store`,
    description: `${s.store_name} — Computer Store, Laptop, PC, Printer, Networking dan kebutuhan IT.`,
  };
}

const mapsUrl = (q: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

export default async function CatalogPage() {
  const [store, all] = await Promise.all([getSettings(), getProducts()]);

  const storeName = store.store_name || 'GEOTAMA COMPUTER';
  const bio = store.bio || 'Solusi komputer, laptop, networking dan kebutuhan IT.';
  const { address, address2, email, instagram, facebook, tiktok } = store;
  const wa = waNumber(store.whatsapp || store.phone || '');
  const waBase = wa ? `https://wa.me/${wa}` : '#';
  const generalWa = wa
    ? `${waBase}?text=${encodeURIComponent(`Halo ${storeName}, saya ingin bertanya mengenai produk komputer.`)}`
    : '#';

  const products: CatalogProduct[] = all.map((p, i) => {
    const stock = Number(p.stock) || 0;
    const status = catalogStatus(stock);
    const price = Number(p.price) || 0;
    const category = String(p.category ?? 'Lainnya');
    const sku = String(p.sku ?? p.code ?? '');
    const name = String(p.name ?? 'Produk');
    const description = productDescription(p) || 'Produk komputer berkualitas.';
    return {
      key: String(p.id ?? i),
      name,
      category,
      description,
      price,
      priceText: rupiah(price),
      stock,
      image: String(p.image ?? p.image_url ?? ''),
      sku,
      flash: isFlash(p),
      statusLabel: status.label,
      statusClass: status.cls,
      statusIcon: status.icon,
      waHref:
        waBase === '#'
          ? '#'
          : `${waBase}?text=${encodeURIComponent(
              `Halo ${storeName}, saya tertarik dengan produk:\n\nNama: ${name}\nHarga: ${rupiah(price)}\n\nApakah produk ini masih tersedia?`,
            )}`,
      search: [p.name, p.category, description, p.brand, p.sku, p.code].join(' ').toLowerCase(),
    };
  });

  const totalReady = products.filter((p) => p.stock > 0).length;
  const totalFlash = products.filter((p) => p.flash).length;
  const totalRestock = products.filter((p) => p.stock > 0 && p.stock <= 3).length;

  const stats = [
    { icon: 'fa-box', value: products.length, label: 'Produk' },
    { icon: 'fa-circle-check', value: totalReady, label: 'Ready Stock' },
    { icon: 'fa-bolt', value: totalFlash, label: 'Flash Sale' },
    { icon: 'fa-truck-fast', value: totalRestock, label: 'Stok Terbatas' },
  ];

  return (
    <>
      <header className="navbar">
        <div className="container nav-inner">
          <Link href="/" className="brand">
            <div className="brand-logo">
              <i className="fa-solid fa-microchip" />
            </div>
            <div className="brand-text">
              <div className="brand-name">{storeName}</div>
              <div className="brand-sub">Computer Store & IT Solution</div>
            </div>
          </Link>
          <nav className="nav-links">
            <a href="#produk" className="nav-link">Produk</a>
            <a href="#tentang" className="nav-link">Tentang</a>
            <a href="#kontak" className="nav-link">Kontak</a>
            <Link href="/login" className="nav-admin" title="Login Admin">
              <i className="fa-solid fa-user-shield" />
              <span>Admin</span>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container">
            <div className="hero-grid">
              <div>
                <div className="hero-badge">
                  <i className="fa-solid fa-circle-check" /> Ready Stock • Original Product
                </div>
                <h1>
                  Upgrade
                  <span>Your Digital Life.</span>
                </h1>
                <p>
                  {bio} Temukan laptop, PC, monitor, printer, sparepart, networking dan berbagai kebutuhan
                  komputer lainnya di {storeName}.
                </p>
                <div className="hero-actions">
                  <a href="#produk" className="btn btn-primary">
                    <i className="fa-solid fa-store" /> Lihat Produk
                  </a>
                  {wa && (
                    <a href={generalWa} target="_blank" rel="noopener" className="btn btn-outline">
                      <i className="fa-brands fa-whatsapp" /> Chat WhatsApp
                    </a>
                  )}
                </div>
              </div>

              <div className="hero-card">
                <div className="hero-card-icon">
                  <i className="fa-solid fa-shield-halved" />
                </div>
                <h3>Belanja Lebih Mudah</h3>
                <p>Pilih produk, cek stok, lalu langsung hubungi kami melalui WhatsApp.</p>
                <div className="hero-card-info">
                  <div className="info-row">
                    <i className="fa-solid fa-location-dot" />
                    <a href={mapsUrl(address)} target="_blank" rel="noopener noreferrer">{address}</a>
                  </div>
                  <div className="info-row">
                    <i className="fa-solid fa-envelope" />
                    <a href={`mailto:${email}`}>{email}</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="container">
            <div className="stats">
              {stats.map((s) => (
                <div className="stat" key={s.label}>
                  <div className="stat-icon"><i className={`fa-solid ${s.icon}`} /></div>
                  <div className="stat-number">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="produk">
          <div className="container">
            <div className="section-head">
              <div>
                <h2 className="section-title">Produk Pilihan</h2>
                <p className="section-desc">Cari kebutuhan komputer kamu dengan mudah.</p>
              </div>
            </div>
            <CatalogSection categories={CATEGORIES} products={products} />
          </div>
        </section>

        <section className="section" id="tentang">
          <div className="container">
            <div className="contact-box">
              <div>
                <div className="hero-badge">
                  <i className="fa-solid fa-circle-info" /> Tentang {storeName}
                </div>
                <h2>Solusi Lengkap Perangkat IT.</h2>
                <p>
                  {bio} Kami menyediakan berbagai kebutuhan komputer dan perangkat IT mulai dari laptop, PC,
                  monitor, printer, sparepart, networking hingga CCTV.
                </p>
              </div>
              <div className="contact-info">
                {[address, address2].filter(Boolean).map((a) => (
                  <a key={a} href={mapsUrl(a)} target="_blank" rel="noopener noreferrer" className="contact-item">
                    <i className="fa-solid fa-location-dot" />
                    <span>{a}</span>
                  </a>
                ))}
                {facebook && (
                  <a href={facebook} target="_blank" rel="noopener" className="contact-item">
                    <i className="fa-brands fa-facebook" />
                    <span>Facebook</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="kontak">
          <div className="container">
            <div className="section-head">
              <div>
                <h2 className="section-title">Hubungi Kami</h2>
                <p className="section-desc">Butuh konsultasi atau ingin cek produk? Langsung hubungi tim kami.</p>
              </div>
            </div>
            <div className="contact-box">
              <div>
                <h2>Siap bantu kebutuhan IT kamu.</h2>
                <p>
                  Konsultasikan kebutuhan komputer, upgrade, printer, networking, maintenance dan kebutuhan IT
                  lainnya.
                </p>
                <div className="hero-actions" style={{ marginTop: 20 }}>
                  {wa && (
                    <a href={generalWa} target="_blank" rel="noopener" className="btn btn-primary">
                      <i className="fa-brands fa-whatsapp" /> WhatsApp
                    </a>
                  )}
                  <a href={`mailto:${email}`} className="btn btn-outline">
                    <i className="fa-solid fa-envelope" /> Email
                  </a>
                </div>
              </div>
              <div className="contact-info">
                {instagram && (
                  <a href={instagram} target="_blank" rel="noopener" className="contact-item">
                    <i className="fa-brands fa-instagram" /><span>Instagram</span>
                  </a>
                )}
                {facebook && (
                  <a href={facebook} target="_blank" rel="noopener" className="contact-item">
                    <i className="fa-brands fa-facebook" /><span>Facebook</span>
                  </a>
                )}
                {tiktok && (
                  <a href={tiktok} target="_blank" rel="noopener" className="contact-item">
                    <i className="fa-brands fa-tiktok" /><span>TikTok</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <div>© {new Date().getFullYear()} {storeName}. All rights reserved.</div>
          <div className="socials">
            {instagram && (
              <a href={instagram} target="_blank" rel="noopener" className="social" title="Instagram">
                <i className="fa-brands fa-instagram" />
              </a>
            )}
            {facebook && (
              <a href={facebook} target="_blank" rel="noopener" className="social" title="Facebook">
                <i className="fa-brands fa-facebook" />
              </a>
            )}
            {tiktok && (
              <a href={tiktok} target="_blank" rel="noopener" className="social" title="TikTok">
                <i className="fa-brands fa-tiktok" />
              </a>
            )}
          </div>
        </div>
      </footer>

      {wa && (
        <a href={generalWa} target="_blank" rel="noopener" className="float-wa" title="Chat WhatsApp">
          <i className="fa-brands fa-whatsapp" />
        </a>
      )}
    </>
  );
}
