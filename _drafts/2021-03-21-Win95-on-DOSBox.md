---
typora-root-url: ../
title: Win95 on DOSBox
category: Gaming
layout: post
tags:
  - DOSBox
---

In my first SimTower post, I mentioned getting Win95 running on DOSBox. I found a few walkthroughs and ran into a few problems, so here is a terse description of the steps that worked.

### You Need

* A Win95 CD image (ISO)
* A DOS Boot Disk Image
* DOSBox Installed
* An empty disk image (FAT16 formatted, single active partition)



[See DOSBox.conf]
[NOTE: Need 512 MB for normal Win95C disk, I think]

### Special Notes

You only need the 'Win95' directory on the disk image to install Win95. You can delete the files which appear in the later releases and not the first released for a trimmed down but patched install.

You can delete:

* All files alphabetically before "deltemp.com"
* All of the "content" folder
* All CAB files except mini.cab, precopy1.cab, precopy2.cab, and the win95_xx.cab.
* All ie4 files.

