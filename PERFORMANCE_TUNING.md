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
