/**
 * searchSuccess for the Policy Makers.
 * @param {Array.<object>} jobPosts - The data returned by the ajax calls.
 */
function searchSuccess(jobPostsRaw, searchQuery) {
    // Array element structure
    //{ location: [number, number], timestamp: number, title: string, skillset: [string, ...], id: string }
    var jobPosts = jobPostsRaw.jp_result;

    // if ajax returns no jobs
    // Activate a "no data" trigger
    if (jobPosts.length === 0) {
        $("#error-trigger").trigger("click");
        $("#map-load-container").removeClass("loading");
        return;
    }

    // prepare the data for it's manipulation
    var allJobsInformation = [];
    for (var JobN = 0; JobN < jobPosts.length; JobN++) {
        var job = jobPosts[JobN];
        // TODO: do something with the job posts with invalid coordinates
        if (!job.long || !job.lat || job.locationName == "Northern Europe") {
            continue;
        }
        var timestamp = Date.parse(job.datePosted);
        var location = [job.long, job.lat];
        allJobsInformation.push({
            id:                  job.jobPostingUri,
            timestamp:           timestamp,
            locationCoordinates: location,
            location_city:       job.locationName,
            location_country:    job.parentName,
            skillset:            job.skills
        });
    }

    /**
     * Returns the index of the object in an array which matches the criteria.
     * Used only for date key-value search.
     * @param  {Array.<object>} myArray - The array in which we search for.
     * @param  {string} searchTerm      - The term were searching for.
     * @param  {string} property        - The key name were searching for.
     * @return {number} The index number. If the object is not in the array, returns -1.
     */
    function arrayObjectDateIndexOf(myArray, searchTerm, property) {
        for (var i = 0; i < myArray.length; i++) {
            if (myArray[i][property].getTime() === searchTerm.getTime()) return i;
        }
        return -1;
    }

    /**
     * Returns the index of the object in an array which matches the criteria.
     * @param  {Array.<object>} myArray - The array in which we search for.
     * @param  {string} searchTerm      - The term were searching for.
     * @param  {string} property        - The key name were searching for.
     * @return {number} The index number. If the object is not in the array, returns -1.
     */
    function arrayObjectIndexOf(myArray, searchTerm, property) {
        for (var i = 0; i < myArray.length; i++) {
            if (myArray[i][property] === searchTerm) return i;
        }
        return -1;
    }

    var numberOfJobs = allJobsInformation.length;
    // update the statistics for job posts
    $('#infoStatJobPosts').html("<b>" + numberOfJobs + "</b>");

    //-------------------------------------------------------
    // Draws the job clusters on the map
    //-------------------------------------------------------
    europe.DrawPoints(allJobsInformation);

    //-------------------------------------------------------
    // Calculates the number-of-jobs per date chart
    //-------------------------------------------------------

    var jobDateArray = [];
    for (var JobN = 0; JobN < allJobsInformation.length; JobN++) {
        var job = allJobsInformation[JobN];

        var jobDateFull  = new Date(jobPosts[JobN].datePosted);
        var jobDateShort = new Date(jobDateFull.getFullYear(), jobDateFull.getMonth(), jobDateFull.getDate());

        var idx = arrayObjectDateIndexOf(jobDateArray, jobDateShort, "date");
        if (idx > -1) {
            var jobDatePost = jobDateArray[idx];
            jobDatePost.value += 1;

            var jobSkills = job.skillset;
            for (var SkillN = 0; SkillN < jobSkills.length; SkillN++) {
                var jobPostSkills = jobDatePost.skillset;
                var skillIdx = arrayObjectIndexOf(jobPostSkills, job.skillset[SkillN], "name");
                if (skillIdx > -1) {
                    jobPostSkills[skillIdx].value += 1;
                } else {
                    jobPostSkills.push({
                        name:  job.skillset[SkillN],
                        value: 1
                    });
                }
            }
        } else {
            var skills    = [],
                jobSkills = job.skillset;
            for (var SkillN = 0; SkillN < jobSkills.length; SkillN++) {
                skills.push({
                    name:  jobSkills[SkillN],
                    value: 1
                });
            }
            jobDateArray.push({
                date:     jobDateShort,
                skillset: skills,
                value:    1
            });
        }
    }
    jobDateArray.sort(function (a, b) {
        return a.date.getTime() > b.date.getTime() ? 1 : a.date.getTime() < b.date.getTime() ? -1 : 0;
    });

    for (var JobN = 0; JobN < jobDateArray.length; JobN++) {
        jobDateArray[JobN].skillset.sort(function (a, b) {
            return a.value < b.value ? 1 : a.value > b.value ? -1 : 0;
        });
    }

    // create the lineplot
    var dataset = {
        nameX: "date",
        nameY: "value",
        data:  jobDateArray
    };
    dateLineplot.setDataset(dataset);
    // add the on mouseover function
    dateLineplot.setMouseOverPointCallback(function (d) {
        var data;
        if (d.skillset.length > 10) {
            data = d.skillset.slice(0, 9);
            // get the number of other skills
            var otherData = d.skillset.slice(10, d.skillset.length);
            if (otherData.length !== 0) {
                var count = 0;
                for (var DataN = 0; DataN < otherData.length; DataN++) {
                    count += otherData[DataN].value;
                }
                data.push({ name: "Other", value: count });
            }
        } else {
            data = d.skillset;
        }

        var date = d.date.toDateString();
        datePiechart.setOptions({ chartSubtitle: date });
        datePiechart.setDataset({
            nameLabel: "name",
            nameValue: "value",
            data:      data
        });
    });

    //-------------------------------------------------------
    // Calculates the skill histogram
    //-------------------------------------------------------

    var jobSkillArray = [];
    for (var JobN = 0; JobN < allJobsInformation.length; JobN++) {
        var job = allJobsInformation[JobN];
        var jobSkills = job.skillset;
        for (var SkillN = 0; SkillN < jobSkills.length; SkillN++) {
            var skillIdx = arrayObjectIndexOf(jobSkillArray, jobSkills[SkillN], "name");
            if (skillIdx > -1) {
                jobSkillArray[skillIdx].value += 1;
            } else {
                jobSkillArray.push({
                    name:  jobSkills[SkillN],
                    value: 1
                });
            }
        }
    }
    jobSkillArray.sort(function (a, b) {
        return a.value < b.value ? 1 : a.value > b.value ? -1 : 0;
    });

    // create an array of skill-name, frequency pairs
    var numberOfSkills = jobSkillArray.length;

    // update the statistics for job posts
    $('#infoStatSkills').html("<b>" + numberOfSkills + "</b>");

    // create the histogram
    dataset = {
        title:    "Job Posts By Skills",
        subtitle: "Top 50",
        data:     jobSkillArray.slice(0, 50)
    };
    skillHistogram.setDataset(dataset);

    // prepare the default pie chart data
    var piechartData;
    if (jobSkillArray.length > 10) {
        piechartData = jobSkillArray.slice(0, 9);
        // get the number of other skills
        var otherData = jobSkillArray.slice(10, jobSkillArray.length);
        if (otherData.length) {
            var count = 0;
            for (var DataN = 0; DataN < otherData.length; DataN++) {
                count += otherData[DataN].value;
            }
            piechartData.push({ name: "Other", value: count });
        }
    } else {
        piechartData = jobSkillArray;
    }
    // set the piechart dataset
    datePiechart.setDataset({
        nameLabel: "name",
        nameValue: "value",
        data:      piechartData
    });
    // add the on mouseout function
    dateLineplot.setMouseOutPointCallback(function () {
        datePiechart.setOptions({ chartSubtitle: "" });
        datePiechart.setDataset({
            nameLabel: "name",
            nameValue: "value",
            data:      piechartData
        });
    });

    //-------------------------------------------------------
    // Calculates the location histogram
    //-------------------------------------------------------

    /**
     * Removes the instances, where location_city is a country.
     * @param {Array.<object>} array - The array objects.
     * @returns An array of elements where location_city isn't a country.
     */
    function RemoveCountries(array) {
        var countries = ['Andorra', 'Austria', 'Belgium', 'Bulgaria', 'Cyprus',
        'Czech Republic', 'Switzerland', 'Denmark', 'Germany', 'Spain', 'Estonia',
        'Finland', 'France', 'United Kingdom', 'Greece', 'Hungary', 'Croatia',
        'Ireland', 'Italy', 'Lithuania', 'Luxembourg', 'Latvia', 'Malta', 'Netherlands',
        'Poland', 'Portugal', 'Romania', 'San Marino', 'Ukraine','Slovakia', 'Slovenia',
        'Czechia'];
        var countrieless = array.filter(function (job) {
            return countries.indexOf(job.location_city) == -1;
        });
        return countrieless;
    }
    var countrilessLocations = RemoveCountries(allJobsInformation);

    var jobLocationArray = [];
    for (var JobN = 0; JobN < countrilessLocations.length; JobN++) {
        var job = countrilessLocations[JobN];
        var jobLocations = job.location_city;
        var locationIdx = arrayObjectIndexOf(jobLocationArray, jobLocations, "name");
        if (locationIdx > -1) {
            jobLocationArray[locationIdx].value += 1;
        } else {
            jobLocationArray.push({
                name:  jobLocations,
                value: 1
            });
        }
    }
    jobLocationArray.sort(function (a, b) {
        return a.value < b.value ? 1 : a.value > b.value ? -1 : 0;
    });

    var numberOfLocations = jobLocationArray.length;

    // update the location statistics
    $('#infoStatLocations').html("<b>" + numberOfLocations + "</b>");

    // create the histogram
    dataset = {
        title:    "Job Posts By Locations",
        subtitle: "Top 40",
        data:     jobLocationArray.slice(0, 40)
    };
    locationHistogram.setDataset(dataset);

    //-------------------------------------------------------
    // Calculates the countries histogram
    //-------------------------------------------------------

    var nonemptyCountries = allJobsInformation.filter(function (job) {
        return job.location_country !== "";
    });

    var jobCountryArray = [];
    for (var JobN = 0; JobN < nonemptyCountries.length; JobN++) {
        var job = nonemptyCountries[JobN];
        var jobCountry= job.location_country;
        var countryIdx = arrayObjectIndexOf(jobCountryArray, jobCountry, "name");
        if (countryIdx > -1) {
            jobCountryArray[countryIdx].value += 1;
        } else {
            jobCountryArray.push({
                name:  jobCountry,
                value: 1
            });
        }
    }
    jobCountryArray.sort(function (a, b) {
        return a.value < b.value ? 1 : a.value > b.value ? -1 : 0;
    });

    // create the histogram
    dataset = {
        title:    "Job Posts By Countries",
        subtitle: "EU Countries",
        data:     jobCountryArray.slice(0, 30)
    };
    countriesHistogram.setDataset(dataset);

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
    searchOptions(dashboardType.JobStatistics);
}

// Search/query the selected location
function queryLocation(locationName) {
    cleanInputBars();
    $("#topic-search").tagsinput("add", { name: locationName, type: "city" });
    searchOptions(dashboardType.JobStatistics);
}
