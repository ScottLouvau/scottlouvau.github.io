@ECHO OFF
:: Usage: Drag and Drop JPEG images to output scaled versions with metadata removed.

SET Magick="%~dp0bin\magick.exe"
SET jpeg-recompress="%~dp0bin\jpeg-recompress.exe"
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

%Magick% "%In%" -strip -auto-orient -resize 720 "%OutPathAndName%.720p%ext%"
%Magick% "%In%" -strip -auto-orient -resize 720 -quality 85 "%OutPathAndName%.720p-85q%ext%"
%Magick% "%In%" -strip -auto-orient -resize 720 -quality 75 "%OutPathAndName%.720p-75q%ext%"

%Magick% "%In%" -strip -auto-orient -resize 480 "%OutPathAndName%.480p%ext%"
%Magick% "%In%" -strip -auto-orient -resize 480 -quality 85 "%OutPathAndName%.480p-85q%ext%"
%Magick% "%In%" -strip -auto-orient -resize 480 -quality 75 "%OutPathAndName%.480p-75q%ext%"

%Magick% "%In%" -strip -auto-orient -resize 360 "%OutPathAndName%.360p%ext%"
%Magick% "%In%" -strip -auto-orient -resize 360 -quality 85 "%OutPathAndName%.360p-85q%ext%"
%Magick% "%In%" -strip -auto-orient -resize 360 -quality 75 "%OutPathAndName%.360p-75q%ext%"

%Magick% "%In%" -strip -auto-orient -resize 240 "%OutPathAndName%.240p%ext%"
%Magick% "%In%" -strip -auto-orient -resize 240 -quality 85 "%OutPathAndName%.240p-85q%ext%"
%Magick% "%In%" -strip -auto-orient -resize 240 -quality 75 "%OutPathAndName%.240p-75q%ext%"

ECHO Optimizing '%~n1'...

%jpeg-recompress% --strip "%OutPathAndName%%ext%" "%OutPathAndName%.hi%ext%"
%jpeg-recompress% --strip --quality low "%OutPathAndName%%ext%" "%OutPathAndName%.lo%ext%"

%jpeg-recompress% "%OutPathAndName%.720p%ext%" "%OutPathAndName%.720p-hi%ext%"
%jpeg-recompress% --quality low "%OutPathAndName%.720p%ext%" "%OutPathAndName%.720p-lo%ext%"

%jpeg-recompress% "%OutPathAndName%.480p%ext%" "%OutPathAndName%.480p-hi%ext%"
%jpeg-recompress% --quality low "%OutPathAndName%.480p%ext%" "%OutPathAndName%.480p-lo%ext%"

%jpeg-recompress% "%OutPathAndName%.360p%ext%" "%OutPathAndName%.360p-hi%ext%"
%jpeg-recompress% --quality low "%OutPathAndName%.360p%ext%" "%OutPathAndName%.360p-lo%ext%"

%jpeg-recompress% "%OutPathAndName%.240p%ext%" "%OutPathAndName%.240p-hi%ext%"
%jpeg-recompress% --quality low "%OutPathAndName%.240p%ext%" "%OutPathAndName%.240p-lo%ext%"

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

