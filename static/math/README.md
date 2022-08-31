
'MPG Air Horn' from http://www.freesoundslibrary.com
Transcoding: ffmpeg -i mlg-air-horn.mp3 -c:a mp3 -b:a 96k -ac 1 -t 00:00:03 

ffmpeg -i applause-sound-effect.mp3 -c:a mp3 -b:a 96k -ac 1 -t 00:00:10 -af "afade=t=out:st=5:d=5" applause-sound-effect.96k.mp3