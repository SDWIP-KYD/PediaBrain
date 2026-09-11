# Lab Lookup Integration - Product Requirements Document (PRD)

**Project:** PediaBrain Lab Lookup API Integration  
**Date:** 2026-09-11  
**Author:** Kreya (Hermes Agent)  
**Status:** Planning  
**Version:** 1.0

---

## 1. Executive Summary

### Problem Statement

Currently, PediaBrain's Lab Lookup feature redirects users to external systems (SIMRS Live and Hema Lab) in new tabs. This creates friction:

- Context switching between applications
- Manual MR number re-entry
- No data integration with PediaBrain patient records
- Disconnected workflow

### Proposed Solution

Integrate SIMRS and Hema Lab APIs directly into PediaBrain to provide:

- In-app lab result display
- Seamless patient data lookup
- Unified interface without tab switching
- Optional deep-link to full external system

### Success Criteria

- ✅ Lab lookup completes in <3 seconds
- ✅ Data accuracy matches external systems 100%
- ✅ No authentication errors
- ✅ Works for 95% of active patients
- ✅ User satisfaction improved (measured by usage frequency)

---

## 2. User Stories

### Primary Users: Pediatric Residents & Attendings

**Story 1: Quick Lab Check**

> As a resident on rounds, I want to check a patient's latest lab results by entering their MR number, so I can make clinical decisions without opening multiple systems.

**Story 2: Patient Profile View**

> As an attending, I want to see patient demographics (name, age, diagnosis) alongside lab results, so I have full context for interpretation.

**Story 3: Lab Trend Analysis**

> As a fellow, I want to see historical lab values (e.g., hemoglobin trend over 7 days), so I can assess treatment response.

**Story 4: Fall-back to Full System**

> As a power user, I want a link to open the full SIMRS system when I need detailed data not shown in PediaBrain.

---

## 3. Technical Architecture

### System Overview

```
┌─────────────────┐
│   PediaBrain    │
│   (Vercel)      │
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────┐      ┌──────────────────┐
│  Next.js API    │──────│  VPS (43.156.x)  │
│  Route (Proxy)  │ SSH  │  Port 8099       │
└─────────────────┘      └────────┬─────────┘
                                  │ HTTP
                                  ▼
                         ┌──────────────────┐
                         │  SIMRS Web API   │
                         │  (FastAPI)       │
                         └────────┬─────────┘
                                  │ HTTP
                                  ▼
                         ┌──────────────────┐
                         │  SIMRS Database  │
                         │  (via tunnel)    │
                         └──────────────────┘
```

### Component Breakdown

#### 3.1 PediaBrain Frontend

- **Location:** `src/app/lab-lookup/page.tsx`
- **Responsibility:**
  - User input (MR number)
  - Display loading state
  - Render patient data & lab results
  - Error handling
- **Stack:** Next.js 16, React 19, TypeScript, Tailwind

#### 3.2 PediaBrain API Proxy

- **Location:** `src/app/api/simrs-proxy/route.ts`
- **Responsibility:**
  - Validate MR number input
  - Call VPS SIMRS API with auth token
  - Transform response to PediaBrain format
  - Cache results (5 min TTL)
  - Handle errors gracefully
- **Stack:** Next.js API Route, Edge Runtime

#### 3.3 VPS Public API Endpoint

- **Location:** `/home/ubuntu/hema-repo/sirs-web/main.py`
- **Responsibility:**
  - Authenticate via token
  - Login to SIMRS with service account
  - Fetch patient data + lab results
  - Return structured JSON
- **Stack:** FastAPI, Python 3.12, uvicorn

#### 3.4 SIMRS Backend

- **Existing System:** Hospital SIMRS (tunneled via FRP)
- **Endpoints Used:**
  - `/webservice/general/pasien/{norm}` - Patient demographics
  - `/webservice/layanan/hasillab` - Lab results
  - (Additional endpoints TBD after inspection)

---

## 4. API Specifications

### 4.1 PediaBrain → VPS

**Endpoint:** `GET /api/simrs-proxy`

**Request:**

```typescript
GET /api/simrs-proxy?norm=123456
Headers:
  Authorization: Bearer {INTERNAL_SECRET}
```

**Response (Success):**

```json
{
  "ok": true,
  "patient": {
    "norm": "123456",
    "nama": "Aisya Sidiqia",
    "tgl_lahir": "2022-04-11",
    "jk": "P",
    "umur": "4 tahun 5 bulan",
    "alamat": "Jl. Example No. 123",
    "no_hp": "08123456789"
  },
  "lab_results": [
    {
      "tgl": "2026-09-10 08:30",
      "params": [
        {
          "name": "Hemoglobin",
          "value": "10.5",
          "unit": "g/dL",
          "reference": "11-15",
          "flag": "low"
        },
        {
          "name": "Leukosit",
          "value": "12.5",
          "unit": "10^3/uL",
          "reference": "5-15",
          "flag": "normal"
        }
      ]
    }
  ],
  "cached": false,
  "timestamp": "2026-09-11T08:15:30Z"
}
```

**Response (Error):**

```json
{
  "ok": false,
  "error": "Patient not found",
  "code": "NOT_FOUND"
}
```

### 4.2 VPS Public API

**Endpoint:** `GET /api/public/pasien`

**Request:**

```
GET /api/public/pasien?norm=123456&token={SECRET_TOKEN}
```

**Response:** (Same as 4.1)

**Security:**

- Token validated before processing
- Rate limit: 100 req/min per token
- CORS: Restricted to Vercel domains
- Logging: All requests logged for audit

---

## 5. Security Considerations

### 5.1 Authentication & Authorization

**VPS API Token:**

- Stored in Vercel environment variable: `SIMRS_API_TOKEN`
- Never exposed to client-side code
- Rotated quarterly
- Separate token per environment (dev/prod)

**SIMRS Service Account:**

- Dedicated read-only account for PediaBrain
- Minimal permissions (patient demographics + lab only)
- Password stored in VPS environment file with 0600 permissions
- Session timeout: 8 hours, auto-refresh

### 5.2 Data Privacy

**PHI (Protected Health Information) Handling:**

- ✅ All API calls over HTTPS
- ✅ No patient data logged in plain text
- ✅ MR numbers hashed in analytics logs
- ✅ Response caching uses encrypted Redis (future)
- ✅ Compliance with hospital data policy

**Access Control:**

- Users must be authenticated in PediaBrain (password: K95)
- Session-based auth (30 min timeout)
- No public access to lab data

### 5.3 Rate Limiting

**PediaBrain → VPS:**

- 100 requests per minute per user
- 429 error with Retry-After header

**VPS → SIMRS:**

- Respect SIMRS rate limits (TBD)
- Implement exponential backoff

---

## 6. Error Handling

### Expected Errors

| Error Code      | Scenario          | User Message                                | Action                   |
| --------------- | ----------------- | ------------------------------------------- | ------------------------ |
| `NOT_FOUND`     | Invalid MR number | "Pasien tidak ditemukan. Periksa nomor RM." | Allow retry              |
| `UNAUTHORIZED`  | Token invalid     | "Koneksi gagal. Hubungi admin."             | Log error, show fallback |
| `TIMEOUT`       | SIMRS slow/down   | "SIMRS sedang lambat. Coba lagi?"           | Retry button             |
| `NETWORK_ERROR` | VPS unreachable   | "Tidak dapat terhubung ke server."          | Show redirect buttons    |
| `INVALID_INPUT` | Non-numeric MR    | "Nomor RM harus berupa angka."              | Input validation         |

### Fallback Strategy

If API fails:

1. Show error message
2. Display original redirect buttons (SIMRS Live + Hema Lab)
3. Log error to monitoring system

---

## 7. Performance Requirements

### Response Time Targets

| Operation                 | Target | Maximum |
| ------------------------- | ------ | ------- |
| Patient lookup (cached)   | <500ms | 1s      |
| Patient lookup (uncached) | <2s    | 5s      |
| Lab results (recent)      | <2s    | 5s      |
| Page load                 | <1s    | 2s      |

### Caching Strategy

**Client-side (Browser):**

- Patient demographics: 5 minutes
- Lab results: 2 minutes (stale-while-revalidate)

**Server-side (VPS):**

- Patient static data: 5 minutes
- Lab results: No cache (always fresh)

**Cache Invalidation:**

- Manual refresh button
- Auto-refresh every 5 minutes if page open

---

## 8. Implementation Phases

### Phase 1: VPS Public API (Week 1)

- [ ] Add `/api/public/pasien` endpoint to SIMRS Web
- [ ] Implement token authentication
- [ ] Add rate limiting
- [ ] Test with sample MR numbers
- [ ] Deploy to production VPS

### Phase 2: PediaBrain API Proxy (Week 1)

- [ ] Create `/api/simrs-proxy` route
- [ ] Add VPS API client
- [ ] Implement error handling
- [ ] Add response caching
- [ ] Write unit tests

### Phase 3: Frontend Integration (Week 1-2)

- [ ] Update Lab Lookup page UI
- [ ] Add patient info card
- [ ] Add lab results table
- [ ] Add loading states
- [ ] Add error states
- [ ] Add refresh functionality

### Phase 4: Testing & Refinement (Week 2)

- [ ] End-to-end testing with 20 real MR numbers
- [ ] Performance optimization
- [ ] Error scenario testing
- [ ] User acceptance testing
- [ ] Bug fixes

### Phase 5: Deployment & Monitoring (Week 2)

- [ ] Deploy to production
- [ ] Monitor error rates
- [ ] Gather user feedback
- [ ] Iterate on UX

---

## 9. Out of Scope (Future Enhancements)

- Lab trend graphs (future v2)
- Lab result alerts/notifications (future v2)
- Integration with PediaBrain patient records (future v3)
- Radiology results (future v3)
- Medication history (future v3)

---

## 10. Success Metrics

### Quantitative Metrics

- **Usage Rate:** 50+ lookups per day within first month
- **Response Time:** 90th percentile <3 seconds
- **Error Rate:** <5% of all requests
- **User Retention:** 80% of users return within 7 days

### Qualitative Metrics

- User feedback survey: 4+ stars average
- Reduction in "tab switching" complaints
- Resident satisfaction in weekly rounds

---

## 11. Risks & Mitigations

| Risk                    | Impact   | Probability | Mitigation                           |
| ----------------------- | -------- | ----------- | ------------------------------------ |
| SIMRS API changes       | High     | Medium      | Monitor SIMRS changelog, version API |
| VPS downtime            | High     | Low         | Fallback to redirect buttons         |
| Token leak              | Critical | Low         | Rotate tokens, monitor usage logs    |
| Performance degradation | Medium   | Medium      | Cache aggressively, optimize queries |
| SIMRS rate limit hit    | Medium   | Low         | Implement backoff, queue requests    |

---

## 12. Dependencies

### External Systems

- SIMRS Web API (port 8099) - READY
- FRP tunnel to hospital SIMRS - READY
- Vercel deployment - READY

### Internal Components

- PediaBrain auth system - READY
- Next.js API routes - READY
- Environment variable management - READY

### Required Access

- VPS SSH access - AVAILABLE
- SIMRS service account credentials - NEED TO CREATE
- Vercel environment variable access - AVAILABLE

---

## 13. Rollout Plan

### Beta Testing (Week 2)

- Enable for 5 power users
- Gather feedback
- Fix critical bugs

### Gradual Rollout (Week 3)

- Enable for all residents (20 users)
- Monitor performance
- Collect usage data

### Full Production (Week 4)

- Enable for all users
- Announce feature
- Provide training doc

### Rollback Plan

If critical issues occur:

1. Disable API integration via feature flag
2. Revert to redirect-only mode
3. Fix issues in staging
4. Re-deploy when stable

---

## 14. Open Questions

1. **SIMRS API Limits:** What are the actual rate limits? Need to test.
2. **Service Account:** Do we need separate account or reuse existing?
3. **Lab History Depth:** How many days of lab history to show? (Proposal: 7 days)
4. **Radiology Data:** Is radiology API similar structure? (Future scope)
5. **Error Monitoring:** Which monitoring tool to use? (Sentry vs built-in)

---

## 15. Approval & Sign-off

**Stakeholders:**

- [ ] Product Owner (User/Dokter)
- [ ] Technical Lead (Kreya/Hermes)
- [ ] Security Review (Pending)

**Next Steps:**

1. Review and approve this PRD
2. Create IMPLEMENTATION_PLAN.md with detailed steps
3. Begin Phase 1 development

---

**Document History:**

- 2026-09-11: Initial draft (v1.0)
