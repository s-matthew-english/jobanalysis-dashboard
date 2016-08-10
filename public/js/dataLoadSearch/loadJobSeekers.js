/**********************************************
 * Loads the tables for the Job Seekers page
 */

function LoadInitialData() {
    var url = window.location.href.split("?");
    if (url.length <= 1) {
        LoadBasicData();
    } else {
        var data = skillUrlToArray(url[1]);
        var input = $("#skill-search");
        for (var skillN = 0; skillN < data.length; skillN++) {
            input.tagsinput("add", { name: data[skillN] });
        }
        searchOptions("JobSeekers");
    }
}

function LoadBasicData() {
    $.ajax({
        type: "GET",
        url: "http://pankretas.ijs.si:8044/firstJP",
        dataType: 'jsonp',
        cache: false,
        success: function (json) {

            var sLimit = json.first.length;
            var dataSet = [];
            for (var JobN = 0; JobN < sLimit; JobN++) {
                var jobPost = json.first[JobN].jp;
                var location = json.first[JobN].location.records[0];

                var jobPostInfo = [];
                var jobTitle = jobPost.jobTitle;
                // remove start <strong> tag
                jobTitle = jobTitle.replace(/<strong>/g, '');
                jobTitle = jobTitle.replace(/&lt;strong&gt;/g, '');

                // remove end <strong> tag
                jobTitle = jobTitle.replace(/<\/strong>/g, '');
                jobTitle = jobTitle.replace(/&lt;\/strong&gt;/g, '');

                jobPostInfo[0] = jobTitle;
                jobPostInfo[1] = jobPost.datePosted.substr(0, 10);;
                jobPostInfo[2] = jobPost.hiringOrganization;
                jobPostInfo[3] = jobPost.skillsTxt === null ? "" : jobPost.skillsTxt;
                jobPostInfo[4] = location.locName ? location.locName : "";
                jobPostInfo[5] = location.parentCountryName ? location.parentCountryName : "";

                dataSet.push(jobPostInfo);
            }
            function sortByDate(job1, job2) {
                var date1 = new Date(job1[1]);
                var date2 = new Date(job2[1]);
                var miliseconds1 = date1.getTime();
                var miliseconds2 = date2.getTime();
                if (miliseconds1 > miliseconds2) return 1;
                else if (miliseconds1 < miliseconds2) return -1;
                else return 0;
            }
            dataSet.sort(sortByDate);

            for (var JobDescN = 0; JobDescN < dataSet.length; JobDescN++) {
                var datePosted   = dataSet[JobDescN][1].substr(0, 10);
                dataSet[JobDescN][1] = datePosted;
            }

            var jobDataTable = $('#top-jobs').DataTable();
            jobDataTable.destroy();
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
        }
    });

    //load suggested materials
    $.ajax({
        type: "GET",
        url: "http://pankretas.ijs.si:8042/search_lectures_by_keyword?q=data%20science",
        dataType: 'jsonp',
        cache: false,
        success: function (json) {
            fillSuggestedTable(json);
        }
    });

    $.ajax({
        type: "GET",
        url: "http://pankretas.ijs.si:8040/get_number_of_jobs_by_skill",
        dataType: 'jsonp',
        cache: false,
        success: function (json) {
            var jpSkills = json.get_number_of_jobs_by_skill;
            var jobSkillName = [];
            var jobSkillFreq = [];

            var numberOfSkills = jpSkills;
            var upperBoundSkills = 50;
            var sLimit = numberOfSkills < sLimit ? numberOfSkills : upperBoundSkills;
            for (var SklN = 0; SklN < sLimit; SklN++) {
                var jpSkill = jpSkills[SklN];
                jobSkillName.push(jpSkill[0]);
                jobSkillFreq.push(jpSkill[1]);
            }
            // set the info-container
            setInfoContainer(jobSkillName, jobSkillFreq);
        }
    });


    function fillSuggestedTable(json) {
        var un_json = JSON.parse(unescape(json.lec_result));
        var sLimit = 100;
        if (un_json.length < sLimit)
            sLimit = un_json.length;

        var dataSet = [];
        for (var s = 0; s < sLimit; s++) {
            var lecture = un_json[s];

            var lecinfo = [];
            lecinfo[0] = lecture.lectureTitle;
            lecinfo[1] = lecture.lectureDesc;
            lecinfo[2] = "<a href=\"http://videolectures.net/" + lecture.url + "\">" + lecture.url + "</a>";
            var datePosted = lecture.recorded.substr(0, 10);
            lecinfo[3] = datePosted;

            dataSet[s] = lecinfo;
        }

        var suggestedMaterialsTable = $('#suggested-materials').DataTable();
        suggestedMaterialsTable.destroy();

        var oTable = $('#suggested-materials').DataTable({
            data: dataSet,
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
}

function setInfoContainer(jobSkillName, jobSkillFreq) {
    var text = "";
    // set the description
    text += "<h4>Top 50 skills:</h4>";
    for (var SkillN = 0; SkillN < jobSkillName.length; SkillN++) {
        text += "<a onclick=\"querySkill(\'" + jobSkillName[SkillN] + "\')\">" + jobSkillName[SkillN] + "</a>" + "(" + jobSkillFreq[SkillN] + ")";
        if (SkillN != jobSkillName.length - 1) { text += ", "; }
    }
    text += "</br>";
    $("#info-container").html(text);
}

function skillUrlToArray(string) {
    var skills = string.replace(/q=/g, "").split("&");
    return skills;
}
