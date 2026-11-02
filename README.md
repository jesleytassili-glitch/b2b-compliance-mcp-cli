# ⚡ `b2b-compliance-mcp-cli` — Zero-Install `npx` MCP Server & Node.js SDK (31 B2B Tools)

[![Release](https://img.shields.io/github/v/release/jesleytassili-glitch/b2b-compliance-mcp-cli?color=brightgreen&label=MCP%20CLI%20Release)](https://github.com/jesleytassili-glitch/b2b-compliance-mcp-cli/releases/tag/v1.0.0)
[![Official MCP Registry](https://img.shields.io/badge/Official_MCP_Registry-7%2F7_Live-6366F1)](https://registry.modelcontextprotocol.io/v0/servers?search=io.github.jesleytassili-glitch)
[![RapidAPI Hub](https://img.shields.io/badge/RapidAPI-@b2bquantapis-0055FF)](https://rapidapi.com/user/b2bquantapis)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

Run all **31 stateless B2B Compliance, OFAC Sanctions, GLEIF LEI, EU VAT, CISA KEV CVE, SEC EDGAR & Brazil Tax tools** locally inside **Claude Desktop**, **Cursor**, **VS Code Copilot**, or **Windsurf** with zero local Python setup.

## 🚀 1-Click MCP Configuration (`claude_desktop_config.json` / `.cursor/mcp.json`)

```json
{
  "mcpServers": {
    "b2b-compliance-suite": {
      "command": "npx",
      "args": ["-y", "github:jesleytassili-glitch/b2b-compliance-mcp-cli"],
      "env": {
        "RAPIDAPI_API_KEY": "YOUR_RAPIDAPI_KEY"
      }
    }
  }
}
```

## 🔑 Cloud API Keys
- **RapidAPI Hub (`BASIC Free 15/mo` • `PRO $19/mo`):** https://rapidapi.com/user/b2bquantapis
- **Apify Store (`Pay-Per-Event`):** https://apify.com/b2b-quant-apis
