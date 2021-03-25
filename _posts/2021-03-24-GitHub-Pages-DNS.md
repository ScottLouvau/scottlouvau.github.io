---
typora-root-url: ../
title: GitHub Pages and Domain.com DNS
layout: post
tags:
  - Website
---

After some (mis)adventures, I finally got my custom domain name directed to my GitHub Pages site successfully. Here is what worked, in case someone else has the same problem.

I first tried clearing all of my DNS records and adding only the ones I thought I needed. Don't do that. I got a "Nameserver is not authoritative" error, and didn't know how to get back to the defaults.

![LeafDNS-Test-Fail](/assets/img/GitHub-Pages/LeafDNS-Test-Fail-crop.png)

### GitHub Pages Configuration

To use GitHub Pages, all you have to do is create a public repo and turn on GitHub Pages at the bottom of 'Settings'. However, I **highly recommend** using the default GitHub Pages repo name (your-user-name.github.io) so that the hosted website is just https://your-user-name.github.io without a trailing folder name. This means that root-relative-urls (/assets/css/styles.css) will work consistently locally, hosted at GitHub, and hosted at CloudFlare Pages.

You choose the branch to publish in the GitHub repo Settings page. I'm choosing a 'release' branch, so that I can work directly in main and push frequently to back up but not publish half-finished work.

Also, don't turn on 'Enforce HTTPS' initially - get your domain working correctly first.

![GitHub-Pages-Settings](/assets/img/GitHub-Pages/GitHub-Pages-Settings.png)

See [Managing a custom domain for your GitHub Pages site - GitHub Docs](https://docs.github.com/en/github/working-with-github-pages/managing-a-custom-domain-for-your-github-pages-site#configuring-an-apex-domain) for the official documentation. It was good, but didn't fully tell me which DNS records I needed to get things working.

### DNS Record Configuration

After my misadventure, Domain.com Support was able to restore the defaults for me.

After that, here are the changes that worked:

1. Record the default types, names, and values, in case you need to replace them.
2. Remove the '@' and '*' A records and the '_acme-challenge' CNAME record.
3. Add '@' A records for each of the [GitHub Pages IP addresses](https://docs.github.com/en/github/working-with-github-pages/managing-a-custom-domain-for-your-github-pages-site#configuring-an-apex-domain).
4. Add 'www' A records for each of the [GitHub Pages IP addresses](https://docs.github.com/en/github/working-with-github-pages/managing-a-custom-domain-for-your-github-pages-site#configuring-an-apex-domain).

![Domain.com-DNS-Entries](/assets/img/GitHub-Pages/DomainCom-DNS-Entries.png)

Then:

1. Wait (about two hours, for me).
2. Verify via LeafDNS.com
3. Flush your PC DNS cache (on Windows, "ipconfig /flushdns")
4. Verify your domain resolves to your website in the browser.
5. In your GitHub repo Settings, turn on "Enforce HTTPS"

![LeafDNS-Tests-Pass](/assets/img/GitHub-Pages/LeafDNS-Tests-Pass.png)

... and then my site finally worked!

![Domain-Working-SSL](/assets/img/GitHub-Pages/Domain-Working-SSL-crop.png)