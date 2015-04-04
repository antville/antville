This is a list of questions being asked from time to time (but then again probably a better term would be _not infrequently asked questions_), or questions some of the developers simply fantasized they should be asked once in a lifetime, or questions that in fact had to be invented because the answer was already there and it was considered necessary to make it public.

**Table of Contents:**


# General Questions #

## What are the features of Antville? ##

_(Note: This section needs an update.)_

Antville features the whole set of functionality needed for weblogs plus a number of advanced possibilities that make it distinguishable, eg. it supports _any_ language, the structure of stories can be changed freely (no more limitation to just a title and a text body), stories can be labelled with multiple tags, it provides many options for image and file handling, has a simple search engine integrated, comes with RSS feeds, user management and so on... Antville’s [list of features](AntvilleFeatures.md) is long, but the best thing is: even it offers all these possibilities it is still designed in a way that makes it easy to use.

## Is Antville a weblog hosting service? ##

Yes and no: Antville is the name of the software, but Antville.org in fact is set up as a weblog hosting service. We have decided to freeze the amount of weblogs at Antville.org end of 2002<sup><code>*</code></sup>, mainly because of the incentive to keep the service free of charge and to avoid running into performance troubles again. This was not a light-hearted decision but as the software is open source, anyone who wants to run a weblog hosting service can do so. _You can do it, too!_

<font size='1'><code>*</code>) Meanwhile new weblogs can be created on request.</font>

## Can I install and run Antville on my own computer? ##

Antville and Helma both run on top of any operating system that supports Java 2 (Linux, Mac OS X, Windows 2000/XP/Vista/7). Thus, provided that you already have Helma Object Publisher running on your machine, simply [download the latest release](http://code.google.com/p/antville/downloads) and follow the instructions in the [INSTALL file](http://antville.googlecode.com/svn/trunk/INSTALL).

For your personal setup or if you just want to give Antville a try, anyway, we provide a standalone distribution called [AntClick](AboutAntclick.md) which contains everything you need (except Java): Helma, Antville, a web server and a relational database. It is really easy to install and just takes a click to start it, all of the configuration can be done from within your browser.

For larger setups (e.g. hosting services like Antville.org) we recommend to install a full-blown web server (e.g. Apache) and a relational database (Antville was thoroughly tested with PostgreSQL and MySQL).

## Who else is using Antville? ##

Besides Antville.org there are a number of bigger sites providing similar services as well as a bunch of private weblogs base on Antville. Those we know about are compiled into the list of [sites based on Antville](AntvilleSites.md).

## How does Antville differ from other tools like blogger.com? ##

_(Note: This section needs an update regarding other blogging tools which gained popularity in the meantime.)_

First of all Antville is a centralized weblog hosting system: in contrary to Blogger.com or Radio Userland it doesn’t publish pages via FTP but serves them dynamically. One Antville server can easily host up to several hundred or thousand weblogs. (The number of weblogs is rather limited by the site owners choice and server power than by the software.)

Antville makes heavy use of the advantages of server based hosting. E.g. it has built-in support for comments, multiple authors per weblog, central login and registration etc.

Antville can be adapted easily to special needs by customizing its skins (that’s how templates are called in Antville-speak), and to some extend even the structure of a site based on antville can be changed too. Have a look at the [complete list](AntvilleFeatures.md) of Antville features.

## How does Antville relate to Twoday? ##

First of all: Twoday is based on Antville. At some point, some contributors were not happy with the way the Antville project was evolving and decided to fork away their own version. And why, they wanted to go commercial. However, at its core every Twoday site you see is Antville – just a wee bit more commercial.

## How does Antville relate to the national Austrian broadcaster (ORF)? ##

It is merely a coincidence that some years ago an excellent team of web developers met at the online subsidiary of ORF to create one of today’s most recognized online news sites in the german speaking world. Unsurprisingly, some of these people shared a broader vision of weaving the web even outside the company. Thus, they were professional co-workers of ORF.at by day and devoted architects of Antville at night. And before you are asking: yes, they still had a private life.
:)

## I am a journalist looking for a good tech story. What’s in it for me? ##

Well, how about this one: if you should not have realized yet, the last word here have the developers and the community, not the suits aka the business people. Antville is an outstanding example of an independent, autonomous and individual software project – made in Europe!

Second, this is an open source weblog system, free of charge. It can be widely used  by communities setting up their own Antville server or by users pushing their provider to put weblog hosting into their portfolio (instead of free webspace). Antville is easy to install, to maintain and to use, so why not spread the news that people start to create and develop their _own_ hosting service?

And last but not least: The Antville community is one swell brick of a community, really lovable, which already funded its own server hardware, supported further development during the [Antville Summer Of Code 2007](AntvilleSummerOfCode2007.md) and meanwhile pay the hosting bills with their regular donations to the Antville Verein (association).

# Technical Questions #

## How does Antville perform? ##

Really good, to avoid saying excellent. From the beginning Antville was designed for maximum performance, just like Helma herself which is extremely fast and stable. So on a quite normal machine serving several hundred thousand pages per day is not a big deal.

## Does Antville speak my language, too? ##

Of course it does! Well, if your language is not included in the list of supported languages already, it might be a little bit harder to make Antville speak your language – but it certainly is possible to [translate Antville](TranslatingAntville.md) into any language out there, even dialects and conlangs. Someone just has to do the translation which actually could not be easier following the TranslatingAntville tutorial.

## The translation of Antville in my language sucks, what can I do? ##

Please help improving the translations of Antville. The TranslatingAntville tutorial guides you through the process, step by step.

## I am already running an Antville installation. How do I upgrade? ##

As of version 1.2, Antville broke backwards-compatibility out of sheer necessity to make it easier to maintain and develop for a small group of programmers (think 1 person in average). However, there is an [updater application](http://code.google.com/p/antville/source/browse/#svn/trunk/extra/updater) in the `extras` directory which contains everything that was necessary to upgrade Antville.org from 1.1 to 1.2. As this upgrade was a very specific one – and other installations might be specific ones on their own – what has worked for Antville.org might not work for other Antville installs. Moreover, the updater is completely undocumented and working with it is considered a pain in the neck. If you maintain an Antville installation you would like to upgrade we would be glad to hear from you and we will see what we can to help you doing the deed. As a side-effect we hope to improve the updater app, and find a more generic and stable approach for future updates of Antville, anyway.

## What is the compatibility layer and how can I use it? ##

Version 1.2 of Antville brought a lot of changes in the core of the project – actually, it can be seen as a rewrite that was necessary to adapt to the fact that there was only one developer left at the time. In other words, Antville 1.2 is not backwards-compatible to existing installations of former versions. That is why a compatibility layer was added, mostly to re-enable certain deprecated macros. To turn on the compatibility layer simply uncomment the following line in Helma’s apps.properties file:
```
antville.repository.2 = ./apps/antville/compat
```

## How can I convert a layout from an older version of Antville to a newer one? ##

If you enable the compatibility layer a convert action will be added to the layout section. If you point your browser to the corresponding URL (e.g. http://localhost:8080/layout/convert), you can upload a version 1.1 layout as ZIP file and it will be converted to being compatible with version 1.2.

# History #

## How did you start working on Antville? ##

Here is kind of a “right people, right place” answer: once upon a time... Robert Gaggl and Hannes Wallnöfer were sitting in a bar, having a drink and talking about a weblog application as a “showcase” for [Helma Object Publisher](http://Helma.org), a scriptable and open-source web application server written in Java. The original commit of Antville took place on 18 of June 2001 and therefore marks the official day of birth. The event could not have taken place without the assistance of Tobi Schäfer completing the developer’s team at that time.

## What have been the reasons to start the project? ##

Recall 2001. At this time Blogger.com (not yet acquired by [Google](http://www.blogger.com/about/blogger_google_faq.pyra) but maintained by a company called Pyra labs which was in fact negotiating with [Trellix](http://www.danbricklin.com/log/blogger.htm)) had some serious financing and performance problems due to the growing numbers of users.

As the media started to report excessively about weblogs Blogger.com was promoted as one of the tools free of charge. The other weblog hosting service at that time, Editthispage.com, had already closed down the gratuitous option. Thus, the need for a free and easy weblog hosting platform was increasing.

Furthermore, most of the other weblog services were considered far too complicated for average users. Thus, the project team worked from the beginning towards the goal to make Antville as easy to use as possible: register, create a weblog and start to write.

Last but not least, Helma Object Publisher itself has a long tradition as underlying application server for weblogs: it was used to maintain the [collaborative weblog](http://replay.waybackmachine.org/20010721200619/http://classic.helma.at/) formerly known as Helma in 1998.