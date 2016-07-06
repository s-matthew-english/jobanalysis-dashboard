/*******************************************************
 * Search functions for the Policy Makers.
 */



/**
 * Query the selected skill. Used in the info-container.
 */
function querySkill(skillName) {
    $("#skill-search").tagsinput("removeAll");
    $("#location-search").tagsinput("removeAll");

    $("#skill-search").tagsinput("add", { name: skillName });
    searchOptions("PolicyMakers");
}

function queryLocation(locationName) {
    $("#skill-search").tagsinput("removeAll");
    $("#location-search").tagsinput("removeAll");

    $("#location-search").tagsinput("add", { name: locationName });
    searchOptions("PolicyMakers");
}

/**
 * search success Function for Policy makers
 */
function searchSuccess(json) {
    //{ location: [ number, number ], timestamp: number, title: string, skillset: [string, string, string], id: string  }
    var jobResults = json.jp_result;

    if (jobResults.length == 0) {
        console.log(jobResults)
        $("#error-trigger").trigger("click");
        $("#map-load-container").removeClass("loading");
        return;
    }

    var jobsAllInfo = [];
    for (var JobN = 0; JobN < jobResults.length; JobN++) {
        var job = jobResults[JobN];
        if (!job.long || !job.lat || job.locationName == "Northern Europe") {
            continue;
        }
        var timestamp = Date.parse(job.datePosted);
        var location = [job.long, job.lat];
        jobsAllInfo.push({
            locationCoordinates: location,
            location_city:       job.locationName,
            location_country:    job.parentName,
            timestamp:           timestamp,
            skillset:            job.skills,
            id:                  job.jobPostingUri
        });
    }

    function arrayObjectDateIndexOf(myArray, searchTerm, property) {
        for (var i = 0; i < myArray.length; i++) {
            if (myArray[i][property].getTime() === searchTerm.getTime()) return i;
        }
        return -1;
    }

    function arrayObjectIndexOf(myArray, searchTerm, property) {
        for (var i = 0; i < myArray.length; i++) {
            if (myArray[i][property] === searchTerm) return i;
        }
        return -1;
    }

    //-------------------------------------------------------
    // Draws the job clusters on the map
    //-------------------------------------------------------
    europe.DrawPoints(jobsAllInfo);
    // remove the .loader
    $("#map-load-container").removeClass("loading");

    //-------------------------------------------------------
    // Calculates the number-of-jobs per date chart
    //-------------------------------------------------------

    var jobDateNameFreq = [];

    for (var JobN = 0; JobN < jobsAllInfo.length; JobN++) {
        var jobpost = jobsAllInfo[JobN];

        var jobDateFull = new Date(jobResults[JobN].datePosted);
        var jobDateShort = new Date(jobDateFull.getFullYear(), jobDateFull.getMonth(), jobDateFull.getDate());

        var idx = arrayObjectDateIndexOf(jobDateNameFreq, jobDateShort, "date");
        if (idx > -1) {
            var jobDatePost = jobDateNameFreq[idx];
            jobDatePost.value += 1;

            var jobskills = jobpost.skillset;
            for (var SkillN = 0; SkillN < jobskills.length; SkillN++) {
                var jobDatePostSkills = jobDatePost.skillset;
                var skillidx = arrayObjectIndexOf(jobDatePostSkills, jobpost.skillset[SkillN], "name");
                if (skillidx > -1) {
                    jobDatePostSkills[skillidx].value += 1;
                } else {
                    jobDatePostSkills.push({
                        name:  jobpost.skillset[SkillN],
                        value: 1
                    });
                }
            }
        } else {
            var skills = [];
            var jobskills = jobpost.skillset;
            for (var SkillN = 0; SkillN < jobskills.length; SkillN++) {
                skills.push({
                    name:  jobskills[SkillN],
                    value: 1
                });
            }
            jobDateNameFreq.push({
                date:     jobDateShort,
                value:    1,
                skillset: skills
            });
        }
    }
    jobDateNameFreq.sort(function (a, b) {
        return a.date.getTime() > b.date.getTime() ? 1 : a.date.getTime() < b.date.getTime() ? -1 : 0;
    });

    for (var JobN = 0; JobN < jobDateNameFreq.length; JobN++) {
        jobDateNameFreq[JobN].skillset.sort(function (a, b) {
            return a.value < b.value ? 1 : a.value > b.value ? -1 : 0;
        });
    }

    var numberOfJobs = jobsAllInfo.length;
    // update the statistics for job posts
    $('#infoStatJobPosts').html("<b>" + numberOfJobs + "</b>");

    // create the histogram
    var dataset = {
        nameX: "date",
        nameY: "value",
        data:  jobDateNameFreq
    };
    dateLineplot.setDataset(dataset);

    dateLineplot.setMouseOverPointCallback(function (d) {
        var date = d.date.toDateString();
        var data;
        if (d.skillset.length > 10) {
            var data = d.skillset.slice(0, 9);
            // get the number of other skills
            var otherData = d.skillset.slice(10, d.skillset.length);
            if (otherData.length) {
                var count = 0;
                for (var ODataN = 0; ODataN < otherData.length; ODataN++) {
                    count += otherData[ODataN].value;
                }
                data.push({ name: "Other", value: count });
            }
        } else {
            data = d.skillset;
        }
        datePiechart.setDataset({
            title:     "Top 10 Skills",
            subtitle:  date,
            nameLabel: "name",
            nameValue: "value",
            data:      data
        });
    })

    //-------------------------------------------------------
    // Calculates the skill frequency histogram
    //-------------------------------------------------------

    // get the skill frequency
    var skillsFreq = {};
    for (var JobN = 0; JobN < jobResults.length; JobN++) {
        var jobSkills = jobResults[JobN].skills;
        for (var SklN = 0; SklN < jobSkills.length; SklN++) {
            var skill = jobSkills[SklN];
            if (skillsFreq.hasOwnProperty(skill)) {
                skillsFreq[skill] += 1;
            } else {
                skillsFreq[skill] = 1;
            }
        }
    }
    // sort skills by it's frequency
    var jobSkills = [];
    for (var key in skillsFreq) {
      jobSkills.push([key, skillsFreq[key]]);
    }
    jobSkills.sort(function (a, b) { return a[1] < b[1] ? 1 : a[1] > b[1] ? -1 : 0 });

    // create an array of skill-name, frequency pairs
    var numberOfSkills = jobSkills.length;

    var jobSkillNameFreq = [];

    for (var SkillN = 0; SkillN < numberOfSkills; SkillN++) {
        var JFPair = jobSkills[SkillN];
        jobSkillNameFreq.push({ name: JFPair[0], value: JFPair[1] });
    }

    // update the statistics for job posts
    $('#infoStatSkills').html("<b>" + numberOfSkills + "</b>");

    // create the histogram
    var dataset = {
        title:    "Job Posts By Skills",
        subtitle: "Top 50",
        data:     jobSkillNameFreq.slice(0, 50)
    };
    skillHistogram.setDataset(dataset);

    // prepare the default pie chart data
    var piechartData;
    if (jobSkillNameFreq.length > 10) {
        var piechartData = jobSkillNameFreq.slice(0, 9);
        // get the number of other skills
        var otherData = jobSkillNameFreq.slice(10, jobSkillNameFreq.length);
        if (otherData.length) {
            var count = 0;
            for (var ODataN = 0; ODataN < otherData.length; ODataN++) {
                count += otherData[ODataN].value;
            }
            piechartData.push({ name: "Other", value: count });
        }
    } else {
        piechartData = jobSkillNameFreq;
    }
    // update piechart options
    datePiechart.setDataset({
        title:     "Top 10 Skills",
        nameLabel: "name",
        nameValue: "value",
        data:      piechartData
    });

    dateLineplot.setMouseOutPointCallback(function (d) {
        datePiechart.setDataset({
            title:     "Top 10 Skills",
            nameLabel: "name",
            nameValue: "value",
            data:      piechartData
        });
    })

    //-------------------------------------------------------
    // Calculates the location frequency histogram
    //-------------------------------------------------------

    function RemoveCountries(array) {
        var countries = ['Andorra', 'Austria', 'Belgium', 'Bulgaria', 'Cyprus', 'Czech Republic', 'Switzerland', 'Denmark', 'Germany', 'Spain',
            'Estonia', 'Finland', 'France', 'United Kingdom', 'Greece', 'Hungary', 'Croatia', 'Ireland', 'Italy', 'Lithuania', 'Luxembourg',
            'Latvia', 'Malta', 'Netherlands', 'Poland', 'Portugal', 'Romania', 'San Marino', 'Ukraine', 'Slovakia', 'Slovenia', 'Czechia'];
        var countrieless = array.filter(function (job) { return countries.indexOf(job.locationName) == -1; });
        return countrieless;
    }
    var countrilessLocations = RemoveCountries(jobResults);
    // get the location frequency
    var locationFreq = {};
    for (var j = 0; j < countrilessLocations.length; j++) {
        var jobLocation = countrilessLocations[j].locationName;
        if (locationFreq.hasOwnProperty(jobLocation)) {
            locationFreq[jobLocation] += 1;
        } else {
            locationFreq[jobLocation] = 1;
        }
    }

    // sort job locations by their frequency
    var jobLocations = [];
    for (var key in locationFreq) {
       jobLocations.push([key, locationFreq[key]]);
    }
    jobLocations.sort(function (a, b) { return a[1] < b[1] ? 1 : a[1] > b[1] ? -1 : 0 });

    var numberOfLocations = jobLocations.length;
    var jobLocationNameFreq = [];

    // the upper bound for location representation
    var upperBoundLocation = 40;

    var lLimit = numberOfLocations < upperBoundLocation ? numberOfLocations : upperBoundLocation;
    for (var LocN = 0; LocN < lLimit; LocN++) {
        var jobLoc = jobLocations[LocN];
        jobLocationNameFreq.push({
            name:  jobLoc[0],
            value: jobLoc[1]
        });
    }

    // update the location statistics
    $('#infoStatLocations').html("<b>" + numberOfLocations + "</b>");

    // create the histogram
    var dataset = {
        title:    "Job Posts By Locations",
        subtitle: "Top 40",
        data:     jobLocationNameFreq
    };
    locationHistogram.setDataset(dataset);

    //-------------------------------------------------------
    // Calculates the countries frequency histogram
    //-------------------------------------------------------

    var nonemptyCountries = jobResults.filter(function (job) { return job.parentName != ""; });

    // get the location frequency
    var countryFreq = {};
    for (var j = 0; j < nonemptyCountries.length; j++) {
        var jobCountry = nonemptyCountries[j].parentName;
        if (countryFreq.hasOwnProperty(jobCountry)) {
            countryFreq[jobCountry] += 1;
        } else {
            countryFreq[jobCountry] = 1;
        }
    }

    // sort job locations by their frequency
    var jobCountries = [];
    for (var key in countryFreq) {
        jobCountries.push([key, countryFreq[key]]);
    }
    jobCountries.sort(function (a, b) { return a[1] < b[1] ? 1 : a[1] > b[1] ? -1 : 0 });

    var numberOfCountries = jobCountries.length;
    var jobCountriesNameFreq = [];

    // the upper bound for location representation
    var upperBoundCountries = 27;

    var cLimit = numberOfCountries < upperBoundCountries ? numberOfCountries : upperBoundCountries;
    for (var CountN = 0; CountN < cLimit; CountN++) {
        var jobCount = jobCountries[CountN];
        jobCountriesNameFreq.push({
            name:  jobCount[0],
            value: jobCount[1]
        });
    }

    // create the histogram
    var dataset = {
        title:    "Job Posts By Countries",
        subtitle: "EU Countries",
        data:     jobCountriesNameFreq
    };
    countriesHistogram.setDataset(dataset);
}
