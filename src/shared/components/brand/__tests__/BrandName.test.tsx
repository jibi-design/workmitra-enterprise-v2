/** BrandName — dual-tone mark structure and aria labels */

import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { BrandName, JobMitraBrandName, MitraLabsBrandName } from "../BrandName";

describe("BrandName", () => {
  it("renders Job Mitra with dual-tone parts and aria label", () => {
    const html = renderToStaticMarkup(<JobMitraBrandName />);
    expect(html).toContain('aria-label="Job Mitra"');
    expect(html).toContain('class="wm-brandMark__job"');
    expect(html).toContain(">Job<");
    expect(html).toContain('class="wm-brandMark__mitra"');
    expect(html).toContain(">Mitra<");
  });

  it("renders Mitra Labs with dual-tone parts and aria label", () => {
    const html = renderToStaticMarkup(<MitraLabsBrandName />);
    expect(html).toContain('aria-label="Mitra Labs"');
    expect(html).toContain('class="wm-brandMark__labs"');
    expect(html).toContain(">Labs<");
  });

  it("applies size class from brand prop", () => {
    const html = renderToStaticMarkup(<BrandName brand="job-mitra" size="lg" />);
    expect(html).toContain("wm-brandName--lg");
  });
});
