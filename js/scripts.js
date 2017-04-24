    (function () {

        var obj = data.SearchResults.hits;
        var string = '';
        for(var key in obj)
          string += obj[key].fields.summary + ' '; //console.log(obj[key].fields.summary);


        //console.log('xstring',xstring);

        /* Below is a regular expression that finds alphanumeric characters
           Next is a string that could easily be replaced with a reference to a form control
           Lastly, we have an array that will hold any words matching our pattern */
        var pattern = /\w+/g;
            //string = "I I am am am yes yes. corrupt am corrupt. I yes I corrupt yes am two three one lego lego corrupt am corrupt I",
        var matchedWords = string.match( pattern );



        //console.log('matchedWords',matchedWords);

        /* The Array.prototype.reduce method assists us in producing a single value from an
           array. In this case, we're going to use it to output an object with results. */;
        var counts = matchedWords.reduce(function ( stats, word ) {

;            /* `stats` is the object that we'll be building up over time.
               `word` is each individual entry in the `matchedWords` array */
            if ( stats.hasOwnProperty( word ) ) {
                /* `stats` already has an entry for the current `word`.
                   As a result, let's increment the count for that `word`. */
                stats[ word ] = stats[ word ] + 1;
            } else {
                /* `stats` does not yet have an entry for the current `word`.
                   As a result, let's add a new entry, and set count to 1. */
                stats[ word ] = 1;
            }
            //console.log('stats',stats);

            /* Because we are building up `stats` over numerous iterations,
               we need to return it for the next pass to modify it. */
            return stats;

        }, {} );

        /* Now that `counts` has our object, we can log it. */
        console.log( counts );

        // PHRASE FILTER FUNCTION
        var filterfunction = function(phrase) {
            
          var word_filter = 'the of in and to by a his as at up s';
          var count = 0;
          phrase = ' ' + phrase + ' ';
          //if phrase has over 50% filter words elinate or rank lower

          // turn phrase into array  
          var words = word_filter.split(" ");
          var phrase_word_count = phrase.trim().split(" ");

          // loop through array and count filter words
          // multiple search words
          for(var i = 0; i < words.length; i++) {

              var regex = new RegExp(" " + words[i] + " ", "g");              
              if(phrase.match(regex)) 
                count = count + phrase.match(regex).length; //console.log('occurance of '+ words[i] + ' = ' + phrase.match(regex).length);

          }

          // is filter words count over 50% of word count
          if((phrase_word_count.length / count) < 2)
            return false; 
          
          return true;
        }

        // FULLPHRASE PARSER FUNCTION
        var fullphrase = function(pl, matchedWords) {
          var filtered = false;
          var phrase = '';
          var fullphrases = [];
          for (var i in matchedWords) {
            phrase = '';
            if(i > (pl-2) && i < matchedWords.length) {

              for (ii = (pl-1); ii > -1; ii--) { 
                  phrase += matchedWords[i-ii]  + ' ';
              }
              
              //filter the phrase here
              filtered = filterfunction(phrase.trim());
              if(filtered){
                //var phrase.trim() = weightedpc(phrase.trim());
                fullphrases.push( phrase.trim() );
              }
              
            }
          }
          return fullphrases;
        }

        //var a = fullphrase(2,matchedWords);
        var a = fullphrase(3,matchedWords);
        var c = fullphrase(4,matchedWords);
        var d = fullphrase(5,matchedWords);
        //a.push.apply( a, b);
        a.push.apply( a, c);
        a.push.apply( a, d);
        var allphrases = a;
        //console.log('allphrases', allphrases);

        var phrasecounts = allphrases.reduce(function ( stats, phrase ) {

            if ( stats.hasOwnProperty( phrase ) ) {

                stats[ phrase ] = stats[ phrase ] + 1;

            } else {

                stats[ phrase ] = 1;

            }

            return stats;

        }, {} );

        var avWordLen = function(x) {
            var wordCount = x.split(" ").length; 
            var wordArray = x.split(" ");
            var wordAvg = 0;
            for (var i = 0; i < wordCount; i++){
                wordAvg += wordArray[i].length;
            }
            var avgLen = wordAvg / wordCount;
            return avgLen;
        };

        //console.log('phrasecounts', phrasecounts );





        var p = {
            "phrases": []
        }

        var addPhraseItem = function(phrase,hit,avglen,obj) {
            obj.push({'phrase': phrase, 'hit': hit, 'avglen' : avglen});
        }

        for(var phrase in phrasecounts) {
          avglen = avWordLen(phrase);
          if(phrasecounts[phrase] > 1) {
            addPhraseItem(phrase, phrasecounts[phrase], avglen, p.phrases);
          }  
        }

        //console.log(p);

        // 1 word > 3 letters 1
        // 2 words 1 of which > 3 letters 2
        // 2 words 1 of which > 4 letters 3
        // 2 words 1 of which > 5 letters 4
        // 2 words 2 of which > 3 letters 4
        // 2 words 2 of which > 4 letters 5
        // 3 words 2 of which > 4 letters 6

        //SORT OBJECT PROPERTIES BY VALUE
        var sortedpc = function(obj) {
          // convert object into array
          var sortable=[];
          var rank=0;
          for(var key in obj){
            //rank = avWordLen(key);
            if(obj.hasOwnProperty(key)){
              sortable.push([key, obj[key]]); // each item is an array in format [key, value]
            }
          }
          
          // sort items by value
          sortable.sort(function(a, b)
          {
            // console.log('a[0]:'+a[0]+' | b[0]:'+b[0]);
            // console.log('a[1]:'+a[1]+' | b[1]:'+b[1]);
            //return a[1]-b[1]; // compare numbers
            //return (a[1]+a[2])-(b[1]+b[2]); // compare numbers
            return (a[1])-(b[1]); // compare numbers
          });
          return sortable;
        }

        // SORT BY
        var sort_by = function() {
            var fields = [].slice.call(arguments),
                n_fields = fields.length;

            return function(A, B) {
                var a, b, field, key, primer, reverse, result;
                for (var i = 0, l = n_fields; i < l; i++) {
                    result = 0;
                    field = fields[i];

                    key = typeof field === 'string' ? field : field.name;

                    a = A[key];
                    b = B[key];

                    if (typeof field.primer !== 'undefined') {
                        a = field.primer(a);
                        b = field.primer(b);
                    }

                    reverse = (field.reverse) ? -1 : 1;

                    if (a < b) result = reverse * -1;
                    if (a > b) result = reverse * 1;
                    if (result !== 0) break;
                }
                return result;
            }
        }



        //console.log('phrasecounts:',phrasecounts);
        //var sorted_phrases = sortedpc(phrasecounts).reverse();
        //var sorted_phrases = sortedpc(p.phrases).reverse();

        p.phrases.sort(sort_by('hit', {
            name: 'avglen',
            primer: parseInt,
            reverse: false
        })).reverse();


        var compareAB = function(strA,strB){
            for(var result = 0, i = strA.length; i--;){
                if(typeof strB[i] == 'undefined' || strA[i] == strB[i]);
                else if(strA[i].toLowerCase() == strB[i].toLowerCase())
                    result++;
                else
                    result += 4;
            }
            return 1 - (result + 4*Math.abs(strA.length - strB.length))/(2*(strA.length+strB.length));
            //console.log( 1 - (result + 4*Math.abs(strA.length - strB.length))/(2*(strA.length+strB.length)));

        }

        var comp = p.phrases;
        var dedupe = function(phrases, amount) {

            for (var i = 0; i < amount; i++) {

                var c = 0;
                var top_phrase = p.phrases[i].phrase
                for (var key in comp) {
                    c = compareAB(top_phrase, comp[key].phrase);
                    if (c > .8) {
                      console.log('deduped this | '+top_phrase+' | '+comp[key].phrase);
                      comp.splice(key, 1);
                    }
                }

            }
        }

        dedupe(p.phrases, 400);

        console.log('p.phrases:',p.phrases);
        console.log('comp:',comp);

        // compare top 400 to the rest and eliminate high scoring comparisons
        // loop through p.phrases
        
                


        //console.log('data',data.SearchResults.hits);

    }());