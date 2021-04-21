#! "netcoreapp2.0"
#r "nuget: CliWrap, 3.3.2"

using System.Threading;
using CliWrap;

const double MB = 1024 * 1024;
const double KeepBelowRelativeSize = 0.9;

const string jpegRecompress = @"C:\Code\blog\batch-scripts\bin\jpeg-recompress.exe";
const string magick = @"C:\Code\blog\batch-scripts\bin\magick.exe";
const string exifTool = @"C:\Code\blog\batch-scripts\bin\exiftool.exe";

string inRootPath = Path.GetFullPath((Args.Count > 0 ? Args[0] : @"C:\Download\Photos\Original"));
string outRootPath = Path.GetFullPath((Args.Count > 1 ? Args[1] : Path.Combine(inRootPath, "../Out")));
int threadCount = (Args.Count > 2 ? int.Parse(Args[2]) : Environment.ProcessorCount);

Stopwatch w = Stopwatch.StartNew();
Console.WriteLine($"Optimizing JPGs under '{inRootPath}' into '{outRootPath}'...");

string[] inputFiles = Directory.GetFiles(inRootPath, "*.jpg", SearchOption.AllDirectories);
ParallelOptions po = new ParallelOptions() { MaxDegreeOfParallelism = threadCount };

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

    Cli.Wrap(exifTool).WithArguments($@"-all= -tagsfromfile @ -gps:all -alldates -Orientation ""{outFilePath}"" -overwrite_original").ExecuteAsync().Task.Wait();
    outSizeBytes = new FileInfo(outFilePath).Length;
    Console.WriteLine($"{pathWithinRoot}: {inSizeBytes / MB:n2} MB -> {outSizeBytes / MB:n2} MB ({sizeRatio:p0})");

    Interlocked.Add(ref inBytesTotal, inSizeBytes);
    Interlocked.Add(ref outBytesTotal, outSizeBytes);
});

Console.WriteLine();
Console.WriteLine($"Done. Optimized {inputFiles.Length:n0} images ({inBytesTotal / MB:n0} MB -> {outBytesTotal / MB:n0} MB) in {w.Elapsed.TotalSeconds:n0} seconds.");
