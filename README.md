# GULP 4 SETUP

This is an implementation of Gulp 4 I did recently (12/09/19) for a contract. It's built on MacOS (Remember SASS compiling with Gulp is platform and Gulp version-dependent).

This  uses non(e)-critical and critical CSS paths, JS compiling and nunjucks rendering. Just delete what you don't need (and change the paths obvs).

It also uses caching and file changed plugins so Gulp only ever compiles what has changed. Be careful using *fscache* with its *gulp-util* dependency as *gulp-util* is deprecated and you may need to find some other way to cache files. Personally I suspect this won't happen for a good while as there are quite a few popular Gulp plugins which rely on it (don't take my word for it as I haven't checked out what the developers of plugins like *gulp-minify* are up to). Just keep an eye on things when you update. I really like the the simplicty/understand-ability of *fscache* and **woah** does it speed compiling up.

Unfortunately with Gulp 4 timestamping of files has been removed from core so Touch is needed.

From a day's testing it runs pretty fast once the cache folders have been generated.

I would recommend installing NVM to manage your Node versions - it takes the pain of updating away (you may find when switching from purely NPM that its global location is wrong - just remove EVERYTHING and start again with NVM).

Enjoy and get in touch if this helps. I'm uploading because there are very few full example implementations of Gulp 4 I could see on the web and this one works pretty well. 50ms -> 2 seconds total compile time? Yes, please. (Machine dependent, no guarantees!).
