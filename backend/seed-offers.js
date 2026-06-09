import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'apextrack',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

const offers = [
  {
    name: 'ApexSecure VPN Pro',
    slug: 'apexsecure-vpn-pro',
    category: 'VPN',
    payout_type: 'CPA',
    payout_amount: 12.50,
    currency: 'USD',
    target_geos: ['US', 'CA', 'AU', 'GB'],
    target_devices: ['Desktop', 'Mobile'],
    landing_page_url: 'https://apextrack.example.com/vpn/secure-pro',
    requires_publisher_approval: true,
  },
  {
    name: 'FinEdge Personal Loan',
    slug: 'finedge-personal-loan',
    category: 'Finance',
    payout_type: 'CPL',
    payout_amount: 8.25,
    currency: 'USD',
    target_geos: ['US', 'CA', 'UK'],
    target_devices: ['Desktop'],
    landing_page_url: 'https://apextrack.example.com/finance/personal-loan',
    requires_publisher_approval: false,
  },
  {
    name: 'CryptoBase Exchange Signup',
    slug: 'cryptobase-exchange-signup',
    category: 'Crypto',
    payout_type: 'CPA',
    payout_amount: 18.00,
    currency: 'USD',
    target_geos: ['US', 'CA', 'EU'],
    target_devices: ['Desktop', 'Mobile'],
    landing_page_url: 'https://apextrack.example.com/crypto/exchange-signup',
    requires_publisher_approval: true,
  },
  {
    name: 'MyHealth Tracker App',
    slug: 'myhealth-tracker-app',
    category: 'Mobile App',
    payout_type: 'CPI',
    payout_amount: 3.75,
    currency: 'USD',
    target_geos: ['US', 'AU', 'NZ'],
    target_devices: ['Mobile'],
    landing_page_url: 'https://apextrack.example.com/mobile/myhealth-tracker',
    requires_publisher_approval: false,
  },
  {
    name: 'NutraBoost Energy Capsules',
    slug: 'nutraboost-energy-capsules',
    category: 'Nutra',
    payout_type: 'CPA',
    payout_amount: 14.00,
    currency: 'USD',
    target_geos: ['US', 'CA'],
    target_devices: ['Desktop', 'Mobile'],
    landing_page_url: 'https://apextrack.example.com/nutra/energy-capsules',
    requires_publisher_approval: true,
  },
];

async function seedOffers() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const insertText = `
      INSERT INTO offers (
        name,
        slug,
        category,
        status,
        payout_type,
        payout_amount,
        currency,
        target_geos,
        target_devices,
        landing_page_url,
        requires_publisher_approval
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (slug) DO NOTHING
    `;

    for (const offer of offers) {
      await client.query(insertText, [
        offer.name,
        offer.slug,
        offer.category,
        'ACTIVE',
        offer.payout_type,
        offer.payout_amount,
        offer.currency,
        offer.target_geos,
        offer.target_devices,
        offer.landing_page_url,
        offer.requires_publisher_approval,
      ]);
    }

    await client.query('COMMIT');
    console.log(`Inserted ${offers.length} offers into the offers table.`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Failed to seed offers:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seedOffers();
