"""
AeroCoast Sentinel - Automated HD 1080p Demo Video Recorder
Plays through scenarios, telemetry, energy bus, analytics charts, and GeoJSON export.
Duration: 120 Seconds | Resolution: 1920x1080
"""

import os
import shutil
import tempfile
import time
from playwright.sync_api import sync_playwright

OUTPUT_VIDEO = r"C:\Users\WALTON\.gemini\antigravity\scratch\aerocoast-sentinel\demo_video.webm"
BASE_URL = "http://localhost:8080"
TOTAL_DURATION = 120.0

def inject_visual_helpers(page):
    """Injects tactical HUD glowing cursor and element highlight styles."""
    page.evaluate("""() => {
        // Glowing Tactical Cursor
        const cursor = document.createElement('div');
        cursor.id = 'tactical-virtual-cursor';
        cursor.style.position = 'fixed';
        cursor.style.width = '24px';
        cursor.style.height = '24px';
        cursor.style.borderRadius = '50%';
        cursor.style.backgroundColor = 'rgba(16, 185, 129, 0.4)';
        cursor.style.border = '2px solid #10b981';
        cursor.style.boxShadow = '0 0 16px rgba(16, 185, 129, 0.8), inset 0 0 8px rgba(16, 185, 129, 0.5)';
        cursor.style.pointerEvents = 'none';
        cursor.style.zIndex = '9999999';
        cursor.style.transform = 'translate(-50%, -50%)';
        cursor.style.transition = 'transform 0.08s ease, border-color 0.15s ease, background-color 0.15s ease';
        
        // Inner reticle dot
        const dot = document.createElement('div');
        dot.style.position = 'absolute';
        dot.style.top = '50%';
        dot.style.left = '50%';
        dot.style.width = '4px';
        dot.style.height = '4px';
        dot.style.borderRadius = '50%';
        dot.style.backgroundColor = '#38bdf8';
        dot.style.transform = 'translate(-50%, -50%)';
        cursor.appendChild(dot);

        document.body.appendChild(cursor);

        window.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });

        window.addEventListener('mousedown', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(0.7)';
            cursor.style.borderColor = '#f59e0b';
            cursor.style.backgroundColor = 'rgba(245, 158, 11, 0.6)';
        });

        window.addEventListener('mouseup', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(1)';
            cursor.style.borderColor = '#10b981';
            cursor.style.backgroundColor = 'rgba(16, 185, 129, 0.4)';
        });
    }""")

def smooth_move_to_element(page, selector, steps=25):
    """Smoothly moves cursor to the center of a target element."""
    try:
        box = page.locator(selector).first.bounding_box()
        if box:
            target_x = box["x"] + box["width"] / 2
            target_y = box["y"] + box["height"] / 2
            page.mouse.move(target_x, target_y, steps=steps)
            return target_x, target_y
    except Exception as e:
        print(f"Warning moving to {selector}: {e}")
    return None, None

def highlight_element(page, selector, duration_sec=2.0):
    """Highlights an element with a pulsing tactical cyan ring."""
    try:
        smooth_move_to_element(page, selector, steps=20)
        page.evaluate(f"""() => {{
            const el = document.querySelector('{selector}');
            if (el) {{
                el.style.transition = 'box-shadow 0.3s ease, border-color 0.3s ease';
                el.style.boxShadow = '0 0 24px rgba(56, 189, 248, 0.7)';
                el.style.borderColor = '#38bdf8';
                setTimeout(() => {{
                    el.style.boxShadow = '';
                    el.style.borderColor = '';
                }}, {int(duration_sec * 1000)});
            }}
        }}""")
        time.sleep(duration_sec)
    except Exception as e:
        print(f"Highlight error on {selector}: {e}")

def smooth_scroll(page, target_y, steps=20, delay=0.03):
    """Smoothly scrolls the window to the target vertical position."""
    current_y = page.evaluate("window.scrollY")
    distance = target_y - current_y
    for i in range(1, steps + 1):
        y = current_y + (distance * (i / steps))
        page.evaluate(f"window.scrollTo(0, {y})")
        time.sleep(delay)

def main():
    print(f"Starting 120-second High-Definition 1080p Video Recording...")
    print(f"Output Target: {OUTPUT_VIDEO}")

    temp_dir = tempfile.mkdtemp(prefix="aerocoast_record_")

    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=[
                "--disable-gpu-sandbox",
                "--no-sandbox",
                "--autoplay-policy=no-user-gesture-required"
            ]
        )

        context = browser.new_context(
            viewport={"width": 1920, "height": 1080},
            record_video_dir=temp_dir,
            record_video_size={"width": 1920, "height": 1080},
            accept_downloads=True
        )

        page = context.new_page()
        video_handle = page.video

        start_time = time.time()

        print("[0:00] Navigating to http://localhost:8080...")
        page.goto(BASE_URL, wait_until="networkidle")
        page.wait_for_timeout(1500)

        inject_visual_helpers(page)

        # ---------------------------------------------------------
        # ACT 1: Scenario 1 - Corpus Christi Beach Plastic Litter (0s - 32s)
        # ---------------------------------------------------------
        print("[0:05] Showcasing Scenario 1: Plastic Litter Detection & Optical Canvas...")
        smooth_move_to_element(page, "#optical-canvas", steps=30)
        time.sleep(3.5)

        # Highlight edge inference latency (sub-15ms / ~6.5ms)
        print("[0:12] Highlighting sub-15ms edge inference latency (~6.5ms INT8)...")
        highlight_element(page, "#canvas-latency", duration_sec=4.0)

        # Highlight hazard warning banner
        print("[0:19] Highlighting hazard alert banner...")
        highlight_element(page, "#verdict-banner", duration_sec=4.0)

        # Highlight multi-sensor telemetry cards
        print("[0:25] Inspecting telemetry cards (Tide, Salinity, Dune Scarp)...")
        smooth_move_to_element(page, "#telemetry-tide", steps=20)
        time.sleep(2.5)
        smooth_move_to_element(page, "#telemetry-salinity", steps=20)
        time.sleep(2.5)
        smooth_move_to_element(page, "#telemetry-dune-scarp", steps=20)
        time.sleep(2.5)

        # ---------------------------------------------------------
        # ACT 2: Scenario 2 - Mustang Island Dune Erosion Alert (32s - 55s)
        # ---------------------------------------------------------
        print("[0:34] Switching to Scenario 2: Mustang Island Dune Erosion Alert...")
        smooth_move_to_element(page, "#scenario-select", steps=25)
        time.sleep(1.0)
        page.select_option("#scenario-select", "erosion")
        page.evaluate("() => document.getElementById('scenario-select').dispatchEvent(new Event('change'))")
        time.sleep(2.5)

        print("[0:40] Inspecting critical dune erosion alert banner & canvas...")
        highlight_element(page, "#verdict-banner", duration_sec=4.5)
        smooth_move_to_element(page, "#optical-canvas", steps=25)
        time.sleep(4.5)

        # Highlight Dune Slope angle & Critical Badge
        print("[0:49] Highlighting 48° Dune Scarp Angle & Structural Hazard...")
        highlight_element(page, "#dune-risk-badge", duration_sec=3.5)
        smooth_move_to_element(page, "#detection-tags-container", steps=25)
        time.sleep(3.5)

        # ---------------------------------------------------------
        # ACT 3: Scenario 3 - Laguna Madre Clean Sanctuary (55s - 75s)
        # ---------------------------------------------------------
        print("[0:57] Switching to Scenario 3: Laguna Madre Clean Sanctuary...")
        smooth_move_to_element(page, "#scenario-select", steps=25)
        time.sleep(1.0)
        page.select_option("#scenario-select", "sanctuary")
        page.evaluate("() => document.getElementById('scenario-select').dispatchEvent(new Event('change'))")
        time.sleep(2.5)

        print("[1:02] Inspecting clean sanctuary nominal status & wildlife detection...")
        highlight_element(page, "#verdict-banner", duration_sec=4.0)
        smooth_move_to_element(page, "#optical-canvas", steps=25)
        time.sleep(4.5)

        print("[1:11] Highlighting Piping Plover wildlife detection tag...")
        smooth_move_to_element(page, "#detection-tags-container", steps=20)
        time.sleep(4.0)

        # ---------------------------------------------------------
        # ACT 4: Energy Bus & Green AI Resource Audit (75s - 95s)
        # ---------------------------------------------------------
        print("[1:18] Scrolling down to Solar PV Bus & Green AI Audit...")
        smooth_scroll(page, target_y=380, steps=25, delay=0.03)
        time.sleep(1.5)

        print("[1:22] Highlighting LiFePO4 Energy Storage & Solar Bus (13.26V, 96.4% SoC)...")
        highlight_element(page, "#bus-voltage", duration_sec=2.5)
        highlight_element(page, "#bus-solar-watts", duration_sec=2.5)
        highlight_element(page, "#bus-net-surplus", duration_sec=2.5)

        print("[1:30] Highlighting Green AI Resource Audit (250W Cloud vs 4.2W Edge)...")
        smooth_move_to_element(page, ".glass-panel-accent", steps=20)
        time.sleep(4.0)

        # Highlight LoRaWAN link layer
        print("[1:35] Inspecting LoRaWAN US915 link metrics...")
        smooth_move_to_element(page, "#link-rssi", steps=20)
        time.sleep(2.0)
        smooth_move_to_element(page, "#link-packets", steps=20)
        time.sleep(2.0)

        # ---------------------------------------------------------
        # ACT 5: Industrial Analytics Deck (3 Charts) (95s - 110s)
        # ---------------------------------------------------------
        print("[1:40] Scrolling to Industrial Analytics Deck...")
        smooth_scroll(page, target_y=880, steps=25, delay=0.03)
        time.sleep(1.5)

        print("[1:43] Demonstrating Tidal Surge & Salinity Cycle Chart...")
        smooth_move_to_element(page, "#telemetryChart", steps=25)
        time.sleep(3.0)

        print("[1:47] Demonstrating Cumulative Carbon Footprint Curve Chart...")
        smooth_move_to_element(page, "#carbonOffsetChart", steps=25)
        time.sleep(3.0)

        print("[1:51] Demonstrating 24-Hr Multi-Class Detection Frequency Chart...")
        smooth_move_to_element(page, "#detectionFrequencyChart", steps=25)
        time.sleep(3.0)

        # ---------------------------------------------------------
        # ACT 6: GeoJSON Export & Mission Finalization (110s - 120s)
        # ---------------------------------------------------------
        print("[1:55] Scrolling back to tactical controls & Exporting GeoJSON...")
        smooth_scroll(page, target_y=0, steps=30, delay=0.02)
        time.sleep(1.5)

        print("[1:58] Clicking Export Edge Audit Log (GeoJSON)...")
        smooth_move_to_element(page, "#btn-export-geojson", steps=25)
        time.sleep(1.0)
        try:
            with page.expect_download(timeout=5000):
                page.click("#btn-export-geojson")
        except Exception as e:
            print(f"Download triggered: {e}")
            page.click("#btn-export-geojson")

        print("[2:00] Final overview sweep across live tactical canvas...")
        smooth_move_to_element(page, "#optical-canvas", steps=25)

        # Exact timing synchronization to reach 120 seconds
        elapsed = time.time() - start_time
        remaining = TOTAL_DURATION - elapsed
        if remaining > 0:
            print(f"Pacing final sequence: waiting {remaining:.1f}s to reach exactly 120s...")
            time.sleep(remaining)

        total_recorded = time.time() - start_time
        print(f"Total recording time elapsed: {total_recorded:.1f}s")

        print("Finalizing video capture...")
        page.close()
        context.close()
        browser.close()

        raw_video_path = video_handle.path()
        print(f"Raw video generated at: {raw_video_path}")

        if os.path.exists(raw_video_path):
            shutil.copy2(raw_video_path, OUTPUT_VIDEO)
            file_size_mb = os.path.getsize(OUTPUT_VIDEO) / (1024 * 1024)
            print(f"SUCCESS: Video successfully saved to {OUTPUT_VIDEO} ({file_size_mb:.2f} MB)")
        else:
            raise FileNotFoundError(f"Video file not found at {raw_video_path}")

        # Cleanup temporary directory
        try:
            shutil.rmtree(temp_dir, ignore_errors=True)
        except Exception:
            pass

if __name__ == "__main__":
    main()
