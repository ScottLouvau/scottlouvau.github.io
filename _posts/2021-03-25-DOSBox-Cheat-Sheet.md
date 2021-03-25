---
typora-root-url: ../
title: DOSBox Cheat Sheet
category: Gaming
layout: post
tags:
  - DOSBox
---

Some quick tables about DOSBox that I kept looking for.

### Sound Card Default

[Sound - DOSBoxWiki](https://www.dosbox.com/wiki/Sound)

SoundBlaster 16
Base Address: 220h
IRQ: 7
DMA: 1
HDMA: 5

### DOSBox Commands

[Commands - DOSBoxWiki](https://www.dosbox.com/wiki/Commands)

| Goal                          | DOSBox Command                                      |
| ----------------------------- | --------------------------------------------------- |
| Mount Host Folder             | mount E: Local\Path                                 |
| Mount Floppy (to boot)        | imgmount 0 BootDisk.img -t floppy -fs none          |
| Mount Floppy (to access)      | imgmount A: BootDisk.img -t floppy                  |
| Boot from Floppy              | boot -L A                                           |
| Mount Drive Image (to boot)   | imgmount 2 HDD.img -t hdd -size [Geometry] -fs none |
| Mount Drive Image (to access) | imgmount D: HDD.img -t hdd -size [Geometry]         |
| Boot from Drive               | boot -L C                                           |
| Unmount                       | mount -u D:                                         |

### DOSBox ImgMount Geometry

[IMGMOUNT - DOSBoxWiki](https://www.dosbox.com/wiki/IMGMOUNT)

imgmount -size [BytesPerSector], [SectorsPerHead], [Heads], [Cylinders]
All hard drives (at least that I found or created) had 512 bytes per sector and 63 sectors per head.

| Size [MB] | Geometry [-size XXX] |
| --------- | -------------------- |
| 64        | 512,63,4,520         |
| 128       | 512,63,8,520         |
| 256       | 512,63,16,520        |
| 512       | 512,63,32,520        |
| 1,024     | 512,63,64,520        |
| 2,048     | 512,63,128,520       |
| 96        | 512,63,4,780         |
| 192       | 512,63,8,780         |
| 384       | 512,63,16,780        |
| 768       | 512,63,32,780        |
| 1,536     | 512,63,64,780        |

