@ECHO OFF
:: Usage: Drag and Drop an image to output scaled versions of it with metadata removed.

SET Magick="C:\Program Files\ImageMagick-7.0.11-Q16-HDRI\magick.exe"
SET jpeg-recompress="C:\Users\slouv\OneDrive\Tools\bin\Image\jpegrecompress\jpeg-recompress.exe"
SET OutputRoot=%USERPROFILE%\Desktop\ImageOpt

IF "%~1"=="" (
  ECHO Usage: %~n0 [imagePath] [imagePath] ...
  ECHO  Or drag and drop files from Windows Explorer onto this batch file.
  GOTO :eof
)

:Start

SET In=%~1
SET OutputFolder=%OutputRoot%\%~n1
SET OutPathAndName=%OutputFolder%\%~n1
SET ext=%~x1
MD "%OutputFolder%"

COPY /Y "%In%" "%OutPathAndName%%ext%"

ECHO Resizing '%~n1'...

@ECHO ON
%Magick% "%In%" -strip -auto-orient -scale 200%% "%OutPathAndName%.2x%ext%"
%Magick% "%In%" -strip -auto-orient -scale 400%% "%OutPathAndName%.4x%ext%"
@ECHO OFF

SHIFT
IF NOT "%~1"=="" GOTO :Start

:Done
ECHO Done. Output at "%OutputRoot%".
explorer "%OutputRoot%\"

: ImageMagick
: ===========
:   Magick [inPath] [options] [outPath]
: 
:   <geometry>         : scale% | scale-x%scale-y% | width | xheight | widthxheight
:   -quality           : reset JPEG compression level
:   -auto-orient       : read EXIF orientation and apply to image.
:   -strip             : remove metadata
:   -resize <geometry> : resize, preserve aspect ratio
:   -scale <percent>   : scale, cloning pixels to retain clean lines
:   -posterize         : reduce colors per channel to reduce size


: Jpeg-Recompress
: ===============
:  jpeg-recompress [options] [inPath] [outPath]
:  
:  --quality <level>   : optimize for preset level of similarity [medium] (low | medium | high | veryhigh)
:  --strip             : remove metadata
:  --min               : set min jpeg quality [40] (1-100)
:  --max               : set max jpeg quality [95] (1-100)
:  --quiet             : only output errors

