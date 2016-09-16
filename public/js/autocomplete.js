/**
 * Autocomplete searchword fetch.
 * Uses typeahead.js: https://twitter.github.io/typeahead.js/
 * and Bootstrap Tags Input: http://bootstrap-tagsinput.github.io/bootstrap-tagsinput/examples/
 */
function LoadAutocomplete() {
    /**
     * Fetches all skills from the database and create a bootstrap
     * tags input autocomplete.
     */

     $.ajax({
         type:     "GET",
         url:      "/data/init/top-lists",
         success: function (json) {
             var trendset = [];

             var skillset = json.skills.data;
             var skillmapping = $.map(skillset, function (skill) {
                 return {
                   name: skill.name,
                   type: "skill"
               };
             });
             // skills typeahead and tags
             var skillsAutocomplete = new Bloodhound({
                 datumTokenizer: Bloodhound.tokenizers.obj.whitespace("name"),
                 queryTokenizer: Bloodhound.tokenizers.whitespace,
                 local: skillmapping
             }); skillsAutocomplete.initialize();

             $("#skill-search").tagsinput({
                 itemValue: "name",
                 typeaheadjs: {
                     name:       "skillset",
                     displayKey: "name",
                     source:     skillsAutocomplete.ttAdapter()
                 }
             });
             // add the skillsets to trends
             trendset = trendset.concat(skillmapping);

             var cities = json.locations.data;
             var citymapping = $.map(cities, function (location) {
                 return {
                     name: location.name,
                     type: "city"
                 };
             });
             var countries = json.countries.data;
             var countrymapping = $.map(countries, function (location) {
                 return {
                     name: location.name,
                     type: "country"
                 };
             });

             var locationsmapping = citymapping.concat(countrymapping);

             // locations typeahead and tags
             var locationAutocomplete = new Bloodhound({
                 datumTokenizer: Bloodhound.tokenizers.obj.whitespace("name"),
                 queryTokenizer: Bloodhound.tokenizers.whitespace,
                 local: locationsmapping
             }); locationAutocomplete.initialize();

             $("#location-search").tagsinput({
                 itemValue: "name",
                 typeaheadjs: {
                     name:       "locations",
                     displayKey: "name",
                     source:     locationAutocomplete.ttAdapter()
                 }
             });
             // add the locationsmapping to trends
             trendset = trendset.concat(locationsmapping);

            // create trend typeahead and tags
            var trendAutocomplete = new Bloodhound({
                datumTokenizer: Bloodhound.tokenizers.obj.whitespace("name"),
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                local: trendset
            }); trendAutocomplete.initialize();

            $("#trend-search").tagsinput({
                typeaheadjs: {
                    name:       "trend",
                    displayKey: "name",
                    source:     trendAutocomplete.ttAdapter()
                },
                itemValue: "name",
                trimValue: true,

            });
         }
     });
}
