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
    searchOptions("JobSeekers");
}

function queryLocation(locationName) {
    $("#skill-search").tagsinput("removeAll");
    $("#location-search").tagsinput("removeAll");
    
    $("#location-search").tagsinput("add", { name: locationName });
    searchOptions("JobSeekers");
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
    
    var numberOfJobs = jobsAllInfo.length;
    // update the statistics for job posts
    $('#infoStatJobPosts').html("<b>" + numberOfJobs + "</b>");
    
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

    // create an array of skill-name, frequency pairs
    var numberOfSkills = Object.keys(skillsFreq).length;
    
    // update the statistics for job posts
    $('#infoStatSkills').html("<b>" + numberOfSkills + "</b>");
    
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
    var numberOfLocations = Object.keys(locationFreq).length;
    // update the location statistics
    $('#infoStatLocations').html("<b>" + numberOfLocations + "</b>");
  
    
    //-------------------------------------------------------
    // Calculates the location frequency histogram
    //-------------------------------------------------------

    //reload jobs tables
    var jobDataTable = $('#top-jobs').DataTable();
    jobDataTable.destroy();
    
    //-------------------------------------------------------
    // Fill top jobs table
    //-------------------------------------------------------

    var jobTableUpperbound = 100;
    var sLimit = numberOfJobs < jobTableUpperbound ? numberOfJobs : jobTableUpperbound;
    var dataSet = [];
    for (var JobN = 0; JobN < sLimit; JobN++) {
        var jobPost = jobResults[JobN];
        
        var jobTitle = jobPost.jobTitle;
        // remove start <strong> tag
        jobTitle = jobTitle.replace(/<strong>/g, '');
        jobTitle = jobTitle.replace(/&lt;strong&gt;/g, '');
        
        // remove end <strong> tag
        jobTitle = jobTitle.replace(/<\/strong>/g, '');
        jobTitle = jobTitle.replace(/&lt;\/strong&gt;/g, '');

        var jobPostInfo = [];
        jobPostInfo[0] = "<a href=\"" + jobPost.url + "\">" + jobTitle + "</a>";
        var datePosted = jobPost.datePosted.substr(0, 10);
        jobPostInfo[1] = datePosted;
        jobPostInfo[2] = jobPost.hiringOrganization;
        jobPostInfo[3] = jobPost.skillsTxt;
        jobPostInfo[4] = jobPost.locationName;
        jobPostInfo[5] = jobPost.parentName;
        
        dataSet.push(jobPostInfo);
    }
    
    $('#top-jobs').DataTable({
        data: dataSet,
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
}