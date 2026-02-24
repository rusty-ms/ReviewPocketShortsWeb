/**
 * Review Pocket Shorts — main.js
 * Loads products.json, renders hero (Product of the Day) + trending grid.
 */

const PRODUCTS_URL = 'products.json';
const YT_CHANNEL   = 'https://www.youtube.com/@ReviewPocketShorts';

// ── Helpers ──────────────────────────────────────────────────────────────────

function starsHtml(rating) {
  const full  = Math.floor(rating);
  const half  = rating - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return (
    '★'.repeat(full) +
    (half ? '½' : '') +
    '☆'.repeat(empty)
  );
}

function formatReviewCount(n) {
  if (!n) return '';
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k reviews';
  return n + ' reviews';
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Hero (Product of the Day) ─────────────────────────────────────────────────

function renderHero(product) {
  const heroEl = document.getElementById('hero-content');
  if (!heroEl) return;

  heroEl.innerHTML = `
    <div class="yt-embed-wrap">
      <iframe
        src="https://www.youtube.com/embed/${escapeHtml(product.youtube_id)}?autoplay=0&rel=0&modestbranding=1"
        title="${escapeHtml(product.title)} — Review Pocket Shorts"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        loading="lazy"
      ></iframe>
    </div>

    <div class="hero-info">
      <div class="hero-category">${escapeHtml(product.category || 'Product')}</div>
      <h1 class="hero-title">${escapeHtml(product.title)}</h1>
      ${product.script_summary ? `<p class="hero-summary">${escapeHtml(product.script_summary)}</p>` : ''}
      <div class="hero-meta">
        <span class="hero-price">${escapeHtml(product.price || '')}</span>
        ${product.rating ? `
        <span class="hero-rating">
          <span class="stars">${starsHtml(product.rating)}</span>
          <span>${product.rating} (${formatReviewCount(product.review_count)})</span>
        </span>` : ''}
      </div>
      <div class="hero-cta">
        <a
          href="${escapeHtml(product.affiliate_url)}"
          target="_blank"
          rel="noopener sponsored"
          class="btn btn-amazon"
          aria-label="Buy ${escapeHtml(product.title)} on Amazon"
        >
          🛒 Buy on Amazon
        </a>
        <a
          href="${escapeHtml(product.youtube_url)}"
          target="_blank"
          rel="noopener"
          class="btn btn-yt"
        >
          ▶ Watch on YouTube
        </a>
      </div>
    </div>
  `;

  // Inject JSON-LD for featured product
  injectProductJsonLd(product);
}

// ── Product Card ──────────────────────────────────────────────────────────────

function buildCard(product) {
  const card = document.createElement('article');
  card.className = 'product-card';
  card.setAttribute('itemscope', '');
  card.setAttribute('itemtype', 'https://schema.org/Product');

  const imgSrc = product.image_url || '';
  const pageUrl = product.page_url || product.affiliate_url;

  card.innerHTML = `
    <a href="${escapeHtml(pageUrl)}" class="card-thumb" aria-label="Review: ${escapeHtml(product.title)}">
      ${imgSrc
        ? `<img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(product.title)}" loading="lazy" itemprop="image" />`
        : `<div style="height:200px;display:flex;align-items:center;justify-content:center;font-size:3rem;">🛍️</div>`
      }
      <span class="card-play-badge">▶ SHORT</span>
    </a>
    <div class="card-body">
      <span class="card-category">${escapeHtml(product.category || 'Product')}</span>
      <h2 class="card-title" itemprop="name">
        <a href="${escapeHtml(pageUrl)}" style="color:inherit;text-decoration:none;">${escapeHtml(product.title)}</a>
      </h2>
      ${product.rating ? `
      <div class="card-rating">
        <span class="stars">${starsHtml(product.rating)}</span>
        <span>${product.rating} · ${formatReviewCount(product.review_count)}</span>
      </div>` : ''}
      <div class="card-price" itemprop="offers" itemscope itemtype="https://schema.org/Offer">
        <span itemprop="price" content="${escapeHtml(String(product.price || '').replace(/[^0-9.]/g, ''))}">
          ${escapeHtml(product.price || '')}
        </span>
        <meta itemprop="priceCurrency" content="USD" />
        <meta itemprop="availability" content="https://schema.org/InStock" />
      </div>
    </div>
    <div class="card-footer">
      <a
        href="${escapeHtml(product.affiliate_url)}"
        target="_blank"
        rel="noopener sponsored"
        class="card-btn-amz"
      >🛒 Buy Now</a>
      <a
        href="${escapeHtml(pageUrl)}"
        class="card-btn-review"
      >📺 Review</a>
    </div>
  `;
  return card;
}

function renderGrid(products) {
  const grid = document.getElementById('product-grid');
  if (!grid) return;
  grid.innerHTML = '';
  if (!products || products.length === 0) {
    grid.innerHTML = `
      <div class="error-state" style="grid-column:1/-1">
        <h3>No products yet</h3>
        <p>Check back soon — new reviews drop daily!</p>
        <a href="${YT_CHANNEL}" target="_blank" rel="noopener" class="btn btn-yt" style="margin-top:1rem">Watch on YouTube</a>
      </div>`;
    return;
  }
  products.forEach(p => grid.appendChild(buildCard(p)));
}

// ── JSON-LD injection ─────────────────────────────────────────────────────────

function injectProductJsonLd(p) {
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'VideoObject',
        'name': p.title + ' — Review',
        'description': p.script_summary || ('Short review of ' + p.title),
        'embedUrl': 'https://www.youtube.com/embed/' + p.youtube_id,
        'thumbnailUrl': p.image_url || '',
        'uploadDate': p.posted_at || '',
        'publisher': {
          '@type': 'Organization',
          'name': 'Review Pocket Shorts',
          'url': 'https://www.youtube.com/@ReviewPocketShorts'
        }
      },
      {
        '@type': 'Product',
        'name': p.title,
        'image': p.image_url || '',
        'description': p.script_summary || '',
        'offers': {
          '@type': 'Offer',
          'url': p.affiliate_url,
          'priceCurrency': 'USD',
          'price': String(p.price || '').replace(/[^0-9.]/g, ''),
          'availability': 'https://schema.org/InStock'
        },
        'aggregateRating': p.rating ? {
          '@type': 'AggregateRating',
          'ratingValue': p.rating,
          'reviewCount': p.review_count || 1,
          'bestRating': 5,
          'worstRating': 1
        } : undefined
      }
    ].filter(Boolean)
  };

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(ld);
  document.head.appendChild(script);
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────

async function init() {
  try {
    const res = await fetch(PRODUCTS_URL + '?v=' + Date.now());
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();

    const products = data.products || [];
    const featuredAsin = data.featured;

    // Determine featured product
    let featured = products.find(p => p.asin === featuredAsin) || products[0];

    if (featured) {
      renderHero(featured);
    } else {
      const heroEl = document.getElementById('hero-content');
      if (heroEl) heroEl.innerHTML = `
        <div class="error-state" style="grid-column:1/-1">
          <h3>Coming Soon!</h3>
          <p>The first review drops soon. <a href="${YT_CHANNEL}" target="_blank" rel="noopener">Subscribe on YouTube</a> to be first!</p>
        </div>`;
    }

    renderGrid(products);

  } catch (err) {
    console.warn('Could not load products.json:', err.message);
    const heroEl = document.getElementById('hero-content');
    if (heroEl) heroEl.innerHTML = `
      <div class="error-state" style="grid-column:1/-1">
        <h3>Loading...</h3>
        <p>Fresh product reviews coming daily. <a href="${YT_CHANNEL}" target="_blank" rel="noopener">Watch on YouTube →</a></p>
      </div>`;

    const grid = document.getElementById('product-grid');
    if (grid) grid.innerHTML = `
      <div class="error-state" style="grid-column:1/-1">
        <a href="${YT_CHANNEL}" target="_blank" rel="noopener" class="btn btn-yt">Watch on YouTube</a>
      </div>`;
  }
}

document.addEventListener('DOMContentLoaded', init);
