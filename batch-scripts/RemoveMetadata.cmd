@ECHO OFF
:: Usage: Remove metadata from images *in-place*.

SET exiftool="%~dp0bin\exiftool.exe"
SET OutputRoot=%USERPROFILE%\Desktop\ImageOpt

IF "%~1"=="" (
  ECHO Usage: %~n0 [folderPath]
  GOTO :eof
)

%exiftool% -r -all= -tagsfromfile @ -Orientation "%~1" -overwrite_original