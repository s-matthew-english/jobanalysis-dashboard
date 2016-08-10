/**
 * Autocomplete searchword fetch.
 * Uses typeahead.js: https://twitter.github.io/typeahead.js/
 * and Bootstrap Tags Input: http://bootstrap-tagsinput.github.io/bootstrap-tagsinput/examples/
 */
function LoadAutocomplete() {
    var topicset = [];
    /**
     * Fetches all skills from the database and create a bootstrap
     * tags input autocomplete.
     */
    $.ajax({
        type:     "GET",
        url:      "http://pankretas.ijs.si:8040/get_all_skills",
        dataType: "jsonp",
        cache:    false,
        success: function (json) {
            var skillset = json.skills;
            var skillmapping = $.map(skillset, function (skill) {
                return {
                  name: skill.value,
                  type: "skill"
              };
            });
            // skills typeahead and tags
            var skills = new Bloodhound({
                datumTokenizer: Bloodhound.tokenizers.obj.whitespace("name"),
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                local: skillmapping
            }); skills.initialize();

            $("#skill-search").tagsinput({
                itemValue: "name",
                typeaheadjs: {
                    name:       "skills",
                    displayKey: "name",
                    source:     skills.ttAdapter()
                }
            });
            // add the skillsets to topics
            topicset = topicset.concat(skillmapping);

            /**
             * Fetches all locations from the database and create a bootstrap
             * tags input autocomplete.
             */
            $.ajax({
                type:     "GET",
                url:      "http://pankretas.ijs.si:8040/get_all_locations",
                dataType: "jsonp",
                cache:    false,
                success: function (json) {
                    //TODO: change the database so that it doesn't contain locationName
                    var cityset = json.locations.filter(function (location) {
                        var countries = ['Andorra', 'Austria', 'Belgium', 'Bulgaria', 'Cyprus', 'Czech Republic', 'Switzerland', 'Denmark', 'Germany', 'Spain',
                            'Estonia', 'Finland', 'France', 'United Kingdom', 'Greece', 'Hungary', 'Croatia', 'Ireland', 'Italy', 'Lithuania', 'Luxembourg',
                            'Latvia', 'Malta', 'Netherlands', 'Poland', 'Portugal', 'Romania', 'San Marino', 'Ukraine', 'Slovakia', 'Slovenia', 'Czechia', 'LocationName'];
                      return countries.indexOf(location.value) == -1;
                    });

                    var citymapping = $.map(cityset, function (location) {
                        return {
                            name: location.value,
                            type: "city"
                        };
                    });
                    // locations typeahead and tags
                    var cities = new Bloodhound({
                        datumTokenizer: Bloodhound.tokenizers.obj.whitespace("name"),
                        queryTokenizer: Bloodhound.tokenizers.whitespace,
                        local:citymapping
                    }); cities.initialize();

                    $("#city-search").tagsinput({
                        itemValue: "name",
                        typeaheadjs: {
                            name:       "locations",
                            displayKey: "name",
                            source:     cities.ttAdapter()
                        }
                    });
                    // add the locationset to topics
                    topicset = topicset.concat(citymapping);

                    //TODO: change the database so that it doesn't contain locationName
                    var countryset = json.locations.filter(function (location) {
                        var countries = ['Andorra', 'Austria', 'Belgium', 'Bulgaria', 'Cyprus', 'Czech Republic', 'Switzerland', 'Denmark', 'Germany', 'Spain',
                            'Estonia', 'Finland', 'France', 'United Kingdom', 'Greece', 'Hungary', 'Croatia', 'Ireland', 'Italy', 'Lithuania', 'Luxembourg',
                            'Latvia', 'Malta', 'Netherlands', 'Poland', 'Portugal', 'Romania', 'San Marino', 'Ukraine', 'Slovakia', 'Slovenia', 'Czechia'];
                      return countries.indexOf(location.value) != -1;
                    });

                    var countrymapping = $.map(countryset, function (location) {
                        return {
                          name: location.value,
                          type: "country"
                        };
                    });


                    // locations typeahead and tags
                    var countries = new Bloodhound({
                        datumTokenizer: Bloodhound.tokenizers.obj.whitespace("name"),
                        queryTokenizer: Bloodhound.tokenizers.whitespace,
                        local: countrymapping
                    }); countries.initialize();

                    $("#country-search").tagsinput({
                        itemValue: "name",
                        typeaheadjs: {
                            name:       "locations",
                            displayKey: "name",
                            source:     countries.ttAdapter()
                        }
                    });
                    // add the locationset to topics
                    topicset = topicset.concat(countrymapping);


                    // create topic typeahead and tags
                    // locations typeahead and tags
                    var topics = new Bloodhound({
                        datumTokenizer: Bloodhound.tokenizers.obj.whitespace("name"),
                        queryTokenizer: Bloodhound.tokenizers.whitespace,
                        local: topicset
                    }); topics.initialize();

                    $("#topic-search").tagsinput({
                        itemValue: "name",
                        typeaheadjs: {
                            name:       "topics",
                            displayKey: "name",
                            source:     topics.ttAdapter()
                        }
                    });
                }
            });
        }
    });
}
