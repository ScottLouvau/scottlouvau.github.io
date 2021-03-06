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
