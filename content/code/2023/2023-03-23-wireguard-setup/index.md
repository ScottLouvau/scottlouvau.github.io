---
title: "DIY Wireguard Setup"
date: 2023-03-23
---

We recently set up Wireguard as a home VPN. It's widely used, trusted, open source, and free, but I stumbled on a few things along the way and the documentation is sparse, so I wanted to write up what I did.

## Outline

- Motivation? 
  - Darinee found out about my X-Mas gift.
  - Third party services to access house stuff remotely (OctoEverywhere, Home Assistant?)
  - Wanted to stop leaving home hosts exposed to internet (IotaWatt)
- Explain Wireguard
  - What is it?
  - Why Wireguard and not different VPN software?
  - What can a VPN do for you, anyway?
- How we use Wireguard
  - Check Printers, Cameras, Control House away from home
  - Netflix thinks we're home when away
    - Haven't tested.
  - T-Mobile doesn't slow video downloads when tethering
    - Not working for YT Music. Seems to work for Netflix video.
  - Safer browsing on public Wifi
  - More private browsing?
    - Sort of - CAPTCHA (sp) challenges and would be same IP as others on network.
    - Browser fingerprint would still be the same.
    - Deleting cookies, blocking cookies, and disallowing sharing seemed to work better (Facebook).
    - Separate browser for browsing, shopping, and signed in.
  - Future: Secure droplet services by locking network, not in-app authentication.
  - Future: House-to-house VPN tunnel
  - Future: Dynamic DNS setup?
  - Future: Wireguard on a Gateway device? (DFRobot or Seeed with OpenWRT?)
- Wireguard Setup
  - Install (apt install wireguard, openresolv, qrencode)
  - IP forwarding (etc/sysctl.conf)
  - Generate keys (server and first client pairs)
  - Create wg0.conf
  - Add Firewall exception (ufw allow 51820/udp)
  - Create service; start on boot. (systemctl enable wg-quick@wg0.service)
  - Generate first QR code
  - Set up client
  - Test
- Wireguard Troubleshooting
  - Get public and private key backwards.
  - Autosave overwrites conf changes on stop.
  - Lock yourself out on wg-quick down wg0.
  - Forget to load new config on server before testing client.
  - Have a service on each server and private network handy.
  - Missing "/24" on [Interface] Address blocked routing.
  - Didn't know "ip route" commands to enable routing.
  - Didn't route from wg0 to wg0.
  - Use "wg" or Wireguard status UI to check where data is going.
  - Use "ip route" to see where traffic to a particular address would be sent.
- wg-help
  - Manage keys in TSV files.
  - Private keys in a separate TSV (can encrypt or have each device only know its own)
  - One command add client, get QR code, and update servers to allow
  - Easy to re-generate configs for all existing servers/clients
- References
  - Digital Ocean Wireguard guides

## What is Wireguard?

[Wireguard](https://www.wireguard.com/) is VPN software - it provides encrypted network communication between clients. It is free and open source, and is used in commercial software like [NordVPN](https://nordvpn.com/) and [Tailscale](https://tailscale.com/).

You can use Wireguard in a few major ways:

- To securely connect to your home network from anywhere
- To appear to browse from home when you are somewhere else
- To browse privately when you're on a network you don't trust
- To "bridge" two private networks so that devices on one can communicate with devices on the other one transparently
- To make a public server only accept connections from trusted clients.

We use Wireguard to connect to our 3D printers and control our smart home server remotely. We don't have to pay for (or trust) any third party services, and we only open up one port on one computer (the Raspberry Pi running Wireguard) from our home network to the internet. As long as Wireguard doesn't have security vulnerabilities and properly rejects traffic that's not from one of our devices, our home network remains secure.

We can appear to browse from home even when we're away to keep Netflix happy that we're all "one household", though I'm not sure if they've started enforcing the "everyone has to watch from the same house at least monthly" rule in the US yet.

We browse privately when away to browse from coffee shops confidently. We also use it to download video and music from tablets tethered to our phones on the go. Our cellular provider throttles or blocks video when tethered, but if we send the traffic through Wireguard, it won't know what kind of traffic it is. Our kids unfortunately forget to download shows and music before we leave home sometimes, and this allows us to fix the problem on the road instead of turning around.

## Wireguard Setup

We have one Raspberry Pi 4 in our house and one port in our router which routes traffic to it, and Wireguard on the Pi handles authenticating clients, decrypting the traffic, and forwarding it to other devices on our home network transparently.

You need the Wireguard client installed on each device that you'd like to be able to remotely connect to home **from**, so this means on each of our phones and laptops. Fortunately, Wireguard has clients for Windows, MacOS, Android, iOS, and many Linux flavors, so it's easy to install.