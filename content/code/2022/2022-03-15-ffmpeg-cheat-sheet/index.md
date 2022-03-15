---
title: "FFMPEG Cheat Sheet"
date: 2022-03-15
---

I've been using FFMPEG to transcode gaming videos often lately, and I find the [reference documentation](https://ffmpeg.org/ffmpeg-all.html) confusing.

## Cheat Sheet

#### Transcode for Blog

Transcode to H.264 quality 24 and mono 96 kbps AAC audio.

```
%ffmpeg% -i "%in%" -y -c:a aac -b:a 96k -ac 1 -c:v libx264 -crf 24 "%out%"
```

#### Extract Audio as 128 kbps MP3
```
%ffmpeg% -ss %startTime% -i "%in%" -t %duration% -b:a 128k -y -vn "%out%.mp3"
```

#### Extract Video Frames to PNG

```
%ffmpeg% -ss %startTime% -i "%in%" -t %duration% -vf "fps=%fps%" -vsync vfr -f image2 -y "%outDir%\F%%03d.png"
```

#### Encode at 2x Speed
```
%ffmpeg% -i "%in%" -y -filter_complex "[0:v]setpts=0.5*PTS[v];[0:a]atempo=2.0[a]" -map "[v]" -map "[a]" "%out%"
```

#### Extremely Tiny (720p, Q30, no audio, 2x speed, 0.5 fps)
```
%ffmpeg% -i "%in%" -y -an -preset veryfast -crf 30 -filter_complex "[0:v]setpts=0.5*PTS[v]" -map "[v]" -r 1/2 -s 1280x720 "%out%"
```

#### Add Time Overlay

Encode with the elapsed time shown as 24pt white Arial in mm:ss.ff format in a black box at the top right.

```
%ffmpeg% -i "%in%" -filter_complex "drawtext=x=(w-text_w-5): y=5: fontfile=arial.ttf: fontcolor=white: fontsize=24: text='%%{pts\:gmtime\:0\:%%M\\\:%%S}.%%{eif\:100*t-100*trunc(t)\:d\:2}': box=1: boxcolor=black@0.90: boxborderw=5" -c:a copy -c:v libx264 -crf 24 -y "%out%"
```



You can write expressions for X and Y and refer to the measured text and overall video width and height (w-text_w-5).

Use `%{pts\:gmtime\:0\:%M\\\:%S}` to show elapsed time (pts) using the gmtime formatting with "mm:ss" format.

Use `%{eif\:100*t-100*trunc(t)\d:\:2}` to show elapsed time (t) as an integer (eif) with just hundredths of a second, padded to two digits.

## Argument Quick Reference

| Argument       | Explanation                                    |
| -------------- | ---------------------------------------------- |
| -i [filePath]  | Input File Path                                |
| [outFilePath]  | Output File Path (last argument)               |
| -ss 00:01:30.5 | Start Time [put **before -i**]                 |
| -t 00:30:00    | Duration to Transcode [hh:mm:ss.ffff]          |
| -y             | Overwrite output if already present            |
| -c:a copy      | Audio: Copy to output as-is                    |
| -c:a aac       | Audio: Encode as AAC (or: mp3, opus)           |
| -b:a 96k       | Audio: Encode at 96 kbps                       |
| -ac 1          | Audio: Downmix to one channel (mono)           |
| -an            | Audio: Remove audio entirely                   |
| -c:v libx264   | Video: Encode as H.264                         |
| -crf 24        | Video: Quality to 24 (lower is better)         |
| -s 1280x720    | Video: Scale to 1280x720                       |
| -r 5           | Video: Framerate to 5 fps. ('1/5' for 0.2 fps) |
| -vn            | Video: Remove video entirely                   |

## Codecs and Quality

Experiments on a nine minute 1080p recording of Kingdom Rush using Xbox Game Bar, which was originally **500 MB**.
Every 128 kbps (for video plus audio) is 960 KB per minute.

| Video Q (h.264) | Perception | Video kbps | Out Size |
| --------------- | ---------- | ---------- | -------- |
| 22              | Excellent  | 1,135      | 75 MB    |
| 24              | Great      | 820        | 54 MB    |
| 27              | Good       | 600        | 40 MB    |
| 30              | OK         | 450        | 30 MB    |
| 32              | Bad        | 350        | 23 MB    |

| Audio kbps   | Codec | Perception                     | Out Size |
| ------------ | ----- | ------------------------------ | -------- |
| 128 (stereo) | AAC   | Excellent                      | 8.4 MB   |
| 96 (mono)    | AAC   | Excellent                      | 6.3 MB   |
| 64 (mono)    | AAC   | Fine                           | 4.2 MB   |
| 48 (mono)    | AAC   | Bad                            | 3.2 MB   |
| 96 (stereo)  | Opus  | Excellent                      | 6.3 MB   |
| 64 (stereo)  | Opus  | Great                          | 4.2 MB   |
| 48 (stereo)  | Opus  | Fine (detectable)              | 3.2 MB   |
| 32 (stereo)  | Opus  | Stereo 'Full Band' lower limit | 2.1 MB   |
| 24 (mono)    | Opus  | Speech ok, music weird         | 1.6 MB   |
| 192 (stereo) | MP3   | Excellent                      | 12.6 MB  |
| 128 (stereo) | MP3   | Fine                           | 8.4 MB   |
| 96 (mono)    | MP3   | Fine                           | 6.3 MB   |

MP3 is fine down to 128 kbps stereo, 96 kbps mono. AAC is fine down to 96 kbps stereo, 64 kbps mono. Opus is fine down to 64 kbps stereo, ~48 kbps mono, ~24 kbps mono speech only. Quality seems to drop quickly below those thresholds. Opus isn't supported everywhere, but AAC is.

[Spotify](https://support.spotify.com/us/article/audio-quality/) defaults are 128 kbps AAC (Web) or 96 kbps (Mobile, "Normal" quality).

At lower video quality (Q30), 1080p is 450 kbps and 720p is 260 kbps. At those rates, 128 kbps audio becomes big, so encoding to 96 kbps or 64 kbps mono is important to file size.