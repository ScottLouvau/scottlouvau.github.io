@ECHO OFF
:: Usage: Drag and Drop PNGs to output 2x and 4x scaled versions.

SET Magick="%~dp0bin\magick.exe"
SET OutputRoot=%USERPROFILE%\Desktop\ImageOpt

IF "%~1"=="" (
  ECHO Usage: %~n0 [imagePath] [imagePath] ...
  ECHO  Or drag and drop files from Windows Explorer onto this batch file.
  GOTO :eof
)

MD "%OutputRoot%\33pct"

:Start

ECHO Resizing '%~n1'...
%Magick% "%~1" -strip -auto-orient -scale 36%% "%OutputRoot%\33pct\%~n1%~x1"

SHIFT
IF NOT "%~1"=="" GOTO :Start

:Done
ECHO Done. Output at "%OutputRoot%".
explorer "%OutputRoot%\"
