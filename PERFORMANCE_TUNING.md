# Performance & latency tuning (Gryt Chat)

## Reality check (what "near 1:1" can mean)

You can't beat physics: one-way latency is bounded by distance and routing (speed-of-light + network hops). What you *can* do is keep **added** latency (encoding, buffering, jitter buffers, retransmits, queueing) as low as possible and make it stable.

## Server-side knobs

### Server-level limits

Editable from **Server settings → Overview → Limits** (owner-only):

- **Max avatar upload (MB)** → enforced by `POST /api/uploads/avatar`
- **Max file upload (MB)** → enforced by `POST /api/uploads`

Setting a field blank clears it (reverts to default behavior).

### Per-channel voice bitrate

Voice bitrate is configured **per channel** from **Server settings → Channels** when editing a voice channel. A dropdown provides standard Opus presets:

| Preset | Bitrate | Use case |
|--------|---------|----------|
| Narrowband | 8 kbps | Absolute minimum, telephone quality |
| Wideband | 16 kbps | Low-bandwidth speech |
| VoIP | 24 kbps | Standard VoIP quality |
| Voice (Low) | 32 kbps | Bandwidth-constrained speech |
| Voice (Medium) | 48 kbps | Decent voice quality |
| Voice (Standard) | 64 kbps | Good quality speech |
| Voice (High) | 96 kbps | High quality speech |
| Voice (Studio) | 128 kbps | Studio-grade voice clarity |
| Music (Standard) | 160 kbps | Music streaming / screen share audio |
| Music (High) | 192 kbps | High quality music |
| Music (Very High) | 256 kbps | Near-transparent music |
| Music (Lossless-like) | 320 kbps | Indistinguishable from source |
| Music (Premium) | 384 kbps | Premium fidelity |
| Music (Ultra) | 448 kbps | Ultra-high fidelity |
| Opus Maximum | 510 kbps | Codec maximum |
| Default (no cap) | — | Let WebRTC bandwidth estimator decide |

The bitrate is applied client-side on voice connect via `RTCRtpSender.setParameters({ encodings: [{ maxBitrate }] })`.

**eSports Mode** overrides the channel bitrate and forces a 128 kbps cap (Voice Studio) along with PTT, no RNNoise, and 10 ms Opus frames for lowest latency.

## Recommended starting points

These aren't universal; they're a good first pass:

- **Max avatar upload**: 2–5 MB (avatars are resized anyway)
- **Max file upload**: 10–50 MB (depending on your storage + expected usage)
- **Voice channels**: 64–96 kbps for speech, 160–256 kbps for music/streaming
- **eSports channels**: Enable eSports Mode (auto-caps at 128 kbps with low-latency Opus)

## Screen share video quality

### Gaming mode

Gaming mode is enabled by default and optimizes encoding for fast-moving content (games, video playback). When active it applies:

- **`cursor: "never"`**: Hides the mouse cursor from the captured stream (Electron only), preventing the sharer's cursor from appearing over full-screen games that hide it.
- **`contentHint = "motion"`**: Tells the encoder to prioritize framerate over sharpness. Without this, browsers default to `"detail"` mode which drops FPS to maintain resolution — fine for static text, bad for video or fast scrolling.
- **`degradationPreference = "maintain-framerate"`**: WebRTC drops resolution rather than framerate when bandwidth is constrained.
- **1.5x bitrate multiplier**: Auto-estimated bitrate is scaled up by 50 % (capped at 20 Mbps) to give the encoder more headroom for high-motion content.

When gaming mode is off, the encoder uses `contentHint = "detail"` and `degradationPreference = "maintain-resolution"`, which is better for static presentations and text-heavy content.

### Codec selection

The client uses `RTCRtpTransceiver.setCodecPreferences` to control which video codec is negotiated for screen sharing. Available options (configurable in the screen share Advanced panel):

| Codec | Default | Hardware encode | Notes |
|-------|---------|-----------------|-------|
| **H.264** | Yes (Auto) | NVENC (NVIDIA), Quick Sync (Intel), AMF (AMD) | Universal hardware encode — works on virtually all GPUs |
| **VP9** | No | Limited | Good compression, screen-content coding mode, but rarely hardware-accelerated on consumer GPUs |
| **AV1** | No | RTX 40+, Intel Arc, AMD RX 7000+ | Best compression efficiency; falls back to slow software encode on older hardware |

The "Auto" setting prefers H.264 for the widest hardware encode compatibility. Users with newer GPUs can manually select AV1 for better compression at the same bitrate.

### Bitrate control

- **Auto mode** (default): Bitrate is estimated from the selected quality preset and FPS (e.g. 6 Mbps for 1080p @ 30 fps), scaling linearly with framerate. Gaming mode applies a 1.5x multiplier on top.
- **Manual override**: Users can set a fixed max bitrate (1–50 Mbps) in the Advanced panel. When set, the gaming mode multiplier does not apply — the chosen value is used directly via `RTCRtpSender.setParameters`.

### Scalable Video Coding (SVC)

SVC lets the encoder produce temporal layers in a single stream. With L1T3 (the default for screen sharing), the encoder outputs three framerate tiers (T0 = 7.5fps, T0+T1 = 15fps, T0+T1+T2 = 30fps) in one RTP stream. The SFU parses the Dependency Descriptor (DD) RTP header extension on each packet to determine which temporal layer it belongs to, then selectively drops higher layers for bandwidth-constrained receivers.

| Scalability mode | Layers | Framerate tiers | Use case |
|------------------|--------|-----------------|----------|
| **L1T1** | 1 | 30fps only | No SVC — all receivers get identical stream |
| **L1T2** | 2 | 15fps / 30fps | Light adaptation |
| **L1T3** | 3 | 7.5fps / 15fps / 30fps | Full temporal scalability (default) |

The SFU auto-adapts each receiver's layer based on REMB feedback:

- REMB < 1 Mbps → T0 only (7.5fps)
- REMB < 3 Mbps → T0+T1 (15fps)
- REMB >= 3 Mbps → all layers (30fps)

Clients can also manually set the layer via the `set_layer` WebSocket event for a quality selector UI.

The SVC setting is configurable in the Advanced panel of the screen share dialog. Hardware encoders (NVENC, Quick Sync, AMF) support temporal SVC natively for VP9/AV1 and H.264, so there is no measurable CPU impact on the client.

### RTCP relay

The SFU relays receiver RTCP feedback (REMB, PLI) back to the sender so the browser's congestion controller can adapt bitrate in real time. Without this the sender is blind to downstream conditions.

## Debug overlay metrics

Enable **Debug Settings → Show Microphone Debug Overlay** to see:

- **Socket RTT**: signaling round-trip time (app ↔ server)
- **WebRTC RTT**: ICE candidate-pair RTT (media path)
- **WebRTC jitter / packets lost / available outgoing bitrate**: quick health signals for voice

## Practical tips for low latency

- Keep SFU close (region-wise) to most users.
- Prefer stable wired/Wi‑Fi over cellular.
- If you see rising jitter/loss, reduce the channel's **max bitrate** preset.
- Use the WebRTC RTT/jitter indicators as your primary tuning target, not just "sounds good".
