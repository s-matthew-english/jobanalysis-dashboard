/**
 * searchSuccess for the Job Seekers.
 * @param {Array.<object>} jobPosts - The data returned by the ajax calls.
 */
function searchSuccess(jobPostsRaw, searchQuery) {
    // array element structure
    //{ location: [number, number], timestamp: number, title: string, skillset: [string, ...], id: string  }

    // if ajax returns no jobs
    // Activate a "no data" trigger
    if (jobPostsRaw.error) {
        $("#error-trigger").trigger("click");
        $("#map-load-container").removeClass("loading");
        return;
    }

    var jobPosts = jobPostsRaw;
    // prepare the data for it's manipulation
    var allJobsInformation = jobPosts.data;

    //-------------------------------------------------------
    // Draws the job clusters on the map
    //-------------------------------------------------------
    europe.DrawPoints(allJobsInformation);

    //-------------------------------------------------------
    // Calculates the number-of-jobs per date histogram
    //-------------------------------------------------------

    var numberOfJobs = allJobsInformation.length;
    // update the statistics for job posts
    $('#infoStatJobPosts').html("<b>" + numberOfJobs + "</b>");

    //-------------------------------------------------------
    // Calculates the skill frequency histogram
    //-------------------------------------------------------

    // get the skill occurrences
    var skillOccurrences = {};
    for (var JobN = 0; JobN < allJobsInformation.length; JobN++) {
        var jobSkillset = allJobsInformation[JobN].skillset;
        for (var SkillN = 0; SkillN < jobSkillset.length; SkillN++) {
            var skill = jobSkillset[SkillN];
            if (skillOccurrences.hasOwnProperty(skill)) {
                skillOccurrences[skill] += 1;
            } else {
                skillOccurrences[skill] = 1;
            }
        }
    }
    // get number of skills
    var numberOfSkills = Object.keys(skillOccurrences).length;

    // update the statistics for job posts
    $('#infoStatSkills').html("<b>" + numberOfSkills + "</b>");

    //-------------------------------------------------------
    // Calculates the location frequency histogram
    //-------------------------------------------------------

    // get the location occurrences
    var locationOccurrences = {};
    for (var j = 0; j < allJobsInformation.length; j++) {
        var jobLocation = allJobsInformation[j].location_city;
        if (locationOccurrences.hasOwnProperty(jobLocation)) {
            locationOccurrences[jobLocation] += 1;
        } else {
            locationOccurrences[jobLocation] = 1;
        }
    }
    // get number of locations
    var numberOfLocations = Object.keys(locationOccurrences).length;
    // update the location statistics
    $('#infoStatLocations').html("<b>" + numberOfLocations + "</b>");


    //-------------------------------------------------------
    // Calculates the location frequency histogram
    //-------------------------------------------------------

    // reload jobs tables
    var jobDataTable = $('#top-jobs').DataTable();
    jobDataTable.destroy();

    //-------------------------------------------------------
    // Fill top jobs table
    //-------------------------------------------------------

    var jobsUpperbound = 100;
    var upperLimit = numberOfJobs < jobsUpperbound ? numberOfJobs : jobsUpperbound;
    var dataSet = [];
    for (var JobN = 0; JobN < upperLimit; JobN++) {
        var jobPost = allJobsInformation[JobN];

        var jobTitle = jobPost.jobTitle;
        // remove start and end <strong> tag
        jobTitle = jobTitle.replace(/<\/?strong>/g, '');
        jobTitle = jobTitle.replace(/&lt;\/?strong&gt;/g, '');

        var jobPostInfo = [];

        jobPostInfo[0] = jobTitle;
        jobPostInfo[1] = jobPost.date;
        jobPostInfo[2] = jobPost.organization;
        jobPostInfo[3] = jobPost.skillset ? jobPost.skillset : "";
        jobPostInfo[4] = jobPost.location_city ? jobPost.location_city : "";
        jobPostInfo[5] = jobPost.location_country ? jobPost.location_country : "";

        dataSet.push(jobPostInfo);
    }

    $('#top-jobs').DataTable({
        data: dataSet,
        lengthChange: false,
        columns: [
            { title: "Job Title" },
            { title: "Posting Date" },
            { title: "Hiring Organization" },
            { title: "Skills" },
            { title: "Location" },
            { title: "Country" }
        ],
        pageLength: 5,
        order: [[1, "desc"]],
        autoWidth: false
    });

    // remove the loader animation
    $("#load-container").removeClass("loading");
    $("#querylist").val(searchQuery);
}

// ---------------------------------------------
// Helper functions
// ---------------------------------------------

// clean the input bars
function cleanInputBars() {
    $("#topic-search").tagsinput("removeAll");
    $("#skill-search").tagsinput("removeAll");
    $("#city-search").tagsinput("removeAll");
    $("#country-search").tagsinput("removeAll");
}

// Search/query the selected skill
function querySkill(skillName) {
    cleanInputBars();
    $("#topic-search").tagsinput("add", { name: skillName, type: "skill" });
    searchOptions(dashboardType.JobSearch);
}

// Search/query the selected location
function queryLocation(locationName) {
    cleanInputBars();
    $("#topic-search").tagsinput("add", { name: locationName, type: "city" });
    searchOptions(dashboardType.JobSearch);
}
