---
title: "Jellyfin Direct Play on Apple TV, finally"
date: 2026-09-25
---

I finally got my Jellyfin Blurays to Direct Play on my Apple TV! Here's what it took.

First, playing from my Apple TV wasn't negotiable. I [don't trust my LG TV](https://www.zdnet.com/home-and-office/lg-tv-data-collection-how-to-factory-reset-and-why-you-need-to/) connected to the internet. I want the clean, simple remote, and the same experience we have watching from streaming services. Playing from a computer stuttered unless I set the display refresh rate to 24 Hz, which made navigating around awful.

Unfortunately, my Jellyfin transcodes didn't look good. I saw frequent stuttering during motion, and blocky, low quality dark scenes. 

What finally fixed it:
- Transcode to SDR (8-bit color); let the player do the SDR to HDR tonemapping.
- Ensure Framerate Matching is on (Apple TV Settings > Video > Framerate Matching)
- Ensure content is Direct Playing (in the Jellyfin Admin UI).
- Use the [Sodalite Client](https://github.com/superuser404notfound/Sodalite), or..
- In Swiftfin, configure the **Native** (AVKit) player. (Settings > Video player type = "Native")

You need the Native Player active to get good dark scenes and framerate matching to work. Unfortunately, the Native Player is picky about what it will Direct Play. If my server is transcoding or remuxing the video, I see stutter (even though it's a fast machine).

Direct Play in the Native Player [works with](https://github.com/jellyfin/Swiftfin/blob/main/Documentation/players.md):
- MP4 as the container file format (not MKV)
- H.265 as the video codec **with** `-tag:v hvc1`
- E-AC3 (for surround sound) or AAC (for stereo) as the audio codec
- MOV_TEXT (aka TTXT?) as the subtitle format (not PGS or SRT)

Unfortunately, these requirements mean the originals don't play well, because they are MKV files with PGS subtitles. That's where the [Sodalite client](https://github.com/superuser404notfound/Sodalite) comes in. It implements remuxing (repackaging) from MKV to MP4 on the Apple TV, which works without stutter. It also handles drawing the subtitles itself instead of sending them to the video player.

#### To Verify Direct Play

On my Mac, if the video plays well in QuickTime, it also seems to work in the Apple TV player.

When the Apple TV is playing from Jellyfin, you can check for Direct Play in the Jellyfin Admin UI:
- Go to the Jellyfin Web UI on another device
- Click the User Icon in the top right, then Administration
- In the Admin Page, look at the `i` icon next to the client you're playing from


#### Converting Subtitles

The original PGS subtitles on Blurays are bitmaps, but the only format the native player supports is text. You have to extract them, run OCR to convert them to text, and then merge them in to the transcoded video.

##### Extract Subtitles

`ffmpeg -i "$SourceMovie" -map 0:s:0 -c:s copy "$Subtitles.sup"`

##### Convert Subtitles to Text

Open the PGS subtitles (.SUP) in **Subtitle Edit** and OCR will run. Save as `SubRip` (.SRT).
You can bulk convert with Edit > Batch convert...

##### Merge Text Subtitles

```
ffmpeg \
  -i "$TranscodedMovie" \
  -i "$Subtitles.srt" \
  -t $durationSeconds \
  -map 0:v:0 -map 0:a:0 -map 1:0 \
  -c:v copy -tag:v hvc1 \
  -c:a copy \
  -c:s mov_text -metadata:s:s:0 language=eng \
  -movflags +faststart \
  "$OutputMovie.mp4"
```

Apple TV Direct Play required:
- `-t $durationSeconds` for seeking to work correctly.
- `-tag:v hvc1`, otherwise remuxing happens.
- `-metadata:s:s:0 language=eng`, otherwise subtitles can't be turned on.
