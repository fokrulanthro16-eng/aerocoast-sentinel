"""
AeroCoast Sentinel - High-Impact Narrated Demo Video Generator
Uses Microsoft Edge TTS (en-US-ChristopherNeural) + MoviePy / FFmpeg
Synchronizes 6 tactical mission acts to exact video timestamps.
"""

import asyncio
import os
import subprocess
import time
import edge_tts
import imageio_ffmpeg
from moviepy.editor import AudioFileClip, CompositeAudioClip, VideoFileClip

BASE_DIR = r"C:\Users\WALTON\.gemini\antigravity\scratch\aerocoast-sentinel"
VIDEO_INPUT = os.path.join(BASE_DIR, "demo_video.webm")
VOICEOVER_OUTPUT = os.path.join(BASE_DIR, "voiceover.mp3")
FINAL_OUTPUT = os.path.join(BASE_DIR, "final_submission_demo.mp4")

VOICE = "en-US-ChristopherNeural"

# Precisely timed narration segments matched to demo_video.webm events
TIMED_SEGMENTS = [
    {
        "id": 1,
        "name": "Act 1: Tactical Launch & Corpus Christi Beach Plastic Litter",
        "start_time": 2.0,
        "rate": "+6%",
        "text": (
            "Welcome to AeroCoast Sentinel, an edge-native coastal monitoring console built for IslanderHack 2026. "
            "Operating off-grid on a 4.2-watt solar budget, it performs real-time computer vision right on the South Texas shoreline. "
            "Notice our edge latency clocking under seven milliseconds via INT8 WebAssembly SIMD. "
            "The optical feed immediately detects plastic marine debris and ghost nets, raising an elevated threat alert "
            "while logging tide, salinity, and dune scarp metrics."
        )
    },
    {
        "id": 2,
        "name": "Act 2: Mustang Island Dune Erosion Alert",
        "start_time": 35.0,
        "rate": "+6%",
        "text": (
            "Switching to Scenario Two on Mustang Island. The system instantly detects severe geomorphic dune erosion. "
            "The critical hazard banner activates with Grandma Theory clarity. "
            "Telemetry flags a dangerous forty-eight-degree scarp slope and impending structural failure, "
            "alerting conservation rangers without transmitting raw video to the cloud."
        )
    },
    {
        "id": 3,
        "name": "Act 3: Laguna Madre Clean Sanctuary & Avian Wildlife",
        "start_time": 58.0,
        "rate": "+7%",
        "text": (
            "Transitioning to Scenario Three: Laguna Madre Clean Sanctuary. "
            "Here, the console enters nominal mode with zero contaminants. "
            "Our INT8 model identifies protected avian wildlife, tracking a Piping Plover foraging along the seagrass shallows "
            "with over ninety percent confidence, demonstrating real-time biodiversity conservation."
        )
    },
    {
        "id": 4,
        "name": "Act 4: Solar PV Bus & Green AI Resource Audit",
        "start_time": 79.0,
        "rate": "+10%",
        "text": (
            "Scrolling to our hardware energy bus. The node is powered by a dual solar array and a four-series LiFePO4 battery pack, "
            "currently at 13.26 volts with an energy surplus over fourteen watts. "
            "Our Green AI audit proves a 98.3 percent energy reduction compared to a 250-watt cloud GPU, "
            "avoiding 2.38 kilograms of carbon daily."
        )
    },
    {
        "id": 5,
        "name": "Act 5: Industrial Analytics Deck",
        "start_time": 101.0,
        "rate": "+6%",
        "text": (
            "Our industrial analytics deck buffers twenty-four hours of mission-critical telemetry, "
            "tracking tidal surges calibrated with Texas A&M buoys, cumulative carbon footprint differentials, "
            "and hourly multi-class detection frequencies."
        )
    },
    {
        "id": 6,
        "name": "Act 6: GeoJSON Export & Mission Wrap-Up",
        "start_time": 117.0,
        "rate": "+6%",
        "text": (
            "Finally, clicking Export GeoJSON Log instantly generates an RFC 7946 audit record "
            "with full NOAA and TCEQ calibration provenance. "
            "AeroCoast Sentinel: true zero-cloud intelligence protecting our Texas shores. Thank you."
        )
    }
]

async def generate_speech_clips():
    """Generates individual voiceover clips using edge-tts."""
    print("Generating synchronized voiceover audio tracks via edge-tts...")
    audio_clips = []
    temp_files = []

    for seg in TIMED_SEGMENTS:
        seg_file = os.path.join(BASE_DIR, f"temp_voice_{seg['id']}.mp3")
        temp_files.append(seg_file)

        print(f"  -> Synthesizing [{seg['name']}] (Start: {seg['start_time']}s, Rate: {seg['rate']})...")
        communicate = edge_tts.Communicate(seg["text"], voice=VOICE, rate=seg["rate"])
        await communicate.save(seg_file)

        clip = AudioFileClip(seg_file)
        print(f"     Duration: {clip.duration:.2f}s | Target start: {seg['start_time']}s")
        clip = clip.set_start(seg["start_time"])
        audio_clips.append(clip)

    return audio_clips, temp_files

def compose_voiceover(audio_clips, total_duration):
    """Composites audio tracks into a master voiceover.mp3 file."""
    print(f"\nCompositing master voiceover track (Duration: {total_duration:.2f}s)...")
    composite = CompositeAudioClip(audio_clips)
    composite.duration = total_duration

    composite.write_audiofile(
        VOICEOVER_OUTPUT,
        fps=44100,
        nbytes=2,
        codec="libmp3lame",
        verbose=False,
        logger=None
    )
    print(f"Master voiceover written to: {VOICEOVER_OUTPUT}")

def merge_with_video():
    """Merges voiceover.mp3 with demo_video.webm into final_submission_demo.mp4 using FFmpeg."""
    print("\nMerging voiceover audio with video into final production MP4...")
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()

    cmd = [
        ffmpeg_exe, "-y",
        "-i", VIDEO_INPUT,
        "-i", VOICEOVER_OUTPUT,
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "20",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        FINAL_OUTPUT
    ]

    print(f"Running FFmpeg: {' '.join(cmd[:6])} ... -> {FINAL_OUTPUT}")
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0:
        print("FFmpeg STDERR:", res.stderr)
        raise RuntimeError("FFmpeg encoding failed.")
    print(f"Final video successfully generated: {FINAL_OUTPUT}")

def main():
    start_total = time.time()
    print("=" * 70)
    print("AEROCOAST SENTINEL - PROFESSIONAL NARRATED DEMO VIDEO BUILDER")
    print(f"Voice Profile: {VOICE}")
    print(f"Video Source:  {VIDEO_INPUT}")
    print("=" * 70)

    if not os.path.exists(VIDEO_INPUT):
        raise FileNotFoundError(f"Input video not found: {VIDEO_INPUT}")

    # 1. Determine video duration
    video = VideoFileClip(VIDEO_INPUT)
    video_duration = video.duration
    video.close()
    print(f"Source video duration: {video_duration:.2f} seconds\n")

    # 2. Synthesize audio segments
    audio_clips, temp_files = asyncio.run(generate_speech_clips())

    # 3. Composite into voiceover.mp3
    compose_voiceover(audio_clips, video_duration)

    # Close audio clips
    for clip in audio_clips:
        clip.close()

    # Clean up temporary segment audio files
    for tmp in temp_files:
        try:
            if os.path.exists(tmp):
                os.remove(tmp)
        except Exception:
            pass

    # 4. Merge audio and video into final_submission_demo.mp4
    merge_with_video()

    # Final stats
    if os.path.exists(FINAL_OUTPUT):
        size_mb = os.path.getsize(FINAL_OUTPUT) / (1024 * 1024)
        print("\n" + "=" * 70)
        print("MISSION COMPLETE: Production Narrated Video Ready!")
        print(f"File Path: {FINAL_OUTPUT}")
        print(f"File Size: {size_mb:.2f} MB")
        print(f"Build Time: {time.time() - start_total:.1f}s")
        print("=" * 70)
    else:
        raise FileNotFoundError("Output file was not created.")

if __name__ == "__main__":
    main()
