SET ffmpeg="C:\Users\slouv\OneDrive\Tools\bin\Image\ffmpeg\ffmpeg.exe"
SET in="C:\Users\slouv\OneDrive\Console\Games\DOS\Quest for Glory\capture\scidhuv_000.avi"
SET out="%~dp0work-at-stables.apng"

%ffmpeg% -i %in% -vf fps=30 %out%

:: %ffmpeg% -i %in% %out%
:: %ffmpeg% -i %in% -vf fps=30 %out% (bigger?)
