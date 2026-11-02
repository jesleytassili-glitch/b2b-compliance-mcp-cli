'use strict';

const https = require('https');

const VERSION = '1.0.0';
const APIFY_OWNER = 'b2b-quant-apis';
const MASTER_ROUTER = 'b2b-quant-mcp-server';
const RAPIDAPI_PUBLIC_SLUGS = new Set(["b2b-gov-procurement-pncp-radar", "b2b-quant-mcp-server", "b2b-ssl-tls-ct-log-subdomain-attack-surface-auditor", "brazil-antt-freight-cte-auditor", "brazil-b2b-cnpj-qsa-lead-enricher", "brazil-bcb-ptax-sgs-financial-contract-indexer", "brazil-camara-legislative-regulatory-risk-radar", "brazil-cep-geocoordinates-logistics-auditor", "brazil-ibge-cnae-municipal-b2b-expansion-enricher", "brazil-pix-ispb-cvm-financial-kyb-auditor", "brazil-tax-reform-ncm-classtrib-auditor", "cisa-kev-ransomware-vulnerability-auditor", "eu-ted-public-tenders-procurement-radar", "eu-vies-vat-tax-compliance-auditor", "global-b2b-email-domain-security-auditor", "global-gleif-lei-corporate-ownership-kyb", "global-sanctions-pep-interpol-watchlist-screener", "healthcare-tiss-xml-validator", "icann-rdap-domain-whois-brand-recon", "multi-ats-tech-job-board-hiring-radar"]);
const ALL_ENGINE_SLUGS = ["b2b-gov-procurement-pncp-radar", "b2b-quant-mcp-server", "b2b-ssl-tls-ct-log-subdomain-attack-surface-auditor", "brazil-antt-freight-cte-auditor", "brazil-b2b-cnpj-qsa-lead-enricher", "brazil-bcb-ptax-sgs-financial-contract-indexer", "brazil-camara-legislative-regulatory-risk-radar", "brazil-cep-geocoordinates-logistics-auditor", "brazil-ibge-cnae-municipal-b2b-expansion-enricher", "brazil-pix-ispb-cvm-financial-kyb-auditor", "brazil-tax-reform-ncm-classtrib-auditor", "cisa-kev-ransomware-vulnerability-auditor", "eu-ted-public-tenders-procurement-radar", "eu-vies-vat-tax-compliance-auditor", "global-b2b-email-domain-security-auditor", "global-gleif-lei-corporate-ownership-kyb", "global-sanctions-pep-interpol-watchlist-screener", "healthcare-tiss-xml-validator", "icann-rdap-domain-whois-brand-recon", "multi-ats-tech-job-board-hiring-radar", "uk-fca-companies-house-kyb-compliance-auditor", "us-census-fcc-real-estate-geo-enricher", "us-clinical-trials-biotech-radar", "us-epa-echo-environmental-compliance-auditor", "us-fda-recalls-safety-monitor", "us-fdic-bankfind-institution-financial-auditor", "us-healthcare-npi-provider-lead-enricher", "us-nhtsa-vehicle-vin-recall-auditor", "us-osha-workplace-safety-violation-auditor", "us-sam-gov-federal-procurement-auditor", "us-sec-edgar-filings-insider-radar"];

function postJson(urlStr, headers, payload, timeoutMs = 25000) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const body = Buffer.from(JSON.stringify(payload || {}), 'utf8');
    const req = https.request(
      {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Content-Length': body.length,
          'User-Agent': `b2b-compliance-mcp-cli/${VERSION}`,
          ...headers,
        },
        timeout: timeoutMs,
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8');
          if (res.statusCode >= 400) {
            return reject(new Error(`HTTP ${res.statusCode}: ${text.slice(0, 240)}`));
          }
          try {
            resolve(text.trim() ? JSON.parse(text) : []);
          } catch (e) {
            reject(e);
          }
        });
      }
    );
    req.on('timeout', () => req.destroy(new Error('Request timeout')));
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

class B2BComplianceClient {
  constructor(opts = {}) {
    this.rapidapiKey = (opts.rapidapiKey || process.env.RAPIDAPI_API_KEY || '').trim();
    this.apifyToken = (opts.apifyToken || process.env.APIFY_API_TOKEN || '').trim();
  }

  async runEngine(engineSlug, payload = {}) {
    const slug = String(engineSlug || '').trim().toLowerCase();
    if (!ALL_ENGINE_SLUGS.includes(slug)) {
      throw new Error(`Unknown engine '${slug}'.`);
    }
    const upgradeUrl = RAPIDAPI_PUBLIC_SLUGS.has(slug)
      ? `https://rapidapi.com/b2bquantapis/api/${slug}`
      : `https://apify.com/${APIFY_OWNER}/${slug}`;

    try {
      if (this.rapidapiKey) {
        if (RAPIDAPI_PUBLIC_SLUGS.has(slug)) {
          const host = `${slug}.p.rapidapi.com`;
          const url = `https://${host}/v2/acts/${APIFY_OWNER}~${slug}/run-sync-get-dataset-items`;
          const data = await postJson(url, { 'X-RapidAPI-Key': this.rapidapiKey, 'X-RapidAPI-Host': host }, payload);
          return { engine: slug, provider: 'rapidapi', status: 'completed_cloud', records: Array.isArray(data) ? data : [data], upgradeUrl };
        }
        const host = `${MASTER_ROUTER}.p.rapidapi.com`;
        const url = `https://${host}/v2/acts/${APIFY_OWNER}~${MASTER_ROUTER}/run-sync-get-dataset-items`;
        const data = await postJson(
          url,
          { 'X-RapidAPI-Key': this.rapidapiKey, 'X-RapidAPI-Host': host },
          { operationMode: 'invoke_tool', toolName: slug, toolArguments: payload }
        );
        return { engine: slug, provider: 'rapidapi-router', status: 'completed_cloud', records: Array.isArray(data) ? data : [data], upgradeUrl };
      }
      if (this.apifyToken) {
        const url = `https://api.apify.com/v2/acts/${APIFY_OWNER}~${slug}/run-sync-get-dataset-items`;
        const data = await postJson(url, { 'Authorization': `Bearer ${this.apifyToken}` }, payload);
        return { engine: slug, provider: 'apify', status: 'completed_cloud', records: Array.isArray(data) ? data : [data], upgradeUrl };
      }
    } catch (err) {
      return {
        engine: slug,
        provider: 'zero-key-preview-fallback',
        status: 'fallback_preview',
        records: [{ engine: slug, preview: true, fallbackReason: err.message, inputEcho: payload, upgradeUrl }],
        upgradeUrl,
      };
    }

    return {
      engine: slug,
      provider: 'zero-key-preview',
      status: 'completed_preview',
      records: [{
        engine: slug,
        preview: true,
        inputEcho: payload,
        message: 'Set RAPIDAPI_API_KEY (Free 15/mo or PRO $19/mo) or APIFY_API_TOKEN for live cloud execution.',
        upgradeUrl,
      }],
      upgradeUrl,
    };
  }
}

module.exports = {
  VERSION,
  ALL_ENGINE_SLUGS,
  RAPIDAPI_PUBLIC_SLUGS: Array.from(RAPIDAPI_PUBLIC_SLUGS),
  B2BComplianceClient,
};
