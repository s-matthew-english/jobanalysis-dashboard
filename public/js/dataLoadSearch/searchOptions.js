// Defined dashboard types
var dashboardType = {
    JobStatistics: "PolicyMakers",
    JobSearch:     "JobSeekers"
};

/**
 * The common search options function.
 * @param {string} dashbaordType - The name of the dashboard.
 */
function searchOptions(dashType) {
    // get skill and location query
    var topicArray    = $("#trend-search").tagsinput("items");
    var skillsArray   = $("#skill-search").tagsinput("items");
    var locationArray = $("#location-search").tagsinput("items");

    if (topicArray.length === 0 && skillsArray.length === 0 &&
        locationArray.length === 0) {

        // notify user what he must do
        $.notify({
        	// options
        	icon: 'glyphicon glyphicon-warning-sign',
        	message: 'No search tags recognized in input. Please use the input bar and the dropdown menu to select the search tag.',
        	target: '_blank'
        },{
        	// settings
        	element: 'body',
        	position: "absolute",
        	type: "danger",
        	allow_dismiss: true,
        	newest_on_top: false,
        	showProgressbar: false,
        	placement: {
        		from: "bottom",
        		align: "right"
        	},
        	offset: 20,
        	spacing: 10,
        	z_index: 1031,
        	delay: 5000,
        	timer: 1000,
        	url_target: '_blank',
        	animate: {
        		enter: 'animated fadeInDown',
        		exit: 'animated fadeOutUp'
        	},
        	icon_type: 'class'
        });

        // remove the text in the input
        $("#span-skill-search .tt-input").val("");

        return;
    }

    // string of the search query
    var SearchQuery = '';
    // prepare the query string
    var queryString = '';

    var countQuery    = 0;
    if (topicArray.length > 0) {
        var lastTopicIdx = topicArray.length - 1;
        for (var TopicN = 0; TopicN < lastTopicIdx; TopicN++) {
            var topic = topicArray[TopicN];
            if (topic.type == "skill") {
                queryString += 'q=' + topic.name + '&';
                countQuery++;
            } else {
                queryString += 'l=' + topic.name + '&';
                countQuery++;
            }
            SearchQuery += topic.name + ', ';
        }

        if (topicArray[lastTopicIdx].type == "skill") {
            queryString += 'q=' + topicArray[lastTopicIdx].name;
            SearchQuery += topicArray[lastTopicIdx].name;
            countQuery++;
        } else {
            queryString += 'l=' + topicArray[lastTopicIdx].name;
            SearchQuery += topicArray[lastTopicIdx].name;
            countQuery++;
        }

        // if we query the locations
        if (skillsArray.length > 0 || locationArray.length > 0) {
            queryString += '&';
            SearchQuery += ', ';
        }
    }

    // prepare query for skills
    if (skillsArray.length > 0) {
        var lastSkillIdx = skillsArray.length - 1;
        for (var SkillIdx = 0; SkillIdx < lastSkillIdx ; SkillIdx++) {
            queryString += 'q=' + skillsArray[SkillIdx].name + '&';
            SearchQuery += skillsArray[SkillIdx].name + ', ';
            countQuery++;
        }
        queryString += 'q=' + skillsArray[lastSkillIdx].name;
        SearchQuery += skillsArray[lastSkillIdx].name;
        countQuery++;

        // if we query the locations
        if (locationArray.length > 0) {
            queryString += '&';
            SearchQuery += ', ';
        }
    }
    // prepare query for cities
    if (locationArray.length > 0) {
        var lastLocIdx = locationArray.length - 1;
        for (var LocIdx = 0; LocIdx < lastLocIdx ; LocIdx++) {
            queryString += 'l=' + locationArray[LocIdx].name + '&';
            SearchQuery += locationArray[lastLocIdx].name + ', ';
            countQuery++;
        }
        queryString += 'l=' + locationArray[lastLocIdx].name;
        SearchQuery += locationArray[lastLocIdx].name;
        countQuery++;
        // if we query the locations
        if (countryArray.length > 0) {
            queryString += '&';
            SearchQuery += ', ';
        }
    }

    // start the page-loader
    // TODO: cover the whole website when loading
    $("#load-container").addClass("loading");

    if (countQuery > 0) {
        $.ajax({
            type: "GET",
            url: "/data/jobposts?" + queryString,
            dataType: 'json',
            success: function (json) {
                // found in searchPolicyMakers and searchJobSeekers
                searchSuccess(json, SearchQuery);
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
}

// loads the basic statistics data
function loadBasicStatistics() {
    // load number of jobs
    $.ajax({
        type: "GET",
        url: "/data/init/statistics",
        cache: false,
        success: function (json) {
            $('#infoStatJobPosts').html("<b>" + json.numOfJobs + "</b>");
            $('#infoStatLocations').html("<b>" + json.numOfLocations + "</b>");
            $('#infoStatSkills').html("<b>" + json.numOfSkills + "</b>");
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
