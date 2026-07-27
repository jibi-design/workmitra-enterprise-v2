# Cloudflare Configuration Report — mitraaccesshub.com

> **Archive note (2026-07-25):** Operator-provided Cloudflare configuration report.  
> Stored alongside Supabase homepage-decouple evidence.  
> **No DNS, Pages, Workers, or domain changes authorized by this archive alone.**  
> **Companion:** `SUPABASE_CONFIGURATION_AUDIT_ACCESS_HUB_JOB_MITRA.md`

Status: PARTIAL — public site and project build strategy are visible, but the Cloudflare account/dashboard configuration has not been provided.

---

## 1. GitHub → Cloudflare connection

| Item                                                        | Current status                                                                              |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Cloudflare Pages connected to mithra-access-hub GitHub repo | NOT VERIFIED                                                                                |
| Cloudflare Workers connected to the repo                    | NOT VERIFIED                                                                                |
| Intended frontend platform                                  | Cloudflare Pages                                                                            |
| Evidence required                                           | Cloudflare Workers & Pages → Project → Settings → Builds → Git repository screenshot/export |

The project documentation selects Cloudflare Pages for frontend hosting, but it does not prove that the current Cloudflare project is Git-connected. Cloudflare supports Git integration for both Pages and Workers, so the exact connection must be confirmed inside the dashboard.

---

## 2. Domain, DNS and SSL

| Configuration                                | Verified status |
| -------------------------------------------- | --------------- |
| https://mitraaccesshub.com resolves publicly | YES             |
| Homepage returns content over HTTPS          | YES             |
| Cloudflare DNS zone status                   | NOT VERIFIED    |
| Exact A / AAAA / CNAME records               | NOT AVAILABLE   |
| Cloudflare Pages custom-domain binding       | NOT VERIFIED    |
| www.mitraaccesshub.com binding or redirect   | NOT VERIFIED    |
| SSL mode: Flexible / Full / Full (strict)    | NOT VERIFIED    |
| Universal SSL certificate status             | NOT VERIFIED    |
| Always Use HTTPS / HSTS                      | NOT VERIFIED    |

The apex domain is currently reachable over HTTPS and serves a “Mitra Access Hub” page. This confirms public HTTPS availability, but it does not identify the active Pages project, DNS record values, certificate mode, or custom-domain ownership.

### Required dashboard evidence

- DNS → Records
- Workers & Pages → Project → Custom domains
- SSL/TLS → Overview
- Edge Certificates
- Redirect rule for www ↔ apex, if configured

---

## 3. Next.js static-export build settings

| Setting                        | Expected project value                                       | Cloudflare dashboard status |
| ------------------------------ | ------------------------------------------------------------ | --------------------------- |
| Framework                      | Next.js static export                                        | Not dashboard-verified      |
| Build command                  | `npm run build`                                              | Expected / used locally     |
| Output directory               | `out`                                                        | Expected / locally verified |
| Root directory                 | Repository root unless monorepo configuration says otherwise | Not verified                |
| Production branch              | Unknown                                                      | Not verified                |
| Node.js version                | Unknown                                                      | Not verified                |
| Environment variables          | Unknown                                                      | Not verified                |
| Workers compatibility settings | Not expected for a pure static Pages export                  | Not verified                |

The existing implementation reports show `npm run build` producing a static `out/` export. The exact Cloudflare Pages dashboard fields still need confirmation.

### Expected Pages configuration

- Build command: `npm run build`
- Build output directory: `out`
- Root directory: `/`

---

## 4. Homepage live-binding checklist

- [ ] Cloudflare project type confirmed as Pages, not an unintended Worker
- [ ] Correct GitHub repository is `mithra-access-hub`
- [ ] Correct production branch is selected
- [ ] Latest production deployment shows Success
- [ ] Build command is `npm run build`
- [ ] Output directory is `out`
- [ ] `mitraaccesshub.com` appears under Custom domains → Active
- [ ] Apex DNS record is Cloudflare-managed and proxied where appropriate
- [ ] `www` either resolves correctly or redirects permanently to the chosen canonical domain
- [ ] `https://mitraaccesshub.com/` returns HTTP 200
- [ ] HTTPS certificate is valid with no browser warning
- [ ] SSL/TLS mode and certificate status are recorded
- [ ] Homepage assets and Next.js chunks return HTTP 200
- [ ] No redirect loop, 404, stale “Coming Soon” page, or old deployment
- [ ] Canonical URL and metadata reference `https://mitraaccesshub.com`
- [ ] Mobile and desktop homepage render the latest approved build

---

## Verdict

**PARTIAL**

The domain is publicly reachable over HTTPS, and Cloudflare Pages is the documented hosting direction. The actual GitHub connection, DNS records, Pages custom-domain binding, SSL mode, and Cloudflare build fields cannot be confirmed without Cloudflare dashboard evidence.
