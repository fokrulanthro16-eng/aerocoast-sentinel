# AeroCoast Sentinel - Hardware Specifications & Pinout Guide

This document outlines the embedded edge node reference hardware for **AeroCoast Sentinel**, targeting the **Freenove ESP32-S3 WROOM CAM** microcontroller board coupled with solar power harvesting and long-range sub-gigahertz telemetry.

---

## 📌 Target Microcontroller Profile

| Component | Specification | Operational Role |
| :--- | :--- | :--- |
| **SoC** | Espressif ESP32-S3 (Xtensa® 32-bit LX7 dual-core @ 240 MHz) | Core inference & telemetry coordinator |
| **Vector Accelerator** | `esp-nn` hardware SIMD instruction set | Accelerates INT8 matrix multiplication for TFLite Micro |
| **On-Chip SRAM** | 512 KB internal SRAM (256 KB static tensor arena) | Zero dynamic heap jitter during continuous camera capture |
| **External PSRAM** | 8 MB Octal PSRAM | Frame buffer storage for high-res DMA frame pipelines |
| **Flash Memory** | 16 MB Quad SPI Flash | Stores quantized FlatBuffer model weights & fallback OS |
| **Optical Sensor** | Omnivision OV2640 (2 Megapixel DVP interface) | 60 FPS / QVGA / VGA optical capture stream |
| **Sub-GHz Radio** | Semtech SX1262 LoRa Transceiver (SPI) | 915 MHz US Band 2 mesh backhaul to TAMU-CC gateway |

---

## 🔌 OV2640 DVP Camera Pin Mapping (Freenove ESP32-S3)

The following GPIO pin mappings correspond to the default hardware layout defined in [`firmware/esp32_s3_aerocoast/main.cpp`](firmware/esp32_s3_aerocoast/main.cpp):

```
+-----------------------------------------------------------+
|               FREENOVE ESP32-S3 WROOM CAM                 |
|                                                           |
|   CAMERA SIGNAL      ESP32-S3 GPIO     SIGNAL DESCRIPTION |
|   ----------------   -------------     -----------------  |
|   PWDN               GPIO -1 (None)    Power Down Control |
|   RESET              GPIO -1 (None)    Hardware Reset     |
|   XCLK               GPIO 15           Master Clock (20MHz|
|   SIOD (SDA)         GPIO 4            SCCB Data Bus      |
|   SIOC (SCL)         GPIO 5            SCCB Clock Bus     |
|   Y9 (D7)            GPIO 16           Pixel Data Bit 7   |
|   Y8 (D6)            GPIO 17           Pixel Data Bit 6   |
|   Y7 (D5)            GPIO 18           Pixel Data Bit 5   |
|   Y6 (D4)            GPIO 12           Pixel Data Bit 4   |
|   Y5 (D3)            GPIO 10           Pixel Data Bit 3   |
|   Y4 (D2)            GPIO 8            Pixel Data Bit 2   |
|   Y3 (D1)            GPIO 9            Pixel Data Bit 1   |
|   Y2 (D0)            GPIO 11           Pixel Data Bit 0   |
|   VSYNC              GPIO 6            Vertical Sync      |
|   HREF               GPIO 7            Horizontal Ref     |
|   PCLK               GPIO 13           Pixel Clock        |
+-----------------------------------------------------------+
```

---

## ⚡ Solar Power Management & LiFePO4 Battery Bus

AeroCoast Sentinel operates entirely within an off-grid **4.2W power envelope**:

```
 [ Dual 20W Monocrystalline PV Panels ]
                  |
                  v (18.7W Solar Peak)
     [ MPPT Solar Charge Controller (97.4% Eff) ]
                  |
                  +--------------------------------+
                  |                                |
                  v                                v
       [ 4S LiFePO4 Battery Pack ]        [ Buck Regulator (5V/3A) ]
       Nominal: 13.26 V (12.8V - 14.4V)                |
       Capacity: 10,000 mAh (128 Wh)                   v
       Autonomy: 72+ hours zero-sun      [ Freenove ESP32-S3 Node ]
                                            Continuous Draw: ~4.2W
```

---

## 📡 LoRaWAN 915 MHz SPI Pin Connections

| SX1262 Pin | ESP32-S3 GPIO | Function |
| :--- | :---: | :--- |
| **NSS / CS** | GPIO 21 | SPI Chip Select |
| **SCK** | GPIO 14 | SPI Serial Clock |
| **MOSI** | GPIO 47 | SPI Master Out Slave In |
| **MISO** | GPIO 48 | SPI Master In Slave Out |
| **RST** | GPIO 38 | Transceiver Reset |
| **DIO1 / IRQ**| GPIO 39 | Packet Ready Interrupt |
| **BUSY** | GPIO 40 | RF Channel Busy Indicator |

---

## 🛠️ PlatformIO Configuration (`platformio.ini`)

To build and flash the firmware using [PlatformIO](https://platformio.org/):

```ini
[env:esp32-s3-devkitc-1]
platform = espressif32 @ 6.6.0
board = esp32-s3-devkitc-1
framework = espidf
monitor_speed = 115200

build_flags = 
    -D BOARD_HAS_PSRAM
    -D CORE_DEBUG_LEVEL=3
    -D TFLITE_MCU_INT8
    -O3

board_build.arduino.memory_type = qio_opi
board_build.partitions = default_16MB.csv
board_upload.flash_size = 16MB

lib_deps = 
    https://github.com/espressif/esp-nn.git
```

### Flashing Procedure

1. Connect the Freenove ESP32-S3 CAM via USB-C.
2. Build firmware:
   ```bash
   pio run
   ```
3. Upload binary to target hardware:
   ```bash
   pio run --target upload
   ```
4. Open the serial console to verify sub-15ms inference logs:
   ```bash
   pio device monitor
   ```
