// src/features/employer/home/pages/EmployerHomePage.tsx
export function EmployerHomePage() {
  return (
    <div>
      {/* Top Stats Tiles (3) - fixed, no gradients */}
      <div className="wm-er-tiles">
        <div className="wm-er-tile">
          <div className="wm-er-tileTop">
            <div className="wm-er-tileLabel">Active Shifts</div>
            <span className="wm-er-tileIcon" aria-hidden="true">
              🗓️
            </span>
          </div>
          <div className="wm-er-tileValue">0</div>
        </div>

        <div className="wm-er-tile">
          <div className="wm-er-tileTop">
            <div className="wm-er-tileLabel">Open Jobs</div>
            <span className="wm-er-tileIcon" aria-hidden="true">
              📌
            </span>
          </div>
          <div className="wm-er-tileValue">0</div>
        </div>

        <div className="wm-er-tile">
          <div className="wm-er-tileTop">
            <div className="wm-er-tileLabel">Total Staff</div>
            <span className="wm-er-tileIcon" aria-hidden="true">
              👥
            </span>
          </div>
          <div className="wm-er-tileValue">0</div>
        </div>
      </div>

      {/* Domain Cards - white cards + subtle tinted header only */}
      <div style={{ marginTop: 12 }}>
        <section className="wm-er-card wm-er-accentCard wm-er-vShift">
          <div className="wm-er-headTint">
            <div className="wm-er-cardHead">
              <div>
                <div className="wm-er-titleRow">
                  <span className="wm-er-domainIcon" aria-hidden="true">
                    🗓️
                  </span>
                  <div>
                    <div className="wm-er-cardTitle">Shift Management</div>
                    <div className="wm-er-cardSub">Create & manage shifts, applicants, assignments.</div>
                  </div>
                </div>
              </div>

              <button className="wm-primarybtn" type="button" onClick={() => window.alert("Employer Shift module: next")}>
                Post Shift
              </button>
            </div>
          </div>

          <div className="wm-er-chips">
            <span className="wm-er-chip">
              Active: <span className="n">0</span>
            </span>
            <span className="wm-er-chip">
              Pending: <span className="n">0</span>
            </span>
          </div>
        </section>

        <section className="wm-er-card wm-er-accentCard wm-er-vCareer">
          <div className="wm-er-headTint">
            <div className="wm-er-cardHead">
              <div>
                <div className="wm-er-titleRow">
                  <span className="wm-er-domainIcon" aria-hidden="true">
                    💼
                  </span>
                  <div>
                    <div className="wm-er-cardTitle">Hiring Pipeline</div>
                    <div className="wm-er-cardSub">Post jobs & manage candidates through stages.</div>
                  </div>
                </div>
              </div>

              <button className="wm-primarybtn" type="button" onClick={() => window.alert("Employer Career module: next")}>
                Post Job
              </button>
            </div>
          </div>

          <div className="wm-er-chips">
            <span className="wm-er-chip">
              Open: <span className="n">0</span>
            </span>
            <span className="wm-er-chip">
              Approvals: <span className="n">0</span>
            </span>
          </div>
        </section>

        <section className="wm-er-card wm-er-accentCard wm-er-vWorkforce">
          <div className="wm-er-headTint">
            <div className="wm-er-cardHead">
              <div>
                <div className="wm-er-titleRow">
                  <span className="wm-er-domainIcon" aria-hidden="true">
                    🧾
                  </span>
                  <div>
                    <div className="wm-er-cardTitle">Workforce Control</div>
                    <div className="wm-er-cardSub">Manage staff, permissions, attendance and performance.</div>
                  </div>
                </div>
              </div>

              <button
                className="wm-primarybtn"
                type="button"
                onClick={() => window.alert("Employer WorkforceOps module: next")}
              >
                Manage
              </button>
            </div>
          </div>

          <div className="wm-er-chips">
            <span className="wm-er-chip">
              Staff: <span className="n">0</span>
            </span>
            <span className="wm-er-chip">
              Alerts: <span className="n">0</span>
            </span>
          </div>
        </section>

        {/* Insights - tiny icon + baseline aligned */}
        <section className="wm-er-insights">
          <div className="wm-er-insightsHead">
            <div className="wm-er-insightsTitle">
              📊 <span>Insights</span>
            </div>
            <button className="wm-er-linkBtn" type="button" onClick={() => window.alert("Analytics: next module")}>
              View analytics →
            </button>
          </div>

          <div className="wm-er-kpis">
            <div className="wm-er-kpiRow">
              <div className="wm-er-kpiLabel">Hires</div>
              <div className="wm-er-kpiValue">0</div>
            </div>
            <div className="wm-er-kpiRow">
              <div className="wm-er-kpiLabel">Reports</div>
              <div className="wm-er-kpiValue">0</div>
            </div>
            <div className="wm-er-kpiRow">
              <div className="wm-er-kpiLabel">Cancellations</div>
              <div className="wm-er-kpiValue">0</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}