/**
 * Created by heimei on 2018/10/19.
 */
var lzyStatistics = (function () {
    var self = function (config) {

    };
    var statList = {};
    var countScene = function (scene, sub_scene) {
        var key = scene+sub_scene;
        if (typeof statList[scene] == 'undefined') {
            statList[key] = 0;
        }
        statList[key] += 1;
        return statList[key];
    };
    var request = function (wxid, scene, sub_scene) {
        var solwxid = typeof(olwxid) == "undefined" ? "" : olwxid;
        var url = '/kphoto/statistics.php?scene='+scene+'&wxid='+wxid+'&sub_scene='+sub_scene + '&olwxid='+solwxid;
        XMLHttp.sendReq('get', url, '', function(obj){});
    };
    var requestcallback = function (wxid, scene, sub_scene,cb) {
        var solwxid = typeof(olwxid) == "undefined" ? "" : olwxid;
        var url = '/kphoto/statistics.php?scene='+scene+'&wxid='+wxid+'&sub_scene='+sub_scene + '&olwxid='+solwxid;
        XMLHttp.sendReq('get', url, '', cb);
    };
    self.prototype.once = function (wxid, scene, sub_scene) {
        times = countScene(scene, sub_scene);
        if (times > 1) {
            return;
        }
        request(wxid, scene, sub_scene);
    };
    self.prototype.call = function (wxid, scene, sub_scene) {
        times = countScene(scene, sub_scene);
        request(wxid, scene, sub_scene);
    };
    self.prototype.callback = function (wxid, scene, sub_scene,cb) {
        times = countScene(scene, sub_scene);
        requestcallback(wxid, scene, sub_scene,cb);
    };
    return self;
})();