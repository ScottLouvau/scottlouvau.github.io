---
title: "Owning My Media with Jellyfin, HandBrake, and H.265"
date: 2026-01-13
---

Last year I started a Bluray collection after watching a [Linus Tech Tips video](https://youtu.be/GdQ5bClEgHg) about it. I'm frustrated about the [rapidly rising cost of streaming services](https://www.cabletv.com/news/streaming-service-price-increases). 

For 4K ad-free service:
- Disney+ (ad-free) went from $7/mo in 2019 to $19/mo in 2026. 
- Netflix went from $12/mo in 2016 to $25/mo in 2026. 

On my "ad-free" subscriptions, sometimes I see ads anyway. I've read horror stories about losing "bought" media if the service cancels your account someday.

I knew I wanted convenience and quality at least as good as streaming. This meant digital copies, easily browseable, that play on my Apple TV. Even though Bluray (non-UHD) discs aren't 4K, the quality looks similar to 4K streaming.

### Learnings

#### Start Small
Start with just [a Bluray drive](https://forum.makemkv.com/forum/viewtopic.php?f=16&t=19634), [MakeMKV ripping software](https://makemkv.com/download), a few Bluray movies, and an old computer to run the [Jellyfin media server](https://jellyfin.org/downloads/server). Make sure ripping works and playback looks as good as you're hoping before you invest more time or money.

#### Get an HDD, Keep the Originals
Ripping Blurays and watching them as-is is easy, and the video looks great - as good as any 4K stream on my TV. Settling on transcoding codecs and settings and getting everything converted is a lot harder.

I bought a 4 TB NVMe drive ($250) originally, planning to transcode and discard the (~30 GB per movie) originals. Six months later, I'm still iterating on my settings and not completely happy. My NVMe drive was 3/4 full, so I got a 22 TB HDD (also $250) to ensure I never have to redo the ripping work. I should've just gotten the HDD to start with.

#### Find a Small Desktop to Host
I initially ran Jellyfin on an old laptop with the NVMe drive, the Bluray drive, and Ethernet as dongles hanging off of it. It's fragile and seemed to lose connection to the dongle devices sometimes. I eventually got a MiniPC, which has been completely reliable. 

A small used desktop with on-board Ethernet and room to fit the Bluray, HDD, and NVMe drive internally would've been ideal. Internally connected devices are reliable. You don't need a recent CPU or GPU to host video; a 2022 or 2020 desktop is enough. I wanted hardware transcoding support, but haven't used it. Software transcoding is much better quality, and everything can play my H264 originals and my H265 transcodes directly anyway.

#### On Playback

**Jellyfin** is a great, free server to host your media.
- Learn and follow Jellyfin's folder and file naming expectations when ripping.
	- ex: media/Movies/Jurassic Park (1993)/Jurassic Park (1993) - H265v3.mkv
	- ex: media/Shows/Adventure Time (2010)/Season 01/Adventure Time (2010) S01E01 - AV1v2.mkv
- `Dashboard > Libraries > Display > Group films into collections` will make your library easier to browse.
- `Dashboard > Users > Viewer > Allow Transcoding = Off` to ensure the copy on the server is playing correctly as-is, not being converted to play.

On **OLED TVs**, stutter (jerky motion sometimes) is a problem.
- Settings > Video > Clarity > Motion Smoothing = Smooth (LG TVs) seems to look best.
- Players need to 'Match Content Framerate' (24 Hz) or otherwise be at Refresh Rate 24 Hz to look as smooth as possible.

**Swiftfin** is a good Jellyfin client for Apple TV.
- To get Framerate Matching, in Settings:
	- Use Native Player = On
	- Use fmp4 with HLS = On
	- Force Direct Play = On

#### On Transcoding

**H.265** is my preferred video codec.
 - All of my devices (iPad 9th, iPhone 13, Apple TV 4K, and newer) support hardware decoding for it.
 - The encoder is mature, running quickly and getting good quality even for challenging scenes.
 - AV1 looks promising, but my devices can't all play it, I struggle to get good quality in dark scenes, and with quality settings high, it's barely smaller than my H265 copies.

**E-AC3** (Dolby Digital Plus) is my preferred audio codec.
- It supports surround sound (5.1 for me, but also 7.1).
- It is supported on all of my devices.
- It's much smaller than AC3 (384 kbps for excellent 5.1 audio, vs. 640 kbps AC3)
- Don't waste space including also Stereo AAC. My devices can all play E-AC3 5.1, even ones with only two speakers.
- Audio can be big. 640 kbps AC3 is 575 MB for two hours - small in a 30 GB Bluray, huge in a 2-3 GB compact transcode.
- Stereo AAC 128 kbps is excellent and compact for "portable" files for watching on iPads or phones on the go.

**MKV** as the container file format.
- Needed to support subtitles that are not 'burned-in' (always on).
- Seems to work with Apple TV and Swiftfin with the 'Native Player' and Framerate Matching, even though the docs say it shouldn't.

**Script** your transcoding.
- You will iterate often on settings. Automate it so it's easy to update your whole library.
- Use [HandBrake](https://handbrake.fr/downloads.php) and [HandBrakeCLI](https://handbrake.fr/docs/en/latest/cli/cli-options.html).
	- The defaults and built-in presets are good.
	- It's easy to find and play with settings in the user interface.
	- You can make a custom preset, export it as JSON, and then script an identical transcode with the HandBrakeCLI.
	- It's easy to get the latest version of HandBrake on Ubuntu (or MacOS, or Windows)
		- New AV1 encoding libraries were much, much faster than old ones.
	- FFMPEG is often recommended, but...
		- It’s hard to find arguments, get them right, and combine them successfully for different encoding options.
		- It's hard to get recent builds with recent libraries on Ubuntu LTS without breaking stuff.
- Here's my [current transcode-incremental bash script](files/transcode-incremental).

**Test** your transcoding first.
- It is so, so much faster to transcode a 10 minute clip than a whole movie.
- You need short snippets (10-30 seconds) played back-to-back to compare audio and video.
- For video, frame screenshots are even better (but will make you more picky than you are when watching a moving video).
- Once you see settings you like, objective measures are great for ensuring other content is similar. 
	- **VMAF** seems to correspond well to my assessment of how movies look.

On **Settings**, right now I'm using [5SE3v3.json](files/5SE3v3.json):
- Video: H.265, CR 20, Preset Slow. No cropping. SDR (8-bit color). 
- Audio: E-AC3 5.1 channel, 384 kbps. No second stereo stream.
- Subtitles: 'Foreign Audio Search' on, and copy all subtitle tracks.
- VMAF ~95, and movies are around 4.5 GB (3-6 GB) transcoded.

Portable/Travel Settings:
- Video: H.265, CR25, Preset Slow. 
	- CR 25 is around half the size of CR20
	- CR 27 also interesting. ~20% smaller than CR25, VMAF ~90.
- Audio: AAC Stereo 128 kbps.
- Subtitles only for your language.
- VMAF ~92, movies 1-2 GB transcoded.

#### On Buying Media
- Make a list of favorites you want to find and movies and shows you'd like to watch soon.
- Blurays (1080p) are much cheaper than UHD Blurays (4K), are smaller, and still look excellent on my TV.
- Collections are much cheaper per movie. (Terminator 1-6 for $15 from Amazon)
- eBay "Choose Your Own Lots", Goodwill stores, and Half Price Books are good sources.
- Amazon collections on sale are sometimes surprisingly cheap.


### Conclusions
I wish I could say that my "Own Media" setup has perfect playback, my transcoding settings are settled, and my library is complete, but I'm still learning a lot. I'm still tweaking to see perfectly smooth playback like I do from the physical discs in a drive. Video transcoding is much more complicated than music, which I converted to MP3 ages ago and haven't thought about since.

Still, I'm pleased overall. I'm happy to have many movies and shows that I know I'll always be able to watch. No subscriptions to pay. No ads. Offline copies that never expire. I have the space to start my own photo and file backups and expand into other projects.


### Cheat Sheet

My Stack:
- [A compatible Bluray Drive](https://forum.makemkv.com/forum/viewtopic.php?f=16&t=19634)
- [MakeMKV, for ripping](https://makemkv.com/download)
- [HandBrake, for transcoding](https://handbrake.fr/downloads.php)
- [Jellyfin, media server](https://jellyfin.org/downloads/server)
- [Swiftfin, client app for Apple TV](https://apps.apple.com/us/app/swiftfin/id1604098728)
- [VLC, player for other OSes](https://www.videolan.org/vlc/)

- My [HandBrakeCLI JSON Preset](files/5SE3v3.json)
- My [transcode-incremental bash script](files/transcode-incremental)

```
# HandBrakeCLI: Transcode using a JSON Preset File
## Progress output is on stderr, so redirecting other output provides progress only.
HandBrakeCLI 
	--preset-import-file "$handBrakePresetJsonFilePath" -Z "$handBrakePresetName" \
	--quality $quality --encoder-preset $preset \
	-i "$inFilePath" -o "$outFilePath" \
	&> "$outdir/CR$quality P$preset.log"

# FFMPEG: Compute VMAF Score of clip
## NOTE: outFilePath must be first to compute correctly.
## `-r 24` and `setpts` to compare the same frames consistently.
## `-an -sn` to exclude audio and subtitles (a bit faster?).
## n_threads=12 to parallelize.
## n_subsample=6 to check every 6th frame (~4 per sec, ~2x faster)
## log_fmt=csv:log_path=... to log VMAF of each analyzed frame
##   Can plot and check for minimums to compare screenshots.
ffmpeg 
	-r 24 -i "$outFilePath" -r 24 -i "$inFilePath" \
	-an -sn -map 0:V -map 1:V \
	-lavfi "[0:v]setpts=PTS-STARTPTS[dist];[1:v]setpts=PTS-STARTPTS[ref];[dist][ref]libvmaf=n_threads=12:n_subsample=6:log_fmt=csv:log_path=$vmafLogFolderPath/$fileName.csv"" \
	-f null - &> "$outdir/VMAF CR$quality P$preset.log"

# FFMPEG: Extract Clip for Testing
## `-ss` is start time (00:05:00 is five minutes after video start)
## `-to` is end time (15m after start; 10m clip)
ffmpeg -ss 00:05:00 -to 00:15:00 -i "$inFilePath" -c:s copy -c copy "$outClipPath"

# FFMPEG: Extract frame screenshot by exact 0-based frame number (slow)
## NOTE: JPG shows details that PNG didn't have
## setpts needed to align frame numbers if transcode is repeating unchanging frames.
## -qscale:v 2 to request very high quality image (need screenshot not to be compressed again)
## -vframes 1 to get one frame; `-vframes 24 Frame_%04d.jpg` to get 24 frame images.
ffmpeg -i "$inFilePath$" \
	-vf "format=yuv420p,setpts=PTS-STARTPTS,select=eq(n\,$frameNumber)" \
	-qscale:v 2 -vframes 1 $outScreenShotPath.jpg

# FFMPEG: Extract frame screenshot by seconds into video (fast, may be inexact)
## -ss must be *before* -i to seek quickly.
## $secondsIntoClipFloat is $frameNumber / 23.976. (ex: 132822 / 23.975 = 5529.7897)
ffmpeg -ss $secondsIntoClipFloat -i "$inFilePath$" \
	-vf "format=yuv420p" 
	-qscale:v 2 -vframes 1 $outScreenShotPath.jpg
```