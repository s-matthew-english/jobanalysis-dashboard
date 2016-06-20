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
        console.log("No data found!");
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
            location_city: job.locationName,
            location_country: job.parentName,
            timestamp: timestamp,
            skillset: job.skills,
            id: job.jobPostingUri
        });
    }
    
    
    //-------------------------------------------------------
    // Draws the job clusters on the map
    //-------------------------------------------------------
    europe.DrawPoints(jobsAllInfo);
    // remove the .loader
    $("#map-load-container").removeClass("loading");
    

    //-------------------------------------------------------
    // Calculates the number-of-jobs per date histogram
    //-------------------------------------------------------
    
    // get the job dates by frequency
    var jobsDateFreq = {};
    for (var JobN = 0; JobN < jobResults.length; JobN++) {
        var jobDateFull = new Date(jobResults[JobN].datePosted);
        var jobDateShort = new Date(jobDateFull.getFullYear(), jobDateFull.getMonth(), jobDateFull.getDate());
        
        if (jobsDateFreq[jobDateShort] != null) {
            jobsDateFreq[jobDateShort] += 1;
        } else {
            jobsDateFreq[jobDateShort] = 1;
        }
    }
    // prepare the time for sorting
    var dateKeys = [];
    var dateJPSortedKeys = {};
    for (var dKey in jobsDateFreq) {
        var dateKeyJPTime = Date.parse(dKey);
        dateKeys.push(dateKeyJPTime);
        dateJPSortedKeys[dateKeyJPTime] = dKey;
    }
    dateKeys.sort();
    
    // construct the sorted list of lobs and time
    var jobsByDates = [];
    var jobDateNameFreq = [];
    for (var DateN = 0; DateN < dateKeys.length; DateN++) {
        var dkeyJPT = dateKeys[DateN];
        var dKey = dateJPSortedKeys[dkeyJPT];
        jobDateNameFreq.push({ name: new Date(Date.parse(dKey)), value: jobsDateFreq[dKey] });
        jobsByDates.push([Date.parse(dKey), jobsDateFreq[dKey]]);
    }

    var numberOfJobs = jobsAllInfo.length;
    // update the statistics for job posts
    $('#infoStatJobPosts').html("<b>" + numberOfJobs + "</b>");
    
    // create the histogram
    var dataset = { name: "Job Posts By Dates", yAxisName: "Number of jobs", data: jobDateNameFreq };
    dateHistogram.setData(dataset);
    

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
    // the upper bound for skill representations
    var upperBoundSkills = 50;

    var sLimit = numberOfSkills < upperBoundSkills ? numberOfSkills : upperBoundSkills;
    for (var SkillN = 0; SkillN < sLimit; SkillN++) {
        var JFPair = jobSkills[SkillN];
        jobSkillNameFreq.push({ name: JFPair[0], value: JFPair[1] });
    }
    
    // update the statistics for job posts
    $('#infoStatSkills').html("<b>" + numberOfSkills + "</b>");
    
    // create the histogram
    var dataset = { name: "Job Posts By Skills", yAxisName: "Number of jobs", data: jobSkillNameFreq };
    skillHistogram.setData(dataset);

    
    //-------------------------------------------------------
    // Calculates the location frequency histogram
    //-------------------------------------------------------

    // get the location frequency
    var locationFreq = {};
    for (var j = 0; j < jobResults.length; j++) {
        var jobLocation = jobResults[j].locationName;
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
    var upperBoundLocation = 50;
    
    var lLimit = numberOfLocations < upperBoundLocation ? numberOfLocations : upperBoundLocation;
    for (var LocN = 0; LocN < lLimit; LocN++) {
        var jobLoc = jobLocations[LocN];
        jobLocationNameFreq.push({ name: jobLoc[0], value: jobLoc[1] });
    }

    // update the location statistics
    $('#infoStatLocations').html("<b>" + numberOfLocations + "</b>");

    // create the histogram
    var dataset = { name: "Job Posts By Locations", yAxisName: "Number of jobs", data: jobLocationNameFreq };
    locationHistogram.setData(dataset);
}