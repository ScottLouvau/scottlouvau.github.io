---
title: "Getting Retirement Money Out"
date: 2021-06-05
---

Once you retire, which accounts should you take your retirement spending from first? If you retire before age 59.5, how do you get IRA money out at all? Are there any retirement tax surprises to watch out for?

If you are many years from retirement, you don't need to worry about this stuff. Save in the [right account types]({{< relref "finance/2021/2021-06-04-retirement-account-types" >}}) with the [right investments]({{< relref "finance/2021/2021-05-26-how-to-invest" >}}) and don't try to pre-plan for your 2040 taxes right now. Tax laws change.

## Approximate Federal Taxes

Taking your retirement money in the right mix from different [account types]({{< relref "finance/2021/2021-06-04-retirement-account-types" >}}) can **drastically lower your taxes**. I tried to write an accurate but simplified summary of the tax rules. It was still a mess. So here's a version which provides **approximate** tax amounts with much, much less complexity.

First, there are three **types of income**:

| Income Type | Tax %     | Sources                                                      |
| ----------- | --------- | ------------------------------------------------------------ |
| Ordinary    | 10% - 37% | - Job Income<br />- Social Security Income\*<br />- Tax-Deferred withdrawals (ex: IRA)<br />- Taxable Bond interest |
| Qualified   | 0% - 24%  | - Taxable withdrawals (capital gains)\*<br />- Taxable Stock Dividends\* |
| Tax-Exempt  | 0%        | - Tax-Free withdrawals (ex: Roth IRA)<br />- Tax-Exempt Bond interest |

Caveats (*) that matter:

* Stock must be held for over one year for dividends to be Qualified income.

* Stock must be held for over one year for capital gains to be Qualified income.

* Social Security is ordinary income, but not all of it is taxed.


Next, there are **tax brackets**. For a married-filing-jointly couple in 2021:

| Rough Bracket Sizes | Ordinary Tax Rate | Qualified Tax Rate |
| ------------------: | ----------------: | -----------------: |
| $25,000             | 0%                | 0%                 |
| $20,000             | 10%               | 0%                 |
| $60,000             | 12%               | 0%                 |
| $90,000             | 22%               | 15%                |
| $160,000            | 24%               | 19%                |
| [more]              | 32%-37%           | 19%-24%            |

The first "bracket" is really the "Standard Deduction", and is tax-free for all income types. I've made the bracket sizes even numbers, but they actually change a little every year. The real "qualified" bracket sizes are different than the ordinary ones. There's a 3.8% "net investment income tax" that shows up halfway through the "15%" qualified bracket. Crazy-pants.

Your income "fills up" each tax bracket in order. Ordinary income is "filled in" first, and then qualified income second. If only a little of your income reaches into a new tax rate, only that part is taxed at the higher rate. 

Suppose you have $40,000 in ordinary income and $60,000 in qualified income. Here's your estimate:

| Rough Bracket Sizes | Ordinary Income | Ordinary Rate | Qualified Income | Qualified Rate | Tax    |
| ------------------: | --------------: | ------------: | ---------------: | -------------: | -----: |
| $25,000             | $25,000         | 0%            |                  | 0%             | $0     |
| $20,000             | $15,000         | 10%           | $5,000           | 0%             | $1,500 |
| $60,000             |                 | 12%           | $55,000          | 0%             | $0     |

What happened? Ordinary income went first. $25,000 went into the first (0%) tax bracket. The remaining $15,000 went into the second bracket, for $1,500 ($15,000 x 10%) in tax. Next, $5,000 of qualified income filled the last of the second bracket, adding $5,000 x 0% = $0 tax. Finally, the remaining $55,000 of qualified income went into the third bracket, also adding $0 tax.

In total, your $100,000 in income cost only **$1,500** in tax (1.6%). If instead you took the whole $100,000 from a tax-deferred account, your tax would be **$8,600**. 

If you're saying, "Wow, that's way less good!", you're right! That's why this topic matters. If you keep your ordinary income in the first two brackets, they are barely taxed. If your qualified income stays within the first three brackets, it's totally tax-free.

How close are these estimates to the real numbers? Use the [TaxCaster](https://turbotax.intuit.com/tax-tools/calculators/taxcaster/) app to get real numbers quickly. The exact numbers are **$1,523** (vs $1,500) and **$8,632** (vs $8,600). Close enough? Close enough.

## Which Accounts First?

Now that we know some tax basics, where should your retirement spending come from?

In short, usually this order:

* Taxable Dividends and Interest
* Tax-Deferred Withdrawals
* Taxable or Tax-Deferred Withdrawals
* Tax-Free Withdrawals

Why? Let's dig in a bit.

First, you get to pay tax on any dividends and interest in your taxable account no matter what, so you might as well use them for part of your spending. If your account is set up to reinvest them, change it to withdraw them instead when you retire.

Second, as you saw above, the first bracket (standard deduction) is tax-free no matter what. Take some money from your tax-deferred accounts to take maximum advantage of that 0% rate.

Third is a toss up. You can take more tax-deferred withdrawals at the relative bargain 10% and 12% tax rates in the next two brackets. Or, you could take from taxable accounts for zero tax. 

Huh? Why not just use taxable accounts for all of this range? 

Well, when you turn 70, you will have Social Security income and mandated minimum tax-deferred withdrawals (see RMDs in the next section). Together, these might cause a much higher tax rate than you had earlier in retirement. If they do, it might be a better overall deal to spend IRA money sooner to reduce taxes later. 

Fourth, your tax free accounts are always free, of course, so if you are near one of the "tax surprises" below, you can lower your taxable income by taking some tax free money to avoid them. Tax-free accounts are also best to spend last because  if your portfolio grows really well, they don't hurt so much when you raise your retirement income and are the most tax-efficient for people to inherit.

## Retirement Tax Surprises

With all of the different income sources and subsidies that come together in retirement, there are some combinations which can cause really high tax increases for small changes in income. Look out for:

#### Social Security Taxation

As mentioned, your Social Security income is not all taxed. There's a formula which decides how much (between 0% and 85%) is taxed. If you have $45,000 in other income, your Social Security income is 85% taxed. Otherwise, put your numbers into TaxCaster and then try again with $1,000 less in non-Social Security income. If your tax goes down by $400+, it's because you are in the ["Social Security tax bump"](https://www.bogleheads.org/wiki/Taxation_of_Social_Security_benefits), and taking some tax-free account money could reduce your taxes quite a bit.

#### Required Minimum Distributions (RMDs)

At age 70 (well, 70.5) you start being required to take money out of your tax-deferred accounts. The government is tired of waiting for that tax money. This can mean much higher taxes than the earlier part of your retirement. 

When you retire, find out what your Social Security income and early RMD amounts will be. If the taxes are much higher than your pre-age-70 plan, meet with a tax professional to work through your options for optimizing things.

#### Medicare IRMAA Thresholds

If you have Medicare, your premiums go up if your income is too high. These are called ["IRMAA"](https://www.medicare.gov/your-medicare-costs/part-b-costs) charges. In 2021, these happen at a (married-filing-jointly) income over $176k.

#### ACA / Obamacare Subsidy Cliff

If you are under 65 and get health insurance from the ACA exchanges, you can get (substantial) subsidies to help pay for your premiums. These subsidies abruptly disappear at [400% of the "federal poverty level"](https://www.healthcare.gov/glossary/federal-poverty-level-fpl/) for your household size. This is called the ["ACA subsidy cliff"](https://www.verywellhealth.com/aca-subsidy-cliff-4770899). In 2021, for two people, that's $69,680. If your income will be close to that amount, it's probably a very good deal to stay just under that threshold.



## Getting IRA Money Before Age 60

The advice above is great if you're 60+ and can pull from any account, but how do you get money out of tax-deferred retirement accounts (401(k)s and IRAs) before 60? The rules seem clear: pay a 10% penalty for withdrawals before age 59.5. However, there is a workaround - "Roth ladders". There are two rules which make them work:

First, you are allowed to "convert" money from a regular IRA to a Roth IRA at any time. You pay taxes on any amount you convert as ordinary income, since you didn't pay tax putting it into the IRA and won't pay tax taking it out of the Roth IRA. You can convert as much as you want each year no matter your income. No limits.

Second, you are allowed to take **contributions** out of a Roth IRA any time. You only have to wait until age 59.5 to take out **growth**. Roth conversion amounts count as contributions. 

So, can you just convert IRA money to a Roth and immediately take it out? No, the government thought of that. There's one more rule - you can't take out a Roth converted amount for five years after the conversion.

Hmm, so what if you convert one year of spending every year, and then after five years, you'll have a five-year-old conversion available to take out? This is a Roth ladder, and this is allowed.

So, Roth ladders require you to pay for the first five years of retirement some other way. If you have a brokerage account, you can use that. If you contributed to your Roth IRA while working, those contributions are usable immediately. You could do some last saving in a bank account to cover it. Or, if you have to, use IRA money and pay the penalty for the first few years.

Also, note that you're still paying the same tax as you would from regular IRA withdrawals - you're converting one year of spending per year. This isn't a tax break, just a way to use your IRAs early.

You might read about another option for early withdrawals - "Substantially Equal Periodic Payments" (SEPP). Roth ladders are just better, though. If you start SEPP payments, you must continue until age 60. If you make a mistake, you owe penalties on everything you've taken out. A Roth ladder does the same thing with more safety and flexibility.

## Donating Money

I know, this is getting long. A quick word on donating money - if you have a plush retirement and want to make a lot of charitable donations, read about "qualified charitable donations" (QCDs) and "donor advised funds" (DAFs). These are ways you can get money from your retirement accounts to charities without triggering any taxes in the middle.
