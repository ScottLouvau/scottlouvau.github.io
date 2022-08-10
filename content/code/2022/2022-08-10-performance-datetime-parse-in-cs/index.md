---
title: "Performance Tuning: Parse 50M DateTimes per second in C#"
date: 2022-08-10
---

I love the Visual Studio C# Performance Profiler, and am shocked to find out how many engineers around me haven't used it before. It's very easy to quickly check the performance of your code and you'd be amazed how often there are significant performance bottlenecks there that are very easy to fix.

Check out "[How to Optimize Existing Code]({{< relref "../2022-08-10-optimize-existing-code" >}})" for an overview of the process, or keep reading to walk through an example with me.

## The Scenario

Your code processes files that contain large numbers of events in a simple text format. Each line starts with a DateTime ("2022-04-14T02:32:53.4028225Z"). The files can be very large - as many as 100 million events - so that the system doesn't have too many files to pass around and manage. You want to count the number of events in different time ranges and quickly find specific events in a time range.

To focus on DateTime parsing as our sole performance problem, we'll work with files with *just* DateTimes in them, instead of the real log files. I'll talk more about that at the end.

## Initial Code

You start with the most common C# APIs for File Operations and Date Parsing - File.OpenText, StreamReader.ReadLine, DateTime.Parse. The DateTimes are converted to the local time zone by DateTime.Parse, which you don't want, so you convert them back with DateTime.ToUniversalTime().

```c#
using (StreamReader r = File.OpenText(filePath))
{
    List<DateTime> results = new List<DateTime>();

    while (true)
    {
        string? line = r.ReadLine();
        if (line == null) { break; }

        DateTime value = DateTime.Parse(line).ToUniversalTime();
        results.Add(value);
    }

    return results;
}
```

You run this on a sample log with 100 million DateTimes, and it takes **69 seconds**. This isn't terrible, but you would like to be able to go through a file in just a second or two if possible. Could that be achieved?

You make a scaled sample of **10 million DateTimes**, which takes 6.9 seconds (6.901 milliseconds) to parse, and run it under the Performance Profiler in Visual Studio (including the free Community Edition). 

If our goal for 100 million DateTimes is two seconds, we would need to parse 10 million in **200 ms**. This means our runtime is currently more than 30x slower than our goal, which might seem very difficult to achieve. Let's see what we can do.

## Profiler Setup

When profiling C#, your runtime will often be spent (ultimately) down in .NET Framework APIs, so you'll want to know what they are doing. To make this easier, set some Tools -> Options to help:

* Turn on **Debugging -> General -> Enable .NET Framework Stepping**
* Turn off **Debugging -> General -> Enable Just My Code**
* Turn on **Debugging -> Symbols -> Microsoft Symbol Servers**

Next, invoke the Profiler from Debug -> Performance Profiler.

![Performance-Profiler-Menu](img/Performance-Profiler-Menu.png)

Make sure the target it set to your **Console App Project** and **CPU Usage** is enabled, then click Run. For future iterations, select **Debug -> Relaunch Performance Profiler** to re-run immediately.

![Performance-Profiling](img/Performance-Profiling.png)

I'm running on .NET 6.0 on Windows 11 on a 2020 Lenovo IdeaPad Flex 5 (Ryzen 7 4700U, 16 GB RAM) if you'd like to put these results in context.

So, what does the initial code profile look like?

## Initial Code Profile

![Initial-Profile](img/Initial-Profile.png)

On the **Hot Path** at the bottom, you can see Program.Original (with my test code) is 98% of the runtime. This means my data isn't muddled by things happening before or after what I want to measure.

The Hot Path also shows 60% of the runtime is in DateTime.TryParse and another 21% is in ConvertTime (probably what ToUniversalTime calls). This means I could likely get a lot of speedup by finding a faster way to do the parse, and especially if I could skip the conversion to local time and then back.

## Different DateTime.Parse arguments

First, we can pass a DateTimeStyle argument to ask .NET to keep the DateTime as Universal - DateTimeStyles.AdjustToUniversal. Does that help?

```c#
using (StreamReader r = File.OpenText(filePath))
{
    List<DateTime> results = new List<DateTime>();

    while (true)
    {
        string? line = r.ReadLine();
        if (line == null) { break; }

        DateTime value = DateTime.Parse(line, CultureInfo.InvariantCulture, DateTimeStyles.AdjustToUniversal);
        results.Add(value);
    }

    return results;
}
```

The runtime goes down from **6,901 ms** to **3,704 ms**, about twice as fast, for a very safe change. This is a good example of a very simple change providing a substantial gain, which is quite common.

## DateTime.ParseExact?

How about if we use DateTime.ParseExact to tell .NET exactly what format to expect? In this case, we're adding a new condition - we will require the DateTimes in the log to be in a specific format, rather than any format that DateTime.Parse accepts. Our logs always have DateTimes like 2022-04-14T02:32:53.4028225Z, so we decide this is a safe restriction.

```c#
using (StreamReader r = File.OpenText(filePath))
{
    List<DateTime> results = new List<DateTime>();

    while (true)
    {
        string? line = r.ReadLine();
        if (line == null) { break; }

        // Fast [~2,550 ms], but returns adjusted to DateTimeKind.Local. Adding DateTimeStyles.AdjustToUniversal makes it much slower [~5,875 ms].
        DateTime value = DateTime.ParseExact(line, "O", CultureInfo.InvariantCulture);//, DateTimeStyles.AdjustToUniversal);

        results.Add(value);
    }

    return results;
}
```

Here we get something interesting. DateTime.ParseExact is faster - **3,704 ms** to **2,866 ms** - but only **without** the AdjustToUniversal flag. While DateTime.Parse was faster with the flag, DateTime.ParseExact is slower. I stepped into the code and found out why. The code has a "fast path" for the "O" format, but only when the flags are DateTimeStyles.None.

Assuming we really want the DateTimes as UTC in code, this isn't going to work. Note that if we're just looking for DateTimes in a range, it would - we could just convert the range edges to local time.

## DateTimeOffset?

.NET also introduced a newer type called DateTimeOffset, which explicitly encodes the time zone. It's larger (16 bytes instead of 8 bytes per value) but maybe the parsing methods were more recently written and more heavily tuned. Let's try.

```c#
using (StreamReader r = File.OpenText(filePath))
{
    List<DateTime> results = new List<DateTime>();

    while (true)
    {
        string? line = r.ReadLine();
        if (line == null) { break; }

        // ~3,500
        //DateTimeOffset value = DateTimeOffset.Parse(line);

        // ~1,400
        DateTimeOffset value = DateTimeOffset.ParseExact(line, "O", CultureInfo.InvariantCulture);
        results.Add(value.UtcDateTime);
    }

    return results;
}
```

The default DateTimeOffset.Parse overload is a bit slower than DateTime.Parse with the flag, but DateTimeOffset.ParseExact is the fastest thing we've seen yet with a nearly zero cost conversion to UTC. We're down from **2,866 ms** to **1,492 ms**, doubling our performance again! Excellent.

Now we decide to profile again to see what the bottlenecks look like with this change.

![Profile-Offset](img/Profile-Offset.png)

In this variation, DateTimeOffset.ParseExact and StreamReader.ReadLine now consume about equal time. This means probably can't get under about 700 ms no matter how fast the DateTime parsing gets.

In .NET, when you read a file and split it into parts, you have to create a new string (and a new copy in memory) for each part. Could we avoid this?

## Span<char>

In fact, we can. .NET introduced the Span<T> type early in .NET Core to help. Span can refer to a whole array or a slice of an array, without needing a new copy. In the case of our file, this means we could read in a whole block of a file and then operate on little slices of it without having to make copies. Span is also a struct, not an object, so Span itself also doesn't require allocation.

In this pass I'm going to try a few more improvements. I know that each DateTime is 28 characters long, and my files have two bytes for Windows-style newlines, for a total of 30 bytes for each DateTime.

Therefore, instead of looking for newlines, I'll read a block from the file and look at each 30 byte chunk, interpreting it as a DateTime. **Note that** again, I'm adding a new requirement - the DateTimes must always be exaclty 28 bytes long (no writing only whole seconds or milliseconds) and the lines but have two byte delimiters (\r\n). I need to check these new requirements to ensure they're ok to assume.

Here's the code I end up with:

```c#
using (StreamReader r = File.OpenText(filePath))
{
    int count = (int)((r.BaseStream.Length - r.BaseStream.Position) / 30);
    List<DateTime> results = new List<DateTime>(count);
    Span<char> buffer = new Span<char>(new char[30 * 1024]);

    while (!r.EndOfStream)
    {
        int lengthRead = r.Read(buffer);
        Span<char> block = buffer.Slice(0, lengthRead);

        while (block.Length > 0)
        {
            Span<char> valueText = block.Slice(0, 28);
            DateTimeOffset value = DateTimeOffset.ParseExact(valueText, "O", CultureInfo.InvariantCulture);
            results.Add(value.UtcDateTime);
            block = block.Slice(30);
        }
    }

    return results;
}
```

The runtime drops from **1,492 ms** to **878 ms**, which is now **7.8x faster than the original code**. How does the runtime split between File I/O and parsing now? The "Hot Path" didn't show enough of the calls under my test method, so I clicked on it to look at the Call Tree View.

![Profile-Span-CallTree](img/Profile-Span-CallTree.png)

I see that 66% of the time is in parsing and about 20% is in File I/O, so we would have to figure out even faster DateTime parsing to make much further progress. Is there anything left we can do?

## Custom DateTime Parsing

We decided to trust that our DateTimes are always a very specific format and constant length, so what if we skip a lot of DateTime logic and just parse the parts as integers, then construct a DateTime from them?

```c#
using (StreamReader r = File.OpenText(filePath))
{
    int count = (int)((r.BaseStream.Length - r.BaseStream.Position) / 30);
    List<DateTime> results = new List<DateTime>(count);
    Span<char> buffer = new Span<char>(new char[30 * 1024]);

    while (true)
    {
        int lengthRead = r.Read(buffer);
        Span<char> block = buffer.Slice(0, lengthRead);
        if (block.Length == 0) { break; }

        while (block.Length > 0)
        {
            Span<char> t = block.Slice(0, 28);

            DateTime value = new DateTime(
                int.Parse(t.Slice(0, 4), NumberStyles.None),
                int.Parse(t.Slice(5, 2), NumberStyles.None),
                int.Parse(t.Slice(8, 2), NumberStyles.None),
                int.Parse(t.Slice(11, 2), NumberStyles.None),
                int.Parse(t.Slice(14, 2), NumberStyles.None),
                int.Parse(t.Slice(17, 2), NumberStyles.None),
                DateTimeKind.Utc
            );

            // Add sub-seconds (no ctor takes below milliseconds as parts)
            value = value.AddTicks(int.Parse(t.Slice(20, 7), NumberStyles.None));

            results.Add(value);
            block = block.Slice(30);
        }
    }

    return results;
}
```

Here I'm parsing each part separately. I use NumberStyles.None to tell .NET it doesn't need to look for a leading plus or minus sign or for thousands separators.

The runtime goes from **878 ms** to **1,080 ms**. This approach is **slower**. Sometimes that happens. We need to try something else.

## Span<byte>

You might also know that .NET was built before UTF-8 really took off, and so .NET String and Char are UTF-16 (more properly, "UCS-2"). Our file on disk is UTF-8 (thankfully) - exactly 30,000,000 bytes for 10,000,000 DateTimes - so .NET is quietly converting the file to UTF-16 as we read it. Would eliminating that conversion be faster?

There's reason to think it wouldn't help much, because File I/O isn't our current bottleneck, but switching to bytes also allows us to Span<byte> methods for parsing, which might be better optimized.

After switching to UTF-8 (Span<byte> and byte), here's the code:

```c#
using (Stream stream = File.OpenRead(filePath))
{
    int count = (int)((stream.Length - stream.Position) / 30);
    List<DateTime> results = new List<DateTime>(count);

    Span<byte> buffer = new Span<byte>(new byte[30 * 1024]);

    long length = stream.Length;
    while (stream.Position < length)
    {
        int lengthRead = stream.Read(buffer);
        Span<byte> block = buffer.Slice(0, lengthRead);

        while (block.Length > 0)
        {
            Span<byte> t = block.Slice(0, 28);
            int unused = 0;
            bool success = true;

            // Parse and build DateTime from integer parts (year, month, day, ...)
            success &= Utf8Parser.TryParse(t.Slice(0, 4), out int year, out unused);
            success &= Utf8Parser.TryParse(t.Slice(5, 2), out int month, out unused);
            success &= Utf8Parser.TryParse(t.Slice(8, 2), out int day, out unused);
            success &= Utf8Parser.TryParse(t.Slice(11, 2), out int hour, out unused);
            success &= Utf8Parser.TryParse(t.Slice(14, 2), out int minute, out unused);
            success &= Utf8Parser.TryParse(t.Slice(17, 2), out int second, out unused);
            success &= Utf8Parser.TryParse(t.Slice(20, 7), out int ticks, out unused);

            DateTime value = new DateTime(year, month, day, hour, minute, second, DateTimeKind.Utc);
            value = value.AddTicks(ticks);

            if (!success) throw new FormatException("...");

            results.Add(value);
            block = block.Slice(30);
        }
    }

    return results;
}
```

While .NET does not have full DateTime parsing on Span<byte>, it happily does have number parsing, so we can construct the DateTime from parts like we tried earlier. (And even though that wasn't faster for Span<char>, the same idea might work here).

How does it do?

The runtime goes from **878 ms** (Span and DateTimeOffset.ParseExact, our previous best) to **592 ms**.

We're starting to get close to our 200 ms goal. Note that the code has gotten weirder and more complex with each of the last few optimizations. Our first changes kept the code pretty clear, but we've started trading higher complexity (and stricter input file requirements) for our gains, and so it's worth thinking briefly about whether this code will still be ok for our team to maintain.

## Handwritten Parsing Function

I didn't expect to be able to achieve much more speed parsing DateTimes - we're using some very optimized methods now - but decided to step into the code and look. 

![Utf8Parser-TryPartInto32D](img/Utf8Parser-TryPartInto32D.png)

Utf8Parser has (unavoidable) code to look for sign characters and is designed to stop at the first non-digit (for use when you don't know how long the number will be). Could we write a simpler implementation ourselves?

I want to **just parse digits** and only care about stopping on errors after every digit has been chewed through. Here's what that looks like:

```c#
private const byte Zero = (byte)'0';
public static int MyParse(ReadOnlySpan<byte> value, ref bool success)
{
    int result = 0;

    for (int i = 0; i < value.Length; ++i)
    {
        byte digit = (byte)(value[i] - Zero);

        result *= 10;
        result += digit;
        success &= (digit <= 9);
    }

    return result;
}
```

I go through every byte, multiplying the previous sum by 10 and adding the digit. I use the fact that byte is unsigned to use only one condition (digit <= 9) to check for all out of range values. Values before '0' in the UTF-8 table will wrap around as large positive byte values.

This is a big step up in change complexity - I've now got a new fundamental method to test. Again it's worth asking if the team will be ok with the additional code, though a number parsing function is about as simple as extra code could be. Let's start using this new method and see if we get any gains from it.

```c#
            using (Stream stream = File.OpenRead(filePath))
            {
                int count = (int)((stream.Length - stream.Position) / 30);
                List<DateTime> results = new List<DateTime>(count);

                Span<byte> buffer = new Span<byte>(new byte[30 * 1024]);

                long length = stream.Length;
                while (stream.Position < length)
                {
                    int lengthRead = stream.Read(buffer);
                    Span<byte> block = buffer.Slice(0, lengthRead);

                    while (block.Length > 0)
                    {
                        Span<byte> t = block.Slice(0, 28);
                        bool success = true;

                        DateTime value = new DateTime(
                            MyParse(t.Slice(0, 4), ref success),
                            MyParse(t.Slice(5, 2), ref success),
                            MyParse(t.Slice(8, 2), ref success),
                            MyParse(t.Slice(11, 2), ref success),
                            MyParse(t.Slice(14, 2), ref success),
                            MyParse(t.Slice(17, 2), ref success),
                            DateTimeKind.Utc);

                        // Add sub-seconds (no ctor to pass with other parts)
                        value = value.AddTicks(MyParse(t.Slice(20, 7), ref success));

                        if (!success) throw new FormatException("...");

                        results.Add(value);
                        block = block.Slice(30);
                    }
                }

                return results;
            }
```

The outer method doesn't change much. One good thing is that we could easily change back to Utf8Parser.TryParse if we decided not to keep the custom method later.

The custom parsing brings us down from **592 ms** to **485 ms**.

## Fully Unrolled Custom Parsing

If we want to keep going, we probably need to drop the loop and hardcode four digits for year, two for month, and so on.This may seem crazy, but if we look deep enough, .NET works this way underneath for some paths:

![DateTimeParse-ParseFormatO](img/DateTimeParse-ParseFormatO.png)

I'll try this with no error handling whatsoever, to see what the best case performance could be. When I get down to custom methods, it's common for me to write "happy path only" code first, because if it's not faster I can revert the change without having spent the time to write it fully.

Here's the happy-path-only parsing:

```c#
// 190 with AggressiveInlining vs 320 without
[MethodImpl(MethodImplOptions.AggressiveInlining)]
private static DateTime DateTimeParseOUnrolled(Span<byte> t)
{
    int year = 1000 * t[0] + 100 * t[1] + 10 * t[2] + t[3] - 1111 * Zero;
    int month = 10 * t[5] + t[6] - 11 * Zero;
    int day = 10 * t[8] + t[9] - 11 * Zero;
    int hour = 10 * t[11] + t[12] - 11 * Zero;
    int minute = 10 * t[14] + t[15] - 11 * Zero;
    int second = 10 * t[17] + t[18] - 11 * Zero;

    DateTime value = new DateTime(year, month, day, hour, minute, second, DateTimeKind.Utc);

    // Add sub-seconds (no ctor to pass with other parts)
    int subseconds = 1000000 * t[20] + 100000 * t[21] + 10000 * t[22] + 1000 * t[23] + 100 * t[24] + 10 * t[25] + t[26] - 1111111 * Zero;
    value = value.AddTicks(subseconds);
    return value;
}
```

And the calling method:

```c#
using (Stream stream = File.OpenRead(filePath))
{
    int count = (int)((stream.Length - stream.Position) / 30);
    List<DateTime> results = new List<DateTime>(count);

    Span<byte> buffer = new Span<byte>(new byte[30 * 1024]);

    long length = stream.Length;
    while (stream.Position < length)
    {
        int lengthRead = stream.Read(buffer);
        Span<byte> block = buffer.Slice(0, lengthRead);

        while (block.Length >= 28)
        {
            Span<byte> t = block.Slice(0, 28);
            DateTime value = DateTimeParseOUnrolled(t);

            //if (!success) throw new FormatException("...");

            results.Add(value);
            block = block.Slice(30);
        }
    }

    return results;
}
```

Note my addition of **MethodImplOptions.AggressiveInlining**. I wrote this code inline originally, then decided it should be a method and factored it out. When I did, the performance dropped by a third. At this point, either method call overhead is starting to matter, or conditions in the calling code (block.Length >= 28) is helping to cut out bounds checks, perhaps.

The runtime goes from **485 ms** to **182 ms**, reaching our performance goal.

It's a good thing, too, because I'm not sure where we'd get further gains. The I/O is in bulk with no conversions and no copying, and the DateTime parsing is about as minimal as it could be.

We don't need to go further, but if we did, I would probably choose to start changing the rules about our inputs and outputs. If we were doing this work repeatedly on the same file, could we just save a copy already converted to DateTime instead?

## DateTime UTC Ticks as Binary

To find out, I decided to write a binary file where I write each DateTime.ToUniversalTime().Ticks using BinaryWriter and then read it in with BinaryReader. I might or might not be able to get the provider of the files to send them like this, but if I was scanning them repeatedly, I could also compute and cache the converted form myself.

```c#
using (BinaryReader r = new BinaryReader(File.OpenRead(Path.ChangeExtension(filePath, ".bin"))))
{
    int count = (int)((r.BaseStream.Length - r.BaseStream.Position) / 8);

    // Make a List correctly pre-sized
    List<DateTime> results = new List<DateTime>(count);

    // Read UTC ticks values directly and construct DateTimes from them
    for (int i = 0; i < count; ++i)
    {
        long ticks = r.ReadInt64();
        results.Add(new DateTime(ticks, DateTimeKind.Utc));
    }

    return results;
}
```

One nice thing is the code becomes a lot simpler again.

Runtime? **261 ms**, so shockingly a bit slower than our no-verification implementation. We're making separate calls for every 8 byte value, which ultimately limits our speed.

## Binary DateTimes in Bulk

Finally, down to the last option I know how to do. Could we just read the file of DateTime Ticks bytes and "cast it" to a DateTime array? Amazingly, yes, modern C# has a way to do that.

We make a DateTime array the correct size, reinterpret it as a byte array, and ask the Stream to read directly into it.

```c#
using (Stream stream = File.OpenRead(Path.ChangeExtension(filePath, ".bin")))
{
    int count = (int)((stream.Length - stream.Position) / 8);

    // Make a DateTime array the correct size
    DateTime[] results = new DateTime[count];

    // Read the Ticks bytes directly into the array, interpreting them as DateTimes with no per-value conversion
    stream.Read(MemoryMarshal.Cast<DateTime, byte>(results.AsSpan()));

    return results;
}
```

If you see "MemoryMarshal" and get nervous, you've got good instincts. This very low level loading is trusting the bytes on disk to be valid, and trusting the .NET representation of DateTimes (and arrays of them) not to change. These are new requirements worth considering carefully. If we temporarily cache copies of the logs in this form, that might be fine. Storing them long term like this may not be.

What's the runtime of this craziness? **34 ms!** It's so fast I have to scale up to the full 100M DateTimes to get a reliable measurement. 100M DateTimes in binary is 760 MB and is parsed (well, loaded, really) in 340 ms, which is about 2.2 GB/s. This is as fast as the drive in my laptop can read, so we've hit a hardware limit with this particular variation as well.

## Reshaping the Problem

Note that all of these implementations still build a set of DateTimes. If the real task was to find the rows in a given time range (or count them), we really don't need an array of all of them, and don't need to decode all of them. We could also write a file with, say, only every 32nd DateTime. We load it, binary search for the desired range, and then find the range in the main file. Since we don't have every row, we'll be off by a few, but we can search around in the big file to find the exact bounds.

If we don't care about full ticks precision, we ask for the DateTimes with fewer fractional seconds, and save both space and parsing time. The binary format could potentially be represented with four bytes per value instead, though we have to figure out how to expand it back to either to load. (Two digit years never hurt anyone, right? /s)

If we find we're often working with small ranges in the files, another really simple idea would be to push back on the 100 million rows per file design. Could we get down to 10 million and still achieve our other goals? Could we keep the smaller files for a while and merge them into big files only after we won't be processing them anymore?

I gave some design restrictions up front, but hopefully your engineer mind perked up and wondered if those requirements were really strict and necessary or if they were somewhat flexible if a good enough reason came along.

## What about the other log fields?

We've gone through this whole set of experiments with files with just DateTimes in them. What about the full messages with other fields? It would be slower, obviously. If we know that newlines will appear right before the DateTimes, looking for newlines in a Span<byte> can be done very, very quickly with .NET, so we might be able to stay close to the "Unrolled" performance. The file could be much bigger than the DateTimes, however, so we'll be reading many more bytes and we might hit our disk read speed limit.

Another option (along the lines of writing a separate binary file) is we could have (or build) a separate file with only the DateTimes in it from the raw log, which would make exactly this example what we're planning to process. How do we find the rows in the original file, then? We would probably have to write both the DateTimes and a byte offset in the main file where that row could be found.

## Why no multithreading?

You may object that I never tried to multi-thread this method. Why? Basically, I always want to see what I can get from one thread before I add more. If I can reach the goal in one thread, I can leave the other cores for other work, other processes, or queries from other users. In addition, if we can find a way to parallelize above the level of this code, we don't need to do it here. For example, if we're processing multiple logs, we can have one thread work on each file separately with no coordination or merging of results to figure out. Speaking of coordination, it's often difficult to write multi-threaded code where the threads aren't sitting around waiting for each other. In this case, I could split up a file into chunks, allocate a big, perfectly sized array, and have each thread fill in a segment of it. In many problems, we don't know exactly how many results there will be and have to work harder to figure out how to merge them efficiently.

If you have a problem where you don't have multi-threading above your code, you can't hit your goal in one thread, and you can figure out how to have them split up the work and coordinate the results, go for it. I would just suggest sticking to one thread first until you hit those limits. =)

## Conclusion

We started with a simple problem - parsing DateTimes - and optimized it dramatically in a series of steps. The changes went from minor alterations that probably any team would be willing to maintain to some pretty weird and bespoke craziness. Such is the world of performance.

What was the overall speedup we achieved?

| ms        | Name                                      | Speedup    | DateTimes/s |
| --------- | ----------------------------------------- | ---------- | ----------- |
| 6,901     | Original                                  | 1.00x      | 1,450,000   |
| 3,704     | AdjustToUniversal                         | 1.86x      | 2,700,000   |
| 2,866     | ParseExact (output not UTC)               | 2.41x      | 3,490,000   |
| **1,492** | **DateTimeOffset**                        | **4.62x**  | 6,720,000   |
| **878**   | **Span<char> + DateTimeOffset**           | **7.86x**  | 11,390,000  |
| 1,080     | Span<char> + int.TryParse parts           | **6.39x**  | 9,260,000   |
| **592**   | **Span<byte> + Utf8Parser**               | **11.66x** | 16,900,000  |
| 485       | Span<byte> + handwritten parse            | 14.23x     | 20,600,000  |
| 182       | Span<byte> + unrolled parse (no checking) | 37.91x     | 54,900,000  |
| 261       | Binary UTC Ticks                          | 26.44x     | 38,300,000  |
| 34        | Binary bulk into DateTime[]               | 202.98x    | 297,000,000 |

So we could get 4.6x faster just by swapping the parsing method (to DateTimeOffset.ParseExact), 7.8x faster by switching to Span for I/O, and 11.6x faster still with standard parsing. Custom code got us to 37.9x, though a production-safe version would need error checking and would be slower.

Finally, loosening the input requirements and switching to binary can get you a 200x speedup on this problem, if really need it, and can load 297 million DateTimes per second.

![Runtimes](img/Runtimes.png)

If you'd like to try running this yourself, [grab the code](img/DateTimeParse.zip) and try it out. If you find any faster ways to do it, please [let me know](mailto:scottlo@outlook.com)!