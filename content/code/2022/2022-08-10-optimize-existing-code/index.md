---
title: "How to Performance Optimize Existing Code"
date: 2022-08-10
---

You've got some existing code and you might want to make it faster. How hard is it to make it faster? How do you go about it? What tools do you need? Is it even worth doing?

This post talks through the process of optimizing existing code; to walk through an illustrated example, see "[Parse 50M DateTimes a second in C#]({{< ref "code/2022/2022-08-10-performance-datetime-parse-in-cs" >}})".

## TL;DR

* It's easier than you'd think
* Make sure optimizing this code **will matter** (save money, delight users, etc)
* Define a **performance goal** (faster than 100ms won't matter anymore)
* Isolate the code to optimize in a **realistic, scalable sample** (ideally running in around 10 seconds initially)
* Get a **sampling profiler** and profile the sample.
* **Make changes, measure, and repeat**.
  * Keep changes that help.
  * Discard changes that don't, but keep notes about what you've tried.
* Consider options for **cheating to be faster**.
  * Solve once and cache the answer.
  * Solve a similar, simpler problem instead.
  * Use a different algorithm.
  * Solve the broader problem with different inputs and outputs.
* **Verify your gains** in the real, full codebase.
* Add a test to **protect your performance gains**.

## It's Easier Than You'd Think

If you haven't optimized code before with a sampling profiler, write some simple code and try it. With modern tools you can profile your code, find bottlenecks, and fix them and retest in just a minute or two once you know how.

If you write hundreds of lines of code, you know it will have functional bugs to find, and that you're not done until you've tested it. In the same way, any decent body of code will have performance bugs, and it's common to have some which are severe and also very simple to fix, but if you never run under a profiler, you just don't see them.

Significant performance tuning only makes sense in certain circumstances, but I think almost all code is worth a quick look at performance. I'm sure many of the things I wait for my computer to finish today are the result of performance bugs that would be easy to fix and just were never found.

If you need an example, consider the [Grand Theft Auto Online bug](https://nee.lv/2021/02/28/How-I-cut-GTA-Online-loading-times-by-70/) where parsing a 10MB JSON file was adding **four minutes** to the game startup time.

## When Optimizing Matters

Code written with good functional quality and maintainability will often be fast enough on modern computers as-is. If so, great. In some cases, however, making code faster can really matter. 

Obviously, time spent optimizing code can look like time wasted - it's not adding more functionality or fixing bugs. It's important to make sure that better performance will matter, and that your team (or your client) agrees that it's worth doing.

Code is often worth optimizing when:

* It's expensive to run.
  * Does it dominate your cloud bills?
  * Does it need an expensive machine configuration to run at all?
  * Will many humans run it often and wait for it to finish?
* It can be used in new ways if it is much faster.
  * Tests that take an hour are run before merging code; tests in one minute are run before local commits; tests in one second can run as you code.
  * Queries that take minutes can be used for reporting. Queries in one second can be explored to understand unexpected results and find insights.
  * Speech-to-text transcription can be live subtitles if fast enough, but only within a second or so.
* It has clear external performance needs.
  * Games need to run at 30 fps (at least) to feel immersive and smooth.
  * Payment at subway turnstiles has to be fast enough for people to run through them.
  * Telemetry to detect downtime must alert you quickly - an hour later will significantly hurt availability.
* It will often fail and need to be re-run repeatedly.
  * Compilers that stop on different errors until everything is fixed.
  * Data Processing that aborts on bad data.
  * Network communication on unreliable networks.

## Define a Performance Goal

Optimizing performance is like deciding when to ship a product - it's hard to decide when you are "done" and it's time to stop. Spending a few minutes defining what performance is "good enough" (or where faster won't matter anymore) is really helpful in telling you when you can stop optimizing. Performance changes often make code more complicated or harder to maintain. If you have a performance goal, you can include the combination of changes which get you to the goal with the least impact to clarity and maintainability.

If you have an external goal (30 fps gameplay, turnstile payment in under 500 ms) you have a ready-made goal. If your code is a bottleneck in a larger system, "good enough" is usually when your component takes about the same amount of time as the next largest component. If your code is the highest line item on the cloud bill, getting it down to third or fourth place is very meaningful, but improvements beyond that will matter much less. If you are interacting with humans, a response in under one second or so feels "very responsive" to humans for interactions (clicking a button) and under 100 ms or so feels "instant" as they are typing.

Occasionally the goal is "as fast as possible", like when you're trying to maximize the scalability of your solution or your team will pay by use and would have many more uses if it was inexpensive enough. In those cases, you can sometimes establish a goal by finding a lower level bottleneck beyond which you can't improve. For example, if you're parsing CSV files and your storage read speed is 6 GB/s, you probably don't need to figure out how to parse any faster than that.

## Build a Realistic, Scalable Sample

Performance tuning is a very, very iterative process. You measure, make a change, measure again, and revert or keep the change. There can easily be dozens of alternatives for a single operation (even dozens of overloads of a single function), and combinations of changes can often interact with each other. If you have a fast, smooth process for measuring the results, you can try many more variations and get much more potential improvement in a given amount of time.

Ideally, I try to isolate the code to optimize in a console application and scale my input data so that the code completes in about ten seconds. That's quick to iterate on, but also enough runtime to get reliable measurements even after I've optimized the code down somewhat.

It's very important that the code remain realistic, because it's easy to get performance gains that don't actually work at all in the real environment. If your code reads from a database, you want the sample to read from a comparable database. If you interact with the network or disk, try to keep network and disk interaction in the code, and try to optimize on a computer as similar to the real production environment as possible.

As you improve the code, it will (hopefully) get drastically faster, so you need to be able to scale up the data size to continue getting reliable measurements. You can either identify realistic subsets of the data at different scales, or generate synthetic data that can quickly be re-created at different sizes. In either case, try to make sure the code still runs the same way it does with your real data.

If you're not sure if your scaled data is realistic, you can run the profiler on real data once (even if it takes a long time) and compare the profiler output to your sample data to make sure roughly the same amount of time is spent in different functions.

Make sure to **profile release code with optimizations**. It's very common for the bottlenecks in Debug and Release code to be totally different. Optimize the same builds you will use in production.

## Measure with a Sampling Profiler

I almost always optimize code with a sampling CPU profiler. A sampling profiler captures the current call stack in your code many times per second. Sampling profilers don't have to change your code ("instrumenting" profilers do), so sampling profilers are usually easier to get working and are running your code more like it is in production. Profilers can measure memory use, allocations, thread context switches, and other things, but generally just measuring CPU time is enough to identify your bottleneck, even if it is memory or contention related.

Once you have your isolated sample, run it under a sampling profiler to get measurements. In the world of C# and Visual Studio, there is a built in performance profiler (Debug -> Performance Profiler...) which works nicely. If you have to find a profiler for your environment, look for one that is easy to run (you'll be doing so often) and that produces easy to read output. I really like the "top functions" and "hot path" reporting from the Visual Studio Profiler. These two views allow you to see the lowest level operation taking the most time (string splitting) and go through the call hierarchy to see where (Analyze -> ReadRow -> ReadCells).

## Measure, Tweak, Repeat

Once you have your sample and profiler ready, run your code and look at the report. The initial report will often surprise you, with the majority of runtime spent on something you didn't expect. In the same way that it's hard to write hundreds of lines of code with no serious functional bugs, it's hard to write a lot of code with no serious performance bugs. Since we often don't performance test code at all for a long time, there are often really, really easy fixes which can make an enormous initial difference.

For example, you might find out that accessing a property on an object (say FileStream.Length) is causing computation every time, and since you don't expect the value to change, you can just move it outside of a loop and find significant performance gains.

Once you find a bottleneck, try out alternatives. Do other overloads of the function work better? (Do they skip some unneeded work?) Is there a way to do just the work you want more directly? Can you reuse work from a previous step to avoid doing it repeatedly? Are there related classes you could use instead which might be faster? Could you do the work in different batch sizes?

With each single change, run the code again and write down the situation (FileStream.Length before loop) and the runtime (5,750 ms) somewhere. You will keep the changes that help and discard the changes that don't, so you need to keep track of what you've tried as you go.

If you don't see anything in the code which should have a significant runtime, look for surprise allocations or conversions. For example, in C#, if you pass a struct to a function that takes that argument as an interface type, C# has to make a System.Object wrapper around the struct to pass for every call. (Can you make a version of the function which takes the concrete struct type directly?) If you pass arguments to a function which takes any number of arguments as a params array, C# must allocate an array to hold them. Can you make a version which takes an exact number of arguments directly?

If you can, it's very helpful to get the debugging symbols and source code for libraries you're using, as stepping into them in the debugger can help you understand why the runtime is longer than you expect.

Finally, if you have no idea why a function is expensive and whether there are cheaper alternatives, try searching online. ("DateTime.Parse slow; fastest DateTime parsing C#"). It's quite possible others have tried to optimize similar code and can help point you in the right direction.

## Cheat to be Faster

You can often make code run 2-10x faster just by eliminating surprise bottlenecks, finding faster overloads, or hand-implementing functions which do just the work you want (instead of calling built-in functions designed for many more cases). If those "easier gains" run out well below your performance goal, the next thing to consider is "cheating" - bending the requirements of the problem to drastically improve performance.

Some dimensions of cheating to consider:

### Do It Earlier or Later

Does the problem you're solving need to be solved now? Could it be done later (after a filtering step reduces the set you have to work on, maybe)? Could it be done earlier (when you generate the data, on machines that aren't busy, before you bring it all together)? Could it be done only if the user asks for it and be off by default?

### Solve Once and Cache

Are you doing the same work repeatedly? If so, can you save your previous answer and reuse it instead? If you are retrieving data, are you often asked for the same value a few times? Can you check the last value you returned and only search if the caller wants something different? Can you just change the calling code not to ask you multiple times?

Or, are you doing *almost* the same work repeatedly? If so, could you incrementally update the previous answer instead? For example, I had to write code to take a byte position in a file and map to a line and character position. I realized that the code often mapped several posititions in a given file, so rather than counting newlines from the beginning of the file every time, I saved the previous position and found line and character and just found newlines incrementally from there when possible.

If you're doing an expensive conversion from one form (text) to another (binary) can you save the converted form to reuse?

### Solve a Simpler Problem Instead

If you are solving a problem exactly, would an approximate solution be enough? For example, if searching for a phrase, you might be able to search for just the rarest word in the phrase alone much more quickly, and then you could post-filter the results for the whole phrase afterward. 

If you're looking for events that took a long time, can you rule many of them out simply (End - Start < Threshold) before looking in more detail?

### Use a Different Algorithm

If you're doing something for which there are well known algorithms, would another one work better for your problem? If you're using a library to do something, are there other libraries that do it differently?

Are you searching linearly when you could binary search? (Could your data source give you sorted data if it isn't now?)

### Use Different Data Structures

If you're iterating over a set of values, an array is much faster than a linked list. If your collection is sorted and must stay sorted through changes, a linked list or tree will be better. If there are several common data structures you could use, consider trying a few different ones to see if any of them behave differently for your situation.

If you are using a resizing data structure, can you tell it how big it needs to become in advance? 

### Skip Conversions

If you're converting data (numbers in text to binary numbers), do you need to do the conversions? If you're just comparing for equality, for example, you could compare the numbers in text form instead (if the formatting was consistent). If you're looking through text DateTimes for one day, you only need to parse the year-month-day part. 

If you're looking for JSON with a specific property=value, can you just string search the JSON without parsing it at all?

### Use Different Inputs and Outputs

If your bottleneck is parsing a big ball of JSON from a caller, does it have to be JSON? Could you split out a few giant values into separate files which then won't have to be parsed and decoded? Could you ask the caller to omit parts of the data you don't even intend to use?

If your data is using too much space, do you really need all of it? Could you just keep a window of values? Do you need full precision or could you discard some lower-order bits?

If you are working with just one field from a collection of objects often, can you split out that field into a separate array by itself?

## Verify Your Gains

Once you've finished a set of optimizations (and before you invest days or weeks into a difficult optimization) try out your changes in your real environment with your real data to confirm it works. Computers are complicated and have a whole host of optimizations and bottlenecks interacting, so sometimes improvements in your environment don't pan out in production.

If you do see optimizations which work locally but not in production, try to get a more production-like environment or more production-like data. You can even iterate with a single change or two while trying to figure out how to get a properly realistic environment.

## Protect Your Gains

Code changes over time, and the next person to change the code may not know what you did to optimize it. It's a very good idea to add comments indicating that the code is performance sensitive, to identify the calls you optimized, and to call out the more normal overloads which were slower and which you removed. 

It's a really good idea to add a performance test to ensure the performance stays fast if you can. If your codebase doesn't have any performance testing apparatus, you can make a unit test to try to sanity check that performance doesn't get much worse, but it's difficult to get right - your test will run on debug code on slower, busy computers and a randomly failing test is awful. You can try to restrict it to Release (if your unit tests are ever run in release) or sample a tiny known workload to make a relative performance goal. Another option is to have your code track work done and and make sure it's still doing the optimal amount of work. (How many times did you ask my mock File System API for folder files for this test?)

Another option, if you can't add tests, is to add some production telemetry for when performance is below goals. You might not prevent performance regressions from being checked in and deployed, but catching them quickly is much better than finding them weeks or months later.