# Contributing to AeroCoast Sentinel

Thank you for your interest in contributing to **AeroCoast Sentinel**! We are committed to fostering an inclusive, high-reliability open-source ecosystem dedicated to green edge AI and coastal conservation.

---

## 🧭 Code of Conduct

All contributors and maintainers are expected to uphold the [Contributor Covenant v2.1](CODE_OF_CONDUCT.md). Please report unacceptable behavior to the project maintainers.

---

## 🛠️ Development Setup & Local Workflow

1. **Fork and Clone the Repository**:
   ```bash
   git clone https://github.com/fokrulanthro16-eng/aerocoast-sentinel.git
   cd aerocoast-sentinel
   ```

2. **Run Local HTTP Server**:
   ```bash
   python -m http.server 8080
   ```
   Open `http://localhost:8080` in Chrome or Edge.

3. **Verify Edge Firmware (ESP32-S3)**:
   Firmware sources are located in `firmware/esp32_s3_aerocoast/`. Build using PlatformIO:
   ```bash
   cd firmware/esp32_s3_aerocoast
   pio run
   ```

---

## 🌿 Branching Strategy & Conventional Commits

We follow standard **GitFlow** and require [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` A new feature or scenario enhancement
- `fix:` A bug fix in canvas rendering, telemetry, or export
- `perf:` Performance optimizations reducing memory or CPU inference latency
- `docs:` Documentation improvements or hardware specs
- `test:` CI or Playwright regression tests
- `chore:` Maintenance, dependency, or workflow adjustments

**Branch Naming Format**:
- `feature/description`
- `fix/issue-description`
- `docs/update-description`

---

## 🧪 Quality Standards & PR Checklist

Before submitting a Pull Request:
- [ ] No remote cloud API keys or billable endpoints introduced.
- [ ] Deterministic edge latency remains **< 15ms** on baseline WebAssembly SIMD hardware.
- [ ] Responsive centering and Grandma Theory high-contrast accessibility standards maintained.
- [ ] RFC 7946 GeoJSON export schema validated against NOAA & TCEQ calibration standards.
- [ ] Embedded firmware builds cleanly under ESP-IDF / PlatformIO without tensor memory leaks.

---

## 📄 Licensing

By contributing, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).
