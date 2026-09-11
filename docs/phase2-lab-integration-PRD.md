# Phase 2: Full Lab Results Integration - PRD

**Project:** PediaBrain Lab Lookup Enhancement  
**Date:** 2026-09-11  
**Author:** Kreya (Hermes Agent)  
**Status:** Planning  
**Version:** 2.0  
**Phase:** 2 of 3

---

## 1. Executive Summary

### Current State (Phase 1 - COMPLETE ✅)

- Basic lab lookup by NORM
- Quick preview (3 visits max)
- Patient name + basic info
- Simple lab parameter table
- Working production deployment

### Proposed Enhancement (Phase 2)

Transform Lab Lookup into a **comprehensive clinical lab viewer** with:

- Complete lab history (all visits, not limited to 3)
- Visual trend analysis for key parameters
- Critical value highlighting
- Special module integration (PA, Radiology, BMP)
- Enhanced UX for clinical decision-making

### Success Criteria

- ✅ Doctors can view complete lab history in <2 seconds
- ✅ Abnormal values instantly visible (color-coded)
- ✅ Trend graphs help identify patterns quickly
- ✅ Special module results integrated seamlessly
- ✅ Mobile-responsive design
- ✅ Zero breaking changes to existing features

---

## 2. Problem Statement

**Current Limitations:**

1. **Limited History:** Only shows 3 most recent visits
2. **No Visual Trends:** Hard to spot patterns (e.g., declining HGB)
3. **Poor Abnormal Highlighting:** Abnormal values not obvious
4. **Missing Special Modules:** No PA/Rad/BMP integration
5. **Cluttered Display:** All parameters shown equally (not prioritized)

**Impact on Clinical Workflow:**

- Doctors switch to external Hema Lab system for complete data
- Manual mental calculation of trends
- Risk of missing critical declining values
- Time wasted navigating between systems

**User Pain Points (from resident feedback):**

> "Saya perlu lihat trend HGB 7 hari terakhir, tapi cuma muncul 3 kunjungan"  
> "Nilai PLT 46 gak keliatan urgent, padahal turun dari 150"  
> "Harus buka Hema Lab lagi untuk hasil PA"

---

## 3. Goals & Objectives

### Primary Goals

1. **Complete Lab History Access** - Show all available visits
2. **Visual Trend Analysis** - Graphs for key hematology parameters
3. **Critical Value Alerting** - Immediate visual indication of abnormal/critical
4. **Special Module Integration** - PA, Radiology, BMP in same interface
5. **Clinical Decision Support** - Easy pattern recognition

### Non-Goals (Out of Scope for Phase 2)

- ❌ Lab order entry (read-only system)
- ❌ Integration with PediaBrain patient database
- ❌ Real-time alerts/notifications
- ❌ Export to PDF/print functionality
- ❌ Multi-patient comparison

---

## 4. User Stories

### Story 1: Complete Lab History

**As a** pediatric resident on rounds  
**I want to** view all lab results for a patient (not just 3 visits)  
**So that I can** assess treatment response over full admission period

**Acceptance Criteria:**

- All visits displayed (no arbitrary limit)
- Chronological order (newest first)
- Collapse/expand per visit
- Load time <3 seconds

### Story 2: Visual Trends

**As an** attending physician  
**I want to** see trend graphs for HGB, PLT, WBC  
**So that I can** quickly identify declining values requiring intervention

**Acceptance Criteria:**

- Line graphs for key parameters
- Last 7-14 days of data
- Hover shows exact values + dates
- Reference range shaded
- Mobile responsive

### Story 3: Critical Value Alert

**As a** fellow reviewing labs  
**I want** critical/abnormal values highlighted immediately  
**So that I** don't miss urgent findings

**Acceptance Criteria:**

- Critical values: Red bold
- Abnormal values: Yellow/orange
- Normal values: Default styling
- Color-blind safe palette
- Icon indicators (⚠️ 🔴)

### Story 4: Special Modules

**As a** hematology fellow  
**I want to** view PA and BMP results in same interface  
**So that I** don't need to switch to external system

**Acceptance Criteria:**

- PA results with full text (Kesimpulan)
- Radiology findings
- BMP descriptions
- Collapsible sections
- Available when data exists

### Story 5: Mobile Rounds Access

**As a** resident on mobile rounds  
**I want** the interface to work on my phone  
**So that I can** review labs bedside

**Acceptance Criteria:**

- Responsive design (320px+)
- Touch-friendly controls
- Readable font sizes
- Charts render correctly
- Fast loading on 4G

---

## 5. Technical Architecture

### 5.1 Frontend Components (New)

**Component Structure:**

```
/src/app/lab-lookup/
├── page.tsx (existing - minimal changes)
├── components/
│   ├── LabHistoryTable.tsx       (NEW - full history display)
│   ├── LabTrendChart.tsx         (NEW - line charts)
│   ├── ParameterHighlight.tsx    (NEW - critical value styling)
│   ├── SpecialModules.tsx        (NEW - PA/Rad/BMP display)
│   └── VisitCard.tsx             (ENHANCED - collapsible visits)
```

**Each component <250 lines (chunked write compliant)**

### 5.2 API Enhancements

**Current Endpoint:**

```
GET /api/hema-lookup?norm={norm}
→ Returns: quick=1, max=3 visits
```

**Enhanced Endpoint (backward compatible):**

```
GET /api/hema-lookup?norm={norm}&full=true&special=true
→ Returns: All visits + special modules
```

**Response Structure (Enhanced):**

```typescript
{
  success: boolean;
  norm: string;
  name: string;
  visits: LabVisit[];        // All visits (not limited)
  special?: {                // NEW: Special modules
    pa: PAResult[];
    rad: RadResult[];
    bmp: BMPResult[];
    lcs: LCSResult[];
  };
  cached: boolean;
  timestamp: string;
}
```

### 5.3 Data Processing

**Client-Side Processing:**

1. **Trend Calculation:** Extract time-series for key params (HGB, PLT, WBC)
2. **Abnormal Detection:** Compare result vs reference range
3. **Critical Thresholds:** Flag values requiring immediate attention

**Critical Value Definitions (Pediatric):**

- HGB < 7.0 g/dL (severe anemia)
- PLT < 50 x10³/uL (thrombocytopenia risk)
- WBC < 1.0 x10³/uL (severe neutropenia)
- WBC > 30.0 x10³/uL (leukocytosis)

### 5.4 Chart Library

**Selection:** Recharts (already in dependencies)

- Lightweight (no new install)
- React-native
- Responsive by default
- Accessible

**Chart Types:**

- Line chart: Trend over time
- Reference range: Shaded area
- Tooltip: Value + date on hover

---

## 6. Feature Specifications

### 6.1 Complete Lab History Display

**Visual Design:**

- Card-based layout (one card per visit)
- Header: Date + summary (critical count badge)
- Collapsible body with full parameters
- "Load More" pagination if >20 visits

**Interaction:**

- Click card header to expand/collapse
- Default: Latest 3 expanded, rest collapsed
- Smooth animation

**Performance:**

- Virtualization for >50 visits
- Lazy render collapsed content

### 6.2 Visual Trend Charts

**Parameters to Chart:**

1. **Hemoglobin (HGB)** - Primary anemia indicator
2. **Platelet (PLT)** - Bleeding risk
3. **WBC** - Infection/inflammation
4. **Neutrophil%** - Immune function
5. **Optional:** User-selected parameter

**Chart Features:**

- X-axis: Date (last 7-14 days)
- Y-axis: Value with unit
- Line: Patient values
- Shaded area: Reference range
- Dots: Data points
- Hover: Tooltip with exact value + date
- Mobile: Pinch-zoom enabled

**Display Logic:**

- Show chart if ≥2 data points
- If <2 points: "Insufficient data for trend"
- Auto-scale Y-axis with padding

### 6.3 Critical Value Highlighting

**Color Scheme (Color-blind safe):**

```
Critical Low/High:  Red (#DC2626) + ⚠️ icon
Abnormal:          Orange (#EA580C)
Borderline:        Yellow (#EAB308)
Normal:            Default text
```

**Visual Treatment:**

- Font weight: Bold for critical
- Background: Light tint for abnormal rows
- Icon prefix: ⚠️ for critical, ⚫ for abnormal
- Tooltip: Explain why flagged

**Implementation:**

```typescript
function getValueStyle(value: string, range: string) {
  // Parse range: "4.0 - 10.0"
  // Compare value
  // Return style class
}
```

### 6.4 Special Modules Integration

**PA (Pathology Anatomy):**

- Section: "Hasil Patologi Anatomi"
- Display: Date, specimen, diagnosis, conclusion
- Format: Preserve line breaks in conclusion text
- Expandable long text

**Radiology:**

- Section: "Hasil Radiologi"
- Display: Date, procedure, findings, impression
- Format: Structured text

**BMP (Blood Morphology Picture):**

- Section: "Gambaran Darah Tepi"
- Display: Date, findings, conclusion
- Format: Preserve formatting

**LCS (Liquor Cerebrospinalis):**

- Section: "Analisis Cairan Serebrospinal"
- Display: Parameters + interpretation

**Data Source:**
Already available in Hema API:

```
GET /api/lookup/{norm}?special=1
→ Returns visits[] + special modules
```

---

## 7. User Experience Flow

### Happy Path: Resident Reviewing Labs

1. **Enter NORM** → Click "Cari Data Lab"
2. **Loading state** → Spinner (1-2s)
3. **Patient header** → Name, RM, metadata
4. **Trend charts** → Visual overview at top
5. **Visit history** → Latest 3 expanded, rest collapsed
6. **Click visit** → Expand to see all parameters
7. **Scroll down** → Special modules (if available)
8. **Click external link** → Open full SIMRS if needed

### Error States

**Patient Not Found:**

```
⚠️ Pasien dengan NORM [12345] tidak ditemukan di SIMRS.
Pastikan nomor rekam medis sudah benar.
```

**No Lab Data:**

```
ℹ️ Pasien [Nama] ditemukan, tetapi belum ada data laboratorium.
```

**API Timeout:**

```
⏱️ Koneksi ke SIMRS lambat. Coba lagi?
[Retry Button]
```

**Partial Data (No Special Modules):**

- Show lab results normally
- Special modules section: "Belum ada data penunjang khusus"

---

## 8. Performance Requirements

| Metric             | Target | Maximum |
| ------------------ | ------ | ------- |
| Initial page load  | <1s    | 2s      |
| Lab data fetch     | <2s    | 5s      |
| Chart render       | <500ms | 1s      |
| Expand/collapse    | <100ms | 200ms   |
| Scroll performance | 60fps  | 45fps   |

**Optimization Strategy:**

- Cache API responses (5 min)
- Lazy load charts (render on scroll into view)
- Virtualize long lists (>50 items)
- Debounce user interactions
- Code splitting for chart library

---

## 9. Security & Privacy

**PHI Handling:**

- ✅ All API calls over HTTPS
- ✅ No patient data in browser localStorage
- ✅ Session timeout: 30 minutes
- ✅ No analytics tracking of MR numbers
- ✅ Audit logging on server side

**Access Control:**

- Same as existing (password-based auth)
- No additional permissions needed
- Read-only access to lab data

---

## 10. Implementation Phases

### Phase 2A: Core Enhancements (Week 1)

- [ ] Complete lab history (all visits)
- [ ] Critical value highlighting
- [ ] Enhanced abnormal detection
- [ ] Responsive design improvements

### Phase 2B: Visual Trends (Week 1-2)

- [ ] Trend chart component
- [ ] HGB, PLT, WBC charts
- [ ] Reference range visualization
- [ ] Mobile-optimized charts

### Phase 2C: Special Modules (Week 2)

- [ ] PA results display
- [ ] Radiology findings
- [ ] BMP integration
- [ ] LCS (if available)

### Phase 2D: Polish & Testing (Week 2)

- [ ] Performance optimization
- [ ] User acceptance testing
- [ ] Bug fixes
- [ ] Documentation

**Total Duration:** 2 weeks (10 working days)

---

## 11. Risks & Mitigations

| Risk                                | Impact | Probability | Mitigation                                          |
| ----------------------------------- | ------ | ----------- | --------------------------------------------------- |
| Hema API slow/timeout               | High   | Medium      | Client-side caching, show partial data, retry logic |
| Large patient history (>100 visits) | Medium | Low         | Pagination, virtualization, lazy loading            |
| Chart render performance on mobile  | Medium | Medium      | Lazy load, reduce data points for mobile            |
| Special modules missing data        | Low    | High        | Graceful fallback, clear messaging                  |
| Breaking existing Lab Lookup        | High   | Low         | Backward compatible API, thorough testing           |

---

## 12. Testing Strategy

### Unit Tests

- Abnormal value detection logic
- Trend data extraction
- Date range calculations
- Critical threshold checks

### Integration Tests

- API endpoint with full=true parameter
- Special modules data parsing
- Chart data transformation
- Responsive breakpoints

### User Acceptance Testing

- 5 residents test with real patient data
- Feedback on usability
- Performance on actual devices
- Clinical workflow validation

### Performance Testing

- Load time with 50+ visits
- Chart render with 100+ data points
- Memory usage on mobile
- Scroll performance

---

## 13. Success Metrics

### Quantitative

- **Usage Rate:** 80+ lab lookups per day (up from current 20)
- **Time to Decision:** <30 seconds from NORM entry to insight
- **Mobile Usage:** 40% of lookups from mobile devices
- **Error Rate:** <2% of requests
- **Chart Interaction:** 60% of users interact with trends

### Qualitative

- Resident satisfaction: 4.5+ stars (survey)
- Reduction in "need to check Hema Lab" comments
- Positive feedback on trend visualization
- Clinical decision confidence increase

---

## 14. Dependencies & Prerequisites

**Technical:**

- ✅ Hema API accessible (already working)
- ✅ Recharts library (already installed)
- ✅ Next.js 16 + React 19 (current stack)
- ✅ TypeScript configured
- ✅ Tailwind + Shadcn UI (current)

**Data:**

- ✅ Patient lab data available via API
- ✅ Special modules accessible (PA, Rad, BMP)
- ⚠️ Need to verify special modules data structure
- ⚠️ Need sample data for testing

**User:**

- ✅ Current Lab Lookup page working
- ✅ Users familiar with interface
- ✅ No additional training required

---

## 15. Rollout Plan

### Beta Testing (Day 1-3)

- Deploy to staging
- 3 power users test
- Gather immediate feedback
- Fix critical bugs

### Gradual Rollout (Day 4-7)

- Enable for 10 residents
- Monitor performance metrics
- Collect usage data
- Iterate on UX

### Full Production (Day 8+)

- Enable for all users
- Monitor error rates
- Provide documentation
- Gather feedback continuously

### Rollback Plan

- Feature flag: Can disable Phase 2 features
- Fallback: Revert to Phase 1 interface
- Zero downtime rollback
- User communication plan

---

## 16. Open Questions & Decisions Needed

**Questions:**

1. **Chart Default Range:** Show 7 days or 14 days by default?
   - Recommendation: 14 days (more context)
2. **Visit Pagination:** Load all or paginate at 20 visits?
   - Recommendation: Load 20, "Load More" button
3. **Mobile Chart Size:** Full width or compact?
   - Recommendation: Responsive, full width on mobile
4. **Special Modules Empty State:** Hide section or show "No data"?
   - Recommendation: Show section with "Belum ada data" message

5. **Critical Value Audio Alert:** Add sound notification?
   - Recommendation: No (too disruptive in clinical setting)

**Decisions Required from User:**

- [ ] Approve color scheme for critical values
- [ ] Confirm chart parameters priority (HGB, PLT, WBC)
- [ ] Approve special modules display format
- [ ] Confirm pagination strategy (20 vs 50 visits)

---

## 17. Documentation Plan

**User Documentation:**

- Lab Lookup user guide (with screenshots)
- Trend chart interpretation guide
- Critical value reference table
- FAQ section

**Developer Documentation:**

- Component API documentation
- Abnormal detection algorithm
- Chart configuration guide
- Special modules data format

---

## 18. Future Enhancements (Post-Phase 2)

**Phase 3 Considerations:**

- Lab result export (PDF/print)
- Real-time alerts for critical values
- Integration with PediaBrain patient records
- Multi-patient lab comparison
- Lab order suggestions based on trends
- Natural language queries ("Show me declining HGB patients")

---

## 19. Approval & Sign-off

**Stakeholders:**

- [ ] Product Owner (User/Dokter) - Approve scope
- [ ] Technical Lead (Kreya) - Approve architecture
- [ ] Clinical Review - Validate critical thresholds

**Next Steps:**

1. User reviews and approves this PRD
2. Proceed to detailed Implementation Plan
3. Begin Phase 2A development

---

**Document Version History:**

- 2026-09-11 v2.0: Initial Phase 2 PRD (complete)

---

**END OF PRD**
