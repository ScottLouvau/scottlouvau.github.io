@ECHO OFF
:: Usage: Drag and Drop an image to output scaled versions of it with metadata removed.

SET Magick="C:\Program Files\ImageMagick-7.0.11-Q16-HDRI\magick.exe"
SET jpeg-recompress="C:\Users\slouv\OneDrive\Tools\bin\Image\jpegrecompress\jpeg-recompress.exe"
SET OutputRoot=%USERPROFILE%\Desktop\ImageOpt

IF "%1"=="" (
  ECHO Usage: %~n0 [imagePath] [imagePath] ...
  ECHO  Or drag and drop files from Windows Explorer onto this batch file.
  GOTO :eof
)

:Start

SET OutputFolder=%OutputRoot%\%~n1
SET OutPathAndName=%OutputFolder%\%~n1
MD "%OutputFolder%"

COPY /Y "%1" "%OutPathAndName%.jpg"

ECHO Resizing '%~n1'...

%Magick% "%1" -strip -auto-orient -resize 720 "%OutPathAndName%.720p.jpg"
%Magick% "%1" -strip -auto-orient -resize 720 -quality 85 "%OutPathAndName%.720p-85q.jpg"
%Magick% "%1" -strip -auto-orient -resize 720 -quality 75 "%OutPathAndName%.720p-75q.jpg"

%Magick% "%1" -strip -auto-orient -resize 480 "%OutPathAndName%.480p.jpg"
%Magick% "%1" -strip -auto-orient -resize 480 -quality 85 "%OutPathAndName%.480p-85q.jpg"
%Magick% "%1" -strip -auto-orient -resize 480 -quality 75 "%OutPathAndName%.480p-75q.jpg"

%Magick% "%1" -strip -auto-orient -resize 360 "%OutPathAndName%.360p.jpg"
%Magick% "%1" -strip -auto-orient -resize 360 -quality 85 "%OutPathAndName%.360p-85q.jpg"
%Magick% "%1" -strip -auto-orient -resize 360 -quality 75 "%OutPathAndName%.360p-75q.jpg"

%Magick% "%1" -strip -auto-orient -resize 240 "%OutPathAndName%.240p.jpg"
%Magick% "%1" -strip -auto-orient -resize 240 -quality 85 "%OutPathAndName%.240p-85q.jpg"
%Magick% "%1" -strip -auto-orient -resize 240 -quality 75 "%OutPathAndName%.240p-75q.jpg"

ECHO Optimizing '%~n1'...

%jpeg-recompress% --strip "%OutPathAndName%.jpg" "%OutPathAndName%.hi.jpg"
%jpeg-recompress% --strip --quality low "%OutPathAndName%.jpg" "%OutPathAndName%.lo.jpg"

%jpeg-recompress% "%OutPathAndName%.720p.jpg" "%OutPathAndName%.720p-hi.jpg"
%jpeg-recompress% --quality low "%OutPathAndName%.720p.jpg" "%OutPathAndName%.720p-lo.jpg"

%jpeg-recompress% "%OutPathAndName%.480p.jpg" "%OutPathAndName%.480p-hi.jpg"
%jpeg-recompress% --quality low "%OutPathAndName%.480p.jpg" "%OutPathAndName%.480p-lo.jpg"

%jpeg-recompress% "%OutPathAndName%.360p.jpg" "%OutPathAndName%.360p-hi.jpg"
%jpeg-recompress% --quality low "%OutPathAndName%.360p.jpg" "%OutPathAndName%.360p-lo.jpg"

%jpeg-recompress% "%OutPathAndName%.240p.jpg" "%OutPathAndName%.240p-hi.jpg"
%jpeg-recompress% --quality low "%OutPathAndName%.240p.jpg" "%OutPathAndName%.240p-lo.jpg"

SHIFT
IF NOT "%1"=="" GOTO :Start

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
:   -resize <geometry> : resize, preserve aspect ratio)
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
