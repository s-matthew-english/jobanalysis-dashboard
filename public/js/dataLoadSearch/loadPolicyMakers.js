/**********************************************
 * Loads the graphs for the Policy Makers page
 */ 

function LoadInitialData() {
    var url = window.location.href.split("?");
    if (url.length <= 1) {
        LoadBasicData();
    } else {
        var data = skillUrlToArray(url[1]);
        var input = $("#skill-search");
        for (var skillN = 0; skillN < data.length; skillN++) {
            input.tagsinput("add", {
                name: data[skillN]
            });
        }
        searchOptions("PolicyMakers");
    }
}

function LoadBasicData() {
    $.ajax({
        type: "GET",
        url: "http://pankretas.ijs.si:8040/get_number_of_jobs_by_dates",
        dataType: 'jsonp',
        cache: false,
        success: function (json) {
            
            var DateArray = json.get_number_of_jobs_by_dates;
            var jobDateNameFreq = [];
            
            var numberOfDates = DateArray.length;
            for (var DateN = 1; DateN < numberOfDates; DateN++) {
                var jobDate = DateArray[DateN];
                jobDateNameFreq.push({
                    time:     new Date(jobDate[0]), 
                    jobCount: jobDate[1]
                });
            }
            
            // create the histogram
            var dataset = {
                title: "Job Posts By Dates", 
                nameX: "time", 
                nameY: "jobCount", 
                data:  jobDateNameFreq
            };
            dateLineplot.setDataset(dataset);
        }
    });
    
    $.ajax({
        type: "GET",
        url: "http://pankretas.ijs.si:8040/get_number_of_jobs_by_location_name",
        dataType: 'jsonp',
        cache: false,
        success: function (json) {
            var LocationArray = json.get_number_of_jobs_by_location_name;
            var jobLocationNameFreq = [];
            
            function RemoveCountries(array) {
                var countries = ['Andorra', 'Austria', 'Belgium', 'Bulgaria', 'Cyprus', 'Czech Republic', 'Switzerland', 'Denmark', 'Germany', 'Spain',
                    'Estonia', 'Finland', 'France', 'United Kingdom', 'Greece', 'Hungary', 'Croatia', 'Ireland', 'Italy', 'Lithuania', 'Luxembourg',
                    'Latvia', 'Malta', 'Netherlands', 'Poland', 'Portugal', 'Romania', 'San Marino', 'Ukraine', 'Slovakia', 'Slovenia', 'Czechia'];
                var countrieless = array.filter(function (job) { return countries.indexOf(job[0]) == -1; });
                return countrieless;
            }
            var countrilessLocations = RemoveCountries(LocationArray);

            var numberOfLocations = countrilessLocations.length;
            var upperBoundLocation = 40;
            var sLimit = numberOfLocations < upperBoundLocation ? numberOfLocations : upperBoundLocation;
            for (var LocN = 0; LocN < sLimit; LocN++) {
                var jobLoc = countrilessLocations[LocN];
                jobLocationNameFreq.push({
                    name:  jobLoc[0], 
                    value: jobLoc[1]
                });
            }
            
            // create the histogram
            var dataset = {
                title:    "Job Posts By Locations", 
                subtitle: "Top 40", 
                data:     jobLocationNameFreq
            };
            locationHistogram.setData(dataset);
        }
    });
    
    $.ajax({
        type: "GET",
        url: "http://pankretas.ijs.si:8044/get_jobs_by_countries",
        dataType: 'jsonp',
        cache: false,
        success: function (json) {
            var jobCountriesNameFreq = [];
            
            function SelectCountries(array) {
                var countries = ['Andorra', 'Austria', 'Belgium', 'Bulgaria', 'Cyprus', 'Czech Republic', 'Switzerland', 'Denmark', 'Germany', 'Spain',
                    'Estonia', 'Finland', 'France', 'United Kingdom', 'Greece', 'Hungary', 'Croatia', 'Ireland', 'Italy', 'Lithuania', 'Luxembourg',
                    'Latvia', 'Malta', 'Netherlands', 'Poland', 'Portugal', 'Romania', 'San Marino', 'Ukraine', 'Slovakia', 'Slovenia', 'Czechia'];
                var selected = array.filter(function (job) { return countries.indexOf(job.country) != -1; });
                return selected;
            }
            var Countries = SelectCountries(json.jp_result);
            
            var numberOfCountries = Countries.length;
            var upperBoundLocation = 40;
            var sLimit = numberOfCountries < upperBoundLocation ? numberOfCountries : upperBoundLocation;
            for (var CountN = 0; CountN < sLimit; CountN++) {
                var jobCount = Countries[CountN];
                jobCountriesNameFreq.push({
                    name:  jobCount.country, 
                    value: jobCount.count
                });
            }
            
            jobCountriesNameFreq.sort(function (a, b) { return a.value < b.value ? 1 : a.value > b.value ? -1 : 0 });
            // create the histogram
            var dataset = {
                title:    "Job Posts By Countries", 
                subtitle: "EU Countries", 
                data:     jobCountriesNameFreq
            };
            countriesHistogram.setData(dataset);
        }
    });

    $.ajax({
        type: "GET",
        url: "http://pankretas.ijs.si:8040/get_number_of_jobs_by_skill",
        dataType: 'jsonp',
        cache: false,
        success: function (json) {
            var jpSkills = json.get_number_of_jobs_by_skill;
            var jobSkillNameFreq = [];
            
            var numberOfSkills = jpSkills;
            var upperBoundSkills = 50;
            var sLimit = numberOfSkills < sLimit ? numberOfSkills : upperBoundSkills;
            for (var SklN = 0; SklN < sLimit; SklN++) {
                var JFPair = jpSkills[SklN];
                jobSkillNameFreq.push({
                    name:  JFPair[0], 
                    value: JFPair[1]
                });
            }

            // create the histogram
            var dataset = {
                title:    "Job Posts By Skills", 
                subtitle: "Top 50", 
                data:     jobSkillNameFreq
            };
            skillHistogram.setData(dataset);
            
            // update piechart options
            datePiechart.setDataset({
                title:     "Top 10 Skills", 
                nameLabel: "name", 
                nameValue: "value", 
                data:      jobSkillNameFreq.slice(0, 10)
            });
            
            dateLineplot.setMouseOutPointCallback(function (d) {
                var data = jobSkillNameFreq.slice(0, 10);
                datePiechart.setDataset({
                    title:     "Top 10 Skills", 
                    nameLabel: "name", 
                    nameValue: "value", 
                    data:      data
                });
            })

            // set the info-container
            setInfoContainer(jobSkillNameFreq);
        }
    });
}
function setInfoContainer(jobSkillNameFreq) {
    var text = "";
    // set the description
    text += "<h4>Top 50 skills:</h4><div style='text-align:justify;'>";
    for (var SkillN = 0; SkillN < jobSkillNameFreq.length; SkillN++) {
        var skillFreq = jobSkillNameFreq[SkillN];
        text += "<a onclick=\"querySkill(\'" + skillFreq.name + "\')\">" + skillFreq.name + "</a>" + " (" + skillFreq.value + ")"
        if (SkillN != jobSkillNameFreq.length - 1) { text += ", " };
    }
    text += "</div></br>";
    $("#info-container").html(text);
}

function skillUrlToArray(string) {
    var skills = string.replace(/q=/g, "").split("&");
    return skills;
}