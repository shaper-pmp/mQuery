#Media Queries for Javascript#
			
**Coming soon...**
			
A library exposing CSS media query functionality to javascript, for by-media targeting of behaviour as well as style.  Anticipated to be especially useful in conjunction with [codomins](http://www.shaper-labs.com/projects/codomins/), for by-media and by-browser-capability conditional loading of javascript (eg, for rich client widgets that are desired on graphical desktop machines, but which are too heavyweight or otherwise inappropriate for more limited/mobile devices).
			
##Status##
			
Currently:

* Correctly determining the CSS media types announced by the browser
* Tokenising passed-in media queries
			
Still to do:

* Build and execute parse-tree for supplied media queries, and return the truth-value of the query
* Expose "media query parser" API function, to allow code to be executed conditionally given a media query

Expected syntax:

    <script type="text/javascript">
      if(mQuery.query("handheld, (screen and device-width &lt; 800px)")) {
        alert('Small-screen browser');
      }
    </script>

... or perhaps with a callback:
			
    <script type="text/javascript">
      mQuery.q("handheld, (screen and device-width &lt; 800px)", function() {
        alert('Small-screen browser');
      });
    </script>

##Work in progress##

A very quick testing page ([mquery-test.html](http://www.shaper-labs.com/projects/mquery/mquery-test.html)) is included for convenience in the repository.

##Source Code##

Work-in-progress mQuery source code is available [on github](http://www.github.com/shaper-pmp/mquery).
