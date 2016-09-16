


function dataStorage () {
    // contains the initial statistics
    var initStats;

    // contains the queried data
    var queriedData;

    this.setInitStats = function (init) {
        initStats = init;
    };

    this.setQueriedData = function (query) {
        queriedData = query;
    };

    this.getQueriedData = function () {
        return queriedData;
    };



}
