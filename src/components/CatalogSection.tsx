'use client';

import { useEffect, useMemo, useState } from 'react';

export type CatalogProduct = {
  key: string;
  name: string;
  category: string;
  description: string;
  price: number;
  priceText: string;
  stock: number;
  image: string;
  sku: string;
  flash: boolean;
  statusLabel: string;
  statusClass: string;
  statusIcon: string;
  waHref: string;
  search: string;
};

function ProductImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className="no-image">
        <i className={`fa-solid ${src ? 'fa-image' : 'fa-computer'}`} />
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />;
}

export default function CatalogSection({
  categories,
  products,
}: {
  categories: string[];
  products: CatalogProduct[];
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [detail, setDetail] = useState<CatalogProduct | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(
      (p) =>
        (category === 'all' || p.category.toLowerCase() === category) &&
        (q === '' || p.search.includes(q)),
    );
  }, [products, query, category]);

  useEffect(() => {
    if (!detail) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDetail(null);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [detail]);

  function notify(p: CatalogProduct) {
    try {
      const data = new FormData();
      data.append('type', 'wa');
      data.append('name', p.name);
      data.append('price', p.priceText);
      data.append('sku', p.sku);
      navigator.sendBeacon('/api/notify', data);
    } catch {
      /* jangan sampai mengganggu link WhatsApp */
    }
  }

  return (
    <>
      <div className="catalog-toolbar">
        <div className="search-box">
          <i className="fa-solid fa-magnifying-glass" />
          <input
            type="search"
            placeholder="Cari laptop, PC, RAM, SSD, printer..."
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="category-list">
        {[{ label: 'Semua', value: 'all' }, ...categories.map((c) => ({ label: c, value: c.toLowerCase() }))].map(
          (c) => (
            <button
              key={c.value}
              type="button"
              className={`category-btn${category === c.value ? ' active' : ''}`}
              onClick={() => setCategory(c.value)}
            >
              {c.label}
            </button>
          ),
        )}
      </div>

      <div className="product-grid" style={{ marginTop: 20 }}>
        {visible.map((p) => (
          <article className="product-card" key={p.key}>
            <div className="product-image">
              {p.flash && (
                <div className="product-badge badge-flash">
                  <i className="fa-solid fa-bolt" /> Flash Sale
                </div>
              )}
              <div className={`product-status ${p.statusClass}`}>
                <i className={`fa-solid ${p.statusIcon}`} /> {p.statusLabel}
              </div>
              <ProductImage src={p.image} alt={p.name} />
            </div>

            <div className="product-body">
              <div className="product-category">{p.category}</div>
              <h3 className="product-name">{p.name}</h3>
              <p className="product-description">{p.description}</p>
              <div className="product-price">{p.priceText}</div>
              <div className="product-stock">
                <span>
                  <i className="fa-solid fa-box" /> Stok: {p.stock}
                </span>
                {p.sku && <span>{p.sku}</span>}
              </div>

              <div className="product-actions">
                {p.stock > 0 && p.waHref !== '#' ? (
                  <a
                    href={p.waHref}
                    target="_blank"
                    rel="noopener"
                    className="buy-btn"
                    onClick={() => notify(p)}
                  >
                    <i className="fa-brands fa-whatsapp" /> Tanya / Pesan
                  </a>
                ) : (
                  <a href="#" className="buy-btn disabled" onClick={(e) => e.preventDefault()}>
                    <i className="fa-solid fa-ban" /> Stok Habis
                  </a>
                )}
                <button type="button" className="detail-btn" title="Lihat detail" onClick={() => setDetail(p)}>
                  <i className="fa-solid fa-eye" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className={`empty${visible.length === 0 ? ' show' : ''}`}>
        <i className="fa-solid fa-box-open" />
        <h3>Produk tidak ditemukan</h3>
        <p>Coba gunakan kata pencarian lain atau pilih kategori berbeda.</p>
      </div>

      <div
        className={`modal${detail ? ' show' : ''}`}
        onClick={(e) => e.target === e.currentTarget && setDetail(null)}
      >
        <div className="modal-box">
          <div className="modal-head">
            <div className="modal-title">Detail Produk</div>
            <button type="button" className="modal-close" onClick={() => setDetail(null)}>
              <i className="fa-solid fa-xmark" />
            </button>
          </div>
          {detail && (
            <div className="modal-content">
              {detail.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={detail.image} className="modal-product-image" alt={detail.name} />
              ) : (
                <div
                  className="modal-product-image"
                  style={{ display: 'grid', placeItems: 'center', color: '#60a5fa', fontSize: 55 }}
                >
                  <i className="fa-solid fa-computer" />
                </div>
              )}
              <div className="product-category">{detail.category}</div>
              <div className="modal-product-name">{detail.name}</div>
              <div className="modal-product-price">{detail.priceText}</div>
              <div className="modal-product-desc">{detail.description}</div>
              <div style={{ marginTop: 18, color: '#94a3b8', fontSize: 12 }}>
                <i className="fa-solid fa-box" /> Stok tersedia:{' '}
                <strong style={{ color: 'white' }}>{detail.stock}</strong>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
