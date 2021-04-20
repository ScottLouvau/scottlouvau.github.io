These are batch scripts for optimizing images, mainly for posting to this blog.

Other Operations
================
 - Strip all metadata
     magick [in] -strip [out]
     exiftool -all= [in] -o [out]

 - Strip metadata except Dates, GPS, Orientation (~1KB)
     exiftool -all= -tagsfromfile @ -gps:all -alldates -Orientation [in] -o [out]

 - Scale for thumbnails
     480p is small [~5%] but has enough detail to view fullscreen without being awful.     
     magick [in] -strip -resize 480 -auto-orient -quality 80 [out]
     NOTE: Rather than 'strip', trim metadata with exiftool first to preserve Date Taken and GPS on thumbnail copies.