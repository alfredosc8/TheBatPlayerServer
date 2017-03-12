The Bat Server
==================

A NodeJS server-side application for providing metadata from a streaming internet radio source.  Currently used for [The Bat Player](https://github.com/gabek/TheBatPlayerRoku) Roku internet radio client.

###**Example Output**
```javascript
{
    "artist": "Phosgore",
    "song": "Club Domination (Stahlfrequenz Remix)",
    "album": {
        "name": "Domination",
        "image": "http://userserve-ak.last.fm/serve/300x300/35852607.jpg",
        "released": 2009,
    },
    "bio": {
        "text": "Founded in 2008, this one man project wants to bring electronic music where it belongs - to the dancefloor!   No romantic song texts, no multi - coloured - plastic - hair sporting singers, and no bats flying out of anyones ass... Just Industrial, Electro, and Hardstyle elements melted down into a substance which forces its consumers into a relentless dancing spree.        Read more about Phosgore on Last.fm.",
        "published": 2009
    },
    "image": {
        "url": "http://batserver.thebatplayer.fm/images/artist/http%3A%2F%2Fuserserve-ak.last.fm%2Fserve%2F500%2F29286573%2FPhosgore%2B2_1280.jpg/106/54/5",
        "color": {
            "rgb": {
                "red": 106,
                "green": 54,
                "blue": 5
            }
        },
        "backgroundurl": "http://batserver.thebatplayer.fm/images/background/http%3A%2F%2Fuserserve-ak.last.fm%2Fserve%2F500%2F29286573%2FPhosgore%2B2_1280.jpg/106/54/5"
    },
    "tags": [
        "powernoise",
        "industrial",
        "ebm",
        "hellectro",
        "tbm"
    ],
    "station": {
        "listeners": "71",
        "bitrate": "128",
    }
}
```
###**Notes**
This is not built to be very general purpose.  It uses a couple a handful of specific things such as AWS Elasticache auto-discovery, the Imgx for image generation, and a bunch of analytics and bug reporting for my own use. So if you'd like to assist in generalizing this code because you use it yourself I'd appreciate a Pull Request.

###**Running**
1. Copy Config-example.js to Config.js and add your respective keys.
2. _npm install_
3. _make test_ to verify everything is working.
4. Either install and run memcached or turn *enableCache* off in your Config.js.
5. _make dev_ to run.
6. Make a request such as http://localhost:3000/metadata/http%3A%2F%2Fice1.somafm.com%2Fgroovesalad-128.mp3

###**Goals**
1. Centralize the logic required for taking an audio stream and determining the current song.
 * Shoutcast v1 csv metadata.
 * Shoutcast v2 xml metadata.
 * In-stream icy metadata.
2. Taking a known artist name and track name and determine:
 * The most reasonable album that it came from by aggregating Discogs, Musicbrainz, and Last.FM results and making a logical guess.
 * An image representative of the artist.
 * An image representative of the album.
 * A bio for the artist.
 * Misc tags and/or genres that are useful.
3. Create the dynamic images required for The Bat Player client:
 * A resized image for station selection.
 * An image for the artist during a song.
 * An image for the background during a song.
 * A header image with custom text.
4. Pull color information from the artist image for the client to use in customizing each song.
5. Caching this data centrally so multiple people listening to the same station won't create additional load and so it's quickly available later.

###**Challanges**
1. There are many different internet radio streaming services out there.  Usually the option of connecting to the actual stream and waiting for some metadata to arrive as a last ditch effort works, but for some services meatadata will just never be available.
2. Finding the *correct* album for a artist/track combo is far more difficult than it sounds.  The more popular a song, the more versions of the song is available under the same name.  Live, remixes, karaoke, radio edit, extended version, compilations etc.  The correct answer is usually "The oldest release that's not a Live, Single, EP or compilation release."  But some albums don't have available release dates, either.
3. Different metadata sources have different qualities and quantities of information.  The current approach is to query them all and then try and make some sense out of the results.

###**Tests**
1. There are a handful of integration tests written.
  * Metadata fetching
  * Artist, background and header image generation.
  * Color detection
  * Current song fetching utilizing the different methods.

###**Want to help?**
1. File a GitHub issue.
2. Create a pull request for a feature or bug fix.
3. Teach me something about Node development I don't know.  This is my first Node app.
4. Write a client on top of this service and let me know how it's working for you.
5. Check out [The Bat Player](https://github.com/gabek/TheBatPlayerRoku).

[![Video](http://f.cl.ly/items/1O461y2v2N2D1k151Q0S/TheBatPlayerDemoGif.gif)](https://vimeo.com/112659447)

The MIT License (MIT)

Copyright (c) 2016 Gabe Kangas

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
