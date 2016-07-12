// Defined dashboard types
var dashboardType = {
    JobStatistics: "PolicyMakers",
    JobSearch:     "JobSeekers"
}

/**
 * The common search options function.
 * @param {string} dashbaordType - The name of the dashboard.
 */
function searchOptions(dashType) {
    // get skill and location query
    var topicArray   = $("#topic-search").tagsinput("items");
    var skillsArray  = $("#skill-search").tagsinput("items");
    var cityArray    = $("#city-search").tagsinput("items");
    var countryArray = $("#country-search").tagsinput("items");
    var parentCountries = ['Andorra', 'Austria', 'Belgium', 'Bulgaria', 'Cyprus', 'Czech Republic', 'Switzerland', 'Denmark', 'Germany', 'Spain',
        'Estonia', 'Finland', 'France', 'United Kingdom', 'Greece', 'Hungary', 'Croatia', 'Ireland', 'Italy', 'Lithuania', 'Luxembourg',
        'Latvia', 'Malta', 'Netherlands', 'Poland', 'Portugal', 'Romania', 'San Marino', 'Ukraine', 'Slovakia', 'Slovenia', 'Czechia'];
    //
    // var findQuery = 'QUERY';

    if (topicArray.length == 0 && skillsArray.length == 0 &&
        cityArray.length == 0 && countryArray.length == 0) {
        return;
    }

    // prepare the query string
    var queryString = '';

    var countSkills    = 0;
    var countLocations = 0;
    if (topicArray.length > 0) {
        var lastTopicIdx = topicArray.length - 1;
        for (var TopicN = 0; TopicN < lastTopicIdx; TopicN++) {
            var topic = topicArray[TopicN];
            if (topic.type == "skill") {
                queryString += 'q=' + topic.name + '&';
                countSkills++;
            } else {
                queryString += 'l=' + topic.name + '&';
                countLocations++;
            }
        }

        if (topicArray[lastTopicIdx].type == "skill") {
            queryString += 'q=' + topicArray[lastTopicIdx].name;
            countSkills++;
        } else {
            queryString += 'l=' + topicArray[lastTopicIdx].name;
            countLocations++;
        }

        // if we query the locations
        if (skillsArray.length > 0 || cityArray.length > 0 || countryArray.length > 0) {
            queryString += '&';
        }
    }

    // prepare query for skills
    if (skillsArray.length > 0) {
        // findQuery += ' [skills:';
        var lastSkillIdx = skillsArray.length - 1;
        for (var SkillIdx = 0; SkillIdx < lastSkillIdx ; SkillIdx++) {
            queryString += 'q=' + skillsArray[SkillIdx].name + '&';
            countSkills++;
            // findQuery += skillsArray[SkillIdx] + ',';
        }
        queryString += 'q=' + skillsArray[lastSkillIdx].name;
        countSkills++;
        // findQuery += skillsArray[lastSkillIdx] + ']';

        // if we query the locations
        if (cityArray.length > 0 || countryArray.length > 0) {
            queryString += '&';
        }
    }
    // prepare query for cities
    if (cityArray.length > 0) {
        // findQuery += ' [locations:';
        var lastLocIdx = cityArray.length - 1;
        for (var LocIdx = 0; LocIdx < lastLocIdx ; LocIdx++) {
            queryString += 'l=' + cityArray[LocIdx].name + '&';
            countLocations++;
            // findQuery += cityArray[LocIdx] + ',';
        }
        queryString += 'l=' + cityArray[lastLocIdx].name;
        countLocations++;
        // findQuery += cityArray[lastLocIdx] + ']';
        // if we query the locations
        if (countryArray.length > 0) {
            queryString += '&';
        }
    }
    // prepare query for countries
    if (countryArray.length > 0) {
        // findQuery += ' [locations:';
        var lastLocIdx = countryArray.length - 1;
        for (var LocIdx = 0; LocIdx < lastLocIdx ; LocIdx++) {
            queryString += 'l=' + countryArray[LocIdx].name + '&';
            countLocations++;
            // findQuery += countryArray[LocIdx] + ',';
        }
        queryString += 'l=' + countryArray[lastLocIdx].name;
        countLocations++;
        // findQuery += countryArray[lastLocIdx] + ']';
    }
    //
    // if ((skillsArray.length > 0) || (cityArray.length > 0) || (countryArray.length > 0)) {
    //     document.getElementById("query-container").innerHTML = '<h4 class= \"boundbox\">' + findQuery + '</h3>';
    // }

    // start the page-loader
    // TODO: cover the whole website when loading
    $("#map-load-container").addClass("loading");

    if (countSkills > 0) {
        $.ajax({
            type: "GET",
            url: "http://pankretas.ijs.si:8040/search_jobs_by_skill_and_location?" + queryString,
            data: queryString,
            dataType: 'jsonp',
            cache: false,
            success: function (json) {
                // found in searchPolicyMakers and searchJobSeekers
                searchSuccess(json);
            }
        });

        // for Job Seekers, query the lectures
        if (dashType == dashboardType.JobSearch) {
            //fill suggested materials table
            var find = '_';
            var re = new RegExp(find, 'g');
            var dataStringSuggested = encodeURI(queryString.replace(re, ''));

            $.ajax({
                type: "GET",
                url: "http://pankretas.ijs.si:8042/search_lectures_by_keyword?" + dataStringSuggested,
                data: queryString,
                dataType: 'jsonp',
                cache: false,
                success: function (json) {
                    FillLecturesTable(json);
                }
            });
        }
    }

    else if ((countSkills > 0) && (parentCountries.indexOf(cityArray[0].name) > -1)) {
       $.ajax({
           type: "GET",
           url: "http://pankretas.ijs.si:8040/search_jobs_by_parent_country?" + "q=" + cityArray[0],
           dataType: 'jsonp',
           cache: false,
           success: function (json) {
               // found in searchPolicyMakers and searchJobSeekers
               searchSuccess(json);
           }
       });

    }

    else if (countLocations > 0) {
        $.ajax({
            type: "GET",
            url: "http://pankretas.ijs.si:8040/search_jobs_by_location_name?" + queryString,
            data: queryString,
            dataType: 'jsonp',
            cache: false,
            success: function (json) {
                // found in searchPolicyMakers and searchJobSeekers
                searchSuccess(json);
            }
        });
    }
}

// loads the basic statistics data
function loadBasicStatistics() {
    // load number of jobs
    $.ajax({
        type: "GET",
        url: "http://pankretas.ijs.si:8040/get_number_of_jobs",
        dataType: 'jsonp',
        cache: false,
        success: function (json) {
            $('#infoStatJobPosts').html("<b>" + json.number_of_jobs + "</b>");
        }
    });
    // load number of locations
    $.ajax({
        type: "GET",
        url: "http://pankretas.ijs.si:8040/get_number_of_locations",
        dataType: 'jsonp',
        cache: false,
        success: function (json) {
            $('#infoStatLocations').html("<b>" + json.number_of_locations + "</b>");
        }
    });
    // load number of skills
    $.ajax({
        type: "GET",
        url: "http://pankretas.ijs.si:8040/get_number_of_skills",
        dataType: 'jsonp',
        cache: false,
        success: function (json) {
            $('#infoStatSkills').html("<b>" + json.number_of_skills + "</b>");
        }
    });
}


// ---------------------------------------------
// Helper functions
// ---------------------------------------------

/**
 * Fills the table with the videolectues information.
 * @param {object} json - Contains the videolectures information.
 */
function FillLecturesTable(json) {
    var videolectures = JSON.parse(unescape(json.lec_result));
    var sLimit = videolectures.length < 100 ? videolectures.length : 100;

    var videoSet = [];
    for (var s = 0; s < sLimit; s++) {
        var lecture = videolectures[s];

        var lecureInfo = [];
        lecureInfo[0] = lecture.lectureTitle;
        lecureInfo[1] = lecture.lectureDesc;
        lecureInfo[2] = "<a href=\"http://videolectures.net/" + lecture.url + "\">" + lecture.url + "</a>";
        var datePosted = lecture.recorded.substr(0, 10);
        lecureInfo[3] = datePosted;

        videoSet[s] = lecureInfo;
    }

    var onSuggestedTable = $('#suggested-materials').DataTable();
    onSuggestedTable.destroy();

    $('#suggested-materials').DataTable({
        data: videoSet,
        lengthChange: false,
        columns: [
            { title: "Lecture Title" },
            { title: "Lecture Description" },
            { title: "Lecture Url" },
            { title: "Date" }
        ],
        pageLength: 2,
        autoWidth: false
    });
}

// Toggles advanced options.
function toggleAdvancedOptions() {
    var button = $("#showAdvancedOptions");
    // change the options button
    if (button.attr("data-value") == "right") {
        button.removeClass("glyphicon-chevron-right")
                 .addClass("glyphicon-chevron-down");

        button.attr("data-value", "down");
    } else if (button.attr("data-value") == "down") {
        button.removeClass("glyphicon-chevron-down")
                 .addClass("glyphicon-chevron-right");

        button.attr("data-value", "right");
    } else {
        throw "Button data-value invalid";
    }
    // toggle the additional options
    $(".additional-options").slideToggle(200);
}
