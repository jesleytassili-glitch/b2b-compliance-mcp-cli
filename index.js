'use strict';

const https = require('https');

const VERSION = '1.0.1';
const APIFY_OWNER = 'b2b-quant-apis';
const MASTER_ROUTER = 'b2b-quant-mcp-server';
const RAPIDAPI_PUBLIC_SLUGS = new Set(["b2b-gov-procurement-pncp-radar", "b2b-quant-mcp-server", "b2b-ssl-tls-ct-log-subdomain-attack-surface-auditor", "brazil-antt-freight-cte-auditor", "brazil-b2b-cnpj-qsa-lead-enricher", "brazil-bcb-ptax-sgs-financial-contract-indexer", "brazil-camara-legislative-regulatory-risk-radar", "brazil-cep-geocoordinates-logistics-auditor", "brazil-ibge-cnae-municipal-b2b-expansion-enricher", "brazil-pix-ispb-cvm-financial-kyb-auditor", "brazil-tax-reform-ncm-classtrib-auditor", "cisa-kev-ransomware-vulnerability-auditor", "eu-ted-public-tenders-procurement-radar", "eu-vies-vat-tax-compliance-auditor", "global-b2b-email-domain-security-auditor", "global-gleif-lei-corporate-ownership-kyb", "global-sanctions-pep-interpol-watchlist-screener", "healthcare-tiss-xml-validator", "icann-rdap-domain-whois-brand-recon", "multi-ats-tech-job-board-hiring-radar"]);
const ALL_ENGINE_SLUGS = ["b2b-gov-procurement-pncp-radar", "b2b-quant-mcp-server", "b2b-ssl-tls-ct-log-subdomain-attack-surface-auditor", "brazil-antt-freight-cte-auditor", "brazil-b2b-cnpj-qsa-lead-enricher", "brazil-bcb-ptax-sgs-financial-contract-indexer", "brazil-camara-legislative-regulatory-risk-radar", "brazil-cep-geocoordinates-logistics-auditor", "brazil-ibge-cnae-municipal-b2b-expansion-enricher", "brazil-pix-ispb-cvm-financial-kyb-auditor", "brazil-tax-reform-ncm-classtrib-auditor", "cisa-kev-ransomware-vulnerability-auditor", "eu-ted-public-tenders-procurement-radar", "eu-vies-vat-tax-compliance-auditor", "global-b2b-email-domain-security-auditor", "global-gleif-lei-corporate-ownership-kyb", "global-sanctions-pep-interpol-watchlist-screener", "healthcare-tiss-xml-validator", "icann-rdap-domain-whois-brand-recon", "multi-ats-tech-job-board-hiring-radar", "uk-fca-companies-house-kyb-compliance-auditor", "us-census-fcc-real-estate-geo-enricher", "us-clinical-trials-biotech-radar", "us-epa-echo-environmental-compliance-auditor", "us-fda-recalls-safety-monitor", "us-fdic-bankfind-institution-financial-auditor", "us-healthcare-npi-provider-lead-enricher", "us-nhtsa-vehicle-vin-recall-auditor", "us-osha-workplace-safety-violation-auditor", "us-sam-gov-federal-procurement-auditor", "us-sec-edgar-filings-insider-radar"];
const ZYLA_ENDPOINTS = {"b2b-gov-procurement-pncp-radar": "https://zylalabs.com/api/14642/b2b+gov+procurement+pncp+radar+api/37723/run+b2b+gov+procurement+pncp+radar", "us-sam-gov-federal-procurement-auditor": "https://zylalabs.com/api/14642/b2b+gov+procurement+pncp+radar+api/37728/run+us+sam+gov+federal+procurement+auditor", "eu-ted-public-tenders-procurement-radar": "https://zylalabs.com/api/14642/b2b+gov+procurement+pncp+radar+api/37729/run+eu+ted+public+tenders+procurement+radar", "brazil-camara-legislative-regulatory-risk-radar": "https://zylalabs.com/api/14642/b2b+gov+procurement+pncp+radar+api/37730/run+brazil+camara+legislative+regulatory+risk", "us-osha-workplace-safety-violation-auditor": "https://zylalabs.com/api/14642/b2b+gov+procurement+pncp+radar+api/37731/run+us+osha+workplace+safety+violation+auditor", "us-epa-echo-environmental-compliance-auditor": "https://zylalabs.com/api/14642/b2b+gov+procurement+pncp+radar+api/37732/run+us+epa+echo+environmental+compliance", "brazil-tax-reform-ncm-classtrib-auditor": "https://zylalabs.com/api/14643/brazil+tax+reform+ncm+classtrib+auditor+api/37724/run+brazil+tax+reform+ncm+classtrib+auditor", "eu-vies-vat-tax-compliance-auditor": "https://zylalabs.com/api/14643/brazil+tax+reform+ncm+classtrib+auditor+api/37775/run+eu+vies+vat+tax+compliance+auditor", "us-sec-edgar-filings-insider-radar": "https://zylalabs.com/api/14643/brazil+tax+reform+ncm+classtrib+auditor+api/37776/run+us+sec+edgar+filings+insider+radar", "us-fdic-bankfind-institution-financial-auditor": "https://zylalabs.com/api/14643/brazil+tax+reform+ncm+classtrib+auditor+api/37777/run+us+fdic+bankfind+institution+financial", "global-gleif-lei-corporate-ownership-kyb": "https://zylalabs.com/api/14643/brazil+tax+reform+ncm+classtrib+auditor+api/37778/run+global+gleif+lei+corporate+ownership+kyb", "brazil-bcb-ptax-sgs-financial-contract-indexer": "https://zylalabs.com/api/14643/brazil+tax+reform+ncm+classtrib+auditor+api/37779/run+brazil+bcb+ptax+sgs+financial+contract+indexer", "brazil-pix-ispb-cvm-financial-kyb-auditor": "https://zylalabs.com/api/14643/brazil+tax+reform+ncm+classtrib+auditor+api/37780/run+brazil+pix+ispb+cvm+financial+kyb+auditor", "uk-fca-companies-house-kyb-compliance-auditor": "https://zylalabs.com/api/14643/brazil+tax+reform+ncm+classtrib+auditor+api/37781/run+uk+fca+companies+house+kyb+compliance", "healthcare-tiss-xml-validator": "https://zylalabs.com/api/14644/healthcare+tiss+xml+validator+api/37725/run+healthcare+tiss+xml+validator", "us-healthcare-npi-provider-lead-enricher": "https://zylalabs.com/api/14644/healthcare+tiss+xml+validator+api/37838/run+us+healthcare+npi+provider+lead+enricher", "us-clinical-trials-biotech-radar": "https://zylalabs.com/api/14644/healthcare+tiss+xml+validator+api/37839/run+us+clinical+trials+biotech+radar", "brazil-antt-freight-cte-auditor": "https://zylalabs.com/api/14645/brazil+antt+minimum+freight+calculator+ct+e+api/37726/run+brazil+antt+minimum+freight+calculator+ct+e", "brazil-cep-geocoordinates-logistics-auditor": "https://zylalabs.com/api/14645/brazil+antt+minimum+freight+calculator+ct+e+api/37846/run+brazil+cep+geocoordinates+ibge+code+api", "us-nhtsa-vehicle-vin-recall-auditor": "https://zylalabs.com/api/14645/brazil+antt+minimum+freight+calculator+ct+e+api/37847/run+us+nhtsa+vehicle+vin+decoder+safety+recall+a", "us-census-fcc-real-estate-geo-enricher": "https://zylalabs.com/api/14645/brazil+antt+minimum+freight+calculator+ct+e+api/37848/run+us+real+estate+census+tract+fips+proptech+ap", "brazil-b2b-cnpj-qsa-lead-enricher": "https://zylalabs.com/api/14645/brazil+antt+minimum+freight+calculator+ct+e+api/37849/run+brazil+b2b+cnpj+partners+qsa+cnae+lead+api", "brazil-ibge-cnae-municipal-b2b-expansion-enricher": "https://zylalabs.com/api/14645/brazil+antt+minimum+freight+calculator+ct+e+api/37850/run+brazil+ibge+cnae+2+3+municipal+code+b2b+tax", "multi-ats-tech-job-board-hiring-radar": "https://zylalabs.com/api/14645/brazil+antt+minimum+freight+calculator+ct+e+api/37851/run+multi+ats+tech+job+board+b2b+hiring+intent+a", "us-fda-recalls-safety-monitor": "https://zylalabs.com/api/14646/us+fda+recalls+safety+monitor+food+drug+api/37727/run+us+fda+recalls+safety+monitor+food+drug+api", "cisa-kev-ransomware-vulnerability-auditor": "https://zylalabs.com/api/14646/us+fda+recalls+safety+monitor+food+drug+api/37866/run+us+cisa+kev+exploited+vulnerabilities+api", "b2b-ssl-tls-ct-log-subdomain-attack-surface-auditor": "https://zylalabs.com/api/14646/us+fda+recalls+safety+monitor+food+drug+api/37867/run+b2b+ssl+tls+ct+log+subdomain+attack+surface", "global-b2b-email-domain-security-auditor": "https://zylalabs.com/api/14646/us+fda+recalls+safety+monitor+food+drug+api/37868/run+global+b2b+email+mx+spf+dmarc+deliverability", "icann-rdap-domain-whois-brand-recon": "https://zylalabs.com/api/14646/us+fda+recalls+safety+monitor+food+drug+api/37869/run+icann+rdap+official+domain+whois+brand+api", "global-sanctions-pep-interpol-watchlist-screener": "https://zylalabs.com/api/14646/us+fda+recalls+safety+monitor+food+drug+api/37870/run+global+ofac+un+eu+sanctions+pep+watchlist+ap", "b2b-quant-mcp-server": "https://zylalabs.com/api/14646/us+fda+recalls+safety+monitor+food+drug+api/37871/run+b2b+regulatory+kyb+fintech+secops+mcp+server"};

function unwrapMcpRecords(raw) {
  if (Array.isArray(raw) && raw.length === 1 && raw[0] && raw[0].mcpJsonRpcEnvelope) {
    const live = raw[0].mcpJsonRpcEnvelope.result && raw[0].mcpJsonRpcEnvelope.result.liveDatasetItems;
    if (Array.isArray(live)) return live;
  }
  if (raw && !Array.isArray(raw) && raw.mcpJsonRpcEnvelope) {
    const live = raw.mcpJsonRpcEnvelope.result && raw.mcpJsonRpcEnvelope.result.liveDatasetItems;
    if (Array.isArray(live)) return live;
  }
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object') {
    const items = raw.items || raw.data || raw.results;
    return Array.isArray(items) ? items : [raw];
  }
  return [];
}

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
    this.rapidapiKey = (opts.rapidapiKey !== undefined ? opts.rapidapiKey : (process.env.RAPIDAPI_API_KEY || '')).trim();
    this.zylaApiKey = (opts.zylaApiKey !== undefined ? opts.zylaApiKey : (process.env.ZYLA_API_KEY || '')).trim();
    this.apifyToken = (opts.apifyToken !== undefined ? opts.apifyToken : (process.env.APIFY_API_TOKEN || '')).trim();
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
          return { engine: slug, provider: 'rapidapi', status: 'completed_cloud', records: unwrapMcpRecords(data), upgradeUrl };
        }
        const host = `${MASTER_ROUTER}.p.rapidapi.com`;
        const url = `https://${host}/v2/acts/${APIFY_OWNER}~${MASTER_ROUTER}/run-sync-get-dataset-items`;
        const data = await postJson(
          url,
          { 'X-RapidAPI-Key': this.rapidapiKey, 'X-RapidAPI-Host': host },
          { operationMode: 'invoke_tool', toolName: slug, toolArguments: payload }
        );
        return { engine: slug, provider: 'rapidapi-router', status: 'completed_cloud', records: unwrapMcpRecords(data), upgradeUrl };
      }
      if (this.zylaApiKey && ZYLA_ENDPOINTS[slug]) {
        const data = await postJson(ZYLA_ENDPOINTS[slug], { 'Authorization': `Bearer ${this.zylaApiKey}` }, payload);
        return { engine: slug, provider: 'zyla', status: 'completed_cloud', records: unwrapMcpRecords(data), upgradeUrl };
      }
      if (this.apifyToken) {
        const url = `https://api.apify.com/v2/acts/${APIFY_OWNER}~${slug}/run-sync-get-dataset-items`;
        const data = await postJson(url, { 'Authorization': `Bearer ${this.apifyToken}` }, payload);
        return { engine: slug, provider: 'apify', status: 'completed_cloud', records: unwrapMcpRecords(data), upgradeUrl };
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
        message: 'Set RAPIDAPI_API_KEY (Free 15/mo or PRO $19/mo), ZYLA_API_KEY, or APIFY_API_TOKEN for live cloud execution.',
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
