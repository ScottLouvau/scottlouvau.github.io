---
title: "Photo Optimization"
date: 2021-05-28
---

I recently decided to make a local and second-cloud backup of our digital photos, and decided to see if I could optimize them in the process. I figured our phones would produce decently optimized JPG photos directly, but it turns out that a quick pass with an optimization tool reduced the sizes by half with no difference that I could perceive.

I researched different tools (TinyPNG.com, TinyJPG.com, ImageMagick, PNGQuant), but it was important to me that the tool wouldn't compress the photos too much, and I have too many photos to review the outputs manually. I finally found [jpeg-recompress](https://github.com/danielgtaylor/jpeg-archive), which saves at multiple quality levels and runs a "human-perceived difference" algorithm to measure the perceived loss. It fits the bill perfectly. I couldn't get it to build, and there wasn't a built Windows executable handy, but [another repo](https://github.com/imagemin/jpeg-recompress-bin) has [published releases](https://github.com/imagemin/jpeg-recompress-bin/releases) (under vendor/win), or get it [here](files/jpeg-recompress-bin-5.1.1.zip) (MIT license).

For archive quality, run jpeg-recompress with the default settings. You also want to run it in parallel across multiple threads, and it's worth trimming unwanted metadata from your images. In my case, I want GPS locations and Date Taken, but none of the camera details (exposure time, ISO setting, camera model name). Metadata for my images was 60 KB per image. For my 70,000 images, that's 4 GB of data I don't want.

I wrote a C# script to handle the threading; rather than publishing as an EXE, this makes it easy for others to alter the behavior and see what it's doing. To run it, install [dotnet-script](https://github.com/filipw/dotnet-script), download [my photo-optimizer zip](files/photo-optimizer.zip), open a command prompt, go to the photo-optimizer folder, and run:

```
dotnet-script main.csx "[InputRootPath]" "[OutputRootPath]"
```

How did it do? Overall, my photos were compressed from 212 GB to 114 GB, a 46% reduction. If you have unlimited cloud storage, this may not matter, but if you want to copy from cloud-to-cloud, download a local backup, or otherwise work with your images, it's a nice savings without any clear downside.

Here are two example images before and after optimization:

<style>
 @keyframes first  { 0% { opacity: 1; } 49% { opacity: 1; } 50% { opacity: 0; } 100% { opacity: 0; } }
 @keyframes second { 0% { opacity: 0; } 48% { opacity: 0; } 49% { opacity: 1; } 100% { opacity: 1; } }

 .alternate-container { margin: 1em 0em; display: grid; grid-template-columns: 1fr; }
 .alternate-container div { grid-row-start: 1; grid-column-start: 1; }
 .alternate-container div:nth-child(1) { animation: first 2s infinite; }
 .alternate-container div:nth-child(2) { animation: second 2s infinite; }
</style>

<div class="alternate-container">
    <div>
        Original [1,394 KB]
        <img src="https://github.com/ScottLouvau/scottlouvau.github.io/raw/main/content/code/2021/2021-05-28-photo-optimization/img/original/desk.jpg" />
    </div>
    <div>
        Optimized [804 KB]
        <img src="https://github.com/ScottLouvau/scottlouvau.github.io/raw/main/content/code/2021/2021-05-28-photo-optimization/img/optimized/desk.jpg" />
    </div>
</div>

<div class="alternate-container">
    <div>
        Original [1,314 KB]
        <img src="https://github.com/ScottLouvau/scottlouvau.github.io/raw/main/content/code/2021/2021-05-28-photo-optimization/img/original/landscape.jpg" />
    </div>
    <div>
        Optimized [747 KB]
        <img src="https://github.com/ScottLouvau/scottlouvau.github.io/raw/main/content/code/2021/2021-05-28-photo-optimization/img/optimized/landscape.jpg" />
    </div>
</div>

You can [download the sample images](files/img.zip) if you want to compare them offline.

And the code:

```c#
#! "netcoreapp2.0"
#r "nuget: CliWrap, 3.3.2"

// Copyright Scott Louvau, 2021, MIT License
using System.Threading;
using CliWrap;

const double MB = 1024 * 1024;
const double KeepBelowRelativeSize = 0.9;

const string jpegRecompress = @"jpeg-recompress.exe";
const string exifTool = @"exiftool.exe";

if (Args.Count == 0)
{
    Console.WriteLine("Usage: photo-optimize [inputRootFolder] [outputRootFolder?]");
    return;
}

string inRootPath = Path.GetFullPath(Args[0]);
string outRootPath = Path.GetFullPath((Args.Count > 1 ? Args[1] : Path.Combine(inRootPath, "../Out")));

Stopwatch w = Stopwatch.StartNew();
Console.WriteLine($"Optimizing JPGs under '{inRootPath}' into '{outRootPath}'...");

string[] inputFiles = Directory.GetFiles(inRootPath, "*.jpg", SearchOption.AllDirectories);

long inBytesTotal = 0;
long outBytesTotal = 0;

Parallel.ForEach(inputFiles, (inFilePath) => 
{
    string pathWithinRoot = inFilePath.Substring(inRootPath.Length + 1);
    string outFilePath = Path.Combine(outRootPath, pathWithinRoot);
    Directory.CreateDirectory(Path.GetDirectoryName(outFilePath));

    Cli.Wrap(jpegRecompress).WithArguments(new[] { inFilePath, outFilePath }).ExecuteAsync().Task.Wait();

    long inSizeBytes = new FileInfo(inFilePath).Length;
    long outSizeBytes = new FileInfo(outFilePath).Length;
    double sizeRatio = (double)outSizeBytes / (double)inSizeBytes;

    if (sizeRatio > KeepBelowRelativeSize)
    {
        File.Copy(inFilePath, outFilePath, true);
    }

    outSizeBytes = new FileInfo(outFilePath).Length;
    Console.WriteLine($"{pathWithinRoot}: {inSizeBytes / MB:n2} MB -> {outSizeBytes / MB:n2} MB ({sizeRatio:p0})");

    Interlocked.Add(ref inBytesTotal, inSizeBytes);
    Interlocked.Add(ref outBytesTotal, outSizeBytes);
});

Console.WriteLine();
Console.WriteLine("Removing metadata...");
Cli.Wrap(exifTool).WithArguments($@"-all= -tagsfromfile @ -gps:all -alldates -Orientation -r ""{outRootPath}"" -overwrite_original").ExecuteAsync().Task.Wait();

Console.WriteLine();
Console.WriteLine($"Done. Optimized {inputFiles.Length:n0} images ({inBytesTotal / MB:n0} MB -> {outBytesTotal / MB:n0} MB) in {w.Elapsed.TotalSeconds:n0} seconds.");

```

