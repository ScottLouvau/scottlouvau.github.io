@ECHO OFF
:: Usage: Drag and Drop an image to output scaled versions of it with metadata removed.

SET pngquant="C:\Users\slouv\OneDrive\Tools\bin\Image\pngquant\pngquant.exe"
SET OutputRoot=%USERPROFILE%\Desktop\ImageOpt

IF "%~1"=="" (
  ECHO Usage: %~n0 [imagePath] [imagePath] ...
  ECHO  Or drag and drop files from Windows Explorer onto this batch file.
  GOTO :eof
)

:Start

SET In=%~1
SET OutputFolder=%OutputRoot%\PngQuant
SET OutPathAndName=%OutputFolder%\%~n1
SET ext=%~x1
MD "%OutputFolder%"

%pngquant% "%In%" --speed 1 --skip-if-larger --o "%OutPathAndName%%ext%"

SHIFT
IF NOT "%~1"=="" GOTO :Start

:Done
ECHO Done. Output at "%OutputRoot%".
explorer "%OutputRoot%\"