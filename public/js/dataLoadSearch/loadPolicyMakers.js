/**********************************************
 * Loads the graphs for the Policy Makers page
 */

function LoadInitialData() {
    var url = window.location.href.split("?");
    if (url.length <= 1) {
        LoadBasicData(50);
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

function LoadBasicData(length) {
    $.ajax({
        type: "GET",
        url: "/data/init/top-lists/" + length,
        success: function (values) {
            // skill histogram
            var skills = values.skills;
            skillHistogram.setDataset({
                title:    "Job Posts By Skills",
                subtitle: "Top " + length,
                data:     skills.data
            });
            // location histogram
            var locations = values.locations;
            locationHistogram.setDataset({
                title:    "Job Posts By Locations",
                subtitle: "Top " + length,
                data:     locations.data
            });
            // location histogram
            var countries = values.countries;
            countriesHistogram.setDataset({
                title:    "Job Posts By Countries",
                subtitle: "Top " + length,
                data:     countries.data
            });

            // timestream
            var timeSeries = values.timeSeries.data.map(function (day) {
                return {
                    name: new Date(day.name),
                    value: day.value,
                    skills: day.skillset
                };
            });

            dateLineplot.setDataset({
                nameX: "name",
                nameY: "value",
                data: timeSeries
            });

            // update piechart options
            var piechartData = {
                title:     "Top 10 Skills",
                nameLabel: "name",
                nameValue: "value",
                data:      skills.data.slice(0, 10)
            };
            datePiechart.setDataset(piechartData);

            // add on mouseout function
            dateLineplot.setMouseOutPointCallback(function (d) {
                datePiechart.setOptions({ chartSubtitle: "" });
                datePiechart.setDataset(piechartData);
            });

            // add on mouseover function
            dateLineplot.setMouseOverPointCallback(function (d) {
                data = d.skills.slice(0, 10);

                var date = d.name.toDateString();
                datePiechart.setOptions({ chartSubtitle: date });
                datePiechart.setDataset({
                    nameLabel: "name",
                    nameValue: "value",
                    data:      data
                });
            });

            // set the info-container
            setInfoContainer(skills.data);
        }
    });
}

function setInfoContainer(skills) {
    var text = "";
    // set the description
    text += "<h4>Top 50 Skills:</h4>";
    for (var SkillN = 0; SkillN < skills.length; SkillN++) {
        var skillPair = skills[SkillN];
        text += "<a onclick=\"querySkill(\'" + skillPair.name + "\')\">" + skillPair.name + "</a>" + "(" + skillPair.value + ")";
        if (SkillN != skills.length - 1) { text += ", "; }
    }
    text += "</br>";
    $("#info-container").html(text);
}

function skillUrlToArray(string) {
    var skills = string.replace(/q=/g, "").split("&");
    return skills;
}
