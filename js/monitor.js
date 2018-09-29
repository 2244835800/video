//******************************* 视频实时播放控制使用的JS对象函数 *********************************//
var videoControl = {
    //存储播放状态
    Map: {},
    //存储播放状态
    WinIndexCamerIdMap: {},
    //播放信息
    RCList: new Array(16),
    //当前播放句柄
    WinIndex: null,
    //播放视频的数据信息
    ArrayVideo: new Array(),
    //登录后的句柄
    LoginHandler: null,
    //初始化完成后的句柄
    InitHandler: null,
    //初始化视频
    //param1:视频控件对象
    InintNVs: function (ocxControl) {
        if (!ocxControl) {
            //alert('请下载视频播放控件！');
            return false;
        }

        //初始化dll,返回0表示成功。
        videoControl.InitHandler = ocxControl.EV9000APPInit();//document.EDNNSDEV1.NVSInit();//
        if (videoControl.InitHandler != 0) {
            alert('控件初始化失败!');
            return false;
        }
        return videoControl.InitHandler;
    },
    //登录视频服务器
    //param1:视频服务器IP地址
    //param2:视频服务器端口号
    //param3:用户名
    //param4:密码
    //param5:当前计算机的IP地址（注意计算机必须与视频服务器在一个网段，否则无法查看视频）
    //param6:视频控件对象
    LoginNVs: function (serverIP, serverPort, userID, passWord, CurrentIP, ocxControl) {
        videoControl.LoginHandler = ocxControl.EV9000APPLogin(serverIP, serverPort, CurrentIP, userID, passWord, "", "", 0);
        if (console) {
            console.debug("登录视频服务器结果(登录后的句柄LoginHandler)：" + videoControl.LoginHandler);
        }
        if (videoControl.LoginHandler < 0) {
            alert('视频服务器登录失败!');
            return;
        }
        videoControl.ArrayVideo.push(serverIP + "|" + serverPort + "|" + userID + "|" + passWord);

        //取得当前活动窗口
        videoControl.WinIndex = ocxControl.EV9000APPGetCurWnd();//NVSGetCurWnd();
        if (videoControl.WinIndex < 0) {
            alert('取得当前活动窗口失败!');
            return;
        }

    },
    //开始播放视频
    //param1:监控点的编号
    //param2:监控点描述信息
    //param3:视频播放控件对象
    StartRealPlay: function (soCode, Description, ocxControl, enableTcp,currWnd) {
        //取得当前活动窗口
        if(currWnd==null||currWnd==""){
            videoControl.WinIndex = ocxControl.EV9000APPGetCurWnd();//NVSGetCurWnd();
        }else
            videoControl.WinIndex=currWnd;
        console.log("播放视屏Index：" + videoControl.WinIndex);
        if (videoControl.WinIndex < 0) {
            alert('取得当前活动窗口失败!');
            return;
        }

        if (videoControl.LoginHandler < 0) {
            alert('视频服务器登录失败!');
            return;
        }

        var p;
        //param3:0-UDP,1-TCP
        if(GetMyBrowser()=='Chrome'){
            p = ocxControl.EV9000APPOpenRealPlayEx(videoControl.LoginHandler, videoControl.WinIndex, 1, soCode, 0,true);
        }
        else{
            enableTcp = 1;
            p = ocxControl.EV9000APPOpenRealPlay(videoControl.LoginHandler, videoControl.WinIndex, enableTcp, soCode, 0);
        }
        if (console) {
            console.debug("视频播放结果：" + p);
        }
        if (p != 0) {
            videoControl.RCList[videoControl.WinIndex] = '';
            alert('视频播放失败!');
            return;
        }
        else {
            //保存播放的点位编号至数组
            videoControl.RCList[videoControl.WinIndex] = Description;
            videoControl.Map[videoControl.WinIndex] = 1;
            videoControl.WinIndexCamerIdMap[videoControl.WinIndex] = soCode;
            // alert("当前视屏序号："+videoControl.WinIndex+" 摄像机ID:"+ videoControl.WinIndexCamerIdMap[videoControl.WinIndex]);
        }
    },
    //设置画面个数
    //param1:画面个数
    //param2:视频播放控件
    SetWindowCount: function (count, ocxControl) {
        console.log("count is " + count);
        //取总窗口数
        var wndcount = ocxControl.EV9000APPGetWndCount();//NVSGetWndCount();
        //设置窗口
        var wnd = ocxControl.EV9000APPSetWndCount(count);//NVSSetWndCount(Count);
        //关闭多余的视频
        while (wndcount > count) {
            ocxControl.EV9000APPClosePlay(count);
            count++;
        }

        //清数据
        for (i = wndcount; i < videoControl.RCList.length; i++) {
            videoControl.RCList[i] = "";
        }

        //取得当前活动窗口
        videoControl.WinIndex = ocxControl.EV9000APPGetCurWnd();//NVSGetCurWnd();
        if (videoControl.WinIndex < 0) {
            alert('取得当前活动窗口失败!');
            return;
        }
    },
    //控制云台
    //param1:视频播放控件
    //param2:控制类型（上，下，左，右，左上，左下，右上，右下，停止分别是0，1，2，3，4，5，6，7，-1）
    //param3:速度从0-255
    ControlMachine: function (ocxControl, Type, Data) {
        //取得当前活动窗口
        videoControl.WinIndex = ocxControl.EV9000APPGetCurWnd();//NVSGetCurWnd();
        if (videoControl.WinIndex < 0) {
            alert('取得当前活动窗口失败!');
            return;
        }
        var ct = ocxControl.EV9000APPPTZCtrl(videoControl.WinIndex, Type, Data);
        if (console) {
            console.debug("控制结果(0成功)：" + ct);
        }
    },
    //停止控制
    //param1:视频播放控件
    //param2:控制类型（上-0，下-1，左-2，右-3，左上-4，左下-5，右上-6，右下-7，停止--1分别是0，1，2，3，4，5，6，7，-1）
    //remark:此处的控制命令应该为停止控制而不是将控制速度限制到0
    StopControlMachine: function (ocxControl, Type) {
        //取得当前活动窗口
        videoControl.WinIndex = ocxControl.EV9000APPGetCurWnd();//NVSGetCurWnd();
        if (videoControl.WinIndex < 0) {
            alert('取得当前活动窗口失败!');
            return;
        }
        var ct = ocxControl.EV9000APPPTZCtrl(videoControl.WinIndex, Type, 0);//NVSPTZCtrl(WinIndex,lType,0);
    },
    //光圈、聚焦、缩放
    //param1:视频播放控件
    //param2:缩放+、缩放-、聚焦+、聚焦-、光圈+、光圈-  分别是（8，9，10，11，12，13）
    SetVideoStyle: function (ocxControl, Type) {
        //取得当前活动窗口
        videoControl.WinIndex = ocxControl.EV9000APPGetCurWnd();//NVSGetCurWnd();
        if (videoControl.WinIndex < 0) {
            alert('取得当前活动窗口失败!');
            return;
        }
        var ct = ocxControl.EV9000APPPTZCtrl(videoControl.WinIndex, Type, 1);//NVSPTZCtrl(WinIndex,lType,1);
    },
    //关闭当前播放的视频
    //param1:视频播放控件
    CloseCurrentVideo: function (ocxControl) {
        //取得当前活动窗口
        videoControl.WinIndex = ocxControl.EV9000APPGetCurWnd();//NVSGetCurWnd();
        if (videoControl.WinIndex < 0) {
            alert('取得当前活动窗口失败!');
            return;
        }
        ocxControl.EV9000APPClosePlay(videoControl.WinIndex);//NVSCloseRealPlay(i);
    },
    //关闭所有视频
    //param1:视频播放控件
    CloseAllVideo: function (ocxControl) {
        try {
            //获取窗口总数
            var wndcount = ocxControl.EV9000APPGetWndCount();//NVSGetWndCount();
            for (var i = 0; i < wndcount; i++) {
                ocxControl.EV9000APPClosePlay(i);//NVSCloseRealPlay(i);
            }
        } catch (e) {
            if (console) {
                console.warn(e);
            }
        }

    },
    //登出设备
    //param1:视频控件对象
    LoginOutVideo: function (ocxControl) {
        try {
            if (videoControl.LoginHandler != null && videoControl.LoginHandler > 0) {
                ocxControl.EV9000APPLogout(videoControl.LoginHandler);
            }
            ocxControl.EV9000APPFini();
        } catch (e) {
            if (console) {
                console.warn(e);
            }
        }

    },
    //查找预置位信息
    //param1:设备编号
    //param2:ocx控件对象
    FindDefaultPostion: function (soCode, ocxControl) {
        //取得当前活动窗口
        videoControl.WinIndex = ocxControl.EV9000APPGetCurWnd();//NVSGetCurWnd();
        if (videoControl.WinIndex < 0) {
            alert('取得当前活动窗口失败!');
            return;
        }
        var queryXml = "<?xml version=\"1.0\" encoding=\"GBK\"?><PresetParam><LogicDeviceID>" + soCode + "</LogicDeviceID></PresetParam>";
        debugger;
        var data = ocxControl.EV9000APPFindData(videoControl.LoginHandler, 9, queryXml);
        if (console) {
            console.debug(data);
        }
        var rtnList = new Array();
        if (data) {
            $(data).find("Preset").each(function () {
                var field = $(this);
                var pname = field.attr("PresetName");
                var pnum = field.attr("PresetNum");
                rtnList.push({
                    name: pname, num: pnum
                });
            });
        }
        return rtnList;
    },
    //设置预置为
    //param1:ocx控件对象
    //param2:设置类型:增加预置位15,执行预置位16,删除预置位17,设置预置位为归位点18
    //param3:预置位的编号
    //param4:预置位的名称
    SetPostion: function (ocxControl, typeN, data, pointName) {
        if (videoControl.LoginHandler < 0) {
            alert("请登录视频服务器!");
            return;
        }
        videoControl.WinIndex = ocxControl.EV9000APPGetCurWnd();//NVSGetCurWnd();
        if (videoControl.WinIndex < 0) {
            alert('取得当前活动窗口失败!');
            return;
        }
        var r = ocxControl.EV9000APPPTZCtrlPreset(videoControl.WinIndex, typeN, data, pointName);
        if (console) {
            console.debug("预置位执行结果" + r);
        }
        if (r < 0) {
            return false;
        }
        return true;
    },

    //获取视频参数信息
    //param1:ocx控件对象
    //param2:设备ID号
    GetVideoParamInfo: function (ocxControl, soCode) {
        if (videoControl.LoginHandler < 0) {
            alert("请登录视频服务器!");
            return;
        }
        videoControl.WinIndex = ocxControl.EV9000APPGetCurWnd();//NVSGetCurWnd();
        if (videoControl.WinIndex < 0) {
            alert('取得当前活动窗口失败!');
            return;
        }
        var t = ocxControl.EV9000APPGetParamInfo(videoControl.LoginHandler, 0, soCode, '');
        if (console) {
            console.debug(t);
        }
        var rData = null;
        if (t) {
            $(t).find("Result").each(function () {
                var result = $(this);
                var brightness = result.attr("Brightness");
                var contrast = result.attr("Contrast");
                var ctrlresult = result.attr("CtrlResult");
                var hue = result.attr("Hue");
                var saturation = result.attr("Saturation");
                rData = {
                    Brightness: brightness,
                    Contrast: contrast,
                    CtrlResult: ctrlresult,
                    Hue: hue,
                    Saturation: saturation
                };
            });
        }
        return rData;
    },

    //设置视频参数信息
    //param1:ocx控件对象
    //param2:亮度
    //param3:对比度
    //param4:灰度
    //param5:饱和度
    //param6:设备编号
    SetVideoParamInfo: function (ocxControl, brightness, contrast, hue, saturation, soCode) {
        //取得当前活动窗口
        videoControl.WinIndex = ocxControl.EV9000APPGetCurWnd();//NVSGetCurWnd();
        if (videoControl.WinIndex < 0) {
            alert('取得当前活动窗口失败!');
            return false;
        }

        var setXml = "<?xml version=\"1.0\" encoding=\"GBK\"?><Result><Brightness>" + brightness + "</Brightness><Contrast>" + contrast + "</Contrast><Hue>" + hue + "</Hue><Saturation>" + saturation + "</Saturation></Result>";
        var data = ocxControl.EV9000APPSetParamInfo(videoControl.LoginHandler, 0, soCode, setXml);
        if (console) {
            console.debug(data);
        }
        if (data) {
            return true;
        }
        return false;
    },
    getCapPicture: function (ocxControl, winIndex, path) {
        // videoControl.WinIndex = ocxControl.EV9000APPGetCurWnd();
        // console.log("current wnd is : "+ocxControl.EV9000APPGetCurWnd());
        var capResult = ocxControl.EV9000APPCapPicture(winIndex, path);
        console.log("capResult" + capResult);
        return capResult;
    },
    videoRecord: function (ocxControl, winIndex, path) {
        var capResult = ocxControl.EV9000APPStartRecord(winIndex, path);
        return capResult;
    },
    stopRecord: function (ocxControl, winIndex) {
        var capResult = ocxControl.EV9000APPStopRecord(winIndex);
        return capResult;
    },
    EV9000APPPlayCtrl: function (ocxControl, type, sData) {
        console.log("三个参数：" + ocxControl.EV9000APPGetCurWnd(), type, sData);
        var rs = ocxControl.EV9000APPPlayCtrl(ocxControl.EV9000APPGetCurWnd(), type, sData);
        console.log(rs);
    },
    EV9000APPOpenRealPlay: function () {
        ocxControl.EV9000APPOpenRealPlay(videoControl.LoginHandler);
    }
};

var uiVideoControl = {
    startVideoPlay: function (ocxControl, soCode, userId, passWord, customIp, serverIp, serverPort,currWnd) {
        try {
            videoControl.InintNVs(ocxControl);
            videoControl.LoginNVs(serverIp, serverPort, userId, passWord, customIp, ocxControl);
            if (videoControl.LoginHandler != null && videoControl.LoginHandler < 0) {
                return;
            }
            //开始播放
            videoControl.StartRealPlay(soCode, "", ocxControl, 1,currWnd);
        } catch (e) {
            alert(e.message);
            if (console) console.warn(e);
        }
    },
    stopVideoControl: function (ocxControl) {
        try {
            videoControl.CloseAllVideo(ocxControl);
            videoControl.LoginOutVideo(ocxControl);
        } catch (e) {
            if (console) console.warn(e);
        }

    },
    getVideoParamInfo: function (ocxControl, soCode) {
        videoControl.GetVideoParamInfo(ocxControl, soCode);
    },
    getCapPicture: function (ocxControl, winIndex, path) {
        var rs = videoControl.getCapPicture(ocxControl, winIndex, path);
        if (rs == 0)
            alert("抓图成功，图片路径" + path);
    },
    SetVideoStyle: function (ocxControl, type) {
        videoControl.SetVideoStyle(ocxControl, type);
    },
    ControlMachine: function (ocxControl, type, Data) {
        videoControl.ControlMachine(ocxControl, type, Data);
    },
    videoRecord: function (ocxControl, winIndex, path) {
        var rs = videoControl.videoRecord(ocxControl, winIndex, path);
        if (rs == 0)
            alert("开始录制，视屏路径" + path);
    },
    stopRecord: function (ocxControl, winIndex) {
        var rs = videoControl.stopRecord(ocxControl, winIndex);
        if (rs == 0)
            alert("录制完成");
        else
            alert("录制失败");
    }
};

// function StartVideo(videoControls, cameraId) {
//     if (cameraId == null) {
//         var ocxControl = document.getElementById("videoControl");
//         console.log("bbbbbbbbbbbbbbbbbbbbbb" + videoControls);
//         console.log("bbbbbbbbbbbbbbbbbbbbbb" + videoControls[0].id);
//         console.log("bbbbbbbbbbbbbbbbbbbbbb" + videoControls.length);
//         var userId = $("#iptUserId").val();
//         var passWord = $("#iptPassWord").val();
//         var customIp = $("#iptCustomIp").val();
//         var serverIp = $("#iptServerIP").val();
//         var serverPort = $("#iptServerPort").val();
//         // uiVideoControl.startVideoPlay(ocxControl, camerId, userId, passWord, customIp, serverIp, serverPort);
//         console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" + cameraJosn);
//         console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa2" + cameraJosn);
//         for (var i = 0; i < 4; i++) {
//             uiVideoControl.startVideoPlay(videoControls[i], cameraJosn[i].id, "admin", "admin", "", "192.168.30.114", "5060");
//         }
//     }else{
//         // alert("safsdfaaas"+cameraId);
//         var ocxControl= document.getElementById("videoControl")
//         console.log("ocxControl_____________"+ocxControl+'32010300001320100001');
//         uiVideoControl.startVideoPlay(ocxControl, '32010300001320100001', "admin", "admin", "", "192.168.30.114", "5060");
//     }
//
//
//     // uiVideoControl.startVideoPlay(ocxControl, "32010300001320100001", "admin", "admin", "", "192.168.30.114", "5060");
// }
function StartVideo() {
    var ocxControl = document.getElementById("videoControl");
    var camerId = $("#iptCamerId").val();
    var userId = $("#iptUserId").val();
    var passWord = $("#iptPassWord").val();
    var customIp = $("#iptCustomIp").val();
    var serverIp = $("#iptServerIP").val();
    var serverPort = $("#iptServerPort").val();
    //最后一个参数默认值0 填null或""都可以 即指定窗口号
    uiVideoControl.startVideoPlay(ocxControl, camerId, userId, passWord, customIp, serverIp, serverPort,null);
}

function StopVideo() {
    var ocxControl = document.getElementById("videoControl");
    uiVideoControl.stopVideoControl(ocxControl);
}

function getVideoParamInfo() {
    var ocxControl = document.getElementById("videoControl");
    var soCode = $("#iptCamerId").val();
    uiVideoControl.getVideoParamInfo(ocxControl, soCode);
    // console.log(uiVideoControl.getVideoParamInfo(ocxControl, soCode));
}

function CapPicture() {
    var ocxControl = document.getElementById("videoControl");
    uiVideoControl.getCapPicture(ocxControl, ocxControl.EV9000APPGetCurWnd(), "D:\\cap\\" + getCurrentTimeString() + ".jpg");
}

function SetVideoStyle(type) {
    var ocxControl = document.getElementById("videoControl");
    uiVideoControl.SetVideoStyle(ocxControl, type);
}

function SetWindowCount(count) {
    var ocxControl = document.getElementById("videoControl");
    videoControl.SetWindowCount(count, ocxControl);
}

function mouseDownPTZControl(type) {
    var ocxControl = document.getElementById("videoControl");
    var Data = 100;

    uiVideoControl.ControlMachine(ocxControl, type, Data);
}

function mouseUpPTZControl() {
}

function EV9000APPPlayCtrl(type, sData) {
    // alert(type + " " + sData);
    var ocxControl = document.getElementById("videoControl");
    videoControl.EV9000APPPlayCtrl(ocxControl, type, sData);
}

function getCurrentVideo() {
    var ocxControl = document.getElementById("videoControl");
    var camerId = $("#iptCamerId").val();
    var userId = $("#iptUserId").val();
    var passWord = $("#iptPassWord").val();
    var customIp = $("#iptCustomIp").val();
    var serverIp = $("#iptServerIP").val();
    var serverPort = $("#iptServerPort").val();
    videoControl.InintNVs(ocxControl);
    videoControl.LoginHandler = ocxControl.EV9000APPLogin(serverIp, serverPort, customIp, userId, passWord, "", "", 0);
    videoControl.WinIndex = ocxControl.EV9000APPGetCurWnd();
    ocxControl.EV9000APPOpenRealPlay(videoControl.LoginHandler, videoControl.WinIndex, 1, camerId, 0, false);
}

function GetRtsp() {
    var ocxControl = document.getElementById("videoControl");
    var camerId = $("#iptCamerId").val();
    var userId = $("#iptUserId").val();
    var passWord = $("#iptPassWord").val();
    var customIp = $("#iptCustomIp").val();
    var serverIp = $("#iptServerIP").val();
    var serverPort = $("#iptServerPort").val();
    if(GetMyBrowser()=='Chrome'){
        userId= "WiscomV";
        passWord = "WiscomV";
    }
    uiVideoControl.startVideoPlay(ocxControl, camerId, userId, passWord, customIp, serverIp, serverPort);
}

function getCurrentTimeString() {
    var date = new Date();
    var seperator1 = "-";
    var seperator2 = ":";
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    if (hour >= 0 && hour <= 9) {
        hour = "0" + hour;
    }
    if (minute >= 0 && minute <= 9) {
        minute = "0" + minute;
    }
    if (second >= 0 && second <= 9) {
        second = "0" + second;
    }
    var currentdate = date.getFullYear() + month + strDate + hour + minute + second;
    // currentdate = currentdate + ".jpg";
    console.log(currentdate.toString());
    return currentdate;
}

function getCurrentTimeStringForPlayback() {
    var date = new Date();
    var seperator1 = "-";
    var seperator2 = ":";
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    if (hour >= 0 && hour <= 9) {
        hour = "0" + hour;
    }
    if (minute >= 0 && minute <= 9) {
        minute = "0" + minute;
    }
    if (second >= 0 && second <= 9) {
        second = "0" + second;
    }
    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate + " " + hour + seperator2 + minute + seperator2 + second;
    console.log("getCurrentTimeStringForPlayback rs:" + currentdate.toString());
    return currentdate;
}

function getGroupVideo() {
    $.ajax({
        url: '${pageContext.request.contextPath}/core/commonCallWs/callws',
        type: 'post',
        data: {
            wsName: "LogicDevMapGroup",
            methodName: 'WisGetUserLogicDevMapGroup',
            username: "test1",
            cmsid: "",
            jsonForScreen: "0"
        },
        dataType: 'json',
        success: function (data) {
            var resultObj = jQuery.parseJSON(data.wsResponse);
            // console.log("next is data");
            tree.loadList(resultObj);
            // console.log(data);
        },
        error: function () {
            console.log("请求失败！");
        }
    });
}
//视屏树
// getGroupVideo();

// tree.on("nodeselect", function (e) {
//     if (e.isLeaf) {
//         console.log("is Leaf ss" + e.node.id);
//         StartVideo(e.node.id);
//     } else {
//         console.log("is not Leaf ");
//     }
// });

$("#sel").change(function () {
    var opt = $("#sel").val();
    SetWindowCount(opt);
});
$("#sel2").change(function () {
    var opt = $("#sel2").val();
    EV9000APPPlayCtrl(6, opt);
});

function videoRecord() {
    var ocxControl = document.getElementById("videoControl");
    uiVideoControl.videoRecord(ocxControl, ocxControl.EV9000APPGetCurWnd(), "D:\\cap\\" + getCurrentTimeString() + ".mp4");
}

function stopRecord() {
    var ocxControl = document.getElementById("videoControl");
    uiVideoControl.stopRecord(ocxControl, ocxControl.EV9000APPGetCurWnd());
}

// function getErrorDetail() {
//     var ocxControl = document.getElementById("videoControl");
//     var rs = ocxControl.EV9000APPGetErrorMsg(-234225646);
//     console.log("错误码-234225646" + rs);
// }
//
// getErrorDetail();

function getInputValue(){
    var dateString=$("#timePlayback").val();
    palyback(dateString);
}
function palyback(dateString) {
    var ocxControl = document.getElementById("videoControl");
    var enableTcp = 1;
    // var filelist = findVideo(ocxControl,videoControl.WinIndexCamerIdMap[videoControl.WinIndex],videoControl.LoginHandler);
    videoControl.WinIndex = ocxControl.EV9000APPGetCurWnd();
    // console.log("参数："+videoControl.LoginHandler, videoControl.WinIndex,enableTcp,videoControl.WinIndexCamerIdMap[videoControl.WinIndex] ,new Date(new Date().getTime() - 1 * 60 * 60 * 1000),new Date(),new Date(new Date().getTime() - 1 * 60 * 60 * 1000));
    console.log("参数：" + videoControl.LoginHandler, videoControl.WinIndex, enableTcp, videoControl.WinIndexCamerIdMap[videoControl.WinIndex], "2018-08-24 15:00:00", "2018-08-24 15:10:00", "2018-08-24 15:00:00");

    console.log("类型" + typeof videoControl.LoginHandler + " " + typeof videoControl.WinIndex + " " + typeof enableTcp + " " + typeof videoControl.WinIndexCamerIdMap[videoControl.WinIndex] + " " + typeof "2018-08-24 15:00:00", typeof new Date());
    if (videoControl.LoginHandler == null)
        return false;
    var rs = ocxControl.EV9000APPOpenRecordByTime(videoControl.LoginHandler, videoControl.WinIndex, enableTcp, videoControl.WinIndexCamerIdMap[videoControl.WinIndex], dateString, getCurrentTimeStringForPlayback(), dateString);
    console.log("回放结果" + rs);
    return rs;
}

// function soutdata(){
//     var myDate = new Date();
//     console.log("myDate!!!!!!!!!!!!"+myDate);
//     console.log("前一个小时"+new Date(new Date().getTime() - 1 * 60 * 60 * 1000),new Date())
// }
// soutdata();
/*   var findVideo = function (ocxControl,scode,LoginHandler) {
       //soCode = "32011501001320100310";
       var queryXml = "<?xml version=\"1.0\" encoding=\"GBK\"?><RecordParam><LogicDeviceID>" + scode + "</LogicDeviceID><StartTime>" +"2018-08-24 10:00:00"  + "</StartTime><StopTime>" + "2018-08-24 10:10:00" + "</StopTime><RecordType>" + "1" + "</RecordType></RecordParam>";
       var data = ocxControl().EV9000APPFindData(LoginHandler, 8, queryXml);
       var filelist = new Array();
       if (data) {
           var files = $(data).find('File');
           $.each(files, function (i, v) {
               var fileIndex = i + 1;
               var sTime = $(v).attr('StartTime');
               var eTime = $(v).attr('StopTime');
               //var fileType = getVideoType(parseInt(recordType));//根据查询的视频类型设置文件类型
               var fileType = 1;
               filelist.push({
                   fileIndex: fileIndex,
                   startTime: sTime,
                   endTime: eTime,
                   fileType: fileType
               });

           });
       }
       return filelist;
   };*/
function judgeIsExitEV9000APP() {
    var ocxControl = document.getElementById("videoControl");
    console.log("判断初始化是否错：" + ocxControl.EV9000APPInit());
}

// window.alert = function() {
//     return false;
// }
// alert("fd");
function getBrowserInfo() {
    var ua = navigator.userAgent.toLocaleLowerCase();
    var browserType = null;
    if (ua.match(/msie/) != null || ua.match(/trident/) != null) {
        browserType = "IE";
        browserVersion = ua.match(/msie ([\d.]+)/) != null ? ua.match(/msie ([\d.]+)/)[1] : ua.match(/rv:([\d.]+)/)[1];
    } else if (ua.match(/firefox/) != null) {
        browserType = "火狐";
    } else if (ua.match(/tencenttraveler/) != null || ua.match(/qqbrowse/) != null) {
        browserType = "QQ";
    } else if (ua.match(/maxthon/) != null) {
        browserType = "遨游";
    } else if (ua.match(/chrome/) != null) {
        var is360 = _mime("type", "application/vnd.chromium.remoting-viewer");

        function _mime(option, value) {
            var mimeTypes = navigator.mimeTypes;
            for (var mt in mimeTypes) {
                if (mimeTypes[mt][option] == value) {
                    return true;
                }
            }
            return false;
        }

        if (is360) {
            browserType = '360';
        } else {
            $('html').css("zoom", ".80");
        }
    }
    return browserType;
}

//获取浏览器型号，并判断IE版本
function GetMyBrowser() {
    var userAgent = navigator.userAgent;
    //判断是否Opera浏览器
    var isOpera = userAgent.indexOf("Opera") > -1;
    if (isOpera) {
        return "Opera";
    }
    //判断是否Firefox浏览器
    if (userAgent.indexOf("Firefox") > -1) {
        return "FF";
    }
    //判断是否Chrome浏览器
    if (userAgent.indexOf("Chrome") > -1) {
        return "Chrome";
    }
    //判断是否Safari浏览器
    if (userAgent.indexOf("Safari") > -1) {
        return "Safari";
    }
    //判断是否IE浏览器
    if (!!window.ActiveXObject || "ActiveXObject" in window) {
        //return "IE";
        var trim_Version = navigator.appVersion.split(";")[1].replace(/[ ]/g, "");
        var ievison = "IE";

        if (trim_Version == "MSIE6.0") {
            ievison = "IE6";
        }
        else if (trim_Version == "MSIE7.0") {
            ievison = "IE7";
        }
        else if (trim_Version == "MSIE8.0") {
            ievison = "IE8";
        }
        else if (trim_Version == "MSIE9.0") {
            ievison = "IE9";
        }
        else if (trim_Version == "MSIE10.0") {
            ievison = "IE10";
        }
        else {
            ievison = "IE11";
        }

        return ievison;
    }
    ; //判断是否IE浏览器
}

// window.onload = function () {
//     console.log("GetMyBrowser()" + GetMyBrowser());
//     if (GetMyBrowser() == 'FF') {
//         // $('#videoControl').remove();document.getElementById("videoControl");
//         // $('#videoControl').show();
//         var child1 = document.getElementById("videoControl");
//         var child2 = document.getElementById("videoControl2");
//         var child3 = document.getElementById("videoControl3");
//         var child4 = document.getElementById("videoControl4");
//         child1.parentNode.removeChild(child1);
//         child2.parentNode.removeChild(child2);
//         child3.parentNode.removeChild(child3);
//         child4.parentNode.removeChild(child4);
//         document.getElementById("videoControl").style.display = "block";
//         document.getElementById("videoControl2").style.display = "block";
//         document.getElementById("videoControl3").style.display = "block";
//         document.getElementById("videoControl4").style.display = "block";
//         StartVideo(document.getElementsByName("videoControlFireFoxBrowser"), null);
//     }
//     else {
//         // child.parentNode.removeChild(child);
//         StartVideo(document.getElementsByName("videoControlCommonBrowser"), null);
//     }
//     try {
//         judgeIsExitEV9000APP();//maybe errored
//         // SetWindowCount(4);
//     } catch (e) {
//         if (e.name = 'TypeError' && getBrowserInfo() != null) {
//             $("#exeHref").show();
//             $("#exe1").click();
//             $("#exeHref").hide();
//             if (GetMyBrowser() == 'FF') {
//                 $("#exeForFireFoxHref").show();
//                 $("#exe2").click();
//                 $("#exeForFireFoxHref").hide();
//             }
//         }
//         console.log("是否支持oxc" + e.message.indexOf("对象不支持"));
//         console.log(e.name + ": " + e.message);
//     }
// }
window.onload = function () {
    console.log("GetMyBrowser()" + GetMyBrowser());
    if (GetMyBrowser() == 'FF'||GetMyBrowser()=='Chrome') {
        var child=document.getElementById("videoControl");
        child.parentNode.removeChild(child);
        document.getElementById("videoControl").style.display="block";
        // $('#videoControl').remove();
        // $('#videoControl').show();

    }

    try {
        judgeIsExitEV9000APP();//maybe errored
        // SetWindowCount(4);
        // StartVideo(true,"");
    } catch (e) {
        if (e.name = 'TypeError' && getBrowserInfo() != null) {
            $("#exeHref").show();
            $("#exe1").click();
            $("#exeHref").hide();
            if (GetMyBrowser() == 'FF') {
                $("#exeForFireFoxHref").show();
                $("#exe2").click();
                $("#exeForFireFoxHref").hide();
            }
        }
        console.log("是否支持oxc" + e.message.indexOf("对象不支持"));
        console.log(e.name + ": " + e.message);
    }
}
//回放时间最近七天
function onDrawDate(e) {
    var date = e.date;
    var d = new Date();

    if (date.getTime() < d.getTime() - 7 * 24 * 60 * 60 * 1000 || date.getTime() > d.getTime()) {
        e.allowSelect = false;
    }
}

function onvaluechanged() {
    var t = mini.get("date3");
    var dateString = t.getFormValue();
    // alert(dateString);
    var rs = palyback(dateString);
    if (rs !== 0) {
        alert("请先选中要回放的监控");
        t.setValue("");
    }

}
function playOrStop() {
    var ocxControl = document.getElementById("videoControl");
    var winIndex=ocxControl.EV9000APPGetCurWnd();
    if(videoControl.Map[winIndex] == 0){
        videoControl.Map[winIndex] = 1;
        EV9000APPPlayCtrl(4,0)
    }
    else{
        videoControl.Map[winIndex] = 0;
        EV9000APPPlayCtrl(3,0);
    }
    // alert("当前视屏序号："+winIndex+":"+ videoControl.Map[winIndex]);
}

